import { create } from 'zustand';
import { produce } from 'immer';
import { 
  FinancialActor, ShellEntity, JurisdictionProfile, CoerciveFinancialAction, 
  FinancialActionPreview, FinancialIncident, FinancialCoercionType,
  FinintFlag, FinintShellCompanyProfile, FinintOligarchProfile, FinintBudget,
  FinintFlowType, FinintFlagSeverity
} from '../types';
import { useWorldStore } from './worldStore';
import { usePlayerStore } from './playerStore';
import { useArachneStore as arachneStore } from './arachneStore';
import { useSigintStore as sigintStore } from './sigintStore';
import { useDefconStore as defconStore } from './defconStore';
import { useBlackMarketStore as blackMarketStore } from './blackMarketStore';
import { useCinematicsStore as cinematicsStore } from './cinematicsStore';
import { queueBusEvent } from '../sim/eventBus/dispatcher';
import { createBusEvent } from '../sim/eventBus/eventFactories';

function finint_buildSanctionEvasionRoute(
  originNationId: string,
  tick: number
): string[] {
  const pool = ['UAE', 'Turkey', 'BVI', 'Hong Kong', 'Panama', 'India', 'South Africa', 'Kazakhstan', 'Georgia', 'Armenia', 'Serbia', 'Iraq'];
  const startIdx = (tick + originNationId.charCodeAt(0)) % pool.length;
  return [pool[startIdx], pool[(startIdx + 1) % pool.length], originNationId];
}

function finint_estimateValue(
  flowType: FinintFlowType,
  severity: FinintFlagSeverity,
  tick: number
): number {
  const baseSeed = (tick % 100) / 100;
  if (severity === 'LOW') return Math.round(1 + baseSeed * 49); // 1-50M
  if (severity === 'MEDIUM') return Math.round(50 + baseSeed * 450); // 50-500M
  if (severity === 'HIGH') return Math.round(500 + baseSeed * 4500); // 500-5000M
  return Math.round(5000 + baseSeed * 45000); // 5B-50B
}

function generateFinintNarrative(
  flowType: FinintFlowType,
  nationId: string,
  estimatedValueUSD: number,
  severity: FinintFlagSeverity,
  tick: number
): string {
  const vari = tick % 3;
  if (flowType === 'SANCTIONS_EVASION') {
    if (vari === 0) return `[FININT/${severity}] ${nationId} financial traffic routed through intermediary jurisdictions to avoid primary sanctions perimeter. Estimated value: USD ${estimatedValueUSD}M.`;
    if (vari === 1) return `[FININT/${severity}] Anomalous commodity trade settlement detected — ${nationId} counterparty operating through front entities. Value: USD ${estimatedValueUSD}M.`;
    return `[FININT/${severity}] ${nationId} state-linked entity utilising cryptocurrency bridge to convert sanctioned currency. On-chain analysis: ${estimatedValueUSD}M USD equivalent moved.`;
  }
  if (flowType === 'ILLICIT_PROCUREMENT') {
    return `[FININT/${severity}] Payment of USD ${estimatedValueUSD}M identified flowing from ${nationId}-linked entity to supplier of dual-use goods.`;
  }
  if (flowType === 'COVERT_FINANCE') {
    return `[FININT/${severity}] Intelligence financing pattern detected. USD ${estimatedValueUSD}M from ${nationId} state funds disbursed to non-attributed entities.`;
  }
  if (flowType === 'OLIGARCH_MOVEMENT') {
    return `[FININT/${severity}] Politically exposed person linked to ${nationId} government moving USD ${estimatedValueUSD}M through offshore vehicle chain.`;
  }
  if (flowType === 'RESERVE_ANOMALY') {
    return `[FININT/${severity}] ${nationId} central bank reserve composition shift detected. USD ${estimatedValueUSD}M equivalent converted.`;
  }
  if (flowType === 'COMMODITY_MANIPULATION') {
    return `[FININT/${severity}] ${nationId} state commodity trading entity front-running geopolitical event. Position size: USD ${estimatedValueUSD}M.`;
  }
  if (flowType === 'CRYPTO_OBFUSCATION') {
    return `[FININT/${severity}] ${nationId} state-linked entity using cryptocurrency mixing to obfuscate USD ${estimatedValueUSD}M.`;
  }
  if (flowType === 'HAWALA_TRANSFER') {
    return `[FININT/${severity}] Hawala network transfer linked to ${nationId} — USD ${estimatedValueUSD}M equivalent.`;
  }
  return `[FININT/${severity}] Flag for ${nationId} of type ${flowType}`;
}

interface FinintState {
  actors: FinancialActor[];
  shells: ShellEntity[];
  jurisdictions: JurisdictionProfile[];
  activeActions: CoerciveFinancialAction[];
  incidentsLog: FinancialIncident[];
  
