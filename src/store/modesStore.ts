import { create } from 'zustand';
import { produce } from 'immer';
import { Scenario, Mode_PlayerSession, Mode_Debrief, Role_Type, Mode_ToneMode, Scenario_Status, Scenario_Objective } from '../types';
import { useWorldStore } from './worldStore';
import { usePlayerStore } from './playerStore';
import { useDefconStore } from './defconStore';
import { useCinematicsStore } from './cinematicsStore';

// Note: Additional stores like ciaStore, cyberStore, etc., will be imported/used as needed 
// for evaluating win conditions during processTick.

export const PREDEFINED_SCENARIOS: Record<string, Scenario> = {
  'SCENARIO_NUCLEAR_STANDOFF_01': {
    id: 'SCENARIO_NUCLEAR_STANDOFF_01',
    type: 'NUCLEAR_STANDOFF',
    title: 'THE LAST ARGUMENT',
    subtitle: 'Forty-eight hours to prevent a nuclear exchange',
    classificationLevel: 'UMBRA',
    briefingText: "CLASSIFICATION: UMBRA / EYES ONLY\nPREPARED FOR: COMMAND\nSUBJECT: IMMINENT NUCLEAR STANDOFF\n\nThe situation is dire. You have 48 hours to de-escalate. Elements in the adversary government are pushing for a launch. Find them, stop them, or prevent the missiles from flying. Everything else is secondary.",
    executiveSummaryText: "Two nuclear-armed states are at DEFCON 2. Intelligence indicates launch authorisation has been sought. Your window to de-escalate is closing. One miscalculation ends everything.",
    availableRoles: ['SHADOW_DIRECTOR', 'SUPREME_COMMANDER', 'CHIEF_OF_INTELLIGENCE'],
    availableToneModes: ['REALISM', 'TECHNO_THRILLER'],
    primaryAdversaryNationId: 'NATION_ADVERSARY_01',
    keyNationIds: ['NATION_ADVERSARY_01', 'NATION_PARTNER_01', 'NATION_NEUTRAL_01'],
    startingTick: 0,
    tickLimit: 48,
    objectives: [
      {
        id: 'OBJ_NS_PRIMARY',
        type: 'PRIMARY',
        description: 'Prevent any nuclear weapon from being fired.',
        winTrigger: 'NUCLEAR_EXCHANGE_AVOIDED',
        lossTrigger: 'NUCLEAR_EXCHANGE_OCCURRED',
        targetNationId: null,
        targetThreshold: 1,
        currentProgress: 0,
        status: 'ACTIVE',
        achievedAtTick: null,
        failedAtTick: null,
        scoreValue: 1000,
        isHidden: false,
        hintText: 'Back-channel contact with the adversary leadership is your fastest path to de-escalation.'
      },
      {
        id: 'OBJ_NS_SECONDARY_01',
        type: 'SECONDARY',
        description: 'Keep DEFCON above 2 throughout the scenario.',
        winTrigger: 'DEFCON_MAINTAINED',
        lossTrigger: null,
        targetNationId: null,
        targetThreshold: 2,
        currentProgress: 0,
        status: 'ACTIVE',
        achievedAtTick: null,
        failedAtTick: null,
        scoreValue: 300,
        isHidden: false,
        hintText: null
      },
      {
        id: 'OBJ_NS_COVERT_01',
        type: 'COVERT',
        description: 'Identify the faction pushing for launch within the adversary government and neutralise them without kinetic action.',
        winTrigger: 'COVERT_OBJECTIVE_COMPLETE',
        lossTrigger: null,
        targetNationId: 'NATION_ADVERSARY_01',
        targetThreshold: null,
        currentProgress: 0,
        status: 'ACTIVE',
        achievedAtTick: null,
        failedAtTick: null,
        scoreValue: 500,
        isHidden: true,
        hintText: 'SIGINT intercepts from the adversary military command network may identify the launch faction.'
      },
      {
        id: 'OBJ_NS_STRETCH_01',
        type: 'STRETCH',
        description: 'Achieve a formal treaty commitment from the adversary to return to arms control negotiations.',
        winTrigger: 'DIPLOMATIC_RESOLUTION',
        lossTrigger: null,
        targetNationId: 'NATION_ADVERSARY_01',
        targetThreshold: null,
        currentProgress: 0,
        status: 'ACTIVE',
        achievedAtTick: null,
        failedAtTick: null,
        scoreValue: 750,
        isHidden: false,
        hintText: 'A crisis resolved cleanly creates diplomatic space that a crisis that simply stops does not.'
      }
    ],
    startingConditions: [
      { storeTarget: 'defconStore', field: 'defconLevel', value: 2, description: 'DEFCON raised to level 2' },
      { storeTarget: 'worldStore', field: 'globalTension', value: 85, description: 'Global tension critical' },
      { storeTarget: 'player_domesticApproval', field: 'currentApproval', value: 54, description: 'Domestic approval moderate' }
    ],
    restrictedInstruments: [],
    forcedEvents: [
      {
        id: 'FORCED_LAUNCH_WARNING',
        triggerTick: 12,
        triggerCondition: null,
        eventType: 'INTEL_UPDATE',
        eventPayload: { priority: 'CRITICAL', text: 'SIGINT CONFIRMS ADVERSARY LAUNCHERS REPOSITIONING.' },
        description: 'SIGINT intercept confirms adversary has moved mobile launchers to launch positions.',
        isMandatory: true
      },
      {
        id: 'FORCED_ALLY_PRESSURE',
        triggerTick: 24,
        triggerCondition: null,
        eventType: 'DIPLOMATIC_PRESSURE',
        eventPayload: { priority: 'HIGH', text: 'KEY ALLY DEMANDS ESCALATION.' },
        description: 'Key ally is threatening to escalate militarily unless player takes visible action.',
        isMandatory: true
      }
    ],
    intelligenceBriefingIds: ['INT_NS_01'],
    historicalContext: "The Cuban Missile Crisis, 1962. The Kargil Crisis, 1999. The moment when two nuclear-armed states stared at each other and one of them blinked. This is that moment.",
    replayability: 'HIGH',
    isUnlocked: true,
    unlockCondition: null,
    bestScore: null,
    completedWith: []
  },
  'SCENARIO_GREAT_POWER_01': {
    id: 'SCENARIO_GREAT_POWER_01',
    type: 'GREAT_POWER_COMPETITION',
    title: 'THE LONG GAME',
    subtitle: 'Establish strategic primacy before your adversary does',
    classificationLevel: 'TOP_SECRET',
    briefingText: "CLASSIFICATION: TOP SECRET\n\nA peer adversary is expanding via grey-zone operations. Establish primacy across 3 of 5 domains over the next 100 turns, or cede the century.",
    executiveSummaryText: "A peer adversary is systematically expanding its influence across every domain. Your window of superiority is closing. The next 100 ticks determine the next century.",
    availableRoles: ['SHADOW_DIRECTOR', 'SUPREME_COMMANDER', 'CHIEF_OF_INTELLIGENCE'],
    availableToneModes: ['REALISM', 'TECHNO_THRILLER', 'ALTERNATE_HISTORY'],
    primaryAdversaryNationId: 'NATION_ADVERSARY_02',
    keyNationIds: ['NATION_ADVERSARY_02'],
    startingTick: 0,
    tickLimit: 100,
    objectives: [
      {
        id: 'OBJ_GP_PRIMARY',
        type: 'PRIMARY',
        description: 'Achieve strategic superiority across at least 3 of 5 domains: intelligence, military, economic, diplomatic, cyber.',
        winTrigger: 'TICK_LIMIT_REACHED_WITH_LEAD',
        lossTrigger: null,
        targetNationId: null,
        targetThreshold: 3,
        currentProgress: 0,
        status: 'ACTIVE',
        achievedAtTick: null,
        failedAtTick: null,
        scoreValue: 1000,
        isHidden: false,
        hintText: null
      },
      {
        id: 'OBJ_GP_SECONDARY_01',
        type: 'SECONDARY',
        description: 'Maintain your primary alliance intact throughout.',
        winTrigger: 'ALLIANCE_INTACT',
        lossTrigger: 'ALLY_DEFECTION',
        targetNationId: null,
        targetThreshold: null,
        currentProgress: 0,
        status: 'ACTIVE',
        achievedAtTick: null,
        failedAtTick: null,
        scoreValue: 400,
        isHidden: false,
        hintText: null
      },
      {
        id: 'OBJ_GP_SECONDARY_02',
        type: 'SECONDARY',
        description: 'Achieve economic dominance — GDP superiority by tick 80.',
        winTrigger: 'ECONOMIC_DOMINANCE',
        lossTrigger: null,
        targetNationId: null,
        targetThreshold: 1.3,
        currentProgress: 0,
        status: 'ACTIVE',
        achievedAtTick: null,
        failedAtTick: null,
        scoreValue: 350,
        isHidden: false,
        hintText: null
      }
    ],
    startingConditions: [],
    restrictedInstruments: [],
    forcedEvents: [],
    intelligenceBriefingIds: [],
    historicalContext: "US-Soviet competition, 1947–1991. US-China competition, 2010–present. Every era of great-power rivalry ends the same way — one side exhausts itself. The question is which one.",
    replayability: 'HIGH',
    isUnlocked: true,
    unlockCondition: null,
    bestScore: null,
    completedWith: []
  },
  'SANDBOX_OPEN': {
    id: 'SANDBOX_OPEN',
    type: 'SANDBOX',
    title: 'THE OPEN WORLD',
    subtitle: 'No brief. No time limit. Define your own victory.',
    classificationLevel: 'TOP_SECRET',
    briefingText: "No constraints. Establish the board.",
    executiveSummaryText: "The simulation is yours. No scripted events, no win conditions, no safety net. The world is as it is. What you do with it is entirely your decision.",
    availableRoles: ['SHADOW_DIRECTOR', 'SUPREME_COMMANDER', 'CHIEF_OF_INTELLIGENCE'],
    availableToneModes: ['REALISM', 'TECHNO_THRILLER', 'ALTERNATE_HISTORY'],
    primaryAdversaryNationId: '',
    keyNationIds: [],
    startingTick: 0,
    tickLimit: null,
    objectives: [],
    startingConditions: [],
    restrictedInstruments: [],
    forcedEvents: [],
    intelligenceBriefingIds: [],
    historicalContext: "History is what you make it.",
    replayability: 'HIGH',
    isUnlocked: true,
    unlockCondition: null,
    bestScore: null,
    completedWith: []
  },
  'SCENARIO_COUNTER_PROLIFERATION_01': {
    id: 'SCENARIO_COUNTER_PROLIFERATION_01',
    type: 'COUNTER_PROLIFERATION',
    title: 'RED LINE',
    subtitle: 'Stop the programme before the point of no return',
    classificationLevel: 'UMBRA',
    briefingText: "",
    executiveSummaryText: "A regional state is 12–18 months from a deliverable nuclear device. Every option is bad. The one that does not exist is the one where you do nothing.",
    availableRoles: ['SHADOW_DIRECTOR', 'CHIEF_OF_INTELLIGENCE'],
    availableToneModes: ['REALISM', 'TECHNO_THRILLER'],
    primaryAdversaryNationId: 'NATION_ADVERSARY_03',
    keyNationIds: ['NATION_ADVERSARY_03'],
    startingTick: 0,
    tickLimit: 60,
    objectives: [
      {
        id: 'OBJ_CP_PRIMARY',
        type: 'PRIMARY',
        description: 'Prevent the target from achieving nuclear capability.',
        winTrigger: 'NUCLEAR_CAPABILITY_DESTROYED',
        lossTrigger: 'TARGET_NATION_NUCLEAR_ARMED',
        targetNationId: 'NATION_ADVERSARY_03',
        targetThreshold: null,
        currentProgress: 0,
        status: 'ACTIVE',
        achievedAtTick: null,
        failedAtTick: null,
        scoreValue: 1000,
        isHidden: false,
        hintText: null
      },
      {
        id: 'OBJ_CP_COVERT_01',
        type: 'COVERT',
        description: 'Achieve the objective without public attribution of any operation to your nation.',
        winTrigger: 'NO_ATTRIBUTION',
        lossTrigger: null,
        targetNationId: null,
        targetThreshold: null,
        currentProgress: 0,
        status: 'ACTIVE',
        achievedAtTick: null,
        failedAtTick: null,
        scoreValue: 600,
        isHidden: true,
        hintText: null
      }
    ],
    startingConditions: [],
    restrictedInstruments: [],
    forcedEvents: [],
    intelligenceBriefingIds: [],
    historicalContext: "Operation Opera. Stuxnet.",
    replayability: 'MEDIUM',
    isUnlocked: false,
    unlockCondition: 'Complete SCENARIO_NUCLEAR_STANDOFF_01 with PRIMARY objective.',
    bestScore: null,
    completedWith: []
  },
  'SCENARIO_COVERT_CAMPAIGN_01': {
    id: 'SCENARIO_COVERT_CAMPAIGN_01',
    type: 'COVERT_CAMPAIGN',
    title: 'PLAUSIBLE DENIABILITY',
    subtitle: 'Win without a single fingerprint left behind',
    classificationLevel: 'UMBRA',
    briefingText: "",
    executiveSummaryText: "Achieve regime change, SIGINT dominance, and economic pressure against a mid-tier adversary — entirely through covert means. No treaties. No press conferences. No trace.",
    availableRoles: ['SHADOW_DIRECTOR', 'CHIEF_OF_INTELLIGENCE'],
    availableToneModes: ['REALISM', 'TECHNO_THRILLER'],
    primaryAdversaryNationId: 'NATION_ADVERSARY_04',
    keyNationIds: ['NATION_ADVERSARY_04'],
    startingTick: 0,
    tickLimit: 80,
    objectives: [
      {
        id: 'OBJ_CC_PRIMARY',
        type: 'PRIMARY',
        description: 'Achieve a government transition in the target nation that is favourable to your interests.',
        winTrigger: 'REGIME_TRANSITION_COMPLETE',
        lossTrigger: 'REGIME_SURVIVED',
        targetNationId: 'NATION_ADVERSARY_04',
        targetThreshold: null,
        currentProgress: 0,
        status: 'ACTIVE',
        achievedAtTick: null,
        failedAtTick: null,
        scoreValue: 1000,
        isHidden: false,
        hintText: null
      },
      {
        id: 'OBJ_CC_COVERT_01',
        type: 'COVERT',
        description: 'Leave no attributable fingerprints on any operation.',
        winTrigger: 'NO_ATTRIBUTION',
        lossTrigger: null,
        targetNationId: null,
        targetThreshold: null,
        currentProgress: 0,
        status: 'ACTIVE',
        achievedAtTick: null,
        failedAtTick: null,
        scoreValue: 800,
        isHidden: true,
        hintText: null
      }
    ],
    startingConditions: [],
    restrictedInstruments: [],
    forcedEvents: [],
    intelligenceBriefingIds: [],
    historicalContext: "Cold War proxy conflicts.",
    replayability: 'MEDIUM',
    isUnlocked: false,
    unlockCondition: 'Complete SCENARIO_GREAT_POWER_01.',
    bestScore: null,
    completedWith: []
  }
};

