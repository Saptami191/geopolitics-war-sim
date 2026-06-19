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

export type CommodityType = 'OIL' | 'NATURAL_GAS' | 'WHEAT' | 'RARE_EARTH' | 'SILICON' | 'WEAPONS_GRADE_URANIUM' | 'ARMS';

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
  regimePressure?: RegimePressureState;
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
  type: RouteType;
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