  finint_flags: FinintFlag[];
  finint_shellProfiles: FinintShellCompanyProfile[];
  finint_oligarchProfiles: FinintOligarchProfile[];
  finint_budget: FinintBudget;
  finint_lastProcessedTick: number;
  finint_totalFlagsGenerated: number;
  finint_totalCriticalFlags: number;
  finint_monitoredNationIds: string[];

  // Dynamic metrics of aggregated global blowback (0-100%)
  legitimacyDrain: number; 
  paymentFragmentationRisk: number;
  dollarDominanceErosion: number;
  globalAggregatedBlowback: number;

  // Selected entities for dossier detail panels
  selectedActorId: string | null;
  selectedJurisdictionId: string | null;
  selectedSidebarTab: 'capital' | 'jurisdictions' | 'coercion';
}

interface FinintActions {
  setSelectedActorId: (id: string | null) => void;
  setSelectedJurisdictionId: (id: string | null) => void;
  setSelectedSidebarTab: (tab: 'capital' | 'jurisdictions' | 'coercion') => void;
  
  // Coercion operations
  calculateFinancialPreview: (
    actionType: FinancialCoercionType,
    targetCountryId: string,
    targetActorId?: string,
    intensity?: number
  ) => FinancialActionPreview;

  executeFinancialAction: (
    actionType: FinancialCoercionType,
    targetCountryId: string,
    targetActorId?: string,
    intensity?: number
  ) => void;

  toggleShellStatus: (shellId: string) => void;
  updateJurisdictionCooperation: (jurisdictionId: string, value: number) => void;
  tickFinint: (currentTick: number) => void;
  improveTraceCorrelation: (countryId: string, boost: number) => void;

  finint_addNationToMonitoring: (nationId: string) => void;
  finint_removeNationFromMonitoring: (nationId: string) => void;
  finint_allocateBudget: (amount: number) => void;
  finint_markFlagActedUpon: (flagId: string) => void;
  finint_addShellProfile: (profile: Omit<FinintShellCompanyProfile, 'id' | 'firstFlaggedTick'>, currentTick: number) => string;
  finint_updateOligarchProfile: (profileId: string, update: Partial<FinintOligarchProfile>) => void;
  finint_processTick: (currentTick: number) => void;

  finint_getFlagsByNation: (nationId: string) => FinintFlag[];
  finint_getCriticalFlags: () => FinintFlag[];
  finint_getUnacknowledgedFlags: () => FinintFlag[];
  finint_getOligarchsByNation: (nationId: string) => FinintOligarchProfile[];
  finint_getUnmaskedShells: () => FinintShellCompanyProfile[];
}

// Seeded Strategic Geopolitical Financial Scenarios
const SEEDED_ACTORS: FinancialActor[] = [
  {
    id: 'volkov_holding',
    name: 'Viktor Volkov (Siberian Steel Oligarch)',
    actorType: 'oligarch',
    linkedCountryId: 'RU',
    associatedSanctionStatus: 'PRIMARY_SANCTIONS',
    visibilityScore: 45,
    capitalWeight: 4200, // $4.2B estimated network
    jurisdictionIds: ['cyprus', 'cayman'],
    networkRole: 'Shadow Military Metals Sourcing & Real Estate',
    knownExposureLevel: 80,
    plausibleDeniabilityIndex: 30
  },
  {
    id: 'wong_procure',
    name: 'Wong Kin-Long (Dual-Use Electronics Broker)',
    actorType: 'covert_broker',
    linkedCountryId: 'CN',
    associatedSanctionStatus: 'MONITORED',
    visibilityScore: 85,
    capitalWeight: 1450, // $1.45B shadow pool
    jurisdictionIds: ['cayman', 'seychelles'],
    networkRole: 'Covert ASML Component Purchasing & Hardware Evasion',
    knownExposureLevel: 35,
    plausibleDeniabilityIndex: 75
  },
  {
    id: 'caracas_sovereign',
    name: 'Venz-Bolivar Sovereign Trust Fund',
    actorType: 'sovereign_wealth_fund',
    linkedCountryId: 'FR', // Hosted or routed via France/Europe reserves
    associatedSanctionStatus: 'MONITORED',
    visibilityScore: 20,
    capitalWeight: 9400, // $9.4B formal reserves
    jurisdictionIds: ['switzerland'],
    networkRole: 'State Petroleum Clearing Platform',
    knownExposureLevel: 95,
    plausibleDeniabilityIndex: 15
  },
  {
    id: 'kremlin_central',
    name: 'GosBank Federal Clearing Authority',
    actorType: 'central_bank',
    linkedCountryId: 'RU',
    associatedSanctionStatus: 'PRIMARY_SANCTIONS',
    visibilityScore: 10,
    capitalWeight: 125000, // $125B external capital weight
    jurisdictionIds: ['switzerland', 'cyprus'],
    networkRole: 'Sovereign Clearing & Foreign Exchanges reserves',
    knownExposureLevel: 100,
    plausibleDeniabilityIndex: 5
  },
  {
    id: 'sudan_gold',
    name: 'Al-Ababeel Mining Operations Vehicle',
    actorType: 'proxy_vehicle',
    linkedCountryId: 'UA', // Complex geopolitical proxy links
    associatedSanctionStatus: 'NONE',
    visibilityScore: 70,
    capitalWeight: 890, // $890M estimated raw liquidity
    jurisdictionIds: ['seychelles'],
    networkRole: 'Artisanal Gold Laundering & Anti-Sanction Clearing',
    knownExposureLevel: 15,
    plausibleDeniabilityIndex: 80
  }
];

