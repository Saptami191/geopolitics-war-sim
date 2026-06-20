const fs = require('fs');

const content = `
// ─── MODULE 8: CYBER OPERATIONS CORE TYPES ────────────────────────────────

export type CyberGroupArchetype =
  | 'TIER_1_STATE'
  | 'TIER_2_STATE'
  | 'CRIMINAL_APT'
  | 'HACKTIVIST'
  | 'CONTRACTOR';

export type CyberSpecialization =
  | 'ICS_OT_ATTACK'
  | 'FINANCIAL_SYSTEMS'
  | 'COMMS_NETWORKS'
  | 'MILITARY_C2'
  | 'ELECTION_SYSTEMS'
  | 'SUPPLY_CHAIN'
  | 'ESPIONAGE_COLLECTION'
  | 'DESTRUCTIVE_WIPER'
  | 'RANSOMWARE'
  | 'INFLUENCE_OPS';

export interface CyberGroup {
  id: string;
  name: string;
  countryId: string;
  archetype: CyberGroupArchetype;
  specializations: CyberSpecialization[];
  operativeCount: number;
  techLevel: number;
  currentOperations: string[];
  zeroDaysHeld: number;
  malwareInventory: string[];
  discoveredBy: string[];
  attributionConfidence: Record<string, number>;
  coverProfile: string;
  isActive: boolean;
  burnProbabilityPerTick: number;
  lastOperationTick: number;
}

export type KillChainStage =
  | 'RECONNAISSANCE'
  | 'WEAPONIZATION'
  | 'DELIVERY'
  | 'EXPLOITATION'
  | 'INSTALLATION'
  | 'COMMAND_AND_CONTROL'
  | 'ACTIONS_ON_OBJECTIVES';

export type CyberObjectiveType =
  | 'PERSISTENT_ESPIONAGE'
  | 'DESTRUCTIVE_ATTACK'
  | 'HACK_AND_LEAK'
  | 'SABOTAGE_PRECISION'
  | 'SUPPLY_CHAIN_COMPROMISE'
  | 'RANSOMWARE_EXTORTION'
  | 'PRE_POSITION_WARTIME'
  | 'ELECTION_INTERFERENCE'
  | 'FINANCIAL_THEFT'
  | 'MILITARY_C2_DEGRADATION';

export type AccessLevel = 'NONE' | 'INITIAL' | 'USER' | 'ADMIN' | 'ROOT' | 'DOMAIN' | 'OT_DIRECT';

export interface FalseTrail {
  id: string;
  plantedByGroupId: string;
  mimickedGroupId: string;
  mimickedCountryId: string;
  convincingnessScore: number;
  isExposed: boolean;
  exposedAtTick: number | null;
}

export interface KillChainOperation {
  id: string;
  groupId: string;
  targetCountryId: string;
  targetSector: InfrastructureSector;
  targetSystemId: string | null;
  currentStage: KillChainStage;
  stageProgress: number;
  stagesCompleted: KillChainStage[];
  dwellTicksAccumulated: number;
  dwellTicksTarget: number;
  isDetected: boolean;
  detectedAtTick: number | null;
  detectedBySector: string | null;
  attributionConfidence: number;
  falseTrailsActive: FalseTrail[];
  objectiveType: CyberObjectiveType;
  payloadId: string | null;
  accessLevel: AccessLevel;
  lateralMovementNodes: number;
  startedAtTick: number;
  exfiltrationDataGb: number;
  isComplete: boolean;
  completedAtTick: number | null;
  outcomeSummary: string | null;
}

export type InfrastructureSector =
  | 'POWER_GRID'
  | 'FINANCIAL_SYSTEM'
  | 'TRANSPORT'
  | 'HEALTHCARE'
  | 'MILITARY_C2'
  | 'WATER_SYSTEM'
  | 'COMMUNICATIONS'
  | 'FUEL_GAS'
  | 'FOOD_SUPPLY'
  | 'NUCLEAR_FACILITIES';

export interface PersistentAccessNode {
  id: string;
  operationId: string;
  targetCountryId: string;
  targetSectorId: InfrastructureSector;
  systemType: string;
  implantType: 'BACKDOOR' | 'ROOTKIT' | 'WEBSHELL' | 'SUPPLY_CHAIN_IMPLANT' | 'FIRMWARE_IMPLANT';
  isActive: boolean;
  isDetected: boolean;
  detectionRisk: number;
  accessLevel: AccessLevel;
  dwellTicksActive: number;
  canTriggerPayload: boolean;
  payloadReady: boolean;
  lastActivityTick: number;
}

export type HardeningTier = 'UNPROTECTED' | 'BASIC' | 'STANDARD' | 'ADVANCED' | 'HARDENED' | 'AIR_GAPPED';

export type CyberIncidentType =
  | 'POWER_OUTAGE'
  | 'FINANCIAL_FREEZE'
  | 'TRANSPORT_HALT'
  | 'HOSPITAL_OFFLINE'
  | 'C2_BLACKOUT'
  | 'WATER_CONTAMINATION'
  | 'PIPELINE_SHUTDOWN'
  | 'DATA_DESTRUCTION'
  | 'RANSOMWARE_LOCKOUT'
  | 'SUPPLY_CHAIN_POISONING';

export interface CyberIncident {
  id: string;
  operationId: string;
  sector: InfrastructureSector;
  incidentType: CyberIncidentType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  economicLoss: number;
  populationImpact: number;
  isContained: boolean;
  containedAtTick: number | null;
  recoveryTicksRequired: number;
  publiclyAttributed: boolean;
  attributedTo: string | null;
}

export interface CascadeEffect {
  fromSector: InfrastructureSector;
  toSector: InfrastructureSector;
  effectType: 'OPERATIONAL_DEGRADATION' | 'SUPPLY_CHAIN_BREAK' | 'CONFIDENCE_COLLAPSE' | 'WORKFORCE_DISRUPTION';
  magnitude: number;
  durationTicksRemaining: number;
}

export interface InfrastructureHealthState {
  countryId: string;
  sector: InfrastructureSector;
  integrityScore: number;
  availabilityScore: number;
  resilienceScore: number;
  hardeningTier: HardeningTier;
  activeIncidents: CyberIncident[];
  recoveryTicksRemaining: number;
  economicOutputModifier: number;
  cascadingEffectsActive: CascadeEffect[];
  lastAttackedTick: number | null;
  lastRecoveredTick: number | null;
}

export interface ZeroDay {
  id: string;
  name: string;
  targetSystem: string;
  exploitCategory: 'REMOTE_CODE_EXEC' | 'PRIVILEGE_ESCALATION' | 'LATERAL_MOVEMENT' | 'DATA_EXFIL' | 'DESTRUCTIVE';
  reliability: number;
  detectability: number;
  exclusivity: number;
  patchRisk: number;
  marketValue: number;
  acquiredFrom: 'DEVELOPED' | 'PURCHASED' | 'STOLEN' | 'SHARED';
  isPatched: boolean;
  patchedAtTick: number | null;
}

export interface MalwareSample {
  id: string;
  name: string;
  type: 'WIPER' | 'RAT' | 'ROOTKIT' | 'RANSOMWARE' | 'IMPLANT' | 'WORM' | 'INFO_STEALER';
  targetedSectors: InfrastructureSector[];
  effectivenessScore: number;
  stealthScore: number;
  developmentTicksRequired: number;
  developmentProgress: number;
  isComplete: boolean;
  zeroDaysRequired: string[];
  countermeasureResistance: number;
  deployedInOperations: string[];
}

export interface BotnetService {
  id: string;
  provider: string;
  size: number;
  capabilities: ('DDoS' | 'SPAM' | 'PROXY' | 'CRED_THEFT' | 'RANSOMWARE_DELIVERY')[];
  costPerTick: number;
  detectionRisk: number;
  attributionDistance: number;
}

export interface HackAndLeakOperation {
  id: string;
  operationId: string;
  targetCountryId: string;
  leakTarget: 'LEADER' | 'PARTY' | 'MILITARY' | 'CORPORATION' | 'INTELLIGENCE_AGENCY';
  dataVolume: number;
  damageScore: number;
  releaseStrategy: 'IMMEDIATE' | 'TIMED' | 'INCREMENTAL' | 'THIRD_PARTY_CUTOUT';
  releaseTick: number | null;
  publicReactionScore: number;
  legitimacyDamageDone: number;
  unrestWindowDurationTicks: number;
  isReleased: boolean;
  releasedAtTick: number | null;
  attributedTo: string | null;
}

export interface CyberDefenseBudget {
  countryId: string;
  totalBudget: number;
  allocationBySector: Record<InfrastructureSector, number>;
  allocationToIncidentResponse: number;
  allocationToThreatIntel: number;
  allocationToOffensiveCounter: number;
  totalAllocated: number;
}

export interface IncidentResponseTeam {
  id: string;
  countryId: string;
  teamType: 'CERT' | 'MILITARY_CYBER' | 'CONTRACTOR' | 'COALITION';
  expertise: number;
  capacity: number;
  currentLoad: number;
  responseTimeTicks: number;
  isDeployed: boolean;
  deployedToIncidentId: string | null;
}

export interface CyberNormsProvision {
  type: 'NO_ATTACK_CRITICAL_INFRA' | 'NO_ELECTION_INTERFERENCE' | 'ATTRIBUTION_SHARING' | 'RANSOMWARE_PROHIBITION' | 'NO_HOSPITAL_ATTACK' | 'RESPONSIBLE_DISCLOSURE' | 'HOTLINE_PROTOCOLS';
  isBinding: boolean;
  violationThreshold: number;
}

export interface CyberNormsTreaty {
  id: string;
  name: string;
  signatories: string[];
  provisions: CyberNormsProvision[];
  isEnforced: boolean;
  violationCount: number;
  violationsByCountry: Record<string, number>;
  diplomaticConsequences: string;
}

export interface CyberEscalationTrigger {
  id: string;
  triggerCondition: string;
  triggeringOperationId: string;
  escalationPath: 'KINETIC_RETALIATION' | 'DIPLOMATIC_EXPULSION' | 'SANCTIONS' | 'COUNTER_CYBER';
  escalationProbability: number;
  isTriggered: boolean;
  triggeredAtTick: number | null;
  affectedCountries: string[];
}

export interface CyberIntelligenceGain {
  operationId: string;
  gainType: 'MILITARY_PLANS' | 'DIPLOMATIC_CABLES' | 'WEAPONS_SPECS' | 'PERSONNEL_FILES' | 'FINANCIAL_FLOWS';
  confidenceLevel: number;
  targetCountryId: string;
  feedsIntoStore: 'sigintStore' | 'arachneStore' | 'finintStore' | 'militaryStore';
  dataKey: string;
  harvestedAtTick: number;
}

export interface AttributionInvestigation {
  id: string;
  targetCountryId: string;
  operationId: string;
  startTick: number;
  ticksRequired: number;
  currentConfidence: number;
  pointingAt: string[];
  falseTrailsInfluencing: string[];
  isComplete: boolean;
  conclusionCountryId: string | null;
  conclusionAccuracy: boolean;
}

export interface SectorRecoveryEntry {
  countryId: string;
  sector: InfrastructureSector;
  ticksRemaining: number;
}

export interface ZeroDayListing {
  id: string;
  sellerId: string;
  targetSystem: string;
  exploitCategory: ZeroDay['exploitCategory'];
  reliability: number;
  detectability: number;
  exclusivityClaim: boolean;
  askingPrice: number;
  isAuthentic: boolean;
  patchRisk: number;
}

export interface CyberAlert {
  id: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tick: number;
  read: boolean;
}
`;

fs.appendFileSync('src/types.ts', content);
