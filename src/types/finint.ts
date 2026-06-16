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
