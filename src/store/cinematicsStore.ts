import { create } from 'zustand';
import { audio } from '../utils/audio';

export type CinematicSceneType =
  | 'SIGINT_BREAKTHROUGH'
  | 'DECEPTION_EXPOSED'
  | 'COLLECTION_COMPROMISED'
  | 'PATTERN_OF_LIFE_SHIFT'
  | 'SCENARIO_BOOT'           // Cold boot intro on first load
  | 'SCENARIO_START'        // When player starts a new scenario
  | 'PRESIDENTIAL_DAILY_BRIEF' // Session start / daily overview
  | 'DEFCON_1_LOCKDOWN'     // Full DEFCON 1 nuclear war protocols
  | 'NUCLEAR_EXCHANGE'      // Multiple strikes confirmed
  | 'NUCLEAR_AFTERMATH'     // Post-exchange epilogue
  | 'REGIME_CHANGE_SEQUENCE'// Country's government falls
  | 'COUP_NARRATIVE'        // Successful coup cinematic
  | 'CEASEFIRE_EPILOGUE'    // War ends, nations stand down
  | 'PEACE_TREATY_CEREMONY' // Full treaty ratification moment
  | 'SCANDAL_BREAKING'
  | 'SCANDAL_ESCALATION'
  | 'HEARING_TESTIMONY'
  | 'WHISTLEBLOWER_SURFACES'
  | 'POLITICAL_COLLAPSE'
  | 'INTERNATIONAL_CONDEMNATION'
  | 'ALLIANCE_SUMMIT'       // New bloc or pact formed
  | 'MARKET_CRASH_BROADCAST'// Economic collapse broadcast
  | 'CYBER_WAR_DECLARATION' // Full-scale cyber war begins
  | 'OPERATIVE_BURNED_REPORT'// Deep cover agent compromised
  | 'NUCLEAR_DETERRENCE_WIN' // MAD achieved, war prevented
  // PSYOP & INFLUENCE EFFECTS
  | 'NARRATIVE_GOES_MAINSTREAM'
  | 'BOTNET_EXPOSED'
  | 'KOMPROMAT_DETONATES'
  | 'DEEPFAKE_DEBUNKED'
  | 'PSYOP_EXPOSED'
  | 'CUTOUT_EXPOSED'
  | 'NARRATIVE_CRYSTALLIZED'
  // Existing 5.2 Effects
  // SOVEREIGN AI AGENT EFFECTS
  | 'SOVEREIGN_FIRST_AGENT_DECISION'
  | 'SOVEREIGN_NUCLEAR_SIGNAL'
  | 'SOVEREIGN_EMERGENT_CRISIS'
  | 'SOVEREIGN_PLAYER_OUTMANOEUVRED'
  | 'SOVEREIGN_LEADERSHIP_CRISIS'
  | 'SOVEREIGN_ALLIANCE_FRACTURE'
  | 'SOVEREIGN_BLOC_CONFRONTATION'
  | 'GAME_OVER_DEFEAT'      // Total collapse ending
  | 'GAME_OVER_VICTORY'     // Sovereign dominance achieved
  | 'MIRROR_AI_WARNING'     // AI Warning notification
  | 'LEADER_BREAKDOWN'      // Leader psychological breakdown
  | 'NATION_AGENDA_EXPOSED' // Hidden agenda exposed
  | 'MIRROR_AI_CONFRONTATION' // AI confronts player
  | 'COUP_EXECUTED'         // 4 phases: conspiracy revealed, troops moving, palace seized, new leader address to nation
  | 'COUP_FAILED'           // 3 phases: plotters arrested, target leader appears on state TV triumphant, mass purge begins
  | 'CIA_FIRST_OPERATION_LAUNCHED'
  | 'CIA_COUP_SUCCEEDED'
  | 'CIA_OPERATION_BLOWN'
  | 'CIA_ASSET_DOUBLED'
  | 'CIA_CATASTROPHIC_BLOWBACK'
  | 'CIA_OVERSIGHT_CRISIS'
  | 'CIA_OPERATIVE_KIA'
  | 'ELECTION_STOLEN'       // 3 phases: vote count manipulation, results announced, international condemnation
  | 'TARGETED_REMOVAL'      // 3 phases: covert op briefing, execution moment, aftermath and cover
  | 'BLOWBACK_CRISIS'       // 3 phases: media bombshell, diplomatic response, player must choose response type
  | 'OPPOSITION_COMPROMISED' // 2 phases: asset handler discovers compromise, urgent recall order
  | 'ELITE_DEFECTION'       // 2 phases: faction breaks publicly, regime visibly destabilized
  | 'CIVILIAN_CASUALTY_EVENT'
  | 'SHELL_COMPANY_SEIZED'
  | 'CARGO_INTERDICTION'
  | 'FINANCIAL_EXPOSURE'
  | 'FATF_BLACKLISTED'
  | 'HAWALA_NETWORK_BURNED'
  // Targeted Operations (Module 6.2 — BLACK LANTERN)
  | 'DOSSIER_COMPLETE'
  | 'METHOD_SELECTED'
  | 'ATTRIBUTION_ADVANCED'
  | 'OPERATION_SUCCESS'
  | 'OPERATION_EXPOSED'
  | 'CONSEQUENCE_CASCADE'
  // HUMINT MODULE (Module 6.3 - MIRROR VEIL)
  | 'SOURCE_RECRUITED'
  | 'SOURCE_TASKED'
  | 'DOUBLE_AGENT_EXPOSED'
  | 'DEFECTOR_EXFILTRATED'
  | 'SOURCE_BURNED'
  | 'DISCOVERY_CHAIN'
  | 'RECRUITMENT_BREAKTHROUGH'
  | 'HANDLER_BURNOUT'
  // DENIAL & DECEPTION MODULE (Module 6.4 - MIRROR SHROUD)
  | 'DEEP_DECEPTION_PLANTED'
  | 'DEEP_FALSE_FLAG_ACTIVATED'
  | 'DEEP_AMBIGUITY_ESCALATED'
  | 'DEEP_DECEPTION_EXPOSED'
  | 'DEEP_COUNTER_DECEPTION_BREAKTHROUGH'
  // COUNTER-PROLIFERATION MODULE (Module 6.5 - IRON VEIL)
  | 'NETWORK_DISCOVERED'
  | 'VERIFICATION_THRESHOLD_MET'
  | 'INTERDICTION_AUTHORIZED'
  | 'INTERDICTION_EXECUTED'
  | 'LEGAL_BLOWBACK_RAISED'
  | 'NETWORK_FRAGMENTED'
  // NUCLEAR CONTROL MODULE (Module 7.1 - IRON CATHEDRAL)
  | 'NUCLEAR_LAUNCH_AUTHORIZATION'
  | 'NUCLEAR_AUTHENTICATION'
  | 'NUCLEAR_OPTION_SELECTION'
  | 'NUCLEAR_DECISION_CLOCK'
  | 'NUCLEAR_LAUNCH_EXECUTION'
  | 'NUCLEAR_DETONATION_SEQUENCE'
  | 'NUCLEAR_TABOO_BREACH'
  | 'NC3_DEGRADED'
  | 'FALSE_ALARM_AVERTED'
  | 'DEAD_HAND_TRIGGERED'
  | 'ABSORB_AND_RESPOND_DECISION'
  | 'PERIMETER_ACTIVATION'
  | 'ADVERSARY_NUCLEAR_POSTURE_ESCALATION'
  | 'ADVERSARY_NUCLEAR_LAUNCH_DETECTED'
  // A2/AD AIR-SEA-SPACE LAYER (Module 7.3 - IRON UMBRELLA)
  | 'SATELLITE_DESTROYED'
  | 'GPS_DEGRADATION_ACTIVE'
  | 'CARRIER_UNDER_THREAT'
  | 'A2AD_UMBRELLA_SUPPRESSED'
  | 'ASAT_STRIKE_DETECTED'
  // SANCTIONS-1 (Economic Warfare - IRON LEDGER)
  | 'IRON_LEDGER_REGIME_IMPOSED'
  | 'IRON_LEDGER_TIER_FIVE'
  | 'IRON_LEDGER_COALITION_FRACTURE'
  | 'IRON_LEDGER_EVASION_NETWORK_MAJOR'
  | 'IRON_LEDGER_CURRENCY_CRISIS'
  | 'IRON_LEDGER_OBJECTIVE_ACHIEVED'
  | 'IRON_LEDGER_SECONDARY_SANCTIONS'
  // DIPLOMACY-1 (Diplomatic Deep Systems - IRON COVENANT)
  | 'IRON_COVENANT_TREATY_RATIFIED'
  | 'IRON_COVENANT_ARTICLE_5'
  | 'IRON_COVENANT_UNSC_VETO'
  | 'IRON_COVENANT_BLOC_FRACTURE'
  // CYBER-1 (Cyber Warfare - GHOST PROTOCOL)
  | 'GHOST_PROTOCOL_FIRST_OPERATION'
  | 'GHOST_PROTOCOL_EXECUTION'
  | 'GHOST_PROTOCOL_ATTRIBUTION'
  | 'GHOST_PROTOCOL_INFRASTRUCTURE_DESTROYED'
  | 'GHOST_PROTOCOL_ZERO_DAY_BURNED'
  | 'GHOST_PROTOCOL_SUCCESSFUL_IMPACT'
  | 'GHOST_PROTOCOL_APT_GROUP_IDENTIFIED'
  | 'GHOST_PROTOCOL_HACK_BACK_AUTHORITY';

