import { create } from 'zustand';

export type FxEventType =
  | 'NUCLEAR_DETONATION'
  | 'MISSILE_LAUNCH'
  | 'MISSILE_INTERCEPT'
  | 'COUP_SUCCESS'
  | 'COUP_ATTEMPT_FAILED'
  | 'REGIME_CHANGE'
  | 'CEASEFIRE_SIGNED'
  | 'PEACE_TREATY_RATIFIED'
  | 'WAR_DECLARED'
  | 'ALLIANCE_FORMED'
  | 'ALLIANCE_BROKEN'
  | 'SANCTIONS_ESCALATION'
  | 'MARKET_CRASH'
  | 'ECONOMIC_COLLAPSE'
  | 'CYBER_BLACKOUT'
  | 'CYBER_ATTACK'
  | 'UN_RESOLUTION_PASSED'
  | 'UN_VETO_CAST'
  | 'DEFCON_ESCALATION'
  | 'DEFCON_DEESCALATION'
  | 'PERSONA_PROMOTED'
  | 'PERSONA_DEMOTED'
  | 'SAT_DESTROYED'
  | 'HAARP_ACTIVATED'
  | 'BLACK_MARKET_BUST'
  | 'NUCLEAR_DETERRENCE_ACHIEVED'
  | 'OPERATIVE_BURNED'
  | 'REGIME_PRESSURE_CRITICAL';

export interface FxEvent {
  id: string;
  type: FxEventType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CATASTROPHIC';
  triggerTick: number;
  expiryTick: number;
  durationMs: number;
  sourceCountryId?: string;
  targetCountryId?: string;
  payload: Record<string, any>;
  consumed: boolean;
}

export interface FxStoreState {
  activeFx: FxEvent[];
  fxHistory: FxEvent[];
  globalScreenShakeIntensity: number;
  globalGlitchIntensity: number;
  nuclearFlashActive: boolean;
  coupGlitchActive: boolean;
  ceasefireGlowActive: boolean;
}

export interface FxStoreActions {
  triggerFx: (input: Omit<FxEvent, 'id' | 'consumed'>) => void;
  consumeFx: (id: string) => void;
  clearExpiredFx: (currentTick: number) => void;
  decayFxIntensities: () => void;
  resetFlags: () => void;
  clearAllFx: () => void;
}

export const useFxStore = create<FxStoreState & FxStoreActions>((set, get) => ({
  activeFx: [],
  fxHistory: [],
  globalScreenShakeIntensity: 0.0,
  globalGlitchIntensity: 0.0,
  nuclearFlashActive: false,
  coupGlitchActive: false,
  ceasefireGlowActive: false,

  triggerFx: (input) => {
    const id = `fx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newEvent: FxEvent = {
      ...input,
      id,
      consumed: false,
    };

    set((state) => {
      // Cap active Fx at 10 concurrent
      const updatedActive = [...state.activeFx, newEvent].slice(-10);
      // Cap fx history at 50
      const updatedHistory = [newEvent, ...state.fxHistory].slice(0, 50);

      // Establish dynamic intensity updates depending on type
      let shakeIntensity = state.globalScreenShakeIntensity;
      let glitchIntensity = state.globalGlitchIntensity;
      let nukeFlash = state.nuclearFlashActive;
      let coupGlitch = state.coupGlitchActive;
      let ceasefireGlow = state.ceasefireGlowActive;

      if (newEvent.type === 'NUCLEAR_DETONATION') {
        nukeFlash = true;
        shakeIntensity = 1.0;
      } else if (newEvent.type === 'COUP_SUCCESS' || newEvent.type === 'REGIME_CHANGE') {
        coupGlitch = true;
        glitchIntensity = 0.8;
      } else if (newEvent.type === 'CEASEFIRE_SIGNED' || newEvent.type === 'PEACE_TREATY_RATIFIED') {
        ceasefireGlow = true;
      } else if (newEvent.type === 'DEFCON_ESCALATION' || newEvent.type === 'WAR_DECLARED') {
        shakeIntensity = Math.max(shakeIntensity, 0.6);
      }

      return {
        activeFx: updatedActive,
        fxHistory: updatedHistory,
        globalScreenShakeIntensity: shakeIntensity,
        globalGlitchIntensity: glitchIntensity,
        nuclearFlashActive: nukeFlash,
        coupGlitchActive: coupGlitch,
        ceasefireGlowActive: ceasefireGlow,
      };
    });

    // Auto-consume / remove after durationMs
    setTimeout(() => {
      get().consumeFx(id);
    }, newEvent.durationMs);
  },

  consumeFx: (id) => {
    set((state) => {
      const updatedActive = state.activeFx.map((fx) =>
        fx.id === id ? { ...fx, consumed: true } : fx
      );

      // Check if some flags should be deactivated when events get consumed
      const activeTypes = updatedActive.filter((fx) => !fx.consumed).map((fx) => fx.type);
      
      const nukeFlash = activeTypes.includes('NUCLEAR_DETONATION');
      const coupGlitch = activeTypes.includes('COUP_SUCCESS') || activeTypes.includes('REGIME_CHANGE');
      const ceasefireGlow = activeTypes.includes('CEASEFIRE_SIGNED') || activeTypes.includes('PEACE_TREATY_RATIFIED');

      return {
        activeFx: updatedActive,
        nuclearFlashActive: nukeFlash,
        coupGlitchActive: coupGlitch,
        ceasefireGlowActive: ceasefireGlow,
      };
    });
  },

  clearExpiredFx: (currentTick) => {
    set((state) => ({
      activeFx: state.activeFx.filter(
        (fx) => !(fx.expiryTick < currentTick && fx.consumed)
      ),
    }));
  },

  decayFxIntensities: () => {
    set((state) => {
      const shakeDecayed = Math.max(0, state.globalScreenShakeIntensity - 0.05);
      const glitchDecayed = Math.max(0, state.globalGlitchIntensity - 0.05);
      
      return {
        globalScreenShakeIntensity: shakeDecayed,
        globalGlitchIntensity: glitchDecayed,
      };
    });
  },

  resetFlags: () => {
    set({
      nuclearFlashActive: false,
      coupGlitchActive: false,
      ceasefireGlowActive: false,
    });
  },

  clearAllFx: () => {
    set({
      activeFx: [],
      nuclearFlashActive: false,
      coupGlitchActive: false,
      ceasefireGlowActive: false,
      globalScreenShakeIntensity: 0.0,
      globalGlitchIntensity: 0.0,
    });
  },
}));
