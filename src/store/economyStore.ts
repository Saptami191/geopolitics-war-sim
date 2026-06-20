import { create } from 'zustand';
import { produce } from 'immer';
import {
  ArmsDeal,
  CommodityType,
  Econ_NationProfile,
  Econ_Sector,
  SanctionsGameplayState,
  SanctionTier,
  ActiveSanctionRecord,
  SanctionCoalitionMember,
  SanctionEvasionRoute,
  SanctionFatigueDriver,
  SanctionsGameplayStatus,
  CounterSanctionRecord,
  SanctionImpactAssessment,
  SanctionFatigueState
} from '../types';
import { useWorldStore } from './worldStore';
import { usePlayerStore } from './playerStore';
import { useMirrorStore } from './mirrorStore';
import { useConsequenceStore } from './consequenceStore';

import { computeAffectedSectors, escalateSanctionTier, canEscalateSanction } from '../sim/sanctionTierRules';
import { processSanctionsTick } from '../sim/sanctionTickProcessor';

interface LedgerEntry {
  id: string;
  tick: number;
  type: 'BUY' | 'SELL' | 'SHORT' | 'COVER' | 'EMBARGO' | 'TARIFF';
  details: string;
  financialImpactB: number;
}

interface EconomyState {
  portfolioFutures: { [key in CommodityType]?: number }; // holds in billions worth
  portfolioShorts: { [key in CommodityType]?: number };  // short holdings
  tradeLedger: LedgerEntry[];
  activeSanctions: { source: string; target: string }[];
  econ_nations: Record<string, Econ_NationProfile>;
  sanctionsGameplay: SanctionsGameplayState;
}

interface EconomyStoreActions {
  buyFutures: (commodity: CommodityType, amountB: number, costPerUnit: number) => boolean;
  shortCommodity: (commodity: CommodityType, amountB: number, costPerUnit: number) => boolean;
  addArmsDeal: (deal: ArmsDeal) => void;
  imposeSanction: (sourceId: string, targetId: string) => void;
  imposeSanctionTiered: (
    sourceId: string,
    targetId: string,
    tier: SanctionTier,
    coalitionMemberIds: string[],
    sectorOverride?: Econ_Sector,
    secondarySanctionTargets?: string[]
  ) => void;
  escalateSanctionTier: (sanctionId: string) => boolean;
  addCoalitionMember: (sanctionId: string, nationId: string) => void;
  activateSecondarySanctions: (sanctionId: string, targetNationIds: string[]) => void;
  liftSanction: (sanctionId: string) => void;
  removeSanction: (sourceId: string, targetId: string) => void;
  addLedgerEntry: (entry: Omit<LedgerEntry, 'id' | 'tick'>) => void;
  resetEconomy: () => void;
  econ_initializeNationProfile: (nationId: string, baselineGdp: number) => void;
  econ_processEconomyTick: (currentTick: number) => void;
}

