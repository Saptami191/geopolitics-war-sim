import { BusEvent } from './sim/eventBus/types';

// ─── REGIME PRESSURE CORE TYPES ─────────────────────────────────────

export type RegimePressureOp =
  | 'PROTEST_ENGINEERING'
  | 'COUP_ARCHITECTURE'
  | 'ELECTION_INTERFERENCE'
  | 'OPPOSITION_FUNDING'
  | 'ELITE_SPLIT_OPERATION'
  | 'TARGETED_REMOVAL';

export type RegimePressurePhase =
  | 'PLANNING'       // op designed, not yet initiated — no risk
  | 'PREPARATION'    // assets deployed in country — low risk of detection
  | 'EXECUTION'      // op running — full risk active
  | 'CONSOLIDATION'  // op succeeded, locking in outcome — medium risk
  | 'COVER'          // cleaning up evidence — low risk, blowback window
  | 'COMPLETE'       // op closed out, outcomes applied
  | 'BLOWN'          // op exposed — blowback triggers
  | 'PARTIAL_FAIL';  // op failed without full exposure — partial damage

export type RegimePressureOutcome =
  | 'REGIME_COLLAPSED'
  | 'LEADER_REMOVED'
  | 'ELECTION_STOLEN'
  | 'OPPOSITION_EMPOWERED'
  | 'ELITE_FRACTURED'
  | 'COUP_SUCCEEDED'
  | 'COUP_FAILED'
  | 'OP_EXPOSED'
  | 'PARTIAL_SUCCESS'
  | 'BLOWBACK_TRIGGERED';

export type BlowbackSeverity = 'WHISPER' | 'RUMOR' | 'ACCUSATION' | 'PROOF' | 'CRISIS';

export interface EliteFaction {
  id: string;
  name: string;                          // "Military Council", "Business Oligarchs", "Religious Establishment"
  countryId: string;
  powerShare: number;                    // 0-100: % of effective state power this faction holds
  loyaltyToLeader: number;               // 0-100: current loyalty to sitting head of state
  corruptibilityScore: number;           // 0-100: susceptibility to bribery/defection
  grievanceLevel: number;                // 0-100: accumulated resentment
  playerContactEstablished: boolean;     // has a back-channel been opened?
  contactOperativeId: string | null;     // which operative runs this relationship
  defectionThreshold: number;            // loyaltyToLeader score at which they flip
  publiclyVisible: boolean;              // does the world know about this faction?
}

export interface ProtestCampaign {
  id: string;
  countryId: string;
  turnLaunched: number;
  phase: RegimePressurePhase;
  currentIntensity: number;              // 0-100: crowd size / media coverage
  grievanceIssue: string;                // "food prices" | "election fraud" | "corruption" | "foreign occupation"
  playerFunded: boolean;
  playerFundingAmount: number;           // $B invested
  detectionRisk: number;                 // 0-100: chance per tick of exposure
  playerFingerprint: number;             // 0-100: how much forensic evidence links to player
  suppressionStrength: number;           // 0-100: regime crackdown force applied
  internationalCoverage: number;         // 0-100: global media attention
  casualtyCount: number;                 // civilian deaths from suppression
  turnsSinceLastEscalation: number;
}

export interface CoupOperation {
  id: string;
  targetCountryId: string;
  targetLeaderId: string;
  turnPlanned: number;
  phase: RegimePressurePhase;
  conspiratorFactionIds: string[];       // EliteFaction ids committed to coup
  requiredPowerShareForSuccess: number;  // min % of state power held by conspirators
  currentDetectionRisk: number;
  operativeIds: string[];                // operatives coordinating
  executionWindowTick: number | null;    // planned tick for coup attempt
  hasPlayerDeniability: boolean;         // false = player fingerprints on coup
  fundingCommitted: number;              // $B committed to coup plotters
  militaryCommitted: boolean;            // has a military faction joined?
  alternateLeaderDesignated: string | null; // proposed replacement leader id
}

export interface ElectionOp {
  id: string;
  countryId: string;
  electionTick: number;                  // scheduled tick when election occurs
  phase: RegimePressurePhase;
  targetCandidateId: string;             // leader id of preferred candidate
  oppositionCandidateId: string;         // leader id of candidate to suppress
  methods: ElectionInterferenceMethod[];
  fundingDeployed: number;               // $B in dark money
  disinfoIntensity: number;              // 0-100
  voteSuppressionActive: boolean;
  electoralSystemHacked: boolean;
  detectionRisk: number;
  projectedMarginShift: number;          // +/- percentage points shifted toward preferred candidate
  internationalObserversPresent: boolean; // raises exposure risk significantly
}

export type ElectionInterferenceMethod =
  | 'DARK_MONEY_FUNDING'
  | 'DISINFORMATION_CAMPAIGN'
  | 'OPPOSITION_SUPPRESSION'
  | 'ELECTORAL_SYSTEM_HACK'
  | 'VOTER_INTIMIDATION'
  | 'MEDIA_CAPTURE'
  | 'CANDIDATE_BLACKMAIL';

export interface OppositionAsset {
  id: string;
  countryId: string;
  assetName: string;                     // "Democratic Alliance Party" | "Free Press Collective"
  assetType: 'POLITICAL_PARTY' | 'MEDIA_OUTLET' | 'CIVIL_SOCIETY_ORG' | 'EXILE_NETWORK';
  turnEstablished: number;
  fundingReceived: number;               // total $B from player
  capacityScore: number;                 // 0-100: organizational strength
  publicProfile: number;                 // 0-100: how visible they are domestically
  playerFingerprint: number;             // 0-100: how evident foreign backing is
  regimeSuspicion: number;               // 0-100: target regime awareness
  isCompromised: boolean;                // regime has penetrated this org
  compromisedSinceTick: number | null;
  operativeHandlerId: string | null;
}

export interface BlowbackMemoryEntry {
  id: string;
  opType: RegimePressureOp;
  targetCountryId: string;
  targetLeaderId: string | null;
  tickOccurred: number;
  severity: BlowbackSeverity;
  isPubliclyKnown: boolean;
  isAttributedToPlayer: boolean;
  playerCountryId: string;
  opName: string;                        // human-readable op codename
  diplomaticDamage: Record<string, number>; // countryId → relationship damage
  sanctionsThreat: boolean;
  iccReferralRisk: boolean;
  affectedAlliances: string[];           // alliance ids that took damage
  mediaStormActive: boolean;
  mediaStormTicksRemaining: number;
  worldReactionText: string;             // procedurally generated summary line
  hasBeenAddressedByPlayer: boolean;     // player denied/acknowledged/blamed
}

export interface RegimePressureState {
  // Active operations
  activeProtestCampaigns: Record<string, ProtestCampaign>;
  activeCoupOps: Record<string, CoupOperation>;
  activeElectionOps: Record<string, ElectionOp>;
  activeOppositionAssets: Record<string, OppositionAsset>;

  // Elite faction modeling (per country)
  eliteFactions: Record<string, EliteFaction[]>;   // countryId → factions

  // Blowback memory system
  blowbackLog: BlowbackMemoryEntry[];
  activeBlowbackCrises: string[];        // blowbackMemoryEntry ids currently active

  // Global exposure tracking
  playerExposureScore: number;           // 0-100: global awareness that player runs covert ops
  currentlyTargetedCountries: string[];  // countries with active ops against them

  // Historical record
  completedOps: {
    opId: string;
    opType: RegimePressureOp;
    targetCountryId: string;
    outcome: RegimePressureOutcome;
    tick: number;
    blowbackId: string | null;
  }[];
}

export type Ideology = 'DEMOCRACY' | 'AUTOCRACY' | 'MILITARY_JUNTA' | 'THEOCRACY' | 'TECHNOCRACY' | 'OLIGARCHY' | 'COMMUNISM' | 'MONARCHY';

export const IDEOLOGIES: Ideology[] = [
  'DEMOCRACY',
  'AUTOCRACY',
  'MILITARY_JUNTA',
  'THEOCRACY',
  'TECHNOCRACY',
  'OLIGARCHY',
  'COMMUNISM',
  'MONARCHY'
];

export interface CountryStartConfig {
  ideology: Ideology;
  military: number;       // 1 - 100 power scale
  gdp: number;            // GDP in Billions USD
  opinion: number;        // -100 to 100 sentiment
  alliance: AllianceBlock; // NATO, BRICS, GCC, etc.
  nuclear: boolean;       // Nuclear status
}

export type WorldConfig = Record<string, CountryStartConfig>;

export type AllianceBlock = 'NATO' | 'BRICS' | 'GCC' | 'QUAD' | 'SCO' | 'NEUTRAL';

export type WeaponType = 'ICBM' | 'SLBM' | 'CRUISE_MISSILE' | 'HYPERSONIC' | 'FIGHTER_JET' |
                 'STEALTH_BOMBER' | 'CARRIER_GROUP' | 'SUBMARINE' | 'TANK_DIVISION' |
                 'ARTILLERY' | 'DRONE_SWARM' | 'CYBER_WEAPON' | 'EMP_DEVICE' | 'DIRTY_BOMB';

export type CommodityType = 'OIL' | 'NATURAL_GAS' | 'WHEAT' | 'RARE_EARTH' | 'SILICON' | 'WEAPONS_GRADE_URANIUM' | 'ARMS' | 'oil' | 'gas' | 'semiconductors' | 'food' | 'rareearths' | 'strategic';

export type FactionType = 'MILITARY_HARDLINERS' | 'REFORMERS' | 'ISLAMISTS' | 'NATIONALISTS' |
                  'OLIGARCHS' | 'TECHNOCRATS' | 'SEPARATISTS' | 'FOREIGN_BACKED';

export type StrikeStatus = 'QUEUED' | 'IN_FLIGHT' | 'INTERCEPTED' | 'IMPACT' | 'FAILED';

export type ThreatLevel = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'BLACK'; // BLACK = nuclear exchange imminent

export type HUDMode = 'STATE' | 'WAR_ROOM' | 'ANALYST';

export type CovertOpType = 'ASSASSINATE_LEADER' | 'DESTABILIZE_FACTION' | 'HACK_GRID' |
                   'SABOTAGE_OIL' | 'ELECTION_RIG' | 'PLANT_PROPAGANDA' |
                   'FUND_REBELS' | 'ARMS_SMUGGLE' | 'FINANCIAL_ATTACK';

export type ScenarioId = 'MENA_SPARK' | 'KASHMIR_FLASHPOINT' | 'STRAIT_CLOSURE' |
                 'SOVEREIGN_DEFAULT' | 'TECH_WAR' | 'ARCTIC_CLAIM';

export type ResearchNode = 'HAARP_V1' | 'HAARP_V2' | 'HAARP_V3' |
                   'IRON_DOME_V1' | 'IRON_DOME_V2' | 'IRON_DOME_V3' |
                   'CYBER_FIREWALL_V1' | 'CYBER_FIREWALL_V2' | 'CYBER_FIREWALL_V3' |
                   'HYPERSONIC_TECH' | 'SATELLITE_RECON' | 'QUANTUM_COMMS' |
                   'BIO_WEAPON_DETECT' | 'EMP_SHIELD' | 'DEEP_STRIKE';

export interface WeaponUnit {
  type: WeaponType;
  count: number;
  operational: number;           // count minus damaged/destroyed
  maintenanceCostPerTick: number; // in $B
  combatPowerRating: number;      // 1-100
  fuelLevel: number;              // 0-100%
  pilotMorale: number;            // 0-100% — affects sortie effectiveness
  supplyChainStatus: 'NOMINAL' | 'STRAINED' | 'CRITICAL' | 'SEVERED';
  blackMarketSource: boolean;     // acquired via arms black market
}

export interface Arsenal {
  units: WeaponUnit[];
  totalPowerRating: number;       // computed sum
  totalMaintenanceCost: number;   // computed sum
  nuclearCapable: boolean;
  abmShieldStrength: number;      // 0-100% — upgraded via R&D
  abmIntercepts: number;          // successful intercepts this tick
  readinessLevel: number;         // 0-100% — affected by morale + supply
  personnel?: MilitaryPersonnel;
  logistics?: MilitaryLogistics;
  readiness?: MilitaryReadiness;
  combatRealism?: MilitaryCombat;
}

export interface BondIssuance {
  id: string;
  amount: number;       // $B
  interestRate: number; // %
  maturityTicks: number;
  remainingTicks: number;
  holder: string;       // countryId or 'IMF' or 'MARKET'
}

export interface OligarchNetwork {
  id: string;
  name: string;
  wealthB: number;        // $B net worth
  influenceScore: number; // 0-100
  sector: string;         // 'ENERGY' | 'MEDIA' | 'BANKING' | 'DEFENSE'
  loyalty: number;        // 0-100 — can flip if repressed or bribed
  offshoreAccountsB: number;
}

export interface SpendingAllocation {
  military: number;    // fraction 0-1
  healthcare: number;
  education: number;
  infrastructure: number;
  intelligence: number;
  debtService: number;
  propaganda: number;
}

export interface EconomicProfile {
  gdpB: number;
  gdpGrowthRate: number;       // % per tick annualized
  inflationRate: number;       // %
  unemploymentRate: number;    // %
  treasuryCashB: number;
  debtToGdpRatio: number;      // %
  debtStressIndex: number;     // 0-100
  interestRate: number;        // central bank rate %
  currencyStrength: number;    // 0-200, 100 = neutral
  taxRate: number;             // % of GDP collected
  corporateTaxRate: number;    // %
  printingPressActive: boolean;
  printingPressIntensity: number; // 1-5 multiplier
  bonds: BondIssuance[];
  oligarchs: OligarchNetwork[];
  offshoreSlushFundB: number;
  sanctionedBy: string[];      // countryIds
  tradeSurplusDeficitB: number;
  spendingAllocation: SpendingAllocation;
  policyPosture?: 'PRO_GROWTH' | 'AUSTERITY' | 'CURRENCY_DEFENSE' | 'IMPORT_SUPPORT' | 'DEBT_STABILIZATION' | 'INDUSTRIAL_ALLOCATION';
  businessCyclePhase?: 'EXPANSION' | 'OVERHEATING' | 'SLOWDOWN' | 'CONTRACTION' | 'CRISIS' | 'STABILIZATION' | 'RECOVERY';
  sectors?: EconomicSectors;
  supplyChains?: SupplyChains;
  financialMarkets?: FinancialMarkets;
}

export interface Faction {
  type: FactionType;
  strengthIndex: number;    // 0-100
  isGoverning: boolean;
  demandsMetScore: number;  // 0-100 — how satisfied this faction is
  foreignBacker?: string;   // countryId sponsoring this faction
  isRebelling: boolean;
  armamentLevel: number;    // 0-100 if armed
}

export interface MediaChannel {
  id: string;
  name: string;
  reach: number;            // 0-100% of population
  stateControlled: boolean;
  foreignInfluence?: string; // countryId running influence
  narrativeBias: number;     // -100 (opposition) to +100 (pro-government)
}

export interface PoliticalProfile {
  ideology: Ideology;
  leaderName: string;
  leaderApprovalRating: number;   // 0-100%
  popularUnrest: number;          // 0-100
  stabilityIndex: number;         // 0-100
  electionDueTick?: number;       // tick when election is due
  coupRiskLevel: number;          // 0-100
  martialLawActive: boolean;
  martialLawTicksRemaining: number;
  factions: Faction[];
  mediaChannels: MediaChannel[];
  propagandaEffectiveness: number; // 0-100
  censorship: number;              // 0-100
  diasporaInfluence: number;       // 0-100 — expats sending money/info back
  corruption?: number;             // 0-100
  infoWarfare?: InformationCampaign;
  regimePressure?: NationRegimePressureState;
}

export interface SatelliteAsset {
  id: string;
  orbitType: 'LEO' | 'GEO' | 'POLAR';
  coverageCountryIds: string[];
  reconQuality: number;       // 0-100
  isCompromised: boolean;
  launchCostB: number;
}

export interface CyberAsset {
  id: string;
  type: 'OFFENSIVE' | 'DEFENSIVE' | 'DUAL_USE';
  targetCountryId?: string;
  powerLevel: number;         // 0-100
  isDeployed: boolean;
  firewallRating: number;     // defensive only
}

export interface CovertOp {
  id: string;
  type: CovertOpType;
  targetCountryId: string;
  successProbability: number;
  costB: number;
  ticksToComplete: number;
  remainingTicks: number;
  status: 'PLANNING' | 'ACTIVE' | 'BLOWN' | 'SUCCESS' | 'FAILED';
  blowbackRisk: number;       // 0-100
}

export interface Province {
  id: string;
  name: string;
  population: number; // millions
  controllerCountryId: string;
  originalCountryId: string;
  integrity: number; // 0-100% infrastructure status
  features: Array<'CITY' | 'PORT' | 'AIRBASE' | 'ENERGY_FACILITY' | 'INDUSTRIAL_ZONE'>;
  resistanceLevel: number; // 0-100
}

export interface PopulationProfile {
  ageDemographics: { youthPct: number; adultPct: number; elderlyPct: number };
  birthRate: number; // births per year per 1000
  deathRate: number; // deaths per year per 1000
  educationLevel: number; // 0-100
  urbanization: number; // 0-100
  poverty: number; // 0-100
  migration: number; // monthly net migration
  religiousComposition: { secular: number; religiousA: number; religiousB: number };
  ethnicComposition: { majority: number; minorityA: number; minorityB: number };
  workforceParticipation: number; // 0-100
}

export interface CabinetMember {
  name: string;
  competence: number; // 0-100
  loyalty: number; // 0-100
  corruption: number; // 0-100
  ideology: Ideology;
}

export interface Cabinet {
  defenseMinister: CabinetMember;
  financeMinister: CabinetMember;
  foreignMinister: CabinetMember;
  intelligenceChief: CabinetMember;
  centralBankGovernor: CabinetMember;
}

export interface EconomicSectors {
  agriculture: number; // value $B
  manufacturing: number;
  services: number;
  energy: number;
  mining: number;
  technology: number;
  tourism: number;
  defense: number;
}

export interface SupplyChains {
  energyDependency: number; // 0-100%
  foodDependency: number; // 0-100%
  semiconductorDependency: number; // 0-100%
  defenseDependency: number; // 0-100%
}

export interface FinancialMarkets {
  stockMarketIndex: number;
  bondYield: number; // %
  currencyMarketValue: number; // e.g. 100 is baseline
  sovereignRating: string; // e.g. 'AAA', 'A', 'BBB', etc.
}

export interface MilitaryPersonnel {
  activeTroops: number; // thousands
  reserveTroops: number; // thousands
  specialForces: number; // thousands
}

export interface MilitaryLogistics {
  ammunition: number; // 0-100
  fuel: number; // 0-100
  spareParts: number; // 0-100
  supplyDepots: number; // count
}

export interface MilitaryReadiness {
  training: number; // 0-100
  morale: number; // 0-100
  combatExperience: number; // 0-100
}

export interface MilitaryCombat {
  attrition: number; // 0-100
  supplyLineStatus: number; // 0-100
  occupationCosts: number; // $B per tick
  insurgencies: number; // 0-100
}

export interface SpyAsset {
  id: string;
  alias: string;
  targetCountryId: string;
  competence: number; // 0-100
  status: 'ACTIVE' | 'DORMANT' | 'DOUBLE_AGENT' | 'EXPOSED';
  ticksActive: number;
}

export interface InformationCampaign {
  socialMediaInfluence: number; // 0-100
  deepfakesActive: boolean;
  narrativeFocus: 'PRO_GOVERNMENT' | 'ANTAGONIZE' | 'FOREIGN_DISINFO';
  mediaOwnershipCensorship: number; // 0-100
}

export interface IntelligenceProfile {
  satellites: SatelliteAsset[];
  cyberAssets: CyberAsset[];
  activeCovertOps: CovertOp[];
  humintNetworks: { [countryId: string]: number }; // 0-100 penetration per country
  signalIntelScore: number;   // 0-100
  cyberFirewallLevel: number; // upgraded via R&D
  knownThreats: string[];     // countryIds with confirmed hostile intent
  blackBudgetB: number;       // hidden budget not visible in public spending
  spyAssets?: SpyAsset[];
  intelReportConfidence?: number; // 0-100
}

export interface Country {
  id: string;                         // ISO 2-letter e.g. 'US', 'CN'
  name: string;
  flagEmoji: string;
  continent: string;
  population: number;                 // millions
  allianceBlock: AllianceBlock;
  atWarWith: string[];                // countryIds
  tradePartners: string[];            // countryIds
  opinions: { [countryId: string]: number }; // -100 hostile to +100 allied
  threatLevel: ThreatLevel;
  nuclearDoctrineFirstStrike: boolean;
  researchUnlocked: ResearchNode[];
  researchInProgress?: { node: ResearchNode; ticksRemaining: number };
  haarpActive: boolean;
  haarpTargetCountryId?: string;
  economic: EconomicProfile;
  political: PoliticalProfile;
  arsenal: Arsenal;
  intelligence: IntelligenceProfile;
  lastEventLog: string[];            // last 5 event strings for this country
  tariffs?: { [countryId: string]: number }; // Tariff rate percentages (0-50%)
  provinces?: Province[];
  populationSim?: PopulationProfile;
  cabinet?: Cabinet;
  
  // T3.2 Propaganda / Narrative Warfare System properties
  domesticNarrative?: number;          // 0-100 score representing state/regime narrative alignment
  mediaResistance?: number;            // 0-1 scaling resistance/resilience to external influence
  recentNarrativeDelta?: number;       // Change in narrative score in the last tick
  hasCivilUnrestTriggered?: boolean;   // civil unrest threshold flag (<20)
  hasElectionInterferenceTriggered?: boolean; // election interference threshold flag (>80)
}

export interface BezierCurve {
  startX: number;
  startY: number;
  controlX: number;
  controlY: number;
  endX: number;
  endY: number;
}

export interface StrikeDamage {
  stabilityLoss: number;
  gdpLoss: number;
  militaryAssetsDestroyed: { type: WeaponType; count: number }[];
  casualtiesEstimate: number;
  infrastructureDamage: number;   // 0-100
  radiationContamination: boolean;
  empBlackout: boolean;
}

export interface BallisticStrike {
  id: string;
  sourceCountryId: string;
  targetCountryId: string;
  weaponType: WeaponType;
  warheadYieldMT?: number;         // megatons, for nuclear
  progressPct: number;             // 0-100
  status: StrikeStatus;
  bezier: BezierCurve;
  launchTick: number;
  impactTick: number;
  isRetaliatory: boolean;
  interceptAttempted: boolean;
  interceptSuccess?: boolean;
  damageDealt?: StrikeDamage;
}

export interface CommodityMarket {
  type: CommodityType;
  spotPriceUSD: number;
  baselinePrice: number;
  volatilityIndex: number;    // 0-100
  supplyShockActive: boolean;
  embargoed: boolean;
  embargoedBy: string[];
  priceHistory: number[];     // last 20 ticks
}

export interface ArmsDeal {
  id: string;
  sellerId: string;
  buyerId: string;
  weaponType: WeaponType;
  quantity: number;
  priceB: number;
  isBlackMarket: boolean;
  deliveryTick: number;
}

export interface PlayerState {
  countryId: string;
  hudMode: HUDMode;
  activeTab: number;           // 1-6 for F1-F6
  cashB: number;               // synced from/to country treasury
  activeScenario: ScenarioId;
  scenarioStartTick: number;
  totalTicks: number;
  tickSpeed: 'PAUSED' | 'SLOW' | 'NORMAL' | 'FAST' | 'ULTRA';
  selectedTargetCountryId?: string;
  pendingStrike?: Partial<BallisticStrike>;
  gameOver: boolean;
  gameOverReason?: string;
  victoryAchieved: boolean;
  victoryReason?: string;
  aftermathActive: boolean;
  aftermathType: 'VICTORY' | 'DEFEAT' | 'NONE';
  aftermathReason?: string;
  checkpointState?: any;
}

export interface AIOperationLogEntry {
  tick: number;
  countryId: string;
  countryName: string;
  action: string;
  targetCountryId?: string;
  targetCountryName?: string;
  description: string;
  secrecyScore: number;
  impactScore: number;
}

