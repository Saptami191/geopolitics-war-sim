import { create } from 'zustand';
import { produce } from 'immer';
import { useDefconStore, DefconLevel } from './defconStore';
import { useWorldStore } from './worldStore';
import { useConsequenceStore } from './consequenceStore';
import { useCinematicsStore } from './cinematicsStore';
import { useFxStore } from './fxStore';
import { usePlayerStore } from './playerStore';
import { useTreatyStore } from './treatyStore';
import { useUNStore } from './unStore';
import { useOversightStore } from './oversightStore';
import { useMirrorStore } from './mirrorStore';
import { useSigintStore } from './sigintStore';
import { useDeceptionStore } from './deceptionStore';
import { useHumintStore } from './humintStore';
import { useLeaderStore } from './leaderStore';
import { useNationIdentityStore } from './nationIdentityStore';
import { audio } from '../utils/audio';
import { tickNuclearAI } from '../sim/nuclearAI';

import { 
  NuclearTriadLeg, 
  NuclearWeaponStatus, 
  NuclearWeaponClass, 
  NuclearWeapon,
  TriadPostureLevel,
  TriadPostureConfig,
  NC3Channel,
  NC3ChannelStatus,
  NC3SystemState,
  AuthorityStatus,
  LaunchAuthorityState,
  NuclearLaunchOption,
  NuclearLaunchOptionSpec,
  NuclearTabooState,
  NuclearUseEvent,
  FalseAlarmType,
  FalseAlarmEvent,
  DeadHandState,
  NuclearDetonationConsequences,
  NuclearScar,
  AdversaryPosture
} from '../types';

// Read initial values from localStorage for persistent preservation across reloads
const LOCAL_STORAGE_SCARS_KEY = 'sovereign_nuclear_scars';
const LOCAL_STORAGE_MEGATONS_KEY = 'sovereign_nuclear_megatons';

const initialScars: NuclearScar[] = (() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LOCAL_STORAGE_SCARS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved nuclear scars:', e);
      }
    }
  }
  return [];
})();

const initialMegatons = (() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LOCAL_STORAGE_MEGATONS_KEY);
    if (saved) {
      const parsed = parseFloat(saved);
      return isNaN(parsed) ? 0 : parsed;
    }
  }
  return 0;
})();

const DEFAULT_WEAPONS: NuclearWeapon[] = [
  // US Weapons
  { id: 'US-ICBM-01', class: 'ICBM_MINUTEMAN', leg: 'ICBM', countryId: 'US', status: 'MATED', yieldKt: 475, canReach: ['RU', 'CN', 'IR', 'KP'], deploymentBase: 'Malmstrom AFB Silo 1', isOnAlert: true, palUnlocked: false, authenticationComplete: false, createdTick: 0, launchedTick: null, targetCountryId: null, targetLat: null, targetLon: null, flightTimeMinutes: 30, isRecallable: false, survivabilityScore: 85 },
  { id: 'US-ICBM-02', class: 'ICBM_MINUTEMAN', leg: 'ICBM', countryId: 'US', status: 'MATED', yieldKt: 475, canReach: ['RU', 'CN', 'IR', 'KP'], deploymentBase: 'Minot AFB Silo 2', isOnAlert: true, palUnlocked: false, authenticationComplete: false, createdTick: 0, launchedTick: null, targetCountryId: null, targetLat: null, targetLon: null, flightTimeMinutes: 30, isRecallable: false, survivabilityScore: 85 },
  { id: 'US-ICBM-03', class: 'ICBM_MINUTEMAN', leg: 'ICBM', countryId: 'US', status: 'MATED', yieldKt: 350, canReach: ['RU', 'CN', 'IR', 'KP'], deploymentBase: 'F.E. Warren AFB Silo 3', isOnAlert: true, palUnlocked: false, authenticationComplete: false, createdTick: 0, launchedTick: null, targetCountryId: null, targetLat: null, targetLon: null, flightTimeMinutes: 30, isRecallable: false, survivabilityScore: 85 },
  { id: 'US-SLBM-01', class: 'SLBM_TRIDENT', leg: 'SLBM', countryId: 'US', status: 'MATED', yieldKt: 100, canReach: ['RU', 'CN', 'IR', 'KP'], deploymentBase: 'USS Ohio (SSBN-726)', isOnAlert: true, palUnlocked: false, authenticationComplete: false, createdTick: 0, launchedTick: null, targetCountryId: null, targetLat: null, targetLon: null, flightTimeMinutes: 22, isRecallable: false, survivabilityScore: 98 },
  { id: 'US-SLBM-02', class: 'SLBM_TRIDENT', leg: 'SLBM', countryId: 'US', status: 'MATED', yieldKt: 100, canReach: ['RU', 'CN', 'IR', 'KP'], deploymentBase: 'USS Louisiana (SSBN-743)', isOnAlert: true, palUnlocked: false, authenticationComplete: false, createdTick: 0, launchedTick: null, targetCountryId: null, targetLat: null, targetLon: null, flightTimeMinutes: 22, isRecallable: false, survivabilityScore: 98 },
  { id: 'US-BOMBER-01', class: 'BOMBER_B52', leg: 'BOMBER', countryId: 'US', status: 'STORED', yieldKt: 170, canReach: ['RU', 'CN', 'IR', 'KP'], deploymentBase: 'Barksdale AFB', isOnAlert: false, palUnlocked: false, authenticationComplete: false, createdTick: 0, launchedTick: null, targetCountryId: null, targetLat: null, targetLon: null, flightTimeMinutes: 180, isRecallable: true, survivabilityScore: 70 },
  { id: 'US-BOMBER-02', class: 'BOMBER_B2', leg: 'BOMBER', countryId: 'US', status: 'STORED', yieldKt: 360, canReach: ['RU', 'CN', 'IR', 'KP'], deploymentBase: 'Whiteman AFB', isOnAlert: false, palUnlocked: false, authenticationComplete: false, createdTick: 0, launchedTick: null, targetCountryId: null, targetLat: null, targetLon: null, flightTimeMinutes: 150, isRecallable: true, survivabilityScore: 78 },

  // Russian Weapons
  { id: 'RU-ICBM-01', class: 'ICBM_SARMAT', leg: 'ICBM', countryId: 'RU', status: 'MATED', yieldKt: 800, canReach: ['US', 'GB', 'FR', 'DE'], deploymentBase: 'Sarmat Silo Pod 4', isOnAlert: true, palUnlocked: false, authenticationComplete: false, createdTick: 0, launchedTick: null, targetCountryId: null, targetLat: null, targetLon: null, flightTimeMinutes: 30, isRecallable: false, survivabilityScore: 80 },
  { id: 'RU-SLBM-01', class: 'SLBM_BULAVA', leg: 'SLBM', countryId: 'RU', status: 'STORED', yieldKt: 150, canReach: ['US', 'GB', 'FR', 'DE'], deploymentBase: 'Yury Dolgorukiy SSBN', isOnAlert: false, palUnlocked: false, authenticationComplete: false, createdTick: 0, launchedTick: null, targetCountryId: null, targetLat: null, targetLon: null, flightTimeMinutes: 25, isRecallable: false, survivabilityScore: 95 },
  { id: 'RU-BOMBER-01', class: 'BOMBER_TU95', leg: 'BOMBER', countryId: 'RU', status: 'STORED', yieldKt: 200, canReach: ['US', 'GB', 'FR', 'DE'], deploymentBase: 'Engels Air Base', isOnAlert: false, palUnlocked: false, authenticationComplete: false, createdTick: 0, launchedTick: null, targetCountryId: null, targetLat: null, targetLon: null, flightTimeMinutes: 210, isRecallable: true, survivabilityScore: 60 }
];

