export type BlocType = 'NATO' | 'SCO' | 'ASEAN' | 'AFRICAN_UNION' | 'ARAB_LEAGUE' | 'BRICS';

export interface BlocGovernanceRuleSet {
  agendaSettingStyle: 'HEGEMON_FORWARD' | 'CONSENSUS' | 'COALITION_VOTE' | 'DIRECTORATE';
  decisionThreshold: 'UNANIMITY' | 'TWO_THIRDS' | 'SIMPLE_MAJORITY' | 'CONSENSUS_NO_VETO';
  canBlockVetoCountries: string[]; // P5 or anchor powers
  isBinding: boolean;
  reputationalCostOfIgnore: number; // 0-100 index
  allowOptOuts: boolean;
  allowSidePayments: boolean;
}

export interface ContributionObligation {
  id: string;
  contributorId: string;
  type: 'MILITARY_SPENDING' | 'PEACEKEEPING_FORCES' | 'INFRASTRUCTURE_FUND' | 'SANCTIONS_COMPLIANCE' | 'REFUGEE_HOSTING' | 'CYBER_DEFENSE_SHARING';
  targetValue: number; // numerical goal (e.g., % of GDP or million USD)
  currentValue: number;
  status: 'COMPLIANT' | 'SHORTFALL' | 'NON_COMPLIANT';
  consequences: string;
}

export interface BurdenSharingDispute {
  id: string;
  initiatingCountryId: string;
  targetCountryId: string;
  disputeType: 'MILITARY_UNDERFUNDING' | 'REFUSION_OF_BASES' | 'EXCESSIVE_REFUGEE_EXPOSURE' | 'SANCTIONS_EVASION' | 'FINANCIAL_UNDERCONTRIBUTION';
  intensity: number; // 0-100
  unresolvedTicks: number;
  narrative: string;
}

export interface BlocFractureVector {
  type: 'IDEOLOGY' | 'THREAT_PERCEPTION' | 'BURDEN_RESENTMENT' | 'EXTERNAL_ALIGNMENT' | 'ECONOMIC_ASYMMETRY' | 'TERRITORIAL_DISPUTE' | 'SANCTION_EXPOSURE';
  description: string;
  severity: number; // 0-100
  primaryOpposingPairs: [string, string]; // [Country A, Country B]
}

export interface BlocCohesionState {
  overallScore: number; // 0-100
  strategicCoherence: number; // 0-100
  militaryReliability: number; // 0-100
  economicCoordination: number; // 0-100
  proceduralLegitimacy: number; // 0-100
  leadershipTrust: number; // 0-100
  sanctionsResilience: number; // 0-100
}

export interface BlocMemberState {
  countryId: string;
  role: 'ANCHOR_POWER' | 'SPOILER' | 'MEDIATOR' | 'FREE_RIDER' | 'FRONT_LINE_STATE' | 'DEVELOPMENT_DEMANDER' | 'FINANCE_PROVIDER' | 'NORM_ENTREPRENEUR' | 'HEDGING_INSIDER' | 'RELUCTANT_PARTICIPANT';
  entranceTick: number;
  accumulatedContributions: number; // USD millions equiv
  trustScore: number; // 0-100
  fractureVulnerability: number; // 0-100
  leveragePoints: number; // internal currency
}

export interface CollectiveDefenseTriggerRecord {
  id: string;
  attackerId: string;
  victimId: string;
  triggerTick: number;
  status: 'PENDING_CONSULTATION' | 'ACTIVATED_COMMAND' | 'DILUTED' | 'FAILED_TO_ACT';
  confidenceIndex: number; // 0-100
  contributingNations: string[];
  refusingNations: string[];
}

export interface BlocAgendaItem {
  id: string;
  title: string;
  description: string;
  type: 'CRISIS_RESPONSE' | 'SECURITY_EXERCISE' | 'DEVELOPMENT_PACKAGE' | 'LOCAL_CURRENCY_VOTE' | 'ENLARGEMENT_BID' | 'SANCTIONS_CARVEOUT' | 'COMMUNIQUE_WORDING';
  initiatorId: string;
  targetId?: string; // Optional target country/pact
  requiredFundingB?: number;
  votesFor: string[];
  votesAgainst: string[];
  abstentions: string[];
  status: 'PENDING_EXAMINATION' | 'PASSED' | 'BLOCKED_BY_CONSENSUS' | 'VETOED' | 'DEFEATED';
}

export interface BlocCommitmentRecord {
  id: string;
  agendaItemId: string;
  type: 'MILITARY_GUARANTEE' | 'FINANCIAL_POOLED_AID' | 'LOCAL_CURRENCY_SETTLEMENT' | 'MEDIATION_PIPELINE' | 'EXERCISE_PARTICIPATION' | 'SANCTIONS_COMPLIANCE_HARD';
  obligatedCountryIds: string[];
  complianceRates: Record<string, number>; // countryId -> 0-100% compliance
}