export interface WorldState {
  countries: { [id: string]: Country };
  activeStrikes: BallisticStrike[];
  commodityMarkets: CommodityMarket[];
  activeArmsDeals: ArmsDeal[];
  globalThreatLevel: ThreatLevel;
  globalEventLog: { tick: number; text: string; severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SYSTEM' }[];
  currentTick: number;
  lastWarDeclarationTick?: number;
  pacingPreset?: PacingPreset;
  scheduledConsequences?: ScheduledConsequence[];
  recentResolvedConsequences?: ScheduledConsequence[];
  aiOperationsLog?: AIOperationLogEntry[];
  worldBuilderConfig?: WorldConfig;
  nuclearExchangeOccurred: boolean;
  world: CanonicalWorld;
}

export type TickDuration = "day" | "week" | "month";
export type MaxTicks = number | "endless";

export interface PacingPreset {
  tickDuration: TickDuration;
  maxTicks: MaxTicks;
  warDeclarationCooldown: number;
  escalationDamper: number;
  earlyGameProtection: number;
}

export type DurationMode = "scenario" | "timed" | "endless";

export interface DurationConfig {
  mode: DurationMode;
  tickDuration: TickDuration;
  tickBudget?: number;
}

// ==========================================
// T3.1 - UNIT MANAGEMENT SYSTEM SHAPES
// ==========================================
export type UnitType = 'CarrierGroup' | 'Submarine' | 'ICBMSilo' | 'AirWing' | 'SpecForce';
export type UnitStatus = 'IDLE' | 'MOVING' | 'DEPLOYED' | 'ON_MISSION' | 'RECON' | 'COMBAT' | 'PATROL' | 'DESTROYED';
export type UnitMissionType = 'NONE' | 'PATROL' | 'STRIKE' | 'AIR_SUPPORT' | 'INFILTRATING';

export interface MissionTarget {
  name: string;
  lat: number;
  lon: number;
  countryId?: string;
}

export interface UnitRoute {
  source: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  startTick: number;
  endTick: number;
  totalTicks: number;
  path: [number, number][]; // Great-circle interpolated points as [lon, lat] for rendering trails/current positions
}

export interface BaseUnit {
  id: string;
  name: string;
  type: UnitType;
  owner: string; // CountryId e.g. 'US', 'CN', 'RU'
  position: { lat: number; lon: number };
  status: UnitStatus;
  missionTarget: MissionTarget | null;
  missionType: UnitMissionType;
  eta: number | null;
  route: UnitRoute | null;
  health: number; // 0-100%
  fuel: number; // 0-100%
  recentActivity?: string[];
}

export interface CarrierGroupUnit extends BaseUnit {
  type: 'CarrierGroup';
  embarkedAirWings: number;
  strikeCapacity: number;
  wakeTrail: [number, number][]; // Historical [lon, lat] trace
}

export interface SubmarineUnit extends BaseUnit {
  type: 'Submarine';
  stealthProfile: number; // 0-100
  missileCapacity: number;
}

export interface ICBMSiloUnit extends BaseUnit {
  type: 'ICBMSilo';
  missileReadiness: number; // 0-100
  warheadType: string;
  hardened: boolean;
}

export interface AirWingUnit extends BaseUnit {
  type: 'AirWing';
  aircraftCount: number;
  rangeKm: number;
  homeBase: string;
}

export interface SpecForceUnit extends BaseUnit {
  type: 'SpecForce';
  squadSize: number;
  infiltrationState: 'STAGED' | 'INFILTRATED' | 'COMPROMISED' | 'EXTRACTED';
  stagingArea: string;
}

export type Unit = CarrierGroupUnit | SubmarineUnit | ICBMSiloUnit | AirWingUnit | SpecForceUnit;

// ==========================================
// T3.3 - BLACK MARKET TYPES
// ==========================================
export type BlackMarketItemType = 'MANPADS' | 'NUCLEAR_TRIGGERS' | 'SATELLITE_JAMMERS' | 'CRUISE_MISSILE';

export interface AuctionLot {
  id: string;
  itemType: BlackMarketItemType;
  title: string;
  description: string;
  sellerTag: string;
  rarity: 'COMMON' | 'RARE';
  basePrice: number;
  currentBid: number;
  currentLeaderId: string | null; // 'PLAYER' or AI countryId (e.g. 'CN', 'RU', etc.)
  expiresAtTick: number;
  spawnedAtTick: number;
  status: 'LIVE' | 'RESOLVED' | 'DELIVERING' | 'DELIVERED' | 'EXPIRED';
  deliveryTick: number | null;
  suspicionOnWin: number;
  aiInterestProfile?: {
    baseDesire: number; // 0-100 rating of how much AI wants this
    interestedAIs: string[]; // countryIds that are competing
  };
}

// ==========================================
// T3.4 - LEADER PERSONALITY TYPES
// ==========================================
export const LeaderPersonality = {
  HAWK: 'HAWK',
  DOVE: 'DOVE',
  PRAGMATIST: 'PRAGMATIST',
  IDEOLOGUE: 'IDEOLOGUE',
  UNPREDICTABLE: 'UNPREDICTABLE'
} as const;

export type LeaderPersonality = typeof LeaderPersonality[keyof typeof LeaderPersonality];

export interface LeaderTraitVector {
  hawkishness: number;         // 0-100
  prestigeHunger: number;      // 0-100
  paranoia: number;            // 0-100
  corruption: number;          // 0-100
  rigidity: number;            // 0-100
  riskTolerance: number;       // 0-100
  patience: number;            // 0-100
  ideologicalFixation: number; // 0-100
  institutionalLoyalty: number;// 0-100
  personalVanity: number;      // 0-100
  empathy: number;             // 0-100
  vindictiveness: number;      // 0-100
  bluffPropensity: number;     // 0-100
  crisisComposure: number;     // 0-100
  adaptability: number;        // 0-100
}

export interface LeaderPersonalityProfile {
  archetype: string;           // e.g. "Hawkish prestige-driven nationalist", "Paranoid besieged autocrat", etc.
  traits: LeaderTraitVector;
}

export interface LeaderEmotionalState {
  humiliation: number;         // 0-100 (decaying)
  fear: number;                // 0-100 (decaying)
  emboldenment: number;        // 0-100 (decaying)
  anger: number;               // 0-100
  anxiety: number;             // 0-100
  pride: number;               // 0-100
  resentment: number;          // 0-100
  vindication: number;         // 0-100
  desperation: number;         // 0-100
  overconfidence: number;      // 0-100
  fatigue: number;             // 0-100
  relief: number;              // 0-100
  paranoiaSpike: number;       // 0-100
  moralInjury: number;         // 0-100
  shame: number;               // 0-100
}

export interface LeaderTriggerRecord {
  triggerType: string;         // e.g. "PUBLIC_DEFEAT", "BORDER_PRESSURE", "DIPLOMATIC_CONCESSION"
  tickOccurred: number;
  emotionShifted: string;
  magnitude: number;
}

export interface LeaderStressHistory {
  currentStress: number;       // 0-100
  peakStress: number;
  ticksAtMaxStress: number;
  triggerLogs: LeaderTriggerRecord[];
}

export interface LeaderPublicPersona {
  rhetoricStyle: 'BELLICOSE' | 'CONCILIATORY' | 'REASSURING' | 'VICTIMHOOD' | 'TRIUMPHALIST' | 'DEFLECTIVE';
  mediaPresence: string;
  propagandaFocus: string;
  un_stance: string;
}

export interface LeaderPrivateDisposition {
  negotiationStance: 'UNCOMPROMISING' | 'TRANSACTIONAL' | 'CONCILIATORY' | 'REVOLUTIONARY';
  coerciveTendency: number; // 0-100
  backchannelOpenness: number; // 0-100
  innerCircleLoyaltyRequired: number; // 0-100
}

export interface LeaderRiskAppetiteProfile {
  militaryCoercionLimit: number; // 0-100
  cyberOffensiveTolerance: number; // 0-100
  nuclearBrinkmanshipThreshold: number; // 0-100
  covertOperationsExposureFear: number; // 0-100
}

export interface LeaderTrustStyleProfile {
  institutionalTrust: number; // 0-100
  personalTrust: number;      // 0-100
  coercivePreference: number; // 0-100
  economicInterdependenceTrust: number; // 0-100
}

export interface LeaderEscalationStyleProfile {
  pacing: 'SLOW_METHODICAL' | 'THEATRICAL_PUBLIC' | 'SECRETIVE_DENIABLE' | 'IMPULSIVE_HOT_BLOODED' | 'BRINKMANSHIP_HEAVY';
  escalationCeiling: number; // 0-100
  retaliationSpeed: 'INSTANT' | 'CALCULATED_DELAYED' | 'ASYMMETRIC';
  nuclearLaunchPrudence: number; // 0-100
}

export interface LeaderCompromiseStyleProfile {
  faceSavingRequired: boolean;
  concessionThreshold: number; // 0-100
  alliedConsultationStance: 'UNCOOPERATIVE' | 'CONSULTATIVE' | 'DEPENDENT';
  bribeAcceptanceScore: number; // 0-100
}

export interface LeaderMiscalculationProfile {
  influenceOfAdvisorFiltering: number; // 0-100
  propagandaBeliefFactor: number; // 0-100
  overconfidenceBias: number; // 0-100
  stressDistortionMultiplier: number; // e.g. 1.0 - 2.0
}

export interface LeaderSuccessionProfile {
  coupRiskScore: number; // 0-100
  successionInstabilityIndex: number; // 0-100
  designatedSuccessorId?: string;
  expectedTransitionType: 'ELECTION' | 'COUP' | 'RESPONSES' | 'HANDOFF' | 'ILLNESS';
}

export interface LeaderVulnerabilityProfile {
  corruptionVulnerability: number; // 0-100
  intelligencePenetrationScore: number; // 0-100
  eliteDissentFractureIndex: number; // 0-100
  blackmailExposureLevel: number; // 0-100
}

export const RedLineTriggerType = {
  TERRITORIAL_INTEGRITY: 'TERRITORIAL_INTEGRITY',
  REGIME_SURVIVAL: 'REGIME_SURVIVAL',
  FAMILY_ELITE_SECURITY: 'FAMILY_ELITE_SECURITY',
  PUBLIC_HUMILIATION: 'PUBLIC_HUMILIATION',
  ALLIANCE_BETRAYAL: 'ALLIANCE_BETRAYAL',
  NUCLEAR_STATUS: 'NUCLEAR_STATUS',
  SYMBOLIC_SOVEREIGNTY: 'SYMBOLIC_SOVEREIGNTY',
  IDEOLOGICAL_CHALLENGE: 'IDEOLOGICAL_CHALLENGE',
  ECONOMIC_STRANGULATION: 'ECONOMIC_STRANGULATION',
  MILITARY_ENCIRCLEMENT: 'MILITARY_ENCIRCLEMENT'
} as const;

export type RedLineTriggerType = typeof RedLineTriggerType[keyof typeof RedLineTriggerType];

export interface LeaderRedLineProfile {
  id: string;
  type: RedLineTriggerType;
  description: string;
  isTriggered: boolean;
  severityIndex: number;    // 0-100
  actionOnCross: string;
  discoveryProgress: number; // 0-100 progress towards being known
  sourceOfDiscovery?: string;
}

export interface LeaderIntelligenceExposureState {
  kompromatAssetsTracked: string[];
  buggedCommsActive: boolean;
  advisorInfiltrated: boolean;
  publicDossierCertainty: number; // 0-100
}

export interface LeaderReactionModel {
  lastEventReactedTo?: string;
  lastReactionTick?: number;
  customRhetoricHistory: string[];
}

export interface LeaderMemoryTrace {
  id: string;
  targetCountryId: string;
  type: 'PROMISE_KEPT' | 'PROMISE_BROKEN' | 'COERCION_ATTEMPT' | 'BLUFF_SUCCESS' | 'BETRAYAL' | 'PUBLIC_HUMILIATION' | 'PERSONAL_SLIGHT';
  tickOccurred: number;
  description: string;
  weight: number;
}

export interface LeaderPsychologyState {
  personality: LeaderPersonalityProfile;
  emotions: LeaderEmotionalState;
  stress: LeaderStressHistory;
  publicPersona: LeaderPublicPersona;
  privateDisposition: LeaderPrivateDisposition;
  riskAppetiteToEscalate: LeaderRiskAppetiteProfile;
  trustStyle: LeaderTrustStyleProfile;
  escalationStyle: LeaderEscalationStyleProfile;
  compromiseStyle: LeaderCompromiseStyleProfile;
  miscalculations: LeaderMiscalculationProfile;
  succession: LeaderSuccessionProfile;
  vulnerability: LeaderVulnerabilityProfile;
  exposure: LeaderIntelligenceExposureState;
  reactionModel: LeaderReactionModel;
  redLines: LeaderRedLineProfile[];
  memories: LeaderMemoryTrace[];
}

export interface Leader {
  id: string;
  countryId: string;
  name: string;
  type: LeaderPersonality;
  hawkDoveScore: number;
  riskTolerance: number;
  portraitSeed: string;
  portraitDataUrl?: string;
  installedAtTick: number;
  source: 'INITIAL' | 'ELECTION' | 'COUP';
  psychology?: LeaderPsychologyState;
  playerInstalled?: boolean;
}

// ==========================================
// T3.5 - CONSEQUENCE CHAIN TYPES
// ==========================================
export const ConsequenceEffectType = {
  SANCTIONS: 'SANCTIONS',
  UN_RESOLUTION: 'UN_RESOLUTION',
  REFUGEE_FLOW: 'REFUGEE_FLOW',
  MARKET_REACTION: 'MARKET_REACTION',
  ALLIANCE_INVITATION: 'ALLIANCE_INVITATION',
  COUP_RISK_INCREASE: 'COUP_RISK_INCREASE'
} as const;

export type ConsequenceEffectType = typeof ConsequenceEffectType[keyof typeof ConsequenceEffectType];

export type MajorActionType =
  | 'DECLARE_WAR'
  | 'IMPOSE_SANCTIONS'
  | 'SIGN_ALLIANCE'
  | 'LAUNCH_STRIKE'
  | 'NUCLEAR_ESCALATION'
  | 'DISPATCH_FOREIGN_AID'
  | 'STAGE_COUP'
  | 'REGIME_CHANGE';

export interface ConsequenceEffect {
  delay: number;
  effectType: ConsequenceEffectType;
  probability: number;
  params: Record<string, any>;
}

export interface ConsequenceTemplate {
  actionType: MajorActionType;
  effects: ConsequenceEffect[];
}

export interface ScheduledConsequence {
  id: string;
  sourceActionId: string;
  sourceCountryId: string;
  targetCountryId?: string;
  actionType: MajorActionType;
  scheduledTick: number;
  createdAtTick: number;
  effectType: ConsequenceEffectType;
  probability: number;
  params: Record<string, any>;
  resolved: boolean;
  cancelled?: boolean;
}



// ==========================================
// T4.5 - COUNTRY HOTSPOT TYPES
// ==========================================
export type HotspotType =
  | 'NAVAL_BASE'
  | 'AIR_BASE'
  | 'NUCLEAR_FACILITY'
  | 'MISSILE_SITE'
  | 'DIPLOMATIC_COMPOUND'
  | 'COVERT_SITE'
  | 'INDUSTRIAL_SITE'
  | 'CYBER_FACILITY'
  | 'OTHER';

export interface HotspotImageAsset {
  id: string;
  hotspotId: string;
  kind: 'HERO' | 'DETAIL' | 'SATELLITE' | 'DOSSIER' | 'RENDER';
  src: string;
  thumbSrc?: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface CountryHotspot {
  id: string;
  countryId: string;
  name: string;
  type: HotspotType;
  lat: number;
  lon: number;
  importance: number; // e.g. 1-5 scale or similar
  status?: string;
  summary?: string;
  imageUrls?: string[];
  description?: string;
  classification?: string;
  tags?: string[];
  imageAssets?: HotspotImageAsset[];
  lastUpdatedTick?: number;
  threatLevel?: string;
  confidenceScore?: number;
  strategicValue?: number;
}

// ==========================================
// CANONICAL WORLD STATE - SIMULATION CORE MODELS
// ==========================================

export interface EconomicState {
  gdp: number;
  growthRate: number;
  inflation: number;
  unemployment: number;
  debtRatio: number;
  reserves: number;
  currencyStrength: number;
  tradeBalance: number;
  sanctionsExposure: number;
  importDependency: number;
  exportDependency: number;
  energyProfile: string;
  sectorBreakdown: Record<string, number>;
  supplyRisk: number;
  fiscalSpace: number;
  economicStress: number;
  recoveryRate: number;
  interestRate?: number; // central bank rate %

  // Module 2.1 Macro additions (backward compatible)
  businessCyclePhase?: 'EXPANSION' | 'OVERHEATING' | 'SLOWDOWN' | 'CONTRACTION' | 'CRISIS' | 'STABILIZATION' | 'RECOVERY';
  fragilityScore?: number;      // 0 - 100 scale
  resilienceScore?: number;     // 0 - 100 scale
  externalExposureScore?: number; // 0 - 100 scale
  importDependenceScore?: number; // 0 - 100 scale
  exportConcentrationScore?: number; // 0 - 100 scale
  shockLoad?: number;           // 0 - 100 score of active accumulated economic strain
  recoveryMomentum?: number;    // 0 - 100 index of speed of shock decay
  macroTrend?: 'BOOMING' | 'STABLE' | 'STAGNANT' | 'DETERIORATING' | 'CRISIS';
  recentMacroDrivers?: string[];
  policyPosture?: 'PRO_GROWTH' | 'AUSTERITY' | 'CURRENCY_DEFENSE' | 'IMPORT_SUPPORT' | 'DEBT_STABILIZATION' | 'INDUSTRIAL_ALLOCATION';
  currencyStability?: number;  // 0 - 100 scale
  sectors?: {
    energy: number;            // extractive % of GDP
    agriculture: number;       // agriculture/food %
    manufacturing: number;     // factory output %
    tech: number;              // high tech %
    services: number;          // service/finance %
    defense: number;           // defense-industrial output %
    state: number;             // public sector burden %
  };
}

export interface MilitaryState {
  manpower: number;
  readiness: number;
  morale: number;
  logisticsCapacity: number;
  mobilizationLevel: number;
  nuclearStatus: boolean;
  commandIntegrity: number;
  forceProjection: number;
  unitAbstractions: string[];
  strategicDeterrence: number;
  missileDefense: number;
  a2adStrength: number;
  activeTheaters: string[];
  warFatigue: number;
  equipmentHealth: number;
}

export interface CyberState {
  offensiveCapability: number;
  defensiveCapability: number;
  infrastructureResilience: number;
  activeIncidents: number;
  intrusionLevel: number;
  attributionExposure: number;
  cyberDoctrine: string;
  aptStrength: number;
  civilianNetworkHealth: number;
  militaryNetworkHealth: number;
  financialNetworkHealth: number;
  recoveryCapacity: number;
}

export interface AIState {
  personalityVector: Record<string, number>;
  threatPerceptions: Record<string, number>;
  trustByCountry: Record<string, number>;
  hostilityByCountry: Record<string, number>;
  strategicGoals: string[];
  activePlans: string[];
  memoryLog: string[];
  redLines: string[];
  decisionStyle: string;
  currentFocus: string;
  escalationTolerance: number;
  deceptionPreference: number;
  riskTolerance: number;
  allianceReliabilityScores: Record<string, number>;
}

export interface CountryState {
  id: string;
  name: string;
  shortName: string;
  isoCode: string; // stable identifier
  region: string;
  subregion: string;
  capital: string;
  population: number; // millions
  territory?: any; // optional geographic metadata
  ideology: Ideology;
  governmentType: string;
  regimeStability: number; // 0-100
  publicSentiment: number; // 0-100
  unrest: number; // 0-100
  legitimacy: number; // 0-100
  corruption: number; // 0-100
  strategicResources: string[];
  allianceIds: string[];
  rivalIds: string[];
  treatyIds: string[];
  atWarWith?: string[]; // active war front state tracker
  leaderId: string;
  economy: EconomicState;
  military: MilitaryState;
  cyber: CyberState;
  ai: AIState;
  tags: string[];
  createdFromScenarioPreset: boolean;
  lastUpdatedTick: number;
}

export interface LeaderState {
  id: string;
  countryId: string;
  fullName: string;
  title: string;
  ideologyAlignment: Ideology;
  traits: string[];
  aggression: number; // 0-100
  caution: number; // 0-100
  ambition: number; // 0-100
  paranoia: number; // 0-100
  popularity: number; // 0-100
  health: number; // 0-100
  legitimacyBonus: number;
  diplomacyStyle: string;
  militaryPosturePreference: string;
  hiddenRedLines: string[];
  publicPersona: string;
  internalNotes?: string;
  memoryHooks: string[];
}

export interface WorldEvent {
  id: string;
  type: 'CRISIS' | 'DIPLOMATIC' | 'MILITARY' | 'ECONOMIC' | 'CYBER' | 'COVERT';
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'CLANDESTINE';
  status: 'emerging' | 'active' | 'resolved' | 'archived';
  visibility: 'PUBLIC' | 'PLAYER_ONLY' | 'CLASSIFIED';
  startTick: number;
  endTick: number | null;
  involvedCountryIds: string[];
  involvedLeaderIds: string[];
  originatingSystem: string;
  effects: any[];
  tags: string[];
  linkedOperationIds: string[];
  linkedIntelFactIds: string[];
  escalationPotential: number; // 0-100
  historicalLogEntries: string[];
}

export interface OperationState {
  id: string;
  type: string;
  subtype: string;
  sponsorCountryId: string;
  targetCountryIds: string[];
  status: 'PLANNING' | 'ACTIVE' | 'EXPOSED' | 'COMPLETED' | 'FAILED' | 'ABORTED';
  secrecyLevel: number;
  attributionRisk: number;
  startTick: number;
  projectedEndTick: number;
  requiredAssets: string[];
  allocatedBudget: number; // in $B
  expectedEffects: string[];
  actualEffects: string[];
  exposed: boolean;
  failureReason: string | null;
  linkedEventIds: string[];
  linkedIntelFactIds: string[];
  ownerSystem: string;
}

export interface IntelFact {
  id: string;
  subjectType: 'EVENT' | 'OPERATION' | 'COUNTRY' | 'LEADER' | 'OTHER';
  subjectId: string;
  title: string;
  summary: string;
  sourceType: 'SIGINT' | 'HUMINT' | 'IMINT' | 'OSINT' | 'DEFAULT';
  confidence: number; // 0-100
  discoveredTick: number;
  expiresTick: number | null;
  verified: boolean;
  disputed: boolean;
  visibilityScope: 'PUBLIC' | 'PLAYER' | 'CLASSIFIED';
  relatedCountryIds: string[];
  relatedEventIds: string[];
  relatedOperationIds: string[];
  tags: string[];
  metadata: Record<string, any>;
}

export interface TreatyState {
  id: string;
  name: string;
  type: 'ALLIANCE' | 'NON_AGGRESSION' | 'TRADE' | 'DENUCLEARIZATION' | 'CEASE_FIRE';
  signatoryCountryIds: string[];
  obligations: string[];
  enforcementStrength: number; // 0-100
  secrecyLevel: number; // 0-100
  startTick: number;
  expirationTick: number | null;
  complianceByCountry: Record<string, number>; // 0-100 compliance scores
  violationHistory: string[];
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'TERMINATED';
  blocEffects: Record<string, any>;
  tags: string[];
}

export interface CanonicalWorld {
  countriesById: Record<string, CountryState>;
  leadersById: Record<string, LeaderState>;
  eventsById: Record<string, WorldEvent>;
  operationsById: Record<string, OperationState>;
  intelFactsById: Record<string, IntelFact>;
  treatiesById: Record<string, TreatyState>;
  tick: number;
  selectedCountryId: string | null;
  selectedLeaderId: string | null;
  timeline: { tick: number; desc: string; category: string }[];
  derivedIndexes: {
    unstableCountries: string[];
    nuclearCountries: string[];
    sanctionedCountries: string[];
    highRiskFlashpoints: { countryId: string; score: number; hazardReason: string }[];
    globalAverageStability: number;
    globalTensionIndex: number; // 0-100
  };
  scenarioMeta: Record<string, any>;
  busEventQueue?: BusEvent[];
  busEventHistory?: BusEvent[];
}

// ─── PSYOP & INFLUENCE OPERATIONS CORE TYPES ─────────────────────────

export type NarrativeTheme =
  | 'REGIME_CORRUPTION'
  | 'FOREIGN_THREAT_INFLATION'
  | 'ECONOMIC_GRIEVANCE'
  | 'ETHNIC_NATIONALIST'
  | 'RELIGIOUS_PERSECUTION'
  | 'DEMOCRATIC_LEGITIMACY'
  | 'MILITARY_GLORIFICATION'
  | 'ENVIRONMENTAL_FEAR'
  | 'ANTI_PLAYER_REVERSAL'
  | 'PEACE_NARRATIVE'
  | 'ALLY_BETRAYAL';

export type NarrativePhase =
  | 'SEEDING'
  | 'AMPLIFICATION'
  | 'SATURATION'
  | 'CRYSTALLIZATION'
  | 'WEAPONIZATION'
  | 'DORMANT'
  | 'BURNED'
  | 'COMPLETE';

export type DistributionChannel =
  | 'SOCIAL_MEDIA_ORGANIC'
  | 'BOT_NETWORK'
  | 'STATE_MEDIA_CUTOUT'
  | 'INFLUENCER_LAUNDERING'
  | 'ACADEMIC_CITATION'
  | 'LEAKED_DOCUMENT'
  | 'ENCRYPTED_CHANNEL'
  | 'DIPLOMATIC_WHISPERING';

export type KomprómatType =
  | 'FINANCIAL_CORRUPTION'
  | 'SEXUAL_SCANDAL'
  | 'IDEOLOGICAL_BETRAYAL'
  | 'WAR_CRIMES'
  | 'HEALTH_INCAPACITY'
  | 'FAMILY_CRIMINALITY'
  | 'DEEPFAKE_VIDEO'
  | 'FABRICATED_INTERCEPT';

export type DiscoveryVector =
  | 'METADATA_TRACE'
  | 'LINGUISTIC_ANALYSIS'
  | 'SOURCE_FOLLOW_MONEY'
  | 'WHISTLEBLOWER'
  | 'COUNTER_INTEL'
  | 'PLATFORM_TAKEDOWN'
  | 'FORENSIC_VIDEO_ANALYSIS'
  | 'DIPLOMATIC_EXPOSE';

export interface NarrativeCampaign {
  id: string;
  codename: string;
  targetCountryId: string;
  theme: NarrativeTheme;
  phase: NarrativePhase;
  turnLaunched: number;
  turnPhaseChanged: number;

  coreMessage: string;
  supportingNarratives: string[];
  targetDemographic: string;
  emotionalRegister: 'FEAR' | 'ANGER' | 'PRIDE' | 'HOPE' | 'DISGUST' | 'GRIEF';

  activeChannels: DistributionChannel[];
  botNetworkIds: string[];
  cutoutIds: string[];
  totalFundingDeployed: number;

  narrativePenetration: number;
  beliefAdoption: number;
  organicSpreadMultiplier: number;
  viralMomentCount: number;
  counterNarrativeStrength: number;

  discoveryRisk: number;
  playerFingerprint: number;
  platformSuspicion: number;
  targetIntelAwareness: number;

  legitimacyDamage: number;
  socialCohesionDamage: number;
  targetDefconInfluence: number;
}

export interface BotNetwork {
  id: string;
  codename: string;
  ownerCountryId: string;
  targetCountryId: string;
  size: number;
  sophisticationLevel: number;
  activityLevel: number;
  detectability: number;
  platformDistribution: Record<string, number>;
  assignedCampaignId: string | null;
  isActive: boolean;
  isBurned: boolean;
  burnedTick: number | null;
  accountsRemaining: number;
  operativeHandlerId: string | null;

  metadataConsistency: number;
  behavioralConsistency: number;
  linguisticAuthenticity: number;
}

export interface MediaCutout {
  id: string;
  outletName: string;
  registrationCountry: string;
  appearsAs: 'NEWS_OUTLET' | 'THINK_TANK' | 'ACADEMIC_JOURNAL' | 'BLOG_NETWORK' | 'NGO';
  credibilityScore: number;
  reachScore: number;
  playerFingerprint: number;
  registrationCoverStrength: number;
  assignedCampaignIds: string[];
  isExposed: boolean;
  exposedTick: number | null;
  totalArticlesPublished: number;
  citedByMainstreamMedia: boolean;
  citedByMainstreamSinceTick: number | null;
}

export interface KomprómatOperation {
  id: string;
  codename: string;
  targetLeaderId: string;
  targetCountryId: string;
  komprómatType: KomprómatType;
  phase: 'PRODUCTION' | 'VALIDATION' | 'PLACEMENT' | 'DETONATION' | 'AFTERMATH' | 'DEFUSED' | 'BLOWN';
  turnInitiated: number;

  isFabricated: boolean;
  fabricationQuality: number;
  evidenceStrength: number;
  targetVulnerabilityScore: number;

  placementChannels: DistributionChannel[];
  primaryOutletId: string | null;
  embeddedJournalistId: string | null;

  productionDiscoveryRisk: number;
  validationDiscoveryRisk: number;
  placementDiscoveryRisk: number;
  detonationDiscoveryRisk: number;

  projectedLegitimacyDamage: number;
  projectedApprovalDrop: number;
  internationalCondemnationRisk: number;
  iccReferralRisk: boolean;

  forensicTraceLevel: number;
  debunkProbability: number;
  isDebunked: boolean;
  debunkedTick: number | null;
  debunkedBy: string | null;
}

export interface PublicOpinionPoll {
  id: string;
  countryId: string;
  tick: number;
  leaderApprovalRating: number;
  leaderApprovalTrend: number;
  governmentTrustScore: number;
  foreignPolicyApproval: number;
  warSupportIndex: number;
  economicOptimism: number;
  nationalPrideScore: number;
  activeNarrativeBeliefScores: Record<string, number>;
  socialCohesionIndex: number;
  polarizationIndex: number;
  protestLikelihood: number;
  coupLikelihood: number;
  pollConfidence: number;
  isManipulatedPoll: boolean;
}

export interface PSYOPState {
  narrativeCampaigns: Record<string, NarrativeCampaign>;
  botNetworks: Record<string, BotNetwork>;
  mediaCutouts: Record<string, MediaCutout>;
  komprómatOps: Record<string, KomprómatOperation>;

  publicOpinionData: Record<string, PublicOpinionPoll>;
  pollHistory: Record<string, PublicOpinionPoll[]>;

  globalDisinfoIndex: number;
  playerInfoWarReputation: number;
  counterNarrativeResistance: Record<string, number>;

  activeDiscoveryInvestigations: {
    investigationId: string;
    targetOpId: string;
    opType: 'NARRATIVE' | 'BOT_NETWORK' | 'CUTOUT' | 'KOMPROMAT';
    progressPercent: number;
    investigatingEntity: string;
    ticksUntilResolution: number;
  }[];

