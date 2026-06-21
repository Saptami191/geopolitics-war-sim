import React, { useEffect, useState } from 'react';
import { useWorldStore } from './store/worldStore';
import { usePlayerStore } from './store/playerStore';
import { useNuclearStore } from './store/nuclearStore';
import { usePropagandaStore } from './store/propagandaStore';
import { SCENARIOS } from './data/scenarios';
import { initScenario } from './sim/scenarioEngine';
import { restartTickTimer, stopTickTimer, executeSimulationStep } from './sim/tickEngine';
import { ScenarioId } from './types';
import { playGlobeTransition } from './utils/transition';
import { audio } from './utils/audio';
import { useFxStore } from './store/fxStore';
import GlobalFXLayer from './components/fx/GlobalFXLayer';

// Components
import WorldMap from './components/map/WorldMap';
import AllianceGraph from './components/map/AllianceGraph';
import MapControls, { MapLayer } from './components/map/MapControls';
import GovernmentPanel from './components/panels/GovernmentPanel';
import CentralBankPanel from './components/panels/CentralBankPanel';
import ArsenalPanel from './components/panels/ArsenalPanel';
import DiplomacyPanel from './components/panels/DiplomacyPanel';
import CyberPanel from './components/panels/CyberPanel';
import ResearchPanel from './components/panels/ResearchPanel';
import IntelPanel from './components/panels/IntelPanel';
import SpacePanel from './components/panels/SpacePanel';
import PopulationPanel from './components/panels/PopulationPanel';
import PropagandaPanel from './components/panels/PropagandaPanel';
import GothamPanel from './components/panels/GothamPanel';
import FoundryPanel from './components/panels/FoundryPanel';
import FinintPanel from './components/panels/FinintPanel';
import { useFinintStore } from './store/finintStore';
import TradeMatrixPanel from './components/panels/TradeMatrixPanel';
import { useTradeStore } from './store/tradeStore';
import EnergyPanel from './components/panels/EnergyPanel';
import { useEnergyStore } from './store/energyStore';
import SanctionsPanel from './components/panels/SanctionsPanel';
import { useSanctionsStore } from './store/sanctionsStore';
import { usePsyopStore } from './store/psyopStore';
import { PSYOPCommandPanel } from './components/panels/PSYOPCommandPanel';
import { GlobalDisinfoTicker } from './components/reactive/GlobalDisinfoTicker';
import CommandEventBusPanel from './components/panels/CommandEventBusPanel';
import ScenarioPersistencePanel from './components/panels/ScenarioPersistencePanel';
import EconomicForecastPanel from './components/panels/EconomicForecastPanel';
import UNPanel from './components/panels/UNPanel';
import ModesPanel from './components/panels/ModesPanel';
import { ModesWidget } from './components/panels/ModesWidget';
import { useUNStore } from './store/unStore';
import BlocsPanel from './components/panels/BlocsPanel';
import { useBlocStore } from './store/blocStore';
import SoftPowerPanel from './components/panels/SoftPowerPanel';
import { useSoftPowerStore } from './store/softPowerStore';
import { useMirrorStore } from './store/mirrorStore';
import MirrorAdaptationPanel from './components/panels/MirrorAdaptationPanel';
import { useInfluenceStore } from './store/influenceStore';
import AdversarialInfluencePanel from './components/panels/AdversarialInfluencePanel';
import OperativeNetworkPanel from './components/panels/OperativeNetworkPanel';
import { RegimePressurePanel } from './components/panels/RegimePressurePanel';
import CovertFinancePanel from './components/panels/CovertFinancePanel';
import { useCovertFinanceStore } from './store/covertFinanceStore';
import OversightPanel from './components/panels/OversightPanel';
import SigintPanel from './components/panels/SigintPanel';
import U8200CommandPanel from './components/panels/U8200CommandPanel';
import TargetedOperationsPanel from './components/panels/TargetedOperationsPanel';
import EWPanel from './components/panels/EWPanel';
import EWStatusWidget from './components/hud/EWStatusWidget';
import DefenseIndustryPanel from './components/panels/DefenseIndustryPanel';
import DefenseIndustryWidget from './components/hud/DefenseIndustryWidget';
import { CyberOpsPanel } from './components/panels/CyberOpsPanel';
import HumintPenetrationSuite from './components/panels/HumintPenetrationSuite';
import DeceptionOperationsSuite from './components/panels/DeceptionOperationsSuite';
import CounterProliferationSuite from './components/panels/CounterProliferationSuite';
import SigintHUD from './components/panels/SigintHUD';
import { useSigintStore } from './store/sigintStore';
import PoliticalCapitalBar from './components/panels/PoliticalCapitalBar';
import NuclearPosturePanel from './components/panels/NuclearPosturePanel';
import NC3SystemPanel from './components/panels/NC3SystemPanel';
import FalseAlarmDecisionPanel from './components/panels/FalseAlarmDecisionPanel';
import ConventionalOpsPanel from './components/panels/ConventionalOpsPanel';
import A2ADPanel from './components/panels/A2ADPanel';
import { useOperativeStore } from './store/operativeStore';
import { checkAndRestoreSharedScenario, hydrateScenario, ScenarioPackage } from './utils/persistence';

import AnalysisModeSwitcher from './components/map/AnalysisModeSwitcher';
import TimelineStrip from './components/map/TimelineStrip';
import TimelineView from './components/panels/TimelineView';
import AnalysisInspector from './components/panels/AnalysisInspector';
import { useLinkedAnalysisStore } from './store/linkedAnalysisStore';

// Telemetry & feeds
import ThermalRecon, { SatelliteWorkstation } from './components/telemetry/ThermalRecon';
import DroneFeed, { DroneWorkstation } from './components/telemetry/DroneFeed';
import CyberFeed, { CyberWorkstation } from './components/telemetry/CyberFeed';
import HaarpRadar, { HaarpWorkstation } from './components/telemetry/HaarpRadar';
import TerminalShell from './components/shared/TerminalShell';
import AlertBanner from './components/shared/AlertBanner';
import DataTicker from './components/shared/DataTicker';
import CountryInspector from './components/popups/CountryInspector';
import { PostGameDebrief } from './components/debrief/PostGameDebrief';

// Immersion upgrade: Comms
import CommsPanel from './components/hud/CommsPanel';
import CommsSyncController from './components/hud/CommsSyncController';
import DarkMirrorWidget from './components/hud/DarkMirrorWidget';
import CIAStatusWidget from './components/hud/CIAStatusWidget';
import CIAPanel from './components/panels/CIAPanel';

import { useCommsStore } from './store/commsStore';

import CinematicsManager from './components/cinematics/CinematicsManager';
import { useCinematicsStore } from './store/cinematicsStore';

import { useOnboardingStore } from './store/onboardingStore';
import OnboardingHints from './components/hud/OnboardingHints';
import AnimatedValue from './components/shared/AnimatedValue';
import BlinkingDot from './components/shared/BlinkingDot';
import { usePanelAlertState } from './hooks/usePanelAlertState';
import { getPanelAlertSeverity } from './utils/panelAlerts';

// New features Phase 5 - 10
import CinematicIntro from './components/intro/CinematicIntro';
import GameLobby from './components/intro/GameLobby';
import WorldBuilder from './components/worldbuilder/WorldBuilder';
import StockMarketTicker from './components/reactive/StockMarketTicker';
import { useModesStore } from './store/modesStore';
import ModesOnboardingFlow from './components/intro/ModesOnboardingFlow';
import DirectiveObjectiveOverlay from './components/hud/DirectiveObjectiveOverlay';

