export interface PropagandaCampaign {
  id: string;
  codename: string;
  adversaryCountryId: string; // e.g. 'RU', 'CN', 'KP', 'IR'
  targetChannelId: string; // e.g. 'domestic_media', 'foreign_media', 'social_platforms', 'diplomatic_backchannels'
  narrativeFrame: 'PLAYER_IS_AGGRESSOR' | 'PLAYER_IS_ISOLATED' | 'PLAYER_IS_BLUFFING' | 'MILITARY_SUPERIORITY_POSTURING' | 'ALLIES_WILL_ABANDON_YOU';
  reachIndex: number; // 0-100
  susceptibilityIndex: number; // 0-100
  seedingTick: number;
  stage: 'SETUP' | 'SEEDING' | 'AMPLIFICATION' | 'REINFORCEMENT' | 'EXPLOITATION' | 'DECAY';
  decayRate: number; // how fast the campaign dies down
  unrestImpact: number; // unrest delta per tick
  credibilityScars: number; // permanent opinion damage
  isExposed: boolean;
  investmentB: number;
}

export interface DeceptionCampaign {
  id: string;
  codename: string;
  adversaryCountryId: string;
  objective: 'DELAY_PLAYER_RESPONSE' | 'PROVOKE_OVERREACTION' | 'SPLIT_COALITION' | 'PROTECT_HIDDEN_BUILDUP' | 'COMPLACENCY_TRAP';
  baitAssumptionId: string;
  active: boolean;
  intensityAndScope: number; // 0-100
  successProbability: number;
  blowbackRisk: number;
  exposureHistory: string[];
}

export interface PlantedIntelligencePacket {
  id: string;
  sourceType: 'COMPROMISED_AGENT' | 'FORGED_INTERCEPT' | 'MANIPULATED_LEAK' | 'CORRUPTED_DOCUMENT' | 'FALSE_OSINT' | 'STAGED_SIGNAL';
  format: 'TACTICAL_FACT_FALSE_STRATEGIC' | 'ACCURATE_DETAIL_WRONG_CONCLUSION' | 'BELIEVABLE_INCOMPLETE' | 'FORGED_PROVENANCE' | 'MIXED_TRUTH_LIE';
  provenanceSource: string; // e.g., "MI6 Secure Vault Extract"
  headline: string;
  content: string;
  analyzed: boolean;
  isExposed: boolean;
  perceivedCredibility: number; // 0-100
  actualAccuracy: number; // 0-100 (usually low but nonzero!)
  implantedBeliefId: string;
  detectionDifficulty: number; // 0-100
  tickPlanted: number;
}

export interface CounterintelligenceResponseModel {
  id: string;
  title: string;
  type: 'SOURCE_VALIDATION' | 'TRUST_RECALIBRATION' | 'CHANNEL_QUARANTINE' | 'DISINFO_COUNTER' | 'LEAK_CONTAINMENT' | 'DOUBLE_AGENT_REVERSAL';
  costCashB: number;
  costAP: number;
  successProbability: number;
  active: boolean;
  tickActivated: number;
  cooldownRemaining: number;
  narrativeOnTrigger: string;
}

export interface AssumptionProfile {
  id: string; // countryId (adversary or player)
  expectedAttackVectorBias: 'SIBERIA_CORRIDOR' | 'NORTH_SEA_STRIKE' | 'PACIFIC_BAIT' | 'MIDDLE_EAST_FLANK';
  trustBias: 'SIGINT_OVERRELIANCE' | 'HUMINT_OVERRELIANCE' | 'OSINT_OVERRELIANCE';
  escalationExpectation: 'BLUFF_ANCHORED' | 'KINETIC_EXPECTED' | 'EQUAL_PROBABILITY';
  allianceReliabilityExpectation: 'ALLIES_WILL_HOLD' | 'ALLIES_WILL_DEFECT' | 'UNRELIABLE';
  intelligenceConfidenceBias: number; // 0-100
  bluffDetectionBias: number; // 0-100
  threatSalienceBias: number; // 0-100
}

export interface PlayerBeliefModel {
  dominantNarrative: string;
  perceivedMainThreatVector: 'SIBERIA_CORRIDOR' | 'NORTH_SEA_STRIKE' | 'PACIFIC_BAIT' | 'MIDDLE_EAST_FLANK';
  allianceConfidenceRating: number; // 0-100
  bluffConfidenceRating: number; // 0-100
  anchoredAssumptions: string[];
  activeMisperceptions: string[];
  estimatedAdversaryBuildupConfidence: number; // 0-100
}

export interface TrustChannelProfile {
  id: string;
  channelName: string;
  category: 'DOMESTIC_MEDIA' | 'FOREIGN_MEDIA' | 'SOCIAL_PLATFORMS' | 'DIPLOMATIC_BACKCHANNELS' | 'FORGED_DOCUMENTS' | 'THINK_TANKS';
  baseReliability: number; // 0-100
  currentPoisoningLevel: number; // 0-100
  reachingCoverage: number; // 0-100
  susceptibilityRating: number; // 0-100
  burnedCount: number;
}