  completedCampaigns: {
    campaignId: string;
    targetCountryId: string;
    outcome: 'SUCCESS' | 'PARTIAL' | 'FAILURE' | 'BLOWN';
    tick: number;
    finalBeliefAdoption: number;
    wasExposed: boolean;
  }[];
}

// ─── OVERSIGHT & SCANDAL CORE TYPES ─────────────────────────────────

export type ScandalOrigin =
  | 'COVERT_OP_EXPOSED'        // Module 5.2 coup/op attribution
  | 'PSYOP_ATTRIBUTED'         // Module 5.3 disinfo sourced to player
  | 'FINANCIAL_TRACE_LEAKED'   // Module 5.4 shell company / hawala
  | 'OPERATIVE_TURNED'         // burnt operative cooperating
  | 'SIGNALS_INTERCEPT_LEAKED' // Arachne collection revealed
  | 'COLLATERAL_DAMAGE'        // civilian harm in covert action
  | 'ALLY_BETRAYAL_REVEALED'   // ally discovers they were manipulated
  | 'WHISTLEBLOWER_INTERNAL'   // insider from intelligence community
  | 'JOURNALISTIC_INVESTIGATION'// OSINT / investigative journalism
  | 'FOREIGN_INTELLIGENCE_DROP';// rival state releases documents

export type ScandalTier =
  | 'TIER_1_RUMOR'     // unverified, deniable, low political cost
  | 'TIER_2_ALLEGATION'// sourced reporting, moderate cost
  | 'TIER_3_EVIDENCE'  // documented, high cost, triggers hearings
  | 'TIER_4_PROVEN'    // incontrovertible, maximum damage
  | 'TIER_5_HISTORIC'; // enters political history, permanent legacy hit

export type LeakSourceType =
  | 'ANONYMOUS_OFFICIAL'   // "sources familiar with the matter"
  | 'DOCUMENTS_OBTAINED'   // physical or digital documents
  | 'WHISTLEBLOWER_NAMED'  // named, on-record source
  | 'FOREIGN_GOVERNMENT'   // another state officially releasing info
  | 'INTERCEPT_PUBLISHED'  // leaked SIGINT / COMINT
  | 'OPERATIVE_CONFESSION' // intelligence operative speaks publicly
  | 'FINANCIAL_RECORDS';   // banking / corporate documents

export type MediaOutletAlignment =
  | 'DOMESTIC_FRIENDLY'    // politically aligned, suppresses damage
  | 'DOMESTIC_HOSTILE'     // opposition-aligned, amplifies damage
  | 'DOMESTIC_NEUTRAL'     // independent, reports factually
  | 'FOREIGN_WESTERN'      // allied nation press
  | 'FOREIGN_ADVERSARIAL'  // rival state press, weaponizes scandal
  | 'INTERNATIONAL_WIRE';  // global wire service (AP, Reuters)

export type HearingType =
  | 'CLOSED_INTELLIGENCE'  // classified, limited political damage
  | 'OPEN_SENATE'          // televised, high public impact
  | 'SPECIAL_COUNSEL'      // independent prosecutor, most dangerous
  | 'INTERNATIONAL_TRIBUNAL'// ICJ / UN body, diplomatic damage
  | 'JOINT_CONGRESSIONAL'; // bicameral, signals bipartisan opposition

export type ScandalResolutionPath =
  | 'SUCCESSFUL_SUPPRESSION'  // scandal contained, minimal damage
  | 'MANAGED_DISCLOSURE'      // player controls the narrative
  | 'SCAPEGOAT_SACRIFICE'     // operative or official takes the fall
  | 'FOREIGN_REDIRECT'        // blame shifted to another country
  | 'LEGAL_OBSTRUCTION'       // investigations blocked via legal means
  | 'POLITICAL_COLLAPSE'      // player loses political control
  | 'RESIGNATION_FORCED'      // key cabinet members resign
  | 'INDICTMENT'              // legal charges against player's agents
  | 'UNRESOLVED';             // scandal remains open, ongoing drain

export type PoliticalCapitalPool =
  | 'DOMESTIC_EXECUTIVE'   // president / prime minister authority
  | 'LEGISLATIVE'          // congress / parliament cooperation
  | 'INTELLIGENCE_COMMUNITY'// IC trust — critical for ops authorization
  | 'MILITARY_COMMAND'     // joint chiefs / defense authority
  | 'ALLIED_DIPLOMATIC'    // allied nations' trust in the player state
  | 'PUBLIC_LEGITIMACY';   // popular approval driving all other pools

export interface LeakEvent {
  id: string;
  sourceOpId: string;              // which op from 5.2/5.3/5.4 leaked
  scandalOrigin: ScandalOrigin;
  leakSourceType: LeakSourceType;
  leakerIdentity: string | null;   // null if anonymous
  leakerIsOperative: boolean;
  leakerOperativeId: string | null;
  outletPublishingId: string;      // MediaOutlet id
  tickLeaked: number;
  classifiedDocumentsExposed: boolean;
  documentClassificationLevel:
    | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET' | 'TS_SCI' | null;
  initialDamageScore: number;      // 0-100
  isActive: boolean;
  suppressionAttempted: boolean;
  suppressionSucceeded: boolean | null;
}

export interface Scandal {
  id: string;
  codename: string;               // "OPERATION MIDNIGHT" format
  origin: ScandalOrigin;
  tier: ScandalTier;
  sourceOpIds: string[];          // all ops that fed into this scandal
  triggeringLeakId: string;
  tickBorn: number;
  tickResolved: number | null;
  isActive: boolean;

  // Narrative
  headlineText: string;           // procedurally generated
  outletAlignment: MediaOutletAlignment;
  publicNarrativeSummary: string; // 2-sentence summary for UI

  // Damage tracking
  politicalCapitalDamagePerTick: Record<PoliticalCapitalPool, number>;
  totalPoliticalCapitalDrained: number;
  publicAwarenessPercent: number; // 0-100: how much the public knows
  internationalAwarenessPercent: number;
  evidenceStrength: number;       // 0-100: how much documented proof exists

  // Escalation
  hasTriggeredHearing: boolean;
  hearingId: string | null;
  hasTriggeredInternationalBlowback: boolean;
  blowbackCountryIds: string[];
  cascadedToAllies: boolean;
  alliesWhoCondemned: string[];   // country ids

  // Resolution
  resolutionPath: ScandalResolutionPath | null;
  sacrificedOperativeIds: string[];
  sacrificedCabinetPositions: string[];

  // Suppression state
  activeSuppression: {
    method: 'LEGAL' | 'MEDIA_COUNTER' | 'PSYOP_NARRATIVE' | 'FOREIGN_DISTRACTION';
    ticksRemaining: number;
    successProbability: number;
  } | null;
}

export interface MediaOutlet {
  id: string;
  name: string;                   // "The New York Tribune" format
  alignment: MediaOutletAlignment;
  investigativeCapacity: number;  // 0-100: how deeply they dig
  reachScore: number;             // 0-100: audience size
  credibilityScore: number;       // 0-100: public trust
  isCurrentlyInvestigating: boolean;
  activeInvestigationScandalId: string | null;
  bribeAttempted: boolean;
  bribeSucceeded: boolean | null;
  injunctionFiled: boolean;
  injunctionSucceeded: boolean | null;
  ticksUntilPublication: number | null;
  countryId: string;              // where this outlet is based
}

export interface CongressionalHearing {
  id: string;
  scandalId: string;
  hearingType: HearingType;
  tickScheduled: number;
  tickConcluded: number | null;
  isActive: boolean;
  isPublic: boolean;

  // Witness system
  scheduledWitnesses: HearingWitness[];
  completedTestimonies: HearingTestimony[];

  // Outcome
  findingsText: string | null;    // procedurally generated outcome
  politicalCapitalPenalty: number;
  operativesNamed: string[];
  operationsRevealed: string[];
  referredToSpecialCounsel: boolean;
  referredToInternationalTribunal: boolean;

  // Committee composition
  committeeAlignment:
    | 'FRIENDLY_MAJORITY'  // player's party controls committee
    | 'HOSTILE_MAJORITY'   // opposition controls
    | 'SPLIT';             // divided committee
  chairpersonHotility: number; // 0-100
}

export interface HearingWitness {
  witnessId: string;
  name: string;
  role: string;               // "Former Deputy Director, CIA"
  isOperative: boolean;
  operativeId: string | null;
  cooperationLevel: number;   // 0-100: 0=stonewalls, 100=full disclosure
  hasImmunityDeal: boolean;
  expectedDamageScore: number;// 0-100 if they testify fully
  subpoenaed: boolean;
  subpoenaResisted: boolean;
}

export interface HearingTestimony {
  witnessId: string;
  tickTestified: number;
  revealedOpIds: string[];
  revealedCountryIds: string[];
  revealedOperativeNames: string[];
  damageScore: number;          // actual damage delivered
  quotableStatement: string;    // procedurally generated headline quote
  wentPublic: boolean;
}

export interface WhistleblowerEvent {
  id: string;
  scandalId: string;
  operativeId: string | null;   // if internal IC whistleblower
  isAnonymous: boolean;
  leakMethod:
    | 'SECURE_DROP'
    | 'JOURNALIST_MEETING'
    | 'CONGRESSIONAL_TESTIMONY'
    | 'FOREIGN_ASYLUM'
    | 'DEAD_MAN_SWITCH';
  documentsProvided: boolean;
  documentCount: number;
  tickActivated: number;
  publicAwarenessImpact: number; // +0-40 to scandal.publicAwarenessPercent
  evidenceStrengthImpact: number;// +0-50 to scandal.evidenceStrength
  playerResponse:
    | 'IGNORED'
    | 'DISCREDITED'
    | 'EXTRACTED'
    | 'NEUTRALIZED'    // operative quietly removed
    | 'PROSECUTED'     // legal charges — can backfire
    | null;
  responseTicksRemaining: number | null;
}

export interface InternationalBlowbackEvent {
  id: string;
  scandalId: string;
  triggeringCountryId: string;
  blowbackType:
    | 'FORMAL_CONDEMNATION'       // diplomatic note
    | 'AMBASSADOR_RECALLED'       // escalation
    | 'SANCTIONS_THREATENED'      // economic pressure
    | 'SANCTIONS_IMPOSED'         // economic damage
    | 'INTELLIGENCE_SHARING_CUT'  // operational damage
    | 'MILITARY_BASING_WITHDRAWN' // strategic damage
    | 'UN_RESOLUTION_FILED'       // international legal proceeding
    | 'ALLIANCE_SUSPENDED';       // catastrophic
  severityScore: number;          // 0-100
  tickTriggered: number;
  isResolved: boolean;
  resolutionMethod: string | null;
  alliedCapitalPenalty: number;   // drain on ALLIED_DIPLOMATIC pool
}

export interface PoliticalCapitalState {
  pools: Record<PoliticalCapitalPool, number>; // all 0-100
  poolMaxima: Record<PoliticalCapitalPool, number>; // can be reduced by scandals
  poolRegenerationRates: Record<PoliticalCapitalPool, number>; // per tick
  totalPoliticalCapital: number;  // weighted average of all pools
  isInCrisisMode: boolean;        // true if any pool < 20
  isInCollapseMode: boolean;      // true if PUBLIC_LEGITIMACY < 10
  totalDrainedAllTime: number;
}

export interface OversightState {
  // Core political capital
  politicalCapital: PoliticalCapitalState;

  // Active scandals
  activeScandals: Record<string, Scandal>;
  resolvedScandals: Scandal[];    // historical record
  scandalHistory: {               // summary for legacy/debrief
    totalScandals: number;
    mostDamagingId: string | null;
    totalCapitalDrained: number;
  };

  // Leak system
  pendingLeaks: LeakEvent[];      // queued, not yet public
  publishedLeaks: LeakEvent[];    // in the public record

  // Media ecosystem
  mediaOutlets: Record<string, MediaOutlet>;
  activeInvestigations: {
    outletId: string;
    scandalId: string;
    progressPercent: number;
    ticksUntilBreaking: number;
  }[];

  // Oversight institutions
  activeHearings: Record<string, CongressionalHearing>;
  completedHearings: CongressionalHearing[];
  activeWhistleblowers: WhistleblowerEvent[];
  internationalBlowback: InternationalBlowbackEvent[];

  // Special counsel
  specialCounselActive: boolean;
  specialCounselTicksRemaining: number | null;
  specialCounselScandalIds: string[];
  specialCounselFindingsPublished: boolean;

