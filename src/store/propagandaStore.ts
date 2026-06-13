import { create } from 'zustand';
import { produce } from 'immer';
import { useWorldStore } from './worldStore';

export interface MediaOperation {
  id: string;
  sourceCountryId: string;
  targetCountryId: string;
  spendPerTick: number; // in $B
  startTick: number;
  active: boolean;
  operationType: 'PROPAGANDA' | 'COUNTER_PROPAGANDA';
  narrativeDirection: 'DESTABILIZE' | 'STABILIZE' | 'PRO_PLAYER' | 'ANTI_PLAYER';
  effectivenessPerTick?: number;
  createdBy: 'PLAYER' | 'AI';
  headlineSeed?: string;
  runtimeTicks?: number; // track runtime
}

interface PropagandaStoreState {
  activeOperations: MediaOperation[];
  selectedTargetCountryId: string | null;
  selectedSpendPerTick: number;
}

interface PropagandaStoreActions {
  launchMediaOperation: (
    source: string,
    target: string,
    spend: number,
    direction: MediaOperation['narrativeDirection'],
    type: MediaOperation['operationType'],
    createdBy: 'PLAYER' | 'AI'
  ) => string;
  terminateMediaOperation: (id: string) => void;
  updateOperationsTickState: (
    updates: Record<string, { effectivenessPerTick: number; runtimeTicks: number }>,
    cancelIds: string[]
  ) => void;
  getOperationsByTarget: (countryId: string) => MediaOperation[];
  getOperationsBySource: (countryId: string) => MediaOperation[];
  getActiveOperationsForPlayer: () => MediaOperation[];
  setSelectedTargetCountryId: (id: string | null) => void;
  setSelectedSpendPerTick: (spend: number) => void;
  resetPropagandaStore: () => void;
}

export const usePropagandaStore = create<PropagandaStoreState & PropagandaStoreActions>((set, get) => ({
  activeOperations: [],
  selectedTargetCountryId: null,
  selectedSpendPerTick: 1.5, // defaults to 1.5 $B spend per tick

  launchMediaOperation: (source, target, spend, direction, type, createdBy) => {
    const currentTick = useWorldStore.getState().currentTick;
    const opId = `op_${createdBy.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Get target resistance to compute initial expected effectiveness for UI display
    const countries = useWorldStore.getState().countries;
    const targetCountry = countries[target];
    const resistance = targetCountry?.mediaResistance ?? 0.5;
    
    // Exact mandatory formula: eff = (spendPerTick * 0.1) * (1 - target.mediaResistance)
    const exactEff = (spend * 0.1) * (1 - resistance);

    const newOp: MediaOperation = {
      id: opId,
      sourceCountryId: source,
      targetCountryId: target,
      spendPerTick: spend,
      startTick: currentTick,
      active: true,
      operationType: type,
      narrativeDirection: direction,
      effectivenessPerTick: parseFloat(exactEff.toFixed(3)),
      createdBy: createdBy,
      runtimeTicks: 0,
    };

    set(
      produce((draft: PropagandaStoreState) => {
        draft.activeOperations.push(newOp);
      })
    );

    return opId;
  },

  terminateMediaOperation: (id) => {
    set(
      produce((draft: PropagandaStoreState) => {
        const op = draft.activeOperations.find((o) => o.id === id);
        if (op) {
          op.active = false;
        }
        draft.activeOperations = draft.activeOperations.filter((o) => o.id !== id);
      })
    );
  },

  updateOperationsTickState: (updates, cancelIds) => {
    set(
      produce((draft: PropagandaStoreState) => {
        // 1. Process regular tick status updates
        Object.entries(updates).forEach(([id, u]) => {
          const op = draft.activeOperations.find((o) => o.id === id);
          if (op) {
            op.effectivenessPerTick = u.effectivenessPerTick;
            op.runtimeTicks = u.runtimeTicks;
          }
        });

        // 2. Process cancellations
        if (cancelIds.length > 0) {
          draft.activeOperations.forEach((op) => {
            if (cancelIds.includes(op.id)) {
              op.active = false;
            }
          });
          draft.activeOperations = draft.activeOperations.filter((op) => !cancelIds.includes(op.id));
        }
      })
    );
  },

  getOperationsByTarget: (countryId) => {
    return get().activeOperations.filter((o) => o.targetCountryId === countryId && o.active);
  },

  getOperationsBySource: (countryId) => {
    return get().activeOperations.filter((o) => o.sourceCountryId === countryId && o.active);
  },

  getActiveOperationsForPlayer: () => {
    return get().activeOperations.filter((o) => o.createdBy === 'PLAYER' && o.active);
  },

  setSelectedTargetCountryId: (id) => set({ selectedTargetCountryId: id }),
  setSelectedSpendPerTick: (spend) => set({ selectedSpendPerTick: spend }),

  resetPropagandaStore: () => set({
    activeOperations: [],
    selectedTargetCountryId: null,
    selectedSpendPerTick: 1.5
  })
}));
