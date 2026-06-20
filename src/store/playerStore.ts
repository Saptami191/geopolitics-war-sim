import { create } from 'zustand';
import { produce } from 'immer';
import { PlayerState, HUDMode, ScenarioId, BallisticStrike, Role_Type, Mode_ToneMode, Scenario_Status, Mode_Debrief, Mode_SandboxObjective } from '../types';
import { useWorldStore } from './worldStore';
import { useUIStore } from './uiStore';
import { useClockStore } from './clockStore';
import { useUnitStore } from './unitStore';
import { useBlackMarketStore } from './blackMarketStore';
import { useModesStore } from './modesStore';

interface PlayerStoreActions {
  setHUDMode: (mode: HUDMode) => void;
  setActiveTab: (tab: number) => void;
  setTickSpeed: (speed: PlayerState['tickSpeed']) => void;
  setTargetCountry: (id: string | undefined) => void;
  setPendingStrike: (strike: Partial<BallisticStrike> | undefined) => void;
  setGameOver: (reason: string | undefined) => void;
  setVictory: (reason: string | undefined) => void;
  syncCashFromCountry: () => void;
  syncCashToCountry: () => void;
  initPlayerScenario: (scenarioId: ScenarioId, countryId: string) => void;
  resetPlayer: () => void;
  setAftermath: (active: boolean, type: PlayerState['aftermathType'], reason?: string) => void;
  saveCheckpoint: () => void;
  rollbackToCheckpoint: () => void;
  
  // --- IRON THRONE (MODES-1) ACTIONS ---
  player_setRole: (role: Role_Type) => void;
  player_setToneMode: (mode: Mode_ToneMode) => void;
  player_updateDomesticApproval: (delta: number, source: string, description: string, currentTick: number) => void;
  player_beginScenario: (scenarioId: string, currentTick: number) => void;
  player_endScenario: (status: Scenario_Status, currentTick: number) => Mode_Debrief;
  player_addSandboxObjective: (objective: Omit<Mode_SandboxObjective, 'id' | 'isActive' | 'achievedAtTick'>) => string;
  player_checkRolePermission: (action: string) => boolean;
  player_replenishApproval: (amount: number, source: string, tick: number) => void;
}