export const useEconomyStore = create<EconomyState & EconomyStoreActions>((set, get) => ({
  portfolioFutures: {},
  portfolioShorts: {},
  tradeLedger: [],
  activeSanctions: [],
  econ_nations: {},
  sanctionsGameplay: {
    activeSanctionRecords: [],
    evasionStates: {},
    fatigueStates: {},
    counterSanctionRecords: [],
    coalitionMembers: {},
    impactAssessments: {},
    sanctionEventLog: []
  },

  buyFutures: (commodity, amountB, costPerUnit) => {
    const playerCash = usePlayerStore.getState().cashB;
    if (playerCash < amountB) return false;

    // Deduct cash from player store
    usePlayerStore.setState((state) => ({ cashB: state.cashB - amountB }));
    usePlayerStore.getState().syncCashToCountry();

    set(produce((draft: EconomyState) => {
      draft.portfolioFutures[commodity] = (draft.portfolioFutures[commodity] || 0) + (amountB / costPerUnit);
      draft.tradeLedger.unshift({
        id: Math.random().toString(),
        tick: useWorldStore.getState().currentTick,
        type: 'BUY',
        details: `Purchased $${amountB}B futures in ${commodity} at spot rate of $${costPerUnit.toFixed(2)}`,
        financialImpactB: -amountB,
      });
    }));

    useWorldStore.getState().addGlobalEvent(`Financial desk: Institutional client locks $${amountB}B futures in ${commodity} index.`, 'INFO');
    return true;
  },

  shortCommodity: (commodity, amountB, costPerUnit) => {
    const playerCash = usePlayerStore.getState().cashB;
    if (playerCash < amountB) return false;

    usePlayerStore.setState((state) => ({ cashB: state.cashB - amountB }));
    usePlayerStore.getState().syncCashToCountry();

    set(produce((draft: EconomyState) => {
      draft.portfolioShorts[commodity] = (draft.portfolioShorts[commodity] || 0) + (amountB / costPerUnit);
      draft.tradeLedger.unshift({
        id: Math.random().toString(),
        tick: useWorldStore.getState().currentTick,
        type: 'SHORT',
        details: `Shorted $${amountB}B in ${commodity} at spot rate of $${costPerUnit.toFixed(2)}`,
        financialImpactB: -amountB,
      });
    }));

    useWorldStore.getState().addGlobalEvent(`Financial desk: Short positions opened on ${commodity} index totaling $${amountB}B.`, 'INFO');
    return true;
  },

  addArmsDeal: (deal) => {
    useWorldStore.getState().applyTickDelta((draft) => {
      draft.activeArmsDeals.push(deal);
    });
  },

  imposeSanction: (sourceId, targetId) => {
    // Backwards compatibility layer: Map old binary calls to Tier-3 sectoral energy sanctions
    get().imposeSanctionTiered(sourceId, targetId, 'TIER_3_SECTORAL', [], 'ENERGY', []);
  },

  imposeSanctionTiered: (sourceId, targetId, tier, coalitionMemberIds, sectorOverride, secondarySanctionTargets) => {
    const currentTick = useWorldStore.getState().currentTick;
    set(produce((draft: EconomyState) => {
      const regimeId = `regime_${sourceId}_${targetId}_${currentTick}`;
      const exists = draft.sanctionsGameplay.activeSanctionRecords.some(
        r => r.sourceId === sourceId && r.targetId === targetId && (r.status === 'ACTIVE' || r.status === 'ERODING')
      );
      if (exists) return;

      const targetProfile = draft.econ_nations[targetId] || { currentSectorHealth: {} } as any;
      const affectedSectors = computeAffectedSectors(tier, targetProfile, sectorOverride);

      const record: ActiveSanctionRecord = {
        id: regimeId,
        sourceId,
        targetId,
        tier,
        status: 'ACTIVE',
        imposedTick: currentTick,
        lastEscalatedTick: currentTick,
        affectedSectors,
        coalitionMemberIds,
        coalitionCohesionScore: coalitionMemberIds.length > 0 ? Math.min(90, (coalitionMemberIds.length + 1) * 15) : 100,
        evasionRoutes: [],
        evasionEffectivenessScore: 0,
        currentDamagePct: 0,
        theoreticalDamagePct: 0,
        sanctionerFatigueScore: 0,
        fatigueDrivers: [],
        counterSanctionActive: false,
        counterSanctionSectors: [],
        blowbackEventsLog: [],
        secondarySanctionActive: !!secondarySanctionTargets && secondarySanctionTargets.length > 0,
        secondarySanctionTargets: secondarySanctionTargets || [],
        lifetimeTicks: 0
      };

      draft.sanctionsGameplay.activeSanctionRecords.push(record);

      const flatExists = draft.activeSanctions.some(s => s.source === sourceId && s.target === targetId);
      if (!flatExists) {
        draft.activeSanctions.push({ source: sourceId, target: targetId });
      }

      if (!draft.sanctionsGameplay.evasionStates[targetId]) {
        draft.sanctionsGameplay.evasionStates[targetId] = {
          targetId,
          activeRoutes: [],
          routeEffectiveness: {
            THIRD_PARTY_RELAY: 0,
            SHADOW_FLEET: 0,
            CRYPTO_SETTLEMENT: 0,
            BARTER_ARRANGEMENT: 0,
            SHELL_COMPANY_NETWORK: 0,
            DOMESTIC_SUBSTITUTION: 0
          },
          totalEvasionNeutralizedPct: 0,
          evasionBuildupTick: 0,
          thirdPartyRelayNations: [],
          adaptationVelocity: 0
        };
      }

      const fatigueKey = `${sourceId}_${targetId}`;
      if (!draft.sanctionsGameplay.fatigueStates[fatigueKey]) {
        draft.sanctionsGameplay.fatigueStates[fatigueKey] = {
          sanctionerNationId: sourceId,
          targetNationId: targetId,
          fatigueScore: 0,
          activeDrivers: [],
          domesticEconomicPainScore: 0,
          politicalPressureScore: 0,
          alliedDefectionCount: 0,
          ticksWithNoProgress: 0,
          breakpointReached: false
        };
      }

      const transformedAllies = coalitionMemberIds.map(memberId => ({
        nationId: memberId,
        joinedTick: currentTick,
        commitmentScore: 85,
        defectionRisk: 0,
        lastContributionTick: currentTick
      }));
      draft.sanctionsGameplay.coalitionMembers[regimeId] = transformedAllies;
    }));

    useWorldStore.getState().updateCountry(targetId, (c) => {
      if (!c.economic.sanctionedBy.includes(sourceId)) {
        c.economic.sanctionedBy.push(sourceId);
      }
    });

    useWorldStore.getState().registerConsequenceChain('IMPOSE_SANCTIONS', { sourceCountryId: sourceId, targetCountryId: targetId });

    if (sourceId === usePlayerStore.getState().countryId) {
      let intensity = 15;
      if (tier === 'TIER_1_DIPLOMATIC_WARNING') intensity = 3;
      else if (tier === 'TIER_2_TARGETED_INDIVIDUAL') intensity = 8;
      else if (tier === 'TIER_3_SECTORAL') intensity = 15;
      else if (tier === 'TIER_4_COMPREHENSIVE') intensity = 25;
      else if (tier === 'TIER_5_TOTAL_ISOLATION') intensity = 40;

      useMirrorStore.getState().recordPlayerAction('SANCTIONS', intensity, currentTick);
    }

    useWorldStore.getState().addGlobalEvent(`Sanctions: ${sourceId} imposes ${tier.replace(/_/g, ' ')} on ${targetId}.`, 'WARNING');
  },

  escalateSanctionTier: (sanctionId) => {
    let success = false;
    const currentTick = useWorldStore.getState().currentTick;
    set(produce((draft: EconomyState) => {
      const record = draft.sanctionsGameplay.activeSanctionRecords.find(r => r.id === sanctionId);
      if (!record) return;

      const targetProfile = draft.econ_nations[record.targetId];
      if (!targetProfile) return;

      const { canEscalate, reason } = canEscalateSanction(record, targetProfile);
      if (!canEscalate) {
        useWorldStore.getState().addGlobalEvent(`Escalation Blocked: ${reason}`, 'INFO');
        return;
      }

      const nextTier = escalateSanctionTier(record.tier);
      const prevTier = record.tier;
      record.tier = nextTier;
      record.affectedSectors = computeAffectedSectors(nextTier, targetProfile);
      record.lastEscalatedTick = currentTick;
      success = true;

      const msg = `[ESCALATION] ${record.sourceId} escalated the sanction regime against ${record.targetId} from ${prevTier.replace(/_/g, ' ')} to ${nextTier.replace(/_/g, ' ')}.`;
      draft.sanctionsGameplay.sanctionEventLog.push(msg);
    }));

    if (success) {
      useWorldStore.getState().addGlobalEvent(`Sanctions: Consensus reached to escalate sanctions against target.`, 'WARNING');
      const activeRec = get().sanctionsGameplay.activeSanctionRecords.find(r => r.id === sanctionId);
      if (activeRec && activeRec.sourceId === usePlayerStore.getState().countryId) {
        useMirrorStore.getState().recordPlayerAction('SANCTIONS', 10, currentTick);
      }
    }
    return success;
  },

  addCoalitionMember: (sanctionId, nationId) => {
    const currentTick = useWorldStore.getState().currentTick;
    set(produce((draft: EconomyState) => {
      const record = draft.sanctionsGameplay.activeSanctionRecords.find(r => r.id === sanctionId);
      if (!record) return;

      if (!record.coalitionMemberIds.includes(nationId)) {
        record.coalitionMemberIds.push(nationId);
        record.coalitionCohesionScore = Math.min(95, Math.max(40, record.coalitionCohesionScore + 10));

        const memberRec: SanctionCoalitionMember = {
          nationId,
          joinedTick: currentTick,
          commitmentScore: 80,
          defectionRisk: 0,
          lastContributionTick: currentTick
        };

        if (!draft.sanctionsGameplay.coalitionMembers[sanctionId]) {
          draft.sanctionsGameplay.coalitionMembers[sanctionId] = [];
        }
        draft.sanctionsGameplay.coalitionMembers[sanctionId].push(memberRec);

        const msg = `[COALITION GROW] ${nationId} formally joined the multilateral sanctions regime against ${record.targetId}, demonstrating growing diplomatic alignment.`;
        draft.sanctionsGameplay.sanctionEventLog.push(msg);
      }
    }));
  },

  activateSecondarySanctions: (sanctionId, targetNationIds) => {
    set(produce((draft: EconomyState) => {
      const record = draft.sanctionsGameplay.activeSanctionRecords.find(r => r.id === sanctionId);
      if (!record) return;

      record.secondarySanctionActive = true;
      record.secondarySanctionTargets = targetNationIds;

      const msg = `[SECONDARY STRIKE] ${record.sourceId} activated secondary sanctions, threatening severe commercial lockouts for any states (${targetNationIds.join(', ')}) assisting ${record.targetId} evasion corridors.`;
      draft.sanctionsGameplay.sanctionEventLog.push(msg);
    }));
    useWorldStore.getState().addGlobalEvent(`Secondary Sanctions: Imposed pressure parameters on neutral states.`, 'WARNING');
  },

  liftSanction: (sanctionId) => {
    let details: { sourceId: string; targetId: string } | null = null;
    set(produce((draft: EconomyState) => {
      const record = draft.sanctionsGameplay.activeSanctionRecords.find(r => r.id === sanctionId);
      if (!record) return;

      record.status = 'LIFTED';
      details = { sourceId: record.sourceId, targetId: record.targetId };

      draft.activeSanctions = draft.activeSanctions.filter(
        s => !(s.source === record.sourceId && s.target === record.targetId)
      );

      const msg = `[SANCTION DISMANTLED] ${record.sourceId} has formally lifted economic sanctions on ${record.targetId}, signaling diplomatic reconciliation.`;
      draft.sanctionsGameplay.sanctionEventLog.push(msg);
    }));

    if (details) {
      const d = details as { sourceId: string; targetId: string };
      useWorldStore.getState().updateCountry(d.targetId, (c) => {
        c.economic.sanctionedBy = c.economic.sanctionedBy.filter(id => id !== d.sourceId);
      });
      useWorldStore.getState().addGlobalEvent(`Sanctions: Eased economic restrictions on ${d.targetId}. Commercial channels reopening.`, 'INFO');
    }
  },

  removeSanction: (sourceId, targetId) => {
    // Find record representing this pair and delegate to liftSanction
    const targetRecord = get().sanctionsGameplay.activeSanctionRecords.find(
      r => r.sourceId === sourceId && r.targetId === targetId && (r.status === 'ACTIVE' || r.status === 'ERODING' || r.status === 'FATIGUED')
    );
    if (targetRecord) {
      get().liftSanction(targetRecord.id);
    } else {
      // Fallback if no matching record exists in Part 2 structures
      set(produce((draft: EconomyState) => {
        draft.activeSanctions = draft.activeSanctions.filter((s) => !(s.source === sourceId && s.target === targetId));
      }));
      useWorldStore.getState().updateCountry(targetId, (c) => {
        c.economic.sanctionedBy = c.economic.sanctionedBy.filter((id) => id !== sourceId);
      });
      useWorldStore.getState().addGlobalEvent(`Diplomacy: ${sourceId} eases sanctions against ${targetId}. Rebuilding commercial pipelines.`, 'INFO');
    }
  },

  addLedgerEntry: (entry) => set(produce((draft: EconomyState) => {
    draft.tradeLedger.unshift({
      id: Math.random().toString(),
      tick: useWorldStore.getState().currentTick,
      ...entry,
    });
  })),

  resetEconomy: () => set({
    portfolioFutures: {},
    portfolioShorts: {},
    tradeLedger: [],
    activeSanctions: [],
    econ_nations: {},
    sanctionsGameplay: {
      activeSanctionRecords: [],
      evasionStates: {},
      fatigueStates: {},
      counterSanctionRecords: [],
      coalitionMembers: {},
      impactAssessments: {},
      sanctionEventLog: []
    }
  }),

  econ_initializeNationProfile: (nationId, baselineGdp) => set(produce((draft: EconomyState) => {
    if (!draft.econ_nations[nationId]) {
      draft.econ_nations[nationId] = {
        nationId,
        gdpEstimateUSD: baselineGdp,
        gdpBaselineUSD: baselineGdp,
        gdpChangePercent: 0,
        currencyReserveUSD: baselineGdp * 0.15,
        reserveDepletionRatePerTick: 0,
        inflationRate: 2.0,
        energyExportRevenueUSD: 0,
        defenceIndustrialOutput: 100,
        technologyAccessScore: 100,
        foodSecurityScore: 100,
        sanctionResistanceScore: 50,
        adaptationRate: 0,
        currentSectorHealth: {
          ENERGY: 100,
          DEFENCE_INDUSTRIAL: 100,
          FINANCIAL_SERVICES: 100,
          TECHNOLOGY: 100,
          AGRICULTURE: 100,
          MANUFACTURING: 100,
          TRANSPORT_LOGISTICS: 100,
          RARE_EARTH_MINING: 100,
          TELECOMS: 100,
          PHARMACEUTICALS: 100,
        },
        sanctionedBy: [],
        evadingVia: [],
        lastUpdatedTick: useWorldStore.getState().currentTick
      };
    }
  })),

  econ_processEconomyTick: (currentTick) => set(produce((draft: EconomyState) => {
    // 1. Existing passive recovery loop
    Object.keys(draft.econ_nations).forEach(nationId => {
      const nation = draft.econ_nations[nationId];
      if (!nation) return;

      Object.keys(nation.currentSectorHealth).forEach(sector => {
        const s = sector as Econ_Sector;
        if (nation.currentSectorHealth[s] < 100) {
          nation.currentSectorHealth[s] = Math.min(100, nation.currentSectorHealth[s] + (0.5 * (1 + nation.adaptationRate / 100)));
        }
      });
    });

    // 2. Call new state and gameplay engine
    const results = processSanctionsTick(draft.sanctionsGameplay, draft.econ_nations, currentTick);

    // Apply populationUnrestDeltas to worldStore
    Object.keys(results.unrestDeltas).forEach(targetId => {
      const delta = results.unrestDeltas[targetId];
      useWorldStore.getState().updateCountry(targetId, c => {
        c.political.popularUnrest = Math.min(100, Math.max(0, c.political.popularUnrest + delta));
      });
    });

    // Apply stability changes reflecting global reputation
    Object.keys(results.stabilityDeltas).forEach(sourceId => {
      const delta = results.stabilityDeltas[sourceId];
      useWorldStore.getState().updateCountry(sourceId, c => {
        c.political.stabilityIndex = Math.min(100, Math.max(0, c.political.stabilityIndex + (delta * 0.1)));
      });
    });

    // Feed global simulation wire events
    results.globalEvents.forEach(event => {
      useWorldStore.getState().addGlobalEvent(event.text, event.severity);
    });

    // Trigger consequences/blowbacks
    results.globalEvents.forEach(event => {
      if (event.text.includes('[COALITION COLLAPSE]')) {
        useConsequenceStore.getState().triggerBlowback('ALL', 65, 'SANCTIONS_FATIGUE_COLLAPSE');
      } else if (event.text.includes('[REPRISAL TRIGGER]')) {
        useConsequenceStore.getState().triggerBlowback('ALL', 40, 'COUNTER_SANCTIONS_ACTIVATED');
      }
    });

    // 3. Existing GDP, Inflation, Food security and Reserves processing loop
    Object.keys(draft.econ_nations).forEach(nationId => {
      const nation = draft.econ_nations[nationId];
      if (!nation) return;

      // Recalculate GDP based on sector health
      const averageSectorHealth = Object.values(nation.currentSectorHealth).reduce((a, b) => a + b, 0) / 10;
      nation.gdpChangePercent = (averageSectorHealth - 100) * 0.5;
      nation.gdpEstimateUSD = nation.gdpBaselineUSD * (1 + (nation.gdpChangePercent / 100));

      // Inflation bump if Agriculture or Logistics are damaged
      const agriDamage = 100 - (nation.currentSectorHealth['AGRICULTURE'] ?? 100);
      const logiDamage = 100 - (nation.currentSectorHealth['TRANSPORT_LOGISTICS'] ?? 100);
      if (agriDamage > 0 || logiDamage > 0) {
         nation.inflationRate = 2.0 + ((agriDamage + logiDamage) * 0.1);
      } else {
         nation.inflationRate = Math.max(2.0, nation.inflationRate - 0.5); // recovery
      }

      // Food security score updates
      if (agriDamage > 50) {
        nation.foodSecurityScore -= 2;
      } else if (agriDamage === 0) {
        nation.foodSecurityScore = Math.min(100, nation.foodSecurityScore + 2);
      }
      if (nation.foodSecurityScore < 20) {
         useWorldStore.getState().addGlobalEvent(`Humanitarian crisis worsening in ${nationId} due to severe food shortages.`, 'WARNING');
      }

      // Check for reserve depletion
      if (nation.reserveDepletionRatePerTick > 0) {
         nation.currencyReserveUSD = Math.max(0, nation.currencyReserveUSD - nation.reserveDepletionRatePerTick);
      }
      
      nation.lastUpdatedTick = currentTick;
    });
  })),
}));