const INITIAL_LA: LaunchAuthorityState = {
  status: 'DORMANT',
  initiatedByWarning: null,
  warningConfidence: 0,
  assessmentTick: null,
  assessmentComplete: false,
  consultationComplete: false,
  authorizationGranted: false,
  authorizationGrantedTick: null,
  authorizationCode: null,
  twoManRuleComplete: false,
  palUnlockComplete: false,
  selectedOption: null,
  executionOrderSent: false,
  executionOrderTick: null,
  decisionDeadlineTick: null,
  timeRemainingToDecisionSeconds: 0,
  preDelegationActive: false,
  preDelegationCountryIds: []
};

const INITIAL_NC3: NC3SystemState = {
  overallIntegrity: 100,
  channels: {
    NMCC_LANDLINE: { channel: 'NMCC_LANDLINE', integrity: 100, isActive: true, degradedByEW: false, degradedByCyber: false, degradedByNuclearEMP: false, lastSuccessfulTransmissionTick: 0, reliabilityPct: 95 },
    STRATCOM_BROADCAST: { channel: 'STRATCOM_BROADCAST', integrity: 100, isActive: true, degradedByEW: false, degradedByCyber: false, degradedByNuclearEMP: false, lastSuccessfulTransmissionTick: 0, reliabilityPct: 92 },
    AEHF_SATELLITE: { channel: 'AEHF_SATELLITE', integrity: 100, isActive: true, degradedByEW: false, degradedByCyber: false, degradedByNuclearEMP: false, lastSuccessfulTransmissionTick: 0, reliabilityPct: 88 },
    VLF_SUBMARINE: { channel: 'VLF_SUBMARINE', integrity: 100, isActive: true, degradedByEW: false, degradedByCyber: false, degradedByNuclearEMP: false, lastSuccessfulTransmissionTick: 0, reliabilityPct: 80 },
    TACAMO_AIRCRAFT: { channel: 'TACAMO_AIRCRAFT', integrity: 100, isActive: true, degradedByEW: false, degradedByCyber: false, degradedByNuclearEMP: false, lastSuccessfulTransmissionTick: 0, reliabilityPct: 85 },
    EMP_HARDENED_WIRE: { channel: 'EMP_HARDENED_WIRE', integrity: 100, isActive: true, degradedByEW: false, degradedByCyber: false, degradedByNuclearEMP: false, lastSuccessfulTransmissionTick: 0, reliabilityPct: 70 },
    DEAD_HAND_AUTO: { channel: 'DEAD_HAND_AUTO', integrity: 100, isActive: false, degradedByEW: false, degradedByCyber: false, degradedByNuclearEMP: false, lastSuccessfulTransmissionTick: 0, reliabilityPct: 99 }
  },
  eamQueueLength: 0,
  lastEAMDeliveredTick: 0,
  communicationsRedundancyScore: 100,
  isDecapitationRisk: false
};

const INITIAL_LAUNCH_OPTIONS: NuclearLaunchOptionSpec[] = [
  {
    option: 'ABSORB_AND_RESPOND',
    label: 'Absorb and Respond',
    description: 'Ride out the incoming strike. Launch surviving assets in retaliation. Maximum moral and legal clarity. Some assets may be destroyed.',
    weaponsRequired: 1,
    estimatedCasualties: 8000000,
    escalationProbability: 0.85,
    tabooErosionDelta: 25,
    allianceCohesionDelta: -10,
    politicalCapitalCost: 200,
    isRecallable: false,
    requiresPresidentialConsent: true,
    requiresCongressionalConsult: true,
    minimumDefconLevel: 2,
    legalStatusUnderIHL: 'ARGUABLY_LAWFUL'
  },
  {
    option: 'LAUNCH_UNDER_ATTACK',
    label: 'Launch Under Attack',
    description: 'Launch before incoming warheads detonate. High confidence required. Irreversible. Maximizes asset survival.',
    weaponsRequired: 3,
    estimatedCasualties: 25000000,
    escalationProbability: 0.90,
    tabooErosionDelta: 30,
    allianceCohesionDelta: -20,
    politicalCapitalCost: 250,
    isRecallable: false,
    requiresPresidentialConsent: true,
    requiresCongressionalConsult: false,
    minimumDefconLevel: 2,
    legalStatusUnderIHL: 'CONTESTED'
  },
  {
    option: 'LAUNCH_ON_WARNING',
    label: 'Launch on Warning',
    description: 'Launch on sensor warning only, before confirmed detonation. Maximum positive control. Maximum accident risk. Catastrophic if warning is false.',
    weaponsRequired: 4,
    estimatedCasualties: 30000000,
    escalationProbability: 0.95,
    tabooErosionDelta: 35,
    allianceCohesionDelta: -30,
    politicalCapitalCost: 300,
    isRecallable: false,
    requiresPresidentialConsent: true,
    requiresCongressionalConsult: false,
    minimumDefconLevel: 1,
    legalStatusUnderIHL: 'CONTESTED'
  },
  {
    option: 'DEMONSTRATION_SHOT',
    label: 'Demonstration Shot',
    description: 'Single detonation at uninhabited location or at sea. Signal resolve without mass casualties. Nuclear taboo crossed but limited. Adversary may not be deterred.',
    weaponsRequired: 1,
    estimatedCasualties: 0,
    escalationProbability: 0.45,
    tabooErosionDelta: 40,
    allianceCohesionDelta: -5,
    politicalCapitalCost: 150,
    isRecallable: false,
    requiresPresidentialConsent: true,
    requiresCongressionalConsult: true,
    minimumDefconLevel: 2,
    legalStatusUnderIHL: 'CONTESTED'
  },
  {
    option: 'LIMITED_NUCLEAR_OPTION',
    label: 'Limited Nuclear Option',
    description: 'Precision counterforce strike on identified military targets only. Intended to demonstrate resolve and degrade adversary capability without mass civilian casualties.',
    weaponsRequired: 2,
    estimatedCasualties: 3500000,
    escalationProbability: 0.65,
    tabooErosionDelta: 50,
    allianceCohesionDelta: -15,
    politicalCapitalCost: 350,
    isRecallable: false,
    requiresPresidentialConsent: true,
    requiresCongressionalConsult: true,
    minimumDefconLevel: 2,
    legalStatusUnderIHL: 'CONTESTED'
  },
  {
    option: 'MAJOR_ATTACK_OPTION',
    label: 'Major Attack Option',
    description: 'Full counterforce exchange targeting military infrastructure, command centers, and hardened sites. Hundreds to thousands of warheads. Civilization-ending potential.',
    weaponsRequired: 6,
    estimatedCasualties: 120000000,
    escalationProbability: 0.99,
    tabooErosionDelta: 100,
    allianceCohesionDelta: -80,
    politicalCapitalCost: 1000,
    isRecallable: false,
    requiresPresidentialConsent: true,
    requiresCongressionalConsult: false,
    minimumDefconLevel: 1,
    legalStatusUnderIHL: 'CLEARLY_PROHIBITED'
  },
  {
    option: 'COUNTERVALUE_STRIKE',
    label: 'Countervalue Strike',
    description: 'Deliberately targeting civilian population centers and economic infrastructure. Maximum psychological impact. Clear violation of international humanitarian law.',
    weaponsRequired: 5,
    estimatedCasualties: 85000000,
    escalationProbability: 1.0,
    tabooErosionDelta: 100,
    allianceCohesionDelta: -90,
    politicalCapitalCost: 800,
    isRecallable: false,
    requiresPresidentialConsent: true,
    requiresCongressionalConsult: false,
    minimumDefconLevel: 1,
    legalStatusUnderIHL: 'CLEARLY_PROHIBITED'
  },
  {
    option: 'EMP_FIRST_STRIKE',
    label: 'EMP First Strike',
    description: 'Single warhead detonated at 400km altitude over adversary territory. No direct blast casualties. Destroys unshielded electronics and NC3 infrastructure. Disables advertising retaliation capacity.',
    weaponsRequired: 1,
    estimatedCasualties: 5000,
    escalationProbability: 0.70,
    tabooErosionDelta: 45,
    allianceCohesionDelta: -25,
    politicalCapitalCost: 400,
    isRecallable: false,
    requiresPresidentialConsent: true,
    requiresCongressionalConsult: false,
    minimumDefconLevel: 2,
    legalStatusUnderIHL: 'CONTESTED'
  },
  {
    option: 'WITHHOLD',
    label: 'Withhold Usage',
    description: 'Explicit decision not to use nuclear weapons. Absorb attack. Pursue other options. The only option that does not breach the nuclear taboo.',
    weaponsRequired: 0,
    estimatedCasualties: 0,
    escalationProbability: 0.0,
    tabooErosionDelta: 0,
    allianceCohesionDelta: 50,
    politicalCapitalCost: 0,
    isRecallable: true,
    requiresPresidentialConsent: false,
    requiresCongressionalConsult: false,
    minimumDefconLevel: 5,
    legalStatusUnderIHL: 'ARGUABLY_LAWFUL'
  }
];