export interface NarrativeFramingModel {
  id: string;
  opponentId: string;
  frameType: 'PLAYER_IS_AGGRESSOR' | 'PLAYER_IS_ISOLATED' | 'PLAYER_IS_BLUFFING' | 'PLAYER_UNSTABLE' | 'COLLAPSED_SUPPORT';
  intensity: number; // 0-100
  disseminationReach: number; // 0-100
  status: 'INFRA_SEEDED' | 'AMPLIFYING' | 'DOMINANT' | 'DEFEATED';
}

export interface MisperceptionRiskModel {
  riskScore: number; // 0-100
  primaryFactor: string;
  escalationSensitivity: number; // multiplier e.g. 1.2
  confirmationBiasAnchor: string;
}

export interface FalseCertaintyVector {
  id: string;
  beliefStatement: string;
  perceivedCertainty: number; // 0-100
  actualRealityInverted: boolean; // if true, the reverse of the statement is true
  implantedByCampaignId: string;
}

export interface InfluenceExposureHistory {
  campaignId: string;
  tickExposed: number;
  blowbackSeverity: 'LOW' | 'MEDIUM' | 'CIVIC_OUTRAGE' | 'DIPLOMATIC_CRISIS';
  outcomeNarrative: string;
}

export interface CounterNarrativeAsset {
  id: string;
  name: string;
  mediaCategory: string;
  credibilityIndex: number; // 0-100
  costPerTick: number; // $B
  active: boolean;
}

export interface SourceCredibilityAttack {
  id: string;
  targetSourceId: string;
  opponentCountryId: string;
  successProbability: number;
  damageInflicted: number;
  status: 'PENDING' | 'EXECUTED' | 'EXPOSED';
}

export interface ManipulationObjective {
  id: string;
  codename: string;
  type: 'DELAY_PLAYER_RESPONSE' | 'PROVOKE_OVERREACTION' | 'SPLIT_COALITION' | 'PROTECT_HIDDEN_BUILDUP' | 'COMPLACENCY_TRAP';
  status: 'PENDING' | 'ACTIVE' | 'EXPLOITED' | 'FAILED';
  targetValue: number; // evaluation benchmark
}

export interface BaitBeliefOpportunity {
  id: string;
  statement: string;
  baitType: 'FALSE_WEAK_POINT_HARDENED' | 'FALSE_READY_GAP' | 'FALSE_ALLIANCE_SPLIT' | 'FAKE_DIPLOMATIC_OPENING';
  attractivenessScore: number; // 0-100
  timesInvestigated: number;
  revealedAsTrap: boolean;
  actualTroopCountOffset?: number; // e.g. reveals 10 units but actually is 100 !
}

export interface IntelligencePoisoningRecord {
  id: string; // e.g. SIGINT, satellite
  sourceId: string;
  noiseLevelDelta: number;
  conflictingReportsEnabled: boolean;
  timesFlaggedByCI: number;
}

export interface InfluenceOutcomeTrace {
  tick: number;
  campaignCodename: string;
  effectDescription: string;
  outcomeType: 'DELIBERATE_HESITATION' | 'RASH_OVERREACTION' | 'ALLY_COHESION_LOSS' | 'PUBLIC_LEGITIMACY_SAP';
}

export interface AdversarialInfluenceState {
  propagandaCampaigns: PropagandaCampaign[];
  deceptionCampaigns: DeceptionCampaign[];
  plantedPackets: PlantedIntelligencePacket[];
  counterintelligenceResponses: CounterintelligenceResponseModel[];
  playerBelief: PlayerBeliefModel;
  assumptionProfiles: Record<string, AssumptionProfile>;
  trustChannels: TrustChannelProfile[];
  narrativeFraming: NarrativeFramingModel[];
  misperceptionRisk: MisperceptionRiskModel;
  falseCertaintyVectors: FalseCertaintyVector[];
  exposureHistory: InfluenceExposureHistory[];
  counterAssets: CounterNarrativeAsset[];
  credibilityAttacks: SourceCredibilityAttack[];
  manipulationObjectives: ManipulationObjective[];
  baitOpportunities: BaitBeliefOpportunity[];
  poisoningRecords: Record<string, IntelligencePoisoningRecord>;
  outcomeTraces: InfluenceOutcomeTrace[];
  difficultyLevel: 'EASY' | 'NORMAL' | 'HARD' | 'COGNITIVE_WARFARE';
  warningMetrics: {
    rumorPressure: number;
    anomalyPressure: number;
    deceptionSuspicion: number;
    sourceBurnRisk: number;
    contaminationLevel: number;
  };
}
