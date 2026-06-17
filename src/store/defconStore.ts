import { create } from 'zustand';
import { audio } from '../utils/audio';
import { PersonaId, DefconTransitionLog } from '../types/defconPersona';
import { getDefaultPersona } from '../config/defconRegistry';
import { useFxStore } from './fxStore';

export type DefconLevel = 5 | 4 | 3 | 2 | 1;

export interface DefconPalette {
  primary: string;
  secondary: string;
  border: string;
  panelBg: string;
  glow: string;
  alertText: string;
  alertColor: string;
  // New visual fx parameters
  scanlineOpacity: string;
  noiseIntensity: string;
  pulseSpeed: string;
  vignetteStrength: string;
  flickerFreq: string;
  accent: string;
}

export const DEFCON_PALETTES: Record<DefconLevel, DefconPalette> = {
  5: {
    primary: '#00ff44', // standard phosphor green
    secondary: '#ffb300',
    border: '#1a5c1a',
    panelBg: '#050a05',
    glow: '0 0 6px rgba(0,255,68,0.8)',
    alertText: 'PEACETIME',
    alertColor: '#00ff44',
    scanlineOpacity: '0',
    noiseIntensity: '0',
    pulseSpeed: '0s',
    vignetteStrength: '0',
    flickerFreq: 'none',
    accent: '#00ff44'
  },
  4: {
    primary: '#00ff44',
    secondary: '#ffc107',
    border: '#2a6c2a',
    panelBg: '#060c05',
    glow: '0 0 6px rgba(0,255,68,0.8), 0 0 20px rgba(255,193,7,0.1)',
    alertText: 'WATCH',
    alertColor: '#ffc107',
    scanlineOpacity: '0.04',
    noiseIntensity: '0.02',
    pulseSpeed: '4s',
    vignetteStrength: '0.1',
    flickerFreq: 'slow',
    accent: '#ffc107'
  },
  3: {
    primary: '#ffb300', // amber takes over as primary
    secondary: '#ff6b00',
    border: '#5c3a00',
    panelBg: '#0a0800',
    glow: '0 0 8px rgba(255,179,0,0.9)',
    alertText: 'ELEVATED',
    alertColor: '#ffb300',
    scanlineOpacity: '0.08',
    noiseIntensity: '0.05',
    pulseSpeed: '2s',
    vignetteStrength: '0.25',
    flickerFreq: 'medium',
    accent: '#ffb300'
  },
  2: {
    primary: '#ff6b00', // deep orange
    secondary: '#ff2244',
    border: '#5c1500',
    panelBg: '#0d0300',
    glow: '0 0 10px rgba(255,107,0,0.9), 0 0 30px rgba(255,34,68,0.3)',
    alertText: 'ARMED',
    alertColor: '#ff6b00',
    scanlineOpacity: '0.12',
    noiseIntensity: '0.10',
    pulseSpeed: '1s',
    vignetteStrength: '0.45',
    flickerFreq: 'fast',
    accent: '#ff6b00'
  },
  1: {
    primary: '#ff2244', // full red
    secondary: '#ff0000',
    border: '#5c0010',
    panelBg: '#100000',
    glow: '0 0 12px rgba(255,34,68,1.0), 0 0 40px rgba(255,0,0,0.4)',
    alertText: 'NUCLEAR WAR IMMINENT',
    alertColor: '#ff2244',
    scanlineOpacity: '0.18',
    noiseIntensity: '0.20',
    pulseSpeed: '0.5s',
    vignetteStrength: '0.65',
    flickerFreq: 'extreme',
    accent: '#ff2244'
  },
};

export function applyDefconPalette(level: DefconLevel) {
  const palette = DEFCON_PALETTES[level];
  const root = document.documentElement;
  if (!root) return;

  root.style.setProperty('--color-primary', palette.primary);
  root.style.setProperty('--color-secondary', palette.secondary);
  root.style.setProperty('--border-mid', `1px solid ${palette.border}`);
  root.style.setProperty('--color-border', palette.border);
  root.style.setProperty('--bg-panel', palette.panelBg);
  root.style.setProperty('--glow-primary', palette.glow);

  // Set the 6 expanded CSS variables
  root.style.setProperty('--defcon-scanline-opacity', palette.scanlineOpacity);
  root.style.setProperty('--defcon-noise-intensity', palette.noiseIntensity);
  root.style.setProperty('--defcon-hud-pulse-speed', palette.pulseSpeed);
  root.style.setProperty('--defcon-vignette-strength', palette.vignetteStrength);
  root.style.setProperty('--defcon-flicker-freq', palette.flickerFreq);
  root.style.setProperty('--defcon-accent', palette.accent);

  // Set global CSS filter on document.body
  if (typeof document !== 'undefined' && document.body) {
    const body = document.body;
    
    // Remove any existing defcon classes
    Array.from(body.classList).forEach((cls) => {
      if (cls.startsWith('defcon-')) {
        body.classList.remove(cls);
      }
    });
    
    // Add the new class
    body.classList.add(`defcon-${level}`);

    // Set filters
    if (level === 5) {
      body.style.filter = 'none';
    } else if (level === 4) {
      body.style.filter = 'sepia(0.04) contrast(1.01)';
    } else if (level === 3) {
      body.style.filter = 'sepia(0.08) contrast(1.03) hue-rotate(8deg)';
    } else if (level === 2) {
      body.style.filter = 'sepia(0.14) saturate(1.1) contrast(1.06) hue-rotate(14deg)';
    } else if (level === 1) {
      body.style.filter = 'sepia(0.2) saturate(1.3) contrast(1.10) hue-rotate(20deg) brightness(0.96)';
    }
  }
}