  // Suppression budget
  suppressionBudgetRemaining: number; // $B available for damage control
}

// ─── MODULE 6.1: ECHO GRID (SIGINT COLLECTION PLATFORM) ─────────────────────────

export type SigintCollectionDomain =
  | 'DIPLOMATIC'
  | 'TELECOM'
  | 'MILITARY'
  | 'CYBER'
  | 'COMMERCIAL'
  | 'IMAGERY'
  | 'OPEN_SOURCE';

export type SignalVisibilityTier =
  | 'HIDDEN'     // Target is not meaningfully visible
  | 'INFERRED'   // Weak pattern exists, not enough to act
  | 'CONFIRMED'; // Sufficient corroboration for action

export type CollectionBudgetChannel = SigintCollectionDomain;

export type PatternOfLifeState =
  | 'ESTABLISHING' // Not enough history
  | 'STABLE'      // Consistent cadence
  | 'ANOMALOUS'   // Deviating from baseline
  | 'SPOOFED';    // Potentially false cadence generated by deception

export type CadenceAnomalyType =
  | 'COMMS_BURST'
  | 'SILENCE_GAP'
  | 'MOVEMENT_SPIKE'
  | 'IMAGERY_CADENCE_BREAK'
  | 'NIGHTTIME_ACTIVITY'
  | 'UNEXPECTED_COLOCATION'
  | 'PROCUREMENT_SPIKE'
  | 'ROUTE_DEVIATION'
  | 'SPOOFED_NORMALCY';

export interface CollectionAsset {
  id: string;
  name: string;
  domain: SigintCollectionDomain;
  countryId: string | null; // Null for global assets like satellites
  status: 'ACTIVE' | 'COMPROMISED' | 'OFFLINE' | 'MAINTENANCE';
  baseYield: number;
  stealthAttr: number;
  costPerTick: number;
}

export interface SigintTarget {
  id: string; // Target country, entity, or leader ID
  targetType: 'COUNTRY' | 'FACTION' | 'LEADER' | 'FACILITY' | 'NETWORK';
  name: string;
  visibilityTier: SignalVisibilityTier;
  analystConfidence: number; // 0-100
  deceptionResistance: number;
  corroborationCount: number;
  linkedEntities: string[];
  lastObservedTick: number;
  isActionable: boolean;
  discoveredThrough: SigintCollectionDomain[];
}

export interface SigintObservation {
  id: string;
  targetId: string;
  domain: SigintCollectionDomain;
  timestampTick: number;
  confidenceScore: number; // 0-100
  rawSignalData: string;
  isDeceptive: boolean;
  corroboratedBy: string[]; // Observation IDs
}

export interface PatternOfLifeProfile {
  targetId: string;
  state: PatternOfLifeState;
  baselineCadenceWindow: [number, number]; // Expected ticks between activity
  confidenceInBaseline: number; // 0-100
  anomalySensitivity: number; // 0-100
  timeSinceLastNormalSignal: number;
  lastAnomalyTick: number | null;
  falsePositiveProbability: number;
  cadenceHistory: number[]; // Tick deltas
}

export interface IntelligenceFusionRecord {
  id: string;
  targetId: string;
  contributingObservationIds: string[];
  fusedTick: number;
  conclusionSummary: string;
  exportedToModules: string[];
}

export interface DeceptionCountermeasure {
  id: string;
  targetId: string;
  method: 
    | 'COMMS_DISCIPLINE'
    | 'SCHEDULE_SPOOFING'
    | 'DECOY_TRAFFIC'
    | 'ROUTE_MASKING'
    | 'BROADCAST_SILENCE'
    | 'IMAGERY_CAMOUFLAGE'
    | 'FALSE_COLOCATION'
    | 'PROCUREMENT_NOISE'
    | 'METADATA_WASHING';
  intensity: number; // 0-100
  activeTicksRemaining: number;
}

export interface CollectionCampaign {
  id: string;
  targetId: string;
  channels: SigintCollectionDomain[];
  allocatedBudget: number;
  startTick: number;
  expectedDuration: number | null;
  status: 'ACTIVE' | 'PAUSED' | 'CONCLUDED';
}

export interface CollectionAlert {
  id: string;
  targetId: string;
  anomalyType: CadenceAnomalyType;
  tickTriggered: number;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isAcknowledged: boolean;
}

// ────────────────────────────────────────────────────────────────────────────────
// COVERT FINANCE STATE TYPES
// ────────────────────────────────────────────────────────────────────────────────

export type ShellCompanyJurisdiction =
  | 'CAYMAN_ISLANDS' | 'BRITISH_VIRGIN_ISLANDS' | 'DELAWARE_USA' | 'PANAMA' | 'LUXEMBOURG' | 'CYPRUS' | 'SEYCHELLES' | 'LIECHTENSTEIN' | 'HONG_KONG' | 'UAE_FREEZONE' | 'SINGAPORE' | 'ANONYMOUS_JURISDICTION';

export type ShellCompanyPurpose = string;

export interface ShellCompany {
  id: string;
  codename: string;
  jurisdiction: ShellCompanyJurisdiction;
  purpose: ShellCompanyPurpose;
  turnEstablished: number;
  layerDepth: number;
  parentCompanyId: string | null;
  childCompanyIds: string[];
  currentBalance: number;
  totalTransacted: number;
  activeOperationIds: string[];
  directorNames: string[];
  registeredAgentId: string | null;
  secrecyScore: number;
  traceAccumulation: number;
  isCompromised: boolean;
  compromisedTick: number | null;
  compromisedBy: string | null;
  kycStatus: 'CLEAN' | 'FROZEN';
  annualMaintenance: number;
}

export interface ShellChain {
  chainId: string;
  companyIds: string[];
  effectiveSecrecy: number;
  totalTraceAccumulation: number;
}

export type HawalaNodeType =
  | 'MONEY_CHANGER' | 'TRADE_INVOICE_FRAUD' | 'CRYPTOCURRENCY_MIXER' | 'DIPLOMATIC_POUCH' | 'COMMODITY_SWAP' | 'REAL_ESTATE_CYCLE';

export interface HawalaNode {
  id: string;
  nodeType: HawalaNodeType;
  locationCountryId: string;
  operatorName: string;
  trustScore: number;
  capacityPerTick: number;
  detectionRisk: number;
  traceResistance: number;
  operativeHandlerId: string | null;
  isActive: boolean;
  isCompromised: boolean;
  transactionCount: number;
  totalVolumeTransacted: number;
  preferredContrabandTypes: string[];
}

export interface HawalaTransfer {
  transferId: string;
  amount: number;
  fromNodeId: string;
  toNodeId: string;
  purposeOpId: string;
  tickInitiated: number;
  ticksToComplete: number;
  traceRisk: number;
}

export type SmuggleRouteType =
  | 'MARITIME_DARK' | 'AIR_CHARTER_PRIVATE' | 'DIPLOMATIC_FREIGHT' | 'COMMERCIAL_CONCEALMENT' | 'DEEP_SEA_TRANSFER' | 'OVERLAND_TRIBAL';

export type ContrabandCategory = string;

export interface Cargo {
  id: string;
  routeId: string;
  contrabandCategory: ContrabandCategory;
  quantity: number;
  quantityUnit: string;
  declaredValue: number;
  actualValue: number;
  destinationPurpose: string;
  ticksInTransit: number;
  totalTransitTicks: number;
  interceptRisk: number;
  isIntercepted: boolean;
  interceptedTick: number | null;
  interceptedBy: string | null;
}

export interface SmuggleRoute {
  id: string;
  codename: string;
  routeType: SmuggleRouteType;
  originCountryId: string;
  destinationCountryId: string;
  transitCountryIds: string[];
  establishedTick: number;
  isActive: boolean;
  capacityPerRun: number;
  costPerRun: number;
  detectionRiskPerRun: number;
  traceAccumulation: number;
  successfulRunCount: number;
  failedRunCount: number;
  lastRunTick: number | null;
  operativeNetworkIds: string[];
  supportedCategories: ContrabandCategory[];
  customsRiskModifier: number;
  activeCargo: Cargo | null;
}

export interface BlackMarketProcurementOrder {
  id: string;
  requestingOpId: string;
  contrabandCategory: ContrabandCategory;
  quantity: number;
  sourceBrokerCountryId: string;
  paymentRoutedThrough: string[];
  deliveryRouteId: string;
  status: 'PENDING' | 'FUNDED' | 'DELIVERED' | 'FAILED';
  totalCost: number;
  fundingTraceScore: number;
  turnOrdered: number;
  turnDelivered: number | null;
  isAttributedToPlayer: boolean;
}

export type TraceVector =
  | 'BANKING_CORRESPONDENT' | 'FATF_MONITORING' | 'ICIJ_INVESTIGATION' | 'RIVAL_INTELLIGENCE' | 'WHISTLEBLOWER_INTERNAL' | 'CUSTOMS_INTERCEPT' | 'SIGNALS_INTERCEPT' | 'BENEFICIAL_OWNERSHIP' | 'BLOCKCHAIN_ANALYTICS' | 'JOURNALISTIC_OSINT';

export interface FundingTrace {
  id: string;
  traceVector: TraceVector;
  targetEntityId: string;
  targetEntityType: 'SHELL_COMPANY' | 'HAWALA_NODE' | 'SMUGGLE_ROUTE' | 'PROCUREMENT_ORDER';
  discoveredByEntity: string;
  traceStrength: number;
  tickDiscovered: number;
  isPublic: boolean;
  madePublicTick: number | null;
  linkedToPlayerCountry: boolean;
  linkedTick: number | null;
  relatedOpIds: string[];
  investigationProgressPercent: number;
  investigatingEntitySophistication: number;
}

export interface CovertFinanceState {
  shellCompanies: Record<string, ShellCompany>;
  shellChains: ShellChain[];
  hawalaNodes: Record<string, HawalaNode>;
  activeHawalaTransfers: HawalaTransfer[];
  smuggleRoutes: Record<string, SmuggleRoute>;
  activeProcurementOrders: Record<string, BlackMarketProcurementOrder>;
  fundingTraces: FundingTrace[];
  globalTraceLevel: number;
  fatfWatchlistStatus: 'CLEAN' | 'MONITORED' | 'GREYLISTED' | 'BLACKLISTED';
  activeFinancialSanctionRisk: boolean;
  playerFinancialFootprint: number;
  covertOperationalReserves: number;
  reserveGenerationPerTick: number;
  pendingFundingRequests: { requestingOpId: string; amount: number; description: string }[];
}

export type HistoricalEvents = any[];

// ────────────────────────────────────────────────────────────────────────────────
// TARGETED OPERATIONS TYPES — MODULE 6.2
// ────────────────────────────────────────────────────────────────────────────────

export interface TargetDossier {
  targetId: string;
  targetType: 'COUNTRY' | 'FACTION' | 'LEADER' | 'FACILITY' | 'NETWORK';
  name: string;
  affiliationCountryId: string;
  locationHistory: string[];
  patternOfLifeSummary: string;
  visibilityTier: SignalVisibilityTier;
  confidenceScore: number; // 0-100
  protectionLevel: number;  // 0-100
  operationalValue: number; // 0-100
  attributionRisk: number;  // 0-100
  exposureRisk: number;     // 0-100
  estimatedCollateralRisk: number; // 0-100
  recommendedMethods: string[];
  knownDeceptionMethods: string[];
  linkedIntelligenceSources: string[];
  lastObservedTick: number;
  dossierFreshness: number; // 0-100
  analystNotes: string;
  isActionable: boolean;
  markedStaleTick: number | null;
}

export interface MethodTradeoffs {
  methodId: string;
  name: string;
  speed: number;             // 0-100
  stealth: number;           // 0-100
  attributionRisk: number;   // 0-100
  collateralRisk: number;    // 0-100
  diplomaticBlowback: number;// 0-100
  resourceCost: number;      // B-dollar equivalent or points cost
  reversibility: number;     // 0-100 (high = highly reversible)
  intelligenceGain: number;  // 0-100
  likelihoodOfSuccess: number; // 0-100
  suitabilityScore: number;  // overall calculated fit
  blockerPenalties: string[]; // reasons for penalty
}

export type AttributionPhase = 'UNKNOWN' | 'SUSPECTED' | 'PROBABLE' | 'HIGH_CONFIDENCE' | 'CONFIRMED';

export interface EvidencePiece {
  id: string;
  sourceType: 'SIGINT' | 'FININT' | 'HUMINT' | 'OSINT' | 'FORENSICS';
  description: string;
  credibilityScore: number;  // 0-100
  weight: number;            // 0-100
  tickAdded: number;
  associatedArtifacts: string[];
}

export interface AttributionCase {
  caseId: string;
  targetId: string;
  operationId: string;
  operationType: string;
  phase: AttributionPhase;
  confidence: number; // 0-100
  evidencePieces: EvidencePiece[];
  contradictoryEvidence: EvidencePiece[];
  possibleSponsors: { countryId: string; probability: number }[];
  falsePositiveProbability: number;
  confidenceDecayRate: number;
  chronologicalJournal: string[];
  lastUpdatedTick: number;
  isResolved: boolean;
  attributedSponsor: string | null; // e.g. player country, or direct country id
}

export interface ConsequenceStep {
  stepId: string;
  chainId: string;
  delayTicks: number;
  resolveTick: number;
  label: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: number;
  triggerCondition: string;
  affectedSystems: string[];
  reversibility: boolean;
  isResolved: boolean;
  isHappening: boolean;
  isPlayerVisible: boolean;
  followUpStepIds: string[];
}

export interface ConsequenceChain {
  chainId: string;
  operationId: string;
  targetId: string;
  methodId: string;
  initiatedTick: number;
  steps: ConsequenceStep[];
  isExpired: boolean;
  totalDamageScore: number;
  worldLogGenerated: boolean;
}

// ────────────────────────────────────────────────────────────────────────────────
// HUMINT & COUNTERINTELLIGENCE TYPES — MODULE 6.3
// ────────────────────────────────────────────────────────────────────────────────

export type SourceLifecyclePhase =
  | 'SPOTTED'
  | 'ASSESSED'
  | 'DEVELOPING'
  | 'RECRUITED'
  | 'HANDLED'
  | 'TASKED'
  | 'EXFILTRATED'
  | 'BURNED'
  | 'TURNED'
  | 'TERMINATED';

export type SourceType =
  | 'MOLE'
  | 'DOUBLE_AGENT'
  | 'DEFECTOR'
  | 'WALK_IN'
  | 'REDOUBLED_AGENT'
  | 'CUTOUT_ASSISTED'
  | 'NON_OFFICIAL_COVER'
  | 'RELUCTANT_INSIDER'
  | 'COERCED_SOURCE';

export type MotivationVector = {
  money: number;
  ideology: number;
  coercion: number;
  ego: number;
  grievance: number;
  survival: number;
  status: number;
  curiosity: number;
  revenge: number;
  affiliation: number;
};

export type SourcePsychologyProfile = {
  primaryMotivation: keyof MotivationVector | 'mixed';
  motivationWeights: MotivationVector;
  stressTolerance: number;
  loyaltyFragility: number;
  deceptionSkill: number;
  vanity: number;
  resentment: number;
  paranoia: number;
  attachmentToHandler: number;
  fearOfExposure: number;
  riskSeeking: number;
  moralFlexibility: number;
  needForRecognition: number;
  needForMoney: number;
  ideologicalCommitment: number;
  coercionPressure: number;
  familyExposureRisk: number;
  burnoutRisk: number;
  defectionLikelihood: number;
};

export type HandlerPsychologyProfile = {
  trustPropensity: number;
  suspicionBias: number;
  patience: number;
  aggression: number;
  controlNeed: number;
  empathy: number;
  compartmentationDiscipline: number;
  operationalHubris: number;
  emotionalAttachment: number;
  riskAversion: number;
  sourceFetishization: number;
  moralCompromise: number;
  improvisationSkill: number;
  burnoutRisk: number;
  deceptionSensitivity: number;
  betrayalTolerance: number;
};

export type SourceIdentity = {
  sourceId: string;
  coverName: string;
  trueIdentity?: string;
  hostileService: string;
  hostileCountry: string;
  accessLevel: string;
  sourceType: SourceType;
  currentPhase: SourceLifecyclePhase;
};

export type SourceOperationalState = {
  loyaltyScore: number;
  handlerTrustScore: number;
  compromiseRisk: number;
  survivabilityScore: number;
  intelYieldScore: number;
  operationalValue: number;
  retroactiveDiscoveryRisk: number;
  burnProbability: number;
  extractionReadiness: number;
  compartmentationLevel: number;
  tradecraftRisk: number;
  deceptionRisk: number;
  accessWindowRemaining: number;
  taskLoad: number;
  lastContactTick: number;
  lastTaskTick: number;
  lastRiskUpdateTick: number;
};

export type SourceCase = {
  identity: SourceIdentity;
  psychology: SourcePsychologyProfile;
  handlerPsychology: HandlerPsychologyProfile;
  state: SourceOperationalState;
  notes: string[];
  provenance: string[];
  linkedTargets: string[];
  linkedOperations: string[];
};

export type DiscoveryNodeType =
  | 'SOURCE'
  | 'HANDLER'
  | 'TARGET'
  | 'OPERATION'
  | 'COMMUNICATION_EVENT'
  | 'CONTACT_POINT'
  | 'COVER_IDENTITY'
  | 'LOGISTICAL_NODE';

export type DiscoveryNode = {
  nodeId: string;
  nodeType: DiscoveryNodeType;
  label: string;
  sourceId?: string;
  operationId?: string;
  targetId?: string;
  riskWeight: number;
  traceability: number;
  compartmentationPenalty: number;
  createdTick: number;
};

export type DiscoveryEdge = {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  relationshipType:
    | 'CONTACT'
    | 'TASKING'
    | 'HANDLING'
    | 'TRANSPORT'
    | 'PAYMENT'
    | 'COVER_LINK'
    | 'OPERATIONAL_DEPENDENCY'
    | 'COMMUNICATION'
    | 'SHARED_ACCESS'
    | 'HISTORICAL_OVERLAP';
  weight: number;
  traceabilityContribution: number;
  concealmentResistance: number;
  lastObservedTick: number;
};

export type DiscoveryGraph = {
  graphId: string;
  nodes: Record<string, DiscoveryNode>;
  edges: Record<string, DiscoveryEdge>;
  adjacency: Record<string, string[]>;
  rootExposureRisk: number;
  totalTraceability: number;
  cascadeDepth: number;
  lastUpdatedTick: number;
};

export type DoubleAgentState = {
  primaryLoyalty: number;
  hiddenLoyalty: number;
  adversaryExpectation: number;
  handlerExpectation: number;
  deceptionDepth: number;
  coverIntegrity: number;
  betrayalTolerance: number;
  resentmentLevel: number;
  coercionLevel: number;
  accessWindow: number;
  performancePressure: number;
  instabilityScore: number;
  collapseProbability: number;
  redoubledProbability: number;
  lastLoyaltyShiftTick: number;
};

export type DefectorCase = {
  defectorId: string;
  originService: string;
  originCountry: string;
  verificationStatus: 'UNVERIFIED' | 'PROVISIONAL' | 'VERIFIED' | 'QUARANTINED' | 'REJECTED';
  extractionWindowTicks: number;
  transitRisk: number;
  aliasReadiness: number;
  familyExposureRisk: number;
  resettlementPressure: number;
  retroactiveDiscoveryRisk: number;
  intelligenceBurstValue: number;
  currentSafetyStatus: 'IN_PLACE' | 'MOVING' | 'EXFILTRATED' | 'COMPROMISED' | 'SEALED';
  lastVerificationTick: number;
  lastMovementTick: number;
};

export type HandlerCase = {
  handlerId: string;
  alias: string;
  role: 'CASE_OFFICER' | 'CUTOUT' | 'CONTROLLER' | 'RECRUITER' | 'EXFILTRATION_LEAD';
  psychology: HandlerPsychologyProfile;
  sourceLoad: number;
  activeSources: string[];
  trustHistory: number[];
  paranoiaHistory: number[];
  compromiseConcern: number;
  operationalEmpathy: number;
  controlCompulsion: number;
  riskBias: number;
  attachmentRisk: number;
  fatigueLevel: number;
  deceptionTolerance: number;
  decisionStyle: 'CAUTIOUS' | 'AGGRESSIVE' | 'BALANCED' | 'PARANOID' | 'PRAGMATIC';
  lastInteractionTick: number;
};

// ────────────────────────────────────────────────────────────────────────────────
// DENIAL & DECEPTION TYPES — MODULE 6.4 (MIRROR SHROUD)
// ────────────────────────────────────────────────────────────────────────────────

export type DeceptionObjective =
  | 'HIDE'
  | 'MISLEAD'
  | 'DELAY'
  | 'REDIRECT'
  | 'FRAME'
  | 'SATURATE'
  | 'AMBIGUATE';

export type DeceptionDomain =
  | 'SIGINT'
  | 'HUMINT'
  | 'FININT'
  | 'CYBER'
  | 'IMAGERY'
  | 'OPEN_SOURCE'
  | 'LOGISTICS'
  | 'POLITICAL'
  | 'MILITARY'
  | 'TECHNICAL';

export type DeceptionSignatureFamily =
  | 'APT_STYLE'
  | 'STATE_ACTOR_STYLE'
  | 'CRIMINAL_STYLE'
  | 'INSIDER_STYLE'
  | 'THIRD_PARTY_STYLE'
  | 'NATURAL_NOISE'
  | 'PLATFORM_ARTIFACT'
  | 'LANGUAGE_STYLE'
  | 'TIMING_STYLE'
  | 'INFRASTRUCTURE_STYLE';

export type DeceptionBeliefState =
  | 'UNSEEN'
  | 'DISMISSED'
  | 'SUSPECTED'
  | 'BELIEVED'
  | 'OVERCONFIDENT'
  | 'CONTRADICTED'
  | 'REJECTED';

export type DeceptionConfidenceProfile = {
  plantedConfidence: number;
  adversaryConfidence: number;
  contradictionConfidence: number;
  analystConfidence: number;
  ambiguityScore: number;
  believabilityScore: number;
  signatureCoherence: number;
  exposureRisk: number;
  contaminationRisk: number;
  decayRate: number;
};

export type DeceptionObjectiveProfile = {
  objective: DeceptionObjective;
  targetBeliefDesired: string;
  targetBehaviorDesired: string;
  intendedEffect: string;
  successCriteria: string[];
  fallbackEffect: string;
};

export type DeceptionSignature = {
  signatureId: string;
  family: DeceptionSignatureFamily;
  label: string;
  observedTraits: string[];
  mimickedTTPs: string[];
  narrativeMarkers: string[];
  infrastructureMarkers: string[];
  timingMarkers: string[];
  confidenceWeight: number;
  authenticityRisk: number;
};

export type FalseIntelPacket = {
  packetId: string;
  deceptionId: string;
  sourceDomain: DeceptionDomain;
  plantedTick: number;
  expirationTick: number;
  payloadSummary: string;
  payloadDetails: string[];
  intendedRecipientProfile: string;
  intendedInterpretation: string;
  coverStory: string;
  visibleToPlayer: boolean;
  visibleToAdversary: boolean;
  contaminationRisk: number;
  exposureRisk: number;
};

export type DeceptionCampaign = {
  deceptionId: string;
  label: string;
  objectiveProfile: DeceptionObjectiveProfile;
  domain: DeceptionDomain;
  signature: DeceptionSignature;
  beliefState: DeceptionBeliefState;
  confidence: DeceptionConfidenceProfile;
  packets: FalseIntelPacket[];
  plantedEvidenceIds: string[];
  linkedOperations: string[];
  linkedTargets: string[];
  createdTick: number;
  lastUpdatedTick: number;
  active: boolean;
};

export type CounterDeceptionFinding = {
  findingId: string;
  deceptionId: string;
  severity: number;
  contradictionType:
    | 'TIMING_MISMATCH'
    | 'TTP_MISMATCH'
    | 'LANGUAGE_MISMATCH'
    | 'INFRA_MISMATCH'
    | 'NARRATIVE_MISMATCH'
    | 'BEHAVIORAL_OUTLIER'
    | 'SOURCE_CONTAMINATION'
    | 'OVEREXPLICIT_BREADCRUMB';
  description: string;
  evidenceRefs: string[];
  analystNote: string;
  createdTick: number;
};

export type AmbiguityControlMode =
  | 'SINGLE_NARRATIVE'
  | 'MULTIPLE_NARRATIVES'
  | 'CONTROLLED_NOISE'
  | 'SIGNATURE_BLENDING'
  | 'BELIEF_SATURATION'
  | 'SELECTIVE_CLARITY';

// ────────────────────────────────────────────────────────────────────────────────
// COUNTER-PROLIFERATION TYPES — MODULE 6.5 (IRON VEIL)
// ────────────────────────────────────────────────────────────────────────────────

export type ProliferationNodeType =
  | 'ORGANIZATION'
  | 'BROKER'
  | 'FRONT_COMPANY'
  | 'INDIVIDUAL'
  | 'VESSEL'
  | 'VEHICLE'
  | 'MATERIAL'
  | 'DOCUMENT'
  | 'PORT'
  | 'FACILITY'
  | 'LAB'
  | 'BANK'
  | 'CUSTOMS_POINT'
  | 'TRANSPORT_LINK'
  | 'COMMUNICATION_LINK';

export type ProliferationThreatLevel =
  | 'NONE'
  | 'LOW'
  | 'SUSPECTED'
  | 'PROBABLE'
  | 'VERIFIED'
  | 'CRITICAL';

export type VerificationTier =
  | 'UNVERIFIED'
  | 'WEAK'
  | 'CORROBORATED'
  | 'STRONG'
  | 'LEGAL_THRESHOLD_MET'
  | 'OPERATIONALLY_ACTIONABLE';

export type LegalBlowbackLevel =
  | 'NONE'
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'SEVERE'
  | 'INTERNATIONAL_CRISIS';

export type CounterProliferationAction =
  | 'MONITOR'
  | 'SANCTION'
  | 'INTERDICT'
  | 'SABOTAGE'
  | 'DISRUPT'
  | 'EXPOSE'
  | 'FRAGMENT_NETWORK'
  | 'DETAIN'
  | 'SEIZE'
  | 'DENY_ACCESS';

export type NetworkConfidenceProfile = {
  nodeConfidence: number;
  edgeConfidence: number;
  materialConfidence: number;
  attributionConfidence: number;
  verificationConfidence: number;
  legalConfidence: number;
  actionabilityConfidence: number;
  falsePositiveRisk: number;
  falseNegativeRisk: number;
  contaminationRisk: number;
};

export type ProliferationNode = {
  nodeId: string;
  label: string;
  nodeType: ProliferationNodeType;
  threatLevel: ProliferationThreatLevel;
  verificationTier: VerificationTier;
  confidence: number;
  materialRelevance: number;
  legalSensitivity: number;
  operationalSensitivity: number;
  exposureRisk: number;
  lastObservedTick: number;
  associatedCountries: string[];
  linkedNodes: string[];
  notes: string[];
};

export type ProliferationEdge = {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  relationshipType:
    | 'SUPPLY'
    | 'PAYMENT'
    | 'TRANSPORT'
    | 'COORDINATION'
    | 'COVER'
    | 'BROKERAGE'
    | 'OWNERSHIP'
    | 'SHARED_ENTITY'
    | 'COMMUNICATION'
    | 'TRANSHIPMENT';
  confidence: number;
  traceability: number;
  concealmentResistance: number;
  legalSensitivity: number;
  lastObservedTick: number;
};

export type ProliferationNetwork = {
  networkId: string;
  label: string;
  threatLevel: ProliferationThreatLevel;
  verificationTier: VerificationTier;
  confidence: NetworkConfidenceProfile;
  nodes: Record<string, ProliferationNode>;
  edges: Record<string, ProliferationEdge>;
  rootNodes: string[];
  activeAlerts: string[];
  legalBlowbackLevel: LegalBlowbackLevel;
  operationalReadiness: number;
  lastUpdatedTick: number;
};

export type InterdictionCase = {
  caseId: string;
  networkId: string;
  selectedAction: CounterProliferationAction;
  verificationThresholdMet: boolean;
  legalThresholdMet: boolean;
  confidenceRequired: number;
  confidenceCurrent: number;
  legalBlowbackLevel: LegalBlowbackLevel;
  projectedEffectiveness: number;
  collateralRisk: number;
  diplomaticRisk: number;
  operationalRisk: number;
  evidenceRefs: string[];
  lastEvaluatedTick: number;
  active: boolean;
};

// ── NUCLEAR WEAPON INVENTORY ──────────────────────────────────────────────────

export type NuclearTriadLeg = 'ICBM' | 'SLBM' | 'BOMBER';

export type NuclearWeaponStatus =
  | 'STORED'          // Warhead de-mated, in depot
  | 'MATED'           // Warhead mated to delivery vehicle
  | 'ON_ALERT'        // PAL unlocked, crew at station
  | 'AIRBORNE'        // Bomber aloft with weapon
  | 'LAUNCHED'        // In flight — irreversible
  | 'DETONATED'       // Impact confirmed
  | 'INTERCEPTED'     // Destroyed by ABM
  | 'FAILED'          // Malfunction
  | 'DESTROYED';      // Killed by first strike

export type NuclearWeaponClass =
  | 'ICBM_MINUTEMAN'    // ~300-475 kt, silo-based, 30-min flight time
  | 'ICBM_SARMAT'       // ~750 kt–10 Mt, Russian RS-28 Sarmat
  | 'ICBM_DF5'          // ~3 Mt, Chinese DF-5B
  | 'SLBM_TRIDENT'      // ~100-475 kt, US Trident II D5
  | 'SLBM_BULAVA'       // ~100-150 kt, Russian R-30 Bulava
  | 'SLBM_JL2'          // ~250-1000 kt, Chinese JL-2
  | 'BOMBER_B52'        // ~170 kt B61 gravity bomb or ALCM
  | 'BOMBER_B2'         // ~360 kt B83 or B61-12
  | 'BOMBER_TU95'       // ~200 kt Kh-55 ALCM
  | 'TACTICAL_W76'      // ~100 kt, submarine-launched tactical option
  | 'TACTICAL_B61_12'   // ~0.3-50 kt dial-a-yield, most modern NATO tactical
  | 'TACTICAL_ISKANDER' // ~10-50 kt, Russian theater nuclear
  | 'TACTICAL_DF26'     // ~200-1200 kt, Chinese anti-carrier
  | 'EMP_HIGH_ALTITUDE'; // ~1 Mt, detonated at 400km altitude, no blast kill

export interface NuclearWeapon {
  id: string;
  class: NuclearWeaponClass;
  leg: NuclearTriadLeg;
  countryId: string;
  status: NuclearWeaponStatus;
  yieldKt: number;
  canReach: string[];          // list of country IDs within range
  deploymentBase: string;      // base or submarine hull ID
  isOnAlert: boolean;
  palUnlocked: boolean;
  authenticationComplete: boolean;
  createdTick: number;
  launchedTick: number | null;
  targetCountryId: string | null;
  targetLat: number | null;
  targetLon: number | null;
  flightTimeMinutes: number;
  isRecallable: boolean;       // bombers yes, missiles no
  survivabilityScore: number;  // 0-100, reduced if known to adversary SIGINT
}

// ── TRIAD POSTURE ─────────────────────────────────────────────────────────────

export type TriadPostureLevel =
  | 'PEACETIME'         // Normal readiness, warheads de-mated or in depot
  | 'ELEVATED'          // Increased monitoring, crews on heightened standby
  | 'STRIP_ALERT'       // Bombers on strip alert, able to launch in minutes
  | 'SURGE'             // Submarines dispersed, ICBMs on alert, PALs ready
  | 'HAIR_TRIGGER'      // Maximum readiness, launch decision can be delegated
  | 'LAUNCH_AUTHORIZED'; // Authorization granted, awaiting execution order

export interface TriadPostureConfig {
  bomberPosture: TriadPostureLevel;
  icbmPosture: TriadPostureLevel;
  slbmPosture: TriadPostureLevel;
  escalationRisk: number;        // 0-100: higher = more accident probability
  accidentProbability: number;   // per-tick probability of unauthorized event
  survivabilityBonus: number;    // SLBM survivability boost from dispersal
  recallWindowMinutes: number;   // for bombers only — 0 once past recall point
}

// ── NC3 COMMUNICATIONS INTEGRITY ─────────────────────────────────────────────

export type NC3Channel =
  | 'NMCC_LANDLINE'       // National Military Command Center ground lines
  | 'STRATCOM_BROADCAST'  // US STRATCOM broadcast network
  | 'AEHF_SATELLITE'      // Advanced Extremely High Frequency satellite
  | 'VLF_SUBMARINE'       // Very Low Frequency for submarine communication
  | 'TACAMO_AIRCRAFT'     // Take Charge and Move Out — E-6B airborne relay
  | 'EMP_HARDENED_WIRE'   // Hardened ground-burst survivable links
  | 'DEAD_HAND_AUTO';     // Russian automated launch detection circuit

export interface NC3ChannelStatus {
  channel: NC3Channel;
  integrity: number;           // 0-100
  isActive: boolean;
  degradedByEW: boolean;       // electronic warfare interference
  degradedByCyber: boolean;
  degradedByNuclearEMP: boolean;
  lastSuccessfulTransmissionTick: number;
  reliabilityPct: number;      // probability any given EAM gets through
}

export interface NC3SystemState {
  overallIntegrity: number;    // 0-100: weighted average of all channels
  channels: Record<NC3Channel, NC3ChannelStatus>;
  eamQueueLength: number;      // number of Emergency Action Messages pending
  lastEAMDeliveredTick: number;
  communicationsRedundancyScore: number;
  isDecapitationRisk: boolean; // true if national command authority unreachable
}

// ── LAUNCH AUTHORITY ─────────────────────────────────────────────────────────

export type AuthorityStatus =
  | 'DORMANT'           // No nuclear crisis, no authority chain active
  | 'MONITORING'        // Watch posture, authority chain assembled
  | 'WARNING_RECEIVED'  // Detection event received, assessment underway
  | 'ASSESSMENT'        // Intelligence corroboration phase
  | 'CONSULTATION'      // Civilian + military consultation underway
  | 'PRE_DELEGATION'    // Authority delegated to field commanders
  | 'AUTHORIZED'        // Presidential authorization obtained
  | 'AUTHENTICATED'     // PAL codes validated, two-man rule met
  | 'EXECUTION_ORDER'   // EAM transmitted to forces
  | 'LAUNCHED'          // Weapons in flight
  | 'STAND_DOWN';       // False alarm or order rescinded

export interface LaunchAuthorityState {
  status: AuthorityStatus;
  initiatedByWarning: string | null;    // what triggered the sequence
  warningConfidence: number;            // 0-100: how certain the attack warning is
  assessmentTick: number | null;        // when assessment phase started
  assessmentComplete: boolean;
  consultationComplete: boolean;
  authorizationGranted: boolean;
  authorizationGrantedTick: number | null;
  authorizationCode: string | null;     // the Gold Codes — generated on authorization
  twoManRuleComplete: boolean;
  palUnlockComplete: boolean;
  selectedOption: NuclearLaunchOption | null;
  executionOrderSent: boolean;
  executionOrderTick: number | null;
  decisionDeadlineTick: number | null;  // for LUA: when missiles arrive
  timeRemainingToDecisionSeconds: number;
  preDelegationActive: boolean;
  preDelegationCountryIds: string[];    // field commanders who hold authority
}

// ── LAUNCH OPTIONS ────────────────────────────────────────────────────────────

export type NuclearLaunchOption =
  | 'ABSORB_AND_RESPOND'        // Ride out attack, launch from survivors
  | 'LAUNCH_UNDER_ATTACK'       // Launch before warheads arrive
  | 'LAUNCH_ON_WARNING'         // Launch on sensor warning, not confirmed impact
  | 'DEMONSTRATION_SHOT'        // Single detonation at sea / remote area
  | 'LIMITED_NUCLEAR_OPTION'    // Counterforce strike, military targets only
  | 'MAJOR_ATTACK_OPTION'       // Full counterforce exchange
  | 'COUNTERVALUE_STRIKE'       // Deliberately target civilian infrastructure
  | 'EMP_FIRST_STRIKE'          // High-altitude EMP to disable adversary NC3
  | 'WITHHOLD';                  // Explicit decision not to use

export interface NuclearLaunchOptionSpec {
  option: NuclearLaunchOption;
  label: string;
  description: string;
  weaponsRequired: number;
  estimatedCasualties: number;     // rough order of magnitude
  escalationProbability: number;   // 0-1: chance adversary retaliates
  tabooErosionDelta: number;       // how much it shifts global taboo state
  allianceCohesionDelta: number;
  politicalCapitalCost: number;
  isRecallable: boolean;
  requiresPresidentialConsent: boolean;
  requiresCongressionalConsult: boolean;
  minimumDefconLevel: number;      // can only execute at this DEFCON or lower
  legalStatusUnderIHL: 'CLEARLY_PROHIBITED' | 'CONTESTED' | 'ARGUABLY_LAWFUL';
}

// ── NUCLEAR TABOO ─────────────────────────────────────────────────────────────

export interface NuclearTabooState {
  globalTabooIntactness: number;     // 0-100: 100 = no use ever, 0 = normalized
  firstUseOccurred: boolean;
  firstUseTick: number | null;
  firstUseCountryId: string | null;
  useEvents: NuclearUseEvent[];
  adversaryWillingnessMultiplier: number;  // AI adversary nuclear use threshold modifier
  un_condemnationCount: number;
  allianceTabooErosion: Record<string, number>;  // per-country taboo erosion
}

export interface NuclearUseEvent {
  id: string;
  tick: number;
  initiatingCountryId: string;
  targetCountryId: string;
  option: NuclearLaunchOption;
  yieldKt: number;
  lat: number;
  lon: number;
  estimatedCasualties: number;
  tabooErosionDelta: number;
  wasRetaliatory: boolean;
  wasFirstUse: boolean;
}

// ── FALSE ALARM & MISCALCULATION ──────────────────────────────────────────────

export type FalseAlarmType =
  | 'SENSOR_MALFUNCTION'      // satellite or radar glitch
  | 'COMPUTER_ERROR'          // NORAD-style software bug
  | 'EXERCISE_CONFUSION'      // training exercise misread as real (Able Archer)
  | 'WEATHER_ARTIFACT'        // solar flare / atmospheric reflection
  | 'ADVERSARY_DECEPTION'     // deliberate spoof of launch signature
  | 'INTELLIGENCE_ERROR';     // HUMINT or SIGINT misattribution

export interface FalseAlarmEvent {
  id: string;
  type: FalseAlarmType;
  tick: number;
  detectedByCountryId: string;
  perceivedThreatFromCountryId: string;
  confidenceAtDetection: number;
  wasCorrectlyResolved: boolean;
  resolutionTick: number | null;
  nearLaunchReached: boolean;   // did authority chain progress to AUTHORIZED?
  worldEventGenerated: boolean;
}

// ── DEAD HAND / PERIMETER ─────────────────────────────────────────────────────

export interface DeadHandState {
  isActive: boolean;            // Russian Perimeter system — active?
  activationCondition: string | null;
  triggerThreshold: number;     // seismic + radiation + comms-loss threshold
  activatedTick: number | null;
  launchAuthorizedBySystem: boolean;
  countermeasuresAvailable: boolean;
}

// ── NUCLEAR CONSEQUENCE PROFILE ───────────────────────────────────────────────

export interface NuclearDetonationConsequences {
  detonationId: string;
  countryId: string;
  lat: number;
  lon: number;
  yieldKt: number;
  immediateDeaths: number;
  injuredCasualties: number;
  radiationDeathsPerTick: number;
  permanentInfrastructureLoss: number;   // % GDP loss
  nuclearFalloutRadiusKm: number;
  electromagneticPulseRadiusKm: number;
  economicShockMultiplier: number;
  allianceCohesionImpact: number;
  globalTradeImpact: number;
  tabooErosionDelta: number;
  nuclearWinterProbability: number;      // if total megatons exceed threshold
  climateShockOnset: boolean;
  triggeredRetaliationFrom: string[];
}

// ── NUCLEAR SCAR FOR RENDERING / VISUALS ──────────────────────────────

export interface NuclearScar {
  id: string;
  lat: number;
  lon: number;
  radius: number;
  megatons: number;
  timestamp: number;
}

// ── ADVERSARY POSTURE TYPE ──────────────────────────────────────────────────
export interface AdversaryPosture {
  countryId: string;
  posture: TriadPostureLevel;
  retaliationPressure: number;
  lastEscalationTick: number | null;
  launchCommitted: boolean;
}

// ─── CONVENTIONAL OPERATIONS CORE SYSTEM TYPES ───────────────────────

export type UnitDomain =
  | 'LAND'
  | 'AIR'
  | 'MARITIME'
  | 'CYBER'
  | 'SPACE'
  | 'SPECIAL_OPERATIONS';

export type UnitFamily =
  | 'ARMORED_BRIGADE'
  | 'MECHANIZED_INFANTRY'
  | 'LIGHT_INFANTRY'
  | 'AIRBORNE'
  | 'SPECIAL_FORCES'
  | 'AVIATION_BRIGADE'
  | 'FIELD_ARTILLERY'
  | 'AIR_DEFENSE'
  | 'LOGISTICS_SUPPORT'
  | 'ENGINEER'
  | 'TACTICAL_FIGHTER_WING'
  | 'STRATEGIC_BOMBER_WING'
  | 'ISR_WING'
  | 'CARRIER_STRIKE_GROUP'
  | 'SUBMARINE_FORCE'
  | 'AMPHIBIOUS_READINESS_GROUP'
  | 'MINE_WARFARE'
  | 'CYBER_COMMAND'
  | 'SPACE_FORCE_ELEMENT';

export interface UnitAttributes {
  firepower: number;           // 0–100: ability to destroy targets
  maneuver: number;            // 0–100: movement speed and agility
  protection: number;          // 0–100: survivability
  sustainmentDemand: number;   // fuel+ammo consumed per tick
  readiness: number;           // 0–100: current operational readiness
  mobility: UnitMobility;
  signature: number;           // 0–100: how visible to ISR
  electronicWarfare: number;   // 0–100: EW emit and jam capability
  airDefense: number;          // 0–100: organic air defense
  intelligenceContribution: number; // 0–100: ISR capability
  specialCapabilities: SpecialCapability[];
}

export type UnitMobility = 
  | 'WHEELED' 
  | 'TRACKED' 
  | 'ROTARY' 
  | 'FIXED_WING'
  | 'NAVAL_SURFACE' 
  | 'SUBSURFACE' 
  | 'AMPHIBIOUS' 
  | 'FOOT';

export type SpecialCapability =
  | 'SEAD'                 // Suppression of enemy air defenses
  | 'DEEP_STRIKE'          // Long-range precision strike
  | 'ELECTRONIC_ATTACK'    // Offensive EW
  | 'CBRN'                 // Chemical/biological/radiological/nuclear
  | 'URBAN_WARFARE'        // Optimized for cities
  | 'MOUNTAIN_WARFARE'
  | 'ARCTIC_WARFARE'
  | 'AMPHIBIOUS_ASSAULT'
  | 'AIRBORNE_ASSAULT'
  | 'PSYOP_CAPABILITY'
  | 'CYBER_ATTACK'
  | 'SPACE_CONTROL'
  | 'COUNTER_IED'
  | 'CIVIL_AFFAIRS';

export interface OrderOfBattleUnit {
  id: string;
  countryId: string;
  family: UnitFamily;
  domain: UnitDomain;
  designation: string;         // e.g. "1st Armored Brigade Combat Team"
  attributes: UnitAttributes;
  currentRegion: string;       // regionId from worldStore
  assignedObjectiveId: string | null;
  assignedCampaignId: string | null;
  currentStatus: ConventionalUnitStatus;
  attritionLevel: number;      // 0–1: 0 = full strength, 1 = destroyed
  supplyLevel: number;         // 0–1: current supply state
  maintenanceDebt: number;     // accumulated maintenance cycles missed
  lastEngagedTick: number;
  isReserve: boolean;
  isDeployed: boolean;
  terrainPenalty: number;      // computed from current region terrain
  weatherPenalty: number;      // computed from current region weather
  sigintExposure: number;      // 0–1: how visible to enemy SIGINT
  deceptionCover: boolean;     // protected by active deception plan
  notes: string;
}

export type ConventionalUnitStatus =
  | 'READY'
  | 'DEPLOYED'
  | 'IN_TRANSIT'
  | 'ENGAGED'
  | 'WITHDRAWING'
  | 'RECONSTITUTING'
  | 'DEGRADED'
  | 'NON_MISSION_CAPABLE'
  | 'DESTROYED';

export interface CampaignPlan {
  id: string;
  name: string;
  plannerCountryId: string;
  status: CampaignStatus;
  objective: CampaignObjective;
  assignedUnitIds: string[];
  phases: CampaignPhase[];
  currentPhaseIndex: number;
  supportingFiresConfig: SupportingFiresConfig;
  logisticsConfig: LogisticsConfig;
  riskTolerance: RiskTolerance;
  sigintOverlaysApplied: string[];    // sigintStore target IDs
  deceptionPlansApplied: string[];    // deceptionStore plan IDs
  weatherAssessment: WeatherAssessment;
  terrainAssessment: TerrainAssessment;
  successCriteria: SuccessCriteria;
  casualtyEstimate: CasualtyEstimate;
  createdTick: number;
  launchedTick: number | null;
  completedTick: number | null;
  outcome: CampaignOutcome | null;
}

export type CampaignStatus =
  | 'PLANNING'
  | 'WARGAMED'
  | 'APPROVED'
  | 'EXECUTING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'ABORTED';

export interface CampaignObjective {
  id: string;
  type: ObjectiveType;
  targetRegionId: string;
  targetEntityId: string | null;
  description: string;
  priority: number;
  isAchieved: boolean;
  achievedTick: number | null;
}

export type ObjectiveType =
  | 'SEIZE_TERRITORY'
  | 'DEFEAT_FORCE'
  | 'ESTABLISH_NO_FLY_ZONE'
  | 'NAVAL_BLOCKADE'
  | 'DECAPITATE_LEADERSHIP'
  | 'DESTROY_INFRASTRUCTURE'
  | 'HUMANITARIAN_CORRIDOR'
  | 'DETERRENCE_DEMONSTRATION'
  | 'SPECIAL_RECOVERY'
  | 'CYBER_DOMINANCE'
  | 'SPACE_DENIAL';

export interface CampaignPhase {
  phaseNumber: number;
  name: string;
  description: string;
  duration: number;              // ticks
  primaryObjectiveId: string;
  unitIdsActive: string[];
  firesConfig: SupportingFiresConfig;
  logisticsConfig: LogisticsConfig;
  entryConditions: string[];
  exitConditions: string[];
  isComplete: boolean;
}

export interface SupportingFiresConfig {
  airSupportEnabled: boolean;
  navalFiresEnabled: boolean;
  artilleryEnabled: boolean;
  cyberFiresEnabled: boolean;
  spaceBasedISREnabled: boolean;
  airDefenseSuppressionEnabled: boolean;
  intensityLevel: FireIntensity;
  targetPriority: FireTargetPriority;
  rulesOfEngagement: ROELevel;
}

export type FireIntensity = 'MINIMAL' | 'DELIBERATE' | 'INTENSE' | 'MAXIMUM';
export type FireTargetPriority = 'MILITARY_ONLY' | 'DUAL_USE' | 'INFRASTRUCTURE' | 'LEADERSHIP';
export type ROELevel = 'PEACETIME' | 'RESTRICTIVE' | 'NORMAL' | 'PERMISSIVE' | 'UNRESTRICTED';
export type RiskTolerance = 'MINIMAL' | 'MODERATE' | 'AGGRESSIVE' | 'RECKLESS';

export interface LogisticsConfig {
  primarySupplyRouteId: string | null;
  alternateSupplyRouteIds: string[];
  fuelAllocationPerTick: number;
  ammoAllocationPerTick: number;
  maintenanceAllocationPerTick: number;
  portCapacityUsed: number;
  railCapacityUsed: number;
  airCapacityUsed: number;
  supplyPriorityUnits: string[];
  contestedLogisticsRisk: number;     // 0–1
  a2adThreatLevel: number;            // 0–1
}

export interface SupplyRoute {
  id: string;
  name: string;
  fromRegionId: string;
  toRegionId: string;
  type: TradeRouteType;
  capacityTons: number;
  currentThroughput: number;
  contestedLevel: number;          // 0–1
  isActive: boolean;
  weatherDegradation: number;      // 0–1 throughput reduction from weather
  terrainDegradation: number;      // 0–1 throughput reduction from terrain
  ewDegradation: number;           // 0–1 reduction from EW interdiction
  lastInterruptedTick: number | null;
}

export type RouteType = 'ROAD' | 'RAIL' | 'AIR' | 'SEA' | 'PIPELINE';

export interface LogisticsNode {
  id: string;
  regionId: string;
  type: LogisticsNodeType;
  capacityTons: number;
  currentLoad: number;
  isContested: boolean;
  isDestroyed: boolean;
  repairProgress: number;      // 0–1
}

export type LogisticsNodeType = 'PORT' | 'RAILHEAD' | 'AIRFIELD' | 'FORWARD_SUPPLY_BASE' | 'PIPELINE_JUNCTION';

export interface SustainmentState {
  countryId: string;
  fuelStockpile: number;
  ammoStockpile: number;
  sparePartsStockpile: number;
  fuelConsumptionPerTick: number;
  ammoConsumptionPerTick: number;
  maintenanceCycleDebt: number;
  supplyChainIntegrity: number;       // 0–1
  daysOfSupplyRemaining: number;
}

export interface RegionTerrainProfile {
  regionId: string;
  primaryTerrain: TerrainType;
  secondaryTerrain: TerrainType | null;
  urbanDensity: UrbanDensity;
  passability: number;             // 0–1 movement multiplier
  concealmentLevel: number;        // 0–1 ISR degradation
  defensibleTerrain: boolean;
  keyTerrainFeatures: TerrainFeature[];
  hasMountainPasses: boolean;
  hasChokePoints: boolean;
  coastlineLength: number;         // km
  majorRivers: number;
}

export type TerrainType =
  | 'OPEN'
  | 'ROLLING'
  | 'WOODED'
  | 'MOUNTAIN'
  | 'DESERT'
  | 'JUNGLE'
  | 'ARCTIC'
  | 'SWAMP'
  | 'COASTAL'
  | 'ISLAND';

export type UrbanDensity = 'RURAL' | 'SUBURBAN' | 'URBAN' | 'MEGACITY';

export type TerrainFeature =
  | 'MOUNTAIN_PASS'
  | 'RIVER_CROSSING'
  | 'CHOKE_POINT'
  | 'FORTIFIED_POSITION'
  | 'INDUSTRIAL_COMPLEX'
  | 'AIRFIELD'
  | 'PORT'
  | 'RAILHEAD'
  | 'COMMAND_BUNKER';

export interface RegionWeatherState {
  regionId: string;
  season: Season;
  currentCondition: WeatherCondition;
  visibility: number;          // 0–1 multiplier on ISR effectiveness
  precipitationType: PrecipitationType | null;
  precipitationIntensity: number;    // 0–1
  groundCondition: GroundCondition;
  windSpeed: number;                 // km/h
  temperature: number;               // Celsius
  movementMultiplier: number;        // derived: terrain + weather combined
  firesAccuracy: number;             // 0–1 degradation on fires
  ewEffectiveness: number;           // 0–1 degradation on EW
  isrPenetration: number;            // 0–1 how well ISR cuts through
  mudSeason: boolean;
  snowCover: boolean;
  stormSurge: boolean;
  lastUpdatedTick: number;
}

export type Season = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';
export type WeatherCondition = 'CLEAR' | 'OVERCAST' | 'RAIN' | 'STORM' | 'SNOW' | 'FOG' | 'SANDSTORM' | 'BLIZZARD';
export type PrecipitationType = 'RAIN' | 'SNOW' | 'SLEET' | 'HAIL';
export type GroundCondition = 'FIRM' | 'SOFT' | 'MUD' | 'SNOW_COVERED' | 'FROZEN' | 'FLOODED';

export interface CourseOfAction {
  id: string;
  campaignId: string;
  name: string;
  description: string;
  assignedUnits: string[];
  projectedDurationTicks: number;
  successProbability: number;       // 0–1
  casualtyEstimate: CasualtyEstimate;
  logisticsFeasibility: number;     // 0–1
  weatherRisk: number;              // 0–1
  terrainRisk: number;              // 0–1
  a2adRisk: number;                 // 0–1
  strategicRisk: number;            // 0–1
  escalationRisk: number;           // 0–1
  advantages: string[];
  disadvantages: string[];
  isSelected: boolean;
}

export interface CasualtyEstimate {
  ownForcesLight: number;
  ownForcesModerate: number;
  ownForcesHeavy: number;
  enemyForces: number;
  civilianEstimate: number;
  equipmentLoss: number;
}

export interface WeatherAssessment {
  forecastTicks: number;
  currentRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  movementImpact: string;
  firesImpact: string;
  isrImpact: string;
}

export interface TerrainAssessment {
  overallDifficulty: 'EASY' | 'MODERATE' | 'DIFFICULT' | 'VERY_DIFFICULT';
  keyObstacles: string[];
  approachRoutes: number;
  defensiveAdvantage: 'ATTACKER' | 'DEFENDER' | 'NEUTRAL';
}

export interface SuccessCriteria {
  primaryObjectiveComplete: boolean;
  casualtyThresholdNotExceeded: boolean;
  timelineAdhered: boolean;
  escalationContained: boolean;
  logisticsIntact: boolean;
}

export type CampaignOutcome =
  | 'DECISIVE_VICTORY'
  | 'PYRRHIC_VICTORY'
  | 'OPERATIONAL_SUCCESS'
  | 'STALEMATE'
  | 'OPERATIONAL_FAILURE'
  | 'CATASTROPHIC_DEFEAT';

export interface CombatEngagement {
  id: string;
  attackerUnitIds: string[];
  defenderUnitIds: string[];
  regionId: string;
  tick: number;
  attackerFirepower: number;
  defenderFirepower: number;
  terrainModifier: number;
  weatherModifier: number;
  isrModifier: number;
  attackerAttrition: number;
  defenderAttrition: number;
  outcome: EngagementOutcome;
  supplyConsumed: number;
  maintenanceIncurred: number;
}

export type EngagementOutcome =
  | 'ATTACKER_ADVANCE'
  | 'ATTACKER_REPELLED'
  | 'MUTUAL_ATTRITION'
  | 'DEFENDER_ROUT'
  | 'ATTACKER_ROUT'
  | 'WITHDRAWAL';


// ==========================================
// MODULE 7.3: A2/AD AIR-SEA-SPACE LAYER (IRON UMBRELLA)
// ==========================================

export type A2ADSystemCategory =
  | 'SAM_SHORT'        // SHORAD: <30km, e.g. Tor, Pantsir
  | 'SAM_MEDIUM'       // MRAD: 30-120km, e.g. Buk, HQ-16
  | 'SAM_LONG'         // LRAD: 120-400km, e.g. S-300, S-400, HQ-9
  | 'ASBM'             // Anti-ship ballistic missile: 500-3000km
  | 'ASCM'             // Anti-ship cruise missile: 200-800km
  | 'A2AD_INTEGRATED';  // Networked IADS combining multiple layers

export type A2ADSystemStatus =
  | 'ACTIVE'
  | 'DEGRADED'
  | 'SUPPRESSED'
  | 'DESTROYED'
  | 'REDEPLOYING'
  | 'HIDDEN';

export interface A2ADSystem {
  id: string;
  name: string;                  // e.g. "S-400 Triumf Battery Alpha"
  ownerNationId: string;
  category: A2ADSystemCategory;
  status: A2ADSystemStatus;
  lat: number;
  lng: number;
  engagementRadiusKm: number;    // hard kill zone
  trackingRadiusKm: number;      // detection/tracking zone (larger)
  interceptProbabilityBase: number;  // 0-1 against nominal target
  salvoCapacity: number;         // missiles available before reload
  reloadTicksRequired: number;
  mobilityScore: number;         // 0-1, how easily repositioned
  electronicVulnerability: number;  // susceptibility to jamming/SEAD
  deceptionResistance: number;   // resistance to decoys and feints
  linkedRadarId: string | null;  // if part of networked IADS
  deployedAtTick: number;
  lastAttritionTick: number | null;
  attritionLevel: number;        // 0-1, degradation from strikes
  isPlayerVisible: boolean;      // from fogOfWarStore
  currentRegion: string;         // closest/primary region ID covered
}

export type CSGPosture =
  | 'SURGE'           // maximum projection, maximum risk
  | 'STANDARD'        // normal operations
  | 'DEFENSIVE'       // reduced reach, hardened posture
  | 'WITHDRAWN';       // outside A2/AD envelope, minimal projection

export interface CarrierStrikeGroup {
  id: string;
  name: string;
  ownerNationId: string;
  lat: number;
  lng: number;
  aircraftCount: number;
  aircraftBaseRangeKm: number;
  tankerCount: number;
  tankerMultiplier: number;      // 1.0 to 1.8 range extension
  posture: CSGPosture;
  fuelStatePercent: number;      // 0-100
  a2adAttritionRisk: number;     // 0-1, computed from zone coverage
  effectiveStrikeRadiusKm: number;  // computed: base * tanker * (1 - attritionMod)
  escortCapacity: number;
  lastMovedTick: number;
  isInA2ADZone: boolean;
  detectionRisk: number;         // 0-1 probability of being detected this tick
}

export interface RefuelCorridor {
  id: string;
  waypointLat: number;
  waypointLng: number;
  rangeExtensionKm: number;
  isContested: boolean;
  asatRisk: number;
}

export interface BomberForce {
  id: string;
  name: string;
  ownerNationId: string;
  baseLocation: { lat: number; lng: number };
  aircraftType: string;           // e.g. "B-2A", "Tu-160", "H-6K"
  combatRadiusKm: number;         // unrefueled
  refuelCorridors: RefuelCorridor[];
  stealthModifier: number;        // 0-1 (e.g. 0.85 = drops SAM effectiveness by 85%)
  penetrationProbability: number; // computed against current A2/AD environment
  currentMission: 'STANDBY' | 'PENETRATION' | 'STRIKE' | 'EGRESS' | null;
}

export type SatelliteOrbitType =
  | 'LEO'    // Low Earth Orbit: fast revisit, lower coverage per pass
  | 'MEO'    // Medium Earth Orbit: GPS, navigation
  | 'GEO'    // Geostationary: persistent ISR, comms
  | 'HEO';    // Highly Elliptical Orbit: polar coverage

export type SatelliteFunction =
  | 'ISR_OPTICAL'
  | 'ISR_RADAR'
  | 'SIGINT_COLLECTION'
  | 'COMMS_RELAY'
  | 'GPS_PNT'
  | 'EARLY_WARNING'
  | 'WEATHER'
  | 'TARGETING';

export type SatelliteStatus =
  | 'OPERATIONAL'
  | 'DEGRADED'
  | 'JAMMED'
  | 'SPOOFED'
  | 'DESTROYED'
  | 'MANEUVERING';

export interface MilitarySatellite {
  id: string;
  name: string;
  ownerNationId: string;
  orbitType: SatelliteOrbitType;
  function: SatelliteFunction;
  status: SatelliteStatus;
  coverageArcDegrees: number;     // ground swath coverage per pass
  revisitTimeHours: number;       // how often it passes over a region
  resolutionMeters: number | null;  // ISR resolution where applicable
  gpsContributionScore: number;   // 0-1, contribution to regional GPS accuracy
  jammingResistance: number;      // 0-1
  asatVulnerability: number;      // 0-1
  currentGroundTrackLat: number;  // current ground track center
  currentGroundTrackLng: number;
  operationalSince: number;       // tick
  lastDegradedTick: number | null;
}

export type GPSDegradationType =
  | 'JAMMING'          // blocking GPS signal in region
  | 'SPOOFING'         // feeding false GPS coordinates
  | 'CONSTELLATION_DEGRADATION'  // ASAT-reduced GPS satellite count
  | 'SELECTIVE_AVAILABILITY';     // deliberate accuracy reduction

export interface GPSDegradationZone {
  id: string;
  degradationType: GPSDegradationType;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  severity: number;     // 0-1
  cepDegradationMultiplier: number;  // 1.0 = no effect, 5.0 = 5x worse CEP
  affectsNavigation: boolean;
  affectsPrecisionMunitions: boolean;
  affectsDroneOps: boolean;
  affectsComms: boolean;
  deployedByNationId: string;
  deployedAtTick: number;
  expiresAtTick: number | null;
}

export type ASATMethod =
  | 'KINETIC_DIRECT_ASCENT'   // ground-launched missile
  | 'CO_ORBITAL_INTERCEPTOR'  // satellite-based intercept
  | 'DIRECTED_ENERGY'         // laser or microwave dazzling/blinding
  | 'CYBER_INTRUSION'         // hack and disable
  | 'JAMMING_UPLINK'          // ground-based signal jamming
  | 'SPOOFING_UPLINK';         // command injection

export interface ASATStrike {
  id: string;
  initiatingNationId: string;
  targetSatelliteId: string;
  method: ASATMethod;
  launchedAtTick: number;
  expectedImpactTick: number;
  successProbability: number;
  outcome: 'PENDING' | 'SUCCESS' | 'PARTIAL' | 'FAILURE' | 'INTERCEPTED';
  diplomaticExposureRisk: number;
  debrisFieldCreated: boolean;
}

export interface MaritimePatrolAircraft {
  id: string;
  ownerNationId: string;
  baseLocation: { lat: number; lng: number };
  currentPatrolCenter: { lat: number; lng: number };
  patrolRadiusKm: number;
  loiterTimeHours: number;
  detectionRangeSubmarineKm: number;
  detectionRangeSurfaceKm: number;
  isActive: boolean;
  nextPatrolTick: number;
}

export interface ComputedA2ADZone {
  systemId: string;
  centerLat: number;
  centerLng: number;
  engagementRadiusKm: number;
  trackingRadiusKm: number;
  interceptProbability: number;
  category: A2ADSystemCategory;
  ownerNationId: string;
  status: A2ADSystemStatus;
  isOverlapping: boolean;   // true if another zone covers same space
}

export interface ComputedCoverageArc {
  sourceId: string;
  sourceType: 'SATELLITE' | 'RADAR' | 'MPA';  // Maritime Patrol Aircraft
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  coverageQuality: number;  // 0-1
  ownerNationId: string;
  function: SatelliteFunction | 'RADAR' | 'MPA_PATROL';
}

export interface SEADCampaign {
  id: string;
  initiatingNationId: string;
  targetNationId: string;
  targetA2ADSystemIds: string[];
  startTick: number;
  durationTicks: number;
  suppressionProbabilityPerTick: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ABORTED';
}

// ==== MODULE 7.4 ELECTRONIC WARFARE TYPES ====

export type EWSpectrumBand = 'HF' | 'VHF' | 'UHF' | 'SHF' | 'EHF' | 'OPTICAL' | 'INFRARED' | 'CYBER_RF';

export type EWAssetType = 
  | 'GROUND_JAMMER' 
  | 'AIRBORNE_JAMMER' 
  | 'SHIP_JAMMER' 
  | 'CYBER_RF_EMITTER' 
  | 'DRONE_EW_PLATFORM' 
  | 'DECOY_EMITTER' 
  | 'HARDENED_RELAY' 
  | 'DIRECTION_FINDING_ARRAY' 
  | 'SPOOF_TRANSMITTER';

export type EWOperationMode = 
  | 'STANDBY' 
  | 'LISTENING' 
  | 'SPOT_JAM' 
  | 'BARRAGE_JAM' 
  | 'SWEEP_JAM' 
  | 'DECEPTIVE_SPOOF' 
  | 'FRIENDLY_PROTECT' 
  | 'EMISSION_CONTROL' 
  | 'DIRECTION_FIND' 
  | 'CYBER_RF_INJECT';

export type EWEffectType = 
  | 'COMMS_DEGRADED' 
  | 'RADAR_BLINDED' 
  | 'GPS_DENIED' 
  | 'DRONE_LINK_SEVERED' 
  | 'MISSILE_GUIDANCE_CORRUPTED' 
  | 'SIGINT_COLLECTION_DEGRADED' 
  | 'FALSE_TARGET_INJECTED' 
  | 'FRIENDLY_FORCE_EXPOSED' 
  | 'EMISSIONS_DETECTED' 
  | 'DIRECTION_FOUND';

export type SignalVisibilityState = 
  | 'UNDETECTED' 
  | 'DETECTED' 
  | 'LOCATED' 
  | 'IDENTIFIED' 
  | 'TARGETED';

export interface EWAsset {
  id: string;
  name: string;
  type: EWAssetType;
  countryId: string;
  regionId: string;
  currentMode: EWOperationMode;
  spectrumBands: EWSpectrumBand[];
  powerOutput: number;          // 0–100
  operationalRange: number;     // km
  emissionProfile: number;      // 0–100, detectability
  isActive: boolean;
  isCompromised: boolean;
  cooldownTicksRemaining: number;
  deployedAtTick: number;
  lastModeChangeTick: number;
  effectsApplied: EWEffectType[];
  detectedBy: string[];         // countryIds that have found this asset
}

export interface EWObjective {
  type: 
    | 'BLIND_AIR_DEFENSE' 
    | 'SEVER_DRONE_COMMS' 
    | 'CORRUPT_MISSILE_GUIDANCE' 
    | 'SPOOF_RADAR_PICTURE' 
    | 'PROTECT_OWN_EMISSIONS' 
    | 'LOCATE_ADVERSARY_EMITTERS' 
    | 'DEGRADE_SIGINT_COLLECTION' 
    | 'INJECT_FALSE_TARGETS' 
    | 'ESTABLISH_COMMS_CORRIDOR';
  targetSystemType: string;
  successThreshold: number;
  currentProgress: number;
  isAchieved: boolean;
}

export interface EWCampaign {
  id: string;
  initiatorCountryId: string;
  targetCountryId: string;
  targetedBands: EWSpectrumBand[];
  mode: EWOperationMode;
  intensity: number;            // 0–100
  startTick: number;
  endTick: number | null;
  objectives: EWObjective[];
  activeEffects: EWEffectType[];
  successProbability: number;
  detectionRisk: number;
  powerDrainPerTick: number;
}

export interface SpectrumContentionEntry {
  regionId: string;
  band: EWSpectrumBand;
  contestingCountries: string[];
  dominantCountryId: string | null;
  contentionLevel: number;      // 0–100
  effectsActive: EWEffectType[];
  lastUpdatedTick: number;
}

export interface EWIntelProfile {
  countryId: string;
  knownAssets: Partial<EWAsset>[];
  suspectedCapabilities: EWAssetType[];
  observedPatterns: string[];
  lastEWActivityTick: number;
  adaptationScore: number;      // how much they've changed tactics
}

export interface AntiDroneSystem {
  id: string;
  countryId: string;
  regionId: string;
  systemType: 'KINETIC' | 'LASER' | 'RF_SPOOF' | 'RF_JAM' | 'NET_GUN' | 'CYBER';
  effectiveRange: number;
  engagementCapacity: number;   // drones per tick
  currentLoad: number;
  isActive: boolean;
  powerConsumption: number;
  spectrumBandsCovered: EWSpectrumBand[];
}

export interface DroneEWVulnerability {
  droneTypeId: string;
  controlBand: EWSpectrumBand;
  jamResistance: number;        // 0–100
  spoofResistance: number;      // 0–100
  autonomousCapability: number; // 0–100, fallback if link severed
  gpsDependent: boolean;
  dataLinkEncrypted: boolean;
}

// ==========================================
// MODULE 7.5: DEFENSE INDUSTRY & PROCUREMENT
// ==========================================

export type IndustrialSector = 
  | 'GROUND_VEHICLES' 
  | 'NAVAL_SYSTEMS' 
  | 'AVIATION' 
  | 'MISSILES_MUNITIONS' 
  | 'ELECTRONICS_EW' 
  | 'SPACE_SYSTEMS' 
  | 'NUCLEAR_STRATEGIC' 
  | 'SMALL_ARMS_LIGHT' 
  | 'CYBER_SYSTEMS' 
  | 'LOGISTICS_SUPPORT';

export interface IndustrialCapacityBlock {
  sectorId: IndustrialSector;
  countryId: string;
  baseCapacity: number;            // monthly unit-equivalents at peacetime
  currentCapacity: number;         // modified by mobilization, damage, sanctions
  mobilizationMultiplier: number;  // 1.0 = peacetime, up to 3.0 = full war economy
  utilizationRate: number;         // 0–100, how much capacity is currently committed
  workerCount: number;
  skillLevel: number;              // 0–100
  sanctionDegradation: number;     // 0–100, how much sanctions have degraded capacity
  supplyChainHealth: number;       // 0–100
  lastUpdatedTick: number;
}

export type ProductionItemType = 'PLATFORM' | 'MUNITION' | 'SYSTEM' | 'COMPONENT' | 'INFRASTRUCTURE';

export interface ComponentRequirement {
  componentId: string;
  quantityPerUnit: number;
  isAvailable: boolean;
  availableFromSource: string | null;
}

export interface ProductionItem {
  id: string;
  name: string;
  itemType: ProductionItemType;
  sector: IndustrialSector;
  countryId: string;
  quantity: number;
  quantityCompleted: number;
  costPerUnit: number;
  productionTicksPerUnit: number;
  ticksRemainingCurrentUnit: number;
  totalTicksElapsed: number;
  requiredComponents: ComponentRequirement[];
  assignedFacilityId: string;
  priority: 'EMERGENCY' | 'HIGH' | 'NORMAL' | 'LOW';
  isBlocked: boolean;
  blockReasons: string[];
  startedAtTick: number;
  estimatedCompletionTick: number;
}

export interface ProductionQueue {
  countryId: string;
  items: ProductionItem[];
  totalQueuedCost: number;
  estimatedMonthlyOutput: number;
  bottleneckSector: IndustrialSector | null;
}

export type FacilityType = 'FACTORY' | 'SHIPYARD' | 'ARSENAL' | 'LAB' | 'TEST_RANGE' | 'DEPOT';

export interface DefenseFacility {
  id: string;
  name: string;
  countryId: string;
  regionId: string;
  sector: IndustrialSector;
  facilityType: FacilityType;
  capacityUnits: number;
  currentLoad: number;
  techGeneration: number;          // 1–5
  isNationalized: boolean;
  isPrivate: boolean;
  exportLicensed: boolean;
  vulnerabilityScore: number;      // how targetable this is in conflict
  isOperational: boolean;
  damageTicks: number;             // 0 = undamaged, higher = degraded
  workforceId: string;
}

export type RDCategory = 
  | 'PROPULSION' 
  | 'GUIDANCE_PRECISION' 
  | 'STEALTH_SIGNATURE' 
  | 'ELECTRONIC_SYSTEMS' 
  | 'ARMOR_PROTECTION' 
  | 'ENERGY_WEAPONS' 
  | 'AUTONOMOUS_SYSTEMS' 
  | 'CYBER_OFFENSE' 
  | 'SPACE_DOMAIN' 
  | 'NUCLEAR_PHYSICS' 
  | 'BIODEFENSE' 
  | 'LOGISTICS_AI';

export interface ResearchProject {
  id: string;
  name: string;
  countryId: string;
  sector: IndustrialSector;
  category: RDCategory;
  currentGeneration: number;       // what gen of tech this advances from
  targetGeneration: number;        // what gen this achieves
  fundingPerTick: number;
  totalFundingInvested: number;
  fundingRequired: number;
  progressPercent: number;
  ticksElapsed: number;
  estimatedTicksRemaining: number;
  breakthroughProbability: number; // can finish early
  failureProbability: number;      // can collapse and need restart
  espionageVulnerability: number;  // how stealable the research is
  isClassified: boolean;
  isStolen: boolean;               // has adversary stolen key results
  collaboratingCountries: string[];
  dual_use: boolean;               // civilian / military crossover
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETE' | 'FAILED' | 'STOLEN' | 'ACCELERATED';
  completedAtTick: number | null;
  unlocksItemIds: string[];        // what production items this unlocks
}

export type StrategicComponentCategory = 'RARE_EARTH' | 'SEMICONDUCTOR' | 'PROPELLANT' | 'ALLOY' | 'OPTICS' | 'SOFTWARE_STACK';

export interface StrategicComponent {
  id: string;
  name: string;
  category: StrategicComponentCategory;
  globalSupplyLevel: number;       // 0–100
  primaryProducerCountries: string[];
  stockpileByCountry: Record<string, number>;
  consumptionRateByCountry: Record<string, number>;
  sanctionedFlows: string[];       // pairs of country→country flows that are blocked (format "src_dest")
  alternativeSourceDifficulty: number; // 0–100, how hard to replace
}

export type MobilizationLevel = 'PEACETIME' | 'ELEVATED' | 'PARTIAL' | 'FULL' | 'TOTAL_WAR';

export interface MobilizationState {
  countryId: string;
  level: MobilizationLevel;
  civilianIndustrialDiverted: number;  // 0–100
  mobilizationStartTick: number | null;
  demobilizationStartTick: number | null;
  economicDistortionScore: number;
  warEconomyActive: boolean;
  populationSupportScore: number;      // mobilization requires public support
  sustainabilityTicks: number;         // how many ticks at current level is sustainable
}

export interface DeliveryMilestone {
  tickTarget: number;
  itemId: string;
  quantity: number;
  delivered: boolean;
  deliveredAtTick: number | null;
}

export interface ArmsExportContract {
  id: string;
  exporterCountryId: string;
  importerCountryId: string;
  itemIds: string[];
  quantities: Record<string, number>;
  totalValue: number;
  durationTicks: number;
  ticksElapsed: number;
  deliverySchedule: DeliveryMilestone[];
  endUseCertificate: boolean;
  thirdPartyTransferProhibited: boolean;
  politicalConditionality: string[];
  isActive: boolean;
  isViolated: boolean;
  violationDetails: string | null;
  diplomaticLinkage: string | null;   // tied to a treaty or alignment
}

export interface ExportLicense {
  id: string;
  exporterCountryId: string;
  importerCountryId: string;
  itemCategory: IndustrialSector;
  isApproved: boolean;
  expiryTick: number;
  conditions: string[];
  revokedAtTick: number | null;
  revokeReason: string | null;
}

export interface ProcurementIntelEntry {
  countryId: string;
  observedPurchases: string[];
  inferredProductionRamp: IndustrialSector[];
  estimatedMobilizationLevel: MobilizationLevel;
  knownFacilities: string[];
  rdBreakthroughsSuspected: RDCategory[];
  supplyChainVulnerabilities: string[];
  lastUpdatedTick: number;
  confidenceScore: number;
}

export type DefenseIndustryAlertType = 
  | 'PRODUCTION_BLOCKED' 
  | 'COMPONENT_SHORTAGE' 
  | 'RD_BREAKTHROUGH' 
  | 'RD_STOLEN' 
  | 'MOBILIZATION_DETECTED' 
  | 'EXPORT_VIOLATION' 
  | 'FACILITY_DAMAGED' 
  | 'SUPPLY_CHAIN_INTERDICTED' 
  | 'TECH_GENERATION_LEAP';

export interface DefenseIndustryAlert {
  id: string;
  type: DefenseIndustryAlertType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  countryId: string;
  details: string;
  tick: number;
  acknowledged: boolean;
}








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

// FROM arachne.ts
export type ArachneSourceClass = 'RUMINT' | 'OSINT' | 'SIGINT' | 'HUMINT' | 'CONFIRMED';

export type ArachneTheme = 
  | 'DIPLOMACY'
  | 'MILITARY'
  | 'ECONOMIC'
  | 'SANCTIONS'
  | 'CYBER'
  | 'UNREST'
  | 'LEADERSHIP'
  | 'ALLIANCES'
  | 'PROLIFERATION'
  | 'INTELLIGENCE'
  | 'ENERGY'
  | 'TRADE'
  | 'COVERT_RISK'
  | 'HUMANITARIAN';

export type ArachneUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ArachneConfidence = 'LOW' | 'MEDIUM' | 'HIGH' | 'TOTAL';
export type ArachneFreshness = 'BREAKING' | 'ACTIVE' | 'WATCH' | 'BACKGROUND' | 'STALE' | 'RESOLVED' | 'ARCHIVED';
export type ArachnePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'BACKGROUND';
export type ArachneBriefGroup = 'TOP_STORY' | 'ACTIVE_WATCH' | 'BACKGROUND_SIGNAL';

export interface ArachneIntelItem {
  id: string;
  title: string;
  summary: string;
  fullBrief: string;
  whyItMatters: string;
  countryIds: string[];
  regionIds: string[];
  relatedLeaderIds: string[];
  themeTags: ArachneTheme[];
  urgency: ArachneUrgency;
  confidence: ArachneConfidence;
  sourceType: ArachneSourceClass;
  sourceLabel: string;
  timestampTick: number;
  freshnessState: ArachneFreshness;
  linkedIntelFactIds: string[];
  linkedWorldEventIds: string[];
  linkedOperationIds: string[];
  relatedTreatyIds: string[];
  alertScore: number;
  strategicPriority: ArachnePriority;
  visibility: 'PUBLIC' | 'PLAYER_ONLY' | 'CLASSIFIED';
  status: 'ACTIVE' | 'ARCHIVED';
  requiresAttention: boolean;
  briefingCategory: ArachneBriefGroup;
  icon?: string;
  hasFollowUp?: boolean;
  storyId?: string; // clustered storyline identifier
}

export interface ArachneFilterState {
  searchQuery: string;
  country: string;
  region: string;
  theme: ArachneTheme | 'ALL';
  urgency: ArachneUrgency | 'ALL';
  sourceType: ArachneSourceClass | 'ALL';
  confidence: ArachneConfidence | 'ALL';
  freshness: 'ALL_ACTIVE' | 'BREAKING_ONLY' | 'ARCHIVED' | 'ALL';
}


// FROM bloc.ts
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


// FROM defconPersona.ts
import { DefconLevel } from './store/defconStore';

export type PersonaId = 
  | 'ANALYST' // Peacetime Coordinator
  | 'WATCH_OFFICER' 
  | 'CRISIS_LEAD' 
  | 'JOINT_COMMANDER' 
  | 'STRATEGIC_COMMAND'; // National Authority

export interface PersonaDef {
  id: PersonaId;
  name: string;
  authorityTier: number; // 1-5
  minDefconLevel: DefconLevel; // What DEFCON levels this persona is valid for. e.g. Analyst is 1-5, Strategic command is 1-3.
  description: string;
}

export type PanelCategory = 
  | 'STRATEGIC_MAP'
  | 'INTELLIGENCE'
  | 'DIPLOMACY'
  | 'ECONOMY'
  | 'COVERT'
  | 'REGIME_PRESSURE'
  | 'MILITARY'
  | 'CYBER'
  | 'NUCLEAR'
  | 'ALERTS'
  | 'SYSTEM'
  | 'COMMAND_SUMMARY';

export interface PanelRegistryDef {
  id: number;
  name: string;
  category: PanelCategory;
  primaryPurpose: string;
  minDefconAvailability: DefconLevel; // e.g. 5 means available at 5 through 1
  minPersonaTier: number; // 1 to 5
  layoutPriority: 'PRIMARY' | 'SECONDARY' | 'LOWER' | 'CONTEXTUAL';
  isNuclearRestricted?: boolean;
}

export interface DefconTransitionLog {
  id: string;
  tick: number;
  fromLevel: DefconLevel;
  toLevel: DefconLevel;
  reason: string;
  source: 'SYSTEM' | 'PLAYER' | 'SCENARIO';
}


// FROM economicForecast.ts

export type ForestHorizon = '1T' | '3T' | '6T' | '12T'; // ticks
export type StressLabel = 'Stable' | 'Tightening' | 'Fragile' | 'Shock Propagation' | 'Systemic Stress' | 'Crisis Transmission' | 'Partial Recovery';

export interface ForecastTimelinePoint {
  tick: number;
  baselineValue: number;
  proposedValue: number;
  bestCaseValue: number;
  worstCaseValue: number;
  volatility: number;
}

export interface ForecastConfidenceBand {
  horizon: ForestHorizon;
  low: number;
  high: number;
  confidence: number; // 0-100%
  volatilityWarning: boolean;
}

export interface ForecastBranch {
  branchId: 'BASELINE' | 'PROPOSED' | 'STRESS_ALT' | 'RECOVERY_ALT';
  name: string;
  probability: number; // %
  narrative: string;
  gdpPath: number[]; // future values
  inflationPath: number[];
  unrestPath: number[];
}

export interface EconomicForecastSnapshot {
  countryId: string;
  baseTick: number;
  horizons: Record<ForestHorizon, {
    gdpGrowth: number;
    inflation: number;
    unemployment: number;
    economicStress: number;
    confidence: number;
  }>;
  confidenceBands: Record<string, ForecastConfidenceBand>;
  branches: ForecastBranch[];
  latestNarrative: string;
}

export interface ActionSecondOrderEffect {
  title: string;
  sourceSystem: 'TRADE' | 'ENERGY' | 'SANCTIONS' | 'FININT' | 'GOTHAM';
  description: string;
  probability: 'HIGH' | 'MEDIUM' | 'LOW';
  escalationRiskScore: number; // 0-100
}

export interface ActionEconomicPreview {
  id: string;
  actionKey: string;
  title: string;
  initiatingActor: string;
  targetActor?: string;
  likelihoodTopLine: string;
  winners: string[];
  losers: string[];
  mostExposedSectors: string[];
  mostAffectedCommodities: CommodityType[];
  gdpImpactPercentage: number; // proposed delta % vs baseline
  inflationImpactPercentage: number; // proposed delta CPI
  secondOrderEffects: ActionSecondOrderEffect[];
  confidenceScore: number; // 0-100
  blowbackEscalationRisk: number; // 0-100
  underlyingAssumptions: string[];
  realizedImpact?: {
    ticksElapsed: number;
    realizedGdpChange: number;
    realizedInflationChange: number;
    accuracyScore: number; // how close forecast was vs actual
  };
}

export interface SectorContributionBreakdown {
  contributionToGdpPct: number;
  growthContribution: number; // raw value contribution to local growth rate
  importShortageImpact: number; // 0-10
  exportConstraintImpact: number; // 0-10
  energyShockVulnerability: number; // 0-10
  sanctionsExposureScore: number; // 0-10
  routeFrictionImpact: number; // 0-10
  laborStressScore: number; // 0-10
}

export interface SectorDrilldownModel {
  countryId: string;
  sectorKey: string;
  displayName: string;
  currentValueUSD: number; // in billions
  shareOfGDP: number; // % of country GDP
  status: 'RESILIENT' | 'NOMINAL' | 'STRESSED' | 'CRITICAL';
  trend: 'STABLE' | 'GROWING' | 'RECOVERING' | 'DECLINING' | 'COLLAPSING';
  decomposition: SectorContributionBreakdown;
  substitutionCapacityScore: number; // 0-100 (resilience indicator)
  forecastHorizonOutlook: Record<ForestHorizon, 'STABLE' | 'EXPANSION' | 'SLOWDOWN' | 'CONTRACTION' | 'CRITICAL'>;
}

export interface CommodityStressRecord {
  commodity: CommodityType;
  priceStress: number; // 0-100
  supplyTightness: number; // 0-100
  demandSurge: number; // 0-100
  routeFragility: number; // 0-100
  sanctionsExposure: number; // 0-100
  importerVulnerability: number; // 0-100
  volatilityIndex: number; // 0-100
  forecastedDirection: 'SPIKING' | 'RISING' | 'STABLE' | 'SOFTENING' | 'CRASHING';
  confidenceScore: number; // 0-100
}

export interface CommodityHeatmapCell {
  rowId: string; // commodity
  colId: string; // country ID or Region or Horizon or Stress Dimension
  value: number; // normalized 0-100 for the color gradient
  rawString: string; // readable hover representation
}

export interface WorldStressRibbonSegment {
  dimension: 'INFLATION' | 'ENERGY' | 'TRADE' | 'SANCTIONS' | 'FINANCE' | 'COMMODITY' | 'DEBT' | 'CHOKEPOINT' | 'CONFIDENCE';
  stressScore: number; // 0-100
  weight: number; // contribution to overall ribbon sum
  trend: 'UP' | 'DOWN' | 'STABLE';
  primaryHotspots: string[]; // countries or regions driving the stress
}

export interface WorldEconomicStressState {
  globalStressIndex: number; // 0-100 overall score
  prevTickIndex: number;
  directionVelocity: number; // rate of change
  synchronizedScale: 'LOCALIZED' | 'REGIONAL_PROPAGATION' | 'SECTORAL_CRISIS' | 'SYNCHRONIZED_STRESS' | 'GLOBAL_SYSTEMIC_CRISIS';
  label: StressLabel;
  components: WorldStressRibbonSegment[];
  narrativeOverview: string;
}

export interface CountryEconomicSummary {
  countryId: string;
  name: string;
  isoCode: string;
  currentGdpB: number;
  headlineGrowth: number;
  headlineInflation: number;
  debtToGdpRatio: number;
  macroTrend: 'BOOMING' | 'STABLE' | 'STAGNANT' | 'DETERIORATING' | 'CRISIS';
  topStressedSectors: { sector: string; score: number }[];
  topStressedCommodities: { commodity: CommodityType; stress: number }[];
  tradeVulnerabilityIndex: number; // 0-100
  energyVulnerabilityIndex: number; // 0-100
  financeFragilityIndex: number; // 0-100
  sanctionsBlowbackExposure: number; // 0-100
  worldStressContributionPct: number; // % contribution to global stress index
}

export interface EconomicRiskFlag {
  id: string;
  countryId: string;
  severity: 'WARNING' | 'CRITICAL' | 'CATASTROPHIC';
  systemSource: 'MACRO' | 'TRADE' | 'ENERGY' | 'SANCTIONS' | 'FININT';
  title: string;
  triggerCondition: string;
  description: string;
}

export interface EconomicWatchItem {
  id: string;
  title: string;
  type: 'COMMODITY' | 'ROUTE' | 'NATION' | 'SECTOR';
  targetLabel: string;
  activeTrend: 'HEATING_UP' | 'COOLING_DOWN' | 'STABLE_STRESS';
  stressLevel: number;
  arachneReferenceAlertId?: string;
}

export interface EconomicUISelectionState {
  activeCountryId: string;
  activeSectorKey: string;
  activeCommodityKey: CommodityType;
  heatmapGridMode: 'COMMODITY_X_COUNTRY' | 'COMMODITY_X_REGION' | 'COMMODITY_X_HORIZON' | 'COMMODITY_X_DIMENSION';
  forecastHorizon: ForestHorizon;
  forecastBranchId: 'BASELINE' | 'PROPOSED' | 'STRESS_ALT' | 'RECOVERY_ALT';
  workspaceComparableCountries: string[];
  workspaceComparableSectors: string[];
  workspaceComparableCommodities: CommodityType[];
}


// FROM energy.ts
export type EnergySourceType = 'oil' | 'gas' | 'coal' | 'nuclear' | 'hydro' | 'solar' | 'wind';

export interface EnergySourceState {
  type: EnergySourceType;
  domesticProduction: number;      // Mtoe or units
  domesticConsumption: number;     // Mtoe or units
  importRequirement: number;       // positive if needs imports, negative if surplus exporter
  substitutability: number;        // 1-10 difficulty to replace
  stressSensitivity: number;       // 0-100 baseline vulnerability
  strategicImportance: number;     // 1-10 priority (e.g. oil/gas high, solar/wind growing)
  disruptionConsequences: string[]; // custom indicators (e.g. "Industrial power outages", "Transport cost spike")
}

export interface EnergyImportDependency {
  sourceType: EnergySourceType;
  supplierCountryId: string;
  volumeMtoe: number;              // volume imported
  routeId: string;                 // segment or node ID representing the main route (from tradeStore or road/lane ID)
  routeType: 'pipeline' | 'sealane' | 'port' | 'corridor' | 'mixed';
  routeChokepointRisk: number;     // 0-100 risk score
  rerouteFlexibility: number;      // 0-100 ease of rerouting (pipeline is low, tanker/oil is high)
  isDisrupted: boolean;
  actualDeliveryPct: number;       // 100% is normal, can drift down during embargo or blockage
}

export interface EnergyExportProfile {
  sourceType: EnergySourceType;
  recipientCountryId: string;
  volumeMtoe: number;
  routeId: string;
}

export interface EnergyVulnerabilityProfile {
  vulnerabilityScore: number;      // 0-100
  diversificationScore: number;    // 0-100 (high is good, meaning diversified sources/suppliers)
  routeConcentrationScore: number; // 0-100 (high is risky, meaning dependent on one chokepoint)
  embargoSensitivity: number;      // 0-100
  rerouteFlexibilityScore: number; // 0-100
  criticalDrivers: string[];       // top reasons for exposure/vulnerability
}

export interface EnergyRerouteOption {
  sourceType: EnergySourceType;
  alternativeSupplierId: string;
  routeId: string;
  availableCapacityFraction: number; // 0.0 - 1.0
  frictionCostMultiplier: number;    // e.g. 1.25 representing longer route costing more
  coerciveRiskScore: number;         // 0-100 vulnerability with alternative supplier
}

export interface EnergyEmbargoAction {
  id: string;
  actorCountryId: string;
  targetCountryId: string;
  affectedSources: EnergySourceType[];
  affectedRoutes: string[];          // routes locked down
  intensity: number;                 // 0-100 % enforcement
  tickEnacted: number;
  isActive: boolean;
}

export interface EnergyStressRecord {
  householdStress: number;           // 0-100 (hitting heating, power bills)
  industrialStress: number;          // 0-100 (factory slowdowns, power allocation)
  strategicStress: number;           // 0-100 (drawdowns of state strategic reserves)
  aggregatedStressScore: number;     // 0-100 combined
  lastShockTick: number;
}

export interface EnergyShockRecord {
  id: string;
  countryId: string;
  sourceType: EnergySourceType;
  impactGdpFallPercent: number;
  impactInflationPercent: number;
  unemploymentSpikePercent: number;
  socialFragilityDelta: number;
  description: string;
  tickOccurred: number;
}

export interface CountryEnergyProfile {
  countryId: string;
  sourceStates: Record<EnergySourceType, EnergySourceState>;
  totalEnergyProduction: number;   // Gross output
  totalEnergyConsumption: number;  // Gross usage
  energySufficiencyIndex: number;  // 0-100% or above (representing domestic / demand ratio)
  importDependencyPct: number;     // 0-100 percentage exposed externally
  exportRole: 'EXPORTER' | 'IMPORTER' | 'BALANCED' | 'SELF_SUFFICIENT';
  
