import { create } from 'zustand';
import { produce } from 'immer';
import { 
  RegionalOrganization, 
  BlocType, 
  BlocMemberState, 
  BlocAgendaItem, 
  BurdenSharingDispute, 
  CollectiveDefenseTriggerRecord, 
  SwingStateProfile, 
  HedgingPostureState, 
  CrossBlocChannel, 
  ConfidenceBuildingMeasure, 
  BlocInstitutionalMemory,
  BlocCohesionState,
  ContributionObligation,
  MembershipAccessionsRecord,
  MembershipSuspensionRecord,
  MembershipExitRecord,
  BlocMediationProcess,
  BlocActionPreview,
  AllianceObjective,
  SharedObjectiveStack,
  MemberReliabilityScore,
  MemberBurdenShareModel,
  MemberContributionHistory,
  FreeRidePressureModel,
  BlocMemberProfile,
  BlocCohesionModel,
  BlocFractureRiskModel,
  PivotStateProfile,
  UnalignedPowerProfile,
  InfluenceCompetitionRecord,
  CommitmentCredibilityModel,
  CoalitionTaskingPlan,
  SharedThreatAssessment,
  BlocIntelSharingPolicy,
  BlocEscalationAgreement,
  MutualAssuranceProfile,
  BlocIntelligenceState
} from '../types';
import { useWorldStore } from './worldStore';
import { usePlayerStore } from './playerStore';
import { useUIStore } from './uiStore';

interface BlocState {
  organizations: Record<BlocType, RegionalOrganization>;
  swingStates: Record<string, { profile: SwingStateProfile; posture: HedgingPostureState }>;
  crossBlocChannels: Record<string, CrossBlocChannel>;
  institutionalMemories: Record<BlocType, BlocInstitutionalMemory>;
  mediationProcesses: Record<string, BlocMediationProcess>;

  // Module 4.4 Intelligence Extensions
  pivotStates: Record<string, PivotStateProfile>;
  unalignedPowers: Record<string, UnalignedPowerProfile>;
  influenceCompetition: Record<string, InfluenceCompetitionRecord>;
}

interface BlocActions {
  initializeBlocStore: () => void;
  proposeAgendaItem: (blocId: BlocType, item: Omit<BlocAgendaItem, 'id' | 'votesFor' | 'votesAgainst' | 'abstentions' | 'status'>) => string;
  voteOnAgendaItem: (blocId: BlocType, itemId: string, countryId: string, vote: 'FOR' | 'AGAINST' | 'ABSTAIN') => void;
  resolveAgendaItem: (blocId: BlocType, itemId: string) => void;
  triggerArticle5: (blocId: BlocType, attackerId: string, victimId: string) => string;
  respondToArticle5: (blocId: BlocType, triggerId: string, countryId: string, align: 'JOIN' | 'REFUSE') => void;
  lobbyMember: (blocId: BlocType, targetCountryId: string, lobbyAction: 'AID' | 'PRESSURE' | 'PROMISE') => void;
  proposeMediation: (blocId: BlocType, disputeId: string, mediatorId: string) => string;
  tickMediation: (mediationId: string) => void;
  lodgeBurdenSharingComplaint: (blocId: BlocType, initiator: string, target: string, type: BurdenSharingDispute['disputeType']) => string;
  resolveBurdenSharingDispute: (blocId: BlocType, disputeId: string, payConcession: boolean) => void;
  executeJointExercise: (blocId: BlocType) => void;
  fundInfrastructureProject: (blocId: BlocType, countryId: string, amountB: number) => void;
  toggleLocalCurrencySettlement: (blocId: BlocType) => void;
  initiateMembershipApplication: (blocId: BlocType, countryId: string) => void;
  advanceMembershipAccession: (blocId: BlocType, applicantId: string, sponsorId: string) => void;
  suspendMember: (blocId: BlocType, countryId: string, reason: MembershipSuspensionRecord['reason']) => void;
  exitMember: (blocId: BlocType, countryId: string, style: MembershipExitRecord['style']) => void;
  engageHedgingAction: (countryId: string, actionType: 'DIVERSIFY_ARMS' | 'ACCEPT_ECONOMIC_CORVIS' | 'ACCEPT_ECONOMIC_CORRIDOR' | 'ABSTAIN_BLOC_STATEMENT' | 'HOST_RIVAL_LEADERS', targetBloc?: string) => void;
  proposeCrossBlocCBM: (channelId: string, title: string, costAP: number, reduction: number) => void;
  auditContributions: (blocId: BlocType) => void;
  getBlocActionPreview: (blocId: BlocType, agendaType: BlocAgendaItem['type']) => BlocActionPreview;
  tickBlocSystem: (currentTick: number) => void;

  // Module 4.4 specific functional actions
  proposeAllianceObjective: (blocId: BlocType, obj: Omit<AllianceObjective, 'id' | 'status'>) => string;
  assignCoalitionTask: (blocId: BlocType, assigneeId: string, taskType: CoalitionTaskingPlan['activeTasks'][0]['taskType']) => string;
  resolveCoalitionTask: (blocId: BlocType, taskId: string, compliance: CoalitionTaskingPlan['activeTasks'][0]['complianceStatus']) => void;
  courtPivotState: (pivotId: string, blocId: BlocType, actionType: 'SECURITY_GUARANTEE' | 'ARMS_SALE' | 'TRADE_DEAL' | 'INFRASTRUCTURE' | 'COVERT_OPS', costAP: number, costFinancialB: number) => string;
  courtUnalignedPower: (unalignedId: string, blocId: BlocType, bidAmountB: number) => string;
  auditFreeRiders: (blocId: BlocType) => void;
  reconcileFracture: (blocId: BlocType) => void;
}

