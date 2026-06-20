import { Mode_ToneMode, ToneMode_Profile } from '../types';

export const TONE_MODE_PROFILES: Record<Mode_ToneMode, ToneMode_Profile> = {
  REALISM: {
    mode: 'REALISM',
    label: 'REALISM',
    description: 'Historical plausibility governs all outcomes. No dramatic probability floor. RNG variance minimal.',
    modifiers: { 
        INTEL_ACCURACY: 1.0, 
        PROBABILITY_VARIANCE: 0.1, 
        ESCALATION_SPEED: 1.0, 
        AI_AGENT_AGGRESSION: 0.8, 
        COVERT_OP_SUCCESS_FLOOR: 0.35, 
        ECONOMIC_SHOCK_MULTIPLIER: 1.0, 
        DIPLOMATIC_FRICTION: 0.5, 
        NUCLEAR_LAUNCH_THRESHOLD: 1, 
        ALTERNATE_EVENT_POOL: 0 
    },
    alternateHistoryEventPool: [],
    classificationVisual: 'border-green-500',
    uiPrefix: '[REAL]'
  },
  TECHNO_THRILLER: {
    mode: 'TECHNO_THRILLER',
    label: 'TECHNO-THRILLER',
    description: 'Probability curves shifted toward dramatic outcomes. Escalation faster. AI more aggressive.',
    modifiers: { 
        INTEL_ACCURACY: 0.85, 
        PROBABILITY_VARIANCE: 0.3, 
        ESCALATION_SPEED: 1.4, 
        AI_AGENT_AGGRESSION: 1.2, 
        COVERT_OP_SUCCESS_FLOOR: 0.45, 
        ECONOMIC_SHOCK_MULTIPLIER: 1.3, 
        DIPLOMATIC_FRICTION: 0.8, 
        NUCLEAR_LAUNCH_THRESHOLD: 2, 
        ALTERNATE_EVENT_POOL: 0 
    },
    alternateHistoryEventPool: [],
    classificationVisual: 'border-orange-500',
    uiPrefix: '[TTH]'
  },
  ALTERNATE_HISTORY: {
    mode: 'ALTERNATE_HISTORY',
    label: 'ALTERNATE HISTORY',
    description: 'Probability floor elevated. Dramatic and historically impossible events enabled. Maximum variance.',
    modifiers: { 
        INTEL_ACCURACY: 0.7, 
        PROBABILITY_VARIANCE: 0.5, 
        ESCALATION_SPEED: 1.8, 
        AI_AGENT_AGGRESSION: 1.5, 
        COVERT_OP_SUCCESS_FLOOR: 0.55, 
        ECONOMIC_SHOCK_MULTIPLIER: 1.8, 
        DIPLOMATIC_FRICTION: 1.2, 
        NUCLEAR_LAUNCH_THRESHOLD: 2, 
        ALTERNATE_EVENT_POOL: 1 
    },
    alternateHistoryEventPool: ['EVT_BERLIN_WALL_REDUX', 'EVT_CUBAN_CRISIS_REPRISE', 'EVT_SOVIET_REVIVAL', 'EVT_BALKANIZATION_CASCADE', 'EVT_PETRODOLLAR_COLLAPSE'],
    classificationVisual: 'border-purple-500',
    uiPrefix: '[ALT]'
  }
};
