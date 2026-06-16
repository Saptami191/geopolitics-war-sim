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