export interface CinematicScene {
  id: string;
  type: CinematicSceneType;
  phase: number;              // which step we're on (0-indexed)
  totalPhases: number;        // total steps in this scene
  isActive: boolean;
  isPaused: boolean;
  isSkippable: boolean;
  blocksInput: boolean;       // true = player cannot interact during scene
  startedAt: number;          // Date.now()
  phaseDurationMs: number;    // how long current phase lasts
  payload: Record<string, any>; // countryId, leaderName, etc.
  autoAdvance: boolean;       // true = phases advance automatically
}

export interface CinematicsStoreState {
  activeScene: CinematicScene | null;
  sceneQueue: CinematicScene[];    // scenes waiting to play
  sceneHistory: CinematicScene[];  // last 10 completed scenes
  isAnySceneActive: boolean;
  isInputBlocked: boolean;
  cinematicVolume: number;         // 0-1 for music during scenes
  
  queueScene: (input: Omit<CinematicScene, 'id' | 'phase' | 'isActive' | 'startedAt' | 'isPaused'>) => void;
  advancePhase: () => void;
  completeScene: () => void;
  skipScene: () => void;
  pauseScene: () => void;
  resumeScene: () => void;
  clearAllScenes: () => void;
  triggerCinematic: (type: CinematicSceneType, payload: Record<string, any>) => void;
}