  // Scoring
  diversificationScore: number;
  dependencyScore: number;
  vulnerabilityScore: number;
  resilienceScore: number;
  domesticStressScore: number;
  
  // Sectoral Exposure
  industrialEnergyExposure: number; // 0-100
  householdStressExposure: number;  // 0-100
  routeConcentration: number;       // 0-100
  strategicBufferDays: number;      // size of country supply buffer e.g. 90 days EPR
  recoveryAdaptationMomentum: number; // 0-100
  lastUpdatedTick: number;

  dependencies: EnergyImportDependency[];
  activeEmbargoes: EnergyEmbargoAction[];
  stressState: EnergyStressRecord;
}

export interface EnergyDependencyGraphNode {
  id: string;
  label: string;
  flag: string;
  type: 'SUPPLIER' | 'CONSUMER' | 'BALANCED';
  energyVulnerability: number;
  energyStress: number;
}

export interface EnergyDependencyGraphEdge {
  id: string;
  source: string;                  // supplier
  target: string;                  // importer
  sourceType: EnergySourceType;
  volumeMtoe: number;
  routeType: 'pipeline' | 'sealane' | 'port' | 'corridor' | 'mixed';
  routeId: string;
  isDisrupted: boolean;
  flowPct: number;                 // current actual vs contracted flow
}

export interface EnergyIncident {
  id: string;
  tick: number;
  type: 'EMBARGO_IMPOSED' | 'GAS_FLOW_DISRUPTED' | 'PIPELINE_DEPENDENCY_EXPOSED' | 'ENERGY_REROUTE_ATTEMPTED' | 'DOMESTIC_ENERGY_STRESS_ESCALATED' | 'ENERGY_VULNERABILITY_THRESHOLD_CROSSED' | 'ENERGY_BUFFER_IMPROVED' | 'ENERGY_SHOCK_MACRO_SPILLOVER';
  actorCountryId: string;
  targetCountryId?: string;
  routeId?: string;
  sourceType?: EnergySourceType;
  summary: string;
  economicSeverity: 'MINIMAL' | 'STRESSED' | 'SEVERE';
}


// FROM finint.ts
export type FinancialActorType = 'oligarch' | 'sovereign_wealth_fund' | 'proxy_vehicle' | 'strategic_enterprise' | 'central_bank' | 'covert_broker';

export type ShellEntityStatus = 'ACTIVE' | 'FLAGGED' | 'FROZEN' | 'DISSOLVED' | 'MIGRATED';

export type SanctionStatus = 'NONE' | 'MONITORED' | 'PRIMARY_SANCTIONS' | 'SECONDARY_REDUX' | 'FROZEN_ASSETS';

export type JurisdictionSecrecyRating = 'LOW' | 'MEDIUM' | 'HIGH';

export type FinancialCoercionType = 'ASSET_FREEZE' | 'RESERVE_ATTACK' | 'DEBT_PRESSURE' | 'SWIFT_EXCLUSION';

export interface FinancialActor {
  id: string; // e.g. 'volkov_holding', 'qd_strategic'
  name: string;
  actorType: FinancialActorType;
  linkedCountryId: string;
  associatedSanctionStatus: SanctionStatus;
  visibilityScore: number; // 0-100 (how hidden they are)
  capitalWeight: number; // Millions/Billions index (e.g. 150)
  jurisdictionIds: string[]; // Hosted in
  networkRole: string; // "Shadow Procurement", "Clearing Broker", "Symmetric Wealth Reserve"
  knownExposureLevel: number; // 0-100
  plausibleDeniabilityIndex: number; // 0-100
}

export interface ShellEntity {
  id: string;
  name: string;
  linkedActorId: string; // Beneficiary Owner
  jurisdictionId: string; // e.g. 'cayman', 'cyprus'
  secrecyLevel: number; // 0-100
  assetClasses: string[]; // ['Maritime fleets', 'Real estate', 'Tech equities']
  exposureRisk: number; // 0-100
  status: ShellEntityStatus;
  linkedRoutes: string[]; // Shared with Foundry segments
}

export interface JurisdictionProfile {
  id: string; // e.g. 'cayman', 'cyprus', 'switzerland', 'seychelles', 'uk'
  countryId?: string; // If sovereign
  name: string;
  secrecyRating: JurisdictionSecrecyRating;
  compliancePosture: 'HIGHLY_COOPERATIVE' | 'PARTIALLY_COOPERATIVE' | 'NON_COMPLIANT';
  enforcementRisk: number; // 0-100
  attractivenessForShells: number; // 0-100
  sovereignShieldingPower: number; // 0-100
  currentCooperationMultiplier: number; // Dynamic slider
}

export interface CoerciveFinancialAction {
  id: string;
  type: FinancialCoercionType;
  actorCountryId: string;
  targetCountryId: string;
  targetActorId?: string;
  intensityScore: number; // 0-100
  activeTick: number;
}

export interface FinancialActionPreview {
  actionType: FinancialCoercionType;
  targetCountryId: string;
  targetActorId?: string;
  intendedStrength: number; // 0-100
  expectedLeverageLevel: number; // 0-100
  allianceDiscomfortPenalty: number; // 0-100
  reputationalErosion: number; // 0-100 Override penalty
  paymentFragmentationRisk: number; // 0-100
  dollarDominanceErosion: number; // 0-100
  expectedTotalBlowback: number; // Cumulative sum
  firstOrderFinancialImpact: string;
  firstOrderStrategicRetaliationRisk: string;
  confidenceScore: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface FinancialIncident {
  tick: number;
  actorId: string;
  actionType: FinancialCoercionType | 'DISCOVERY' | 'EXCLOSURE';
  title: string;
  summary: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}


// FROM foundry.ts

export type RouteMode = 'maritime' | 'pipeline' | 'land' | 'manufacturing' | 'mixed';

export type RouteStatus = 'STABLE' | 'STRESSED' | 'REROUTED' | 'BLOCKED';

export type ChokepointStatus = 'SECURE' | 'CONGESTED' | 'BLOCKED';

export interface CommodityFlow {
  id: string;
  commodityType: CommodityType;
  sourceCountryId: string;
  destinationCountryId: string;
  transitPath: string[]; // List of intermediate countries / transit states
  transitChokepointIds: string[]; // Chokepoints crossed
  mode: RouteMode;
  volumeScore: number; // 0-100 (amount of throughput)
  strategicImportance: number; // 0-100 (criticality to importer/exporter)
  substitutability: number; // 0-100 (availability of alternate partners)
  disruptionSensitivity: number; // 0-100 (vulnerability level)
  routeStatus: RouteStatus;
  linkedTreatyIds: string[];
  linkedWorldEventIds: string[];
  linkedIntelFactIds: string[];
  lastChangedTick: number;
  dependenciesSummary: string;
}

export interface Chokepoint {
  id: string; // e.g. 'hormuz', 'malacca', 'suez', 'panama', 'taiwan_strait', 'bosphorus', 'bab_el_mandeb'
  name: string;
  coordinates: { x: number; y: number }; // Relative coordinate mapping for visual layout overlay
  chokepointType: 'strait' | 'canal' | 'corridor' | 'hub';
  connectedCommodities: CommodityType[];
  throughputImportance: number; // 0-100
  exposureScore: number; // 0-100 (calculated dynamic exposure risk)
  controllingCountryIds: string[]; // Adjacent/controlling sovereign entities
  vulnerabilityTags: string[];
  currentDisruptionStatus: ChokepointStatus;
  strategicSummary: string;
}

export interface SupplyDependencyRecord {
  countryId: string;
  commodityType: CommodityType;
  dependenceRatio: number; // 0-100%
  primarySourceCountryId: string;
  primaryRouteId: string;
  chokepointExposureScore: number; // 0-100
  substituteAvailability: 'NONE' | 'LIMITED' | 'SUFFICIENT';
  resilienceRating: number; // 0-100% (strategic stockpile depth etc)
}

export interface DisruptionSignal {
  id: string;
  type: 'SUPPLY_ROUTE_DISRUPTED' | 'CHOKEPOINT_STRESSED' | 'COMMODITY_SHORTAGE_RISK_RISING' | 'ENERGY_FLOW_IMPAIRED' | 'FOOD_IMPORT_VULNERABILITY_SPIKE' | 'SEMICONDUCTOR_CHAIN_STRAIN' | 'STRATEGIC_MATERIAL_BOTTLENECK';
  countryId: string;
  commodityType: CommodityType;
  severity: number; // 0-100
  durationTicks: number; // dynamic persistence
  sourceId: string; // flow ID or chokepoint ID of the trigger
  description: string;
  affectedSystems: string[]; // e.g. ['MILITARY_READINESS', 'GDP_OUTPUT', 'POPULAR_STABILITY']
}

export interface ImpactPreview {
  actionType: 'EMBARGO' | 'SANCTION' | 'INTERDICTION' | 'ROUTE_CLOSURE';
  actorCountryId: string;
  targetCountryId: string;
  affectedCommodities: CommodityType[];
  disruptionSeverity: number; // 0-100
  firstOrderEconomicImpact: string;
  firstOrderMilitaryImpact: string;
  diplomaticFalloutRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  affectedAllies: string[];
  expectRerouting: boolean;
  reroutingDelayTicks: number;
  confidenceLabel: 'LOW' | 'MEDIUM' | 'HIGH';
}


// FROM gotham.ts

export type RelationshipDimension = 'trade' | 'ideology' | 'military' | 'treaty' | 'hostility';

export interface ForecastSignal {
  type: 'PROVOCATION_RISK' | 'ALLIANCE_STRAIN' | 'PRESSURE_OPPORTUNITY';
  score: number; // 0-100
  drivers: string[];
  confidenceLabel: 'LOW' | 'MEDIUM' | 'HIGH';
  trendDirection: 'STABLE' | 'RISING' | 'DECAYING';
  mitigations?: string[];
}

export interface RelationshipChangeRecord {
  tick: number;
  dimension: RelationshipDimension | 'ALL';
  changeType: 'IMPROVED' | 'DETERIORATED' | 'STABILIZED' | 'INITIALIZED';
  description: string;
  linkedEventId?: string;
  linkedIntelId?: string;
  linkedTreatyId?: string;
}

export interface GraphNodeMetrics {
  degree: number;
  centrality: number; // calculated centrality proxy (0-1)
  dependencyCount: number; // count of states dependent on this node
  vulnerabilityIndex: number; // calculated exposure rating (0-100)
}

export interface GraphNode {
  countryId: string;
  displayName: string;
  region: string;
  blocTags: string[];
  currentStrategicPostureSummary: string;
  aggregateInfluenceScore: number; // 0-100 derived
  riskFlags: string[];
  graphMetrics: GraphNodeMetrics;
}

export interface GraphEdge {
  id: string; // source_target
  sourceCountryId: string;
  targetCountryId: string;
  directional: boolean; // many ties are asymmetric
  activeDimensions: RelationshipDimension[];
  