export interface MembershipAccessionsRecord {
  id: string;
  applicantCountryId: string;
  stage: 'DIALOGUE_PARTNER' | 'OBSERVER' | 'PROBATION' | 'PENDING_VOTE' | 'ADMITTED' | 'REJECTED';
  startTick: number;
  vetoingMembers: string[];
  readyScore: number; // 0-100
}

export interface MembershipSuspensionRecord {
  id: string;
  countryId: string;
  reason: 'COUP' | 'FRACTURE_DISREGARD' | 'ECONOMIC_DEFAULT' | 'RIVAL_BLOC_ALIGN';
  suspensionTick: number;
  status: 'ACTIVE_SUSPENSION' | 'RECONCILED' | 'EXPULSION_PENDING';
}

export interface MembershipExitRecord {
  id: string;
  countryId: string;
  exitTick: number;
  style: 'FORMAL_WITHDRAWAL' | 'DRIFT' | 'EXPULSION';
  unrestTriggered: boolean;
}

export interface SwingStateProfile {
  countryId: string;
  alignmentFlexibility: number; // 0-100 (high = easily pivots)
  autonomyPreference: number; // 0-100 (high = resents bloc constraints)
  coercionSensitivity: number; // 0-100
  aidResponsiveness: number; // 0-100
  securityAnxiety: number; // 0-100
  sanctionsVulnerability: number; // 0-100
  domesticEliteDivision: number; // 0-100 (high = half stays pro-West, half pro-East)
  publicOpinionSplit: number; // 0-100
  tradeDependenceMix: string; // descriptive
  militaryProcurementDiversity: 'WEST_ONLY' | 'EAST_ONLY' | 'MIXED_DIVERSIFIED' | 'DOMESTIC_HEAVY';
}

export interface HedgingPostureState {
  countryId: string;
  primaryMilitaryTilt: 'WEST' | 'EAST' | 'NEUTRAL';
  primaryEconomicTilt: 'WEST' | 'EAST' | 'NEUTRAL';
  tacticalAmbiguityRating: number; // 0-100 (high = masters double gameplay)
  concessionsExtractedB: number;
  activeEconomicCorridors: string[]; // e.g. ["BRI", "IMEC"]
  lastHedgingAction: string;
}

export interface CrossBlocChannel {
  id: string;
  originBloc: BlocType;
  targetBloc: BlocType;
  channelType: 'BACK_CHANNEL' | 'TRACK_2' | 'MIL_MIL_HOTLINE' | 'DECONFLICTION_JOINT_COMMISSION';
  integrityIndex: number; // 0-100
  lastActivityTick: number;
  agreedConfidenceMeasures: string[];
}

export interface ConfidenceBuildingMeasure {
  id: string;
  channelId: string;
  title: string;
  costAP: number;
  benefitTensionReduction: number; // 0-100
  riskOfPublicBacklash: number; // 0-100
  status: 'PROPOSED' | 'RATIFIED' | 'BROKEN' | 'EXPIRED';
}

export interface BlocInstitutionalMemory {
  blocId: BlocType;
  historyLog: {
    tick: number;
    description: string;
    impactType: 'COHESION_GAIN' | 'COHESION_LOSS' | 'TRUST_BOOST' | 'TRUST_DRAIN' | 'FRACTURE_RISK';
    relatedCountryId?: string;
  }[];
}

export interface BlocEconomicMechanism {
  localCurrencySettlementActive: boolean;
  localCurrencyTradeShare: number; // percent 0-100
  developmentBankReservesB: number;
  fundedInfrastructureProjects: {
    id: string;
    countryId: string;
    projectCostB: number;
    deliveryProgress: number; // 0-100
    leverageYieldPoints: number;
  }[];
}

export interface BlocSecurityMechanism {
  hasJointCommand: boolean;
  commandConfidence: number; // 0-100
  lastExerciseTick: number;
  jointExerciseReadinessBonus: number; // 0-100
}

export interface BlocMediationProcess {
  id: string;
  blocId: BlocType;
  disputeId: string;
  mediatorCountryId: string;
  concessionsProposedB: number;
  successProbability: number;
  status: 'ONGOING' | 'RESOLVED_SUCCESS' | 'COLLAPSED';
}

export interface BlocActionPreview {
  estimatedSupportPercentage: number;
  likelyBlockers: string[];
  cohesionRisk: number; // 0-50
  burdenSharingShiftRate: number; // -10 to +10
  expectedCounterReaction: string;
}