const INITIAL_TABOO: NuclearTabooState = {
  globalTabooIntactness: 100,
  firstUseOccurred: false,
  firstUseTick: null,
  firstUseCountryId: null,
  useEvents: [],
  adversaryWillingnessMultiplier: 1.0,
  un_condemnationCount: 0,
  allianceTabooErosion: {}
};

interface NuclearState {
  nuclearScars: NuclearScar[];
  totalMegatons: number;
  flashOpacity: number; // 0 to 1
  addScar: (lat: number, lon: number, megatons: number) => void;
  triggerFlash: () => void;
  decrementFlash: (delta: number) => void;
  clearScars: () => void;

  // New expanded features (Section 2)
  weapons: Record<string, NuclearWeapon>;
  playerWeaponCount: number;
  playerMegaYieldTotal: number;
  triadPosture: Record<NuclearTriadLeg, TriadPostureLevel>;
  postureConfig: TriadPostureConfig;
  launchAuthority: LaunchAuthorityState;
  nc3System: NC3SystemState;
  availableLaunchOptions: NuclearLaunchOptionSpec[];
  selectedLaunchOption: NuclearLaunchOption | null;
  tabooState: NuclearTabooState;
  falseAlarmHistory: FalseAlarmEvent[];
  deadHand: DeadHandState;
  detonationConsequences: NuclearDetonationConsequences[];
  decisionClockActive: boolean;
  decisionClockExpiryTick: number | null;

  // Actions
  initializeWeaponInventory: (countryId: string, weapons: NuclearWeapon[]) => void;
  updateWeaponStatus: (weaponId: string, status: NuclearWeaponStatus) => void;
  targetWeapon: (weaponId: string, targetCountryId: string, lat: number, lon: number) => void;
  recallWeapon: (weaponId: string) => void;
  setTriadPosture: (leg: NuclearTriadLeg, level: TriadPostureLevel) => void;
  respondToDefconChange: (newDefcon: number) => void;

  initiateWarningAssessment: (
    warningSource: string,
    perceivedThreatCountryId: string,
    initialConfidence: number,
    currentTick: number
  ) => void;
  completeAssessmentPhase: (
    confirmedThreat: boolean,
    finalConfidence: number,
    currentTick: number
  ) => void;
  completeCivilianConsultation: (currentTick: number) => void;
  grantPresidentialAuthorization: (currentTick: number) => void;
  completePALAuthentication: (currentTick: number) => void;
  completeTwoManRule: (currentTick: number) => void;
  selectLaunchOption: (option: NuclearLaunchOption, currentTick: number) => void;
  transmitExecutionOrder: (currentTick: number) => boolean;
  standDownFromLaunch: (reason: string, currentTick: number) => void;
  activatePreDelegation: (toCountryIds: string[], currentTick: number) => void;

  degradeNC3Channel: (channel: NC3Channel, delta: number, cause: 'EW' | 'CYBER' | 'EMP') => void;
  restoreNC3Channel: (channel: NC3Channel, delta: number) => void;
  calculateNC3Integrity: () => void;
  attemptEAMTransmission: (currentTick: number) => boolean;

  executeNuclearDetonation: (
    weaponId: string,
    lat: number,
    lon: number,
    currentTick: number
  ) => void;

  recordNuclearUseEvent: (event: NuclearUseEvent) => void;
  applyTabooErosion: (delta: number) => void;

  triggerFalseAlarm: (type: FalseAlarmType, perceivedThreatCountryId: string, currentTick: number) => void;
  resolveFalseAlarm: (falseAlarmId: string, wasCorrectlyHandled: boolean, currentTick: number) => void;

  activateDeadHand: (currentTick: number) => void;
  deactivateDeadHand: () => void;

  startDecisionClock: (expiryTick: number) => void;
  expireDecisionClock: (currentTick: number) => void;

  // Adversary Nuclear AI integration
  adversaryPosture: Record<string, AdversaryPosture>;
  updateAdversaryPosture: (countryId: string, updates: Partial<AdversaryPosture>) => void;
  getAdversaryPosture: (countryId: string) => AdversaryPosture | undefined;

  tickNuclear: (currentTick: number) => void;
}

// Map DEFAULT_WEAPONS to record
const defaultWeaponRecord: Record<string, NuclearWeapon> = {};
DEFAULT_WEAPONS.forEach(w => {
  defaultWeaponRecord[w.id] = w;
});