const SEEDED_JURISDICTIONS: JurisdictionProfile[] = [
  {
    id: 'cayman',
    name: 'Cayman Islands Offshore Territory',
    secrecyRating: 'HIGH',
    compliancePosture: 'PARTIALLY_COOPERATIVE',
    enforcementRisk: 30, // Low direct enforcement risk
    attractivenessForShells: 95,
    sovereignShieldingPower: 60, // Protected indirectly by UK status
    currentCooperationMultiplier: 50
  },
  {
    id: 'cyprus',
    name: 'Republic of Cyprus Sector (EU)',
    secrecyRating: 'HIGH',
    compliancePosture: 'PARTIALLY_COOPERATIVE',
    enforcementRisk: 65, // Subject to EU directives
    attractivenessForShells: 85,
    sovereignShieldingPower: 70,
    currentCooperationMultiplier: 60
  },
  {
    id: 'switzerland',
    name: 'Berne Clearing Syndicate (Neutral)',
    secrecyRating: 'MEDIUM',
    compliancePosture: 'HIGHLY_COOPERATIVE',
    enforcementRisk: 85, // Highly strictly enforced legal mechanisms
    attractivenessForShells: 40,
    sovereignShieldingPower: 90,
    currentCooperationMultiplier: 85
  },
  {
    id: 'seychelles',
    name: 'Seychelles Archipelago Registry',
    secrecyRating: 'HIGH',
    compliancePosture: 'NON_COMPLIANT',
    enforcementRisk: 15, // Virtually immune to remote legal commands
    attractivenessForShells: 98,
    sovereignShieldingPower: 10, // Small sovereign footprint
    currentCooperationMultiplier: 25
  },
  {
    id: 'uk_city',
    name: 'London Square-Mile Trust Syndicate',
    secrecyRating: 'LOW',
    compliancePosture: 'HIGHLY_COOPERATIVE',
    enforcementRisk: 95,
    attractivenessForShells: 15,
    sovereignShieldingPower: 98, // Extreme sovereign backstop
    currentCooperationMultiplier: 95
  }
];

const SEEDED_SHELLS: ShellEntity[] = [
  {
    id: 'aethelgard_ltd',
    name: 'Aethelgard Maritime Holdings S.A.',
    linkedActorId: 'volkov_holding',
    jurisdictionId: 'cyprus',
    secrecyLevel: 75,
    assetClasses: ['Bulk Grain Freighters', 'Belgian Real Estate Portfolio'],
    exposureRisk: 65,
    status: 'FLAGGED',
    linkedRoutes: ['food-ru-eg'] // Interacts with Egypt grain shipments
  },
  {
    id: 'oceanic_vantage',
    name: 'Oceanic Vantage Semiconductors Fund',
    linkedActorId: 'wong_procure',
    jurisdictionId: 'cayman',
    secrecyLevel: 80,
    assetClasses: ['Silvaco Chip-Fab Options', 'EU Tech Shell Equities'],
    exposureRisk: 40,
    status: 'ACTIVE',
    linkedRoutes: ['semi-tw-us', 'rare-cn-us']
  },
  {
    id: 'krypton_trade',
    name: 'Krypton Global Procurement Vehicle',
    linkedActorId: 'volkov_holding',
    jurisdictionId: 'seychelles',
    secrecyLevel: 95,
    assetClasses: ['Titanium Forging Deposits', 'Physical Gold Bullion'],
    exposureRisk: 15,
    status: 'ACTIVE',
    linkedRoutes: ['strat-ru-us']
  },
  {
    id: 'gosbank_shadow_1',
    name: 'Crescent Moon Alpha Clearing Ltd',
    linkedActorId: 'kremlin_central',
    jurisdictionId: 'cyprus',
    secrecyLevel: 90,
    assetClasses: ['Foreign exchange swaps', 'Digital stablecoin reserves'],
    exposureRisk: 85,
    status: 'FLAGGED',
    linkedRoutes: ['oil-sa-jp']
  }
];