  // Dimensional raw scores (0 to 100)
  tradeScore: number;             // Economic interdependence, exposure, depth
  ideologyScore: number;          // Regime affinity, matching values
  militaryLinkScore: number;      // Defense alignment, basing, command ties
  treatyObligationScore: number;  // binding commitments
  covertHostilityScore: number;   // shadow conflict, subversion

  // Aggregated evaluation indexes (0 to 100)
  overallAffinityScore: number;   // friendship proxy
  overallTensionScore: number;    // conflict proxy
  dependencyScore: number;        // unidirectional exposure
  volatilityScore: number;        // fluctuations trigger likelihood

  visibility: 'PUBLIC' | 'CLASSIFIED' | 'PLAYER_ONLY';
  lastChangedTick: number;
  changeReasons: RelationshipChangeRecord[];
  
  linkedWorldEventIds: string[];
  linkedIntelFactIds: string[];
  linkedTreatyIds: string[];
  linkedOperationIds: string[];
  
  relationshipStatus: string;    // Label e.g., "Militant Bloc Ally", "Proxy Rivalry", "Symmetric Trade Dependency"
  forecastSignals: ForecastSignal[];
}

export interface RelationshipSnapshot {
  tick: number;
  scenarioId: ScenarioId;
  edges: Omit<GraphEdge, 'changeReasons'>[];
}


// FROM influence.ts
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

export interface AdversarialDeceptionCampaign {
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
  deceptionCampaigns: AdversarialDeceptionCampaign[];
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


// FROM mirror.ts
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
  confrontationPlayed: boolean;
}



// FROM operative.ts
export type OperativeSkill =
  | 'SURVEILLANCE'
  | 'RECRUITMENT'
  | 'SABOTAGE'
  | 'INFILTRATION'
  | 'TECHNICAL_COLLECTION'
  | 'COUNTER_SURVEILLANCE'
  | 'EXFILTRATION_SUPPORT'
  | 'INFLUENCE_PERSUASION'
  | 'DECEPTION_HANDLING'
  | 'REGION_NAVIGATION';

export type CoverType =
  | 'DIPLOMATIC'
  | 'COMMERCIAL'
  | 'MEDIA'
  | 'ACADEMIC'
  | 'HUMANITARIAN'
  | 'CRIMINAL'
  | 'CUTOUT';

export type MotivationChannel =
  | 'IDEOLOGY'
  | 'MONEY'
  | 'COERCION'
  | 'EGO';

export type OperativeState =
  | 'ACTIVE'
  | 'DORMANT'
  | 'COMPROMISED'
  | 'BURNED'
  | 'EXTRACTED';

export interface RegionFamiliarity {
  regionId: string; // e.g., 'NORTH_AMERICA', 'EAST_ASIA'
  score: number;    // 0-100
}

export interface OperationalHistoryEntry {
  tick: number;
  missionType: string;
  success: boolean;
  notes: string;
}

export interface Operative {
  id: string;
  name: string;
  alias: string;
  trueIdentity: string | null;
  cellId: string | null;
  handlerId: string | null;
  