export interface RegionalOrganization {
  id: BlocType;
  name: string;
  flagSymbol: string;
  primaryAnchorPowerId: string;
  governanceRules: BlocGovernanceRuleSet;
  members: Record<string, BlocMemberState>;
  cohesion: BlocCohesionState;
  fractureVectors: BlocFractureVector[];
  burdenSharingDisputes: BurdenSharingDispute[];
  agenda: BlocAgendaItem[];
  commitments: BlocCommitmentRecord[];
  activeCollectiveDefenseTriggers: CollectiveDefenseTriggerRecord[];
  accessions: MembershipAccessionsRecord[];
  suspensions: MembershipSuspensionRecord[];
  exits: MembershipExitRecord[];
  economicMechanism: BlocEconomicMechanism;
  securityMechanism: BlocSecurityMechanism;

  // Module 4.4 specific extensions
  objectives?: SharedObjectiveStack;
  memberProfiles?: Record<string, BlocMemberProfile>;
  cohesionModel?: BlocCohesionModel;
  fractureModel?: BlocFractureRiskModel;
  intelSharingPolicy?: BlocIntelSharingPolicy;
  escalationAgreement?: BlocEscalationAgreement;
  mutualAssurance?: MutualAssuranceProfile;
  coalitionTasking?: CoalitionTaskingPlan;
  sharedThreatAssessment?: SharedThreatAssessment;
  intelState?: BlocIntelligenceState;
}

// Module 4.4: Alliance and Bloc Intelligence interfaces
export interface AllianceObjective {
  id: string;
  name: string;
  category: 'REGIONAL_DETERRENCE' | 'SANCTIONS_ENFORCEMENT' | 'REGIME_STABILIZATION' | 'TRADE_PROTECTION' | 'ENERGY_CORRIDOR' | 'MILITARY_CONTAINMENT' | 'INTELLIGENCE_SHARING' | 'ESCALATION_MANAGEMENT' | 'DIPLOMATIC_VETO';
  priority: number; // 1-10
  timeLimitTicks?: number;
  costAP: number;
  costFinancialB: number;
  confidenceRating: Record<string, number>; // countryId -> confidence % (player visibility via intel)
  politicalPressure: number; // 0-100
  domesticConstraints: string;
  status: 'ACTIVE' | 'ACCOMPLISHED' | 'FAILED' | 'ABANDONED';
}

export interface SharedObjectiveStack {
  objectives: AllianceObjective[];
  lastEvaluationTick: number;
  globalPrioritiesDescription: string;
}

export interface MemberReliabilityScore {
  military: number; // 0-100
  diplomatic: number; // 0-100
  intelligence: number; // 0-100
  sanctions: number; // 0-100
  crisis: number; // 0-100
  treaty: number; // 0-100
  publicRating: number; // Overt alignment
  hiddenRating: number; // True reliability under high stress
}

export interface MemberBurdenShareModel {
  expectedContribution: {
    financialB: number;
    militaryForces: number; // index (e.g. brigades equivalent)
    basingRightsAuthorized: boolean;
    sanctionsSupport: boolean;
    diplomaticCapital: number; // 0-100
    intelligenceExposureRisk: number; // 0-100
    escalationRiskTier: number; // 1-5
    domesticPoliticalCostLimit: number; // 0-100
  };
  actualContribution: {
    financialB: number;
    militaryForces: number;
    basingRightsProvided: boolean;
    sanctionsSupport: boolean;
    diplomaticCapital: number;
    intelligenceExposureRisk: number;
    escalationRiskTier: number;
    domesticPoliticalCostIncurred: number;
  };
  willingnessToPay: number; // 0-100
  willingnessToRisk: number; // 0-100
  strainRating: number; // Current strain (high = likely to default)
}

export interface MemberContributionHistory {
  tick: number;
  objectiveId?: string;
  actionType: 'KEPT_PROMISE' | 'BROKEN_PROMISE' | 'HESITATED' | 'FREE_RODE' | 'BACK_PUBLIC_RESIST_PRIVATE';
  description: string;
  costIncurredB: number;
}

export interface FreeRidePressureModel {
  currentFreeRideIndex: number; // 0-100
  accumulatedResentment: number; // 0-100
  targetWillingnessToCorrect: number; // 0-100
  activeAuditing: boolean;
  proposedPenalties: string[];
}

export interface BlocMemberProfile {
  countryId: string;
  reliability: MemberReliabilityScore;
  burdenShare: MemberBurdenShareModel;
  contributionHistory: MemberContributionHistory[];
  freeRidePressure: FreeRidePressureModel;
  threatAssessment: string;
}

export interface BlocCohesionModel {
  overallScore: number;
  sharedThreatCohesionBonus: number;
  ideologicalProximityBonus: number;
  tradeInterdependenceFactor: number;
  burdenFairnessIndex: number;
  unresolvedDisputesPenalty: number;
  domesticPoliticalDrag: number;
}

