import { create } from 'zustand';
import { produce } from 'immer';
import { WorldState, Country, BallisticStrike, CommodityMarket, ArmsDeal, ThreatLevel, LeaderPersonality, MajorActionType, ScheduledConsequence, WorldConfig, CountryStartConfig } from '../types';
import { INITIAL_COUNTRIES } from '../data/countries';
import { generateInitialCanonicalWorld, advanceCanonicalWorldTick } from '../utils/canonicalGenerator';
import { COMMODITY_BASELINES } from '../constants';
import { useBlackMarketStore } from './blackMarketStore';
import { useMirrorStore } from './mirrorStore';
import { useLeaderStore } from './leaderStore';
import { usePlayerStore } from './playerStore';
import { ConsequenceEngine } from '../sim/consequenceEngine';

// Private utility to sync worldBuilderConfig to live countries roster for real-time map preview alignment
const syncBuilderConfigToCountries = (draft: any) => {
  if (!draft.worldBuilderConfig) return;
  const playerCountryId = usePlayerStore.getState().countryId || 'US';
  Object.keys(draft.worldBuilderConfig).forEach((id) => {
    const custom = draft.worldBuilderConfig[id];
    const country = draft.countries[id];
    if (country && custom) {
      country.political.ideology = custom.ideology;
      country.economic.gdpB = custom.gdp;
      
      const basePowerMap: Record<string, number> = {
        US: 95, CN: 88, RU: 90, IN: 72, PK: 55, IL: 78, IR: 60, GB: 70, FR: 68, DE: 62, JP: 58, KR: 60, SA: 65, BR: 48, ZA: 35, AU: 55, TR: 62, EG: 50, TW: 64, PS: 12
      };
      const basePower = basePowerMap[id] || 50;
      const ratio = custom.military / basePower;
      
      if (country.arsenal?.units) {
        country.arsenal.units.forEach((unit: any) => {
          if (unit.count > 0 && unit.type !== 'ICBM' && unit.type !== 'SLBM') {
            unit.count = Math.max(1, Math.round(unit.count * ratio));
          }
        });
      }
      
      if (id !== playerCountryId) {
        country.opinions[playerCountryId] = custom.opinion;
      }
      
      country.allianceBlock = custom.alliance;
      country.arsenal.nuclearCapable = custom.nuclear;
      
      if (!custom.nuclear) {
        if (country.arsenal?.units) {
          country.arsenal.units.forEach((unit: any) => {
            if (unit.type === 'ICBM' || unit.type === 'SLBM') {
              unit.count = 0;
            }
          });
        }
      } else {
        if (country.arsenal?.units) {
          let hasNukes = false;
          country.arsenal.units.forEach((unit: any) => {
            if ((unit.type === 'ICBM' || unit.type === 'SLBM') && unit.count > 0) {
              hasNukes = true;
            }
          });
          if (!hasNukes) {
            country.arsenal.units.forEach((unit: any) => {
              if (unit.type === 'ICBM') {
                unit.count = 50;
              }
            });
          }
        }
      }
    }
  });
  if (draft.world) {
    draft.world = advanceCanonicalWorldTick(draft.world, draft.countries, draft.currentTick || 0);
  }
};

export function getInitialWorldBuilderConfig(): WorldConfig {
  const config: WorldConfig = {};
  const basePower: Record<string, number> = {
    US: 95, CN: 88, RU: 90, IN: 72, PK: 55, IL: 78, IR: 60, GB: 70, FR: 68, DE: 62, JP: 58, KR: 60, SA: 65, BR: 48, ZA: 35, AU: 55, TR: 62, EG: 50, TW: 64, PS: 12, UA: 45
  };
  Object.keys(INITIAL_COUNTRIES).forEach((id) => {
    const country = INITIAL_COUNTRIES[id];
    if (country) {
      config[id] = {
        ideology: country.political.ideology,
        military: basePower[id] || 50,
        gdp: country.economic.gdpB,
        opinion: country.opinions['US'] || 0,
        alliance: country.allianceBlock,
        nuclear: country.arsenal.nuclearCapable,
      };
    }
  });
  return config;
}