  regionOfOperation: string;
  regionFamiliarity: Record<string, number>; // Object mapping region ID to 0-100 score
  
  coverType: CoverType;
  coverQuality: number; // 0-100
  coverExposureRisk: number; // 0-100
  coverConsistency: number; // 0-100
  
  skills: Record<OperativeSkill, number>; // Mapping skill to 0-100 score
  
  loyalty: number; // 0-100
  stress: number;  // 0-100
  burnRisk: number; // 0-100
  exposureLevel: number; // 0-100
  accessLevel: number; // 0-100
  
  motivationProfile: Record<MotivationChannel, number>; // 0-100 weight per channel
  leverageProfile: string[]; // specific tags of leverage
  recruitmentSource: MotivationChannel;
  
  lastContactTick: number;
  lastMissionTick: number;
  
  state: OperativeState;
  
  compromiseHistory: { tick: number; reason: string }[];
  missionHistory: OperationalHistoryEntry[];
  
  operationalValue: number; // 0-100
  reliability: number; // 0-100
  volatility: number; // 0-100
  
  currentAssignment: string | null;
}

export interface Handler {
  id: string;
  name: string;
  codeName: string;
  trustLevel: number; // 0-100
  operationalStyle: 'CAUTIOUS' | 'AGGRESSIVE' | 'METHODICAL' | 'ERRATIC';
  riskTolerance: number; // 0-100
  disciplineScore: number; // 0-100
  state: 'ACTIVE' | 'COMPROMISED' | 'BURNED';
}

export interface Cell {
  id: string;
  name: string; // E.g. "Orion Group"
  regionScope: string;
  missionScope: string;
  handlerId: string;
  exposureBoundary: number; // 0-100 resistance to cascade failure
  crossContactRules: 'STRICT' | 'PERMISSIVE' | 'ISOLATED';
  fallbackProtocol: string;
}

export interface CompartmentalizationGraph {
  nodes: string[]; // operative IDs
  links: { source: string; target: string; type: 'KNOWS' | 'CONTACT' | 'FUNDS' }[];
}


// FROM regimePressure.ts
export type PressureActionType = 'PROTEST' | 'COUP' | 'ELECTION_INTERFERENCE' | 'OPPOSITION_FUNDING' | 'TARGETED_REMOVAL';
export type EliteFactionAlignment = 'PRO_REGIME' | 'MODERATE' | 'OPPOSITION' | 'MILITARY';

export interface NationRegimePressureState {
  // Target regime stats
  legitimacy: number;           // 0-100
  eliteCohesion: number;        // 0-100
  oppositionStrength: number;   // 0-100
  protestTemperature: number;     // 0-100
  securityForceLoyalty: number; // 0-100
  mediaControl: number; // 0-100
  blowbackSensitivity: number;  // 0-100

  // Campaigns & Factions
  activeCampaigns: PressureCampaign[];
  blowbackHistory: BlowbackMemory[];
  eliteFactions: Record<string, EliteFaction[]>;
}

export interface PressureCampaign {
  id: string;
  type: PressureActionType;
  initiatorId: string;
  targetCountryId: string;
  phase: number;
  maxPhases: number;
  progress: number; // 0-100 progress inside current phase
  exposure: number; // 0-100
  risk: number; // 0-100 (probability of failure/blowback tick-by-tick)
  investment: number; // Money/resources committed
  assignedOperatives: string[]; // IDs of assigned agents
  state: 'PREPARING' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'EXPOSED';
  consequences: any; // specific data based on type
  tickStarted: number;
  lastUpdatedTick: number;
}

export interface NationEliteFaction {
  id: string;
  name: string;
  alignment: EliteFactionAlignment;
  power: number; // 0-100
  loyalty: number; // 0-100
  grievance: number; // 0-100
}

export interface BlowbackMemory {
  id: string;
  type: string;
  initiatorId: string;
  magnitude: number; // 1-100
  tickOccurred: number;
  decayRate: number; // per tick
}


// FROM sanctions.ts
export type SanctionsTierType = 'TIER_1_TARGETED' | 'TIER_2_SECTORAL' | 'TIER_3_FINANCIAL_TRADE' | 'TIER_4_TOTAL_EXCLUSION';

export type CoalitionMemberRole = 'LEAD_SPONSOR' | 'FULL_PARTICIPANT' | 'RELUCTANT_PARTICIPANT' | 'PARTIAL_COMPLIANT' | 'SPOILER_BLOCKER' | 'SILENT_ENABLER';

export type SanctionsCampaignStatus = 'PROPOSED' | 'ASSEMBLING' | 'ACTIVE' | 'ESCALATING' | 'DEGRADING' | 'SUSPENDED' | 'COLLAPSED';

export interface SanctionsMeasure {
  id: string;
  name: string;
  tier: SanctionsTierType;
  description: string;
  coerciveImpact: number; // 0-100 baseline target pressure
  blowbackCost: number;   // 0-100 baseline cost to initiator/coalition
  riskOfRetaliation: number; // 0-150 scaling risk
  isActive: boolean;
}

export interface CoalitionMemberCommitment {
  countryId: string;
  role: CoalitionMemberRole;
  alignmentAffinity: number;     // 0-100 affinity with initiator
  economicExposureToTarget: number; // 0-100 trade/energy dependency
  domesticSatisfactionImpact: number; // blowback from active sanctions
  allyFatigueLevel: number;      // 0-100 dynamic fatigue
  participationWillingness: number; // 0-100 calculated probability of signing
  isParticipating: boolean;
}

export interface EvasionChannel {
  id: string;
  name: string;
  type: 'GRAY_MARKET' | 'PAYMENT_WORKAROUND' | 'PARTNER_REORIENTATION';
  partnerCountryId: string;      // intermediary country
  capacityMtoeOrValueB: number;  // maximum volume leaked through this channel
  enforcementLeakagePct: number; // 0-100 efficiency of workaround
  activeSinceTick: number;
  isShutDown: boolean;
}

export interface SanctionTargetProfile {
  countryId: string;
  baseResilience: number;        // 0-100
  unrestTriggerLevel: number;    // 0-100popular unrest before regime stress flares
  primaryEvasionIncentive: number; // 0-100
  foreignCurrencyWorkaroundActive: boolean;
  grayMarketsCount: number;
}

export interface SanctionsCampaign {
  id: string;
  name: string;
  initiatorCountryId: string;
  targetCountryIds: string[];
  status: SanctionsCampaignStatus;
  campaignTier: SanctionsTierType;
  activeMeasures: string[]; // measure IDs
  coalitionSupportScore: number; // 0-100 average consensus
  legitimacyPosture: 'HUMANITARIAN' | 'DEFENSIVE' | 'ALLIANCE_SOLIDARITY' | 'LAW_ENFORCEMENT' | 'UNILATERAL_PRESSURE';
  
  // Real-time tracking meters
  targetPressureScore: number;    // 0-100 net pressure on target
  sanctionerBlowbackScore: number; // 0-100 self-harm index
  allyFatigueScore: number;       // 0-100 dynamic coalition strain
  complianceStrength: number;     // 0-100 (deterrent to evasion, high is better)
  evasionIntensity: number;       // 0-100 (leakage bypass strength)

  startTick: number;
  lastUpdatedTick: number;
  publicJustification: string;