// Arachne additions
import { useArachneStore } from './store/arachneStore';
import ArachneBriefingModal from './components/shared/ArachneBriefingModal';
import NewspaperFeed from './components/reactive/NewspaperFeed';
import UnSecurityCouncil from './components/reactive/UnSecurityCouncil';
import BlackMarketBazaar from './components/blackmarket/BlackMarketBazaar';
import { useBlackMarketStore } from './store/blackMarketStore';
import { MirrorIntelPanel } from './components/panels/MirrorIntelPanel';
import { LeaderDossierPanel } from './components/panels/LeaderDossierPanel';
import { NationSovereignPanel } from './components/panels/NationSovereignPanel';
import { useRegimePressureStore } from './store/regimePressureStore';
import CommandLogPanel from './components/hud/CommandLogPanel';
import SovereignMonitor from './components/hud/SovereignMonitor';
import SanctionsWidget from './components/hud/SanctionsWidget';
import DiplomacyWidget from './components/hud/DiplomacyWidget';
import CyberWidget from './components/hud/CyberWidget';
import DefconBar from './components/hud/DefconBar';
import FlashPrecedenceBanner from './components/hud/FlashPrecedenceBanner';
import WhiteFlashOverlay from './components/hud/WhiteFlashOverlay';
import { useDefconStore, applyDefconPalette } from './store/defconStore';
import { PANEL_REGISTRY, getAvailablePanels, getAvailablePersonas, PERSONAS } from './config/defconRegistry';
import { PersonaId } from './types';
import { GEO_COORDS } from './data/geoCoords';
import { getTickIncrement } from './sim/militaryEngine';
import { useEconomyStore } from './store/economyStore';
import { useUIStore } from './store/uiStore';
import { useEconomicForecastStore } from './store/economicForecastStore';
import { FullScreenPanel } from './components/shared/FullScreenPanel';

const getTabClassification = (tabId: number): string => {
  switch (tabId) {
    case 1: return "TOP SECRET"; // Government
    case 2: return "CONFIDENTIAL"; // Central bank
    case 3: return "TOP SECRET"; // Arsenal
    case 4: return "SECRET"; // Diplomacy
    case 5: return "RESTRICTED"; // Research
    case 6: return "TOP SECRET"; // Intel
    case 7: return "SECRET"; // Space
    case 8: return "RESTRICTED"; // Population
    case 10: return "COSMIC STRATEGY"; // Event pipeline trace (F10)
    case 11: return "CLASSIFIED ARCHIVE"; // Scenario persistence manager (F11)
    case 12: return "GOTHAM SIGNAL GRAPH"; // Geopolitical network (F12)
    case 13: return "FOUNDRY LOGISTICS"; // Supply-Chain Intelligence (Shift+F1)
    case 14: return "FINANCIAL WARFARE"; // Financial Special Operations (Shift+F2)
    case 15: return "COERCIVE TRADE GRAPH"; // Trade Interdependence (Shift+F3)
    case 16: return "ENERGY INTEGRITY MATRIX"; // Energy System (Shift+F4)
    case 17: return "COERCIVE SANCTIONS MATRIX"; // Sanctions (Shift+F5)
    case 18: return "FINANCIAL HORIZONS FORECAST"; // Forecasting (Shift+F6)
    case 19: return "COSMIC MULTILATERAL UNIT"; // UN & Legal (Shift+F7)
    case 20: return "REGIONAL ALLIANCES CONSOLE"; // Blocs (Shift+F8)
    case 21: return "SOFT POWER & COALITION PRESTIGE"; // Soft power (Shift+F9)
    case 22: return "COGNITIVE MIRROR ARCHIVE"; // Mirror adaptation (Shift+F10)
    case 23: return "COGNITIVE SHIELD & DECEPTION (Shift+F11)"; // Adversarial influence & CI
    case 24: return "NETWORK COMMAND CELL"; // Operative Network Management (Shift+F12)
    case 25: return "REGIME PRESSURE TOOLKIT";
    case 26: return "INFLUENCE & PSYOP";
    case 100: return "NUCLEAR STRATEGIC DETERRENCE EXTREME CLASSIFIED";
    default: return "CONFIDENTIAL";
  }
};

interface TabButtonProps {
  id: number;
  label: string;
  isActive: boolean;
  getTabKPI: (tabId: number) => string;
  onClick: () => void;
  key?: React.Key;
}

