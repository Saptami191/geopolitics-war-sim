export type PlayerStrategyFingerprint =
  | 'SANCTIONS_GRINDER'
  | 'COVERT_OPERATOR'
  | 'MILITARY_BLITZER'
  | 'ALLIANCE_BROKER'
  | 'ECONOMIC_STRANGLER'
  | 'INFORMATION_WAR_SPECIALIST'
  | 'BALANCED_GRAND_STRATEGIST'
  | 'DECEPTIVE_TACTICIAN'
  | 'DEFENSIVE_TURTLER';

export type MirrorWarningLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PlayerProfileVector {
  sanctionsUseCount: number;
  covertOpsCount: number;
  militaryStrikesCount: number;
  diplomaticAgreementsCount: number;
  cyberAttacksCount: number;
  economyDecisionsCount: number;
  totalActionsLogged: number;

  sanctionsBias: number;         // 0 - 100
  covertBias: number;            // 0 - 100
  militaryBias: number;          // 0 - 100
  diplomacyBias: number;         // 0 - 100
  cyberBias: number;             // 0 - 100
  economicBias: number;          // 0 - 100
}

export interface PlayerHabitRecord {
  habitId: string;
  actionCategory: string; // e.g. 'SANCTION', 'COVERT', 'STRIKE', 'TREATY'
  triggerStatus: string;  // e.g. 'CRISIS_ESCALATION', 'STABILITY_LOW'
  frequencyCount: number;
  lastTickSeen: number;
  stabilityScore: number; // 0 - 100
}

export interface PlayerPreferenceModel {
  primaryInstrument: string; // 'SANCTIONS' | 'COVERT' | 'MILITARY' | 'DIPLOMACY'
  secondaryInstrument: string;
  preferredTargetCountryId?: string;
  negotiationStiffness: number; // 0-100 (preference to stand firm)
  unrestExploitationPropensity: number; // 0-100
}

export interface PlayerRiskPatternModel {
  riskToleranceScore: number; // 0 - 100
  bluffPropensity: number;    // 0 - 100
  retreatFrequency: number;   // count of backing off
  earlyCommitmentRate: number;// committing forces or sanctions in early cycles
}

export interface PlayerTempoModel {
  averageResponseTime: number; // in ticks between events
  escalationSpeed: 'RAPID' | 'SLOW' | 'CALCULATED'; 
  actionsPerTenTicks: number;
}

export interface PlayerEscalationPatternModel {
  humiliationReactionRatio: number; // escalation rate when humiliated by AI (0-1)
  nuclearSovereignReadiness: number; // how quickly they load/target nuclear systems basic
  retaliatoryMultiplier: number;     // 1.0 to 3.0 scale of retorts
}

export interface PlayerToolBiasModel {
  cyberIntrusionPropensity: number; // 0 - 100
  propagandaSlanderRate: number;    // 0 - 100
  backchannelUtilScore: number;     // 0 - 100
}

export interface PlayerBaitSusceptibilityModel {
  summitTrapsAttempted: number;
  summitTrapsCaught: number;
  fakeVulnerabilitiesExploited: number;
  deceptiveLeakersTrusted: number;
  susceptibilityScore: number; // 0 - 100
  lastTrapTriggeredTick?: number;
}

export interface CounterStrategyTemplate {
  templateId: string;
  name: string;
  description: string;
  targetBiasTrigger: string; // e.g. 'SANCTIONS', 'COVERT', 'MILITARY', 'DIPLOMACY'
  tactics: string[];
  systemModifiers: {
    intelBoost: number;
    economicResilience: number;
    militaryFortification: number;
    counterIntelligenceMultiplier: number;
  };
}

export interface CounterStrategyCandidate {
  candidateId: string;
  templateId: string;
  scoreMatch: number; // 0 - 100 matching bias score
  tickGenerated: number;
  estimatedSuccessProbability: number;
}

export interface CounterStrategyCommitment {
  activeStrategyId?: string;
  candidateId?: string;
  name: string;
  description: string;
  ticksActive: number;
  effectivenessScore: number; // 0 - 100
  threatCounteredCategory: string;
}

export interface HoneypotOpportunity {
  id: string;
  targetId: string; // countryId hosting this trap
  name: string;
  description: string;
  baitType: 'MILITARY_GAP' | 'DIPLOMATIC_OPEN_STALL' | 'COVERT_LEAK' | 'ECONOMIC_CHOKE_CORRIDOR';
  attractivenessIndex: number; // 0 - 100
  isDiscovered: boolean; // discovered by player intelligence?
  isTriggered: boolean;  // triggered by player action?
  rewardToPlayerIfSucceeds: string;
  penaltyToPlayerIfTrapped: string;
}

export interface BaitSituation {
  id: string;
  description: string;
  requiredPlayerInstrument: string; // e.g., 'COVERT_OPS', 'MILITARY_STRIKES', 'SANCTION'
  consequencesLocked: boolean;
  trapReady: boolean;
}

export interface ExploitWindow {
  id: string;
  countryId: string;
  description: string;
  reason: string;
  remainingTicks: number;
  exploitMultiplier: number; // e.g. 1.5x damage, or 2x success rate
  isExposed: boolean;
}

export interface AdaptationMemory {
  id: string;
  tickOccurred: number;
  playerActionContext: string;
  aiCounterActionExecuted: string;
  successOutcome: boolean;
  learnedWeightShift: number;
}

export interface CountermeasureHistory {
  strategyName: string;
  tickDeployed: number;
  effectiveness: 'EXCELLENT' | 'MODERATE' | 'FAILURE';
  playerRetaliationRecorded: boolean;
}

export interface DeceptionExposureState {
  playerSuspectsAdaptation: boolean; // 0-100 tracker represents if player is poisoning model
  aiFalseCertaintyScore: number;     // AI holds false confidence due to player deceit
  poisonedHabitIds: string[];
}

export interface LearningConfidence {
  generalConfidence: number; // 0 - 100
  historyScaleTicks: number; // total duration tracked
  relearningActive: boolean; 
}

export interface PatternStabilityScore {
  coreStability: number; // 0 - 100 representing low strategic variance
  driftDetected: boolean;
}

export interface MirrorAdaptationState {
  profile: PlayerProfileVector;
  fingerprint: PlayerStrategyFingerprint;
  habits: PlayerHabitRecord[];
  preferenceModel: PlayerPreferenceModel;
  riskPattern: PlayerRiskPatternModel;
  tempo: PlayerTempoModel;
  escalationPattern: PlayerEscalationPatternModel;
  toolBias: PlayerToolBiasModel;
  baitSusceptibility: PlayerBaitSusceptibilityModel;
  
  availableTemplates: CounterStrategyTemplate[];
  activeCounterCommitment?: CounterStrategyCommitment;
  candidates: CounterStrategyCandidate[];
  honeypots: HoneypotOpportunity[];
  baitSituations: BaitSituation[];
  exploitWindows: ExploitWindow[];
  memories: AdaptationMemory[];
  confidence: LearningConfidence;
  stability: PatternStabilityScore;
  counterHistory: CountermeasureHistory[];
  deception: DeceptionExposureState;
  warningLevel: MirrorWarningLevel;

  learningSpeedMultiplier: number; // e.g. 1.0, 1.5, 2.0 based on difficulty
  difficultySetting: 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE';
}