interface ModesStoreState {
  modes_scenarios: Record<string, Scenario>;
  modes_activeSession: Mode_PlayerSession | null;
  modes_debriefs: Mode_Debrief[];
  modes_isOnboarding: boolean;
  modes_onboardingStep: number;
  modes_lastProcessedTick: number;
}

interface ModesStoreActions {
  modes_startSession: (scenarioId: string, role: Role_Type, toneMode: Mode_ToneMode, currentTick: number) => Mode_PlayerSession;
  modes_pauseSession: () => void;
  modes_resumeSession: () => void;
  modes_checkObjectiveProgress: (currentTick: number) => void;
  modes_fireForcedEvents: (currentTick: number) => void;
  modes_processTick: (currentTick: number) => void; // Provided for convenience, but as requested we will split calls
  modes_unlockScenario: (scenarioId: string) => void;
  modes_generateDebrief: (session: Mode_PlayerSession) => Mode_Debrief;
  modes_advanceOnboarding: () => void;
  modes_completeOnboarding: () => void;
  modes_getScenario: (scenarioId: string) => Scenario | null;
  modes_getActiveObjectives: () => Scenario_Objective[];
  modes_getPrimaryObjectiveProgress: () => number;
}

export const useModesStore = create<ModesStoreState & ModesStoreActions>((set, get) => ({
  modes_scenarios: PREDEFINED_SCENARIOS,
  modes_activeSession: null,
  modes_debriefs: [],
  modes_isOnboarding: true,
  modes_onboardingStep: 0,
  modes_lastProcessedTick: -1,

  modes_startSession: (scenarioId, role, toneMode, currentTick) => {
    // Basic scenario kick-off
    const session: Mode_PlayerSession = {
      sessionId: `sess_${Date.now()}`,
      scenarioId,
      role,
      toneMode,
      startedAtTick: currentTick,
      currentTick: currentTick,
      isActive: true,
      isPaused: false,
      finalStatus: null,
      finalScore: null,
      debrief: null
    };

    set({ modes_activeSession: session });
    
    // Wire player initial setup via playerStore
    const playerStore = usePlayerStore.getState();
    playerStore.player_setRole(role);
    playerStore.player_setToneMode(toneMode);
    playerStore.player_beginScenario(scenarioId, currentTick);

    // Apply scenario starting conditions (pseudo code - you would apply to respective stores)
    const scenario = get().modes_scenarios[scenarioId];
    if (scenario) {
      scenario.startingConditions.forEach(cond => {
        if (cond.storeTarget === 'defconStore') {
          useDefconStore.getState().setDefconLevel(cond.value, 'SYSTEM', 'SCENARIO INIT', currentTick);
        } else if (cond.storeTarget === 'worldStore') {
           useWorldStore.setState({ globalThreatLevel: cond.value >= 80 ? 'RED' : cond.value >= 50 ? 'YELLOW' : 'GREEN' });
        }
      });
      // TRIGGER CINEMATICS IF ANY
      useCinematicsStore.getState().triggerCinematic('SCENARIO_START', { scenarioTitle: scenario.title });
    }

    return session;
  },

  modes_pauseSession: () => set(produce(draft => {
    if (draft.modes_activeSession) draft.modes_activeSession.isPaused = true;
  })),

  modes_resumeSession: () => set(produce(draft => {
    if (draft.modes_activeSession) draft.modes_activeSession.isPaused = false;
  })),

  modes_checkObjectiveProgress: (currentTick: number) => {
    const session = get().modes_activeSession;
    if (!session || !session.isActive) return;

    const scenario = get().modes_scenarios[session.scenarioId];
    if (!scenario) return;

    let primaryAchievedCount = 0;
    let primaryTotal = 0;
    let anyPrimaryFailed = false;

    set(produce(draft => {
      const activeScen = draft.modes_scenarios[session.scenarioId];
      if (!activeScen) return;

      activeScen.objectives.forEach((obj: Scenario_Objective) => {
        if (obj.status !== 'ACTIVE') {
          if (obj.type === 'PRIMARY') {
            primaryTotal++;
            if (obj.status === 'ACHIEVED') primaryAchievedCount++;
            if (obj.status === 'FAILED') anyPrimaryFailed = true;
          }
          return;
        }

        // --- Mock Evaluation Logic ---
        // You would read from defconStore, worldStore, etc. here based on obj.winTrigger
        if (obj.winTrigger === 'DEFCON_MAINTAINED' && currentTick > (activeScen.tickLimit || 999)) {
          // If we reached end without dropping below
          obj.status = 'ACHIEVED';
          obj.achievedAtTick = currentTick;
          obj.currentProgress = 100;
        }
        
        // Timeout check for time-constrained objectives
        if (activeScen.tickLimit && currentTick >= session.startedAtTick + activeScen.tickLimit) {
           if (obj.status === 'ACTIVE') {
              obj.status = 'FAILED';
              obj.failedAtTick = currentTick;
           }
        }

        if (obj.type === 'PRIMARY') {
          primaryTotal++;
          if (obj.status === 'ACHIEVED') primaryAchievedCount++;
          if (obj.status === 'FAILED') anyPrimaryFailed = true;
        }
      });

      // Eval Win/Loss globally for the scenario
      if (anyPrimaryFailed) {
         draft.modes_activeSession!.isActive = false;
         draft.modes_activeSession!.finalStatus = 'FAILURE';
         useWorldStore.getState().addGlobalEvent('SCENARIO FAILURE DETECTED', 'CRITICAL');
      } else if (primaryTotal > 0 && primaryAchievedCount === primaryTotal) {
         draft.modes_activeSession!.isActive = false;
         draft.modes_activeSession!.finalStatus = 'SUCCESS';
         useWorldStore.getState().addGlobalEvent('SCENARIO SUCCESS', 'SYSTEM');
      } else if (activeScen.tickLimit && currentTick >= session.startedAtTick + activeScen.tickLimit) {
         draft.modes_activeSession!.isActive = false;
         draft.modes_activeSession!.finalStatus = 'TIMEOUT';
      }
    }));
  },

  modes_fireForcedEvents: (currentTick: number) => {
    const session = get().modes_activeSession;
    if (!session || !session.isActive) return;

    const scenario = get().modes_scenarios[session.scenarioId];
    if (!scenario) return;

    const offsetTick = currentTick - session.startedAtTick;

    scenario.forcedEvents.forEach(evt => {
      // NOTE: Using offsetTick for relative scenario events
      if (evt.triggerTick === offsetTick) {
        useWorldStore.getState().addGlobalEvent(`[FORCED EVENT] ${evt.description}`, 'CRITICAL');
        // trigger cinematic perhaps
      }
    });
  },

  modes_processTick: (currentTick: number) => {
    const { modes_lastProcessedTick, modes_activeSession } = get();
    if (modes_lastProcessedTick === currentTick) return;

    get().modes_fireForcedEvents(currentTick);
    
    // Apply domestic approval decay
    if (modes_activeSession && modes_activeSession.isActive) {
       const profile = usePlayerStore.getState().player_roleAccessProfile;
       if (profile && currentTick % 10 === 0) { // decay every 10 ticks for examples
          usePlayerStore.getState().player_updateDomesticApproval(-profile.domesticApprovalDecayRate, 'PASSIVE DECAY', 'Approval natural decay over time.', currentTick);
       }
    }

    get().modes_checkObjectiveProgress(currentTick);

    set({ modes_lastProcessedTick: currentTick });
  },

  modes_unlockScenario: (scenarioId) => set(produce((draft) => {
     if (draft.modes_scenarios[scenarioId]) {
        draft.modes_scenarios[scenarioId].isUnlocked = true;
     }
  })),

  modes_generateDebrief: (session) => {
     const debrief: Mode_Debrief = {
       scenarioId: session.scenarioId,
       role: session.role,
       toneMode: session.toneMode,
       status: session.finalStatus || 'FAILURE',
       finalScore: 0,
       objectivesAchieved: [],
       objectivesFailed: [],
       keyDecisions: [],
       criticalMoments: [],
       alternativePathways: ['A different diplomatic stance could have lowered tensions earlier.'],
       historicalComparison: 'Matches key aspects of cold war operations.',
       directorAssessment: 'Action met command parameters.',
       achievementsUnlocked: [],
       nextRecommendedScenario: null
     };
     set(produce(draft => {
        draft.modes_debriefs.push(debrief);
     }));
     return debrief;
  },

  modes_advanceOnboarding: () => set(state => ({ modes_onboardingStep: state.modes_onboardingStep + 1 })),
  
  modes_completeOnboarding: () => set({ modes_isOnboarding: false }),

  modes_getScenario: (scenarioId) => get().modes_scenarios[scenarioId] || null,

  modes_getActiveObjectives: () => {
    const session = get().modes_activeSession;
    if (!session) return [];
    const scen = get().modes_scenarios[session.scenarioId];
    return scen ? scen.objectives : [];
  },

  modes_getPrimaryObjectiveProgress: () => {
     const objs = get().modes_getActiveObjectives();
     const primary = objs.filter(o => o.type === 'PRIMARY');
     if (primary.length === 0) return 0;
     const sum = primary.reduce((acc, curr) => acc + curr.currentProgress, 0);
     return sum / primary.length;
  }
}));