function TabButton({ id, label, isActive, getTabKPI, onClick }: TabButtonProps) {
  const { severity, isAlertActive } = usePanelAlertState((worldState, country) => {
    return getPanelAlertSeverity(id, worldState, country);
  });

  const getAlertClass = () => {
    if (severity === 'critical') return 'state-critical';
    if (severity === 'warning') return 'state-warning';
    return '';
  };

  const alertClass = getAlertClass();

  return (
    <button
      onClick={onClick}
      style={{ flexShrink: 0 }}
      className={`btn-sovereign text-[0.65rem] tracking-wider py-1.5 px-1.5 flex flex-col justify-center items-center flex-shrink min-w-0 border rounded transition-all select-none cursor-pointer ${alertClass} ${
        isActive 
          ? 'border-[#00ff44] text-[#00ff44] bg-[#0c1f0d] shadow-[0_0_8px_rgba(0,255,68,0.15)] active' 
          : 'border-[#1a5c1a]/35 bg-[#020502] text-gray-400 hover:border-green-800 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-1 w-full justify-center overflow-hidden">
        {isAlertActive && <BlinkingDot severity={severity} />}
        <span className="font-bold tracking-widest truncate">{label}</span>
      </div>
      <span className="text-[0.6rem] text-[#00e5ff] font-medium mt-0.5 tracking-normal opacity-90 select-none truncate w-full flex justify-center">{getTabKPI(id)}</span>
    </button>
  );
}

function ActivePanelWrapper({ activeTab, getTabClassification }: { activeTab: number, getTabClassification: (tab: number) => string }) {
  const { severity } = usePanelAlertState((worldState, country) => {
    return getPanelAlertSeverity(activeTab, worldState, country);
  });

  const getAlertClass = () => {
    if (severity === 'critical') return 'state-critical';
    if (severity === 'warning') return 'state-warning';
    return '';
  };

  const alertClass = getAlertClass();

  return (
    <div 
      className={`gotham-panel gotham-panel--primary mb-3.5 ${alertClass}`} 
      data-classification={getTabClassification(activeTab)}
      style={{ minHeight: '340px' }}
    >
      {activeTab === 1 && <GovernmentPanel />}
      {activeTab === 2 && <CentralBankPanel />}
      {activeTab === 3 && <ArsenalPanel />}
      {activeTab === 4 && <DiplomacyPanel />}
      {activeTab === 5 && <ResearchPanel />}
      {activeTab === 6 && <IntelPanel />}
      {activeTab === 7 && <SpacePanel />}
      {activeTab === 8 && <PopulationPanel />}
      {activeTab === 9 && <PropagandaPanel />}
      {activeTab === 10 && <CommandEventBusPanel />}
      {activeTab === 11 && <ScenarioPersistencePanel />}
      {activeTab === 12 && <GothamPanel />}
      {activeTab === 13 && <FoundryPanel />}
      {activeTab === 14 && <FinintPanel />}
      {activeTab === 15 && <TradeMatrixPanel />}
      {activeTab === 16 && <EnergyPanel />}
      {activeTab === 17 && <SanctionsPanel />}
      {activeTab === 18 && <EconomicForecastPanel />}
      {activeTab === 19 && <UNPanel />}
      {activeTab === 20 && <BlocsPanel />}
      {activeTab === 21 && <SoftPowerPanel />}
      {activeTab === 22 && <MirrorAdaptationPanel />}
      {activeTab === 23 && <AdversarialInfluencePanel />}
      {activeTab === 24 && <OperativeNetworkPanel />}
      {activeTab === 25 && <RegimePressurePanel />}
      {activeTab === 26 && <PSYOPCommandPanel />}
      {activeTab === 27 && <ConventionalOpsPanel />}
      {activeTab === 28 && <A2ADPanel />}
      {activeTab === 29 && <EWPanel />}
      {activeTab === 30 && <DefenseIndustryPanel />}
      {activeTab === 31 && <CyberOpsPanel />}
      {activeTab === 100 && <NuclearPosturePanel />}
      {activeTab === 101 && <NC3SystemPanel />}
      {activeTab === 102 && <CyberPanel />}
      {activeTab === 103 && <ModesPanel />}
    </div>
  );
}

export default function App() {
  const currentTick = useWorldStore((s) => s.currentTick);
  const countries = useWorldStore((s) => s.countries);

  const expandedWorkstation = useUIStore((s) => s.expandedWorkstation);
  const setExpandedWorkstation = useUIStore((s) => s.setExpandedWorkstation);

  const analysisMode = useLinkedAnalysisStore((s) => s.analysisMode);
  const isMaximized = useLinkedAnalysisStore((s) => s.isMaximized);
  const inspectorCollapsed = useLinkedAnalysisStore((s) => s.inspectorCollapsed);

  const playerCountryId = usePlayerStore((s) => s.countryId);
  const playerState = usePlayerStore();
  const nc3System = useNuclearStore((s) => s.nc3System);
  const worldState = useWorldStore();
  const setTickSpeed = usePlayerStore((s) => s.setTickSpeed);
  const activePersona = useDefconStore((s) => s.activePersona);
  const currentDefconLevel = useDefconStore((s) => s.currentDefconLevel);
  const setPersona = useDefconStore((s) => s.setPersona);
  const suspicion = useBlackMarketStore((s) => s.internationalSuspicion);
  
  const [commsOpen, setCommsOpen] = useState(false);
  const [showBazaar, setShowBazaar] = useState(false);
  const [aftermathCountdown, setAftermathCountdown] = useState<number | null>(null);
  const [showChoices, setShowChoices] = useState(false);
  const [spectatingAftermath, setSpectatingAftermath] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [lobbyActive, setLobbyActive] = useState(true);
  const [worldBuilderActive, setWorldBuilderActive] = useState(false);
  const [scenarioSelected, setScenarioSelected] = useState<ScenarioId | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayer>('POLITICAL');
  const [viewMode, setViewMode] = useState<'MAP' | 'GRAPH'>('MAP');

  const unreadCommsCount = useCommsStore((s) => s.unreadCount);
  const modesOnboardingActive = useModesStore(s => s.modes_isOnboarding);

  const playerExposureScore = useRegimePressureStore(s => s.playerExposureScore);
  const isInputBlocked = useCinematicsStore(s => s.isInputBlocked);

  useEffect(() => {
    if (playerState.aftermathActive) {
      setAftermathCountdown(6); // 6-second dramatic pause for nuclear fallout/impact VFX
      setShowChoices(false);
      setSpectatingAftermath(false);
      
      const interval = setInterval(() => {
        setAftermathCountdown((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(interval);
            setShowChoices(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setAftermathCountdown(null);
      setShowChoices(false);
      setSpectatingAftermath(false);
    }
  }, [playerState.aftermathActive]);

  const playerCountryData = countries[playerCountryId];

  // Real-time State-Driven KPI extractor for each F-Tab
  const getTabKPI = (tabId: number): string => {
    if (!playerCountryData) return '';
    switch (tabId) {
      case 1: { // GOVERNMENT
        const pol = playerCountryData.political;
        return pol ? `unrest:${Math.round(pol.popularUnrest)}% appr:${Math.round(pol.leaderApprovalRating)}%` : '';
      }
      case 2: { // CENTRAL BANK
        const econ = playerCountryData.economic;
        return econ ? `inf:${econ.inflationRate.toFixed(1)}% cash:$${econ.treasuryCashB.toFixed(0)}B` : '';
      }
      case 3: { // ARSENAL
        const ars = playerCountryData.arsenal;
        const count = ars?.units.reduce((sum, u) => sum + u.count, 0) ?? 0;
        return ars ? `stock:${count} abm:${ars.abmShieldStrength}%` : '';
      }
      case 4: { // DIPLOMACY
        const partners = playerCountryData.tradePartners?.length ?? 0;
        return `bloc:${playerCountryData.allianceBlock.substring(0, 4)} part:${partners}`;
      }
      case 5: { // RESEARCH
        const unlockedCount = playerCountryData.researchUnlocked?.length ?? 0;
        return `r&d:${unlockedCount}/6 tech`;
      }
      case 6: { // INTELLIGENCE
        const intel = playerCountryData.intelligence;
        const unread = useArachneStore.getState().unreadAlertCount;
        return intel ? `brief:${unread} ops:${intel.activeCovertOps?.length ?? 0}` : '';
      }
      case 7: { // SPACE
        const sats = playerCountryData.intelligence?.satellites?.length ?? 0;
        return `sats:${sats} haarp:${playerCountryData.haarpActive ? 'active' : 'stby'}`;
      }
      case 8: { // POPULATION
        return `civs:${playerCountryData.population.toFixed(1)}m unrest:${Math.round(playerCountryData.political.popularUnrest)}%`;
      }
      case 9: { // PROPAGANDA
        const opsCount = usePropagandaStore.getState().activeOperations.filter(o => o.createdBy === 'PLAYER' && o.active).length;
        const score = playerCountryData.domesticNarrative ?? 55;
        return `ops:${opsCount} dms:${score.toFixed(0)}%`;
      }
      case 10: { // SHIFT EVENT PIPELINE
        const busHistory = useWorldStore.getState().world?.busEventHistory?.length || 0;
        return `signals:${busHistory} active`;
      }
      case 12: { // GOTHAM GRAPH
        const stability = Math.round(
          Object.values(countries).reduce((sum, n) => sum + (n.political?.stabilityIndex ?? 50), 0) / Object.keys(countries).length
        );
        return `stab:${stability}%`;
      }
      case 13: { // FOUNDRY LOGISTICS
        return `flows:10 secure`;
      }
      case 14: { // FINANCIAL SPECIAL OPERATIONS (FININT)
        return `blowback:${Math.round(useFinintStore.getState().globalAggregatedBlowback)}%`;
      }
      case 15: { // TRADE MATRIX (Shift+F3)
        const campaignsCount = useTradeStore.getState().campaigns.length;
        return `friction:${campaignsCount} active`;
      }
      case 16: { // ENERGY SYSTEM (Shift+F4)
        const embargoesCount = useEnergyStore.getState().activeEmbargoes.length;
        const profile = useEnergyStore.getState().profiles[usePlayerStore.getState().countryId];
        const stress = profile ? profile.domesticStressScore : 0;
        return `stress:${stress}% bans:${embargoesCount}`;
      }
      case 17: { // COERCIVE SANCTIONS (Shift+F5)
        const activeCount = Object.values(useSanctionsStore.getState().campaigns).filter(c => c.status === 'ACTIVE').length;
        return `campaigns:${activeCount}`;
      }
      case 18: { // FINANCIAL HORIZONS (Shift+F6)
        const globalStress = useEconomicForecastStore.getState().calculateWorldEconomicStress().globalStressIndex;
        return `gstress:${globalStress}%`;
      }
      case 19: { // UN & LEGAL INSTITUTIONS
        const unscStore = useUNStore.getState();
        const activeResCount = Object.values(unscStore.resolutions).filter((r: any) => r.status === 'LOBBYING_STAGE' || r.status === 'SPONSORSHIP_STAGE').length;
        const activeCasesCount = Object.values(unscStore.icjCases).filter((c: any) => c.proceduralStage !== 'DECIDED' && c.proceduralStage !== 'DISMISSED').length;
        return `unsc:${activeResCount} active:${activeCasesCount}`;
      }
      case 20: { // REGIONAL BLOCS
        const blocStore = useBlocStore.getState();
        const natoCohesion = blocStore.organizations.NATO?.cohesion?.overallScore ?? 78;
        const bricsCohesion = blocStore.organizations.BRICS?.cohesion?.overallScore ?? 66;
        return `nato:${natoCohesion}% brics:${bricsCohesion}%`;
      }
      case 21: { // SOFT POWER
        const spStore = useSoftPowerStore.getState();
        const pId = usePlayerStore.getState().countryId || 'US';
        const reach = spStore.profiles[pId]?.index?.globalCompositeScore ?? 50;
        return `prestige:${reach}%`;
      }
      case 22: { // MIRROR ADAPTATION
        const mirrorStore = useMirrorStore.getState();
        const fp = mirrorStore.fingerprint.substring(0, 10).toLowerCase().replace('_', '-');
        return `fp:${fp} stab:${mirrorStore.stability.coreStability}%`;
      }
      case 23: { // ADVERSARIAL INFLUENCE & COGNITIVE SHIELD
        const infl = useInfluenceStore.getState();
        return `sus:${infl.warningMetrics.deceptionSuspicion}% poison:${infl.warningMetrics.contaminationLevel}%`;
      }
      case 24: { // OPERATIVE NETWORK
        const store = useOperativeStore.getState();
        const burned = Object.values(store.operatives).filter(o => o.state === 'BURNED').length;
        const active = Object.values(store.operatives).filter(o => o.state === 'ACTIVE').length;
        return `assets:${active} burned:${burned}`;
      }
      case 25: { // REGIME PRESSURE
        return `toolkit:online`;
      }
      case 26: { // INFLUENCE & PSYOP
        const activeCamps = Object.keys(usePsyopStore.getState().narrativeCampaigns).length;
        return `camps:${activeCamps}`;
      }
      default:
        return '';
    }
  };

  // Initiate scenario from lobby selection
  const selectScenario = (id: ScenarioId, playableCountryId?: string, customOptions?: any) => {
    const config = SCENARIOS[id];
    if (!config) return;

    audio.resume();

    const selectedCountryId = playableCountryId || config.playableCountryIds[0] || 'US';

    initScenario(id, selectedCountryId, customOptions?.leaderOverrides);

    setScenarioSelected(id);
    setLobbyActive(false);
    setTickSpeed('NORMAL');

    playGlobeTransition(() => {
      restartTickTimer();
    });
  };

  // Initiate custom sandbox from WorldBuilder selection
  const launchSandbox = (selectedCountryId: string, options: any) => {
    audio.resume();
    audio.sfxKlaxon();

    initScenario('MENA_SPARK', selectedCountryId); // Core structures setup

    useWorldStore.getState().applyTickDelta((draft) => {
      draft.currentTick = 0;
      draft.globalThreatLevel = options.tensionPreset === 'INFERNO' ? 'RED' : options.tensionPreset === 'WORLD_ON_EDGE' ? 'ORANGE' : 'GREEN';
      draft.nuclearExchangeOccurred = false;
      draft.activeStrikes = [];

      Object.keys(draft.countries).forEach((id) => {
        const c = draft.countries[id];
        if (c) {
          if (options.tensionPreset === 'COLD_PEACE') {
            c.atWarWith = [];
            Object.keys(c.opinions).forEach((k) => { c.opinions[k] = 60; });
          } else if (options.tensionPreset === 'INFERNO') {
            c.atWarWith = Object.keys(draft.countries).filter((ni) => ni !== id).slice(0, 3);
            Object.keys(c.opinions).forEach((k) => { c.opinions[k] = -80; });
          }
          c.economic.treasuryCashB = Math.round(c.economic.treasuryCashB * options.spendingMultiplier * 10) / 10;
        }
      });
    });

    setScenarioSelected('MENA_SPARK');
    setLobbyActive(false);
    setWorldBuilderActive(false);
    setTickSpeed('NORMAL');

    playGlobeTransition(() => {
      restartTickTimer();
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Standard F1 - F11 tab switcher
      if (e.key >= 'F1' && e.key <= 'F9') {
        e.preventDefault();
        const tabNum = parseInt(e.key.substring(1), 10);
        audio.sfxKeyClick();
        usePlayerStore.getState().setActiveTab(tabNum);
        return;
      }

      if (e.key === 'F10' || e.key === 'F11' || e.key === 'F12') {
        e.preventDefault();
        const tabNum = parseInt(e.key.substring(1), 10);
        audio.sfxKeyClick();
        usePlayerStore.getState().setActiveTab(tabNum);
        return;
      }

      // Check Shift+F1 for Foundry Logistics routing console
      if (e.key === 'F1' && e.shiftKey) {
        e.preventDefault();
        audio.sfxKeyClick();
        usePlayerStore.getState().setActiveTab(13);
        return;
      }

      // Check Shift+F2 for Financial Warfare (FININT) command console
      if (e.key === 'F2' && e.shiftKey) {
        e.preventDefault();
        audio.sfxKeyClick();
        usePlayerStore.getState().setActiveTab(14);
        return;
      }

      // Check Shift+F3 for Trade Interdependence (TRADE MATRIX) command console
      if (e.key === 'F3' && e.shiftKey) {
        e.preventDefault();
        audio.sfxKeyClick();
        usePlayerStore.getState().setActiveTab(15);
        return;
      }

      // Check Shift+F4 for Energy Security command console
      if (e.key === 'F4' && e.shiftKey) {
        e.preventDefault();
        audio.sfxKeyClick();
        usePlayerStore.getState().setActiveTab(16);
        return;
      }

      // Check Shift+F5 for Coercive Sanctions console
      if (e.key === 'F5' && e.shiftKey) {
        e.preventDefault();
        audio.sfxKeyClick();
        usePlayerStore.getState().setActiveTab(17);
        return;
      }

      // Check Shift+F6 for Financial Horizons forecast console
      if (e.key === 'F6' && e.shiftKey) {
        e.preventDefault();
        audio.sfxKeyClick();
        usePlayerStore.getState().setActiveTab(18);
        return;
      }

      // Check Shift+F7 for UN Security Council & Legal Institutions command console
      if (e.key === 'F7' && e.shiftKey) {
        e.preventDefault();
        audio.sfxKeyClick();
        usePlayerStore.getState().setActiveTab(19);
        return;
      }

      // Check Shift+F8 for Regional Blocs command console
      if (e.key === 'F8' && e.shiftKey) {
        e.preventDefault();
        audio.sfxKeyClick();
        usePlayerStore.getState().setActiveTab(20);
        return;
      }

      // Check Shift+F9 for Soft Power command console
      if (e.key === 'F9' && e.shiftKey) {
        e.preventDefault();
        audio.sfxKeyClick();
        usePlayerStore.getState().setActiveTab(21);
        return;
      }

      // Check Shift+F10 for Mirror Adaptation command console
      if (e.key === 'F10' && e.shiftKey) {
        e.preventDefault();
        audio.sfxKeyClick();
        usePlayerStore.getState().setActiveTab(22);
        return;
      }

      // Check Shift+F11 for Adversarial Influence & Cognitive Shield command console
      if (e.key === 'F11' && e.shiftKey) {
        e.preventDefault();
        audio.sfxKeyClick();
        usePlayerStore.getState().setActiveTab(23);
        return;
      }

      // Check Shift+F12 for Operative Network Management console
      if (e.key === 'F12' && e.shiftKey) {
        e.preventDefault();
        audio.sfxKeyClick();
        usePlayerStore.getState().setActiveTab(24);
        return;
      }
      
      // Check Alt+1 for Regime Pressure toolkit
      if (e.key === '1' && e.altKey) {
        e.preventDefault();
        audio.sfxKeyClick();
        usePlayerStore.getState().setActiveTab(25);
        return;
      }

      // Check key 'c' to toggle Comms Center
      if (e.key.toLowerCase() === 'c' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        const isInputActive = document.activeElement && (
          document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA' ||
          document.activeElement.tagName === 'SELECT' ||
          document.activeElement.getAttribute('contenteditable') === 'true'
        );
        if (!isInputActive) {
          e.preventDefault();
          audio.sfxKeyClick();
          setCommsOpen((prev) => !prev);
          return;
        }
      }

      // Check key 'u' to toggle U8200 Command active panel
      if (e.key.toLowerCase() === 'u' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        const isInputActive = document.activeElement && (
          document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA' ||
          document.activeElement.tagName === 'SELECT' ||
          document.activeElement.getAttribute('contenteditable') === 'true'
        );
        if (!isInputActive) {
          e.preventDefault();
          audio.sfxKeyClick();
          const activeId = useUIStore.getState().activePanelId;
          if (activeId === 'U8200_COMMAND') {
            useUIStore.getState().setActivePanelId(null);
          } else {
            useUIStore.getState().setActivePanelId('U8200_COMMAND');
          }
          return;
        }
      }
      
      // Check Alt+2 for Nuclear Posture
      if (e.key === '2' && e.altKey) {
        e.preventDefault();
        audio.sfxKeyClick();
        usePlayerStore.getState().setActiveTab(100);
        return;
      }

      // 2. Alt combinations for strategic rapid actions
      if (e.altKey) {
        const key = e.key.toLowerCase();
        
        // Safety guard: ignore if typing in fields or selectors
        const isInputActive = document.activeElement && (
          document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA' ||
          document.activeElement.tagName === 'SELECT' ||
          document.activeElement.getAttribute('contenteditable') === 'true'
        );
        if (isInputActive) return;

        const pCountry = countries[playerCountryId];
        if (!pCountry) return;

        if (key === 'm') {
          // Alt+M: Toggle Martial Law
          e.preventDefault();
          let nextActiveState = false;
          useWorldStore.getState().applyTickDelta((draft) => {
            const c = draft.countries[playerCountryId];
            if (c) {
              if (c.political.martialLawActive) {
                c.political.martialLawActive = false;
                c.political.martialLawTicksRemaining = 0;
              } else {
                c.political.martialLawActive = true;
                c.political.martialLawTicksRemaining = 25;
                c.political.stabilityIndex = Math.min(100, c.political.stabilityIndex + 15);
                c.political.popularUnrest = Math.max(0, c.political.popularUnrest - 20);
                nextActiveState = true;
              }
            }
          });
          
          audio.sfxKeyClick();
          useWorldStore.getState().addGlobalEvent(
            `Federal martial decree updated in ${pCountry.name}: Status is ${nextActiveState ? 'OPERATIONAL' : 'DORMANT'}.`,
            nextActiveState ? 'WARNING' : 'INFO'
          );

          useUIStore.getState().pushAlert({
            title: nextActiveState ? 'MARTIAL LAW ENFORCED' : 'MARTIAL LAW STAND-DOWN',
            message: nextActiveState 
              ? 'Sovereign forces deployed to metropolitan sectors. Unrest is suppressed, borders secured.'
              : 'Emergency martial guidelines lifted. Democratic channels restored.',
            type: nextActiveState ? 'WARNING' : 'INFO'
          });
        } else if (key === 'b') {
          // Alt+B: Issue Sovereign Bonds
          e.preventDefault();
          const bondAmt = 10;
          const bondRate = 5.5;
          const bondTicks = 20;

          useWorldStore.getState().applyTickDelta((draft) => {
            const c = draft.countries[playerCountryId];
            if (c) {
              c.economic.treasuryCashB += bondAmt;
              c.economic.debtToGdpRatio += Math.round((bondAmt / c.economic.gdpB) * 100);
              c.economic.bonds.push({
                id: `bond_${Math.random().toString().substring(2,6)}`,
                amount: bondAmt,
                interestRate: bondRate,
                maturityTicks: bondTicks,
                remainingTicks: bondTicks,
                holder: 'MARKET',
              });
            }
          });
          usePlayerStore.setState({ cashB: usePlayerStore.getState().cashB + bondAmt });

          audio.sfxKeyClick();
          useWorldStore.getState().addGlobalEvent(`Bond Desk: Discharged $${bondAmt}B treasury bills via Alt+B.`, 'INFO');
          
          useUIStore.getState().pushAlert({
            title: 'BOND ENVELOPE ISSUED (ALT+B)',
            message: `Distributed $${bondAmt}B sovereign treasury bills at ${bondRate}% APY maturing in ${bondTicks} ticks. Cash injected immediately.`,
            type: 'INFO'
          });
        } else if (key === 'p') {
          // Alt+P: Toggle Printing Press
          e.preventDefault();
          let isPrinting = false;
          useWorldStore.getState().applyTickDelta((draft) => {
            const c = draft.countries[playerCountryId];
            if (c) {
              c.economic.printingPressActive = !c.economic.printingPressActive;
              isPrinting = c.economic.printingPressActive;
            }
          });

          audio.sfxKeyClick();
          useWorldStore.getState().addGlobalEvent(`Central Bank: Printing press toggled via Hotkey. Status: ${isPrinting ? 'ACTIVE' : 'INACTIVE'}.`, 'INFO');
          
          useUIStore.getState().pushAlert({
            title: isPrinting ? 'PRINTING PRESS ENGAGED' : 'PRINTING PRESS HALTED',
            message: isPrinting 
              ? 'Quantitative easing active. Treasury gains instant liquidity but fuels inflation index risk.' 
              : 'Sovereign currency printing stopped.',
            type: isPrinting ? 'WARNING' : 'INFO'
          });
        } else if (key === 'r') {
          // Alt+R: Refuel All Missiles
          e.preventDefault();
          const cost = 2.0;
          if (usePlayerStore.getState().cashB < cost) {
            audio.sfxKeyClick();
            useUIStore.getState().pushAlert({
              title: 'REFUELLING DIRECTIVE REJECTED',
              message: 'Treasury bounds error: Refuelling operation requires $2.0B.',
              type: 'DANGER'
            });
            return;
          }

          usePlayerStore.setState(s => ({ cashB: s.cashB - cost }));
          usePlayerStore.getState().syncCashToCountry();

          audio.sfxKeyClick();
          useWorldStore.getState().addGlobalEvent('Logistics Desk: Propellant full fuel charge injected via Alt+R.', 'INFO');
          
          useUIStore.getState().pushAlert({
            title: 'FLEET FUEL RESET (ALT+R)',
            message: 'All ordnance missile compartments refueled to 100% and ready to launch.',
            type: 'INFO'
          });
        } else if (key === 'l') {
          // Alt+L: Deploy Tactical Rocket Strike
          e.preventDefault();
          const targetId = usePlayerStore.getState().selectedTargetCountryId;
          if (!targetId) {
            audio.sfxKeyClick();
            useUIStore.getState().pushAlert({
              title: 'LAUNCH ABORTED: OFF-LOCK',
              message: 'System lock error: Assign a target from the world map directory to input lock-on telemetry coordinate.',
              type: 'DANGER'
            });
            return;
          }
          if (targetId === playerCountryId) {
            audio.sfxKeyClick();
            useUIStore.getState().pushAlert({
              title: 'LAUNCH FAILS: TARGET INVALID',
              message: 'Launch failed: Self-targeting Capital assets triggered security lock safeguards.',
              type: 'DANGER'
            });
            return;
          }

          // Choose the first weapon with quantity > 0
          let pickedWeaponModule: any = null;
          useWorldStore.getState().applyTickDelta((draft) => {
            const p = draft.countries[playerCountryId];
            if (p) {
              const u = p.arsenal.units.find(ut => ut.count > 0 && ut.fuelLevel >= 20);
              if (u) {
                pickedWeaponModule = u.type;
                u.count--;
                u.operational = u.count;
              }
            }
          });

          if (!pickedWeaponModule) {
            audio.sfxKeyClick();
            useUIStore.getState().pushAlert({
              title: 'WEAPON COLD LOCK',
              message: 'Ordnance failed: No in-stock missile units available in weapons bunkers, or fuel is depleted (<20%).',
              type: 'DANGER'
            });
            return;
          }

          audio.sfxMissileLaunch();
          const scCoords = GEO_COORDS[playerCountryId];
          const tgCoords = GEO_COORDS[targetId];
          const sx = scCoords ? scCoords.cx : 500;
          const sy = scCoords ? scCoords.cy : 250;
          const tx = tgCoords ? tgCoords.cx : 400;
          const ty = tgCoords ? tgCoords.cy : 200;
          const tickDist = Math.max(8, Math.round(100 / getTickIncrement(pickedWeaponModule)));

          useWorldStore.getState().applyTickDelta((draft) => {
            draft.activeStrikes.push({
              id: `strike_alt_${Math.random().toString().substring(2, 8)}`,
              sourceCountryId: playerCountryId,
              targetCountryId: targetId,
              weaponType: pickedWeaponModule,
              progressPct: 0,
              status: 'IN_FLIGHT',
              bezier: {
                startX: sx,
                startY: sy,
                controlX: (sx + tx) / 2,
                controlY: Math.min(sy, ty) - 150,
                endX: tx,
                endY: ty,
              },
              launchTick: currentTick,
              impactTick: currentTick + tickDist,
              isRetaliatory: false,
              interceptAttempted: false,
            });
            draft.globalEventLog.unshift({
              tick: currentTick,
              text: `WAR CLERK: Dispatched 1x ${pickedWeaponModule.replace('_', ' ')} targeting ${targetId} via Rapid Strike Hotkey [AL+L].`,
              severity: 'CRITICAL',
            });
          });

          // Record Military player action for Mirror Adaptation
          useMirrorStore.getState().recordPlayerAction('MILITARY', 20, currentTick);

          // Trigger cinematic FX in unified store Bus
          useFxStore.getState().triggerFx({
            type: 'MISSILE_LAUNCH',
            severity: 'HIGH',
            triggerTick: currentTick,
            expiryTick: currentTick + 3,
            durationMs: 1200,
            sourceCountryId: playerCountryId,
            targetCountryId: targetId,
            payload: { weaponType: pickedWeaponModule }
          });

          useUIStore.getState().pushAlert({
            title: 'RAPID MISSILE DEPLOYED (ALT+L)',
            message: `1x Operational "${pickedWeaponModule.replace('_', ' ')}" launched out of silos, targeting [${targetId}]. ETA: ${tickDist} T.`,
            type: 'WARNING'
          });
        } else if (key === 'a') {
          // Alt+A: Dispatch Foreign Aid
          e.preventDefault();
          const targetId = usePlayerStore.getState().selectedTargetCountryId;
          if (!targetId || targetId === playerCountryId) {
            audio.sfxKeyClick();
            useUIStore.getState().pushAlert({
              title: 'FOREIGN AID DENIED',
              message: 'Direct transfer failed: Select a foreign sovereign target to compile aid allocation parameters.',
              type: 'DANGER'
            });
            return;
          }

          const aidAmt = 5.0;
          if (usePlayerStore.getState().cashB < aidAmt) {
            audio.sfxKeyClick();
            useUIStore.getState().pushAlert({
              title: 'FOREIGN AID BLOCKED',
              message: `Liquidity warning: Sovereign treasury bounds exceeded. Requires $${aidAmt}B cash.`,
              type: 'DANGER'
            });
            return;
          }

          usePlayerStore.setState(s => ({ cashB: s.cashB - aidAmt }));
          usePlayerStore.getState().syncCashToCountry();

          useWorldStore.getState().applyTickDelta((draft) => {
            const tgt = draft.countries[targetId];
            if (tgt) {
              tgt.economic.treasuryCashB += aidAmt;
              tgt.opinions[playerCountryId] = Math.min(100, (tgt.opinions[playerCountryId] ?? 0) + 15);
            }
          });

          audio.sfxKeyClick();
          useWorldStore.getState().addGlobalEvent(`State Ministry: Sent $${aidAmt}B in direct economic aid to ${targetId} via ALT+A.`, 'INFO');
          
          useUIStore.getState().pushAlert({
            title: 'FOREIGN AID TRANSCRIBED (ALT+A)',
            message: `Dispatched an official $${aidAmt}B aid package to ${targetId}. opinion rating improved.`,
            type: 'INFO'
          });
        } else if (key === 's') {
          // Alt+S: Impose Sanctions
          e.preventDefault();
          const targetId = usePlayerStore.getState().selectedTargetCountryId;
          const tgtC = countries[targetId || ''];
          if (!targetId || targetId === playerCountryId || !tgtC) {
            audio.sfxKeyClick();
            useUIStore.getState().pushAlert({
              title: 'SANCTIONS DISENGAGED',
              message: 'Execution error: Select an operational target country to impose embargo parameters.',
              type: 'DANGER'
            });
            return;
          }

          useEconomyStore.getState().imposeSanction(playerCountryId, targetId);
          audio.sfxKeyClick();
          
          useWorldStore.getState().addGlobalEvent(`BLOCKADE DECREE: Placed aggregate sanctions on ${targetId} via Rapid Command [Alt+S].`, 'WARNING');
          
          // Trigger sanctions ESCALATION in cinematic fxStore Bus
          useFxStore.getState().triggerFx({
            type: 'SANCTIONS_ESCALATION',
            severity: 'MEDIUM',
            triggerTick: currentTick,
            expiryTick: currentTick + 4,
            durationMs: 1800,
            sourceCountryId: playerCountryId,
            targetCountryId: targetId,
            payload: {}
          });

          useUIStore.getState().pushAlert({
            title: 'TRADE EMBARGO RATIFIED (ALT+S)',
            message: `Sovereign trade block imposed blockades on all import tech-transfers involving [${targetId}].`,
            type: 'WARNING'
          });
        } else if (key === 't') {
          // Alt+T: Partnership Pact
          e.preventDefault();
          const targetId = usePlayerStore.getState().selectedTargetCountryId;
          const tgtC = countries[targetId || ''];
          if (!targetId || targetId === playerCountryId || !tgtC) {
            audio.sfxKeyClick();
            useUIStore.getState().pushAlert({
              title: 'TREATY RATIFICATION FAILED',
              message: 'Execution error: Select an allied candidate country to propose border alignments.',
              type: 'DANGER'
            });
            return;
          }

          if ((tgtC.opinions[playerCountryId] ?? 0) < 55) {
            audio.sfxKeyClick();
            useUIStore.getState().pushAlert({
              title: 'ALLIANCE NEGOTIATIONS FAILED',
              message: `Treaty rejected: ${tgtC.name} opinion of player block is too low (${Math.round(tgtC.opinions[playerCountryId] ?? 0)}/55 ratio limit).`,
              type: 'WARNING'
            });
            return;
          }

          useWorldStore.getState().applyTickDelta((draft) => {
            const playerC = draft.countries[playerCountryId];
            const targetC = draft.countries[targetId];
            if (playerC && targetC) {
              if (targetC.allianceBlock !== 'NEUTRAL') {
                playerC.allianceBlock = targetC.allianceBlock;
              } else {
                if (!playerC.tradePartners.includes(targetId)) {
                  playerC.tradePartners.push(targetId);
                }
              }
              if (playerC.allianceBlock === 'NEUTRAL' && !targetC.tradePartners.includes(playerCountryId)) {
                targetC.tradePartners.push(playerCountryId);
              }
            }
          });

          audio.sfxKeyClick();
          useWorldStore.getState().addGlobalEvent(`TREATY RATIFIED: Formalized Mutual Defensive Pact aligned with ${targetId} [Alt+T].`, 'INFO');
          
          useUIStore.getState().pushAlert({
            title: 'PARTNERSHIP SIGNED (ALT+T)',
            message: `Ratified bilateral defensive parameters with ${tgtC.name}. Border lines synchronized.`,
            type: 'INFO'
          });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [countries, playerCountryId, currentTick]);

  const resolution: 'ONGOING' | 'VICTORY' | 'DEFEAT' = playerState.victoryAchieved
    ? 'VICTORY'
    : playerState.gameOver
    ? 'DEFEAT'
    : 'ONGOING';

  const isDebriefOpen = ((resolution !== 'ONGOING') || (playerState.aftermathActive && showChoices)) && !spectatingAftermath;
  const isMapFullyHidden = isDebriefOpen || (expandedWorkstation !== null) || showBazaar;

  // 4. Main Dashboard Simulation View
  return (
    <div className="h-screen w-screen bg-[#030503] text-xs font-mono overflow-hidden">
      {showIntro && <CinematicIntro onComplete={() => setShowIntro(false)} />}
      {!showIntro && modesOnboardingActive && <ModesOnboardingFlow />}
      {!showIntro && !modesOnboardingActive && worldBuilderActive && (
        <WorldBuilder
          onLaunchSandbox={launchSandbox}
          onBack={() => setWorldBuilderActive(false)}
        />
      )}
      {!showIntro && !modesOnboardingActive && !worldBuilderActive && lobbyActive && (
        <GameLobby
          onStartScenario={selectScenario}
          onOpenWorldBuilder={() => setWorldBuilderActive(true)}
          onResumeScenario={(pkg: ScenarioPackage) => {
            audio.resume();
            audio.sfxSuccessConfirmation();
            const res = hydrateScenario(pkg);
            if (res.success) {
              setScenarioSelected(pkg.playerState.activeScenario);
              setShowIntro(false);
              setLobbyActive(false);
              setWorldBuilderActive(false);
              useUIStore.getState().pushAlert({
                title: 'PROJECTION RESUMED',
                message: `Restored active projection "${pkg.scenarioName}" at Tick ${pkg.worldState.currentTick}.`,
                type: 'INFO'
              });
              playGlobeTransition(() => {
                restartTickTimer();
              });
            } else {
              audio.sfxCrisisWarning();
              alert(`FAILED TO RESUME DIRECTIVE: ${res.error}`);
            }
          }}
        />
      )}
      {!showIntro && !modesOnboardingActive && !worldBuilderActive && !lobbyActive && (
        <div id="sovereign-fx-shake-root" className="w-full h-full flex flex-col relative" style={{ willChange: 'transform', pointerEvents: isInputBlocked ? 'none' : 'auto' }}>
          {/* Popups, Alerts & Bazaar overlays */}
          <GlobalFXLayer />
          <CountryInspector />
          <AlertBanner />
          <OnboardingHints />
          {showBazaar && <BlackMarketBazaar onClose={() => setShowBazaar(false)} />}
          <CommsSyncController />
          <CommsPanel isOpen={commsOpen} onClose={() => setCommsOpen(false)} />
          <FalseAlarmDecisionPanel />
          <CinematicsManager />

          {/* Top command status HUD bar */}
          <DefconBar />
          <FlashPrecedenceBanner />

          {/* Dynamic Objective Completion Widget Overlay */}
          <div className="absolute right-4 top-20 z-40 pointer-events-none">
            <DirectiveObjectiveOverlay />
          </div>

          {/* Header bar */}
          <header className="w-full h-11 bg-[#040804] border-b border-[#1a3a1a] flex justify-between items-center px-4 shrink-0 select-none">
            {/* ... rest of header content ... */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-black tracking-widest text-[#00ff44] text-shadow-sm uppercase">
                SOVEREIGN COMMAND HUB
              </span>
              <div className="hidden lg:flex items-center gap-3 border-l border-[#1a3a1a] pl-4 text-[10px] opacity-80 uppercase text-gray-500">
                <span>PLAYER BASE: {playerCountryId} {playerCountryData?.flagEmoji}</span>
                <span>TICK CLOCK: {currentTick}</span>
                <span>TREASURY RES: $<AnimatedValue target={playerState.cashB} formatter={(v) => v.toFixed(1)} />B</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {['SLOW', 'NORMAL', 'FAST'].map(speed => (
                <button key={speed} onClick={() => setTickSpeed(speed as any)} className="text-[0.6rem] border p-1 text-[#00ff44] hover:bg-[#1a3a1a]">
                  {speed}
                </button>
              ))}
              <button 
                onClick={() => {
                   const s = useModesStore.getState();
                   const running = !s.modes_activeSession?.isPaused;
                   if (running) {
                      s.modes_pauseSession();
                      stopTickTimer();
                   } else {
                      s.modes_resumeSession();
                      restartTickTimer();
                   }
                }} 
                className="text-[0.6rem] border p-1 text-[#00ff44] hover:bg-[#1a3a1a]"
              >
                PAUSE/RESUME
              </button>
              {getAvailablePersonas(currentDefconLevel).map(persona => (
                <button key={persona.id} onClick={() => setPersona(persona.id as any)} className={activePersona === persona.id ? 'text-[#00ff44] font-bold' : 'text-gray-500'}>
                  {persona.name}
                </button>
              ))}
              <button onClick={() => setShowBazaar(true)} className="text-[0.6rem] border p-1 text-[#00ff44]">BLACK MARKET</button>
              <button onClick={() => setCommsOpen(true)} className="relative text-[0.6rem] border p-1 text-[#00ff44]">
                COMMS
                {unreadCommsCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 rounded-full text-xs px-1 text-white">{unreadCommsCount}</span>}
              </button>
              <div className="text-[0.6rem] text-gray-500">EXP: {playerExposureScore}</div>
            </div>
          </header>

          <DataTicker />

          {/* Major split sections */}
          <div className="flex-1 flex overflow-hidden w-full relative">
            <div className="flex-1 flex overflow-hidden w-full relative">
              {/* LEFT SIDE — Tab Button Sidebar */}
              <div className="w-48 overflow-y-auto bg-[#020502] p-1 flex flex-col gap-1 border-r border-[#1a3a1a]">
                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,100,101,102,103].map(n => (
                  <TabButton key={n} id={n} label={n <= 31 ? `${n}` : `N${n}`} isActive={playerState.activeTab === n} getTabKPI={getTabKPI} onClick={() => usePlayerStore.getState().setActiveTab(n)} />
                ))}
              </div>

              {/* CENTER — Main Content Surface */}
              <div className="flex-1 relative flex flex-col">
                {!isMapFullyHidden && (
                  <>
                    <div className="absolute top-0 left-0 right-0 z-10 p-2">
                       <AnalysisModeSwitcher />
                    </div>
                    {viewMode === 'MAP' && !analysisMode ? <WorldMap activeLayer={activeLayer} /> : null}
                    {viewMode === 'GRAPH' && <AllianceGraph />}
                    {analysisMode && <AnalysisInspector />}
                    <MapControls setActiveLayer={setActiveLayer} activeLayer={activeLayer} />
                    <TimelineStrip />
                  </>
                )}
                {playerState.activeTab === 999 && <TimelineView />}
                <div className="flex-1 overflow-y-auto min-h-0">
                   <ActivePanelWrapper activeTab={playerState.activeTab} getTabClassification={getTabClassification} />
                </div>
              </div>

              {/* RIGHT SIDE — HUD Widget Column */}
              <div className="w-64 overflow-y-auto bg-[#020502] p-2 border-l border-[#1a3a1a] flex flex-col gap-2">
                 <SovereignMonitor />
                 <DarkMirrorWidget />
                 <div style={{ minHeight: '80px', position: 'relative' }}>
                   <CIAStatusWidget />
                 </div>
                 <div style={{ minHeight: '80px', position: 'relative' }}>
                   <SanctionsWidget />
                 </div>
                 <DiplomacyWidget />
                 <div style={{ minHeight: '80px', position: 'relative' }}>
                   <CyberWidget />
                 </div>
                 <EWStatusWidget />
                 <DefenseIndustryWidget />
                 <SigintHUD onClick={() => useUIStore.getState().setActivePanelId('SIGINT')} />
                 <PoliticalCapitalBar onClick={() => useUIStore.getState().setActivePanelId('OVERSIGHT')} />
                 <CommandLogPanel />
                 <StockMarketTicker />
                 <NewspaperFeed />
                 <UnSecurityCouncil />
                 <ModesWidget onClick={() => usePlayerStore.getState().setActiveTab(103)} />
              </div>

              {/* WORKSTATION OVERLAYS */}
              {expandedWorkstation === 'SATELLITE' && <ThermalRecon onExpand={() => setExpandedWorkstation('SATELLITE')} onCollapse={() => setExpandedWorkstation(null)} />}
              {expandedWorkstation === 'DRONE' && <DroneFeed onExpand={() => setExpandedWorkstation('DRONE')} onCollapse={() => setExpandedWorkstation(null)} />}
              {expandedWorkstation === 'CYBER' && <CyberFeed onExpand={() => setExpandedWorkstation('CYBER')} onCollapse={() => setExpandedWorkstation(null)} />}
              {expandedWorkstation === 'HAARP' && <HaarpRadar onExpand={() => setExpandedWorkstation('HAARP')} onCollapse={() => setExpandedWorkstation(null)} />}
            </div>
          </div>

          {/* Bottom telemetry text logs shell console */}
          <TerminalShell />

          {/* Full Screen Panel Content Wrapper */}
          <FullScreenPanel>
              {useUIStore.getState().activePanelId === 'U8200_COMMAND' && <U8200CommandPanel onClose={() => useUIStore.getState().setActivePanelId(null)} />}
              {useUIStore.getState().activePanelId === 'CIA' && <CIAPanel onClose={() => useUIStore.getState().setActivePanelId(null)} />}
              {useUIStore.getState().activePanelId === 'TARGETED_OPS' && <TargetedOperationsPanel onClose={() => useUIStore.getState().setActivePanelId(null)} />}
              {useUIStore.getState().activePanelId === 'HUMINT_SUITE' && <HumintPenetrationSuite onClose={() => useUIStore.getState().setActivePanelId(null)} />}
              {useUIStore.getState().activePanelId === 'DECEPTION_OPS' && <DeceptionOperationsSuite onClose={() => useUIStore.getState().setActivePanelId(null)} />}
              {useUIStore.getState().activePanelId === 'COUNTER_PROLIF' && <CounterProliferationSuite onClose={() => useUIStore.getState().setActivePanelId(null)} />}
              {useUIStore.getState().activePanelId === 'SIGINT' && <SigintPanel onClose={() => useUIStore.getState().setActivePanelId(null)} />}
              {useUIStore.getState().activePanelId === 'COVERT_FINANCE' && <CovertFinancePanel onClose={() => useUIStore.getState().setActivePanelId(null)} />}
              {useUIStore.getState().activePanelId === 'OVERSIGHT' && <OversightPanel onClose={() => useUIStore.getState().setActivePanelId(null)} />}
              {useUIStore.getState().activePanelId === 'MIRROR_INTEL' && <MirrorIntelPanel /> /* NOTE: MirrorIntelPanel does not have onClose prop */}
              {useUIStore.getState().activePanelId === 'LEADER_DOSSIER' && <LeaderDossierPanel />  /* NOTE: LeaderDossierPanel doesn't either */}
              {useUIStore.getState().activePanelId === 'NATION_SOVEREIGN' && <NationSovereignPanel /> }
              {useUIStore.getState().activePanelId === 'NUCLEAR_POSTURE' && <NuclearPosturePanel /> }
              {useUIStore.getState().activePanelId === 'NC3' && <NC3SystemPanel /> }
              {useUIStore.getState().activePanelId === 'FALSE_ALARM' && <FalseAlarmDecisionPanel /> }
            </FullScreenPanel>

          {/* Overlays */}
          {playerState.aftermathActive && aftermathCountdown !== null && aftermathCountdown > 0 && (
            <div className="fixed bottom-14 left-1/2 transform -translate-x-1/2 z-40 bg-black/95 border border-red-500/50 text-red-500 px-6 py-3 rounded shadow-2xl flex items-center gap-3 animate-pulse font-mono tracking-wider max-w-xl text-center">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0" />
              <span className="text-xs uppercase font-bold text-shadow">
                [ DIRECT DIRECTIVE RESOLUTION: SECURING TRANS-ATMOSPHERIC SIGNALS... COUNTDOWN ({aftermathCountdown}S) ]
              </span>
            </div>
          )}

          {spectatingAftermath && (
            <button
              onClick={() => setSpectatingAftermath(false)}
              className={`fixed top-14 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-black/95 border rounded-md text-shadow font-black uppercase tracking-widest text-[10px] cursor-pointer animate-pulse shadow-lg ${
                playerState.aftermathType === 'VICTORY' 
                  ? 'border-[#00ff44] text-[#00ff44] hover:bg-[#00ff44]/15' 
                  : 'border-[#ff2244] text-[#ff2244] hover:bg-[#ff2244]/15'
              }`}
            >
              [ RE-OPEN SIMULATION RESOLUTION MODULE ]
            </button>
          )}

          {isDebriefOpen && (
            <PostGameDebrief
              id="tactical-post-game-debrief-overlay"
              worldState={worldState}
              playerState={{
                ...playerState,
                rollbackToCheckpoint: () => {
                  setSpectatingAftermath(false);
                  playerState.rollbackToCheckpoint();
                }
              }}
              onSpectate={() => setSpectatingAftermath(true)}
              onRestart={() => {
                stopTickTimer();
                window.location.reload();
              }}
            />
          )}

          {/* Presidential Daily Briefing Card Stack Overlay */}
          <ArachneBriefingModal />
          <WhiteFlashOverlay />
        </div>
      )}
    </div>
  );
}