export const useNuclearStore = create<NuclearState>((set, get) => ({
  nuclearScars: initialScars,
  totalMegatons: initialMegatons,
  flashOpacity: 0,

  // Initialize new state fields
  weapons: defaultWeaponRecord,
  playerWeaponCount: DEFAULT_WEAPONS.filter(w => w.countryId === 'US').length,
  playerMegaYieldTotal: DEFAULT_WEAPONS.filter(w => w.countryId === 'US').reduce((acc, w) => acc + w.yieldKt, 0) / 1000,
  triadPosture: {
    ICBM: 'PEACETIME',
    SLBM: 'PEACETIME',
    BOMBER: 'PEACETIME'
  },
  postureConfig: {
    bomberPosture: 'PEACETIME',
    icbmPosture: 'PEACETIME',
    slbmPosture: 'PEACETIME',
    escalationRisk: 5,
    accidentProbability: 0.001,
    survivabilityBonus: 0,
    recallWindowMinutes: 180
  },
  launchAuthority: INITIAL_LA,
  nc3System: INITIAL_NC3,
  availableLaunchOptions: INITIAL_LAUNCH_OPTIONS,
  selectedLaunchOption: null,
  tabooState: INITIAL_TABOO,
  falseAlarmHistory: [],
  deadHand: {
    isActive: false,
    activationCondition: null,
    triggerThreshold: 80,
    activatedTick: null,
    launchAuthorizedBySystem: false,
    countermeasuresAvailable: true
  },
  detonationConsequences: [],
  decisionClockActive: false,
  decisionClockExpiryTick: null,

  adversaryPosture: {
    RU: { countryId: 'RU', posture: 'PEACETIME', retaliationPressure: 0, lastEscalationTick: null, launchCommitted: false },
    CN: { countryId: 'CN', posture: 'PEACETIME', retaliationPressure: 0, lastEscalationTick: null, launchCommitted: false },
    KP: { countryId: 'KP', posture: 'PEACETIME', retaliationPressure: 0, lastEscalationTick: null, launchCommitted: false }
  },

  addScar: (lat, lon, megatons) => {
    const newScar: NuclearScar = {
      id: `scar-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lat,
      lon,
      radius: 0.05 + Math.min(0.03, megatons * 0.008), // size scales slightly with megatons, approx 200km to 300km
      megatons,
      timestamp: Date.now()
    };

    const nextScars = [...get().nuclearScars, newScar].slice(-15); // Keep last 15 scars for shader/perf safety
    const nextMegatons = get().totalMegatons + megatons;

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_SCARS_KEY, JSON.stringify(nextScars));
      localStorage.setItem(LOCAL_STORAGE_MEGATONS_KEY, nextMegatons.toString());
    }

    set({
      nuclearScars: nextScars,
      totalMegatons: nextMegatons
    });

    // Decrease DEFCON level on nuclear impact of any yield
    const currentDefcon = useDefconStore.getState().currentDefconLevel;
    if (currentDefcon > 1) {
      const nextDefcon = (currentDefcon - 1) as DefconLevel;
      const currentTick = useWorldStore.getState().currentTick;
      useDefconStore.getState().setDefconLevel(nextDefcon, 'SYSTEM', 'Nuclear detonation detected', currentTick);
    }
  },

  triggerFlash: () => {
    set({ flashOpacity: 1.0 });
  },

  decrementFlash: (delta) => {
    set((state) => ({ flashOpacity: Math.max(0, state.flashOpacity - delta) }));
  },

  clearScars: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_SCARS_KEY);
      localStorage.setItem(LOCAL_STORAGE_MEGATONS_KEY, '0');
    }
    set({ nuclearScars: [], totalMegatons: 0 });
  },

  // ─── PART 2 ACTIONS IMPLEMENTATION ───

  initializeWeaponInventory: (countryId, weaponsArray) => {
    set(produce((draft: NuclearState) => {
      weaponsArray.forEach(w => {
        draft.weapons[w.id] = w;
      });
      if (countryId === 'US') {
        const playerWeapons = Object.values(draft.weapons).filter(w => w.countryId === 'US');
        draft.playerWeaponCount = playerWeapons.length;
        draft.playerMegaYieldTotal = playerWeapons.reduce((sum, w) => sum + w.yieldKt, 0) / 1000;
      }
    }));
  },

  updateWeaponStatus: (weaponId, status) => {
    set(produce((draft: NuclearState) => {
      const w = draft.weapons[weaponId];
      if (w) {
        w.status = status;
        if (status === 'ON_ALERT') {
          w.isOnAlert = true;
        }
      }
    }));
  },

  targetWeapon: (weaponId, targetCountryId, lat, lon) => {
    set(produce((draft: NuclearState) => {
      const w = draft.weapons[weaponId];
      if (w) {
        w.targetCountryId = targetCountryId;
        w.targetLat = lat;
        w.targetLon = lon;
        w.status = 'MATED';
      }
    }));
  },

  recallWeapon: (weaponId) => {
    set(produce((draft: NuclearState) => {
      const w = draft.weapons[weaponId];
      if (w && w.leg === 'BOMBER' && w.status === 'AIRBORNE') {
        w.status = 'ON_ALERT';
        w.launchedTick = null;
        w.targetCountryId = null;
        w.targetLat = null;
        w.targetLon = null;
        const currentTick = useWorldStore.getState().currentTick;
        useWorldStore.getState().addGlobalEvent(`BOMBERS RECALLED: Airborne bombers returned to base under nuclear strike standby.`, 'INFO');
      }
    }));
  },

  setTriadPosture: (leg, level) => {
    set(produce((draft: NuclearState) => {
      draft.triadPosture[leg] = level;
      
      // Posture upgrade risk recalculation
      let baseRisk = 5;
      let accProb = 0.001;
      
      Object.entries(draft.triadPosture).forEach(([l, lvl]) => {
        if (lvl === 'ELEVATED') { baseRisk += 10; accProb += 0.002; }
        if (lvl === 'STRIP_ALERT') { baseRisk += 20; accProb += 0.005; }
        if (lvl === 'SURGE') { baseRisk += 35; accProb += 0.010; }
        if (lvl === 'HAIR_TRIGGER') { baseRisk += 55; accProb += 0.025; }
      });
      
      draft.postureConfig.escalationRisk = Math.min(100, baseRisk);
      draft.postureConfig.accidentProbability = Math.min(0.5, accProb);

      if (leg === 'SLBM') {
        draft.postureConfig.survivabilityBonus = level === 'SURGE' ? 30 : level === 'HAIR_TRIGGER' ? 40 : 0;
      }
    }));
  },

  respondToDefconChange: (newDefcon) => {
    // Subscriber responding to defconStore changes
    const self = get();
    if (newDefcon === 5) {
      self.setTriadPosture('BOMBER', 'PEACETIME');
      self.setTriadPosture('ICBM', 'PEACETIME');
      self.setTriadPosture('SLBM', 'PEACETIME');
    } else if (newDefcon === 4) {
      self.setTriadPosture('BOMBER', 'ELEVATED');
    } else if (newDefcon === 3) {
      self.setTriadPosture('BOMBER', 'STRIP_ALERT');
      self.setTriadPosture('ICBM', 'ELEVATED');
      self.setTriadPosture('SLBM', 'ELEVATED');
    } else if (newDefcon === 2) {
      self.setTriadPosture('BOMBER', 'SURGE');
      self.setTriadPosture('ICBM', 'SURGE');
      self.setTriadPosture('SLBM', 'SURGE');
    } else if (newDefcon === 1) {
      self.setTriadPosture('BOMBER', 'HAIR_TRIGGER');
      self.setTriadPosture('ICBM', 'HAIR_TRIGGER');
      self.setTriadPosture('SLBM', 'HAIR_TRIGGER');
      
      // Auto assemble authority chain
      set(produce((draft: NuclearState) => {
        if (draft.launchAuthority.status === 'DORMANT') {
          draft.launchAuthority.status = 'MONITORING';
        }
      }));
    }
  },

  initiateWarningAssessment: (warningSource, perceivedThreatCountryId, initialConfidence, currentTick) => {
    set(produce((draft: NuclearState) => {
      // Calculate false alarm probability based on NC3 integrity and paranoia modifier
      let falseAlarmProb = (100 - draft.nc3System.overallIntegrity) * 0.4 + 5;
      
      // Check leader psychological volatility
      const leaderStore = useLeaderStore.getState();
      const firstLeader = leaderStore.getLeader(perceivedThreatCountryId) || leaderStore.getLeader('RU');
      if (firstLeader) {
        const volatility = firstLeader.psychology?.emotions.anxiety || Math.round(firstLeader.riskTolerance * 100);
        const paranoiaSpike = firstLeader.psychology?.emotions.paranoiaSpike || Math.round(firstLeader.hawkDoveScore * 100);
        if (volatility > 75) falseAlarmProb += 15;
        if (paranoiaSpike > 80) falseAlarmProb += 20;
      }

      if (Math.random() < (falseAlarmProb / 100)) {
        // Divert to triggering a false alarm event
        const types: FalseAlarmType[] = ['SENSOR_MALFUNCTION', 'COMPUTER_ERROR', 'EXERCISE_CONFUSION', 'WEATHER_ARTIFACT'];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        
        draft.launchAuthority.status = 'WARNING_RECEIVED';
        draft.launchAuthority.initiatedByWarning = warningSource;
        draft.launchAuthority.warningConfidence = initialConfidence;
        draft.launchAuthority.assessmentTick = currentTick;
        
        // Trigger false alarm tracking
        const alarmId = `ALARM-${Date.now()}`;
        draft.falseAlarmHistory.push({
          id: alarmId,
          type: chosenType,
          tick: currentTick,
          detectedByCountryId: 'US',
          perceivedThreatFromCountryId: perceivedThreatCountryId,
          confidenceAtDetection: initialConfidence,
          wasCorrectlyResolved: false,
          resolutionTick: null,
          nearLaunchReached: false,
          worldEventGenerated: true
        });

        // Cinematic Queue
        useCinematicsStore.getState().queueScene({
          type: 'NUCLEAR_LAUNCH_AUTHORIZATION',
          totalPhases: 5,
          phaseDurationMs: 4000,
          blocksInput: true,
          isSkippable: true,
          autoAdvance: true,
          payload: { warningSource, perceivedThreatCountryId, initialConfidence, alarmId }
        });

        audio.playCinematicCue('NUCLEAR_LAUNCH_AUTHORIZATION', 0);
      } else {
        // Genuine Warning received!
        draft.launchAuthority.status = 'WARNING_RECEIVED';
        draft.launchAuthority.initiatedByWarning = warningSource;
        draft.launchAuthority.warningConfidence = initialConfidence;
        draft.launchAuthority.assessmentTick = currentTick;
        draft.launchAuthority.decisionDeadlineTick = currentTick + 10; // 10 ticks to respond
        draft.decisionClockActive = true;
        draft.decisionClockExpiryTick = currentTick + 10;

        useCinematicsStore.getState().queueScene({
          type: 'NUCLEAR_LAUNCH_AUTHORIZATION',
          totalPhases: 5,
          phaseDurationMs: 6000,
          blocksInput: true,
          isSkippable: false,
          autoAdvance: true,
          payload: { warningSource, perceivedThreatCountryId, initialConfidence }
        });

        audio.playCinematicCue('NUCLEAR_LAUNCH_AUTHORIZATION', 0);
      }
    }));
  },

  completeAssessmentPhase: (confirmedThreat, finalConfidence, currentTick) => {
    set(produce((draft: NuclearState) => {
      draft.launchAuthority.assessmentComplete = true;
      draft.launchAuthority.status = 'ASSESSMENT';
      draft.launchAuthority.warningConfidence = finalConfidence;

      const activeAlarm = draft.falseAlarmHistory.find(a => !a.wasCorrectlyResolved);
      if (activeAlarm) {
        if (!confirmedThreat) {
          // Player correctly diagnosed false alarm!
          activeAlarm.wasCorrectlyResolved = true;
          activeAlarm.resolutionTick = currentTick;
          draft.launchAuthority.status = 'STAND_DOWN';
          draft.decisionClockActive = false;
          
          useCinematicsStore.getState().queueScene({
            type: 'FALSE_ALARM_AVERTED',
            totalPhases: 3,
            phaseDurationMs: 4000,
            blocksInput: true,
            isSkippable: true,
            autoAdvance: true,
            payload: { alarmId: activeAlarm.id }
          });
          audio.playCinematicCue('FALSE_ALARM_AVERTED', 0);
          useWorldStore.getState().addGlobalEvent(`FALSE ALARM RESOLVED: Detection glitch resolved successfully before launch escalation. Standing down.`, 'SYSTEM');
        } else {
          // Catastrophic failure: Player marks a false alarm as real threat!
          activeAlarm.nearLaunchReached = true;
          draft.launchAuthority.status = 'CONSULTATION';
          useWorldStore.getState().addGlobalEvent(`CRITICAL BLUNDER: Threat assessment incorrectly confirms non-existent attack track. Crisis escalates.`, 'CRITICAL');
        }
      } else {
        draft.launchAuthority.status = 'CONSULTATION';
      }
    }));
  },

  completeCivilianConsultation: (currentTick) => {
    set(produce((draft: NuclearState) => {
      draft.launchAuthority.consultationComplete = true;
      draft.launchAuthority.status = 'CONSULTATION';
    }));
  },

  grantPresidentialAuthorization: (currentTick) => {
    set(produce((draft: NuclearState) => {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase(); // 8 characters
      draft.launchAuthority.status = 'AUTHORIZED';
      draft.launchAuthority.authorizationGranted = true;
      draft.launchAuthority.authorizationGrantedTick = currentTick;
      draft.launchAuthority.authorizationCode = code;

      // Deduct political capital from Legislative and Public pools
      if (useOversightStore.getState().politicalCapital) {
        useOversightStore.setState(produce((overDraft: any) => {
          if (overDraft.politicalCapital?.pools) {
            overDraft.politicalCapital.pools.LEGISLATIVE = Math.max(0, overDraft.politicalCapital.pools.LEGISLATIVE - 30);
            overDraft.politicalCapital.pools.PUBLIC_LEGITIMACY = Math.max(0, overDraft.politicalCapital.pools.PUBLIC_LEGITIMACY - 25);
          }
        }));
      }

      useCinematicsStore.getState().queueScene({
        type: 'NUCLEAR_AUTHENTICATION',
        totalPhases: 3,
        phaseDurationMs: 4000,
        blocksInput: true,
        isSkippable: false,
        autoAdvance: true,
        payload: { authorizationCode: code }
      });

      audio.playCinematicCue('NUCLEAR_AUTHENTICATION', 0);
    }));
  },

  completePALAuthentication: (currentTick) => {
    set(produce((draft: NuclearState) => {
      draft.launchAuthority.palUnlockComplete = true;
      if (draft.launchAuthority.twoManRuleComplete) {
        draft.launchAuthority.status = 'AUTHENTICATED';
      }
      
      // Mark player weapons unlocked
      Object.values(draft.weapons).forEach(w => {
        if (w.countryId === 'US') {
          w.palUnlocked = true;
        }
      });
    }));
  },

  completeTwoManRule: (currentTick) => {
    set(produce((draft: NuclearState) => {
      draft.launchAuthority.twoManRuleComplete = true;
      if (draft.launchAuthority.palUnlockComplete) {
        draft.launchAuthority.status = 'AUTHENTICATED';
      }
    }));
  },

  selectLaunchOption: (option, currentTick) => {
    set(produce((draft: NuclearState) => {
      draft.launchAuthority.selectedOption = option;
      draft.selectedLaunchOption = option;
      
      // Update weapon target selections
      const optionSpec = draft.availableLaunchOptions.find(o => o.option === option);
      if (optionSpec && option !== 'WITHHOLD') {
        const required = optionSpec.weaponsRequired;
        let selectedCount = 0;
        
        Object.values(draft.weapons).forEach(w => {
          if (w.countryId === 'US' && w.isOnAlert && selectedCount < required) {
            w.targetCountryId = 'RU'; // Default adversary target in lack of specific targeting
            w.targetLat = 55.7558;
            w.targetLon = 37.6173;
            selectedCount++;
          }
        });
      }
    }));
  },

  transmitExecutionOrder: (currentTick) => {
    const integrity = get().nc3System.overallIntegrity;
    
    // Deliverability roll
    const success = Math.random() < (integrity / 100);
    
    if (success) {
      set(produce((draft: NuclearState) => {
        draft.launchAuthority.status = 'EXECUTION_ORDER';
        draft.launchAuthority.executionOrderSent = true;
        draft.launchAuthority.executionOrderTick = currentTick;
        draft.decisionClockActive = false;

        // Commit launches
        const selected = draft.selectedLaunchOption;
        const optionSpec = draft.availableLaunchOptions.find(o => o.option === selected);
        if (selected && selected !== 'WITHHOLD' && optionSpec) {
          let countLaunched = 0;
          Object.values(draft.weapons).forEach(w => {
            if (w.countryId === 'US' && w.targetCountryId && countLaunched < optionSpec.weaponsRequired) {
              w.status = 'LAUNCHED';
              w.launchedTick = currentTick;
              countLaunched++;
              
              // Trigger Fx for launches
              useFxStore.getState().triggerFx({
                type: 'MISSILE_LAUNCH',
                severity: 'HIGH',
                triggerTick: currentTick,
                expiryTick: currentTick + 3,
                durationMs: 1500,
                payload: { weaponId: w.id }
              });
            }
          });

          useCinematicsStore.getState().queueScene({
            type: 'NUCLEAR_LAUNCH_EXECUTION',
            totalPhases: 4,
            phaseDurationMs: 5000,
            blocksInput: true,
            isSkippable: false,
            autoAdvance: true,
            payload: { option: selected, countLaunched }
          });

          audio.playCinematicCue('NUCLEAR_LAUNCH_EXECUTION', 0);
          useWorldStore.getState().addGlobalEvent(`NUCLEAR LAUNCH DETECTED: Emergency Action Messages successfully relayed to launchers. Launch commitment confirmed.`, 'CRITICAL');
        } else {
          // Stand down via WITHHOLD
          draft.launchAuthority.status = 'STAND_DOWN';
          useWorldStore.getState().addGlobalEvent(`CIVILIAN DECISION: Presidential instruction explicitly withholds nuclear release. Absorb with traditional strategies.`, 'INFO');
        }
      }));
      return true;
    } else {
      // EAM relay transmission fails due to degraded integrity!
      useWorldStore.getState().addGlobalEvent(`NC3 FAILURE: Emergency Action Messages blocked. Electromagnetic jam / satellite decapitation active!`, 'CRITICAL');
      
      useCinematicsStore.getState().queueScene({
        type: 'NC3_DEGRADED',
        totalPhases: 3,
        phaseDurationMs: 4000,
        blocksInput: false,
        isSkippable: true,
        autoAdvance: true,
        payload: { integrity }
      });
      return false;
    }
  },

  standDownFromLaunch: (reason, currentTick) => {
    set(produce((draft: NuclearState) => {
      draft.launchAuthority = INITIAL_LA;
      draft.launchAuthority.status = 'STAND_DOWN';
      draft.decisionClockActive = false;
      draft.selectedLaunchOption = null;
      
      // Flush alert state on weapons
      Object.values(draft.weapons).forEach(w => {
        if (w.countryId === 'US') {
          w.targetCountryId = null;
          w.targetLat = null;
          w.targetLon = null;
          w.status = 'MATED';
        }
      });
    }));

    useWorldStore.getState().addGlobalEvent(`Nuclear forces stand down from active alert status. Reason: ${reason}`, 'SYSTEM');
  },

  activatePreDelegation: (toCountryIds, currentTick) => {
    set(produce((draft: NuclearState) => {
      draft.launchAuthority.preDelegationActive = true;
      draft.launchAuthority.preDelegationCountryIds = toCountryIds;
      draft.launchAuthority.status = 'PRE_DELEGATION';
    }));

    useWorldStore.getState().addGlobalEvent(`NC3 DOCTRINE CHANGE: Pre-delegation of launch authority authorized to field commanders in [${toCountryIds.join(', ')}]. Override blockades bypass active.`, 'WARNING');
  },

  degradeNC3Channel: (channel, delta, cause) => {
    set(produce((draft: NuclearState) => {
      const ch = draft.nc3System.channels[channel];
      if (ch) {
        ch.integrity = Math.max(0, ch.integrity - delta);
        if (ch.integrity < 50) {
          if (cause === 'EW') ch.degradedByEW = true;
          if (cause === 'CYBER') ch.degradedByCyber = true;
          if (cause === 'EMP') ch.degradedByNuclearEMP = true;
        }
      }
      // Trigger calculate internally next
    }));
    get().calculateNC3Integrity();
  },

  restoreNC3Channel: (channel, delta) => {
    set(produce((draft: NuclearState) => {
      const ch = draft.nc3System.channels[channel];
      if (ch) {
        ch.integrity = Math.min(100, ch.integrity + delta);
        if (ch.integrity > 60) {
          ch.degradedByEW = false;
          ch.degradedByCyber = false;
          ch.degradedByNuclearEMP = false;
        }
      }
    }));
    get().calculateNC3Integrity();
  },

  calculateNC3Integrity: () => {
    set(produce((draft: NuclearState) => {
      const channelsArray = Object.values(draft.nc3System.channels);
      const activeChannels = channelsArray.filter(c => c.isActive);
      
      if (activeChannels.length === 0) {
        draft.nc3System.overallIntegrity = 0;
        draft.nc3System.isDecapitationRisk = true;
        return;
      }

      const rawSum = activeChannels.reduce((sum, ch) => sum + ch.reliabilityPct * (ch.integrity / 100), 0);
      const avg = Math.round((rawSum / activeChannels.reduce((acc, c) => acc + c.reliabilityPct, 0)) * 100);
      
      draft.nc3System.overallIntegrity = Math.max(0, Math.min(100, avg));
      draft.nc3System.isDecapitationRisk = avg < 30;
    }));
  },

  attemptEAMTransmission: (currentTick) => {
    return get().transmitExecutionOrder(currentTick);
  },

  executeNuclearDetonation: (weaponId, lat, lon, currentTick) => {
    const self = get();
    const weapon = self.weapons[weaponId];
    if (!weapon) return;

    // Consequence calculations
    const yieldKt = weapon.yieldKt;
    const immediateDeaths = Math.round(yieldKt * 1450 * (1.1 + Math.random() * 0.45));
    const injuredCasualties = immediateDeaths * 2.2;
    const radiationDeathsPerTick = Math.round(immediateDeaths * 0.045);
    const permanentInfrastructureLoss = Math.min(95, Math.ceil(yieldKt * 0.07 * (1 + Math.random() * 0.2)));
    const falloutRadius = Math.round(Math.pow(yieldKt, 0.42) * 5.2);
    const empRadius = Math.round(Math.pow(yieldKt, 0.49) * 48);
    const economicShockMultiplier = yieldKt > 400 ? 6.0 : 2.0;

    const detonationId = `DET-${weaponId}-${currentTick}`;

    const consequences: NuclearDetonationConsequences = {
      detonationId,
      countryId: weapon.targetCountryId || 'RU',
      lat,
      lon,
      yieldKt,
      immediateDeaths,
      injuredCasualties,
      radiationDeathsPerTick,
      permanentInfrastructureLoss,
      nuclearFalloutRadiusKm: falloutRadius,
      electromagneticPulseRadiusKm: empRadius,
      economicShockMultiplier,
      allianceCohesionImpact: -30,
      globalTradeImpact: -20,
      tabooErosionDelta: Math.round(yieldKt * 0.08),
      nuclearWinterProbability: 0,
      climateShockOnset: false,
      triggeredRetaliationFrom: []
    };

    set(produce((draft: NuclearState) => {
      // 1. Mark weapon exploded
      const w = draft.weapons[weaponId];
      if (w) w.status = 'DETONATED';

      // 2. Add as consequence log
      draft.detonationConsequences.push(consequences);
    }));

    // 3. Call existing addScar (placed as nuclear scar on map)
    get().addScar(lat, lon, yieldKt / 1000);

    // 4. Call consequenceStore with Exlusion Zone
    useConsequenceStore.getState().addScar({
      id: `EXCLUSION-${detonationId}`,
      type: 'NUCLEAR_EXCLUSION_ZONE',
      countryId: consequences.countryId,
      lat,
      lon,
      radiusKm: falloutRadius,
      createdTick: currentTick,
      severity: 3,
      healingRateTicksPerLevel: null,
      currentSeverity: 3,
      activeEffects: {
        radiationDeathsPerTick: radiationDeathsPerTick,
        gdpPenaltyBPerTick: yieldKt * 0.007 * (consequences.countryId === 'US' ? 1.5 : 1.0),
        unrestBonusPerTick: 18,
        stabilityPenaltyPerTick: 30
      }
    });

    // 5. Trigger flash
    get().triggerFlash();

    // 6. World event log
    useWorldStore.getState().addGlobalEvent(
      `NUCLEAR DETONATION — ${consequences.countryId} — Yield: ${yieldKt}kt — [${lat.toFixed(4)},${lon.toFixed(4)}]`,
      'CRITICAL'
    );

    // Apply casualties and damage to targeted nation inside worldStore
    useWorldStore.getState().applyTickDelta((worldDraft) => {
      const targetCountry = worldDraft.countries[consequences.countryId];
      if (targetCountry) {
        targetCountry.political.stabilityIndex = Math.max(0, targetCountry.political.stabilityIndex - 45);
        targetCountry.political.popularUnrest = Math.min(100, targetCountry.political.popularUnrest + 50);
        targetCountry.economic.treasuryCashB = Math.max(0, targetCountry.economic.treasuryCashB - (yieldKt * 0.4));
        targetCountry.economic.gdpGrowthRate = Math.max(-0.4, targetCountry.economic.gdpGrowthRate - 0.15);
        targetCountry.political.leaderApprovalRating = Math.max(1, targetCountry.political.leaderApprovalRating - 30);
      }
    });

    // 7. Taboo Event registry
    const wasFirstUse = !get().tabooState.firstUseOccurred;
    const tabooEv: NuclearUseEvent = {
      id: `${detonationId}-use`,
      tick: currentTick,
      initiatingCountryId: weapon.countryId,
      targetCountryId: consequences.countryId,
      option: get().selectedLaunchOption || 'LIMITED_NUCLEAR_OPTION',
      yieldKt,
      lat,
      lon,
      estimatedCasualties: immediateDeaths,
      tabooErosionDelta: consequences.tabooErosionDelta,
      wasRetaliatory: weapon.countryId !== 'US',
      wasFirstUse
    };

    get().recordNuclearUseEvent(tabooEv);

    // 8. Suspend nuclear treaties
    useTreatyStore.getState().suspendNuclearTreaties();

    // 9. UN Security Council Special Condemnation session
    useUNStore.getState().triggerNuclearCondemnation(weapon.countryId, consequences.countryId, yieldKt);

    // 10. Climate winter checker
    const cumulMegatons = get().totalMegatons;
    if (cumulMegatons > 500) {
      set(produce((draft: NuclearState) => {
        consequences.nuclearWinterProbability = 95;
        consequences.climateShockOnset = true;
      }));
      useWorldStore.getState().addGlobalEvent(`GLOBAL WEATHER CATASTROPHE: Total deployed megatons exceed nuclear winter threshold. Solar absorption index drops. Agriculture collapse imminent.`, 'CRITICAL');
    }

    // 11. Custom Mirror adaptive responses
    useMirrorStore.getState().recordPlayerAction?.('MILITARY', 25.0, currentTick);

    // 12. Trigger cinematic
    useCinematicsStore.getState().queueScene({
      type: 'NUCLEAR_DETONATION_SEQUENCE',
      totalPhases: 5,
      phaseDurationMs: 3000,
      blocksInput: true,
      isSkippable: false,
      autoAdvance: true,
      payload: { consequences }
    });

    if (wasFirstUse) {
      useCinematicsStore.getState().queueScene({
        type: 'NUCLEAR_TABOO_BREACH',
        totalPhases: 3,
        phaseDurationMs: 5000,
        blocksInput: true,
        isSkippable: false,
        autoAdvance: true,
        payload: { tabooEv }
      });
    }

    // 13. FX DEFCON escalation (Flash lock)
    useFxStore.getState().triggerFx({
      type: 'NUCLEAR_DETONATION',
      severity: 'CATASTROPHIC',
      triggerTick: currentTick,
      expiryTick: currentTick + 8,
      durationMs: 4000,
      sourceCountryId: weapon.countryId,
      payload: { consequences }
    });
  },

  recordNuclearUseEvent: (event) => {
    set(produce((draft: NuclearState) => {
      draft.tabooState.useEvents.push(event);
      if (!draft.tabooState.firstUseOccurred) {
        draft.tabooState.firstUseOccurred = true;
        draft.tabooState.firstUseTick = event.tick;
        draft.tabooState.firstUseCountryId = event.initiatingCountryId;
      }
      
      // Degrade global norm integrity
      const delta = event.tabooErosionDelta;
      draft.tabooState.globalTabooIntactness = Math.max(0, draft.tabooState.globalTabooIntactness - delta);
      draft.tabooState.adversaryWillingnessMultiplier += (delta * 0.05);
    }));
  },

  applyTabooErosion: (delta) => {
    set(produce((draft: NuclearState) => {
      draft.tabooState.globalTabooIntactness = Math.max(0, draft.tabooState.globalTabooIntactness - delta);
    }));
  },

  triggerFalseAlarm: (type, perceivedThreatCountryId, currentTick) => {
    set(produce((draft: NuclearState) => {
      const alarmId = `ALARM-${Date.now()}`;
      draft.falseAlarmHistory.push({
        id: alarmId,
        type,
        tick: currentTick,
        detectedByCountryId: 'US',
        perceivedThreatFromCountryId: perceivedThreatCountryId,
        confidenceAtDetection: 65,
        wasCorrectlyResolved: false,
        resolutionTick: null,
        nearLaunchReached: false,
        worldEventGenerated: true
      });

      // Assemble threat evaluation window
      draft.launchAuthority.status = 'WARNING_RECEIVED';
      draft.launchAuthority.initiatedByWarning = type === 'SENSOR_MALFUNCTION' ? 'DSP IR-Sensor Reflection' : 'Exercise tape overlap';
      draft.launchAuthority.warningConfidence = 65;
      draft.launchAuthority.assessmentTick = currentTick;
      draft.launchAuthority.decisionDeadlineTick = currentTick + 10;
      draft.decisionClockActive = true;
      draft.decisionClockExpiryTick = currentTick + 10;

      useCinematicsStore.getState().queueScene({
        type: 'NUCLEAR_LAUNCH_AUTHORIZATION',
        totalPhases: 5,
        phaseDurationMs: 5000,
        blocksInput: true,
        isSkippable: true,
        autoAdvance: true,
        payload: { warningSource: type, perceivedThreatCountryId, initialConfidence: 65, alarmId }
      });
      audio.playCinematicCue('NUCLEAR_LAUNCH_AUTHORIZATION', 0);
    }));
  },

  resolveFalseAlarm: (alarmId, wasCorrectlyHandled, currentTick) => {
    set(produce((draft: NuclearState) => {
      const alarm = draft.falseAlarmHistory.find(a => a.id === alarmId);
      if (alarm) {
        alarm.wasCorrectlyResolved = wasCorrectlyHandled;
        alarm.resolutionTick = currentTick;
        draft.launchAuthority = INITIAL_LA;
        draft.decisionClockActive = false;
        
        if (wasCorrectlyHandled) {
          useWorldStore.getState().addGlobalEvent(`CRITICAL DIRECTIVE: Tactical false alarm fully resolved. Launch posture stood down.`, 'SYSTEM');
        } else {
          // Launch accidentally initiated under false warning!
          useWorldStore.getState().addGlobalEvent(`ACCIDENTAL APOCALYPSE: Launch keys rotated under catastrophic false alarm parameters. Retaliation committed.`, 'CRITICAL');
        }
      }
    }));
  },

  activateDeadHand: (currentTick) => {
    set(produce((draft: NuclearState) => {
      draft.deadHand.isActive = true;
      draft.deadHand.activatedTick = currentTick;
      draft.nc3System.channels.DEAD_HAND_AUTO.isActive = true;
    }));

    useCinematicsStore.getState().queueScene({
      type: 'PERIMETER_ACTIVATION',
      totalPhases: 3,
      phaseDurationMs: 4000,
      blocksInput: false,
      isSkippable: true,
      autoAdvance: true,
      payload: { activatedTick: currentTick }
    });

    useWorldStore.getState().addGlobalEvent(`RUSSIAN MILITARY ANNOUNCEMENT: Perimeter Automated Retaliation ("Dead Hand") system activated and listening. Autolaunch circuit hot.`, 'WARNING');
  },

  deactivateDeadHand: () => {
    set(produce((draft: NuclearState) => {
      draft.deadHand.isActive = false;
      draft.deadHand.activatedTick = null;
      draft.deadHand.launchAuthorizedBySystem = false;
      draft.nc3System.channels.DEAD_HAND_AUTO.isActive = false;
    }));

    useWorldStore.getState().addGlobalEvent(`Russian Federation deactivates automated Perimeter Dead Hand protocols. Backchannel active.`, 'INFO');
  },

  startDecisionClock: (expiryTick) => {
    set({
      decisionClockActive: true,
      decisionClockExpiryTick: expiryTick
    });
  },

  expireDecisionClock: (currentTick) => {
    const isLaunchCommitted = get().launchAuthority.status === 'EXECUTION_ORDER';
    
    set(produce((draft: NuclearState) => {
      draft.decisionClockActive = false;
      draft.decisionClockExpiryTick = null;
    }));

    if (!isLaunchCommitted) {
      if (get().launchAuthority.status === 'WARNING_RECEIVED' || get().launchAuthority.status === 'ASSESSMENT') {
        // Player failed to choose before weapon arrived!
        // Automatically selects ABSORB_AND_RESPOND as fallback
        get().selectLaunchOption('ABSORB_AND_RESPOND', currentTick);
        get().transmitExecutionOrder(currentTick);
        useWorldStore.getState().addGlobalEvent(`DECISION TIMEOUT: Warheads arrive. Positive control dictates default absorb-and-respond retaliation command.`, 'CRITICAL');
      } else {
        get().standDownFromLaunch('Decision clock exceeded without commit.', currentTick);
      }
    }
  },

  updateAdversaryPosture: (countryId, updates) => {
    set(produce((draft: NuclearState) => {
      if (draft.adversaryPosture && draft.adversaryPosture[countryId]) {
        draft.adversaryPosture[countryId] = {
          ...draft.adversaryPosture[countryId],
          ...updates
        };
      }
    }));
  },

  getAdversaryPosture: (countryId) => {
    return get().adversaryPosture[countryId];
  },

  tickNuclear: (currentTick) => {
    const self = get();

    // 1. Decrement decision timer
    if (self.decisionClockActive && self.decisionClockExpiryTick !== null) {
      if (currentTick >= self.decisionClockExpiryTick) {
        self.expireDecisionClock(currentTick);
      }
    }

    // 2. Tick in-flight weapons
    set(produce((draft: NuclearState) => {
      Object.values(draft.weapons).forEach(w => {
        if (w.status === 'LAUNCHED' && w.launchedTick !== null) {
          const ticksSpent = currentTick - w.launchedTick;
          const ticksRequired = Math.max(1, Math.round(w.flightTimeMinutes / 3)); // Map 3 minutes per tick roughly
          
          if (ticksSpent >= ticksRequired) {
            // Weapon arrived at destination!
            w.status = 'DETONATED';
            
            // Random blast coordinates around target if none specific offset
            const lat = w.targetLat || 55.7558;
            const lon = w.targetLon || 37.6173;
            
            // Avoid calling self hooks in produce block, schedule next loop detonate
            setTimeout(() => {
              get().executeNuclearDetonation(w.id, lat, lon, currentTick);
            }, 0);
          }
        }
      });
    }));

    // 3. Degrade NC3 channels under electronic warfare or cyber attacks
    const EW_campaigns = Object.values(useDeceptionStore.getState().campaigns || {});
    if (EW_campaigns.length > 0) {
      self.degradeNC3Channel('STRATCOM_BROADCAST', 10, 'EW');
    } else {
      self.restoreNC3Channel('STRATCOM_BROADCAST', 5);
    }

    const sigintState = useSigintStore.getState();
    const hasCyberIntel = sigintState.collectionBudgetByChannel?.CYBER > 20 || Object.keys(sigintState.activeCollectionCampaigns || {}).length > 0;
    if (hasCyberIntel) {
      self.degradeNC3Channel('NMCC_LANDLINE', 8, 'CYBER');
    } else {
      self.restoreNC3Channel('NMCC_LANDLINE', 4);
    }

    // 4. Random accident roll
    const prob = self.postureConfig.accidentProbability;
    if (Math.random() < prob) {
      // Trigger false alarm event
      const perceived = 'RU';
      self.triggerFalseAlarm('COMPUTER_ERROR', perceived, currentTick);
    }

    // 5. Run adversary nuclear AI decision tree
    tickNuclearAI(currentTick);
  }
}));

// Automatic subscription connection
if (typeof window !== 'undefined') {
  useDefconStore.subscribe((state) => {
    useNuclearStore.getState().respondToDefconChange(state.currentDefconLevel);
  });
}

export default useNuclearStore;
