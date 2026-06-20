import { create } from 'zustand';
import { produce } from 'immer';
import { ArmsDeal, CommodityType, Econ_NationProfile, Econ_Sector } from '../types';
import { useWorldStore } from './worldStore';
import { usePlayerStore } from './playerStore';
import { useMirrorStore } from './mirrorStore';

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
}

interface EconomyStoreActions {
  buyFutures: (commodity: CommodityType, amountB: number, costPerUnit: number) => boolean;
  shortCommodity: (commodity: CommodityType, amountB: number, costPerUnit: number) => boolean;
  addArmsDeal: (deal: ArmsDeal) => void;
  imposeSanction: (sourceId: string, targetId: string) => void;
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

  buyFutures: (commodity, amountB, costPerUnit) => {
    const playerCash = usePlayerStore.getState().cashB;
    if (playerCash < amountB) return false;

    // Deduct cash from player store
    usePlayerStore.setState((state) => ({ cashB: state.cashB - amountB }));
    usePlayerStore.getState().syncCashToCountry();

    set(produce((draft) => {
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

    set(produce((draft) => {
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
    set(produce((draft) => {
      const exists = draft.activeSanctions.some((s) => s.source === sourceId && s.target === targetId);
      if (!exists) {
        draft.activeSanctions.push({ source: sourceId, target: targetId });
      }
    }));
    useWorldStore.getState().updateCountry(targetId, (c) => {
      if (!c.economic.sanctionedBy.includes(sourceId)) {
        c.economic.sanctionedBy.push(sourceId);
      }
    });
    useWorldStore.getState().registerConsequenceChain('IMPOSE_SANCTIONS', { sourceCountryId: sourceId, targetCountryId: targetId });
    if (sourceId === usePlayerStore.getState().countryId) {
      useMirrorStore.getState().recordPlayerAction('SANCTIONS', 15, useWorldStore.getState().currentTick);
    }
    useWorldStore.getState().addGlobalEvent(`Sanctions: ${sourceId} imposes strict trade embargo on all imports/exports with ${targetId}.`, 'WARNING');
  },

  removeSanction: (sourceId, targetId) => {
    set(produce((draft) => {
      draft.activeSanctions = draft.activeSanctions.filter((s) => !(s.source === sourceId && s.target === targetId));
    }));
    useWorldStore.getState().updateCountry(targetId, (c) => {
      c.economic.sanctionedBy = c.economic.sanctionedBy.filter((id) => id !== sourceId);
    });
    useWorldStore.getState().addGlobalEvent(`Diplomacy: ${sourceId} eases sanctions against ${targetId}. Rebuilding commercial pipelines.`, 'INFO');
  },

  addLedgerEntry: (entry) => set(produce((draft) => {
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
    Object.keys(draft.econ_nations).forEach(nationId => {
      const nation = draft.econ_nations[nationId];
      if (!nation) return;

      // Base degradation recovery
      Object.keys(nation.currentSectorHealth).forEach(sector => {
        const s = sector as Econ_Sector;
        if (nation.currentSectorHealth[s] < 100) {
          nation.currentSectorHealth[s] = Math.min(100, nation.currentSectorHealth[s] + (0.5 * (1 + nation.adaptationRate / 100)));
        }
      });

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
        // Implicitly could use useConsequenceStore.getState().triggerBlowback(nationId, 50, 'FAMINE');
        // using world event since consequenceStore might not export it or be imported.
      }

      // Check for reserve depletion
      if (nation.reserveDepletionRatePerTick > 0) {
         nation.currencyReserveUSD -= nation.reserveDepletionRatePerTick;
      }
      
      nation.lastUpdatedTick = currentTick;
    });
  })),
}));
