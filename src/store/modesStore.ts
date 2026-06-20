import { create } from 'zustand';
import { produce } from 'immer';
import { Scenario, Mode_PlayerSession, Mode_Debrief, Role_Type, Mode_ToneMode, Scenario_Status, Scenario_Objective, Modes2State } from '../types';
import { useWorldStore } from './worldStore';
import { usePlayerStore } from './playerStore';
import { useDefconStore } from './defconStore';
import { useCinematicsStore } from './cinematicsStore';
import { useCiaStore } from './ciaStore';
import { useCyberStore } from './cyberStore';
import { useOversightStore } from './oversightStore';
import { useDiplomaticStore } from './diplomaticStore';
import { useSanctionsStore } from './sanctionsStore';
import { useSigintStore } from './sigintStore';
import { useEconomyStore } from './economyStore';
import { useBlocStore } from './blocStore';
import { useRegimePressureStore } from './regimePressureStore';

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
  modes2: Modes2State;
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
  modes2: {
    campaignDefinitions: {},
    activeCampaignRun: null,
    completedCampaignRuns: [],
    rolePowerRecords: { SHADOW_DIRECTOR: [], SUPREME_COMMANDER: [], CHIEF_OF_INTELLIGENCE: [] },
    achievements: [],
    legacyRecord: {
      totalScenarioScore: 0, totalCampaignScore: 0, achievementsUnlocked: [],
      legacyScore: 0, legacyTitle: 'FIELD OFFICER',
      nuclearExchangeCount: 0, covertOpsSucceeded: 0, covertOpsAttributed: 0,
      diplomaticTreatiesSigned: 0, aptOperationsLaunched: 0,
      scenariosCompleted: 0, scenariosFailedByTimeout: 0, totalTicksPlayed: 0,
      rolesPlayed: { SHADOW_DIRECTOR: 0, SUPREME_COMMANDER: 0, CHIEF_OF_INTELLIGENCE: 0 },
      toneModesPlayed: { REALISM: 0, TECHNO_THRILLER: 0, ALTERNATE_HISTORY: 0 },
      favoriteScenarioId: null, worstScenarioId: null,
      firstPlayedTick: null, lastPlayedTick: null
    },
    dynamicScenarioQueue: [],
    toneModeProfiles: { REALISM: {} as any, TECHNO_THRILLER: {} as any, ALTERNATE_HISTORY: {} as any },
    editorDrafts: [],
    modes2EventLog: [],
    modes2LastProcessedTick: -1
  },

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

        // --- Fully Reactive Store Checks ---
        if (obj.winTrigger === 'NUCLEAR_EXCHANGE_AVOIDED') {
          if (useWorldStore.getState().nuclearExchangeOccurred) {
            obj.status = 'FAILED';
            obj.failedAtTick = currentTick;
            obj.currentProgress = 0;
          } else if (activeScen.tickLimit && currentTick >= session.startedAtTick + activeScen.tickLimit) {
            obj.status = 'ACHIEVED';
            obj.achievedAtTick = currentTick;
            obj.currentProgress = 100;
          } else if (activeScen.tickLimit) {
            const ratio = (currentTick - session.startedAtTick) / activeScen.tickLimit;
            obj.currentProgress = Math.min(99, Math.round(ratio * 100));
          }
        }

        else if (obj.winTrigger === 'DEFCON_MAINTAINED') {
          const threshold = obj.targetThreshold || 2;
          const currentDefcon = useDefconStore.getState().currentDefconLevel || 5;
          if (currentDefcon < threshold) {
            obj.status = 'FAILED';
            obj.failedAtTick = currentTick;
            obj.currentProgress = 0;
          } else if (activeScen.tickLimit && currentTick >= session.startedAtTick + activeScen.tickLimit) {
            obj.status = 'ACHIEVED';
            obj.achievedAtTick = currentTick;
            obj.currentProgress = 100;
          } else if (activeScen.tickLimit) {
            const ratio = (currentTick - session.startedAtTick) / activeScen.tickLimit;
            obj.currentProgress = Math.min(99, Math.round(ratio * 100));
          }
        }

        else if (obj.winTrigger === 'COVERT_OBJECTIVE_COMPLETE') {
          const ciaOps = useCiaStore.getState().cia_operations || [];
          const regimeOps = useRegimePressureStore.getState().completedOps || [];
          const okCovert = ciaOps.some(op => op.status === 'SUCCEEDED' && (op.targetNationId === 'RU' || op.targetNationId === 'CN' || op.targetNationId === 'NATION_ADVERSARY_01')) ||
                            regimeOps.some(op => op.targetCountryId === 'RU' || op.targetCountryId === 'CN' || op.targetCountryId === 'NATION_ADVERSARY_01');
          if (okCovert) {
            obj.status = 'ACHIEVED';
            obj.achievedAtTick = currentTick;
            obj.currentProgress = 100;
          } else if (activeScen.tickLimit && currentTick >= session.startedAtTick + activeScen.tickLimit) {
            obj.status = 'FAILED';
            obj.failedAtTick = currentTick;
          } else if (activeScen.tickLimit) {
            const ratio = (currentTick - session.startedAtTick) / activeScen.tickLimit;
            obj.currentProgress = Math.min(99, Math.round(ratio * 100));
          }
        }

        else if (obj.winTrigger === 'DIPLOMATIC_RESOLUTION') {
          const treaties = useDiplomaticStore.getState().diplo_treaties || {};
          const isSigned = Object.values(treaties).some((t: any) => t.status === 'RATIFIED' && (t.partyNationIds.includes('RU') || t.partyNationIds.includes('CN') || t.partyNationIds.includes('NATION_ADVERSARY_01')));
          if (isSigned) {
            obj.status = 'ACHIEVED';
            obj.achievedAtTick = currentTick;
            obj.currentProgress = 100;
          } else if (activeScen.tickLimit && currentTick >= session.startedAtTick + activeScen.tickLimit) {
            obj.status = 'FAILED';
            obj.failedAtTick = currentTick;
          } else if (activeScen.tickLimit) {
            const ratio = (currentTick - session.startedAtTick) / activeScen.tickLimit;
            obj.currentProgress = Math.min(99, Math.round(ratio * 100));
          }
        }

        else if (obj.winTrigger === 'TICK_LIMIT_REACHED_WITH_LEAD') {
          const econNations = useEconomyStore.getState().econ_nations || {};
          const playerGdp = econNations['US']?.gdpEstimateUSD || 28000;
          const adversaryGdp = econNations['CN']?.gdpEstimateUSD || 19000;
          const econLead = playerGdp > adversaryGdp;

          const intelSignals = useSigintStore.getState().u8200Signals || [];
          const playerIntelCount = intelSignals.filter(s => s.status === 'CONFIRMED').length;
          const intelLead = playerIntelCount > 3;

          const aptOps = useCyberStore.getState().cyber_aptOperations || [];
          const cyberLead = aptOps.filter(o => o.targetNationId === 'CN' && o.currentPhase === 'IMPACT').length > 0 || (aptOps.length > 1);

          const treatiesList = Object.values(useDiplomaticStore.getState().diplo_treaties || {});
          const diplomaticCount = treatiesList.filter((t: any) => t.status === 'RATIFIED' && t.partyNationIds.includes('US')).length;
          const diploLead = diplomaticCount >= 1;

          const activePatrols = useCiaStore.getState().cia_operatives.length;
          const militaryLead = activePatrols > 0;

          let leads = 0;
          if (econLead) leads++;
          if (intelLead) leads++;
          if (cyberLead) leads++;
          if (diploLead) leads++;
          if (militaryLead) leads++;

          obj.currentProgress = Math.min(100, Math.round((leads / (obj.targetThreshold || 3)) * 100));

          if (activeScen.tickLimit && currentTick >= session.startedAtTick + activeScen.tickLimit) {
            if (leads >= (obj.targetThreshold || 3)) {
              obj.status = 'ACHIEVED';
              obj.achievedAtTick = currentTick;
              obj.currentProgress = 100;
            } else {
              obj.status = 'FAILED';
              obj.failedAtTick = currentTick;
            }
          }
        }

        else if (obj.winTrigger === 'ALLIANCE_INTACT') {
          const orgs = useBlocStore.getState().organizations || {};
          const exits = orgs['NATO']?.exits || [];
          const suspensions = orgs['NATO']?.suspensions || [];
          const cohesion = orgs['NATO']?.cohesion?.cohesionScore ?? 50;

          if (exits.length > 0 || suspensions.length > 0 || cohesion < 20) {
            obj.status = 'FAILED';
            obj.failedAtTick = currentTick;
            obj.currentProgress = 0;
          } else if (activeScen.tickLimit && currentTick >= session.startedAtTick + activeScen.tickLimit) {
            obj.status = 'ACHIEVED';
            obj.achievedAtTick = currentTick;
            obj.currentProgress = 100;
          } else if (activeScen.tickLimit) {
            const ratio = (currentTick - session.startedAtTick) / activeScen.tickLimit;
            obj.currentProgress = Math.min(99, Math.round(ratio * 100));
          }
        }

        else if (obj.winTrigger === 'ECONOMIC_DOMINANCE') {
          const econNations = useEconomyStore.getState().econ_nations || {};
          const playerGdp = econNations['US']?.gdpEstimateUSD || 28000;
          const adversaryGdp = econNations['CN']?.gdpEstimateUSD || 19000;
          const ratio = playerGdp / adversaryGdp;

          obj.currentProgress = Math.min(100, Math.round((ratio / (obj.targetThreshold || 1.3)) * 100));

          if (activeScen.tickLimit && currentTick >= session.startedAtTick + activeScen.tickLimit) {
            if (ratio >= (obj.targetThreshold || 1.3)) {
              obj.status = 'ACHIEVED';
              obj.achievedAtTick = currentTick;
              obj.currentProgress = 100;
            } else {
              obj.status = 'FAILED';
              obj.failedAtTick = currentTick;
            }
          }
        }

        else if (obj.winTrigger === 'NUCLEAR_CAPABILITY_DESTROYED') {
          const isArmed = useWorldStore.getState().countries['IR']?.arsenal?.nuclearCapable || false;
          const ciaOps = useCiaStore.getState().cia_operations || [];
          const stuxCheck = ciaOps.some(o => (o.targetNationId === 'IR' || o.targetNationId === 'NATION_ADVERSARY_03') && o.status === 'SUCCEEDED');
          
          if (isArmed || useWorldStore.getState().nuclearExchangeOccurred) {
            obj.status = 'FAILED';
            obj.failedAtTick = currentTick;
            obj.currentProgress = 0;
          } else if (stuxCheck) {
            obj.status = 'ACHIEVED';
            obj.achievedAtTick = currentTick;
            obj.currentProgress = 100;
          } else if (activeScen.tickLimit && currentTick >= session.startedAtTick + activeScen.tickLimit) {
            obj.status = 'FAILED';
            obj.failedAtTick = currentTick;
          } else if (activeScen.tickLimit) {
            const ratio = (currentTick - session.startedAtTick) / activeScen.tickLimit;
            obj.currentProgress = Math.min(99, Math.round(ratio * 100));
          }
        }

        else if (obj.winTrigger === 'NO_ATTRIBUTION') {
          const scandals = useOversightStore.getState().activeScandals || {};
          const leaks = useOversightStore.getState().publishedLeaks || [];
          const exposure = useRegimePressureStore.getState().playerExposureScore ?? 0;

          if (Object.keys(scandals).length > 0 || leaks.length > 0 || exposure > 40) {
            obj.status = 'FAILED';
            obj.failedAtTick = currentTick;
            obj.currentProgress = 0;
          } else if (activeScen.tickLimit && currentTick >= session.startedAtTick + activeScen.tickLimit) {
            obj.status = 'ACHIEVED';
            obj.achievedAtTick = currentTick;
            obj.currentProgress = 100;
          } else if (activeScen.tickLimit) {
            const ratio = (currentTick - session.startedAtTick) / activeScen.tickLimit;
            obj.currentProgress = Math.min(99, Math.round(ratio * 100));
          }
        }

        else if (obj.winTrigger === 'REGIME_TRANSITION_COMPLETE') {
          const completedOps = useRegimePressureStore.getState().completedOps || [];
          const isChanged = completedOps.some(o => (o.targetCountryId === 'IR' || o.targetCountryId === 'NATION_ADVERSARY_04') && (o.outcome === 'REGIME_COLLAPSED' || o.outcome === 'COUP_SUCCEEDED' || o.outcome === 'LEADER_REMOVED' || o.outcome === 'PARTIAL_SUCCESS'));
          
          if (isChanged) {
            obj.status = 'ACHIEVED';
            obj.achievedAtTick = currentTick;
            obj.currentProgress = 100;
          } else if (activeScen.tickLimit && currentTick >= session.startedAtTick + activeScen.tickLimit) {
            obj.status = 'FAILED';
            obj.failedAtTick = currentTick;
          } else if (activeScen.tickLimit) {
            const ratio = (currentTick - session.startedAtTick) / activeScen.tickLimit;
            obj.currentProgress = Math.min(99, Math.round(ratio * 100));
          }
        }
        
        // Timeout check fallback for any unspecified active objectives
        else if (activeScen.tickLimit && currentTick >= session.startedAtTick + activeScen.tickLimit) {
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

  modes2_startCampaignRun: (campaignId, role, toneMode, currentTick) => {
     // TODO: Implement
  },

  modes_generateDebrief: (session) => {
     const scenarioId = session.scenarioId;
     const status = session.finalStatus || 'FAILURE';
     const isSuccess = status === 'SUCCESS' || status === 'PARTIAL_SUCCESS';

     let directorAssessment = "Action met basic command directives.";
     let historicalComparison = "A standard sandbox exercise.";
     let alternativePathways: string[] = ["Alternative diplomatic approaches were available but untried."];
     let finalScore = 400;

     if (scenarioId === 'SCENARIO_NUCLEAR_STANDOFF_01') {
       if (isSuccess) {
         directorAssessment = "Excellent work. You successfully defused the nuclear crisis without conceding critical strategic boundaries. Your command posture retained the baseline deterrence value of our conventional and nuclear arsenals while safely de-escalating the command framework. Deep regional security restored.";
         historicalComparison = "Strongly mirrors the resolution of the Cuban Missile Crisis of 1962, where firm public posture was backed by secret de-escalating diplomatic channels to prevent a global catastrophe.";
         alternativePathways = [
           "Early deployment of defensive HAARP/cyber shields could have lowered readiness requirements sooner.",
           "Maintaining an aggressive nuclear doctrine first-strike stance longer would have increased leverage but with extreme DEFCON risk."
         ];
         finalScore = 1400;
       } else {
         directorAssessment = "Catastrophic failure of statecraft. The command escalation cycle entered an irreversible feedback loop, terminating in multiple tactical and strategic nuclear releases. The operational theater has suffered absolute fallout damage. Active national continuity is compromised.";
         historicalComparison = "Parallels the narrow escapes of the 1983 Able Archer and Stanislav Petrov incidents, but underscores the terminal risk of automated or rigid response mechanisms when de-escalation protocols fail.";
         alternativePathways = [
           "Should have activated de-escalation protocols earlier before the DEFCON meter reached Level 2.",
           "Deploying advanced cyber firewall shields could have intercepted rogue command signaling before physical authorization codes were released."
         ];
         finalScore = 200;
       }
     } else if (scenarioId === 'SCENARIO_GREAT_POWER_01') {
       if (isSuccess) {
         directorAssessment = "Superb long-term strategic performance. You carefully balanced domestic approval while outmaneuvering near-peer rivals across cyber, economic, and intelligence domains. Our economic dominance has successfully exhausted the competitor's central budget capacity.";
         historicalComparison = "Direct parallel to the conclusion of the Cold War (1989-1991), where the United States exhausted the Soviet Union through technological, economic, and strategic pressure without resorting to a direct kinetic confrontation.";
         alternativePathways = [
           "An earlier and more focused SIGINT sig-harvest campaign would have unlocked valuable developmental intelligence sooner.",
           "Forming strict bilateral trade-embargo treaties could have isolated the adversary's central resource core much earlier in the timeline."
         ];
         finalScore = 1200;
       } else {
         directorAssessment = "Strategic stagnation. Your administration failed to secure a meaningful margin of dominance over the adversary before exhaustion took a tool on our domestic economy. The multipolar order is now locked, permanently diluting our global hegemon status.";
         historicalComparison = "Reflects the decline of Rome or British Imperial overreach, where massive defense commitments on unstable boundaries coupled with internal trade deficit and public approval decay triggered rapid status fracturing.";
         alternativePathways = [
           "Concentrate national resources on trade and GDP growth earlier instead of scattering attention on minor proxy wars.",
           "Utilizing financial sanctions earlier would have slowed some of the adversary's technological advances."
         ];
         finalScore = 300;
       }
     } else if (scenarioId === 'SCENARIO_COUNTER_PROLIFERATION_01') {
       if (isSuccess) {
         directorAssessment = "Counter-proliferation operation fully accomplished. The target nation's facilities have been precisely degraded through deniable cyber and covert campaigns. No public attribution occurred, preserving our baseline diplomatic leverage.";
         historicalComparison = "Recalls Israel's preemptive Operation Opera (1981) and the joint US-Israeli Stuxnet cyber operation (2010), displaying unmatched precision in covert preemptive deterrence.";
         alternativePathways = [
           "A conventional tactical strike would have expedited facility collapse but with unacceptable international backlash.",
           "Better SIGINT intercepts early on could have pinpointed research centers to optimize sabotage success rates."
         ];
         finalScore = 1500;
       } else {
         directorAssessment = "Operational parameters breached. The target state crossed the threshold, successfully assembling and arming a deliverable nuclear warhead. This fundamentally destabilizes the regional balance and curtails our security guarantees.";
         historicalComparison = "Comparable to North Korea's crossing of the nuclear threshold in 2006, where slow diplomatic leverage and hesitation allowed the regime to complete atomic weapons calibration.";
         alternativePathways = [
           "More continuous and aggressive cyber sabotage sweeps were required to disrupt centrifuge calibration before they reached high Enrichment levels.",
           "Deploying extra CIA operative assets inside IR boundaries could have delayed physical engineering work."
         ];
         finalScore = 150;
       }
     } else if (scenarioId === 'SCENARIO_COVERT_CAMPAIGN_01') {
       if (isSuccess) {
         directorAssessment = "Exquisite clandestine execution. A favorable regime transition happened in the target zone with complete, bulletproof deniability. No oversight active scandals or leaks were recorded, verifying the supreme competence of your command.";
         historicalComparison = "Parallels the highly successful covert regime shifts in Iran (1953) and Guatemala (1954), illustrating absolute mastery of deniable proxy action and political warfare.";
         alternativePathways = [
           "Leveraging black market procurement networks could have lowered the starting cost of local cyber operations.",
           "Combining political pressure with targeted financial campaign closures would have starved loyalist forces sooner."
         ];
         finalScore = 1600;
       } else {
         directorAssessment = "Clandestine catastrophe. Hostile exposure reached critical levels, triggering oversight alerts, media leaks, and active scandals. Our government's direct involvement is widely proven, resulting in diplomatic isolation and massive domestic backlash.";
         historicalComparison = "Directly echoes the Bay of Pigs fiasco (1961) and the Iran-Contra affair (1986), where poor operational deniability and sloppy signaling led to terminal exposure, public hearings, and systemic loss of trust.";
         alternativePathways = [
           "Operatives should have been withdrawn immediately if local risk parameters spiked past safe margins.",
           "Relying solely on non-military cyber intrusion limits public exposure metrics."
         ];
         finalScore = 100;
       }
     }

     const debrief: Mode_Debrief = {
       scenarioId,
       role: session.role,
       toneMode: session.toneMode,
       status,
       finalScore,
       objectivesAchieved: [],
       objectivesFailed: [],
       keyDecisions: [],
       criticalMoments: [],
       alternativePathways,
       historicalComparison,
       directorAssessment,
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