interface WorldStoreActions {
  applyTickDelta: (updater: (draft: WorldState) => void) => void;
  updateCountry: (id: string, updater: (country: Country) => void) => void;
  addStrike: (strike: BallisticStrike) => void;
  resolveStrike: (strikeId: string, status: BallisticStrike['status']) => void;
  updateCommodity: (type: keyof typeof COMMODITY_BASELINES, updater: (market: CommodityMarket) => void) => void;
  addGlobalEvent: (text: string, severity?: WorldState['globalEventLog'][0]['severity']) => void;
  setGlobalThreatLevel: (level: ThreatLevel) => void;
  resetWorld: (leaderOverrides?: Record<string, LeaderPersonality>) => void;
  registerConsequenceChain: (actionType: MajorActionType, context: { sourceCountryId: string; targetCountryId?: string; [key: string]: any }) => void;
  enqueueConsequence: (consequence: ScheduledConsequence) => void;
  resolveScheduledConsequence: (id: string) => void;
  tickConsequences: (currentTick: number) => void;
  clearExpiredHistory: () => void;
  setWorldBuilderConfig: (config: WorldConfig) => void;
  updateWorldBuilderCountryConfig: (countryId: string, config: Partial<CountryStartConfig>) => void;
  resetWorldBuilderConfig: () => void;
  applyWorldBuilderConfig: (playerCountryId: string) => void;
}