export const useBlocStore = create<BlocState & BlocActions>((set, get) => {
  const INITIAL_ORGANIZATIONS = (): Record<BlocType, RegionalOrganization> => ({
    NATO: {
      id: 'NATO',
      name: 'North Atlantic Treaty Organization',
      flagSymbol: '🔵',
      primaryAnchorPowerId: 'US',
      governanceRules: {
        agendaSettingStyle: 'HEGEMON_FORWARD',
        decisionThreshold: 'UNANIMITY',
        canBlockVetoCountries: ['US', 'GB', 'FR'],
        isBinding: true,
        reputationalCostOfIgnore: 85,
        allowOptOuts: false,
        allowSidePayments: true,
      },
      members: {
        US: { countryId: 'US', role: 'ANCHOR_POWER', entranceTick: 0, accumulatedContributions: 12000, trustScore: 95, fractureVulnerability: 10, leveragePoints: 100 },
        GB: { countryId: 'GB', role: 'ANCHOR_POWER', entranceTick: 0, accumulatedContributions: 1800, trustScore: 90, fractureVulnerability: 15, leveragePoints: 40 },
        FR: { countryId: 'FR', role: 'NORM_ENTREPRENEUR', entranceTick: 0, accumulatedContributions: 1500, trustScore: 80, fractureVulnerability: 25, leveragePoints: 50 },
        DE: { countryId: 'DE', role: 'FREE_RIDER', entranceTick: 0, accumulatedContributions: 800, trustScore: 75, fractureVulnerability: 30, leveragePoints: 20 },
        TR: { countryId: 'TR', role: 'HEDGING_INSIDER', entranceTick: 0, accumulatedContributions: 600, trustScore: 50, fractureVulnerability: 60, leveragePoints: 45 },
      },
      cohesion: {
        overallScore: 78,
        strategicCoherence: 80,
        militaryReliability: 85,
        economicCoordination: 60,
        proceduralLegitimacy: 90,
        leadershipTrust: 75,
        sanctionsResilience: 70,
      },
      fractureVectors: [
        { type: 'BURDEN_RESENTMENT', severity: 40, description: 'Asymmetry in defense expenditure (US spends 3.4% of GDP while Germany lags).', primaryOpposingPairs: ['US', 'DE'] },
        { type: 'THREAT_PERCEPTION', severity: 35, description: 'Divergence in strategic posture regarding eastern border lines versus Mediterranean security.', primaryOpposingPairs: ['DE', 'TR'] }
      ],
      burdenSharingDisputes: [
        { id: 'NATO-D-1', initiatingCountryId: 'US', targetCountryId: 'DE', disputeType: 'MILITARY_UNDERFUNDING', intensity: 55, unresolvedTicks: 2, narrative: 'The US is formally auditing Germany for lagging below the 2.0% defense budget commitment.' }
      ],
      agenda: [
        { id: 'NATO-A-1', title: 'Baltic Shield Cyber Constellation Security Mandate', description: 'Authorize joint deployment of cyber CERT and rapid response command units under an integrated command.', type: 'CRISIS_RESPONSE', initiatorId: 'US', votesFor: ['US', 'GB'], votesAgainst: [], abstentions: ['FR'], status: 'PENDING_EXAMINATION' }
      ],
      commitments: [],
      activeCollectiveDefenseTriggers: [],
      accessions: [],
      suspensions: [],
      exits: [],
      economicMechanism: { localCurrencySettlementActive: false, localCurrencyTradeShare: 0, developmentBankReservesB: 0, fundedInfrastructureProjects: [] },
      securityMechanism: { hasJointCommand: true, commandConfidence: 85, lastExerciseTick: 0, jointExerciseReadinessBonus: 20 }
    },
    SCO: {
      id: 'SCO',
      name: 'Shanghai Cooperation Organisation',
      flagSymbol: '💚',
      primaryAnchorPowerId: 'CN',
      governanceRules: {
        agendaSettingStyle: 'DIRECTORATE',
        decisionThreshold: 'CONSENSUS_NO_VETO',
        canBlockVetoCountries: ['CN', 'RU'],
        isBinding: false,
        reputationalCostOfIgnore: 35,
        allowOptOuts: true,
        allowSidePayments: true,
      },
      members: {
        CN: { countryId: 'CN', role: 'ANCHOR_POWER', entranceTick: 0, accumulatedContributions: 8000, trustScore: 92, fractureVulnerability: 12, leveragePoints: 120 },
        RU: { countryId: 'RU', role: 'ANCHOR_POWER', entranceTick: 0, accumulatedContributions: 4000, trustScore: 85, fractureVulnerability: 35, leveragePoints: 80 },
        IR: { countryId: 'IR', role: 'NORM_ENTREPRENEUR', entranceTick: 0, accumulatedContributions: 1100, trustScore: 78, fractureVulnerability: 20, leveragePoints: 40 },
        PK: { countryId: 'PK', role: 'DEVELOPMENT_DEMANDER', entranceTick: 0, accumulatedContributions: 700, trustScore: 72, fractureVulnerability: 45, leveragePoints: 15 },
        IN: { countryId: 'IN', role: 'HEDGING_INSIDER', entranceTick: 0, accumulatedContributions: 1300, trustScore: 45, fractureVulnerability: 65, leveragePoints: 60 }
      },
      cohesion: {
        overallScore: 60,
        strategicCoherence: 50,
        militaryReliability: 45,
        economicCoordination: 65,
        proceduralLegitimacy: 60,
        leadershipTrust: 55,
        sanctionsResilience: 80
      },
      fractureVectors: [
        { type: 'TERRITORIAL_DISPUTE', severity: 68, description: 'Sovereign border tension along the Line of Actual Control prevents integration.', primaryOpposingPairs: ['CN', 'IN'] },
        { type: 'EXTERNAL_ALIGNMENT', severity: 50, description: 'India maintains QUAD participation and high intelligence exchanges with western states.', primaryOpposingPairs: ['RU', 'IN'] }
      ],
      burdenSharingDisputes: [
        { id: 'SCO-D-1', initiatingCountryId: 'RU', targetCountryId: 'IN', disputeType: 'REFUSION_OF_BASES', intensity: 48, unresolvedTicks: 1, narrative: 'Russia disputes India\'s selective hosting parameters for joint regional maritime intelligence commands.' }
      ],
      agenda: [
        { id: 'SCO-A-1', title: 'Coordinated Counter-Terror Security Sweep "Eurasia Shield"', description: 'Establish dynamic military counter-terror drills targeting cyber-infrastructure security.', type: 'SECURITY_EXERCISE', initiatorId: 'CN', votesFor: ['CN', 'RU', 'PK'], votesAgainst: [], abstentions: [], status: 'PENDING_EXAMINATION' }
      ],
      commitments: [],
      activeCollectiveDefenseTriggers: [],
      accessions: [],
      suspensions: [],
      exits: [],
      economicMechanism: { localCurrencySettlementActive: false, localCurrencyTradeShare: 20, developmentBankReservesB: 15, fundedInfrastructureProjects: [] },
      securityMechanism: { hasJointCommand: false, commandConfidence: 48, lastExerciseTick: 0, jointExerciseReadinessBonus: 8 }
    },
    ASEAN: {
      id: 'ASEAN',
      name: 'Association of Southeast Asian Nations',
      flagSymbol: '🟡',
      primaryAnchorPowerId: 'JP', // Facilitators in Asia
      governanceRules: {
        agendaSettingStyle: 'CONSENSUS',
        decisionThreshold: 'UNANIMITY',
        canBlockVetoCountries: [],
        isBinding: false,
        reputationalCostOfIgnore: 40,
        allowOptOuts: true,
        allowSidePayments: false,
      },
      members: {
        JP: { countryId: 'JP', role: 'NORM_ENTREPRENEUR', entranceTick: 0, accumulatedContributions: 2400, trustScore: 88, fractureVulnerability: 15, leveragePoints: 70 },
        KR: { countryId: 'KR', role: 'DEVELOPMENT_DEMANDER', entranceTick: 0, accumulatedContributions: 1400, trustScore: 80, fractureVulnerability: 20, leveragePoints: 40 },
        TW: { countryId: 'TW', role: 'RELUCTANT_PARTICIPANT', entranceTick: 0, accumulatedContributions: 900, trustScore: 75, fractureVulnerability: 40, leveragePoints: 30 }
      },
      cohesion: {
        overallScore: 64,
        strategicCoherence: 55,
        militaryReliability: 35,
        economicCoordination: 78,
        proceduralLegitimacy: 85,
        leadershipTrust: 70,
        sanctionsResilience: 50
      },
      fractureVectors: [
        { type: 'THREAT_PERCEPTION', severity: 48, description: 'Disagreements on maritime security rules versus direct economic reliance on China.', primaryOpposingPairs: ['JP', 'TW'] }
      ],
      burdenSharingDisputes: [],
      agenda: [
        { id: 'ASEAN-A-1', title: 'Sovereign Integrity Maritime Consensus Accord', description: 'Formalize non-binding regional territorial dialogue to damp escalation while maintaining trade lines.', type: 'COMMUNIQUE_WORDING', initiatorId: 'JP', votesFor: ['JP', 'KR'], votesAgainst: [], abstentions: [], status: 'PENDING_EXAMINATION' }
      ],
      commitments: [],
      activeCollectiveDefenseTriggers: [],
      accessions: [],
      suspensions: [],
      exits: [],
      economicMechanism: { localCurrencySettlementActive: true, localCurrencyTradeShare: 35, developmentBankReservesB: 8, fundedInfrastructureProjects: [] },
      securityMechanism: { hasJointCommand: false, commandConfidence: 30, lastExerciseTick: 0, jointExerciseReadinessBonus: 5 }
    },
    AFRICAN_UNION: {
      id: 'AFRICAN_UNION',
      name: 'African Union',
      flagSymbol: '🌍',
      primaryAnchorPowerId: 'ZA',
      governanceRules: {
        agendaSettingStyle: 'COALITION_VOTE',
        decisionThreshold: 'TWO_THIRDS',
        canBlockVetoCountries: ['ZA', 'EG'],
        isBinding: false,
        reputationalCostOfIgnore: 50,
        allowOptOuts: true,
        allowSidePayments: true,
      },
      members: {
        ZA: { countryId: 'ZA', role: 'ANCHOR_POWER', entranceTick: 0, accumulatedContributions: 1500, trustScore: 85, fractureVulnerability: 25, leveragePoints: 60 },
        EG: { countryId: 'EG', role: 'NORM_ENTREPRENEUR', entranceTick: 0, accumulatedContributions: 1100, trustScore: 74, fractureVulnerability: 30, leveragePoints: 45 }
      },
      cohesion: {
        overallScore: 58,
        strategicCoherence: 50,
        militaryReliability: 40,
        economicCoordination: 55,
        proceduralLegitimacy: 75,
        leadershipTrust: 65,
        sanctionsResilience: 60
      },
      fractureVectors: [
        { type: 'ECONOMIC_ASYMMETRY', severity: 42, description: 'Divergence in investment pipelines (Egypt prioritizes Suez/Middle East, ZA focuses on mining networks).', primaryOpposingPairs: ['EG', 'ZA'] }
      ],
      burdenSharingDisputes: [],
      agenda: [
        { id: 'AU-A-1', title: 'Sub-Saharan Corridor Development Alliance', description: 'Allocate pooled development facilities to expand infrastructure and local rail/logistic corridors.', type: 'DEVELOPMENT_PACKAGE', initiatorId: 'ZA', votesFor: ['ZA'], votesAgainst: [], abstentions: [], status: 'PENDING_EXAMINATION' }
      ],
      commitments: [],
      activeCollectiveDefenseTriggers: [],
      accessions: [],
      suspensions: [],
      exits: [],
      economicMechanism: { localCurrencySettlementActive: false, localCurrencyTradeShare: 5, developmentBankReservesB: 12, fundedInfrastructureProjects: [] },
      securityMechanism: { hasJointCommand: false, commandConfidence: 35, lastExerciseTick: 0, jointExerciseReadinessBonus: 6 }
    },
    ARAB_LEAGUE: {
      id: 'ARAB_LEAGUE',
      name: 'Arab League',
      flagSymbol: '👑',
      primaryAnchorPowerId: 'SA',
      governanceRules: {
        agendaSettingStyle: 'DIRECTORATE',
        decisionThreshold: 'SIMPLE_MAJORITY',
        canBlockVetoCountries: ['SA', 'EG'],
        isBinding: false,
        reputationalCostOfIgnore: 60,
        allowOptOuts: true,
        allowSidePayments: true,
      },
      members: {
        SA: { countryId: 'SA', role: 'ANCHOR_POWER', entranceTick: 0, accumulatedContributions: 4800, trustScore: 90, fractureVulnerability: 22, leveragePoints: 95 },
        EG: { countryId: 'EG', role: 'MEDIATOR', entranceTick: 0, accumulatedContributions: 1600, trustScore: 80, fractureVulnerability: 28, leveragePoints: 50 },
        PS: { countryId: 'PS', role: 'FRONT_LINE_STATE', entranceTick: 0, accumulatedContributions: 50, trustScore: 65, fractureVulnerability: 80, leveragePoints: 5 }
      },
      cohesion: {
        overallScore: 52,
        strategicCoherence: 42,
        militaryReliability: 30,
        economicCoordination: 60,
        proceduralLegitimacy: 65,
        leadershipTrust: 55,
        sanctionsResilience: 60
      },
      fractureVectors: [
        { type: 'IDEOLOGY', severity: 55, description: 'Ideological splits between conservative royal monarchies and defense military republics.', primaryOpposingPairs: ['SA', 'EG'] },
        { type: 'THREAT_PERCEPTION', severity: 60, description: 'Divergent perspectives on normalizing diplomatic parameters with Israel.', primaryOpposingPairs: ['SA', 'PS'] }
      ],
      burdenSharingDisputes: [
        { id: 'AL-D-1', initiatingCountryId: 'PS', targetCountryId: 'SA', disputeType: 'FINANCIAL_UNDERCONTRIBUTION', intensity: 65, unresolvedTicks: 3, narrative: 'Palestine disputes oil-dividend aid levels while regional pressures mount.' }
      ],
      agenda: [
        { id: 'AL-A-1', title: 'Regional Human Rights Emergency Stabilisation Funds', description: 'Allocate medical aid resources to sovereign zones.', type: 'DEVELOPMENT_PACKAGE', initiatorId: 'EG', votesFor: ['EG', 'PS'], votesAgainst: [], abstentions: [], status: 'PENDING_EXAMINATION' }
      ],
      commitments: [],
      activeCollectiveDefenseTriggers: [],
      accessions: [],
      suspensions: [],
      exits: [],
      economicMechanism: { localCurrencySettlementActive: false, localCurrencyTradeShare: 15, developmentBankReservesB: 20, fundedInfrastructureProjects: [] },
      securityMechanism: { hasJointCommand: false, commandConfidence: 25, lastExerciseTick: 0, jointExerciseReadinessBonus: 4 }
    },
    BRICS: {
      id: 'BRICS',
      name: 'BRICS Intercontinental Alliance',
      flagSymbol: '🧱',
      primaryAnchorPowerId: 'CN',
      governanceRules: {
        agendaSettingStyle: 'CONSENSUS',
        decisionThreshold: 'UNANIMITY',
        canBlockVetoCountries: ['CN', 'RU', 'IN', 'BR', 'ZA'],
        isBinding: false,
        reputationalCostOfIgnore: 50,
        allowOptOuts: true,
        allowSidePayments: true,
      },
      members: {
        CN: { countryId: 'CN', role: 'ANCHOR_POWER', entranceTick: 0, accumulatedContributions: 14000, trustScore: 92, fractureVulnerability: 10, leveragePoints: 150 },
        RU: { countryId: 'RU', role: 'ANCHOR_POWER', entranceTick: 0, accumulatedContributions: 5000, trustScore: 84, fractureVulnerability: 30, leveragePoints: 90 },
        IN: { countryId: 'IN', role: 'HEDGING_INSIDER', entranceTick: 0, accumulatedContributions: 2800, trustScore: 50, fractureVulnerability: 50, leveragePoints: 75 },
        BR: { countryId: 'BR', role: 'NORM_ENTREPRENEUR', entranceTick: 0, accumulatedContributions: 2200, trustScore: 80, fractureVulnerability: 20, leveragePoints: 60 },
        ZA: { countryId: 'ZA', role: 'DEVELOPMENT_DEMANDER', entranceTick: 0, accumulatedContributions: 1200, trustScore: 78, fractureVulnerability: 25, leveragePoints: 40 },
        SA: { countryId: 'SA', role: 'FINANCE_PROVIDER', entranceTick: 0, accumulatedContributions: 3500, trustScore: 82, fractureVulnerability: 24, leveragePoints: 85 },
        EG: { countryId: 'EG', role: 'DEVELOPMENT_DEMANDER', entranceTick: 0, accumulatedContributions: 900, trustScore: 72, fractureVulnerability: 35, leveragePoints: 20 },
      },
      cohesion: {
        overallScore: 66,
        strategicCoherence: 48,
        militaryReliability: 20,
        economicCoordination: 82,
        proceduralLegitimacy: 75,
        leadershipTrust: 65,
        sanctionsResilience: 85
      },
      fractureVectors: [
        { type: 'TERRITORIAL_DISPUTE', severity: 60, description: 'Himalayan and strategic border rivalries block deeper political integration.', primaryOpposingPairs: ['CN', 'IN'] },
        { type: 'EXTERNAL_ALIGNMENT', severity: 45, description: 'Brazil and South Africa pursue deep western multilateral agreements while Russia remains under direct sanctions.', primaryOpposingPairs: ['RU', 'BR'] }
      ],
      burdenSharingDisputes: [
        { id: 'BRICS-D-1', initiatingCountryId: 'CN', targetCountryId: 'IN', disputeType: 'SANCTIONS_EVASION', intensity: 45, unresolvedTicks: 1, narrative: 'China requests India fully commit trade corridors to local-currency systems rather than western SWIFT assets.' }
      ],
      agenda: [
        { id: 'BRICS-A-1', title: 'New Development Bank Local-Currency Emergency Financing Basket', description: 'Deploy alternative local-currency liquidity pool of $25 Billion to bypass Western banking assets.', type: 'LOCAL_CURRENCY_VOTE', initiatorId: 'CN', votesFor: ['CN', 'RU', 'ZA', 'EG'], votesAgainst: [], abstentions: ['IN'], status: 'PENDING_EXAMINATION' }
      ],
      commitments: [],
      activeCollectiveDefenseTriggers: [],
      accessions: [],
      suspensions: [],
      exits: [],
      economicMechanism: {
        localCurrencySettlementActive: true,
        localCurrencyTradeShare: 42,
        developmentBankReservesB: 50,
        fundedInfrastructureProjects: [
          { id: 'BRICS-P-1', countryId: 'ZA', projectCostB: 4.5, deliveryProgress: 35, leverageYieldPoints: 12 }
        ]
      },
      securityMechanism: { hasJointCommand: false, commandConfidence: 15, lastExerciseTick: 0, jointExerciseReadinessBonus: 2 }
    }
  });

  const INITIAL_SWING_STATES = (): Record<string, { profile: SwingStateProfile; posture: HedgingPostureState }> => ({
    IN: {
      profile: { countryId: 'IN', alignmentFlexibility: 85, autonomyPreference: 90, coercionSensitivity: 75, aidResponsiveness: 50, securityAnxiety: 80, sanctionsVulnerability: 40, domesticEliteDivision: 65, publicOpinionSplit: 55, tradeDependenceMix: 'Highly diversified. Balanced between GCC oil, European technologies, Chinese electronics, and Russian defense components.', militaryProcurementDiversity: 'MIXED_DIVERSIFIED' },
      posture: { countryId: 'IN', primaryMilitaryTilt: 'NEUTRAL', primaryEconomicTilt: 'EAST', tacticalAmbiguityRating: 90, concessionsExtractedB: 12.4, activeEconomicCorridors: ['IMEC', 'INSTC'], lastHedgingAction: 'Abstained from UN sanctions vote while expanding crude oil trade logs with eastern anchors.' }
    },
    TR: {
      profile: { countryId: 'TR', alignmentFlexibility: 78, autonomyPreference: 85, coercionSensitivity: 80, aidResponsiveness: 65, securityAnxiety: 70, sanctionsVulnerability: 60, domesticEliteDivision: 70, publicOpinionSplit: 60, tradeDependenceMix: 'Direct European export bridge, dependent on Russian pipelines and Middle East liquidity pools.', militaryProcurementDiversity: 'MIXED_DIVERSIFIED' },
      posture: { countryId: 'TR', primaryMilitaryTilt: 'WEST', primaryEconomicTilt: 'NEUTRAL', tacticalAmbiguityRating: 82, concessionsExtractedB: 6.8, activeEconomicCorridors: ['BRI', 'Middle Corridor'], lastHedgingAction: 'Blocked rapid European maritime border resolutions to secure bilateral energy corridor concessions.' }
    },
    SA: {
      profile: { countryId: 'SA', alignmentFlexibility: 72, autonomyPreference: 78, coercionSensitivity: 50, aidResponsiveness: 20, securityAnxiety: 85, sanctionsVulnerability: 30, domesticEliteDivision: 40, publicOpinionSplit: 45, tradeDependenceMix: 'Export sovereign energy hub. Heavily balanced towards US military security contracts and Asian infrastructure pipelines.', militaryProcurementDiversity: 'WEST_ONLY' },
      posture: { countryId: 'SA', primaryMilitaryTilt: 'WEST', primaryEconomicTilt: 'EAST', tacticalAmbiguityRating: 75, concessionsExtractedB: 15.2, activeEconomicCorridors: ['IMEC', 'BRI'], lastHedgingAction: 'Formalized BRICS financial dialogue while maintaining security patrol alignments with NATO forces.' }
    },
    EG: {
      profile: { countryId: 'EG', alignmentFlexibility: 65, autonomyPreference: 60, coercionSensitivity: 85, aidResponsiveness: 80, securityAnxiety: 75, sanctionsVulnerability: 70, domesticEliteDivision: 50, publicOpinionSplit: 50, tradeDependenceMix: 'Highly dependent on US financial aid allocations and Chinese infrastructure investments.', militaryProcurementDiversity: 'MIXED_DIVERSIFIED' },
      posture: { countryId: 'EG', primaryMilitaryTilt: 'WEST', primaryEconomicTilt: 'NEUTRAL', tacticalAmbiguityRating: 60, concessionsExtractedB: 4.5, activeEconomicCorridors: ['BRI'], lastHedgingAction: 'Acquired Western naval vessels and signed Chinese deep harbor logistics agreements.' }
    },
    PK: {
      profile: { countryId: 'PK', alignmentFlexibility: 70, autonomyPreference: 65, coercionSensitivity: 90, aidResponsiveness: 88, securityAnxiety: 90, sanctionsVulnerability: 80, domesticEliteDivision: 72, publicOpinionSplit: 70, tradeDependenceMix: 'Dependent on CPEC pipelines, Gulf finance, and Western IMF allocations.', militaryProcurementDiversity: 'MIXED_DIVERSIFIED' },
      posture: { countryId: 'PK', primaryMilitaryTilt: 'EAST', primaryEconomicTilt: 'EAST', tacticalAmbiguityRating: 68, concessionsExtractedB: 5.2, activeEconomicCorridors: ['CPEC / BRI'], lastHedgingAction: 'Expanded joint military exercise codes with East while importing Western defense components.' }
    },
    ZA: {
      profile: { countryId: 'ZA', alignmentFlexibility: 80, autonomyPreference: 80, coercionSensitivity: 60, aidResponsiveness: 55, securityAnxiety: 40, sanctionsVulnerability: 50, domesticEliteDivision: 55, publicOpinionSplit: 50, tradeDependenceMix: 'Abundant strategic minerals. Close logistical links to the EU and Chinese industrial partners.', militaryProcurementDiversity: 'MIXED_DIVERSIFIED' },
      posture: { countryId: 'ZA', primaryMilitaryTilt: 'NEUTRAL', primaryEconomicTilt: 'EAST', tacticalAmbiguityRating: 70, concessionsExtractedB: 3.1, activeEconomicCorridors: ['BRI', 'AU Corridors'], lastHedgingAction: 'Hosted multi-navy maritime coordinates while issuing deconfliction declarations.' }
    },
    BR: {
      profile: { countryId: 'BR', alignmentFlexibility: 75, autonomyPreference: 85, coercionSensitivity: 55, aidResponsiveness: 40, securityAnxiety: 30, sanctionsVulnerability: 45, domesticEliteDivision: 60, publicOpinionSplit: 52, tradeDependenceMix: 'Agricultural export giant. Strongly aligned with Chinese buyers and Western technology infrastructure.', militaryProcurementDiversity: 'DOMESTIC_HEAVY' },
      posture: { countryId: 'BR', primaryMilitaryTilt: 'NEUTRAL', primaryEconomicTilt: 'NEUTRAL', tacticalAmbiguityRating: 74, concessionsExtractedB: 2.5, activeEconomicCorridors: ['Agriculture Corridors'], lastHedgingAction: 'Initiated independent global peace dialogue tracks, rejecting direct sanctions integrations.' }
    }
  });

  const INITIAL_CROSS_BLOC_CHANNELS = (): Record<string, CrossBlocChannel> => ({
    'CH-1': { id: 'CH-1', originBloc: 'NATO', targetBloc: 'SCO', channelType: 'BACK_CHANNEL', integrityIndex: 65, lastActivityTick: 0, agreedConfidenceMeasures: ['Hotline Communications System'] },
    'CH-2': { id: 'CH-2', originBloc: 'NATO', targetBloc: 'BRICS', channelType: 'TRACK_2', integrityIndex: 72, lastActivityTick: 0, agreedConfidenceMeasures: ['Academic Dialogue Exchanges'] }
  });

  const INITIAL_INSTITUTIONAL_MEMORIES = (): Record<BlocType, BlocInstitutionalMemory> => ({
    NATO: { blocId: 'NATO', historyLog: [{ tick: 0, description: 'Alliance founded on transatlantic democratic defense values.', impactType: 'COHESION_GAIN' }] },
    SCO: { blocId: 'SCO', historyLog: [{ tick: 0, description: 'Pact signed to combat the "three evils" of terrorism, separatism, and extremism.', impactType: 'COHESION_GAIN' }] },
    ASEAN: { blocId: 'ASEAN', historyLog: [{ tick: 0, description: 'ASEAN Concord signed. Non-interference rule fully established.', impactType: 'COHESION_GAIN' }] },
    AFRICAN_UNION: { blocId: 'AFRICAN_UNION', historyLog: [{ tick: 0, description: 'Lomé declaration ratifies anti-coup norms and regional developmental compact.', impactType: 'COHESION_GAIN' }] },
    ARAB_LEAGUE: { blocId: 'ARAB_LEAGUE', historyLog: [{ tick: 0, description: 'Riyadh Protocol sets cooperative framework for energy sovereignty.', impactType: 'COHESION_GAIN' }] },
    BRICS: { blocId: 'BRICS', historyLog: [{ tick: 0, description: 'Fortaleza treaty initiates New Development Bank foundations.', impactType: 'COHESION_GAIN' }] }
  });

  const INITIAL_PIVOT_STATES = (): Record<string, PivotStateProfile> => ({
    IN: {
      countryId: 'IN',
      name: 'India',
      strategicLocationDescription: 'Himalayan Frontier and Central Indian Ocean Sea Lanes',
      tradeDependencyWest: 48,
      tradeDependencyEast: 52,
      securityDependencyWest: 40,
      securityDependencyEast: 60,
      regimeType: 'Democratic Republic',
      eliteFactionBalance: { proWestPercent: 50, proEastPercent: 30, neutralPercent: 20 },
      domesticAlignmentPressure: 65,
      externalCourtingPressure: 85,
      toleranceForHedging: 90,
      allianceAttractivenessWest: 70,
      allianceAttractivenessEast: 65,
      neutralityStability: 80
    },
    TR: {
      countryId: 'TR',
      name: 'Turkey',
      strategicLocationDescription: 'Bosphorus Strait, Europe-Asia Landbridge',
      tradeDependencyWest: 70,
      tradeDependencyEast: 30,
      securityDependencyWest: 85,
      securityDependencyEast: 15,
      regimeType: 'Presidential Republic',
      eliteFactionBalance: { proWestPercent: 45, proEastPercent: 40, neutralPercent: 15 },
      domesticAlignmentPressure: 55,
      externalCourtingPressure: 80,
      toleranceForHedging: 75,
      allianceAttractivenessWest: 85,
      allianceAttractivenessEast: 50,
      neutralityStability: 60
    },
    SA: {
      countryId: 'SA',
      name: 'Saudi Arabia',
      strategicLocationDescription: 'Red Sea and Persian Gulf Crude Shipping Lanes',
      tradeDependencyWest: 35,
      tradeDependencyEast: 65,
      securityDependencyWest: 90,
      securityDependencyEast: 10,
      regimeType: 'Absolute Monarchy',
      eliteFactionBalance: { proWestPercent: 60, proEastPercent: 25, neutralPercent: 15 },
      domesticAlignmentPressure: 45,
      externalCourtingPressure: 75,
      toleranceForHedging: 80,
      allianceAttractivenessWest: 80,
      allianceAttractivenessEast: 70,
      neutralityStability: 70
    },
    EG: {
      countryId: 'EG',
      name: 'Egypt',
      strategicLocationDescription: 'Suez Canal maritime gateway',
      tradeDependencyWest: 50,
      tradeDependencyEast: 50,
      securityDependencyWest: 80,
      securityDependencyEast: 20,
      regimeType: 'Military-backed Presidential State',
      eliteFactionBalance: { proWestPercent: 55, proEastPercent: 30, neutralPercent: 15 },
      domesticAlignmentPressure: 50,
      externalCourtingPressure: 70,
      toleranceForHedging: 65,
      allianceAttractivenessWest: 75,
      allianceAttractivenessEast: 55,
      neutralityStability: 75
    }
  });

  const INITIAL_UNALIGNED_POWERS = (): Record<string, UnalignedPowerProfile> => ({
    BR: {
      countryId: 'BR',
      name: 'Brazil',
      strengthIndex: 75,
      accessSellingOptions: ['Agribusiness corridor', 'Amazon climate funds', 'Atlantic naval access'],
      hedgingParameterTicks: 0,
      sidePaymentsDemandedB: 3.2,
      rivalryExploitationLevel: 60,
      threatToSwingAlignment: true,
      mediationEffortsHosted: ['Global Peace Summit', 'Amazon Climate Pact'],
      governanceStance: 'GENUINE_NON_ALIGNED'
    },
    ZA: {
      countryId: 'ZA',
      name: 'South Africa',
      strengthIndex: 60,
      accessSellingOptions: ['Deep water ports', 'Rare earth mining', 'Antarctic scientific research base'],
      hedgingParameterTicks: 0,
      sidePaymentsDemandedB: 1.8,
      rivalryExploitationLevel: 45,
      threatToSwingAlignment: false,
      mediationEffortsHosted: ['African Peace Initiative'],
      governanceStance: 'OPPORTUNISTIC_BALANCER'
    },
    PK: {
      countryId: 'PK',
      name: 'Pakistan',
      strengthIndex: 65,
      accessSellingOptions: ['CPEC corridor ports', 'Nuclear command sharing', 'Central Asia logistics'],
      hedgingParameterTicks: 0,
      sidePaymentsDemandedB: 2.5,
      rivalryExploitationLevel: 75,
      threatToSwingAlignment: true,
      mediationEffortsHosted: [],
      governanceStance: 'OPPORTUNISTIC_BALANCER'
    }
  });

  const INITIAL_INFLUENCE_COMPETITION = (): Record<string, InfluenceCompetitionRecord> => ({
    IN: {
      targetCountryId: 'IN',
      influenceWeightWest: 45,
      influenceWeightEast: 55,
      tradeTiesWest: 40,
      tradeTiesEast: 60,
      securityDependenceWest: 30,
      securityDependenceEast: 70,
      intelligenceAccessWest: 50,
      intelligenceAccessEast: 30,
      publicNarrativePullWest: 65,
      publicNarrativePullEast: 35,
      eliteFactionLeaning: 'BALANCED',
      recentDiplomacyLogs: ['US-India high-tech partnership agreement signed.', 'Russia-India energy discount channel expanded.'],
      covertPenetrationIndexWest: 30,
      covertPenetrationIndexEast: 40
    },
    TR: {
      targetCountryId: 'TR',
      influenceWeightWest: 65,
      influenceWeightEast: 35,
      tradeTiesWest: 75,
      tradeTiesEast: 25,
      securityDependenceWest: 80,
      securityDependenceEast: 20,
      intelligenceAccessWest: 85,
      intelligenceAccessEast: 15,
      publicNarrativePullWest: 50,
      publicNarrativePullEast: 50,
      eliteFactionLeaning: 'WEST_LEANING',
      recentDiplomacyLogs: ['NATO Black Sea military exercise completed.', 'Russia-Turkey gas hub framework negotiated.'],
      covertPenetrationIndexWest: 60,
      covertPenetrationIndexEast: 45
    },
    SA: {
      targetCountryId: 'SA',
      influenceWeightWest: 60,
      influenceWeightEast: 40,
      tradeTiesWest: 30,
      tradeTiesEast: 70,
      securityDependenceWest: 90,
      securityDependenceEast: 10,
      intelligenceAccessWest: 80,
      intelligenceAccessEast: 20,
      publicNarrativePullWest: 55,
      publicNarrativePullEast: 45,
      eliteFactionLeaning: 'WEST_LEANING',
      recentDiplomacyLogs: ['US-Saudi defensive security treaty draft reviewed.', 'Saudi-BRICS local currency trade pilot started.'],
      covertPenetrationIndexWest: 40,
      covertPenetrationIndexEast: 30
    }
  });

  const enrichOrganizationsWithIntelligence = (orgs: Record<BlocType, RegionalOrganization>): Record<BlocType, RegionalOrganization> => {
    Object.keys(orgs).forEach(k => {
      const bId = k as BlocType;
      const org = orgs[bId];
      
      const initialObjectives: AllianceObjective[] = [
        {
          id: `${bId}-O-1`,
          name: bId === 'NATO' ? 'Containment of Eastern Pivot States' : bId === 'SCO' ? 'Deterrence of NATO Border Mobilizations' : 'Strategic Economic Security',
          category: bId === 'NATO' ? 'MILITARY_CONTAINMENT' : bId === 'SCO' ? 'REGIONAL_DETERRENCE' : 'TRADE_PROTECTION',
          priority: 8,
          costAP: 15,
          costFinancialB: 5.0,
          confidenceRating: { US: 100, GB: 100, CN: 90, RU: 90 },
          politicalPressure: 45,
          domesticConstraints: 'Public opinion resists escalating direct costs.',
          status: 'ACTIVE'
        },
        {
          id: `${bId}-O-2`,
          name: 'Joint Maritime Corridors Protection',
          category: 'TRADE_PROTECTION',
          priority: 6,
          costAP: 8,
          costFinancialB: 2.5,
          confidenceRating: { US: 90, CN: 95 },
          politicalPressure: 30,
          domesticConstraints: 'Requires merchant Navy and coast guard permissions.',
          status: 'ACTIVE'
        }
      ];

      org.objectives = {
        objectives: initialObjectives,
        lastEvaluationTick: 0,
        globalPrioritiesDescription: `Standard strategic defense framework for ${org.name}.`
      };

      org.memberProfiles = {};
      Object.keys(org.members).forEach(countryId => {
        const m = org.members[countryId];
        const isAnchor = m.role === 'ANCHOR_POWER';
        
        org.memberProfiles![countryId] = {
          countryId,
          reliability: {
            military: isAnchor ? 90 : Math.round(55 + Math.random() * 35),
            diplomatic: Math.round(60 + Math.random() * 30),
            intelligence: Math.round(50 + Math.random() * 40),
            sanctions: Math.round(55 + Math.random() * 35),
            crisis: isAnchor ? 95 : Math.round(40 + Math.random() * 50),
            treaty: Math.round(70 + Math.random() * 25),
            publicRating: Math.round(m.trustScore),
            hiddenRating: Math.round(m.trustScore - (Math.random() * 15))
          },
          burdenShare: {
            expectedContribution: {
              financialB: isAnchor ? 12.0 : 2.5,
              militaryForces: isAnchor ? 15 : 4,
              basingRightsAuthorized: isAnchor ? true : Math.random() > 0.4,
              sanctionsSupport: true,
              diplomaticCapital: 75,
              intelligenceExposureRisk: 50,
              escalationRiskTier: 3,
              domesticPoliticalCostLimit: 70
            },
            actualContribution: {
              financialB: isAnchor ? 12.0 : (m.role === 'FREE_RIDER' ? 0.8 : 2.2),
              militaryForces: isAnchor ? 15 : (m.role === 'FREE_RIDER' ? 1 : 3),
              basingRightsProvided: isAnchor ? true : Math.random() > 0.5,
              sanctionsSupport: m.role !== 'HEDGING_INSIDER',
              diplomaticCapital: isAnchor ? 90 : (m.role === 'FREE_RIDER' ? 30 : 60),
              intelligenceExposureRisk: isAnchor ? 85 : 40,
              escalationRiskTier: isAnchor ? 4 : 2,
              domesticPoliticalCostIncurred: isAnchor ? 45 : 30
            },
            willingnessToPay: isAnchor ? 95 : (m.role === 'FREE_RIDER' ? 30 : 70),
            willingnessToRisk: isAnchor ? 90 : (m.role === 'HEDGING_INSIDER' ? 35 : 60),
            strainRating: m.role === 'FREE_RIDER' ? 20 : Math.round(25 + Math.random() * 40)
          },
          contributionHistory: [
            {
              tick: 0,
              actionType: 'KEPT_PROMISE',
              description: `Initial signing commitment to the ${bId} regional assembly.`,
              costIncurredB: isAnchor ? 5.0 : 0.8
            }
          ],
          freeRidePressure: {
            currentFreeRideIndex: m.role === 'FREE_RIDER' ? 75 : 15,
            accumulatedResentment: m.role === 'FREE_RIDER' ? 45 : 5,
            targetWillingnessToCorrect: m.role === 'FREE_RIDER' ? 40 : 85,
            activeAuditing: false,
            proposedPenalties: m.role === 'FREE_RIDER' ? ['Lapse Voting Privilege', 'Restrict Intelligence Stream'] : []
          },
          threatAssessment: isAnchor ? 'No immediate threat of defection.' : `Friction rating centered at ${(100 - m.trustScore).toFixed(1)}%.`
        };
      });

      org.cohesionModel = {
        overallScore: org.cohesion.overallScore,
        sharedThreatCohesionBonus: 15,
        ideologicalProximityBonus: bId === 'NATO' ? 20 : 5,
        tradeInterdependenceFactor: Math.round(org.cohesion.economicCoordination * 0.8),
        burdenFairnessIndex: bId === 'NATO' ? 45 : 60,
        unresolvedDisputesPenalty: org.burdenSharingDisputes.length * 10,
        domesticPoliticalDrag: 10
      };

      org.fractureModel = {
        fractureRiskIndex: bId === 'ARAB_LEAGUE' ? 45 : (bId === 'BRICS' ? 35 : 15),
        primaryStressSource: bId === 'NATO' ? 'Military underfunding' : bId === 'SCO' ? 'Severe territorial rivalries between major anchors' : 'Trade divergence',
        splinterFactionCountryIds: bId === 'BRICS' ? ['IN'] : [],
        reconciliationFeasibility: 75
      };

      org.intelSharingPolicy = {
        clearanceLevelRequired: bId === 'NATO' ? 'TOP_SECRET' : 'CONFIDENTIAL',
        sharingFrictionIndex: bId === 'NATO' ? 25 : 55,
        jointIntrusionsAuthorized: bId === 'NATO' || bId === 'SCO',
        bannedTargetCountryIds: bId === 'NATO' ? ['RU', 'CN', 'IR'] : ['US', 'GB']
      };

      org.escalationAgreement = {
        authorizedResponseTier: bId === 'NATO' ? 'ASYMMETRIC_ESCALATORY' : 'PROPORTIONAL_SYMMETRIC',
        nuclearBackstopInvoked: bId === 'NATO' || bId === 'SCO',
        escalationCapCostB: bId === 'NATO' ? 50 : 25
      };

      org.mutualAssurance = {
        sovereignGuaranteesActive: bId === 'NATO' ? ['US', 'GB', 'FR', 'DE', 'TR'] : ['CN', 'RU'],
        retaliatoryTriggersCount: bId === 'NATO' ? 8 : 4,
        crisisSummitBufferTicks: 2
      };

      org.coalitionTasking = {
        activeTasks: [
          {
            id: `${bId}-T-1`,
            assigneeCountryId: bId === 'NATO' ? 'GB' : bId === 'SCO' ? 'RU' : 'JP',
            taskType: 'PATROL_ZONE',
            assignedBurdenScore: 30,
            expectedCompletionTick: 5,
            actualProgress: 25,
            complianceStatus: 'FULL',
            delayTicks: 0,
            narrative: 'Conducting standard maritime surveillance corridors as agreed.'
          }
        ]
      };

      org.sharedThreatAssessment = {
        adversaryBlocId: bId === 'NATO' ? 'SCO' : 'NATO',
        perceivedThreatLevel: bId === 'NATO' ? 75 : 68,
        sharedIntelAlertsCount: 12,
        leakedDirectivesCount: 2,
        criticalVulnIdentified: bId === 'NATO' ? 'Suez logistical choke point and pipeline security.' : 'Western finance hub centralization.'
      };

      org.intelState = {
        compiledDate: '2026-06-17',
        overallThreatLandscape: bId === 'NATO' ? 'INTEGRATED HYBRID FRICTION DETECTED IN SOUTH SEAS AND BALTICS.' : 'WESTERN EXPORT CONTROL EXPANSION DETECTED.',
        highestDefectionRiskMemberId: bId === 'NATO' ? 'TR' : (bId === 'BRICS' ? 'IN' : undefined),
        activeInformationOperationsCount: 3
      };
    });
    return orgs;
  };

  return {
    organizations: enrichOrganizationsWithIntelligence(INITIAL_ORGANIZATIONS()),
    swingStates: INITIAL_SWING_STATES(),
    crossBlocChannels: INITIAL_CROSS_BLOC_CHANNELS(),
    institutionalMemories: INITIAL_INSTITUTIONAL_MEMORIES(),
    mediationProcesses: {},

    pivotStates: INITIAL_PIVOT_STATES(),
    unalignedPowers: INITIAL_UNALIGNED_POWERS(),
    influenceCompetition: INITIAL_INFLUENCE_COMPETITION(),

    initializeBlocStore: () => {
      set({
        organizations: enrichOrganizationsWithIntelligence(INITIAL_ORGANIZATIONS()),
        swingStates: INITIAL_SWING_STATES(),
        crossBlocChannels: INITIAL_CROSS_BLOC_CHANNELS(),
        institutionalMemories: INITIAL_INSTITUTIONAL_MEMORIES(),
        mediationProcesses: {},
        pivotStates: INITIAL_PIVOT_STATES(),
        unalignedPowers: INITIAL_UNALIGNED_POWERS(),
        influenceCompetition: INITIAL_INFLUENCE_COMPETITION()
      });
    },

    proposeAgendaItem: (blocId, item) => {
      const id = `${blocId}-A-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        const newItem: BlocAgendaItem = {
          ...item,
          id,
          votesFor: [item.initiatorId],
          votesAgainst: [],
          abstentions: [],
          status: 'PENDING_EXAMINATION'
        };
        org.agenda.unshift(newItem);
        
        // Log in institutional memory
        draft.institutionalMemories[blocId].historyLog.unshift({
          tick: useWorldStore.getState().currentTick,
          description: `Agenda item "${item.title}" officially proposed by ${item.initiatorId}.`,
          impactType: 'TRUST_BOOST',
          relatedCountryId: item.initiatorId
        });
      }));

      useUIStore.getState().pushTerminalLine(`${blocId}: Proponent state ${item.initiatorId} has proposed resolution "${item.title}".`, 'INFO');
      return id;
    },

    voteOnAgendaItem: (blocId, itemId, countryId, vote) => {
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        const item = org.agenda.find(i => i.id === itemId);
        if (!item || item.status !== 'PENDING_EXAMINATION') return;

        // Clear existing vote
        item.votesFor = item.votesFor.filter(c => c !== countryId);
        item.votesAgainst = item.votesAgainst.filter(c => c !== countryId);
        item.abstentions = item.abstentions.filter(c => c !== countryId);

        if (vote === 'FOR') item.votesFor.push(countryId);
        else if (vote === 'AGAINST') item.votesAgainst.push(countryId);
        else item.abstentions.push(countryId);
      }));
    },

    resolveAgendaItem: (blocId, itemId) => {
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        const item = org.agenda.find(i => i.id === itemId);
        if (!item || item.status !== 'PENDING_EXAMINATION') return;

        const membersList = Object.keys(org.members);
        const threshold = org.governanceRules.decisionThreshold;
        const vetos = org.governanceRules.canBlockVetoCountries;

        let passed = false;
        let blockedByConsensus = false;
        let vetoed = false;

        // 1. Check direct vetos (P5 / Hegemon)
        const activeVetoing = item.votesAgainst.filter(c => vetos.includes(c));
        if (activeVetoing.length > 0) {
          vetoed = true;
          passed = false;
        } else {
          // 2. Threshold calculations
          const totalVoters = item.votesFor.length + item.votesAgainst.length;
          const yesRatio = totalVoters > 0 ? item.votesFor.length / totalVoters : 0;

          if (threshold === 'UNANIMITY') {
            // Every member must say yes, or abstain (no yes/no split where NO survives)
            if (item.votesAgainst.length > 0) {
              if (org.governanceRules.agendaSettingStyle === 'CONSENSUS') {
                blockedByConsensus = true;
              } else {
                passed = false;
              }
            } else if (item.votesFor.length > 0) {
              passed = true;
            }
          } else if (threshold === 'CONSENSUS_NO_VETO') {
            if (item.votesAgainst.length > 0) {
              blockedByConsensus = true;
            } else {
              passed = true;
            }
          } else if (threshold === 'TWO_THIRDS') {
            passed = yesRatio >= (2 / 3);
          } else { // SIMPLE_MAJORITY
            passed = item.votesFor.length > item.votesAgainst.length;
          }
        }

        if (vetoed) {
          item.status = 'VETOED';
          org.cohesion.strategicCoherence = Math.max(0, org.cohesion.strategicCoherence - 15);
          draft.institutionalMemories[blocId].historyLog.unshift({
            tick: useWorldStore.getState().currentTick,
            description: `Resolution "${item.title}" blocked by heavy power veto!`,
            impactType: 'COHESION_LOSS'
          });
          useUIStore.getState().pushTerminalLine(`${blocId}: Resolution "${item.title}" vetoed. Inter-member gridlock recorded.`, 'CRITICAL');
        } else if (blockedByConsensus) {
          item.status = 'BLOCKED_BY_CONSENSUS';
          org.cohesion.strategicCoherence = Math.max(0, org.cohesion.strategicCoherence - 8);
          draft.institutionalMemories[blocId].historyLog.unshift({
            tick: useWorldStore.getState().currentTick,
            description: `Consensus failure: "${item.title}" paralyzed by division.`,
            impactType: 'COHESION_LOSS'
          });
          useUIStore.getState().pushTerminalLine(`${blocId}: consensus-based paralysis blocked resolution "${item.title}".`, 'WARNING');
        } else if (passed) {
          item.status = 'PASSED';
          org.cohesion.strategicCoherence = Math.min(100, org.cohesion.strategicCoherence + 10);
          draft.institutionalMemories[blocId].historyLog.unshift({
            tick: useWorldStore.getState().currentTick,
            description: `Resolution "${item.title}" PASSED and adopted successfully.`,
            impactType: 'COHESION_GAIN'
          });

          // Apply operational outcomes based on agenda type
          if (item.type === 'SECURITY_EXERCISE') {
            org.securityMechanism.jointExerciseReadinessBonus = Math.min(30, org.securityMechanism.jointExerciseReadinessBonus + 6);
            org.cohesion.militaryReliability = Math.min(100, org.cohesion.militaryReliability + 8);
          } else if (item.type === 'LOCAL_CURRENCY_VOTE') {
            org.economicMechanism.localCurrencySettlementActive = true;
            org.economicMechanism.localCurrencyTradeShare = Math.min(95, org.economicMechanism.localCurrencyTradeShare + 15);
            org.cohesion.economicCoordination = Math.min(100, org.cohesion.economicCoordination + 12);
            org.cohesion.sanctionsResilience = Math.min(100, org.cohesion.sanctionsResilience + 10);
          } else if (item.type === 'DEVELOPMENT_PACKAGE' && item.requiredFundingB) {
            org.economicMechanism.developmentBankReservesB = Math.max(0, org.economicMechanism.developmentBankReservesB - item.requiredFundingB);
            if (item.targetId) {
              org.economicMechanism.fundedInfrastructureProjects.push({
                id: `PROJ-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                countryId: item.targetId,
                projectCostB: item.requiredFundingB,
                deliveryProgress: 0,
                leverageYieldPoints: Math.round(item.requiredFundingB * 2.5)
              });
            }
          }

          useUIStore.getState().pushTerminalLine(`${blocId}: Resolution "${item.title}" successfully ratified and enacted.`, 'INFO');
        } else {
          item.status = 'DEFEATED';
          draft.institutionalMemories[blocId].historyLog.unshift({
            tick: useWorldStore.getState().currentTick,
            description: `Resolution "${item.title}" failed to meet majority vote margins.`,
            impactType: 'TRUST_DRAIN'
          });
          useUIStore.getState().pushTerminalLine(`${blocId}: Resolution "${item.title}" defeated.`, 'INFO');
        }
      }));
    },

    triggerArticle5: (blocId, attackerId, victimId) => {
      const id = `A5-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        const record: CollectiveDefenseTriggerRecord = {
          id,
          attackerId,
          victimId,
          triggerTick: useWorldStore.getState().currentTick,
          status: 'PENDING_CONSULTATION',
          confidenceIndex: 50,
          contributingNations: [victimId],
          refusingNations: []
        };
        org.activeCollectiveDefenseTriggers.push(record);

        draft.institutionalMemories[blocId].historyLog.unshift({
          tick: useWorldStore.getState().currentTick,
          description: `CRITICAL: Article-5-like Collective Defense obligation triggered by attack from ${attackerId} on ${victimId}!`,
          impactType: 'FRACTURE_RISK',
          relatedCountryId: victimId
        });
      }));

      useUIStore.getState().pushAlert({
        title: `🚨 ARTICLE 5 TRIGGERED: ${blocId}`,
        message: `Defense emergency protocols initiated! Attacker ${attackerId} breached Sovereign Frontiers of member state ${victimId}. Cohesion assessment pending.`,
        type: 'DANGER'
      });
      return id;
    },

    respondToArticle5: (blocId, triggerId, countryId, align) => {
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        const trigger = org.activeCollectiveDefenseTriggers.find(t => t.id === triggerId);
        if (!trigger) return;

        if (align === 'JOIN') {
          if (!trigger.contributingNations.includes(countryId)) {
            trigger.contributingNations.push(countryId);
            trigger.refusingNations = trigger.refusingNations.filter(c => c !== countryId);
          }
        } else {
          if (!trigger.refusingNations.includes(countryId)) {
            trigger.refusingNations.push(countryId);
            trigger.contributingNations = trigger.contributingNations.filter(c => c !== countryId);
          }
        }

        // Calculate confidence
        const totalMembers = Object.keys(org.members).length;
        trigger.confidenceIndex = Math.round((trigger.contributingNations.length / totalMembers) * 100);

        // Auto resolve if all voted
        const votedCount = trigger.contributingNations.length + trigger.refusingNations.length;
        if (votedCount >= totalMembers) {
          if (trigger.confidenceIndex >= 60) {
            trigger.status = 'ACTIVATED_COMMAND';
            org.cohesion.militaryReliability = Math.min(100, org.cohesion.militaryReliability + 15);
            org.cohesion.overallScore = Math.min(100, org.cohesion.overallScore + 10);
            
            // Apply defensive military bonuses or penalties to state worldStore if needed
            useUIStore.getState().pushTerminalLine(`${blocId}: Combined Strategic Command mobilized. Article 5 ACTIVE and reliable.`, 'INFO');
          } else if (trigger.confidenceIndex >= 25) {
            trigger.status = 'DILUTED';
            org.cohesion.militaryReliability = Math.max(0, org.cohesion.militaryReliability - 25);
            org.cohesion.overallScore = Math.max(0, org.cohesion.overallScore - 15);
            useUIStore.getState().pushTerminalLine(`${blocId}: Defense call diluted due to internal friction and refusal to contribute.`, 'WARNING');
          } else {
            trigger.status = 'FAILED_TO_ACT';
            org.cohesion.militaryReliability = Math.max(0, org.cohesion.militaryReliability - 50);
            org.cohesion.overallScore = Math.max(0, org.cohesion.overallScore - 35);
            useUIStore.getState().pushTerminalLine(`${blocId}: SYSTEM FAILURE. Alliances guarantee collapsed as members refused Article 5 mobilization.`, 'CRITICAL');
          }
        }
      }));
    },

    lobbyMember: (blocId, targetCountryId, lobbyAction) => {
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        const m = org.members[targetCountryId];
        if (!m) return;

        if (lobbyAction === 'AID') {
          m.trustScore = Math.min(100, m.trustScore + 18);
          m.fractureVulnerability = Math.max(0, m.fractureVulnerability - 12);
        } else if (lobbyAction === 'PRESSURE') {
          m.trustScore = Math.max(0, m.trustScore - 10);
          m.leveragePoints = Math.min(100, m.leveragePoints + 20);
        } else { // PROMISE
          m.trustScore = Math.min(100, m.trustScore + 8);
          m.leveragePoints = Math.max(0, m.leveragePoints - 15);
        }
      }));
    },

    proposeMediation: (blocId, disputeId, mediatorId) => {
      const id = `MED-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        const dispute = org.burdenSharingDisputes.find(d => d.id === disputeId);
        if (!dispute) return;

        const process: BlocMediationProcess = {
          id,
          blocId,
          disputeId,
          mediatorCountryId: mediatorId,
          concessionsProposedB: 2.5,
          successProbability: 55 + (org.cohesion.leadershipTrust * 0.2),
          status: 'ONGOING'
        };
        draft.mediationProcesses[id] = process;
        
        useUIStore.getState().pushTerminalLine(`${blocId}: Dispute mediation established. Mediator ${mediatorId} driving concessions negotiation.`, 'INFO');
      }));
      return id;
    },

    tickMediation: (mediationId) => {
      set(produce((draft: BlocState) => {
        const med = draft.mediationProcesses[mediationId];
        if (!med || med.status !== 'ONGOING') return;

        const org = draft.organizations[med.blocId];
        const dispute = org.burdenSharingDisputes.find(d => d.id === med.disputeId);
        
        if (!dispute) {
          med.status = 'COLLAPSED';
          return;
        }

        const roll = Math.random() * 100;
        if (roll < med.successProbability * 0.3) {
          // Success!
          med.status = 'RESOLVED_SUCCESS';
          org.burdenSharingDisputes = org.burdenSharingDisputes.filter(d => d.id !== med.disputeId);
          org.cohesion.strategicCoherence = Math.min(100, org.cohesion.strategicCoherence + 15);
          org.cohesion.leadershipTrust = Math.min(100, org.cohesion.leadershipTrust + 10);
          
          useUIStore.getState().pushTerminalLine(`${med.blocId}: Mediation success! Dispute between ${dispute.initiatingCountryId} and ${dispute.targetCountryId} resolved.`, 'INFO');
        } else if (roll > 90) {
          // Failure / Collapse
          med.status = 'COLLAPSED';
          dispute.intensity = Math.min(100, dispute.intensity + 20);
          org.cohesion.leadershipTrust = Math.max(0, org.cohesion.leadershipTrust - 12);
          useUIStore.getState().pushTerminalLine(`${med.blocId}: Dialogue collapsed. Disagreement intensity elevated.`, 'CRITICAL');
        } else {
          // Slide probability slightly
          med.successProbability = Math.min(95, med.successProbability + 3);
        }
      }));
    },

    lodgeBurdenSharingComplaint: (blocId, initiator, target, type) => {
      const id = `${blocId}-D-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        const newDispute: BurdenSharingDispute = {
          id,
          initiatingCountryId: initiator,
          targetCountryId: target,
          disputeType: type,
          intensity: 40,
          unresolvedTicks: 0,
          narrative: `Official complaint filed by ${initiator} accusing ${target} of ${type.replace(/_/g, ' ')}.`
        };
        org.burdenSharingDisputes.push(newDispute);

        org.members[target].trustScore = Math.max(0, org.members[target].trustScore - 15);
        org.cohesion.leadershipTrust = Math.max(0, org.cohesion.leadershipTrust - 8);

        draft.institutionalMemories[blocId].historyLog.unshift({
          tick: useWorldStore.getState().currentTick,
          description: `Dispute ${id} ignited: ${initiator} filed complaint against ${target}.`,
          impactType: 'TRUST_DRAIN',
          relatedCountryId: target
        });
      }));

      useUIStore.getState().pushTerminalLine(`${blocId}: Internal burden-sharing dispute ignited against ${target} from ${initiator}.`, 'WARNING');
      return id;
    },

    resolveBurdenSharingDispute: (blocId, disputeId, payConcession) => {
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        const dispute = org.burdenSharingDisputes.find(d => d.id === disputeId);
        if (!dispute) return;

        if (payConcession) {
          org.members[dispute.targetCountryId].accumulatedContributions += 800; // side payment counts
          org.members[dispute.targetCountryId].trustScore = Math.min(100, org.members[dispute.targetCountryId].trustScore + 20);
          org.cohesion.overallScore = Math.min(100, org.cohesion.overallScore + 8);
          org.cohesion.leadershipTrust = Math.min(100, org.cohesion.leadershipTrust + 10);
        } else {
          org.members[dispute.targetCountryId].trustScore = Math.max(0, org.members[dispute.targetCountryId].trustScore - 10);
          org.members[dispute.initiatingCountryId].trustScore = Math.max(0, org.members[dispute.initiatingCountryId].trustScore - 8);
        }

        org.burdenSharingDisputes = org.burdenSharingDisputes.filter(d => d.id !== disputeId);
        
        draft.institutionalMemories[blocId].historyLog.unshift({
          tick: useWorldStore.getState().currentTick,
          description: `Dispute ${disputeId} closed via bilateral adjustments.`,
          impactType: 'TRUST_BOOST'
        });
      }));
    },

    executeJointExercise: (blocId) => {
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        org.securityMechanism.lastExerciseTick = useWorldStore.getState().currentTick;
        org.securityMechanism.jointExerciseReadinessBonus = Math.min(50, org.securityMechanism.jointExerciseReadinessBonus + 12);
        org.cohesion.militaryReliability = Math.min(100, org.cohesion.militaryReliability + 10);
        org.cohesion.overallScore = Math.min(100, org.cohesion.overallScore + 5);

        // Deduct treasury from anchor power
        const anchorId = org.primaryAnchorPowerId;
        useWorldStore.getState().updateCountry(anchorId, (c) => {
          c.economic.treasuryCashB = Math.max(0, c.economic.treasuryCashB - 10);
        });

        draft.institutionalMemories[blocId].historyLog.unshift({
          tick: useWorldStore.getState().currentTick,
          description: `Sovereign drills successfully completed, boosting overall warfighting posture +12 pts.`,
          impactType: 'COHESION_GAIN'
        });
      }));

      useUIStore.getState().pushTerminalLine(`${blocId}: High intensity joint maneuvers executed. Members warfighting proficiency raised.`, 'INFO');
    },

    fundInfrastructureProject: (blocId, countryId, amountB) => {
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        const donorId = org.primaryAnchorPowerId;
        
        useWorldStore.getState().updateCountry(donorId, (c) => {
          c.economic.treasuryCashB = Math.max(0, c.economic.treasuryCashB - amountB);
        });

        org.economicMechanism.developmentBankReservesB += amountB * 0.8;
        org.economicMechanism.fundedInfrastructureProjects.push({
          id: `PROJ-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          countryId,
          projectCostB: amountB,
          deliveryProgress: 0,
          leverageYieldPoints: Math.round(amountB * 3)
        });

        const member = org.members[countryId];
        if (member) {
          member.trustScore = Math.min(100, member.trustScore + 15);
        }

        draft.institutionalMemories[blocId].historyLog.unshift({
          tick: useWorldStore.getState().currentTick,
          description: `Funded strategic gateway logistics project in ${countryId} for $${amountB}B.`,
          impactType: 'TRUST_BOOST',
          relatedCountryId: countryId
        });
      }));

      useUIStore.getState().pushTerminalLine(`${blocId}: Allocated infrastructure development facility for target country ${countryId}.`, 'INFO');
    },

    toggleLocalCurrencySettlement: (blocId) => {
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        org.economicMechanism.localCurrencySettlementActive = !org.economicMechanism.localCurrencySettlementActive;

        if (org.economicMechanism.localCurrencySettlementActive) {
          org.economicMechanism.localCurrencyTradeShare = Math.min(95, org.economicMechanism.localCurrencyTradeShare + 25);
          org.cohesion.sanctionsResilience = Math.min(100, org.cohesion.sanctionsResilience + 15);
          org.cohesion.economicCoordination = Math.min(100, org.cohesion.economicCoordination + 10);
        } else {
          org.economicMechanism.localCurrencyTradeShare = Math.max(0, org.economicMechanism.localCurrencyTradeShare - 30);
          org.cohesion.sanctionsResilience = Math.max(0, org.cohesion.sanctionsResilience - 15);
        }
      }));
    },

    initiateMembershipApplication: (blocId, countryId) => {
      const id = `ACC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        const newRecord: MembershipAccessionsRecord = {
          id,
          applicantCountryId: countryId,
          stage: 'DIALOGUE_PARTNER',
          startTick: useWorldStore.getState().currentTick,
          vetoingMembers: [],
          readyScore: 40
        };
        org.accessions.push(newRecord);

        draft.institutionalMemories[blocId].historyLog.unshift({
          tick: useWorldStore.getState().currentTick,
          description: `Sovereign admission application filed by state: ${countryId}. Dialog channel opened.`,
          impactType: 'TRUST_BOOST',
          relatedCountryId: countryId
        });
      }));

      useUIStore.getState().pushTerminalLine(`${blocId}: Opened dialog pipeline with applicant state ${countryId}.`, 'INFO');
    },

    advanceMembershipAccession: (blocId, applicantId, sponsorId) => {
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        const record = org.accessions.find(a => a.applicantCountryId === applicantId);
        if (!record) return;

        record.readyScore = Math.min(100, record.readyScore + 25);

        if (record.stage === 'DIALOGUE_PARTNER') {
          record.stage = 'OBSERVER';
        } else if (record.stage === 'OBSERVER') {
          record.stage = 'PROBATION';
        } else if (record.stage === 'PROBATION') {
          record.stage = 'PENDING_VOTE';
        } else if (record.stage === 'PENDING_VOTE') {
          // Autoselect outcome
          if (record.readyScore >= 75) {
            record.stage = 'ADMITTED';
            org.members[applicantId] = {
              countryId: applicantId,
              role: 'NORM_ENTREPRENEUR',
              entranceTick: useWorldStore.getState().currentTick,
              accumulatedContributions: 100,
              trustScore: 70,
              fractureVulnerability: 30,
              leveragePoints: 10
            };
            
            // Log in history
            draft.institutionalMemories[blocId].historyLog.unshift({
              tick: useWorldStore.getState().currentTick,
              description: `State ${applicantId} officially admitted as full sovereign member of ${blocId}!`,
              impactType: 'COHESION_GAIN',
              relatedCountryId: applicantId
            });
            useUIStore.getState().pushTerminalLine(`${blocId}: Expanded alliance profile! State ${applicantId} has joined as full member state.`, 'INFO');
          } else {
            record.stage = 'REJECTED';
            useUIStore.getState().pushTerminalLine(`${blocId}: Application from ${applicantId} rejected due to divergence indices.`, 'WARNING');
          }
        }
      }));
    },

    suspendMember: (blocId, countryId, reason) => {
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        org.suspensions.push({
          id: `SUSP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          countryId,
          reason,
          suspensionTick: useWorldStore.getState().currentTick,
          status: 'ACTIVE_SUSPENSION'
        });

        // Flag role
        if (org.members[countryId]) {
          org.members[countryId].role = 'RELUCTANT_PARTICIPANT';
          org.members[countryId].trustScore = Math.max(5, org.members[countryId].trustScore - 40);
        }

        org.cohesion.strategicCoherence = Math.max(0, org.cohesion.strategicCoherence - 12);

        draft.institutionalMemories[blocId].historyLog.unshift({
          tick: useWorldStore.getState().currentTick,
          description: `SUSPENDED: Member state ${countryId} suspended due to action criteria (${reason}).`,
          impactType: 'COHESION_LOSS',
          relatedCountryId: countryId
        });
      }));

      useUIStore.getState().pushTerminalLine(`${blocId}: Suspended security and voting mechanisms for state ${countryId}.`, 'CRITICAL');
    },

    exitMember: (blocId, countryId, style) => {
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        delete org.members[countryId];

        org.exits.push({
          id: `EXIT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          countryId,
          exitTick: useWorldStore.getState().currentTick,
          style,
          unrestTriggered: true
        });

        org.cohesion.overallScore = Math.max(0, org.cohesion.overallScore - 15);
        org.cohesion.strategicCoherence = Math.max(0, org.cohesion.strategicCoherence - 20);

        draft.institutionalMemories[blocId].historyLog.unshift({
          tick: useWorldStore.getState().currentTick,
          description: `MEMBERSHIP COLLAPSE: Member ${countryId} has exited the pact via ${style}.`,
          impactType: 'COHESION_LOSS',
          relatedCountryId: countryId
        });
      }));

      useUIStore.getState().pushTerminalLine(`${blocId}: Sovereign state ${countryId} has severed alignment lines and exited.`, 'CRITICAL');
    },

    engageHedgingAction: (countryId, actionType, targetBloc) => {
      set(produce((draft: BlocState) => {
        const state = draft.swingStates[countryId];
        if (!state) return;

        state.posture.tacticalAmbiguityRating = Math.min(100, state.posture.tacticalAmbiguityRating + 8);
        
        const effectiveBloc = targetBloc || (countryId === 'IN' ? 'NATO' : 'SCO');
        let payout = 0;
        if (actionType === 'DIVERSIFY_ARMS') {
          payout = 1.2;
          state.posture.lastHedgingAction = `Acquired defense systems from ${effectiveBloc} to balance strategic leverage.`;
        } else if (actionType === 'ACCEPT_ECONOMIC_CORRIDOR') {
          payout = 2.8;
          state.posture.lastHedgingAction = `Enacted sovereign gateway trade routes under the ${effectiveBloc} investment shield.`;
        } else if (actionType === 'ABSTAIN_BLOC_STATEMENT') {
          payout = 0.5;
          state.posture.lastHedgingAction = `Abstained from high-profile multilateral declarations linked with ${effectiveBloc}.`;
        } else {
          payout = 1.6;
          state.posture.lastHedgingAction = `Hosted sequential elite security summits with opposing alliance powers.`;
        }

        state.posture.concessionsExtractedB += payout;

        // Trace to country economy treasury
        useWorldStore.getState().updateCountry(countryId, (c) => {
          c.economic.treasuryCashB += payout;
        });

        useUIStore.getState().pushTerminalLine(`SWING STATE POSTURE: ${countryId} executed hedging tactic, securing $${payout}B in utility concessions.`, 'INFO');
      }));
    },

    proposeCrossBlocCBM: (channelId, title, costAP, reduction) => {
      set(produce((draft: BlocState) => {
        const ch = draft.crossBlocChannels[channelId];
        if (!ch) return;

        ch.agreedConfidenceMeasures.push(title);
        ch.lastActivityTick = useWorldStore.getState().currentTick;
        ch.integrityIndex = Math.min(100, ch.integrityIndex + 12);

        useUIStore.getState().pushTerminalLine(`CROSS-BLOC DIALOGUE: RATIFIED Confidence Building Measure "${title}" on channel ${channelId}. Deconfliction buffer improved.`, 'INFO');
      }));
    },

    auditContributions: (blocId) => {
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        Object.keys(org.members).forEach(cid => {
          const m = org.members[cid];
          const actualCountry = useWorldStore.getState().countries[cid];
          if (!actualCountry) return;

          // Determine expected contributions based on role and GDP
          // Let's abstract simulated compliance check
          const expectedCap = (actualCountry.economic.gdpB || 1000) * 0.02; // 2% gdp rule
          const actualCap = m.accumulatedContributions / 20; // scaled contribution
          
          if (actualCap < expectedCap * 0.4) {
            org.burdenSharingDisputes.push({
              id: `${blocId}-D-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
              initiatingCountryId: org.primaryAnchorPowerId,
              targetCountryId: cid,
              disputeType: 'MILITARY_UNDERFUNDING',
              intensity: 45,
              unresolvedTicks: 0,
              narrative: `Audit flagged member state ${cid} for chronic security and operational underfunding.`
            });
          }
        });
      }));
    },

    getBlocActionPreview: (blocId, agendaType) => {
      const org = get().organizations[blocId];
      let estimatedSupportPercentage = 50;
      let likelyBlockers: string[] = [];

      Object.keys(org.members).forEach(cid => {
        const m = org.members[cid];
        if (m.trustScore > 65) estimatedSupportPercentage += 8;
        else if (m.trustScore < 45) {
          estimatedSupportPercentage -= 10;
          likelyBlockers.push(cid);
        }
      });

      estimatedSupportPercentage = Math.max(10, Math.min(100, estimatedSupportPercentage));

      return {
        estimatedSupportPercentage,
        likelyBlockers,
        cohesionRisk: Math.max(5, 50 - org.cohesion.overallScore * 0.4),
        burdenSharingShiftRate: org.burdenSharingDisputes.length * 0.5,
        expectedCounterReaction: org.id === 'NATO' ? 'Rival states may execute cyber retorts or coordinate military drills.' : 'Western finance bodies might increase monitoring of credit ratings.'
      };
    },

    tickBlocSystem: (currentTick: number) => {
      set(produce((draft: BlocState) => {
        const world = useWorldStore.getState().world;
        if (!world) return;

        // A. Update every regional organization
        Object.keys(draft.organizations).forEach(bId => {
          const org = draft.organizations[bId as BlocType];

          // 1. Cohesion degradation & drift calculations
          let activeDisputesWeight = org.burdenSharingDisputes.length * 4.5;
          org.cohesion.strategicCoherence = Math.max(5, org.cohesion.strategicCoherence - (activeDisputesWeight * 0.1));
          org.cohesion.leadershipTrust = Math.max(5, org.cohesion.leadershipTrust - (activeDisputesWeight * 0.08));

          // Compute overall score average
          const avg = (
            org.cohesion.strategicCoherence + 
            org.cohesion.militaryReliability + 
            org.cohesion.economicCoordination + 
            org.cohesion.proceduralLegitimacy + 
            org.cohesion.leadershipTrust + 
            org.cohesion.sanctionsResilience
          ) / 6;
          org.cohesion.overallScore = Math.round(avg);

          // 2. Increment dispute time
          org.burdenSharingDisputes.forEach(dispute => {
            dispute.unresolvedTicks++;
            if (dispute.unresolvedTicks > 4) {
              dispute.intensity = Math.min(100, dispute.intensity + 8);
            }
          });

          // 3. Process infrastructure delivery progress
          org.economicMechanism.fundedInfrastructureProjects.forEach(proj => {
            if (proj.deliveryProgress < 100) {
              proj.deliveryProgress += Math.round(5 + Math.random() * 8);
              if (proj.deliveryProgress >= 100) {
                proj.deliveryProgress = 100;
                // Yield leverage points to member and anchor
                const m = org.members[proj.countryId];
                if (m) {
                  m.leveragePoints += proj.leverageYieldPoints;
                  m.trustScore = Math.min(100, m.trustScore + 20);
                }
                const anchorM = org.members[org.primaryAnchorPowerId];
                if (anchorM) {
                  anchorM.leveragePoints += Math.round(proj.leverageYieldPoints * 0.5);
                }
              }
            }
          });

          // 4. Resolve agenda items if votes got completed
          org.agenda.forEach(item => {
            if (item.status === 'PENDING_EXAMINATION') {
              // Simulate automatic AI voting behavior!
              Object.keys(org.members).forEach(mid => {
                // If member hasn't voted, simulated autonomous alignment
                const alreadyVoted = item.votesFor.includes(mid) || item.votesAgainst.includes(mid) || item.abstentions.includes(mid);
                if (!alreadyVoted) {
                  const mState = org.members[mid];
                  // Decides vote based on trust and opinion towards initiator
                  const opinion = useWorldStore.getState().countries[mid]?.opinions[item.initiatorId] ?? 50;
                  
                  if (mid === item.initiatorId) {
                    item.votesFor.push(mid);
                  } else if (opinion > 60 || mState.trustScore > 75) {
                    item.votesFor.push(mid);
                  } else if (opinion < 35 || mState.trustScore < 45) {
                    item.votesAgainst.push(mid);
                  } else {
                    item.abstentions.push(mid);
                  }
                }
              });

              // Resolve agenda item after votes are tallied
              // (Since AI can execute immediately, we count votes and close them inside the tick)
              const countVoted = item.votesFor.length + item.votesAgainst.length + item.abstentions.length;
              if (countVoted >= Object.keys(org.members).length) {
                // Auto solve can trigger in-line
                const threshold = org.governanceRules.decisionThreshold;
                const vetos = org.governanceRules.canBlockVetoCountries;

                let passed = false;
                let blockedByConsensus = false;
                let vetoed = false;

                const activeVetoing = item.votesAgainst.filter(c => vetos.includes(c));
                if (activeVetoing.length > 0) {
                  vetoed = true;
                } else {
                  const totalVoters = item.votesFor.length + item.votesAgainst.length;
                  const yesRatio = totalVoters > 0 ? item.votesFor.length / totalVoters : 0;

                  if (threshold === 'UNANIMITY') {
                    if (item.votesAgainst.length > 0) {
                      if (org.governanceRules.agendaSettingStyle === 'CONSENSUS') {
                        blockedByConsensus = true;
                      }
                    } else if (item.votesFor.length > 0) {
                      passed = true;
                    }
                  } else if (threshold === 'CONSENSUS_NO_VETO') {
                    if (item.votesAgainst.length > 0) {
                      blockedByConsensus = true;
                    } else {
                      passed = true;
                    }
                  } else if (threshold === 'TWO_THIRDS') {
                    passed = yesRatio >= (2 / 3);
                  } else {
                    passed = item.votesFor.length > item.votesAgainst.length;
                  }
                }

                if (vetoed) {
                  item.status = 'VETOED';
                  org.cohesion.strategicCoherence = Math.max(0, org.cohesion.strategicCoherence - 12);
                } else if (blockedByConsensus) {
                  item.status = 'BLOCKED_BY_CONSENSUS';
                  org.cohesion.strategicCoherence = Math.max(0, org.cohesion.strategicCoherence - 8);
                } else if (passed) {
                  item.status = 'PASSED';
                  org.cohesion.strategicCoherence = Math.min(100, org.cohesion.strategicCoherence + 8);
                } else {
                  item.status = 'DEFEATED';
                }
              }
            }
          });
        });

        // B. Swing States Hedging auto adjustments
        Object.keys(draft.swingStates).forEach(sid => {
          const swing = draft.swingStates[sid];
          // Slow drift and dynamic tactical posturing on every tick
          const roll = Math.random() * 100;
          if (roll < 18) {
            // Tactic triggered!
            const actions: ('DIVERSIFY_ARMS' | 'ACCEPT_ECONOMIC_CORRIDOR' | 'ABSTAIN_BLOC_STATEMENT' | 'HOST_RIVAL_LEADERS')[] = [
              'DIVERSIFY_ARMS', 'ACCEPT_ECONOMIC_CORRIDOR', 'ABSTAIN_BLOC_STATEMENT', 'HOST_RIVAL_LEADERS'
            ];
            const chosenAction = actions[Math.floor(Math.random() * actions.length)];
            const chosenBloc: BlocType = Math.random() > 0.5 ? 'NATO' : 'BRICS';
            
            swing.posture.tacticalAmbiguityRating = Math.min(100, swing.posture.tacticalAmbiguityRating + 6);
            let payout = 1;
            if (chosenAction === 'DIVERSIFY_ARMS') payout = 1.0;
            else if (chosenAction === 'ACCEPT_ECONOMIC_CORRIDOR') payout = 2.4;
            else if (chosenAction === 'ABSTAIN_BLOC_STATEMENT') payout = 0.4;
            else payout = 1.2;

            swing.posture.concessionsExtractedB += payout;
            swing.posture.lastHedgingAction = `Automated alignment deconfliction of type ${chosenAction} executed with ${chosenBloc} partner.`;

            useWorldStore.getState().updateCountry(sid, (c) => {
              c.economic.treasuryCashB += payout;
            });
          }
        });

        // C. Mediaton processing ticks
        Object.keys(draft.mediationProcesses).forEach(mid => {
          const med = draft.mediationProcesses[mid];
          if (med.status === 'ONGOING') {
            const org = draft.organizations[med.blocId];
            const dispute = org.burdenSharingDisputes.find(d => d.id === med.disputeId);
            if (!dispute) {
              med.status = 'COLLAPSED';
              return;
            }

            const roll = Math.random() * 100;
            if (roll < med.successProbability * 0.12) {
              med.status = 'RESOLVED_SUCCESS';
              org.burdenSharingDisputes = org.burdenSharingDisputes.filter(d => d.id !== med.disputeId);
              org.cohesion.strategicCoherence = Math.min(100, org.cohesion.strategicCoherence + 10);
            } else if (roll > 95) {
              med.status = 'COLLAPSED';
              dispute.intensity = Math.min(100, dispute.intensity + 15);
            }
          }
        });
      }));
    },

    proposeAllianceObjective: (blocId, obj) => {
      const id = `OBJ-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        if (!org) return;
        if (!org.objectives) {
          org.objectives = { objectives: [], lastEvaluationTick: 0, globalPrioritiesDescription: '' };
        }
        const newObj: AllianceObjective = {
          ...obj,
          id,
          status: 'ACTIVE'
        };
        org.objectives.objectives.push(newObj);
        
        draft.institutionalMemories[blocId].historyLog.unshift({
          tick: useWorldStore.getState().currentTick,
          description: `Alliance Objective proposed: "${obj.name}" (Priority: ${obj.priority}).`,
          impactType: 'TRUST_BOOST'
        });
      }));
      useUIStore.getState().pushTerminalLine(`${blocId}: Outlined new shared objective "${obj.name}". Cost: ${obj.costFinancialB}B.`, 'INFO');
      return id;
    },

    assignCoalitionTask: (blocId, assigneeId, taskType) => {
      const id = `TSK-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        if (!org) return;
        if (!org.coalitionTasking) {
          org.coalitionTasking = { activeTasks: [] };
        }
        org.coalitionTasking.activeTasks.push({
          id,
          assigneeCountryId: assigneeId,
          taskType,
          assignedBurdenScore: Math.round(15 + Math.random() * 40),
          expectedCompletionTick: useWorldStore.getState().currentTick + 4,
          actualProgress: 0,
          complianceStatus: 'PARTIAL',
          delayTicks: 0,
          narrative: `Assigned task ${taskType.replace(/_/g, ' ')} to ${assigneeId} to co-share alliance burden.`
        });
      }));
      useUIStore.getState().pushTerminalLine(`${blocId}: Assigned coalition task ${taskType} to ${assigneeId}.`, 'INFO');
      return id;
    },

    resolveCoalitionTask: (blocId, taskId, compliance) => {
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        if (!org || !org.coalitionTasking) return;
        const t = org.coalitionTasking.activeTasks.find(x => x.id === taskId);
        if (!t) return;
        t.complianceStatus = compliance;
        t.actualProgress = compliance === 'FULL' ? 100 : (compliance === 'PARTIAL' ? 50 : 10);
        
        if (org.memberProfiles && org.memberProfiles[t.assigneeCountryId]) {
          const mProf = org.memberProfiles[t.assigneeCountryId];
          const histType: MemberContributionHistory['actionType'] = 
            compliance === 'FULL' ? 'KEPT_PROMISE' :
            compliance === 'PARTIAL' ? 'HESITATED' :
            compliance === 'SYMBOLIC' ? 'BACK_PUBLIC_RESIST_PRIVATE' :
            compliance === 'OVERT_DEFECTION' ? 'BROKEN_PROMISE' : 'FREE_RODE';

          mProf.contributionHistory.push({
            tick: useWorldStore.getState().currentTick,
            objectiveId: taskId,
            actionType: histType,
            description: `Resolved coalition task ${t.taskType} with compliance: ${compliance}.`,
            costIncurredB: compliance === 'FULL' ? 1.5 : 0.2
          });

          const delta = compliance === 'FULL' ? 15 : (compliance === 'PARTIAL' ? 2 : -20);
          mProf.reliability.military = Math.max(0, Math.min(100, mProf.reliability.military + delta));
          mProf.reliability.treaty = Math.max(0, Math.min(100, mProf.reliability.treaty + delta));
          mProf.reliability.crisis = Math.max(0, Math.min(100, mProf.reliability.crisis + delta));
          
          if (compliance === 'OVERT_DEFECTION' || compliance === 'QUIET_RESISTANCE') {
            mProf.freeRidePressure.currentFreeRideIndex = Math.min(100, mProf.freeRidePressure.currentFreeRideIndex + 25);
            mProf.freeRidePressure.accumulatedResentment = Math.min(100, mProf.freeRidePressure.accumulatedResentment + 20);
          }
        }
      }));
      useUIStore.getState().pushTerminalLine(`${blocId}: Resolved task ${taskId} as ${compliance}.`, 'INFO');
    },

    courtPivotState: (pivotId, blocId, actionType, costAP, costFinancialB) => {
      const id = `CRT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const isWest = blocId === 'NATO' || blocId === 'ASEAN';
      set(produce((draft: BlocState) => {
        const pivot = draft.pivotStates[pivotId];
        if (!pivot) return;

        // Shift elite faction balance
        const balance = pivot.eliteFactionBalance;
        if (isWest) {
          const shift = Math.min(balance.proEastPercent, Math.round(5 + Math.random() * 8));
          balance.proWestPercent += shift;
          balance.proEastPercent -= shift;
          pivot.allianceAttractivenessWest = Math.min(100, pivot.allianceAttractivenessWest + 10);
        } else {
          const shift = Math.min(balance.proWestPercent, Math.round(5 + Math.random() * 8));
          balance.proEastPercent += shift;
          balance.proWestPercent -= shift;
          pivot.allianceAttractivenessEast = Math.min(100, pivot.allianceAttractivenessEast + 10);
        }

        // Adjust influence competition record
        if (draft.influenceCompetition[pivotId]) {
          const comp = draft.influenceCompetition[pivotId];
          if (isWest) {
            comp.influenceWeightWest = Math.min(100, comp.influenceWeightWest + 15);
            comp.tradeTiesWest = Math.min(100, comp.tradeTiesWest + 8);
            if (actionType === 'SECURITY_GUARANTEE' || actionType === 'ARMS_SALE') {
              comp.securityDependenceWest = Math.min(100, comp.securityDependenceWest + 12);
            }
            comp.recentDiplomacyLogs.unshift(`[Tick ${useWorldStore.getState().currentTick}] Courted via Western ${actionType}. Strategic leaning shifted.`);
          } else {
            comp.influenceWeightEast = Math.min(100, comp.influenceWeightEast + 15);
            comp.tradeTiesEast = Math.min(100, comp.tradeTiesEast + 8);
            if (actionType === 'SECURITY_GUARANTEE' || actionType === 'ARMS_SALE') {
              comp.securityDependenceEast = Math.min(100, comp.securityDependenceEast + 12);
            }
            comp.recentDiplomacyLogs.unshift(`[Tick ${useWorldStore.getState().currentTick}] Courted via Eastern ${actionType}. Strategic leaning shifted.`);
          }
        }
      }));

      // Deduct player cash if they are active country
      const activePlayerCash = usePlayerStore.getState().cashB;
      if (activePlayerCash >= costFinancialB) {
        usePlayerStore.setState({ cashB: activePlayerCash - costFinancialB });
      }

      useUIStore.getState().pushTerminalLine(`${blocId}: Initiated Courting of Pivot ${pivotId} via ${actionType}. Cost: ${costFinancialB}B.`, 'INFO');
      return id;
    },

    courtUnalignedPower: (unalignedId, blocId, bidAmountB) => {
      const id = `CBID-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      set(produce((draft: BlocState) => {
        const u = draft.unalignedPowers[unalignedId];
        if (!u) return;

        u.sidePaymentsDemandedB = Math.max(0, u.sidePaymentsDemandedB - bidAmountB * 0.5);
        u.rivalryExploitationLevel = Math.min(100, u.rivalryExploitationLevel + 10);
        
        draft.institutionalMemories[blocId].historyLog.unshift({
          tick: useWorldStore.getState().currentTick,
          description: `Offered side-payment facilitation bid of ${bidAmountB}B to court unaligned power ${unalignedId}.`,
          impactType: 'TRUST_BOOST'
        });
      }));

      // Deduct player cash if they can make it
      const activePlayerCash = usePlayerStore.getState().cashB;
      if (activePlayerCash >= bidAmountB) {
        usePlayerStore.setState({ cashB: activePlayerCash - bidAmountB });
      }

      useUIStore.getState().pushTerminalLine(`${blocId}: Transferred side-payment aid bid of ${bidAmountB}B to court Unaligned power ${unalignedId}.`, 'INFO');
      return id;
    },

    auditFreeRiders: (blocId) => {
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        if (!org) return;

        Object.keys(org.members).forEach(cid => {
          const m = org.members[cid];
          const mProf = org.memberProfiles?.[cid];
          
          if (m.role === 'FREE_RIDER' && mProf) {
            mProf.freeRidePressure.currentFreeRideIndex = Math.min(100, mProf.freeRidePressure.currentFreeRideIndex + 15);
            mProf.freeRidePressure.accumulatedResentment = Math.min(100, mProf.freeRidePressure.accumulatedResentment + 25);
            mProf.freeRidePressure.activeAuditing = true;
            
            org.burdenSharingDisputes.push({
              id: `${blocId}-D-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
              initiatingCountryId: org.primaryAnchorPowerId,
              targetCountryId: cid,
              disputeType: 'MILITARY_UNDERFUNDING',
              intensity: 70,
              unresolvedTicks: 0,
              narrative: `Audit identified substantial contribution shortfall by state ${cid}.`
            });
          }
        });

        draft.institutionalMemories[blocId].historyLog.unshift({
          tick: useWorldStore.getState().currentTick,
          description: `Formal alliance contribution audit conducted. Core disputes logged.`,
          impactType: 'FRACTURE_RISK'
        });
      }));
      useUIStore.getState().pushTerminalLine(`${blocId}: Audit finalized. Burden sharing deficit warning dispatches emitted.`, 'WARNING');
    },

    reconcileFracture: (blocId) => {
      set(produce((draft: BlocState) => {
        const org = draft.organizations[blocId];
        if (!org) return;

        if (org.fractureModel) {
          org.fractureModel.fractureRiskIndex = Math.max(0, org.fractureModel.fractureRiskIndex - 25);
          org.fractureModel.reconciliationFeasibility = Math.min(100, org.fractureModel.reconciliationFeasibility + 15);
        }
        
        org.cohesion.overallScore = Math.min(100, org.cohesion.overallScore + 10);
        org.cohesion.strategicCoherence = Math.min(100, org.cohesion.strategicCoherence + 12);
        
        draft.institutionalMemories[blocId].historyLog.unshift({
          tick: useWorldStore.getState().currentTick,
          description: `Strategic consensus summit held to reconcile internal fracture lines.`,
          impactType: 'COHESION_GAIN'
        });
      }));
      useUIStore.getState().pushTerminalLine(`${blocId}: De-escalated fracture pressures via conciliation framework.`, 'INFO');
    },
  };
});