  // Coalition matrix
  members: Record<string, CoalitionMemberCommitment>;
  // Evasion channels unlocked
  evasionChannels: EvasionChannel[];
}

export interface SanctionsPreview {
  tier: SanctionsTierType;
  expectedCoalitionSupport: number; // 0-100
  complianceStrengthAssumption: number; // 0-100
  likelyTargetPressure: number; // 0-100
  expectedEvasionLeakage: number; // 0-100
  sanctionerBlowback: number; // 0-100
  allyFatigueRisk: number; // 0-100
  gdpImpactOnTargetPct: number;
  inflationImpactOnInitiatorPct: number;
}

export interface SanctionsIncident {
  id: string;
  tick: number;
  type: 
    | 'SANCTIONS_CAMPAIGN_INITIATED'
    | 'SANCTIONS_TIER_ESCALATED'
    | 'COALITION_SUPPORT_RISING'
    | 'COALITION_SUPPORT_FALTERING'
    | 'GRAY_MARKET_EVASION_DETECTED'
    | 'ALTERNATIVE_PAYMENT_ROUTE_EXPANDING'
    | 'PARTNER_REORIENTATION_ACCELERATING'
    | 'SANCTIONER_BLOWBACK_RISING'
    | 'ALLY_FATIGUE_THRESHOLD_CROSSED'
    | 'COALITION_LEVEL_EXCLUSION_ACTIVE'
    | 'SANCTIONS_MITIGATED_OR_SUSPENDED';
  campaignId: string;
  actorId: string;
  targetId?: string;
  summary: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}


// FROM softPower.ts
export type SoftPowerVectorType = 
  | 'HUMANITARIAN_LEGITIMACY' 
  | 'ASPIRATIONAL_MODERNITY' 
  | 'EDUCATIONAL_PRESTIGE' 
  | 'ENTERTAINMENT_ATTRACTION' 
  | 'CIVILIZATIONAL_PRESTIGE' 
  | 'MORAL_AUTHORITY' 
  | 'DEVELOPMENT_COMPETENCE' 
  | 'ANTI_IMPERIAL_CREDIBILITY' 
  | 'INNOVATION_PRESTIGE' 
  | 'SPORTS_PRESTIGE' 
  | 'NARRATIVE_REACH';

export type AidProgramType = 
  | 'HUMANITARIAN_RELIEF' 
  | 'PUBLIC_HEALTH_SUPPORT' 
  | 'FOOD_AID' 
  | 'REFUGEE_SUPPORT' 
  | 'TECHNICAL_ASSISTANCE' 
  | 'RECONSTRUCTION_SUPPORT' 
  | 'CONCESSIONAL_LOAN' 
  | 'PURE_GRANT' 
  | 'INFRASTRUCTURE_FINANCING' 
  | 'CLIMATE_RESILIENCE' 
  | 'EDUCATION_SECTOR';

export type InvestmentDiplomacyType = 
  | 'STRATEGIC_INFRASTRUCTURE' 
  | 'INDUSTRIAL_PARK' 
  | 'DIGITAL_INFRASTRUCTURE' 
  | 'ENERGY_INFRASTRUCTURE' 
  | 'PORT_RAIL_LOGISTICS' 
  | 'EDUCATION_CAMPUS' 
  | 'MEDIA_CULTURAL_CENTER' 
  | 'PRESTIGE_ARCHITECTURE';

export type PrestigeEventType = 
  | 'OLYMPICS_MEGA' 
  | 'REGIONAL_GAMES' 
  | 'WORLD_EXPO' 
  | 'GLOBAL_SUMMIT_HOSTING' 
  | 'DONOR_CONFERENCE_HOSTING' 
  | 'CLIMATE_SUMMIT_HOSTING' 
  | 'CULTURAL_PRESTIGE_FESTIVAL';

export type BoycottStyle = 
  | 'NONE' 
  | 'SYMBOLIC_DIPLOMATIC_BOYCOTT' 
  | 'FULL_BOYCOTT' 
  | 'PARTIAL_TEAM' 
  | 'SPONSOR_WITHDRAWAL' 
  | 'MEDIA_COUNTER_CAMPAIGN';

export type DiasporaActivationMode = 
  | 'LOBBYING_HOST_GOVERNMENT' 
  | 'REMITTANCE_MOBILIZATION' 
  | 'BUSINESS_CORRIDOR' 
  | 'NARRATIVE_AMPLIFICATION' 
  | 'PROTEST_SOLIDARITY' 
  | 'SANCTIONS_EVASION_BRIDGE';

export type AudienceSegmentId = 
  | 'MASS_PUBLIC' 
  | 'URBAN_YOUTH' 
  | 'RURAL_CONSERVATIVES' 
  | 'ELITE_TECHNOCRATS' 
  | 'MILITARY_ESTABLISHMENT' 
  | 'CIVIL_SOCIETY' 
  | 'DIASPORA_COMMUNITIES' 
  | 'BUSINESS_ELITES' 
  | 'UNIVERSITY_POPULATIONS' 
  | 'REGIME_LOYALISTS';

export interface SoftPowerVector {
  type: SoftPowerVectorType;
  score: number; // 0-100
  recentDelta: number;
}

export interface CulturalReachChannel {
  id: string;
  name: string;
  medium: 'BROADCASTER' | 'DIGITAL_PLATFORM' | 'NEWS_SYNDICATE' | 'STREAMING_ENTERTAINMENT' | 'LANGUAGE_INSTITUTE';
  targetCountryId: string;
  penetrationRate: number; // 0-100%
  censored: boolean;
}

export interface MediaReachNetwork {
  channels: CulturalReachChannel[];
  globalBroadcasterReach: number; // 0-100
  digitalFootprintScore: number; // 0-100
}

export interface AudienceSegmentProfile {
  id: AudienceSegmentId;
  name: string;
  trustFactor: number; // 0-100
  receptivity: number; // 0-100
  dissidentSymphaty: number; // 0-100
}

export interface NarrativeResonanceState {
  countryId: string;
  segments: Record<AudienceSegmentId, AudienceSegmentProfile>;
  priorTrust: number; // 0-100
  fatigueWithForeignInfluence: number; // 0-100
}

export interface CulturalInfluenceIndex {
  languageReach: number; // 0-100
  mediaPenetration: number; // 0-100
  educationAttractiveness: number; // 0-100
  culturalBrandRecognition: number; // 0-100
  entertainmentExportStrength: number; // 0-100
  eliteFamiliarity: number; // 0-100
  symbolicPrestige: number; // 0-100
  trustLegitimacyResonance: number; // 0-100
  diasporaAmplification: number; // 0-100
  globalCompositeScore: number; // 0-100
}

export interface CulturalInfluenceProfile {
  countryId: string;
  index: CulturalInfluenceIndex;
  regionalReachMultiplier: Record<string, number>; // targetCountryId -> multiplier (e.g. 0.5 to 1.5)
  vectors: Record<SoftPowerVectorType, SoftPowerVector>;
}

export interface AidProgramRecord {
  id: string;
  sourceCountryId: string;
  targetCountryId: string;
  type: AidProgramType;
  fundingAmountB: number;
  unresolvedTicks: number;
  tiedProcurement: boolean;
  politicallyConditional: boolean;
  corruptionLeakage: number; // percentage 0-100
  repaymentResentment: number; // 0-100 scaling or index
  goodwillRemaining: number; // 0-100
}

export interface InvestmentDiplomacyRecord {
  id: string;
  sourceCountryId: string;
  targetCountryId: string;
  type: InvestmentDiplomacyType;
  fundingB: number;
  deliveryProgress: number; // 0-100
  eliteGratitude: number; // 0-100
  dependencyIndex: number; // 0-100
  corruptionRisk: number; // 0-100
  futureSovereignLeverage: number; // 0-100
}

export interface PrestigeEventRecord {
  id: string;
  title: string;
  type: PrestigeEventType;
  hostCountryId: string;
  tickScheduled: number;
  boycottingNations: Record<string, BoycottStyle>; // countryId -> style
  scandalOccurred: boolean;
  narrativeControlIndex: number; // 0-100
  tourismCapitalInflowB: number;
  overallPrestigeYield: number; // 0-100
}

export interface EliteFormationPipeline {
  countryId: string;
  alumniInCabinet: number; // counter of alumni in host or foreign cabinets
  technocratAffinitiesCount: number;
  militaryCollegeExchangesCount: number;
}

export interface ExchangeProgramRecord {
  id: string;
  sourceCountryId: string;
  targetCountryId: string;
  activeTicks: number; // accumulated duration (e.g. 10–20 ticks requirement)
  scholarshipsAllocatedCount: number;
  durableInfluenceScore: number; // 0-100
  brainDrainMultiplier: number; // 0.1 to 2.0
  pipeline: EliteFormationPipeline;
}

export interface DiasporaNetworkProfile {
  hostCountryId: string;
  sizeMillions: number;
  wealthRemittanceCapacity: number; // 0-100 scale
  politicalMobilizationScore: number; // 0-100
  assimilationScore: number; // 0-100
  homelandLoyaltyScore: number; // 0-100
  vulnerabilityToIntimidation: number; // 0-100
}

export interface DiasporaActivationRecord {
  id: string;
  sponsorCountryId: string;
  hostCountryId: string;
  activationMode: DiasporaActivationMode;
  successIndex: number; // 0-100
  backlashSeverity: number; // 0-100
  hostCountrySuspicionDelta: number; // 0-100 increase
  active: boolean;
}

export interface LegitimacyBonusRecord {
  countryId: string;
  humanitarianLegitimacy: number; // 0-100
  moralAuthority: number; // 0-100
  developmentalCredibility: number; // 0-100
  culturalPrestige: number; // 0-100
  eliteTrust: number; // 0-100
  antiImperialCredibility: number; // 0-100
}

export interface SymbolicPressureEvent {
  id: string;
  awardTitle: string; // e.g. "Global Human Rights Prize"
  recipientDissidentId: string;
  adversaryCountryId: string;
  moralPrestigeTransferred: number; // 0-100
  regimeEmbarrassmentIndex: number; // 0-100
  crackdownBacklashSeverity: number; // 0-100
  expiryTick: number;
}

export interface InfluenceAccumulationRecord {
  countryId: string;
  cumulativeTractionPoints: number;
  ticksActive: number;
}

export interface InfluenceDecayRecord {
  vectorType: SoftPowerVectorType;
  lastActiveTick: number;
  decayRateFactor: number; // e.g. 0.95 per tick
}

export interface PublicPrestigeMemory {
  id: string;
  countryId: string;
  description: string;
  tickRegistered: number;
  prestigeYieldPoints: number; // can be negative for scandals
  hypocrisyPenaltyActive: boolean;
}

export interface SoftPowerActionPreview {
  targetedAudiences: AudienceSegmentId[];
  shortTermInfluenceGain: number; // 0-100
  longTermInfluenceGain: number; // 0-100
  legitimacyBonusPotential: number; // 0-50
  backlashRiskIndex: number; // 0-100
  corruptionLeakageRisk: number; // 0-100
  boycottProbability: number; // 0-100
  fiscalCostB: number;
}

export interface InfluenceConversionRecord {
  id: string;
  countryId: string;
  targetCountryId: string;
  convertedAsso: 'TREATY_FORMATION' | 'SANCTIONS_ASSEMBLY' | 'CRISIS_NARRATIVE' | 'BLOC_LEAD_CLAIM';
  efficiencyRate: number; // 0-100
}

export interface SoftPowerBacklashRecord {
  id: string;
  offendingCountryId: string;
  targetCountryId: string;
  reason: 
    | 'AID_COERCIVE_TIE' 
    | 'PRESTIGE_CORRUPTION_SCANDAL' 
    | 'DIASPORA_OVER_MOBILIZATION' 
    | 'EDUCATION_POLITICIZATION' 
    | 'DOUBLE_STANDARD_HYPOCRISY' 
    | 'MEDIA_CREDIBILITY_COLLAPSE';
  severity: number; // 0-100
}


// FROM sovereign.ts
// Sovereign Agent Core Types (Module 4.1)

export interface IdeologyProfile {
  liberalInstitutionalist: number;     // 0-100, rules-based, global governance
  nationalistSovereigntist: number;    // 0-100, nation-first, autonomy
  revolutionaryRevisionist: number;    // 0-100, break current order
  pragmaticTransactional: number;      // 0-100, deal-making, no deep loyalty
  authoritarianPluralistic: number;    // 0-100, centralized ruling vs open polity
  religiousSecularGovernance: number;   // 0-100, religious vs secular laws
  civilizationalPosture: number;       // 0-100, civilizational defense/exceptionalism
  universalistVsParticularist: number;  // 0-100, export values vs respect local styles
  description: string;
}

export type EconomicDevelopmentModelTendency =
  | 'EXPORT_MANUFACTURING'
  | 'RENTIER_COMMODITY'
  | 'FINANCIALIZED_SERVICES'
  | 'DEVELOPMENTAL_INDUSTRIAL_POLICY'
  | 'TECHNOLOGY_INNOVATION'
  | 'AID_REMITTANCE_DEPENDENT'
  | 'SANCTIONS_EVASION_ADAPTIVE'
  | 'MILITARIZED_COMMAND'
  | 'MIXED_MARKET_DEVELOPMENTALISM';

export interface EconomicDevelopmentModelProfile {
  tendency: EconomicDevelopmentModelTendency;
  exportDependencyPct: number;    // 0-100
  rentierConcentrationPct: number; // 0-100
  sanctionsResilience: number;    // 0-100
  stateControlPct: number;        // 0-100
  description: string;
}

export type SecurityDoctrineTendency =
  | 'FORWARD_DEFENSE'
  | 'DETERRENCE_HEAVY'
  | 'STRATEGIC_AMBIGUITY'
  | 'FORTRESS_DEFENSE'
  | 'EXPEDITIONARY_INTERVENTIONISM'
  | 'PROXY_COMPETITION'
  | 'ESCALATION_DOMINANCE'
  | 'LIMITED_WAR_RESTRAINT'
  | 'NUCLEAR_SHADOW_CAUTION'
  | 'MARITIME_CHOKEPOINT'
  | 'INTERNAL_SECURITY_FIRST';

export interface SecurityDoctrineProfile {
  tendency: SecurityDoctrineTendency;
  forcePostureOffensive: number; // 0-100
  escalationThreshold: number;   // 0-100
  allianceCommitment: number;    // 0-100
  covertPropensity: number;      // 0-100
  description: string;
}

export type RegionalAmbitionTendency =
  | 'STATUS_QUO_BALANCER'
  | 'LOCAL_HEGEMON_ASPIRANT'
  | 'REVISIONIST_CHALLENGER'
  | 'PROTECTOR_PATRON'
  | 'AUTONOMY_MIDDLE_POWER'
  | 'SHELTERED_SMALL_STATE'
  | 'BRIDGE_MEDIATOR'
  | 'OFFSHORE_BALANCER';

export interface RegionalAmbitionProfile {
  tendency: RegionalAmbitionTendency;
  expansionistDesire: number; // 0-100
  blocLeadershipInterest: number; // 0-100
  mediationDisposition: number;   // 0-100
  description: string;
}

export type LeadershipVolatilityTendency =
  | 'INSTITUTIONAL_CONTINUITY'
  | 'FACTIONAL_INSTABILITY'
  | 'POPULIST_IMPROVISATION'
  | 'COUP_SUSCEPTIBILITY'
  | 'SUCCESSION_INSTABILITY'
  | 'PURGING_TENDENCY'
  | 'CABINET_FRAGMENTATION'
  | 'CRISIS_OVERREACTION';

export interface LeadershipVolatilityProfile {
  tendency: LeadershipVolatilityTendency;
  swingRate: number;              // 0-100 speed of priority pivot under stress
  unpredictabilityIndex: number;  // 0-100
  regimeSustenanceUrgency: number;// 0-100 focus on self-preservation
  description: string;
}

export interface NationalIdentityVector {
  countryId: string;
  ideology: IdeologyProfile;
  economy: EconomicDevelopmentModelProfile;
  security: SecurityDoctrineProfile;
  regional: RegionalAmbitionProfile;
  volatility: LeadershipVolatilityProfile;
}

export type StrategicGoalClass =
  | 'SURVIVAL'
  | 'DETERRENCE'
  | 'PRESTIGE'
  | 'ECONOMIC_RECOVERY'
  | 'ALLIANCE_PRESERVATION'
  | 'ADVERSARY_WEAKENING'
  | 'REGIONAL_DOMINANCE'
  | 'TERRITORIAL_DEFENSE'
  | 'SANCTIONS_RELIEF'
  | 'INSTITUTIONAL_LEGITIMACY'
  | 'REGIME_STABILIZATION'
  | 'MILITARY_BUILDUP'
  | 'TECHNOLOGICAL_CATCH_UP'
  | 'SOFT_POWER_ACCUMULATION'
  | 'COVERT_PREPARATION';

export interface StrategicGoal {
  id: string;
  countryId: string;
  goalClass: StrategicGoalClass;
  title: string;
  priorityScore: number; // 0-100
  targetCountryId?: string;
  ticksActive: number;
  successCondition: string;
}

export interface GoalPriorityRecord {
  goalId: string;
  basePriority: number;
  threatMultiplier: number;
  opportunityBonus: number;
  identityFitWeight: number;
  finalScore: number;
}

export interface GoalStack {
  countryId: string;
  activeGoals: StrategicGoal[];
  priorityRecords: GoalPriorityRecord[];
}

export type PlanStepAction =
  | 'BUILD_ECONOMIC_LEVERAGE'
  | 'CULTIVATE_ALLIANCE'
  | 'SHIFT_MILITARY_POSTURE'
  | 'TEST_RED_LINES'
  | 'PREPARE_SANCTIONS'
  | 'DIPLOMATIC_PRESSURE'
  | 'MOBILIZE_COVERT_ASSETS'
  | 'DISINFORMATION_INTELLIGENCE'
  | 'ACCUMULATE_LEGAL_CASE'
  | 'EXPLOIT_MARKET_DEPENDENCY'
  | 'SIGNAL_CONCILIATION'
  | 'DEESCALATE_BUY_TIME';

export interface PlanStep {
  stepIndex: number;
  actionType: PlanStepAction;
  targetCountryId?: string;
  description: string;
  durationTicks: number;
  executionProgressTicks: number;
  completed: boolean;
}

export interface PlanCommitmentState {
  planningThreshold: number; // 0-100 cost to start
  confidenceScore: number;   // 0-100 estimated confidence in success
  sunkCostWeight: number;    // cumulative ticks and capital invested
  backedDownPenalties: number;// loss of prestige if aborted
}

export interface PlanExecutionState {
  currentStepIndex: number;
  totalSteps: number;
  remainingTicks: number;
  isActive: boolean;
  status: 'PLANNING' | 'EXECUTING' | 'INTERRUPTED' | 'FALLBACK_TRIGGERED' | 'FINISHED' | 'ABORTED';
}

export interface StrategicPlan {
  id: string;
  countryId: string;
  parentGoalIds: string[];
  title: string;
  planningHorizonTicks: number; // 5-15 ticks
  desiredEndState: string;
  steps: PlanStep[];
  prerequisites: string[];
  resourceCostB: number;
  escalationRisk: number; // 0-100
  secrecyScore: number;   // 0-100 (high = invisible in dossiers without deep intel)
  abortConditions: string[];
  successCriteria: string;
  fallbackPathSteps: PlanStep[];
}

export type ReplanningType = 'SOFT_UPDATE' | 'MEDIUM_INTERRUPTION' | 'HARD_INTERRUPTION' | 'EMERGENCY_OVERRIDE';

export interface PlanInterruptionRecord {
  id: string;
  tick: number;
  triggerEvent: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  actionTaken: ReplanningType;
  description: string;
}

export type ReplanningTriggerType =
  | 'WAR_OUTBREAK'
  | 'MILITARY_MOBILIZATION'
  | 'LEADERSHIP_CHANGE'
  | 'TREATY_VIOLATION'
  | 'SANCTIONS_SHOCK'
  | 'MARKET_COLLAPSE'
  | 'ALLIANCE_FRACTURE'
  | 'UNSC_VOTE_VETO'
  | 'CO_OP_EXPOSURE'
  | 'BLOC_ACCESSION'
  | 'DOMESTIC_FISCAL_CRISIS'
  | 'CYBER_ATTACK_ATTRIBUTION'
  | 'PLAYER_ACTION_CROSS_THRESHOLD';

export interface ReplanningTrigger {
  id: string;
  triggerType: ReplanningTriggerType;
  primaryActorCountryId?: string;
  linkedSector: string; // 'military' | 'finance' | 'bloc' | 'treaty' | 'un' | 'cyber'
  detectionThresholdPercent: number;
}

export type ThreatCategory =
  | 'EXISTENTIAL'
  | 'BORDER_SECURITY'
  | 'REGIME_SURVIVAL'
  | 'ECONOMIC_STRANGULATION'
  | 'COVERT_SUBVERSION'
  | 'INSTITUTIONAL_ISOLATION'
  | 'IDEOLOGICAL_CONTAMINATION'
  | 'PRESTIGE_HUMILIATION'
  | 'UNPREDICTABILITY'
  | 'OPPORTUNISM';

export interface ThreatMemoryRecord {
  id: string;
  targetCountryId: string;
  category: ThreatCategory;
  severityScore: number; // 0-100
  description: string;
  launchTick: number;
  lastReinforcedTick: number;
  decayRateIndex: number; // 0.05-0.2
}

export type TrustCategory =
  | 'PUBLIC_LEGITIMACY'
  | 'ELITE_OPERATIONAL'
  | 'STRATEGIC_RELIABILITY'
  | 'INSTITUTIONAL'
  | 'LEADER_PERSONAL';

export interface TrustMemoryRecord {
  id: string;
  targetCountryId: string;
  category: TrustCategory;
  trustScore: number; // 0-100 (high is cooperative, low is betrayer)
  description: string;
  establishedTick: number;
  lastVerifiedTick: number;
  promiseKeptCounter: number;
  promiseBrokenCounter: number;
}

export interface StrategicPerceptionState {
  countryId: string;
  adversaries: { [countryId: string]: boolean };
  reliableAllies: { [countryId: string]: boolean };
  distractionTargets: { [countryId: string]: string }; // descriptions of other states' focus
  perceivedRegionalTensions: number; // 0-100
  apparentDeceptionPostures: { [countryId: string]: 'TRANSPARENT' | 'DECEPTIVE' | 'UNCERTAIN' };
}

export interface OpportunityAssessment {
  targetCountryId: string;
  type: string;
  description: string;
  score: number; // 0-100
  militaryVulnerability: number; // 0-100
  diplomaticIsolation: number; // 0-100
  economicSanctionsFatigue: number; // 0-100
  allianceCohesionRank: number; // 0-100
}

export interface ConstraintAssessment {
  unrestRisk: number; // 0-100
  treasuryStress: number; // 0-100
  readinessDeficit: number; // 0-100
  treatyObligationsCount: number;
  sanctionsPainPercent: number; // 0-100
  recreationalSecurityBuffer: number; // defensive buffer
}

export interface AdversaryModel {
  countryId: string;
  estimatedMilitaryPower: number;
  estimatedNuclearOptionPercent: number;
  escalationRateRating: 'CAUTIOUS' | 'BALANCED' | 'AGGRESSIVE';
  sanctionConfidencePercent: number;
  bluffFrequency: number; // 0-100
}

export interface AllyModel {
  countryId: string;
  loyaltyPercent: number;
  jointResourceBudgetB: number;
  militaryInterventionProbability: number;
}

export interface StrategicLearningRecord {
  tick: number;
  learnedConcept: string;
  affectedThreatWeight: number;
  actionAdjusted: string;
}

export interface AgentIntentSnapshot {
  targetCountryId?: string;
  primaryActiveGoalClass: StrategicGoalClass;
  actionPreviewLabel: string;
  planningHorizonText: string;
  secrecyLevel: 'OPEN' | 'INFERRED' | 'VEILED' | 'CLASSIFIED';
  confidenceRatingPct: number;
}

export interface AgentActionPreview {
  countryId: string;
  actionName: string;
  targetCountryId?: string;
  expectedLaunchTickDelta: number;
}

export interface SovereignAgentState {
  countryId: string;
  identity: NationalIdentityVector;
  goalStack: GoalStack;
  activePlan: StrategicPlan | null;
  planExecution: PlanExecutionState;
  planCommitment: PlanCommitmentState;
  interruptionHistory: PlanInterruptionRecord[];
  threatMemory: ThreatMemoryRecord[];
  trustMemory: TrustMemoryRecord[];
  perception: StrategicPerceptionState;
  opportunities: OpportunityAssessment[];
  constraints: ConstraintAssessment;
  adversaryModels: { [countryId: string]: AdversaryModel };
  allyModels: { [countryId: string]: AllyModel };
  learningLog: StrategicLearningRecord[];
  intentSnapshot: AgentIntentSnapshot;
  actionPreview: AgentActionPreview | null;
  lastReplannedTick: number;
}


// FROM trade.ts
export type StrategicTradeCategory = 
  | 'energy'
  | 'food'
  | 'minerals'
  | 'inputs'
  | 'consumer'
  | 'tech'
  | 'defense'
  | 'pharma'
  | 'services';

export interface TradeLocation {
  x: number; // 0-100 grid mapping
  y: number; // 0-100 grid mapping
}

export type TradeRouteType = 'port' | 'pipeline' | 'corridor' | 'sealane';

export interface RouteNode {
  id: string;
  name: string;
  type: TradeRouteType;
  coordinates: TradeLocation;
  capacityIndex: number; // Scale 0-100 of max capacity flow
  currentUsage: number; // 0 - 100 actual percentage utilization
  vulnerabilityScore: number; // 0-100 chokepoint / static risk
  operationalStatus: 'OPERATIONAL' | 'STRESSED' | 'DISRUPTED' | 'BLOCKED';
  controllingCountryIds: string[];
  description: string;
}

export interface RouteSegment {
  id: string;
  name: string;
  type: TradeRouteType;
  originNodeId: string;
  destNodeId: string;
  capacityIndex: number;
  status: 'OPERATIONAL' | 'STRESSED' | 'DISRUPTED' | 'BLOCKED';
  chokepointRisk: number; // 0-100
  controlCountryId?: string;
  description: string;
  geoPoints?: TradeLocation[]; // Midpoint offsets for map routing curved lines
}

export interface RoutePath {
  id: string;
  name: string;
  routeType: TradeRouteType;
  segments: RouteSegment[];
  totalVulnerabilityScore: number; // Calculated combo
  isBlocked: boolean;
  reroutingCostMultiplier: number; // e.g. 1.35 if alternate is forced
}

export type RestrictionLevel = 'NONE' | 'TARIFFS' | 'SECTORAL' | 'TOTAL_RUPTURE';

export interface TradeRestriction {
  level: RestrictionLevel;
  tariffRate: number; // Percentage e.g. 25 for 25% tariff
  restrictedCategories: StrategicTradeCategory[];
  enforcedByActorCountryId: string;
}

export interface TradeLink {
  categoryId: StrategicTradeCategory;
  direction: 'IMPORT' | 'EXPORT';
  weightShare: number; // 0-100 percentage of category in bilateral mix
  valueIndexB: number; // Absolute annual value in $B
  strategicImportance: number; // 1-10 priority classification
  substitutability: number; // 1-10 difficulty to find alternative (closer to 10 is harder)
  routeDependence: number; // 1-10 vulnerability to route disruption
  disruptionSensitivity: number; // 0-100 multiplier of how fast it impacts GDP / Inflation
  policyExposure: number; // 0-100 susceptibility to coercion
}

export interface BilateralTradeProfile {
  exporterCountryId: string;
  importerCountryId: string;
  totalTradeWeight: number; // Overall weight
  totalTradeValueB: number; // Cumulative value in $B
  categoryBreakdown: TradeLink[];
  importDependenceScore: number; // calculated 0-100 exposure index for importer
  exportDependenceScore: number; // calculated 0-100 exposure index for exporter
  substitutionDifficulty: number; // blended weighted rating
  strategicSensitivity: number; // blended weighted rating
  routeIds: string[]; // Active route segment or node path IDs carrying this flow
  currentRestrictionLevel: RestrictionLevel;
  currentTariffPressure: number; // ACTIVE tariff rate imposed %
  restrictedCategories: StrategicTradeCategory[];
  bilateralTradeTrend: 'EXPANDING' | 'STABLE' | 'DECLINING' | 'COLLAPSED';
  lastUpdatedTick: number;
}

export interface TradeWarCampaign {
  id: string;
  actorCountryId: string;
  targetCountryId: string;
  escalationStage: number; // 0 = negotiations, 1 = tariffs, 2 = sectoral restriction, 3 = total rupture
  activeTariffRate: number;
  restrictedCategories: StrategicTradeCategory[];
  provocationScore: number; // 0-100 conflict intensity index
  intelligenceSummary: string;
  retaliationLikelihood: number; // 0-100
  history: { tick: number; actionSummary: string }[];
}

export interface RouteDisruptionRecord {
  routeId: string;
  severity: number; // 0-100
  disruptedByCategory: StrategicTradeCategory[];
  isRerouted: boolean;
  activeReroutePathId?: string;
  reroutingDelayTicks: number;
  costSurchargeB: number;
  summary: string;
}

export interface TradeDependencySummary {
  countryId: string;
  topImportPartners: { partnerCountryId: string; valueB: number; dependenceScore: number }[];
  topExportPartners: { partnerCountryId: string; valueB: number; dependenceScore: number }[];
  routeVulnerabilityIndex: number; // 0-100 index of route-dependent exposure
  tradeConcentrationRatio: number; // Herfindahl index style concentration 0-100
  coerciveLeverageScore: number; // Overall export asymmetrical dependency leverage
}

export interface TradeExposureScore {
  gdpImpactAtRiskB: number;
  criticalShortageRiskScore: number; // 0-100
  inflationExposureScore: number; // 0-100
  primaryVulnerabilityCategory: StrategicTradeCategory;
}

export interface RerouteOption {
  originalRouteId: string;
  alternateRouteId: string;
  capacityAvailableIndex: number;
  additionalCostFactor: number; // e.g. 1.25 (+25% shipping delay/fees)
  feasibilityIndex: number; // 0-100 approval/geopolitics score
}

export interface TradeIncident {
  id: string;
  tick: number;
  type: 'TARIFF_ALERT' | 'SECTORAL_EMBARGO' | 'ROUTE_DISRUPTION' | 'COERCIVE_LEVERAGE_PRESSURE' | 'REROUTE_INCIDENT';
  actorCountryId: string;
  targetCountryId?: string;
  routeId?: string;
  summary: string;
  economicImpactRating: 'MINIMAL' | 'STRESSED' | 'SEVERE';
}


// FROM treaty.ts

export interface TreatyObligation {
  id: string;
  category: 'MILITARY' | 'ECONOMIC' | 'INTELLIGENCE' | 'SANCTIONS' | 'CYBER' | 'POSTURE' | 'BASE_ACCESS';
  description: string;
  scope: string; // e.g. "Mutual defense on sovereign breach", "Tariff flat rate of 5%"
  triggerCondition: string;
  observability: 'PUBLIC' | 'CONFIDENTIAL' | 'SECRET';
  complianceScore: number; // 0-100
  violationSeverityWeight: number; // 0-100
  attachedPenalties: string[]; // Penalty ID references
}

export interface TreatyDurationProfile {
  startTick: number;
  durationTicks: number | null; // null for indefinite
  probationaryTicksEndTime: number | null;
  renewalWindowStartTicksDelta: number; // Ticks before expiration where negotiation/renewal is active
  sunsetClauseDescription: string | null;
  reviewIntervalTicks: number | null;
  lastReviewTick: number | null;
  withdrawalNoticeTicks: number; // Ticks of notice required to exit honorably
}

export interface TreatyPenaltyProfile {
  id: string;
  type: 'CREDIBILITY_DEGRADATION' | 'TARIFF_SNAPBACK' | 'COLLAPSE' | 'MILITARY_MOBILIZATION' | 'SANCTIONS_ALIGNMENT' | 'FINANCIAL_RESTRAINT';
  severity: 'SOFT' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  description: string;
  automaticTriggerTickCount: number;
}

export interface TreatyHiddenProtocol {
  id: string;
  title: string;
  clauseSummaryPublic: string; // What the public thinks this section says
  clauseSummaryPrivate: string; // The real hidden commitment/exemption
  signatoriesAllowed: string[]; // Countries privy to this protocol
  leverageOffset: number; // Leverage value added to negotiations
  exposed: boolean;
  exposureImpactScore: number; // Credibility penalty multiplier if secret is leaked
}

export interface TreatyInspectionRule {
  id: string;
  agencyType: 'UN_INSPECTORS' | 'JOINT_MILITARY' | 'SATELLITE_SURVEILLANCE' | 'COVERT_INTELLIGENCE';
  frequencyTicks: number;
  lastInspectionTick: number | null;
  evasionDifficulty: number; // 0-100
  effectivenessIndex: number; // 0-100
}

export interface TreatyViolationRecord {
  tick: number;
  treatyId: string;
  treatyName: string;
  violatorId: string;
  clauseId: string;
  severity: 'SOFT' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  breachType: 'TECHNICAL_NON_COMPLIANCE' | 'DELAYED_COMPLIANCE' | 'AMBIGUOUS_INTERPRETATION' | 'CONCEALED_VIOLATION' | 'INTENTIONAL_BREACH' | 'COERCED_BREACH';
  resolved: boolean;
  notes: string;
}

export interface TreatyCredibilityMemory {
  countryId: string;
  overallScore: number; // 0-100
  categoryScores: {
    military: number;
    trade: number;
    inspection: number;
    intelligence: number;
    sanctions: number;
  };
  violationCount: number;
  goodFaithFulfilmentStreak: number;
  history: {
    tick: number;
    treatyId: string;
    treatyName: string;
    actionType: 'FULFILLED' | 'SUSPECTED_BREACH' | 'CONFIRMED_BREACH' | 'CONCEALED_BREACH' | 'OPPORTUNISTIC_EXIT' | 'HONORABLE_EXIT';
    credibilityDelta: number;
    description: string;
  }[];
}

// Complete rich treaty extension of current TreatyState
export interface RichTreatyState extends TreatyState {
  detailedObligations: TreatyObligation[];
  durationProfile: TreatyDurationProfile;
  penalties: TreatyPenaltyProfile[];
  hiddenProtocols: TreatyHiddenProtocol[];
  inspectionRules: TreatyInspectionRule[];
  credibilityImpactToDate: Record<string, number>;
  publicText: string;
  privateText: string;
  isMultilateral: boolean;
  fatigueCostPerTick: number; // How much domestic tension is added per tick for keeping this active
  legacyEffects: string[]; // Past repercussions that stay active after treaty expires or collapses
}

// Negotiation structures
export interface TreatyConcessionItem {
  id: string;
  type: 'TARIFF_REDUCTION' | 'TERRITORIAL_ACCESS' | 'INTELLIGENCE_SHARING' | 'WEAPONS_LIMIT_AGREEMENT' | 'COVERT_FINANCING' | 'SANCTIONS_ALIGNMENT' | 'MUTUAL_DEFENSE_UPGRADE';
  description: string;
  offeredBy: string;
  recipientId: string;
  concessionValue: number; // Relative utility score
  leverageOffset: number;
  politicalCost: number; // 0-100 cost to domestic political capital
}

export interface TreatyOfferPackage {
  title: string;
  type: 'ALLIANCE' | 'NON_AGGRESSION' | 'TRADE' | 'DENUCLEARIZATION' | 'CEASE_FIRE' | 'INTEL_SHARING' | 'BASE_ACCESS';
  proposerId: string;
  recipientId: string;
  publicTextSummary: string;
  privateTextSummary: string;
  durationTicks: number;
  detailedObligations: TreatyObligation[];
  hiddenProtocols: TreatyHiddenProtocol[];
  offeredConcessions: TreatyConcessionItem[];
  demandedConcessions: TreatyConcessionItem[];
  isMultilateral: boolean;
  secrecyLevel: number; // 0-100
  enforcementStrength: number; // 0-100
}

export interface TreatyCounteroffer {
  id: string;
  roundIndex: number;
  timestampTick: number;
  offeredBy: string;
  package: TreatyOfferPackage;
  justificationText: string;
}

export interface TreatyRedLineProfile {
  id: string;
  category: 'TERRITORY' | 'MILITARY_EXPANSION' | 'SECRECY_LEAK' | 'TARIFFS' | 'INSPECTIONS' | 'INTELLIGENCE_VIOLATION' | 'COVERT_AGREED_LIMITS';
  description: string;
  associatedCountryId: string;
  severity: number; // Trigger threshold
  currentTriggerScore: number;
  breachEventDescription: string;
}

export interface TreatyBargainingLeverageState {
  militaryBalanceRatio: number; // Relative balance
  sanctionsPressureIndex: number; // 0-100
  tradeDependencePct: number; // 0-100
  energyDependencePct: number; // 0-100
  financialStressIndex: number; // 0-100
  allianceSupportRating: number; // 0-100
  urgencyAsymmetryFactor: number; // Positive = player urgent, negative = adversary urgent
  intelligenceAdvantageScore: number; // 0-100 based on Sigint/Humint
  currentCredibilityRating: number; // 0-100
  domesticStabilityBuffer: number; // 0-100
  treatyFatigueIndex: number; // 0-100
}

export interface TreatyNegotiationLog {
  tick: number;
  roundIndex: number;
  actorId: string;
  action: 'PROPOSAL' | 'COUNTEROFFER' | 'RED_LINE_SIGNALED' | 'CONCESSION_TRADED' | 'ACCEPTED' | 'WALKED_AWAY';
  description: string;
}

export interface TreatyNegotiationSession {
  id: string;
  title: string;
  playerId: string;
  adversaryId: string;
  stage: 'INITIAL_PROPOSAL' | 'CONCESSION_TRADING' | 'RED_LINE_ALERT' | 'DRAFT_FINAL' | 'COMPLETE' | 'FAILED_LIMIT' | 'WALKED_AWAY';
  currentOfferPackage: TreatyOfferPackage;
  negotiationHistory: TreatyCounteroffer[];
  negotiationLogs: TreatyNegotiationLog[];
  adversaryRedLines: TreatyRedLineProfile[];
  playerAssessedLeverage: TreatyBargainingLeverageState;
  zoneOfPossibleAgreementEstimated: {
    overlapExisted: boolean;
    confidenceLevel: number;
    frictionPoints: string[];
    partnerPriorities: string[];
    feasibilityRating: number; // 0-100
  };
  roundsRemaining: number;
  deadlineTicks: number; // Crisis duration / timer pressure count
  provisionalAccepted: boolean;
}

export interface TreatyLegacyEffect {
  id: string;
  sourceTreatyId: string;
  originalName: string;
  type: 'SCARRED_TRUST' | 'INSTITUTIONAL_PRECEDENT' | 'TERRITORIAL_PRECEDENT' | 'MILITARY_DOCTRINE_RESTRICTION' | 'TRADE_SKEW_LEGACY';
  durationTicksRemaining: number;
  description: string;
  opinionModValue: number;
  economicTractionFactor: number;
}


// FROM un.ts
export interface ResolutionClause {
  id: string;
  category: 'CONDEMN' | 'DEMAND_CEASEFIRE' | 'PEACEKEEPING' | 'NO_FLY_ZONE' | 'ARMS_EMBARGO' | 'ECONOMIC_SANCTIONS' | 'INVESTIGATION_MANDATE' | 'REFER_LEGAL' | 'COMPLIANCE_REPORT';
  description: string;
  targetCountryId: string;
  severityWeight: number; // 0-100 influence on resistance
  reputationalRiskWeight: number; // 0-100 hazard for draft sponsors
}

export type UNSCResolutionStatus = 
  | 'DRAFT'
  | 'SPONSORSHIP_STAGE'
  | 'LOBBYING_STAGE'
  | 'ACTIVE_VOTE'
  | 'PASSED'
  | 'FAILED'
  | 'VETOED'
  | 'SUPERSEDED'
  | 'EXPIRED';

export interface UNSCResolution {
  id: string;
  title: string;
  preambularRationale: string;
  creatorId: string;
  sponsors: string[]; // country IDs
  coSponsors: string[];
  quietBackers: string[];
  clauses: ResolutionClause[];
  status: UNSCResolutionStatus;
  targetCountryId: string;
  roundIntroduced: number;
  tickIntroduced: number;
  tickResolved?: number;
  voteRecord?: UNSCVoteRecord;
  vetoRecord?: VetoRecord;
  enforcementStrength: number; // 0-100
  reviewWindowTicks: number; // Ticks before expiration / reporting
  legalBasisStyle: 'CHARTER_CHAP_VI' | 'CHARTER_CHAP_VII' | 'NORMATIVE_DECLARATION' | 'CUSTOMARY_INTERNATIONAL_LAW';
}

export interface UNSCVoteRecord {
  resolutionId: string;
  votesFor: string[];
  votesAgainst: string[];
  votesAbstain: string[];
  passed: boolean;
  vetoed: boolean;
  vetoingP5s: string[];
  tickHeld: number;
}

export interface VetoRecord {
  resolutionId: string;
  vetoingCountryId: string;
  motive: 'ALLIANCE_PROTECTION' | 'SPHERE_OF_INFLUENCE' | 'ANTI_PRECEDENT' | 'LEGAL_OBJECTION' | 'SOVEREIGNTY_DEFENSE' | 'ANTI_INTERVENTION' | 'TRANSACTIONAL_RETALIATION' | 'STRATEGIC_OBSTRUCTION';
  diplomaticCostIncurred: number; // dynamic capital/influence cost
}

export interface ResolutionLobbyState {
  resolutionId: string;
  lobbyProgressByCountry: Record<string, {
    intention: 'FOR' | 'AGAINST' | 'ABSTAIN';
    leverageApplied: number;
    inducementsPromised: string[];
    reputationLeverageUsed: boolean;
    blocPressureStrength: number;
    argumentStyleUsed: 'HUMANITARIAN' | 'LEGAL' | 'SECURITY' | 'REALPOLITIK';
  }>;
}

export interface DiplomaticDebtEntry {
  id: string;
  debtorId: string; // country that owes the favor
  creditorId: string; // country to whom the favor is owed
  linkedResolutionId?: string;
  dealType: 'VOTE_SUPPORT' | 'VOTE_ABSTAIN' | 'CO_SPONSORSHIP' | 'LEGAL_WITHDRAWAL' | 'SANCTION_LAXITY';
  description: string;
  magnitude: number; // 1-5 scale (1: minor vote, 5: critical veto trade)
  tickIncurred: number;
  horizonTicks: number; // Ticks within which it must be repaid
  isPublic: boolean;
  isHardObligation: boolean;
  status: 'ACTIVE' | 'CALLED_IN' | 'HONORED' | 'DEFAULTED';
  repayTick?: number;
}

export interface EmergencySpecialSessionRecord {
  id: string;
  deadlockedResolutionId: string;
  conveningSponsors: string[];
  votesFor: string[];
  votesAgainst: string[];
  votesAbstain: string[];
  outcomeSummary: string;
  tickConvened: number;
  softPowerShiftMagnitude: number;
}

export interface LegalEvidenceBundle {
  id: string;
  claimType: 'TERRITORY' | 'WAR_CRIMES' | 'SOVEREIGNTY_VIOLATION' | 'TREATY_BREACH' | 'ILLEGAL_FORCE' | 'CYBER_ATTACK';
  targetCountryId: string;
  factualAllegations: string[];
  sourceProvenance: 'SIGINT' | 'IMINT' | 'HUMINT' | 'PUBLIC_NGO' | 'WHISTLEBLOWER' | 'FABRICATED';
  intelligenceConfidence: 'LOW' | 'MEDIUM' | 'HIGH';
  admissibilityScore: number; // 0-100 admissibility proxy
  corroborationState: 'NONE' | 'PARTIAL' | 'SUBSTANTIAL';
  politicalContaminationRisk: number; // 0-100 (high risk means dismissible as propaganda)
  publicityLevel: 'CONFIDENTIAL' | 'CLASSIFIED' | 'PUBLIC_LEGITIMIZED';
}

export interface ICJCaseRecord {
  id: string;
  applicantId: string;
  respondentId: string;
  claimType: 'TERRITORY' | 'WAR_CRIMES' | 'SOVEREIGNTY_VIOLATION' | 'TREATY_BREACH' | 'ILLEGAL_FORCE';
  evidenceBundle: LegalEvidenceBundle;
  proceduralStage: 'FILED' | 'ADMISSIBILITY_REVIEW' | 'HEARINGS' | 'INTERIM_MEASURES' | 'JUDGMENT_PENDING' | 'DECIDED' | 'DISMISSED';
  proceduralTicksElapsed: number;
  ticksToNextStage: number;
  interimMeasuresDecreed?: string;
  finalFinding?: 'RESPONDENT_GUILTY' | 'RESPONDENT_EXONERATED' | 'DISMISSED_JURISDICTION' | 'SETTLEMENT';
  complianceAftermath?: 'FULL' | 'SELECTIVE' | 'DEFIANT_NON_COMPLIANCE';
  tickFiled: number;
}

export type ReputationDimension = 
  | 'legality'
  | 'proceduralReliability'
  | 'humanitarianCredibility'
  | 'interventionLegitimacy'
  | 'sovereigntyRespect'
  | 'institutionalSeriousness'
  | 'obstructionism'
  | 'doubleStandards'
  | 'defaultPropensity';

export interface ReputationShiftRecord {
  id: string;
  countryId: string;
  dimension: ReputationDimension;
  delta: number;
  reason: string;
  tickIncurred: number;
}

export interface InstitutionalMemoryRecord {
  id: string;
  countryId: string;
  habitualVetoCount: number;
  opportunisticAbstentions: number;
  goodFaithDebtRatio: number; // 0-1 ratio
  frivolousReferralCount: number;
  democraticNormEntrepreneurship: number; // score
  sabotageActsCount: number;
}

export interface TribunalEscalationRecord {
  id: string;
  associatedCaseId?: string;
  targetCountryId: string;
  escalationLevel: 'COMMISSION_OF_INQUIRY' | 'INVESTIGATIVE_PANEL' | 'EVIDENTIARY_DOSSIER' | 'ARREST_WARRANT_ISSUED' | 'SANCTIONS_LINKED_TRIBUNAL' | 'FORMAL_CONDEMNATION';
  namedResponsibilitySubject: string; // e.g. "General Staff" or "Sovereign Executive"
  evidenceCorroborated: boolean;
  internationalConsequencesRating: number; // 1-10 severity scale
  linkedEventLogs: string[];
  status: 'ACTIVE' | 'RESOLVED_COMPLIANCE' | 'DEFIED';
  tickInitiated: number;
}

export interface InstitutionalActionPreview {
  likelyVoteMap: Record<string, 'FOR' | 'AGAINST' | 'ABSTAIN'>;
  vetoRiskPercentage: number;
  potentialVetoingCountries: string[];
  expectedSponsorLegitimacyGain: number;
  financialAndDiplomaticCost: number;
  reprisalsRiskRating: number; // 0-100
}

// ─── UNIT 8200 SIGINT PLATFORM — Types ───────────────────────────────────────

export type SigintChannel =
  | 'DIPLOMATIC'   // embassy comms, diplomatic cables
  | 'TELECOM'      // phone and internet intercepts
  | 'MILITARY'     // military frequency intercepts
  | 'CYBER'        // network traffic and metadata
  | 'COMMERCIAL'   // trade and shipping signals
  | 'IMAGERY';     // satellite and aerial signatures

export type SigintConfidence = 'RUMINT' | 'OSINT' | 'SIGINT' | 'CONFIRMED';

export type SigintStatus = 'HIDDEN' | 'INFERRED' | 'CONFIRMED';

export type SigintCategory =
  | 'MILITARY_MOVEMENT'
  | 'DIPLOMATIC_COMM'
  | 'ECONOMIC_ANOMALY'
  | 'WMD_INDICATOR'
  | 'LEADERSHIP_SIGNAL';

export interface SigintCollectionAsset {
  id: string;
  channel: SigintChannel;
  targetNationId: string;
  coverageLevel: number;      // 0–100, affects detection probability
  dailyCost: number;          // deducted from budget every tick
  isActive: boolean;
  deployedAtTick: number;
}

export interface SigintSignal {
  id: string;
  sourceNationId: string;
  channel: SigintChannel;
  category: SigintCategory;
  rawContent: string;         // flavour text describing the intercept
  confidence: SigintConfidence;
  status: SigintStatus;
  detectedAtTick: number;
  expiresAtTick: number;      // signals expire after 30 ticks
  patternOfLifeFlag: boolean; // true if part of a recurring pattern baseline
  anomalyFlag: boolean;       // true if deviates >30% from nation baseline
  linkedSignalIds: string[];  // IDs of corroborating signals
}

export interface SigintBudget {
  totalAllocated: number;
  spent: number;
  remaining: number;
}

export interface SigintPatternBaseline {
  nationId: string;
  baselineScore: number;      // rolling average activity score
  lastUpdatedTick: number;
}