// Module-level timer reference for scheduling auto-advances cleanly
let currentAdvanceTimeout: any = null;

function clearAdvanceTimer() {
  if (currentAdvanceTimeout !== null) {
    clearTimeout(currentAdvanceTimeout);
    currentAdvanceTimeout = null;
  }
}

export const useCinematicsStore = create<CinematicsStoreState>((set, get) => {
  
  const schedulePhaseAdvance = () => {
    clearAdvanceTimer();
    const { activeScene, advancePhase } = get();
    if (activeScene && activeScene.isActive && !activeScene.isPaused && activeScene.autoAdvance) {
      currentAdvanceTimeout = setTimeout(() => {
        advancePhase();
      }, activeScene.phaseDurationMs);
    }
  };

  const startNextScene = () => {
    const { sceneQueue } = get();
    if (sceneQueue.length === 0) return;

    const nextScene = { ...sceneQueue[0] };
    const remainingQueue = sceneQueue.slice(1);

    const activeScene: CinematicScene = {
      ...nextScene,
      isActive: true,
      phase: 0,
      isPaused: false,
      startedAt: Date.now(),
    };

    set({
      activeScene,
      sceneQueue: remainingQueue,
      isAnySceneActive: true,
      isInputBlocked: activeScene.blocksInput,
    });

    // Trigger audio routing dynamically based on custom active scene and phase
    try {
      const audioModule = (window as any).sovereignAudio || audio;
      if (audioModule && typeof audioModule.playCinematicCue === 'function') {
        audioModule.playCinematicCue(activeScene.type, 0);
      }
    } catch (e) {
      console.warn('Cinematic audio routing direct integration failed:', e);
    }

    schedulePhaseAdvance();
  };

  return {
    activeScene: null,
    sceneQueue: [],
    sceneHistory: [],
    isAnySceneActive: false,
    isInputBlocked: false,
    cinematicVolume: 0.7,

    queueScene: (input) => {
      const id = `${input.type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const pendingScene: CinematicScene = {
        ...input,
        id,
        phase: 0,
        isActive: false,
        isPaused: false,
        startedAt: 0,
      };

      set((state) => {
        const nextQueue = [...state.sceneQueue, pendingScene];
        return { sceneQueue: nextQueue };
      });

      // If no active scene is running, immediately boot next
      const { activeScene } = get();
      if (!activeScene) {
        startNextScene();
      }
    },

    advancePhase: () => {
      const { activeScene, completeScene } = get();
      if (!activeScene) return;

      const nextPhase = activeScene.phase + 1;
      if (nextPhase >= activeScene.totalPhases) {
        completeScene();
      } else {
        const updatedScene: CinematicScene = {
          ...activeScene,
          phase: nextPhase,
        };

        set({ activeScene: updatedScene });

        // Trigger cinematic audio routing for next phase
        try {
          const audioModule = (window as any).sovereignAudio || audio;
          if (audioModule && typeof audioModule.playCinematicCue === 'function') {
            audioModule.playCinematicCue(updatedScene.type, nextPhase);
          }
        } catch (e) {
          // fallback
        }

        schedulePhaseAdvance();
      }
    },

    completeScene: () => {
      clearAdvanceTimer();
      const { activeScene, sceneHistory } = get();
      
      const newHistory = activeScene 
        ? [activeScene, ...sceneHistory].slice(0, 10)
        : sceneHistory;

      set({
        activeScene: null,
        isAnySceneActive: false,
        isInputBlocked: false,
        sceneHistory: newHistory,
      });

      // Restore system volume values
      try {
        const audioModule = (window as any).sovereignAudio || audio;
        if (audioModule && typeof audioModule.restoreSimVolume === 'function') {
          audioModule.restoreSimVolume(1200);
        }
      } catch (e) {}

      // Start next queued item if any exists
      startNextScene();
    },

    skipScene: () => {
      const { activeScene, completeScene } = get();
      if (activeScene && activeScene.isSkippable) {
        completeScene();
      }
    },

    pauseScene: () => {
      const { activeScene } = get();
      if (activeScene) {
        clearAdvanceTimer();
        set({
          activeScene: {
            ...activeScene,
            isPaused: true,
          }
        });
      }
    },

    resumeScene: () => {
      const { activeScene } = get();
      if (activeScene && activeScene.isPaused) {
        set({
          activeScene: {
            ...activeScene,
            isPaused: false,
          }
        });
        schedulePhaseAdvance();
      }
    },

    clearAllScenes: () => {
      clearAdvanceTimer();
      set({
        activeScene: null,
        sceneQueue: [],
        isAnySceneActive: false,
        isInputBlocked: false,
      });
    },

    triggerCinematic: (type, payload) => {
      get().queueScene({
        type,
        payload,
        totalPhases: 3, // Default, can be overridden if needed
        isSkippable: true,
        blocksInput: true,
        phaseDurationMs: 4000,
        autoAdvance: true
      });
    }
  };
});
