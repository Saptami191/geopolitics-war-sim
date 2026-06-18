import { create } from 'zustand';
import { LeaderEmotionalState } from './leaderEmotionStore';

export interface NationMemoryEntry {
  id: string;
  nationId: string;
  tick: number;
  type: 'STRIKE' | 'SANCTION' | 'COVERT_OP' | 'DIPLOMACY' | 
        'ALLIANCE_OFFER' | 'THREAT' | 'CONCESSION' | 'BETRAYAL' | 
        'AID' | 'INTEL_EXPOSURE';
  description: string;
  playerInitiated: boolean;
  emotionalImpact: Partial<LeaderEmotionalState>;
  resentmentDelta: number;
  trustDelta: number;
  isForgivenAt?: number;
}

interface LeaderMemoryStoreState {
  nationMemories: Record<string, NationMemoryEntry[]>;
}

interface LeaderMemoryStoreActions {
  addMemory: (entry: Omit<NationMemoryEntry, 'id'>) => void;
  getMemoryWeight: (nationId: string) => number;
  getTrustBalance: (nationId: string) => number;
  forgiveMemories: (nationId: string, currentTick: number) => void;
}

export const useLeaderMemoryStore = create<LeaderMemoryStoreState & LeaderMemoryStoreActions>((set, get) => ({
  nationMemories: {},

  addMemory: (entry) => set((state) => {
    const id = `MEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const current = state.nationMemories[entry.nationId] || [];
    return {
      nationMemories: {
        ...state.nationMemories,
        [entry.nationId]: [{ ...entry, id }, ...current].slice(0, 50) // keep last 50
      }
    };
  }),

  getMemoryWeight: (nationId) => {
    const mems = get().nationMemories[nationId] || [];
    let sum = 0;
    // basic decay model based on index... newer memories hurt more
    mems.forEach((m, idx) => {
      if (!m.isForgivenAt) {
        sum += m.resentmentDelta * Math.max(0.1, 1 - (idx * 0.05));
      }
    });
    return Math.min(100, Math.max(0, Math.round(sum)));
  },

  getTrustBalance: (nationId) => {
    const mems = get().nationMemories[nationId] || [];
    let sum = 0;
    mems.forEach((m, idx) => {
      sum += m.trustDelta * Math.max(0.1, 1 - (idx * 0.05));
    });
    return Math.min(100, Math.max(0, Math.round(sum)));
  },

  forgiveMemories: (nationId, currentTick) => set((state) => {
    const current = state.nationMemories[nationId] || [];
    const forgiven = current.map(m => (!m.isForgivenAt && m.resentmentDelta > 0) ? { ...m, isForgivenAt: currentTick } : m);
    return {
      nationMemories: {
        ...state.nationMemories,
        [nationId]: forgiven
      }
    };
  })
}));
