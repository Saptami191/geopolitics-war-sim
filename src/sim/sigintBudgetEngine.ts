import { useWorldStore } from '../store/worldStore';

import { usePlayerStore } from '../store/playerStore';

export interface SIGINTChannel {
  id: string;
  name: string;
  collectionType: 'diplomatic' | 'military' | 'commercial' | 'cyber' | 'imagery' | 'telecom';
  budgetCost: number;
  visibilityGain: number;
  discoveryRiskPerTick: number;
  active: boolean;
}

export interface SIGINTBudgetAllocationItem {
  channelId: string;
  fundingRatio: number;
  visibilityContribution: number;
}
export type SIGINTBudgetAllocation = SIGINTBudgetAllocationItem[];

export interface SIGINTStateSubset {
  channels: SIGINTChannel[];
  budgetAllocation: SIGINTBudgetAllocation;
}

/**
 * 6 fully written SIGINT channel records.
 * These represent massive, distinct collection architectures mirroring ECHELON, KEYHOLE, etc.
 * Real names, capabilities, and upkeep constraints.
 */
export const SIGINT_CHANNELS: SIGINTChannel[] = [
  {
    id: 'CH_ECHELON_V2',
    name: 'ECHELON V2 GLOBAL ARRAY',
    collectionType: 'diplomatic',
    budgetCost: 450,
    visibilityGain: 35,
    discoveryRiskPerTick: 0.02,
    active: true
  },
  {
    id: 'CH_KEYHOLE_OPTICAL',
    name: 'KEYHOLE-class OPTICAL (KH-11)',
    collectionType: 'imagery',
    budgetCost: 850,
    visibilityGain: 55,
    discoveryRiskPerTick: 0.01,
    active: true
  },
  {
    id: 'CH_TURMOIL_ACCESS',
    name: 'TURMOIL PASSIVE TAP',
    collectionType: 'telecom',
    budgetCost: 320,
    visibilityGain: 28,
    discoveryRiskPerTick: 0.05,
    active: true
  },
  {
    id: 'CH_OLYMPIC_GAMES',
    name: 'STUXNET/OLYMPIC APPARATUS',
    collectionType: 'cyber',
    budgetCost: 600,
    visibilityGain: 40,
    discoveryRiskPerTick: 0.08,
    active: true
  },
  {
    id: 'CH_BULLRUN_DECRYPT',
    name: 'BULLRUN CRYPTO-BYPASS',
    collectionType: 'commercial',
    budgetCost: 280,
    visibilityGain: 20,
    discoveryRiskPerTick: 0.03,
    active: true
  },
  {
    id: 'CH_MYSTIC_VOICE',
    name: 'MYSTIC VOICE ARCHIVE',
    collectionType: 'military',
    budgetCost: 550,
    visibilityGain: 45,
    discoveryRiskPerTick: 0.07,
    active: true
  }
];

/**
 * Allocates a fixed intelligence budget across available collection channels.
 * Prioritizes high visibility-to-cost ratio channels automatically.
 * Partial funding is applied if residual budget is insufficient for full upkeep.
 * 
 * @param budget The available monetary or resource budget.
 * @param channels Array of available SIGINT channels to fund.
 * @returns Array detailing how funds were distributed and resultant visibility.
 */
export function allocateSIGINTBudget(budget: number, channels: SIGINTChannel[]): SIGINTBudgetAllocation {
  // Defensive clone to avoid mutating input references
  const sortedChannels = [...channels].sort((a, b) => {
    const ratioA = a.visibilityGain / a.budgetCost;
    const ratioB = b.visibilityGain / b.budgetCost;
    return ratioB - ratioA; // Descending
  });

  const allocation: SIGINTBudgetAllocationItem[] = [];
  let remainingBudget = budget;

  for (const channel of sortedChannels) {
    if (!channel.active) {
      allocation.push({
        channelId: channel.id,
        fundingRatio: 0,
        visibilityContribution: 0
      });
      continue;
    }

    if (remainingBudget >= channel.budgetCost) {
      // Fully fund
      allocation.push({
        channelId: channel.id,
        fundingRatio: 1.0,
        visibilityContribution: channel.visibilityGain
      });
      remainingBudget -= channel.budgetCost;
    } else if (remainingBudget > 0) {
      // Partially fund
      const ratio = remainingBudget / channel.budgetCost;
      allocation.push({
        channelId: channel.id,
        fundingRatio: ratio,
        visibilityContribution: channel.visibilityGain * ratio
      });
      remainingBudget = 0;
    } else {
      // Unfunded
      allocation.push({
        channelId: channel.id,
        fundingRatio: 0,
        visibilityContribution: 0
      });
    }
  }

  return allocation;
}

/**
 * Computes the aggregate signals visibility against a specific target nation
 * based on the current funding allocation and structural adjacency bonuses.
 * 
 * @param allocation Current budget distribution matrix.
 * @param targetNationId ISO-3 identifier for the target nation.
 * @param channels Full channel registry definitions.
 * @returns number 0-100 indicating aggregate SIGINT visibility.
 */
export function computeVisibilityFromAllocation(
  allocation: SIGINTBudgetAllocation,
  targetNationId: string,
  channels: SIGINTChannel[]
): number {
  let baseVisibility = 0;

  for (const alloc of allocation) {
    baseVisibility += alloc.visibilityContribution;
  }

  const worldState = useWorldStore.getState();
  const targetData = worldState.countries[targetNationId];
  const playerNationId = usePlayerStore.getState().countryId || 'US';
  const playerData = worldState.countries[playerNationId];

  // Adjacency bonus: if the target is a border nation, collection is structurally easier
  // due to line-of-sight RF intercepts and terrestrial cable taps.
  if (targetData && playerData) {
    const isTradingPartner = (playerData.tradePartners ?? []).includes(targetNationId) || (targetData.tradePartners ?? []).includes(playerNationId);
    if (isTradingPartner) {
      baseVisibility += 8;
    }
  }

  return Math.max(0, Math.min(100, baseVisibility));
}

/**
 * Processes the mechanical decay of intelligence assets that are underfunded.
 * If funding ratio drops below 0.1 (10%), visibility degrades incrementally.
 * 
 * @param sigintState The active SIGINT budget state slice.
 * @returns A structurally modified clone with updated parameters.
 */
export function processBudgetDecayTick<T extends SIGINTStateSubset>(sigintState: T): T {
  const result: T = { ...sigintState };
  result.channels = result.channels.map(ch => ({...ch}));

  for (const alloc of result.budgetAllocation) {
    if (alloc.fundingRatio < 0.1) {
      // Find the corresponding channel definition and decay it
      const channelRef = result.channels.find(c => c.id === alloc.channelId);
      if (channelRef) {
        const decayAmount = channelRef.visibilityGain * 0.05;
        channelRef.visibilityGain = Math.max(0, channelRef.visibilityGain - decayAmount);

        // Notify command if decay is structurally significant
        if (decayAmount > 10) {
           useWorldStore.getState().applyTickDelta((draft) => {
             draft.globalEventLog.unshift({
               tick: draft.currentTick,
               text: `SIGINT WARNING: [${channelRef.name}] experiencing critical visibility decay due to lack of operational funding.`,
               severity: 'WARNING'
             });
           });
        }
      }
    }
  }

  return result;
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
