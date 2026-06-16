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
