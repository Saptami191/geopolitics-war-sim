import { create } from 'zustand';
import { produce } from 'immer';
import { PlayerState, HUDMode, ScenarioId, BallisticStrike } from '../types';
import { useWorldStore } from './worldStore';
import { useUIStore } from './uiStore';
import { useClockStore } from './clockStore';
import { useUnitStore } from './unitStore';
import { useBlackMarketStore } from './blackMarketStore';

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
}));