export const useFinintStore = create<FinintState & FinintActions>((set, get) => ({
  actors: SEEDED_ACTORS,
  jurisdictions: SEEDED_JURISDICTIONS,
  shells: SEEDED_SHELLS,
  activeActions: [],
  incidentsLog: [
    {
      tick: 1,
      actorId: 'system',
      actionType: 'DISCOVERY',
      title: 'CYPRIOT SHADOW NET EXPOSED',
      summary: 'Arachne signals suspect high-yield metal acquisitions routed via Aethelgard Maritime Holdings. High probability Volkov proxy.',
      severity: 'WARNING'
    }
  ],

  legitimacyDrain: 15,
  paymentFragmentationRisk: 18,
  dollarDominanceErosion: 10,
  globalAggregatedBlowback: 14,
  improveTraceCorrelation: (countryId: string, boost: number) => {
    set(produce((draft) => {
      const jurisdictionsInCountry = draft.jurisdictions.filter((j: any) => j.id === countryId);
      jurisdictionsInCountry.forEach((j: any) => {
        j.currentCooperationMultiplier = Math.min(100, j.currentCooperationMultiplier + boost);
      });
    }));
  },

  selectedActorId: null,
  selectedJurisdictionId: null,
  selectedSidebarTab: 'capital',

  finint_flags: [],
  finint_shellProfiles: [],
  finint_oligarchProfiles: [],
  finint_budget: { totalAllocated: 400, spent: 0, remaining: 400 },
  finint_lastProcessedTick: -1,
  finint_totalFlagsGenerated: 0,
  finint_totalCriticalFlags: 0,
  finint_monitoredNationIds: [],

  setSelectedActorId: (id) => set({ selectedActorId: id, selectedJurisdictionId: null }),
  setSelectedJurisdictionId: (id) => set({ selectedJurisdictionId: id, selectedActorId: null }),
  setSelectedSidebarTab: (tab) => set({ selectedSidebarTab: tab }),

  calculateFinancialPreview: (actionType, targetCountryId, targetActorId, intensity = 50) => {
    const { actors, jurisdictions } = get();
    const actor = targetActorId ? actors.find(a => a.id === targetActorId) : null;
    
    let baseStrength = intensity;
    let baseAllianceDiscomfort = 0;
    let baseLegitimacyDrain = 0;
    let basePaymentFrag = 0;
    let baseDominanceErode = 0;
    
    let firstOrderFinancialImpact = '';
    let firstOrderStrategicRetaliationRisk = '';

    // Calculate baseline profiles by Coercion Tool Category
    switch (actionType) {
      case 'ASSET_FREEZE': {
        baseAllianceDiscomfort = Math.round(intensity * 0.4);
        baseLegitimacyDrain = Math.round(intensity * 0.3);
        basePaymentFrag = Math.round(intensity * 0.2);
        baseDominanceErode = Math.round(intensity * 0.25);
        
        const nameLabel = actor ? actor.name : `${targetCountryId} assets`;
        firstOrderFinancialImpact = `Complete seizure and freeze of matching correspondent custody reserves linked with ${nameLabel}. Eliminates shadow spending capabilities instantly.`;
        firstOrderStrategicRetaliationRisk = `Target sovereign and allied networks may retaliate via targeted asymmetric cyber campaigns against local clearing banks.`;
        break;
      }
      case 'RESERVE_ATTACK': {
        // High-intensity financial assault on Central Bank or sovereign funds
        baseAllianceDiscomfort = Math.round(intensity * 0.82);
        baseLegitimacyDrain = Math.round(intensity * 0.95);
        basePaymentFrag = Math.round(intensity * 0.7);
        baseDominanceErode = Math.round(intensity * 0.85);

        firstOrderFinancialImpact = `Direct attack on target central clearing assets. Strips liquidity to support the target nation's currency, causing massive retail inflation of +50%.`;
        firstOrderStrategicRetaliationRisk = `Extremely high. May trigger complete physical expropriation of national corporate properties located in target territory.`;
        break;
      }
      case 'DEBT_PRESSURE': {
        baseAllianceDiscomfort = Math.round(intensity * 0.3);
        baseLegitimacyDrain = Math.round(intensity * 0.4);
        basePaymentFrag = Math.round(intensity * 0.1);
        baseDominanceErode = Math.round(intensity * 0.15);

        firstOrderFinancialImpact = `Triggers immediate sovereign rating downgrades. Drives secondary rollover loan yields past +14%, choking off state municipal debt.`;
        firstOrderStrategicRetaliationRisk = `Target defaults on trade obligations with key allies, hurting allied commercial shipping banks.`;
        break;
      }
      case 'SWIFT_EXCLUSION': {
        baseAllianceDiscomfort = Math.round(intensity * 0.7);
        baseLegitimacyDrain = Math.round(intensity * 0.65);
        basePaymentFrag = Math.round(intensity * 0.95); // Extremely high de-dollarization threat
        baseDominanceErode = Math.round(intensity * 0.75);

        firstOrderFinancialImpact = `Complete cutoff from standard messaging. All cross-border trade transactions are delayed indefinitely, forcing reliance on raw trade-barter.`;
        firstOrderStrategicRetaliationRisk = `Forces target heavily into non-standard alternative platforms (CIPS/SPFS), permanently fragmenting Western central bank leverage.`;
        break;
      }
    }

    // Dynamic adjustment based on selected Actor's visibility or Plausible Deniability
    if (actor) {
      if (actor.visibilityScore > 60) {
        // Highly hidden hidden actor being pursued. High intelligence compromise cost!
        baseLegitimacyDrain += 12;
      }
      if (actor.plausibleDeniabilityIndex > 50) {
        // Strong deniability makes it politically very aggressive to attack
        baseAllianceDiscomfort += 15;
        baseLegitimacyDrain += 18;
      }
    }

    const cumulativeBlowback = Math.round((baseAllianceDiscomfort + baseLegitimacyDrain + basePaymentFrag + baseDominanceErode) / 4);

    return {
      actionType,
      targetCountryId,
      targetActorId,
      intendedStrength: intensity,
      expectedLeverageLevel: Math.round(intensity * 1.1),
      allianceDiscomfortPenalty: Math.min(100, baseAllianceDiscomfort),
      reputationalErosion: Math.min(100, baseLegitimacyDrain),
      paymentFragmentationRisk: Math.min(100, basePaymentFrag),
      dollarDominanceErosion: Math.min(100, baseDominanceErode),
      expectedTotalBlowback: Math.min(100, cumulativeBlowback),
      firstOrderFinancialImpact,
      firstOrderStrategicRetaliationRisk,
      confidenceScore: actor && actor.visibilityScore < 30 ? 'HIGH' : 'MEDIUM'
    };
  },

  executeFinancialAction: (actionType, targetCountryId, targetActorId, intensity = 50) => {
    set(produce((draft: FinintState) => {
      const currentTick = useWorldStore.getState().currentTick;
      const playerCountryId = usePlayerStore.getState().countryId || 'US';
      const actorObj = targetActorId ? draft.actors.find(a => a.id === targetActorId) : null;

      // 1. Calculate and add current exposure metrics
      const preview = get().calculateFinancialPreview(actionType, targetCountryId, targetActorId, intensity);
      
      draft.legitimacyDrain = Math.min(100, draft.legitimacyDrain + Math.round(preview.reputationalErosion * 0.35));
      draft.paymentFragmentationRisk = Math.min(100, draft.paymentFragmentationRisk + Math.round(preview.paymentFragmentationRisk * 0.3));
      draft.dollarDominanceErosion = Math.min(100, draft.dollarDominanceErosion + Math.round(preview.dollarDominanceErosion * 0.25));

      // 2. Track action inside active coercive state list
      const actionObj: CoerciveFinancialAction = {
        id: `finAction-${actionType}-${targetCountryId}-${currentTick}`,
        type: actionType,
        actorCountryId: playerCountryId,
        targetCountryId,
        targetActorId,
        intensityScore: intensity,
        activeTick: currentTick
      };
      
      draft.activeActions.push(actionObj);

      // 3. Dynamic secondary effects on actors and jurisdictions
      if (actorObj) {
        actorObj.associatedSanctionStatus = actionType === 'ASSET_FREEZE' ? 'FROZEN_ASSETS' : 'SECONDARY_REDUX';
        actorObj.knownExposureLevel = Math.min(100, actorObj.knownExposureLevel + 20);
        
        // Find matching shell companies of the actor and flag or freeze them too
        draft.shells.forEach(shell => {
          if (shell.linkedActorId === actorObj.id) {
            shell.status = actionType === 'ASSET_FREEZE' ? 'FROZEN' : 'FLAGGED';
            shell.exposureRisk = Math.min(100, shell.exposureRisk + 30);
          }
        });
      }

      // Add high level diagnostic summary event
      const actorNameLabel = actorObj ? actorObj.name : `Sovereign clearing of ${targetCountryId}`;
      const newIncident: FinancialIncident = {
        tick: currentTick,
        actorId: targetActorId || targetCountryId,
        actionType,
        title: `COERCIVE WEAPON DEPLOYED: [${actionType}]`,
        summary: `Coercive financial actions initiated by ${playerCountryId} targeting ${actorNameLabel}. Operational strength rated at ${intensity}/100. Expected leverage is high.`,
        severity: 'CRITICAL'
      };

      draft.incidentsLog.unshift(newIncident);

      // 4. Integrate with canonical world state event system & Arachne
      try {
        useWorldStore.setState(produce((worldDraft) => {
          let eventType: any = 'ECONOMIC_SANCTION_APPLIED'; // Map to appropriate Event Bus signature
          if (actionType === 'ASSET_FREEZE') eventType = 'ECONOMIC_SANCTION_APPLIED';
          else if (actionType === 'SWIFT_EXCLUSION') eventType = 'ECONOMIC_STRESS_CHANGED';
          else eventType = 'ENERGY_SUPPLY_DISRUPTED';

          const busEvt = createBusEvent({
            type: eventType,
            category: 'ECONOMIC',
            sourceSystem: playerCountryId,
            sourceEntityType: 'COUNTRY',
            sourceEntityId: playerCountryId,
            targetEntityType: 'COUNTRY',
            targetEntityIds: [targetCountryId],
            tick: currentTick,
            severity: 'CRITICAL',
            title: `FINANT STRATEGIC ATTACK: [${actionType}]`,
            summary: `Financial weapons deployed inside international clearing registries. Stripping access pools for ${actorNameLabel}.`
          });
          queueBusEvent(worldDraft.world, busEvt);
        }));

        arachneStore.getState().addLiveIntelItem({
          title: `FINANCIAL CORRIDOR INTERDICTION COMMITTED`,
          summary: `SWIFT registries reports unilateral routing exclusion applied targeting ${actorNameLabel}. Monetary friction rising.`,
          themeTags: ['SANCTIONS'],
          urgency: 'HIGH',
          confidence: 'TOTAL',
          alertScore: 75,
          briefingCategory: 'ACTIVE_WATCH'
        });
      } catch (err) {
        console.warn('[FININT] Failed to send actions outward to systems:', err);
      }
    }));
  },

  toggleShellStatus: (shellId) => {
    set(produce((draft: FinintState) => {
      const shell = draft.shells.find(s => s.id === shellId);
      if (shell) {
        shell.status = shell.status === 'FROZEN' ? 'ACTIVE' : 'FROZEN';
        const currentTick = useWorldStore.getState().currentTick;
        draft.incidentsLog.unshift({
          tick: currentTick,
          actorId: shellId,
          actionType: 'EXCLOSURE',
          title: `SHELL ASSET STATUS MODIFIED`,
          summary: `Control registries shifted offshore shell entity ${shell.name} status to ${shell.status}.`,
          severity: 'INFO'
        });
      }
    }));
  },

  updateJurisdictionCooperation: (jurisdictionId, value) => {
    set(produce((draft: FinintState) => {
      const jur = draft.jurisdictions.find(j => j.id === jurisdictionId);
      if (jur) {
        jur.currentCooperationMultiplier = value;
        // High cooperation posture lowers shell attractiveness
        jur.attractivenessForShells = Math.max(10, Math.round(95 - (value * 0.7)));
        jur.enforcementRisk = Math.min(100, Math.round(25 + (value * 0.75)));
      }
    }));
  },

  tickFinint: (currentTick) => {
    set(produce((draft: FinintState) => {
      // 1. Decay global exposure-risk over time if no new actions are taken
      if (draft.legitimacyDrain > 5) draft.legitimacyDrain -= 0.3;
      if (draft.paymentFragmentationRisk > 5) draft.paymentFragmentationRisk -= 0.15;
      if (draft.dollarDominanceErosion > 5) draft.dollarDominanceErosion -= 0.1;

      // Aggregated score
      draft.globalAggregatedBlowback = Math.round(
        (draft.legitimacyDrain + draft.paymentFragmentationRisk + draft.dollarDominanceErosion) / 3
      );

      // Decay duration of custom active actions or periodically trigger events
      if (currentTick % 8 === 0) {
        // Randomly simulate an offshore leakage report / discovery rumor
        const availableShells = draft.shells.filter(s => s.status === 'ACTIVE');
        if (availableShells.length > 0) {
          const randShell = availableShells[Math.floor(Math.random() * availableShells.length)];
          if (Math.random() > 0.45) {
            randShell.status = 'FLAGGED';
            randShell.exposureRisk = Math.min(100, randShell.exposureRisk + 25);
            draft.incidentsLog.unshift({
              tick: currentTick,
              actorId: randShell.id,
              actionType: 'DISCOVERY',
              title: `BENEFICIAL OWNER INFORMATION LEAK`,
              summary: `Leaks expose beneficial owners of ${randShell.name} inside the ${randShell.jurisdictionId} jurisdiction. Discoverability elevated.`,
              severity: 'WARNING'
            });
            
            try {
              arachneStore.getState().addLiveIntelItem({
                title: `OFFSHORE DIRECTORY LEAK DETECTED`,
                summary: `Substantial files leaks decrypt shelter entities. Flagged beneficial node: ${randShell.name}.`,
                themeTags: ['COVERT_RISK'],
                urgency: 'MEDIUM',
                confidence: 'MEDIUM',
                alertScore: 55,
                briefingCategory: 'ACTIVE_WATCH'
              });
            } catch(e) {}
          }
        }
      }
    }));
  },

  finint_getFlagsByNation: (nationId) => get().finint_flags.filter(f => f.sourceNationId === nationId),
  finint_getCriticalFlags: () => get().finint_flags.filter(f => f.severity === 'CRITICAL'),
  finint_getUnacknowledgedFlags: () => get().finint_flags.filter(f => !f.isActedUpon),
  finint_getOligarchsByNation: (nationId) => get().finint_oligarchProfiles.filter(o => o.nationId === nationId),
  finint_getUnmaskedShells: () => get().finint_shellProfiles.filter(s => s.isFullyUnmasked),

  finint_addNationToMonitoring: (nationId) => set(produce((draft: FinintState) => {
    if (!draft.finint_monitoredNationIds.includes(nationId)) {
      draft.finint_monitoredNationIds.push(nationId);
    }
  })),

  finint_removeNationFromMonitoring: (nationId) => set(produce((draft: FinintState) => {
    draft.finint_monitoredNationIds = draft.finint_monitoredNationIds.filter(id => id !== nationId);
  })),

  finint_allocateBudget: (amount) => set(produce((draft: FinintState) => {
    draft.finint_budget.totalAllocated += amount;
    draft.finint_budget.remaining += amount;
  })),

  finint_markFlagActedUpon: (flagId) => set(produce((draft: FinintState) => {
    const flag = draft.finint_flags.find(f => f.id === flagId);
    if (flag) flag.isActedUpon = true;
  })),

  finint_addShellProfile: (profile, currentTick) => {
    const id = `shl_${currentTick}_${Math.random().toString(36).slice(2, 7)}`;
    set(produce((draft: FinintState) => {
      draft.finint_shellProfiles.push({ ...profile, id, firstFlaggedTick: currentTick });
    }));
    return id;
  },

  finint_updateOligarchProfile: (profileId, update) => set(produce((draft: FinintState) => {
    const p = draft.finint_oligarchProfiles.find(x => x.id === profileId);
    if (p) Object.assign(p, update);
  })),

  finint_processTick: (currentTick: number) => {
    const state = get();
    if (state.finint_lastProcessedTick === currentTick) return;

    const arachneState = arachneStore.getState();
    const mappedNodes = arachneState.arachne_nodes ? arachneState.arachne_nodes.filter(n => n.exposureLevel === 'MAPPED') : [];
    
    const sigintState = sigintStore.getState();
    const confirmedSignals = sigintState.u8200GetConfirmedSignals ? sigintState.u8200GetConfirmedSignals() : [];
    const ecoSignals = confirmedSignals.filter(s => s.category === 'ECONOMIC_ANOMALY');

    const worldState = useWorldStore.getState();
    const defcon = defconStore.getState().currentDefconLevel ?? 3;

    let budgetSpent = state.finint_budget.spent;
    const cost = state.finint_monitoredNationIds.length * 15;
    let monitored = [...state.finint_monitoredNationIds];

    if (state.finint_budget.remaining < cost && monitored.length > 0) {
      monitored.pop(); // remove last element (lowest priority simplified)
    }
    const actualCost = monitored.length * 15;
    
    let flags = [...state.finint_flags];
    let shells = [...state.finint_shellProfiles];
    let criticalCount = 0;

    monitored.forEach(nationId => {
      let prob = 0.25;
      if (defcon <= 3) prob += 0.10;
      
      const eco = worldState.countries[nationId]?.economic;
      const isSanctioned = eco ? eco.sanctionedBy.length > 0 : false;
      if (isSanctioned) prob += 0.15;

      const hasActiveHighFlag = flags.some(f => f.sourceNationId === nationId && (f.severity === 'HIGH' || f.severity === 'CRITICAL'));
      if (hasActiveHighFlag) prob += 0.20;

      if (ecoSignals.some(s => s.sourceNationId === nationId)) prob += 0.10;

      if (Math.random() < prob) {
        let flowType: FinintFlowType = 'RESERVE_ANOMALY';
        const flowRoll = Math.random();
        
        if (isSanctioned) {
          flowType = flowRoll < 0.4 ? 'SANCTIONS_EVASION' : flowRoll < 0.7 ? 'CRYPTO_OBFUSCATION' : 'HAWALA_TRANSFER';
        } else if (defcon <= 3) {
          flowType = flowRoll < 0.5 ? 'COVERT_FINANCE' : 'ILLICIT_PROCUREMENT';
        } else {
          flowType = flowRoll < 0.5 ? 'RESERVE_ANOMALY' : 'COMMODITY_MANIPULATION';
        }

        const ecoSignalBonus = ecoSignals.some(s => s.sourceNationId === nationId) ? 25 : 0;
        const fnNodes = mappedNodes.filter(n => n.nationId === nationId && n.type === 'FINANCIAL_ENTITY');
        const nodeBonus = fnNodes.length > 0 ? 20 : 0;
        
        let confidence = 30 + ecoSignalBonus + nodeBonus + ((6 - defcon) * 5) + (isSanctioned ? 15 : 0);
        confidence = Math.min(100, confidence);

        let severity: FinintFlagSeverity = 'LOW';
        if (confidence >= 86) severity = 'CRITICAL';
        else if (confidence >= 66) severity = 'HIGH';
        else if (confidence >= 40) severity = 'MEDIUM';

        const estValue = finint_estimateValue(flowType, severity, currentTick);
        const narrative = generateFinintNarrative(flowType, nationId, estValue, severity, currentTick);
        
        const linkedArachneNodeIds = mappedNodes.filter(n => n.nationId === nationId && (n.type === 'FINANCIAL_ENTITY' || n.type === 'ORGANISATION')).slice(0, 2).map(n => n.id);
        const route = flowType === 'SANCTIONS_EVASION' ? finint_buildSanctionEvasionRoute(nationId, currentTick) : [];

        const newFlag: FinintFlag = {
          id: `fin_flag_${currentTick}_${Math.random().toString(36).slice(2,7)}`,
          flowType,
          severity,
          sourceEntityId: linkedArachneNodeIds[0] || 'unknown',
          destinationEntityId: linkedArachneNodeIds[1] || 'unknown',
          sourceNationId: nationId,
          destinationNationId: 'unknown',
          estimatedValueUSD: estValue,
          detectedAtTick: currentTick,
          expiresAtTick: currentTick + 20,
          confidenceScore: confidence,
          isCorroborated: ecoSignalBonus > 0,
          isActedUpon: false,
          narrativeSummary: narrative,
          linkedArachneNodeIds,
          sanctionEvasionRoute: route
        };
        flags.push(newFlag);
        
        if (severity === 'CRITICAL') {
           criticalCount++;
           useWorldStore.getState().addGlobalEvent(
             `FININT Critical Detection: ${flowType} - ${narrative}`,
             'CRITICAL'
           );
        }
      }
    });

    flags = flags.filter(f => f.expiresAtTick > currentTick);

    flags.filter(f => f.severity === 'HIGH' || f.severity === 'CRITICAL').forEach(flag => {
      flag.linkedArachneNodeIds.forEach(nodeId => {
        const node = mappedNodes.find(n => n.id === nodeId);
        if (node && node.type === 'FINANCIAL_ENTITY') {
           const existing = shells.find(s => s.ultimateBeneficialOwner === nodeId);
           if (!existing) {
             if (Math.random() < 0.3) {
               shells.push({
                 id: `shl_${currentTick}_${Math.random().toString(36).slice(2, 7)}`,
                 registeredName: `Obscured Entity ${node.nationId}-${currentTick % 100}`,
                 registeredJurisdiction: 'BVI',
                 ultimateBeneficialOwner: nodeId,
                 controlledByNationId: node.nationId,
                 estimatedAssetsUSD: flag.estimatedValueUSD,
                 linkedFlagIds: [flag.id],
                 unmaskConfidence: 20,
                 unmaskSource: ['FINANCIAL_FILING'],
                 firstFlaggedTick: currentTick,
                 isFullyUnmasked: false
               });
             }
           } else {
             if (monitored.includes(flag.sourceNationId)) {
               existing.unmaskConfidence += 15;
               if (!existing.linkedFlagIds.includes(flag.id)) existing.linkedFlagIds.push(flag.id);
               if (existing.unmaskConfidence >= 80 && !existing.isFullyUnmasked) {
                 existing.isFullyUnmasked = true;
                 useWorldStore.getState().addGlobalEvent(
                   `Beneficial Ownership Identified: Shell company ${existing.registeredName} successfully traced.`,
                   'WARNING'
                 );
               }
             }
           }
        }
      });
    });

    flags.forEach(flag => {
       if (!flag.isCorroborated) {
         if (ecoSignals.some(s => Math.abs(currentTick - s.detectedAtTick) <= 5 && s.sourceNationId === flag.sourceNationId)) {
           flag.isCorroborated = true;
           flag.confidenceScore = Math.min(100, flag.confidenceScore + 15);
           if (flag.confidenceScore >= 86) flag.severity = 'CRITICAL';
           else if (flag.confidenceScore >= 66) flag.severity = 'HIGH';
           else if (flag.confidenceScore >= 40) flag.severity = 'MEDIUM';
         }
       }
    });

    set({
      finint_monitoredNationIds: monitored,
      finint_flags: flags,
      finint_shellProfiles: shells,
      finint_budget: { ...state.finint_budget, spent: budgetSpent + actualCost, remaining: state.finint_budget.remaining - actualCost },
      finint_lastProcessedTick: currentTick,
      finint_totalFlagsGenerated: state.finint_totalFlagsGenerated + flags.length - [...state.finint_flags].length,
      finint_totalCriticalFlags: state.finint_totalCriticalFlags + criticalCount
    });
  }
}));