export const useWorldStore = create<WorldState & WorldStoreActions>((set) => ({
  countries: JSON.parse(JSON.stringify(INITIAL_COUNTRIES)), // Deep copy of seed
  world: generateInitialCanonicalWorld(JSON.parse(JSON.stringify(INITIAL_COUNTRIES)), {}),
  worldBuilderConfig: getInitialWorldBuilderConfig(),
  activeStrikes: [],
  commodityMarkets: Object.keys(COMMODITY_BASELINES).map((key) => {
    const baseline = COMMODITY_BASELINES[key as keyof typeof COMMODITY_BASELINES];
    return {
      type: key as any,
      spotPriceUSD: baseline.base,
      baselinePrice: baseline.base,
      volatilityIndex: baseline.volatility,
      supplyShockActive: false,
      embargoed: false,
      embargoedBy: [],
      priceHistory: [baseline.base],
    };
  }),
  activeArmsDeals: [],
  globalThreatLevel: 'GREEN',
  nuclearExchangeOccurred: false,
  globalEventLog: [
    { tick: 0, text: 'Sovereign Command Simulator systems loaded.', severity: 'SYSTEM' },
    { tick: 0, text: 'Space Reconnaissance constellation online. Multi-spectrum radars standing by.', severity: 'INFO' }
  ],
  currentTick: 0,
  scheduledConsequences: [],
  recentResolvedConsequences: [],
  aiOperationsLog: [
    {
      tick: -12,
      countryId: 'RU',
      countryName: 'Russia',
      action: 'FSB Cyber Infiltration',
      targetCountryId: 'US',
      targetCountryName: 'United States',
      description: 'Breached command communications targeting classified nuclear submarine coordinates in the North Sea.',
      secrecyScore: 88,
      impactScore: 65,
    },
    {
      tick: -8,
      countryId: 'CN',
      countryName: 'China',
      action: 'Industrial Espionage',
      targetCountryId: 'US',
      targetCountryName: 'United States',
      description: 'Acquired advanced semiconductor fabrication blueprint schemas using front commercial logistics corporations.',
      secrecyScore: 92,
      impactScore: 78,
    },
    {
      tick: -5,
      countryId: 'IR',
      countryName: 'Iran',
      action: 'Proxy Centrifuges Funding',
      targetCountryId: 'KP',
      targetCountryName: 'North Korea',
      description: 'Financed raw military centrifuge parts shipment undetected via custom registered maritime container vessels.',
      secrecyScore: 85,
      impactScore: 70,
    }
  ],

  applyTickDelta: (updater) => set(produce((draft: WorldState & WorldStoreActions) => {
    updater(draft);
    if (draft.world) {
      draft.world = advanceCanonicalWorldTick(draft.world, draft.countries, draft.currentTick);
      
      // Pull and synchronize all newly generated tick logs into globalEventLog
      const newLogs = draft.world.timeline.filter(log => log.tick === draft.currentTick);
      newLogs.forEach(log => {
        const alreadyExists = draft.globalEventLog.some(existing => existing.tick === log.tick && existing.text === log.desc);
        if (!alreadyExists) {
          draft.globalEventLog.unshift({
            tick: log.tick,
            text: log.desc,
            severity: log.desc.toUpperCase().includes('CRITICAL') || 
                      log.desc.toUpperCase().includes('BREAK') || 
                      log.desc.toUpperCase().includes('EXPOSED') ||
                      log.desc.toUpperCase().includes('ESPIONAGE') 
                      ? 'CRITICAL' : 'SYSTEM'
          });
        }
      });
    }
  })),

  updateCountry: (id, updater) => set(produce((draft: WorldState & WorldStoreActions) => {
    if (draft.countries[id]) {
      updater(draft.countries[id]);
      if (draft.world) {
        draft.world = advanceCanonicalWorldTick(draft.world, draft.countries, draft.currentTick);
      }
    }
  })),

  addStrike: (strike) => set(produce((draft: WorldState & WorldStoreActions) => {
    draft.activeStrikes.push(strike);
    draft.globalEventLog.unshift({
      tick: draft.currentTick,
      text: `Tactical Warning: Ballistic target trace detected in airspace! Source: ${strike.sourceCountryId} → Target: ${strike.targetCountryId}. Classified unit type: ${strike.weaponType}.`,
      severity: 'CRITICAL',
    });

    const isNuclear = strike.weaponType === 'ICBM' || strike.weaponType === 'SLBM' || (strike.warheadYieldMT !== undefined && strike.warheadYieldMT > 0);
    const actionType = isNuclear ? 'NUCLEAR_ESCALATION' : 'LAUNCH_STRIKE';
    ConsequenceEngine.register(actionType, { sourceCountryId: strike.sourceCountryId, targetCountryId: strike.targetCountryId }, draft);
  })),

  resolveStrike: (strikeId, status) => set(produce((draft: WorldState & WorldStoreActions) => {
    const s = draft.activeStrikes.find((x) => x.id === strikeId);
    if (s) {
      s.status = status;
    }
  })),

  updateCommodity: (type, updater) => set(produce((draft: WorldState & WorldStoreActions) => {
    const market = draft.commodityMarkets.find((m) => m.type === type);
    if (market) {
      updater(market);
    }
  })),

  addGlobalEvent: (text, severity = 'INFO') => set(produce((draft: WorldState & WorldStoreActions) => {
    draft.globalEventLog.unshift({
      tick: draft.currentTick,
      text: text,
      severity: severity,
    });
    // Keep logs manageable
    if (draft.globalEventLog.length > 200) {
      draft.globalEventLog.pop();
    }
  })),

  setGlobalThreatLevel: (level) => set(produce((draft: WorldState & WorldStoreActions) => {
    draft.globalThreatLevel = level;
  })),

  resetWorld: (leaderOverrides) => {
    useBlackMarketStore.getState().resetMarket();
    useLeaderStore.getState().initializeLeadersForAllCountries(0, leaderOverrides);
    const initialCountries = JSON.parse(JSON.stringify(INITIAL_COUNTRIES));
    const currentLeaders = useLeaderStore.getState().leadersByCountryId;
    const initialCanonical = generateInitialCanonicalWorld(initialCountries, currentLeaders, 0);
    
    // Initialize Sovereign Agents
    setTimeout(() => {
      const mirror = useMirrorStore.getState();
      mirror.sovereign_initAgent('RU', { powerOrientation: 'REVISIONIST', ideologicalPosture: 'AUTHORITARIAN_NATIONALIST', economicDoctrine: 'MERCANTILIST', riskTolerance: 'AGGRESSIVE', regionalAmbition: 'GLOBAL' }, { name: 'Mikhail Volkov', nationId: 'RU', archetype: 'PARANOID_STRONGMAN', ageYears: 65, yearsInPower: 15, loyaltyBase: 'Military', domesticApprovalScore: 85, personalRiskTolerance: 70, paranoidModifier: 80, ideologyStrength: 60, ambitionScore: 80, legacyWeight: 90, decisionLatencyTicks: 2, memoryCitedEvents: [] }, 0);
      mirror.sovereign_initAgent('CN', { powerOrientation: 'HEGEMON', ideologicalPosture: 'PRAGMATIC_REALIST', economicDoctrine: 'STATE_CAPITALIST', riskTolerance: 'CALCULATED', regionalAmbition: 'GLOBAL' }, { name: 'Zhang Wei', nationId: 'CN', archetype: 'IMPERIAL_VISIONARY', ageYears: 70, yearsInPower: 10, loyaltyBase: 'Party', domesticApprovalScore: 90, personalRiskTolerance: 40, paranoidModifier: 30, ideologyStrength: 50, ambitionScore: 95, legacyWeight: 80, decisionLatencyTicks: 4, memoryCitedEvents: [] }, 0);
      mirror.sovereign_initAgent('IR', { powerOrientation: 'REVISIONIST', ideologicalPosture: 'THEOCRATIC', economicDoctrine: 'SANCTIONS_RESISTANT', riskTolerance: 'RECKLESS', regionalAmbition: 'REGIONAL_PLAYER' }, { name: 'Hassan Al-Mansour', nationId: 'IR', archetype: 'IDEOLOGICAL_TRUE_BELIEVER', ageYears: 72, yearsInPower: 20, loyaltyBase: 'Popular', domesticApprovalScore: 70, personalRiskTolerance: 85, paranoidModifier: 60, ideologyStrength: 95, ambitionScore: 60, legacyWeight: 75, decisionLatencyTicks: 3, memoryCitedEvents: [] }, 0);
      mirror.sovereign_initAgent('IN', { powerOrientation: 'BALANCER', ideologicalPosture: 'PRAGMATIC_REALIST', economicDoctrine: 'FREE_MARKET', riskTolerance: 'CAUTIOUS', regionalAmbition: 'REGIONAL_DOMINANT' }, { name: 'Karan Sharma', nationId: 'IN', archetype: 'NATIONALIST_POPULIST', ageYears: 60, yearsInPower: 8, loyaltyBase: 'Popular', domesticApprovalScore: 75, personalRiskTolerance: 40, paranoidModifier: 40, ideologyStrength: 80, ambitionScore: 65, legacyWeight: 60, decisionLatencyTicks: 5, memoryCitedEvents: [] }, 0);
      mirror.sovereign_initAgent('IL', { powerOrientation: 'STATUS_QUO', ideologicalPosture: 'PRAGMATIC_REALIST', economicDoctrine: 'FREE_MARKET', riskTolerance: 'AGGRESSIVE', regionalAmbition: 'LOCAL' }, { name: 'Ari Levin', nationId: 'IL', archetype: 'MILITARY_HAWK', ageYears: 68, yearsInPower: 12, loyaltyBase: 'Military', domesticApprovalScore: 60, personalRiskTolerance: 75, paranoidModifier: 50, ideologyStrength: 40, ambitionScore: 50, legacyWeight: 70, decisionLatencyTicks: 2, memoryCitedEvents: [] }, 0);
      mirror.sovereign_initAgent('FR', { powerOrientation: 'BALANCER', ideologicalPosture: 'LIBERAL_DEMOCRATIC', economicDoctrine: 'FREE_MARKET', riskTolerance: 'CALCULATED', regionalAmbition: 'REGIONAL_PLAYER' }, { name: 'Aurelie Macron', nationId: 'FR', archetype: 'PRAGMATIC_TECHNOCRAT', ageYears: 55, yearsInPower: 6, loyaltyBase: 'Popular', domesticApprovalScore: 55, personalRiskTolerance: 45, paranoidModifier: 20, ideologyStrength: 30, ambitionScore: 70, legacyWeight: 60, decisionLatencyTicks: 4, memoryCitedEvents: [] }, 0);
      mirror.sovereign_initAgent('GB', { powerOrientation: 'STATUS_QUO', ideologicalPosture: 'LIBERAL_DEMOCRATIC', economicDoctrine: 'FREE_MARKET', riskTolerance: 'CAUTIOUS', regionalAmbition: 'LOCAL' }, { name: 'Arthur Pendelton', nationId: 'GB', archetype: 'CAUTIOUS_INSTITUTIONALIST', ageYears: 58, yearsInPower: 4, loyaltyBase: 'Party', domesticApprovalScore: 52, personalRiskTolerance: 30, paranoidModifier: 15, ideologyStrength: 40, ambitionScore: 40, legacyWeight: 50, decisionLatencyTicks: 5, memoryCitedEvents: [] }, 0);
    }, 100);

    set({
      countries: initialCountries,
      world: initialCanonical,
      activeStrikes: [],
      commodityMarkets: Object.keys(COMMODITY_BASELINES).map((key) => {
        const baseline = COMMODITY_BASELINES[key as keyof typeof COMMODITY_BASELINES];
        return {
          type: key as any,
          spotPriceUSD: baseline.base,
          baselinePrice: baseline.base,
          volatilityIndex: baseline.volatility,
          supplyShockActive: false,
          embargoed: false,
          embargoedBy: [],
          priceHistory: [baseline.base],
        };
      }),
      activeArmsDeals: [],
      globalThreatLevel: 'GREEN',
      nuclearExchangeOccurred: false,
      globalEventLog: [
        { tick: 0, text: 'Sovereign Command Simulator systems reset. Stand by for directive input.', severity: 'SYSTEM' }
      ],
      currentTick: 0,
      scheduledConsequences: [],
      recentResolvedConsequences: [],
      aiOperationsLog: [
        {
          tick: -12,
          countryId: 'RU',
          countryName: 'Russia',
          action: 'FSB Cyber Infiltration',
          targetCountryId: 'US',
          targetCountryName: 'United States',
          description: 'Breached command communications targeting classified nuclear submarine coordinates in the North Sea.',
          secrecyScore: 88,
          impactScore: 65,
        },
        {
          tick: -8,
          countryId: 'CN',
          countryName: 'China',
          action: 'Industrial Espionage',
          targetCountryId: 'US',
          targetCountryName: 'United States',
          description: 'Acquired advanced semiconductor fabrication blueprint schemas using front commercial logistics corporations.',
          secrecyScore: 92,
          impactScore: 78,
        },
        {
          tick: -5,
          countryId: 'IR',
          countryName: 'Iran',
          action: 'Proxy Centrifuges Funding',
          targetCountryId: 'KP',
          targetCountryName: 'North Korea',
          description: 'Financed raw military centrifuge parts shipment undetected via custom registered maritime container vessels.',
          secrecyScore: 85,
          impactScore: 70,
        }
      ],
    });
  },

  registerConsequenceChain: (actionType, context) => set(produce((draft: WorldState & WorldStoreActions) => {
    ConsequenceEngine.register(actionType, context, draft);
  })),

  enqueueConsequence: (consequence) => set(produce((draft: WorldState & WorldStoreActions) => {
    if (!draft.scheduledConsequences) draft.scheduledConsequences = [];
    draft.scheduledConsequences.push(consequence);
  })),

  resolveScheduledConsequence: (id) => set(produce((draft: WorldState & WorldStoreActions) => {
    if (!draft.scheduledConsequences) draft.scheduledConsequences = [];
    const c = draft.scheduledConsequences.find((x) => x.id === id);
    if (c) c.resolved = true;
  })),

  tickConsequences: (currentTick) => set(produce((draft: WorldState & WorldStoreActions) => {
    ConsequenceEngine.tick(currentTick, draft);
  })),

  clearExpiredHistory: () => set(produce((draft: WorldState & WorldStoreActions) => {
    draft.recentResolvedConsequences = [];
  })),

  setWorldBuilderConfig: (config) => set(produce((draft: WorldState & WorldStoreActions) => {
    draft.worldBuilderConfig = config;
    syncBuilderConfigToCountries(draft);
  })),

  updateWorldBuilderCountryConfig: (countryId, config) => set(produce((draft: WorldState & WorldStoreActions) => {
    if (!draft.worldBuilderConfig) {
      draft.worldBuilderConfig = getInitialWorldBuilderConfig();
    }
    if (draft.worldBuilderConfig[countryId]) {
      draft.worldBuilderConfig[countryId] = {
        ...draft.worldBuilderConfig[countryId],
        ...config
      };
    }
    syncBuilderConfigToCountries(draft);
  })),

  resetWorldBuilderConfig: () => set(produce((draft: WorldState & WorldStoreActions) => {
    draft.worldBuilderConfig = getInitialWorldBuilderConfig();
    syncBuilderConfigToCountries(draft);
  })),

  applyWorldBuilderConfig: (playerCountryId) => set(produce((draft: WorldState & WorldStoreActions) => {
    if (!draft.worldBuilderConfig) return;
    syncBuilderConfigToCountries(draft);
  })),
}));