interface DefconStoreActions {
  setDefconLevel: (level: DefconLevel, source: 'SYSTEM' | 'PLAYER' | 'SCENARIO', reason: string, currentTick: number) => void;
  setPersona: (personaId: PersonaId) => void;
  forcePersonaTransition: (newPersonaId: PersonaId, currentTick: number) => void;
  resetDefcon: () => void;
}

interface DefconStoreState {
  currentDefconLevel: DefconLevel;
  activePersona: PersonaId;
  transitionHistory: DefconTransitionLog[];
}

export const useDefconStore = create<DefconStoreState & DefconStoreActions>((set, get) => ({
  currentDefconLevel: 5,
  activePersona: 'ANALYST',
  transitionHistory: [],

  setDefconLevel: (level, source, reason, currentTick) => {
    const current = get().currentDefconLevel;
    if (current !== level) {
      
      const newLog: DefconTransitionLog = {
        id: `defcon_${Date.now()}`,
        tick: currentTick,
        fromLevel: current,
        toLevel: level,
        reason,
        source
      };

      set((state) => ({ 
        currentDefconLevel: level,
        transitionHistory: [newLog, ...state.transitionHistory]
      }));

      // Automatically upgrade persona if required
      const newDefaultPersona = getDefaultPersona(level);
      get().setPersona(newDefaultPersona);

      applyDefconPalette(level);
      
      // Fire synthesized harmony chord signature on DEFCON level transition
      audio.playDefconTransition(level);
      audio.updateAdaptiveScore(level);

      // Trigger cinematic FX in fxStore
      if (level < current) { // Escalating
        useFxStore.getState().triggerFx({
          type: 'DEFCON_ESCALATION',
          severity: level === 1 ? 'CATASTROPHIC' : level === 2 ? 'HIGH' : 'MEDIUM',
          triggerTick: currentTick,
          expiryTick: currentTick + 5,
          durationMs: level === 1 ? 3000 : 1500,
          payload: { fromLevel: current, toLevel: level, reason }
        });
      } else { // De-escalating
        useFxStore.getState().triggerFx({
          type: 'DEFCON_DEESCALATION',
          severity: 'LOW',
          triggerTick: currentTick,
          expiryTick: currentTick + 3,
          durationMs: 1200,
          payload: { fromLevel: current, toLevel: level, reason }
        });
      }
    }
  },

  setPersona: (personaId) => {
    set({ activePersona: personaId });
  },

  forcePersonaTransition: (newPersonaId, currentTick) => {
    const currentDefcon = get().currentDefconLevel;
    
    const newLog: DefconTransitionLog = {
      id: `persona_${Date.now()}`,
      tick: currentTick,
      fromLevel: currentDefcon,
      toLevel: currentDefcon,
      reason: `Manual elevate: Authority established as ${newPersonaId}`,
      source: 'PLAYER'
    };

    set((state) => ({
      activePersona: newPersonaId,
      transitionHistory: [newLog, ...state.transitionHistory]
    }));

    // Trigger cinematic FX in fxStore
    useFxStore.getState().triggerFx({
      type: 'PERSONA_PROMOTED',
      severity: 'LOW',
      triggerTick: currentTick,
      expiryTick: currentTick + 3,
      durationMs: 2500,
      payload: { personaId: newPersonaId }
    });

    audio.resume();
    audio.sfxIntelChime();
    audio.playPhaseReveal();
  },

  resetDefcon: () => {
    set({ 
      currentDefconLevel: 5, 
      activePersona: 'ANALYST',
      transitionHistory: []
    });
    applyDefconPalette(5);
    audio.playDefconTransition(5);
    audio.updateAdaptiveScore(5);
  },
}));

// Automatic client-side synchronization subscription
if (typeof window !== 'undefined') {
  // Synchronous initial call
  setTimeout(() => {
    applyDefconPalette(useDefconStore.getState().currentDefconLevel);
  }, 0);

  useDefconStore.subscribe((state) => {
    applyDefconPalette(state.currentDefconLevel);
  });
}

export default useDefconStore;
