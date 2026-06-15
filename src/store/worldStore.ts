import { create } from 'zustand';
import { produce } from 'immer';
import { WorldState, Country, BallisticStrike, CommodityMarket, ArmsDeal, ThreatLevel, LeaderPersonality, MajorActionType, ScheduledConsequence, WorldConfig, CountryStartConfig } from '../types';
import { INITIAL_COUNTRIES } from '../data/countries';
import { generateInitialCanonicalWorld, advanceCanonicalWorldTick } from '../utils/canonicalGenerator';
import { COMMODITY_BASELINES } from '../constants';
import { useBlackMarketStore } from './blackMarketStore';
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