export interface BlocFractureRiskModel {
  fractureRiskIndex: number; // 0-100
  warningTriggerTick?: number;
  primaryStressSource: string;
  splinterFactionCountryIds: string[];
  reconciliationFeasibility: number; // 0-100
}

export interface PivotStateProfile {
  countryId: string;
  name: string;
  strategicLocationDescription: string;
  tradeDependencyWest: number; // 0-100
  tradeDependencyEast: number; // 0-100
  securityDependencyWest: number; // 0-100
  securityDependencyEast: number; // 0-100
  regimeType: string;
  eliteFactionBalance: { proWestPercent: number; proEastPercent: number; neutralPercent: number };
  domesticAlignmentPressure: number; // 0-100
  externalCourtingPressure: number; // 0-100
  toleranceForHedging: number; // 0-100
  allianceAttractivenessWest: number; // 0-100
  allianceAttractivenessEast: number; // 0-100
  neutralityStability: number; // 0-100
}

export interface UnalignedPowerProfile {
  countryId: string;
  name: string;
  strengthIndex: number; // 0-100
  accessSellingOptions: string[];
  hedgingParameterTicks: number;
  sidePaymentsDemandedB: number;
  rivalryExploitationLevel: number; // 0-100
  threatToSwingAlignment: boolean;
  mediationEffortsHosted: string[];
  governanceStance: 'GENUINE_NON_ALIGNED' | 'OPPORTUNISTIC_BALANCER';
}

export interface InfluenceCompetitionRecord {
  targetCountryId: string;
  influenceWeightWest: number; // 0-100
  influenceWeightEast: number; // 0-100
  tradeTiesWest: number; // 0-100
  tradeTiesEast: number; // 0-100
  securityDependenceWest: number; // 0-100
  securityDependenceEast: number; // 0-100
  intelligenceAccessWest: number; // 0-100
  intelligenceAccessEast: number; // 0-100
  publicNarrativePullWest: number; // 0-100
  publicNarrativePullEast: number; // 0-100
  eliteFactionLeaning: 'WEST_LEANING' | 'EAST_LEANING' | 'BALANCED' | 'STRICT_NEUTRAL';
  recentDiplomacyLogs: string[];
  covertPenetrationIndexWest: number; // 0-100
  covertPenetrationIndexEast: number; // 0-100
}

export interface CommitmentCredibilityModel {
  overtPledgeIntegrity: number; // 0-100
  backchannelCommitmentScore: number; // 0-100
  crisisDefectionRisk: number; // 0-100
  historyBrokenPledges: number;
}

export interface CoalitionTaskingPlan {
  activeTasks: {
    id: string;
    assigneeCountryId: string;
    taskType: 'PATROL_ZONE' | 'ENFORCE_SANCTIONS' | 'PROVIDE_BASING' | 'SHARE_INTEL' | 'FRONT_MESSAGING' | 'HOST_EXERCISE' | 'SUPPLY_LOGISTICS' | 'ABSORB_SANCTIONS_BLOWBACK' | 'BLOCKADE_SUPPORT';
    assignedBurdenScore: number; // 1-100
    expectedCompletionTick: number;
    actualProgress: number; // 0-100
    complianceStatus: 'FULL' | 'PARTIAL' | 'SYMBOLIC' | 'OVERT_DEFECTION' | 'QUIET_RESISTANCE';
    delayTicks: number;
    narrative: string;
  }[];
}

export interface SharedThreatAssessment {
  adversaryBlocId: string;
  perceivedThreatLevel: number; // 0-100
  sharedIntelAlertsCount: number;
  leakedDirectivesCount: number;
  criticalVulnIdentified: string;
}

export interface BlocIntelSharingPolicy {
  clearanceLevelRequired: 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';
  sharingFrictionIndex: number; // 0-100
  jointIntrusionsAuthorized: boolean;
  bannedTargetCountryIds: string[];
}

export interface BlocEscalationAgreement {
  authorizedResponseTier: 'PROPORTIONAL_SYMMETRIC' | 'ASYMMETRIC_ESCALATORY' | 'RESTRAINED_DIPLOMATIC' | 'PRE_EMPTIVE';
  nuclearBackstopInvoked: boolean;
  escalationCapCostB: number;
}

export interface MutualAssuranceProfile {
  sovereignGuaranteesActive: string[]; // countryIds
  retaliatoryTriggersCount: number;
  crisisSummitBufferTicks: number;
}

export interface BlocIntelligenceState {
  compiledDate: string;
  overallThreatLandscape: string;
  highestDefectionRiskMemberId?: string;
  activeInformationOperationsCount: number;
}