export const usePlayerStore = create<PlayerState & PlayerStoreActions>((set, get) => ({
  countryId: 'US',
  hudMode: 'STATE',
  activeTab: 1,
  cashB: 1400.0,
  activeScenario: 'MENA_SPARK',
  scenarioStartTick: 0,
  totalTicks: 0,
  tickSpeed: 'PAUSED',
  selectedTargetCountryId: undefined,
  pendingStrike: undefined,
  gameOver: false,
  gameOverReason: undefined,
  victoryAchieved: false,
  victoryReason: undefined,
  aftermathActive: false,
  aftermathType: 'NONE',
  aftermathReason: undefined,
  checkpointState: null,
  
  // --- IRON THRONE DEFAULT STATE ---
  player_role: 'SHADOW_DIRECTOR',
  player_roleAccessProfile: {
    canAuthoriseKineticStrike: false,
    canAuthoriseNuclearRelease: false,
    canDirectCIAOperations: true,
    canDirectSIGINTCollection: true,
    canDeployDiplomaticInstruments: true,
    canRatifyTreaties: false,
    canImposeSanctions: true,
    canDirectCyberOperations: true,
    canManageMilitaryPosture: false,
    canDirectEWOperations: true,
    canPubliclyAttribute: false,
    canAccessFinancialWeapons: true,
    canManageBlocs: false,
    canCallUNSCVote: false,
    covertOperationsMultiplier: 1.5,
    intelligenceQualityBonus: 15,
    diplomaticCapitalMultiplier: 0.8,
    militaryReadinessBonus: 0,
    economicInstrumentMultiplier: 1.2,
    domesticApprovalDecayRate: 0.1,
    maxSimultaneousOperations: 8,
    maxSimultaneousAPTOperations: 6,
    maxAmbassadors: 4
  },
  player_toneMode: 'TECHNO_THRILLER',
  player_toneModeModifiers: {
    toneMode: 'TECHNO_THRILLER',
    sigintBaseConfidence: 55,
    humintSuccessModifier: 0.9,
    attributionAmbiguityLevel: 0.45,
    collateralDamageMultiplier: 1.0,
    militaryOperationFriction: 0.2,
    nuclearUsageThreshold: 2,
    allyReliabilityModifier: 0.8,
    treatyEnforcementStrictness: 0.7,
    internationalLawConstraint: false,
    coversionDiscoveryBaseRate: 0.10,
    ciaBlowbackMultiplier: 1.0,
    plausibleDeniabilityAvailable: true,
    mediaScrutinyLevel: 0.5,
    domesticApprovalVolatility: 0.9,
    electionCyclePressure: false,
    sanctionsEvasionBaseRate: 0.20,
    economicCascadeAmplification: 1.0,
    operationCodeNamesVisible: true,
    historicalReferencesActive: true,
    cinematicFrequency: 0.9
  },
  player_domesticApproval: {
    currentApproval: 62,
    trend: 'STABLE',
    lastChangeTick: 0,
    changeLog: [],
    crisisMode: false,
    rallying: false
  },
  player_currentScenarioId: null,
  player_sessionId: null,
  player_sandboxObjectives: [],
  player_totalPlaythroughs: 0,
  player_completedScenarioIds: [],
  player_unlockedScenarioIds: [
    'SCENARIO_NUCLEAR_STANDOFF_01',
    'SCENARIO_GREAT_POWER_01',
    'SANDBOX_OPEN'
  ],
  player_achievements: [],
  player_cumulativeScore: 0,
  player_lastDebriefId: null,

  setHUDMode: (mode) => set({ hudMode: mode }),
  setActiveTab: (tab) => {
    set({ activeTab: tab });
    useUIStore.getState().setActivePanelId(String(tab));
  },
  setTickSpeed: (speed) => set({ tickSpeed: speed }),
  setTargetCountry: (id) => set({ selectedTargetCountryId: id }),
  setPendingStrike: (strike) => set({ pendingStrike: strike }),
  
  setGameOver: (reason) => {
    if (!reason) {
      set({ gameOver: false, gameOverReason: undefined });
      return;
    }
    const { aftermathActive, gameOver } = get();
    if (aftermathActive || gameOver) return;

    set({
      aftermathActive: true,
      aftermathType: 'DEFEAT',
      aftermathReason: reason,
      tickSpeed: 'PAUSED',
    });
  },

  setVictory: (reason) => {
    if (!reason) {
      set({ victoryAchieved: false, victoryReason: undefined });
      return;
    }
    const { aftermathActive, victoryAchieved } = get();
    if (aftermathActive || victoryAchieved) return;

    set({
      aftermathActive: true,
      aftermathType: 'VICTORY',
      aftermathReason: reason,
      tickSpeed: 'PAUSED',
    });
  },

  setAftermath: (active, type, reason) => set({
    aftermathActive: active,
    aftermathType: type,
    aftermathReason: reason,
  }),

  saveCheckpoint: () => {
    const worldState = useWorldStore.getState();
    const playerState = get();
    const unitState = useUnitStore.getState();
    const clockState = useClockStore.getState();
    const blackMarketState = useBlackMarketStore.getState();

    const checkpoint = {
      world: {
        countries: JSON.parse(JSON.stringify(worldState.countries)),
        activeStrikes: JSON.parse(JSON.stringify(worldState.activeStrikes)),
        commodityMarkets: JSON.parse(JSON.stringify(worldState.commodityMarkets)),
        activeArmsDeals: JSON.parse(JSON.stringify(worldState.activeArmsDeals)),
        globalThreatLevel: worldState.globalThreatLevel,
        nuclearExchangeOccurred: worldState.nuclearExchangeOccurred,
        globalEventLog: JSON.parse(JSON.stringify(worldState.globalEventLog)),
        currentTick: worldState.currentTick,
        scheduledConsequences: JSON.parse(JSON.stringify(worldState.scheduledConsequences ?? [])),
        recentResolvedConsequences: JSON.parse(JSON.stringify(worldState.recentResolvedConsequences ?? [])),
      },
      player: {
        countryId: playerState.countryId,
        hudMode: playerState.hudMode,
        activeTab: playerState.activeTab,
        cashB: playerState.cashB,
        activeScenario: playerState.activeScenario,
        scenarioStartTick: playerState.scenarioStartTick,
        totalTicks: playerState.totalTicks,
        selectedTargetCountryId: playerState.selectedTargetCountryId,
      },
      units: JSON.parse(JSON.stringify(unitState.units)),
      clock: {
        currentCalendarDate: clockState.currentCalendarDate,
        currentTick: clockState.currentTick,
      },
      blackMarket: {
        activeLots: JSON.parse(JSON.stringify(blackMarketState.activeLots)),
        playerBids: JSON.parse(JSON.stringify(blackMarketState.playerBids)),
        pendingDeliveries: JSON.parse(JSON.stringify(blackMarketState.pendingDeliveries)),
        internationalSuspicion: blackMarketState.internationalSuspicion,
        unInvestigationTriggered: blackMarketState.unInvestigationTriggered,
        sanctionsTriggered: blackMarketState.sanctionsTriggered,
      }
    };

    set({ checkpointState: checkpoint });
  },

  rollbackToCheckpoint: () => {
    const { checkpointState } = get();
    if (!checkpointState) return;

    // Restore player
    set({
      countryId: checkpointState.player.countryId,
      hudMode: checkpointState.player.hudMode,
      activeTab: checkpointState.player.activeTab,
      cashB: checkpointState.player.cashB,
      activeScenario: checkpointState.player.activeScenario,
      scenarioStartTick: checkpointState.player.scenarioStartTick,
      totalTicks: checkpointState.player.totalTicks,
      selectedTargetCountryId: checkpointState.player.selectedTargetCountryId,
      gameOver: false,
      gameOverReason: undefined,
      victoryAchieved: false,
      victoryReason: undefined,
      aftermathActive: false,
      aftermathType: 'NONE',
      aftermathReason: undefined,
      tickSpeed: 'PAUSED',
    });

    // Restore world
    useWorldStore.setState({
      countries: JSON.parse(JSON.stringify(checkpointState.world.countries)),
      activeStrikes: JSON.parse(JSON.stringify(checkpointState.world.activeStrikes)),
      commodityMarkets: JSON.parse(JSON.stringify(checkpointState.world.commodityMarkets)),
      activeArmsDeals: JSON.parse(JSON.stringify(checkpointState.world.activeArmsDeals)),
      globalThreatLevel: checkpointState.world.globalThreatLevel,
      nuclearExchangeOccurred: checkpointState.world.nuclearExchangeOccurred,
      globalEventLog: JSON.parse(JSON.stringify(checkpointState.world.globalEventLog)),
      currentTick: checkpointState.world.currentTick,
      scheduledConsequences: JSON.parse(JSON.stringify(checkpointState.world.scheduledConsequences)),
      recentResolvedConsequences: JSON.parse(JSON.stringify(checkpointState.world.recentResolvedConsequences)),
    });

    // Restore units
    useUnitStore.setState({
      units: JSON.parse(JSON.stringify(checkpointState.units)),
      selectedUnitId: null,
    });

    // Restore clock
    useClockStore.setState({
      currentCalendarDate: checkpointState.clock.currentCalendarDate,
      currentTick: checkpointState.clock.currentTick,
    });

    // Restore black market
    useBlackMarketStore.setState({
      activeLots: JSON.parse(JSON.stringify(checkpointState.blackMarket.activeLots)),
      playerBids: JSON.parse(JSON.stringify(checkpointState.blackMarket.playerBids)),
      pendingDeliveries: JSON.parse(JSON.stringify(checkpointState.blackMarket.pendingDeliveries)),
      internationalSuspicion: checkpointState.blackMarket.internationalSuspicion,
      unInvestigationTriggered: checkpointState.blackMarket.unInvestigationTriggered,
      sanctionsTriggered: checkpointState.blackMarket.sanctionsTriggered,
    });

    // Re-sync cash level
    get().syncCashFromCountry();
  },

  syncCashFromCountry: () => {
    const { countryId } = get();
    const worldCountries = useWorldStore.getState().countries;
    const countryObj = worldCountries[countryId];
    if (countryObj) {
      set({ cashB: countryObj.economic.treasuryCashB });
    }
  },

  syncCashToCountry: () => {
    const { countryId, cashB } = get();
    useWorldStore.getState().updateCountry(countryId, (draft) => {
      draft.economic.treasuryCashB = cashB;
    });
  },

  initPlayerScenario: (scenarioId, countryId) => {
    set({
      countryId: countryId,
      activeScenario: scenarioId,
      scenarioStartTick: 0,
      totalTicks: 0,
      tickSpeed: 'PAUSED',
      selectedTargetCountryId: undefined,
      pendingStrike: undefined,
      gameOver: false,
      gameOverReason: undefined,
      victoryAchieved: false,
      victoryReason: undefined,
      aftermathActive: false,
      aftermathType: 'NONE',
      aftermathReason: undefined,
      checkpointState: null,
    });
    // Immediately sync starter cash
    const worldCountries = useWorldStore.getState().countries;
    const countryObj = worldCountries[countryId];
    if (countryObj) {
      set({ cashB: countryObj.economic.treasuryCashB });
    }
  },

  resetPlayer: () => set({
    countryId: 'US',
    hudMode: 'STATE',
    activeTab: 1,
    cashB: 1400.0,
    activeScenario: 'MENA_SPARK',
    scenarioStartTick: 0,
    totalTicks: 0,
    tickSpeed: 'PAUSED',
    selectedTargetCountryId: undefined,
    pendingStrike: undefined,
    gameOver: false,
    gameOverReason: undefined,
    victoryAchieved: false,
    victoryReason: undefined,
    aftermathActive: false,
    aftermathType: 'NONE',
    aftermathReason: undefined,
    checkpointState: null,
  }),
  
  // --- IRON THRONE (MODES-1) IMPLEMENTATION ---
  player_setRole: (role) => set(produce(draft => {
     draft.player_role = role;
     if (role === 'SHADOW_DIRECTOR') {
        draft.player_roleAccessProfile = {
          canAuthoriseKineticStrike: false, canAuthoriseNuclearRelease: false, canDirectCIAOperations: true,
          canDirectSIGINTCollection: true, canDeployDiplomaticInstruments: true, canRatifyTreaties: false,
          canImposeSanctions: true, canDirectCyberOperations: true, canManageMilitaryPosture: false,
          canDirectEWOperations: true, canPubliclyAttribute: false, canAccessFinancialWeapons: true,
          canManageBlocs: false, canCallUNSCVote: false, covertOperationsMultiplier: 1.5,
          intelligenceQualityBonus: 15, diplomaticCapitalMultiplier: 0.8, militaryReadinessBonus: 0,
          economicInstrumentMultiplier: 1.2, domesticApprovalDecayRate: 0.1, maxSimultaneousOperations: 8,
          maxSimultaneousAPTOperations: 6, maxAmbassadors: 4
        };
     } else if (role === 'SUPREME_COMMANDER') {
        draft.player_roleAccessProfile = {
          canAuthoriseKineticStrike: true, canAuthoriseNuclearRelease: true, canDirectCIAOperations: false,
          canDirectSIGINTCollection: false, canDeployDiplomaticInstruments: true, canRatifyTreaties: true,
          canImposeSanctions: true, canDirectCyberOperations: true, canManageMilitaryPosture: true,
          canDirectEWOperations: true, canPubliclyAttribute: true, canAccessFinancialWeapons: false,
          canManageBlocs: true, canCallUNSCVote: true, covertOperationsMultiplier: 0.6,
          intelligenceQualityBonus: 0, diplomaticCapitalMultiplier: 1.3, militaryReadinessBonus: 20,
          economicInstrumentMultiplier: 0.7, domesticApprovalDecayRate: 0.25, maxSimultaneousOperations: 3,
          maxSimultaneousAPTOperations: 4, maxAmbassadors: 8
        };
     } else if (role === 'CHIEF_OF_INTELLIGENCE') {
        draft.player_roleAccessProfile = {
          canAuthoriseKineticStrike: false, canAuthoriseNuclearRelease: false, canDirectCIAOperations: true,
          canDirectSIGINTCollection: true, canDeployDiplomaticInstruments: false, canRatifyTreaties: false,
          canImposeSanctions: false, canDirectCyberOperations: true, canManageMilitaryPosture: false,
          canDirectEWOperations: false, canPubliclyAttribute: false, canAccessFinancialWeapons: true,
          canManageBlocs: false, canCallUNSCVote: false, covertOperationsMultiplier: 1.8,
          intelligenceQualityBonus: 25, diplomaticCapitalMultiplier: 0.5, militaryReadinessBonus: 0,
          economicInstrumentMultiplier: 1.0, domesticApprovalDecayRate: 0.05, maxSimultaneousOperations: 12,
          maxSimultaneousAPTOperations: 8, maxAmbassadors: 2
        };
     }
  })),

  player_setToneMode: (mode) => set(produce(draft => {
     draft.player_toneMode = mode;
     if (mode === 'REALISM') {
        draft.player_toneModeModifiers = {
          toneMode: 'REALISM', sigintBaseConfidence: 35, humintSuccessModifier: 0.7, attributionAmbiguityLevel: 0.7,
          collateralDamageMultiplier: 2.0, militaryOperationFriction: 0.4, nuclearUsageThreshold: 1,
          allyReliabilityModifier: 0.6, treatyEnforcementStrictness: 0.9, internationalLawConstraint: true,
          coversionDiscoveryBaseRate: 0.18, ciaBlowbackMultiplier: 1.8, plausibleDeniabilityAvailable: true,
          mediaScrutinyLevel: 0.85, domesticApprovalVolatility: 1.5, electionCyclePressure: true,
          sanctionsEvasionBaseRate: 0.35, economicCascadeAmplification: 1.5, operationCodeNamesVisible: true,
          historicalReferencesActive: true, cinematicFrequency: 0.6
        };
     } else if (mode === 'TECHNO_THRILLER') {
        draft.player_toneModeModifiers = {
          toneMode: 'TECHNO_THRILLER', sigintBaseConfidence: 55, humintSuccessModifier: 0.9, attributionAmbiguityLevel: 0.45,
          collateralDamageMultiplier: 1.0, militaryOperationFriction: 0.2, nuclearUsageThreshold: 2,
          allyReliabilityModifier: 0.8, treatyEnforcementStrictness: 0.7, internationalLawConstraint: false,
          coversionDiscoveryBaseRate: 0.10, ciaBlowbackMultiplier: 1.0, plausibleDeniabilityAvailable: true,
          mediaScrutinyLevel: 0.5, domesticApprovalVolatility: 0.9, electionCyclePressure: false,
          sanctionsEvasionBaseRate: 0.20, economicCascadeAmplification: 1.0, operationCodeNamesVisible: true,
          historicalReferencesActive: true, cinematicFrequency: 0.9
        };
     } else if (mode === 'ALTERNATE_HISTORY') {
        draft.player_toneModeModifiers = {
          toneMode: 'ALTERNATE_HISTORY', sigintBaseConfidence: 45, humintSuccessModifier: 0.8, attributionAmbiguityLevel: 0.6,
          collateralDamageMultiplier: 1.2, militaryOperationFriction: 0.3, nuclearUsageThreshold: 2,
          allyReliabilityModifier: 0.7, treatyEnforcementStrictness: 0.8, internationalLawConstraint: false,
          coversionDiscoveryBaseRate: 0.12, ciaBlowbackMultiplier: 1.3, plausibleDeniabilityAvailable: true,
          mediaScrutinyLevel: 0.65, domesticApprovalVolatility: 1.2, electionCyclePressure: false,
          sanctionsEvasionBaseRate: 0.25, economicCascadeAmplification: 1.2, operationCodeNamesVisible: false,
          historicalReferencesActive: false, cinematicFrequency: 0.75
        };
     }
  })),

  player_updateDomesticApproval: (delta, source, description, currentTick) => set(produce(draft => {
     if (!draft.player_domesticApproval) return;
     let nextApp = Math.min(100, Math.max(0, draft.player_domesticApproval.currentApproval + delta));
     draft.player_domesticApproval.currentApproval = nextApp;
     draft.player_domesticApproval.lastChangeTick = currentTick;
     draft.player_domesticApproval.changeLog.unshift({ tick: currentTick, delta, source, description });
     if (draft.player_domesticApproval.changeLog.length > 10) draft.player_domesticApproval.changeLog.pop();
     
     // basic trend
     if (delta > 0) draft.player_domesticApproval.trend = 'RISING';
     else if (delta < 0) draft.player_domesticApproval.trend = 'FALLING';
     else draft.player_domesticApproval.trend = 'STABLE';
     
     draft.player_domesticApproval.crisisMode = (nextApp < 30);
     draft.player_domesticApproval.rallying = (delta > 15);
  })),

  player_beginScenario: (scenarioId, currentTick) => set(produce(draft => {
     draft.player_currentScenarioId = scenarioId;
     draft.player_sessionId = `sess_${Date.now()}`;
     draft.player_domesticApproval.currentApproval = 62;
     draft.player_domesticApproval.crisisMode = false;
  })),

  player_endScenario: (status, currentTick) => {
     const { player_currentScenarioId, player_role, player_toneMode } = get();

     // Cleanly sync and generate modes debrief
     const session = useModesStore.getState().modes_activeSession;
     let modesDebrief: Mode_Debrief | null = null;
     if (session && session.isActive) {
       session.isActive = false;
       session.finalStatus = status;
       modesDebrief = useModesStore.getState().modes_generateDebrief(session);
     }

     const debrief: Mode_Debrief = modesDebrief || {
       scenarioId: player_currentScenarioId || 'SANDBOX_OPEN',
       role: player_role || 'SHADOW_DIRECTOR',
       toneMode: player_toneMode || 'TECHNO_THRILLER',
       status,
       finalScore: 500,
       objectivesAchieved: [],
       objectivesFailed: [],
       keyDecisions: [],
       criticalMoments: [],
       alternativePathways: ['A different diplomatic stance could have lowered tensions earlier.'],
       historicalComparison: 'Completed exercise.',
       directorAssessment: 'The operation concluded with acceptable parameters given the constraints.',
       achievementsUnlocked: [],
       nextRecommendedScenario: null
     };

     set(produce(draft => {
        draft.player_totalPlaythroughs++;
        if (status === 'SUCCESS' || status === 'PARTIAL_SUCCESS') {
          if (!draft.player_completedScenarioIds.includes(debrief.scenarioId)) {
             draft.player_completedScenarioIds.push(debrief.scenarioId);
          }
        }
        draft.player_lastDebriefId = `debrief_${Date.now()}`;
        draft.player_currentScenarioId = null;
        draft.player_sessionId = null;
     }));
     return debrief;
  },

  player_addSandboxObjective: (objective) => {
     const id = `sbx_obj_${Date.now()}`;
     set(produce(draft => {
        draft.player_sandboxObjectives.push({ ...objective, id, isActive: true, achievedAtTick: null });
     }));
     return id;
  },

  player_checkRolePermission: (action) => {
     const profile = get().player_roleAccessProfile;
     if (!profile) return false;
     return !!(profile as Record<string, any>)[action];
  },

  player_replenishApproval: (amount, source, tick) => {
     get().player_updateDomesticApproval(amount, source, 'Replenished', tick);
  }
}));
