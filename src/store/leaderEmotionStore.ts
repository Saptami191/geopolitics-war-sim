import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LeaderEmotionalState {
  humiliation: number;
  fear: number;
  emboldenment: number;
  anger: number;
  anxiety: number;
  pride: number;
  resentment: number;
  vindication: number;
  desperation: number;
  overconfidence: number;
  fatigue: number;
  relief: number;
  paranoiaSpike: number;
  moralInjury: number;
  shame: number;
}

interface LeaderEmotionStoreState {
  leaderEmotions: Record<string, LeaderEmotionalState>;
}

interface LeaderEmotionStoreActions {
  updateEmotion: (countryId: string, dimension: keyof LeaderEmotionalState, delta: number) => void;
  getEmotion: (countryId: string) => LeaderEmotionalState;
  tickEmotions: (currentTick: number) => void;
  initializeLeader: (countryId: string, baseState?: Partial<LeaderEmotionalState>) => void;
}

const defaultEmotionState = (): LeaderEmotionalState => ({
  humiliation: 0, fear: 0, emboldenment: 0, anger: 0, anxiety: 0,
  pride: 0, resentment: 0, vindication: 0, desperation: 0, overconfidence: 0,
  fatigue: 0, relief: 0, paranoiaSpike: 0, moralInjury: 0, shame: 0
});

export const useLeaderEmotionStore = create<LeaderEmotionStoreState & LeaderEmotionStoreActions>()(
  persist(
    (set, get) => ({
      leaderEmotions: {},
      
      initializeLeader: (countryId, baseState) => set((state) => ({
        leaderEmotions: {
          ...state.leaderEmotions,
          [countryId]: { ...defaultEmotionState(), ...baseState }
        }
      })),

      updateEmotion: (countryId, dimension, delta) => set((state) => {
        const current = state.leaderEmotions[countryId] || defaultEmotionState();
        return {
          leaderEmotions: {
            ...state.leaderEmotions,
            [countryId]: {
              ...current,
              [dimension]: Math.max(0, Math.min(100, current[dimension] + delta))
            }
          }
        };
      }),

      getEmotion: (countryId) => {
        return get().leaderEmotions[countryId] || defaultEmotionState();
      },

      tickEmotions: (currentTick) => set((state) => {
        // emotions naturally drift toward 0 over time
        // this keeps them from perpetually stacking unless periodically reinforced
        const nextEmotions: Record<string, LeaderEmotionalState> = {};
        for (const [countryId, emotions] of Object.entries(state.leaderEmotions)) {
          const decayed = { ...emotions };
          (Object.keys(decayed) as Array<keyof LeaderEmotionalState>).forEach(key => {
            if (decayed[key] > 0) {
              decayed[key] = Math.max(0, decayed[key] - 0.2); // slowly decay
            }
          });
          nextEmotions[countryId] = decayed;
        }
        return { leaderEmotions: nextEmotions };
      })
    }),
    {
      name: 'sc-leader-emotion-store',
    }
  )
);
