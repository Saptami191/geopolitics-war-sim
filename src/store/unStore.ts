import { create } from 'zustand';
import { produce } from 'immer';
import { useWorldStore } from './worldStore';
import { usePlayerStore } from './playerStore';
import { useUIStore } from './uiStore';
import { audio } from '../utils/audio';
import { 
  UNSCResolution, 
  ResolutionClause, 
  UNSCVoteRecord, 
  VetoRecord, 
  ResolutionLobbyState, 
  DiplomaticDebtEntry, 
  EmergencySpecialSessionRecord, 
  LegalEvidenceBundle, 
  ICJCaseRecord, 
  ReputationShiftRecord, 
  InstitutionalMemoryRecord, 
  TribunalEscalationRecord, 
  InstitutionalActionPreview,
  ReputationDimension
} from '../types';

interface UNStoreState {
  resolutions: Record<string, UNSCResolution>;
  activeResolutionId: string | null;
  draftResolution: Partial<UNSCResolution> | null;
  lobbyStates: Record<string, ResolutionLobbyState>;
  diplomaticDebtLedger: Record<string, DiplomaticDebtEntry>;
  specialSessions: Record<string, EmergencySpecialSessionRecord>;
  icjCases: Record<string, ICJCaseRecord>;
  tribunals: Record<string, TribunalEscalationRecord>;
  reputationShifts: ReputationShiftRecord[];
  institutionalMemories: Record<string, InstitutionalMemoryRecord>;
  unscReformStatus: {
    reformCoersionLevel: number; // 0-100 progress threshold
    activeReformCrisis: boolean;
    accumulatedGridlocks: number;
    reformSponsors: string[];
  };
  initialized: boolean;
}

interface UNStoreActions {
  initializeUNStore: () => void;
  createDraftResolution: (creatorId: string, targetId: string) => void;
  updateDraftTitle: (title: string) => void;
  updateDraftRationale: (rationale: string) => void;
  addDraftClause: (clause: ResolutionClause) => void;
  removeDraftClause: (clauseId: string) => void;
  setDraftLegalStyle: (style: UNSCResolution['legalBasisStyle']) => void;
  tableDraftResolution: () => string;
  toggleSponsorship: (resolutionId: string, countryId: string, role: 'SPONSOR' | 'CO_SPONSOR' | 'QUIET_BACKER') => void;
  lobbyCountry: (resolutionId: string, targetCountryId: string, argumentStyle: 'HUMANITARIAN' | 'LEGAL' | 'SECURITY' | 'REALPOLITIK', costMultiplier?: number) => void;
  proposeVoteTrade: (debtorId: string, creditorId: string, dealType: DiplomaticDebtEntry['dealType'], description: string, magnitude: number, linkedResId?: string) => string;
  callInDiplomaticDebt: (debtId: string, linkedResolutionId: string) => void;
  executeUNSCVote: (resolutionId: string) => void;
  triggerEmergencySpecialSession: (resolutionId: string) => string;
  fileLegalReferral: (applicantId: string, respondentId: string, claimType: ICJCaseRecord['claimType'], evidence: LegalEvidenceBundle) => string;
  escalateCaseToTribunal: (caseId: string, namedResponsibilitySubject: string) => string;
  triggerNuclearCondemnation: (initiatorCountryId: string, targetCountryId: string, yieldKt: number) => string;
  applyReputationShift: (countryId: string, dimension: ReputationDimension, delta: number, reason: string) => void;
  triggerUNSCReformCrisis: () => void;
  voteInReformCrisis: (countryId: string, voteFor: boolean) => void;
  getResolutionPreview: (resId: string) => InstitutionalActionPreview;
  tickUNSystem: (currentTick: number) => void;
  runAILobbyingAndAuthoring: (currentTick: number) => void;
}

export const useUNStore = create<UNStoreState & UNStoreActions>((set, get) => ({
  resolutions: {},
  activeResolutionId: null,
  draftResolution: null,
  lobbyStates: {},
  diplomaticDebtLedger: {},
  specialSessions: {},
  icjCases: {},
  tribunals: {},
  reputationShifts: [],
  institutionalMemories: {},
  unscReformStatus: {
    reformCoersionLevel: 0,
    activeReformCrisis: false,
    accumulatedGridlocks: 0,
    reformSponsors: []
  },
  initialized: false,

  initializeUNStore: () => {
    if (get().initialized) return;

    // Seed robust institutional memory blocks for players
    const countries = ['US', 'GB', 'FR', 'DE', 'RU', 'CN', 'JP', 'KR', 'IR', 'KP', 'IN', 'IL', 'SA', 'BR'];
    const seededMemories: Record<string, InstitutionalMemoryRecord> = {};
    countries.forEach(cid => {
      seededMemories[cid] = {
        id: `MEM-${cid}`,
        countryId: cid,
        habitualVetoCount: cid === 'RU' ? 8 : cid === 'US' ? 6 : cid === 'CN' ? 4 : 1,
        opportunisticAbstentions: cid === 'CN' ? 7 : cid === 'IN' ? 5 : 2,
        goodFaithDebtRatio: cid === 'GB' || cid === 'DE' ? 0.95 : cid === 'RU' || cid === 'CN' ? 0.70 : 0.85,
        frivolousReferralCount: cid === 'KP' ? 3 : cid === 'RU' ? 2 : 0,
        democraticNormEntrepreneurship: cid === 'US' || cid === 'GB' || cid === 'FR' ? 75 : cid === 'DE' ? 80 : 35,
        sabotageActsCount: cid === 'KP' || cid === 'IR' ? 4 : cid === 'RU' ? 3 : 0
      };
    });

    const currentTick = useWorldStore.getState().currentTick;

    // Seed realistic scenarios on deployment to make dashboard feel alive immediately
    // Case 1: Condemnation resolution targeted at Russian expansions, likely to face Russian veto
    const res1: UNSCResolution = {
      id: 'UNSC-RES-112',
      title: 'RESOLUTION 112: FORMAL CONDEMNATION OF HARBINGERS BORDER EXCLUSIONS',
      preambularRationale: 'Rejecting unilateral territorial delineations that subvert regional sovereignty principles.',
      creatorId: 'US',
      sponsors: ['US', 'GB'],
      coSponsors: ['FR', 'DE', 'JP'],
      quietBackers: ['KR'],
      clauses: [
        {
          id: 'CL-01',
          category: 'CONDEMN',
          description: 'Demands immediate halt to militarized border posts inside grey zones',
          targetCountryId: 'RU',
          severityWeight: 60,
          reputationalRiskWeight: 20
        },
        {
          id: 'CL-02',
          category: 'INVESTIGATION_MANDATE',
          description: 'Establish neutral observer presence tracking signals activity',
          targetCountryId: 'RU',
          severityWeight: 45,
          reputationalRiskWeight: 15
        }
      ],
      status: 'SPONSORSHIP_STAGE',
      targetCountryId: 'RU',
      roundIntroduced: 1,
      tickIntroduced: currentTick - 5,
      enforcementStrength: 65,
      reviewWindowTicks: 24,
      legalBasisStyle: 'CHARTER_CHAP_VI'
    };

    // Case 2: Sanctions Resolution on covert weapons manufacturing requiring co-sponsors
    const res2: UNSCResolution = {
      id: 'UNSC-RES-113',
      title: 'RESOLUTION 113: INTEGRATED BLOCKADE ON NUCLEAR RE-ENQUIRY SITES',
      preambularRationale: 'Gravely concerned with reports regarding centrifugal purification rate spikes in covert sovereign tunnels.',
      creatorId: 'GB',
      sponsors: ['GB'],
      coSponsors: ['US', 'FR'],
      quietBackers: [],
      clauses: [
        {
          id: 'CL-03',
          category: 'ARMS_EMBARGO',
          description: 'Interdict high-grade nickel and specialized computer controllers imports',
          targetCountryId: 'IR',
          severityWeight: 85,
          reputationalRiskWeight: 40
        }
      ],
      status: 'LOBBYING_STAGE',
      targetCountryId: 'IR',
      roundIntroduced: 1,
      tickIntroduced: currentTick - 3,
      enforcementStrength: 90,
      reviewWindowTicks: 40,
      legalBasisStyle: 'CHARTER_CHAP_VII'
    };

    // Case 3: Vetoed Case 3 that has an Active Emergency Special Session (ESS) pending player interaction
    const res3: UNSCResolution = {
      id: 'UNSC-RES-110',
      title: 'RESOLUTION 110: MILITARY SANCTIONS AND ASYMMETRIC FLIGHT RESTRAINT BAN',
      preambularRationale: 'Responding to intensive tactical cruise deployments spanning urban command corridors.',
      creatorId: 'US',
      sponsors: ['US', 'GB'],
      coSponsors: ['FR', 'KR'],
      quietBackers: [],
      clauses: [
        {
          id: 'CL-04',
          category: 'NO_FLY_ZONE',
          description: 'Establishes persistent interdiction grids blocking aerial assault vehicles',
          targetCountryId: 'KP',
          severityWeight: 95,
          reputationalRiskWeight: 75
        }
      ],
      status: 'VETOED',
      targetCountryId: 'KP',
      roundIntroduced: 1,
      tickIntroduced: currentTick - 12,
      tickResolved: currentTick - 10,
      enforcementStrength: 95,
      reviewWindowTicks: 30,
      legalBasisStyle: 'CHARTER_CHAP_VII',
      voteRecord: {
        resolutionId: 'UNSC-RES-110',
        votesFor: ['US', 'GB', 'FR', 'DE', 'JP', 'KR'],
        votesAgainst: ['CN', 'RU'],
        votesAbstain: ['IN'],
        passed: false,
        vetoed: true,
        vetoingP5s: ['CN', 'RU'],
        tickHeld: currentTick - 10
      },
      vetoRecord: {
        resolutionId: 'UNSC-RES-110',
        vetoingCountryId: 'CN',
        motive: 'SPHERE_OF_INFLUENCE',
        diplomaticCostIncurred: 45
      }
    };

    // Seed Lobby Status for active cases
    const lStates: Record<string, ResolutionLobbyState> = {
      'UNSC-RES-112': {
        resolutionId: 'UNSC-RES-112',
        lobbyProgressByCountry: {
          FR: { intention: 'FOR', leverageApplied: 10, inducementsPromised: [], reputationLeverageUsed: false, blocPressureStrength: 30, argumentStyleUsed: 'LEGAL' },
          JP: { intention: 'FOR', leverageApplied: 25, inducementsPromised: ['Shared radar scans'], reputationLeverageUsed: true, blocPressureStrength: 45, argumentStyleUsed: 'HUMANITARIAN' },
          RU: { intention: 'AGAINST', leverageApplied: 0, inducementsPromised: [], reputationLeverageUsed: false, blocPressureStrength: 0, argumentStyleUsed: 'REALPOLITIK' },
          CN: { intention: 'ABSTAIN', leverageApplied: 15, inducementsPromised: [], reputationLeverageUsed: false, blocPressureStrength: 10, argumentStyleUsed: 'REALPOLITIK' },
          IN: { intention: 'ABSTAIN', leverageApplied: 5, inducementsPromised: [], reputationLeverageUsed: false, blocPressureStrength: 5, argumentStyleUsed: 'REALPOLITIK' }
        }
      },
      'UNSC-RES-113': {
        resolutionId: 'UNSC-RES-113',
        lobbyProgressByCountry: {
          US: { intention: 'FOR', leverageApplied: 40, inducementsPromised: [], reputationLeverageUsed: true, blocPressureStrength: 60, argumentStyleUsed: 'SECURITY' },
          CN: { intention: 'AGAINST', leverageApplied: 10, inducementsPromised: [], reputationLeverageUsed: false, blocPressureStrength: 20, argumentStyleUsed: 'SECURITY' },
          FR: { intention: 'FOR', leverageApplied: 20, inducementsPromised: [], reputationLeverageUsed: false, blocPressureStrength: 15, argumentStyleUsed: 'LEGAL' },
          IN: { intention: 'ABSTAIN', leverageApplied: 30, inducementsPromised: ['Bilateral tariff concession waiver'], reputationLeverageUsed: false, blocPressureStrength: 10, argumentStyleUsed: 'LEGAL' }
        }
      }
    };

    // Seed Diplomatic Debt Ledger (e.g. US already traded support with GB, but owes GB on an issue)
    const dLedger: Record<string, DiplomaticDebtEntry> = {
      'DEBT-01': {
        id: 'DEBT-01',
        debtorId: 'US',
        creditorId: 'GB',
        linkedResolutionId: 'UNSC-RES-110',
        dealType: 'VOTE_SUPPORT',
        description: 'Voted yes on regional disengagement deployment in the South Seas',
        magnitude: 3,
        tickIncurred: currentTick - 20,
        horizonTicks: 50,
        isPublic: true,
        isHardObligation: true,
        status: 'ACTIVE'
      },
      'DEBT-02': {
        id: 'DEBT-02',
        debtorId: 'CN',
        creditorId: 'IR',
        linkedResolutionId: 'UNSC-RES-113',
        dealType: 'VOTE_ABSTAIN',
        description: 'Agreed to soften oil embargo enforcement language in exchange for strategic base accesses',
        magnitude: 4,
        tickIncurred: currentTick - 15,
        horizonTicks: 60,
        isPublic: false,
        isHardObligation: true,
        status: 'ACTIVE'
      }
    };

    // Seed International Court of Justice Case (e.g. War crimes accusations against Russia filed by Germany)
    const evidence1: LegalEvidenceBundle = {
      id: 'EVI-01',
      claimType: 'SOVEREIGNTY_VIOLATION',
      targetCountryId: 'RU',
      factualAllegations: ['Intercepted tactical command logs order deliberate deployment across regional buffer zones'],
      sourceProvenance: 'SIGINT',
      intelligenceConfidence: 'HIGH',
      admissibilityScore: 82,
      corroborationState: 'SUBSTANTIAL',
      politicalContaminationRisk: 15,
      publicityLevel: 'PUBLIC_LEGITIMIZED'
    };

    const case1: ICJCaseRecord = {
      id: 'ICJ-CASE-001',
      applicantId: 'US',
      respondentId: 'RU',
      claimType: 'SOVEREIGNTY_VIOLATION',
      evidenceBundle: evidence1,
      proceduralStage: 'HEARINGS',
      proceduralTicksElapsed: 12,
      ticksToNextStage: 8,
      interimMeasuresDecreed: 'Order of freezing tactical military installations in the Black Trench',
      tickFiled: currentTick - 20
    };

    // Seed Tribunal Escalation Case (War-crime tribunal escalation against North Korean generals)
    const trib1: TribunalEscalationRecord = {
      id: 'TRIB-KP-01',
      associatedCaseId: 'ICJ-CASE-DEFAULT',
      targetCountryId: 'KP',
      escalationLevel: 'INVESTIGATIVE_PANEL',
      namedResponsibilitySubject: 'Logistical Command Directorate',
      evidenceCorroborated: true,
      internationalConsequencesRating: 6,
      linkedEventLogs: ['Commission verified trace components matching forbidden biological agents in tested aquifers.'],
      status: 'ACTIVE',
      tickInitiated: currentTick - 18
    };

    set({
      resolutions: {
        'UNSC-RES-112': res1,
        'UNSC-RES-113': res2,
        'UNSC-RES-110': res3
      },
      lobbyStates: lStates,
      diplomaticDebtLedger: dLedger,
      icjCases: {
        'ICJ-CASE-001': case1
      },
      tribunals: {
        'TRIB-KP-01': trib1
      },
      institutionalMemories: seededMemories,
      initialized: true
    });
  },

  createDraftResolution: (creatorId, targetId) => {
    const currentTick = useWorldStore.getState().currentTick;
    const initialDraft: Partial<UNSCResolution> = {
      id: `UNSC-DRAFT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      title: 'DRAFT UNSC RESOLUTION: ENFORCE RULE OF LAW AND STRATEGIC RESTRAINT',
      preambularRationale: 'Fully conscious of historical limits, calling on sovereign actors to comply with rules-based regional security arrangements.',
      creatorId,
      sponsors: [creatorId],
      coSponsors: [],
      quietBackers: [],
      clauses: [],
      status: 'DRAFT',
      targetCountryId: targetId,
      roundIntroduced: 1,
      tickIntroduced: currentTick,
      enforcementStrength: 50,
      reviewWindowTicks: 20,
      legalBasisStyle: 'CHARTER_CHAP_VI'
    };

    set({ draftResolution: initialDraft });
  },

  updateDraftTitle: (title) => set(produce(s => {
    if (s.draftResolution) {
      s.draftResolution.title = title.toUpperCase();
    }
  })),

  updateDraftRationale: (rationale) => set(produce(s => {
    if (s.draftResolution) {
      s.draftResolution.preambularRationale = rationale;
    }
  })),

  addDraftClause: (clause) => set(produce(s => {
    if (s.draftResolution) {
      if (!s.draftResolution.clauses) s.draftResolution.clauses = [];
      s.draftResolution.clauses.push(clause);
    }
  })),

  removeDraftClause: (clauseId) => set(produce(s => {
    if (s.draftResolution && s.draftResolution.clauses) {
      s.draftResolution.clauses = s.draftResolution.clauses.filter((c: any) => c.id !== clauseId);
    }
  })),

  setDraftLegalStyle: (style) => set(produce(s => {
    if (s.draftResolution) {
      s.draftResolution.legalBasisStyle = style;
    }
  })),

  tableDraftResolution: () => {
    const draft = get().draftResolution;
    if (!draft || !draft.id) return '';

    const finalRes: UNSCResolution = {
      ...(draft as UNSCResolution),
      status: 'SPONSORSHIP_STAGE'
    };

    set(produce(s => {
      s.resolutions[finalRes.id] = finalRes;
      s.lobbyStates[finalRes.id] = {
        resolutionId: finalRes.id,
        lobbyProgressByCountry: {}
      };
      s.draftResolution = null;
    }));

    useWorldStore.getState().addGlobalEvent(`UNSC TABLED: New resolution draft "${finalRes.title}" is officially tabled by ${finalRes.creatorId}.`, 'INFO');
    audio.sfxUNVote();
    return finalRes.id;
  },

  toggleSponsorship: (resId, countryId, role) => set(produce(s => {
    const res = s.resolutions[resId];
    if (!res) return;

    if (role === 'SPONSOR') {
      if (!res.sponsors.includes(countryId)) {
        res.sponsors.push(countryId);
        res.coSponsors = res.coSponsors.filter((c: string) => c !== countryId);
        res.quietBackers = res.quietBackers.filter((c: string) => c !== countryId);
      } else {
        res.sponsors = res.sponsors.filter((c: string) => c !== countryId);
      }
    } else if (role === 'CO_SPONSOR') {
      if (!res.coSponsors.includes(countryId)) {
        res.coSponsors.push(countryId);
        res.sponsors = res.sponsors.filter((c: string) => c !== countryId);
        res.quietBackers = res.quietBackers.filter((c: string) => c !== countryId);
      } else {
        res.coSponsors = res.coSponsors.filter((c: string) => c !== countryId);
      }
    } else if (role === 'QUIET_BACKER') {
      if (!res.quietBackers.includes(countryId)) {
        res.quietBackers.push(countryId);
        res.sponsors = res.sponsors.filter((c: string) => c !== countryId);
        res.coSponsors = res.coSponsors.filter((c: string) => c !== countryId);
      } else {
        res.quietBackers = res.quietBackers.filter((c: string) => c !== countryId);
      }
    }
  })),

  lobbyCountry: (resId, targetCountryId, argumentStyle) => {
    audio.sfxKeyClick();
    const playerCId = usePlayerStore.getState().countryId;
    const countries = useWorldStore.getState().countries;
    const playerCountry = countries[playerCId];

    // Deduct diplomatic/economic lobby expenses
    const lobbyCost = 2.5; // $2.5B direct diplomatic support/funding cost
    if (playerCountry.economic.treasuryCashB < lobbyCost) {
      useUIStore.getState().pushAlert({
        title: 'RESERVES LOWER BOUND',
        message: `Lobby cost ($${lobbyCost}B) exceeds the sovereign treasury limits.`,
        type: 'DANGER'
      });
      return;
    }

    usePlayerStore.setState(s => ({ cashB: s.cashB - lobbyCost }));
    usePlayerStore.getState().syncCashToCountry();

    set(produce(s => {
      const lobbyState = s.lobbyStates[resId];
      if (!lobbyState) return;

      const progress = lobbyState.lobbyProgressByCountry[targetCountryId] || {
        intention: 'ABSTAIN',
        leverageApplied: 0,
        inducementsPromised: [],
        reputationLeverageUsed: false,
        blocPressureStrength: 0,
        argumentStyleUsed: argumentStyle
      };

      progress.leverageApplied += 25;
      progress.argumentStyleUsed = argumentStyle;

      // Determine vote alignment based on alignment with US or bloc relations
      const opinionOfPlayer = countries[targetCountryId]?.opinions[playerCId] ?? 50;
      const totalSwayValue = progress.leverageApplied + opinionOfPlayer * 0.4;

      if (totalSwayValue > 70) {
        progress.intention = 'FOR';
      } else if (totalSwayValue < 35) {
        progress.intention = 'AGAINST';
      } else {
        progress.intention = 'ABSTAIN';
      }

      lobbyState.lobbyProgressByCountry[targetCountryId] = progress;
    }));

    useUIStore.getState().pushAlert({
      title: 'LOBBY ATTEMPT AUTHORIZED',
      message: `Envoys deployed to ${targetCountryId} utilizing ${argumentStyle} rationale. Intention updated.`,
      type: 'INFO'
    });
  },

  proposeVoteTrade: (debtorId, creditorId, dealType, description, magnitude, linkedResId) => {
    audio.sfxSuccessConfirmation();
    const currentTick = useWorldStore.getState().currentTick;
    const debtId = `DEBT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newDebt: DiplomaticDebtEntry = {
      id: debtId,
      debtorId,
      creditorId,
      linkedResolutionId: linkedResId,
      dealType,
      description,
      magnitude,
      tickIncurred: currentTick,
      horizonTicks: 40,
      isPublic: true,
      isHardObligation: true,
      status: 'ACTIVE'
    };

    set(produce(s => {
      s.diplomaticDebtLedger[debtId] = newDebt;
    }));

    useWorldStore.getState().addGlobalEvent(`VOTE TRADE SIGNED: ${debtorId} pledged future ${dealType} to ${creditorId} on: "${description}".`, 'INFO');
    return debtId;
  },

  callInDiplomaticDebt: (debtId, linkedResolutionId) => {
    audio.sfxIntelChime();
    const currentTick = useWorldStore.getState().currentTick;
    const debt = get().diplomaticDebtLedger[debtId];
    if (!debt || debt.status !== 'ACTIVE') return;

    set(produce(s => {
      const targetDebt = s.diplomaticDebtLedger[debtId];
      targetDebt.status = 'CALLED_IN';
      targetDebt.repayTick = currentTick;

      // Make debtor vote aligned instantly with the creditor's wishes!
      const lobbyState = s.lobbyStates[linkedResolutionId];
      if (lobbyState) {
        lobbyState.lobbyProgressByCountry[debt.debtorId] = {
          intention: 'FOR', // Aligned with sponsor
          leverageApplied: 100,
          inducementsPromised: ['Debt Called In'],
          reputationLeverageUsed: true,
          blocPressureStrength: 80,
          argumentStyleUsed: 'REALPOLITIK'
        };
      }
    }));

    // Post to logs
    const msg = `Sovereign ${debt.debtorId} had transaction debt called by ${debt.creditorId}. Envoiced to support Resolution: ${linkedResolutionId}.`;
    useWorldStore.getState().addGlobalEvent(msg, 'INFO');
    useUIStore.getState().pushAlert({
      title: 'DEBT CALLED IN',
      message: `${debt.debtorId} pledged vector aligned as repayment. Check Horseshoe.`,
      type: 'INFO'
    });
  },

  executeUNSCVote: (resId) => {
    audio.sfxUNVote();
    const currentTick = useWorldStore.getState().currentTick;
    const res = get().resolutions[resId];
    const lobby = get().lobbyStates[resId];
    if (!res || res.status === 'PASSED' || res.status === 'VETOED' || res.status === 'FAILED') return;

    // Define P5 members: permanent nations that wield veto power
    const P5 = ['US', 'RU', 'CN', 'GB', 'FR'];
    const nations = ['US', 'RU', 'CN', 'GB', 'FR', 'DE', 'JP', 'KR', 'IN', 'IL', 'SA', 'BR'];

    const votesFor: string[] = [];
    const votesAgainst: string[] = [];
    const votesAbstain: string[] = [];
    const vetoingP5s: string[] = [];

    // Calculate votes based on bloc and lobby statuses
    nations.forEach(cid => {
      const lobbyProgress = lobby?.lobbyProgressByCountry[cid];
      if (lobbyProgress) {
        if (lobbyProgress.intention === 'FOR') votesFor.push(cid);
        else if (lobbyProgress.intention === 'AGAINST') votesAgainst.push(cid);
        else votesAbstain.push(cid);
      } else {
        // Fallback default logic if not lobbied
        const country = useWorldStore.getState().countries[cid];
        const opinionOfCreator = country?.opinions[res.creatorId] ?? 50;

        if (cid === res.creatorId || res.sponsors.includes(cid) || res.coSponsors.includes(cid)) {
          votesFor.push(cid);
        } else if (res.targetCountryId === cid) {
          votesAgainst.push(cid);
        } else if (country?.allianceBlock === 'NATO' && ['US', 'GB', 'FR'].includes(res.creatorId)) {
          votesFor.push(cid);
        } else if (country?.allianceBlock === 'BRICS' && ['CN', 'RU'].includes(res.creatorId)) {
          votesFor.push(cid);
        } else if (opinionOfCreator > 65) {
          votesFor.push(cid);
        } else if (opinionOfCreator < 35) {
          votesAgainst.push(cid);
        } else {
          votesAbstain.push(cid);
        }
      }
    });

    // Check if any P5 voted against. A P5 voting against a substantive Chap VII or Chap VI resolution acts as a Veto!
    P5.forEach(cid => {
      if (votesAgainst.includes(cid)) {
        vetoingP5s.push(cid);
      }
    });

    const isVetoed = vetoingP5s.length > 0;
    const passesSufficientMajorities = votesFor.length >= 9; // Core rule: 9 positive votes required for UN Security Council passage
    const finalPassed = passesSufficientMajorities && !isVetoed;

    let finalStatus: UNSCResolution['status'] = 'PASSED';
    if (isVetoed) {
      finalStatus = 'VETOED';
    } else if (!passesSufficientMajorities) {
      finalStatus = 'FAILED';
    }

    set(produce(s => {
      const activeRes = s.resolutions[resId];
      activeRes.status = finalStatus;
      activeRes.tickResolved = currentTick;
      activeRes.voteRecord = {
        resolutionId: resId,
        votesFor,
        votesAgainst,
        votesAbstain,
        passed: finalPassed,
        vetoed: isVetoed,
        vetoingP5s,
        tickHeld: currentTick
      };

      if (isVetoed) {
        s.unscReformStatus.accumulatedGridlocks += 1;

        // Create the Veto Record for the first vetoer
        activeRes.vetoRecord = {
          resolutionId: resId,
          vetoingCountryId: vetoingP5s[0],
          motive: vetoingP5s[0] === 'RU' ? 'ALLIANCE_PROTECTION' : 'SPHERE_OF_INFLUENCE',
          diplomaticCostIncurred: 40
        };

        // Penalize the vetoer's dimensional reputations
        vetoingP5s.forEach(v => {
          s.reputationShifts.push({
            id: `REP-${v}-${currentTick}`,
            countryId: v,
            dimension: 'obstructionism',
            delta: 15,
            reason: `Vetoed resolution ${resId} targeting regional de-escalations.`,
            tickIncurred: currentTick
          });

          s.reputationShifts.push({
            id: `REP-${v}-legality-${currentTick}`,
            countryId: v,
            dimension: 'legality',
            delta: -10,
            reason: `Vetoed tabled UNSC de-escalation framework.`,
            tickIncurred: currentTick
          });
        });
      }

      // If passed, apply active geopolitical consequence changes to target countries!
      if (finalPassed) {
        const target = useWorldStore.getState().countries[res.targetCountryId];
        if (target) {
          // If arms embargo or sanctions, apply constraints directly to target!
          res.clauses.forEach(clause => {
            if (clause.category === 'ECONOMIC_SANCTIONS' || clause.category === 'ARMS_EMBARGO') {
              // Apply economic friction
              useWorldStore.getState().updateCountry(res.targetCountryId, draft => {
                draft.economic.gdpGrowthRate = Math.max(-0.08, draft.economic.gdpGrowthRate - 0.015);
                draft.political.stabilityIndex = Math.max(10, draft.political.stabilityIndex - 12);
              });
            } else if (clause.category === 'DEMAND_CEASEFIRE') {
              // Trigger truce options and lower conflict escalations
              useWorldStore.getState().updateCountry(res.targetCountryId, draft => {
                draft.political.popularUnrest = Math.max(0, draft.political.popularUnrest - 10);
              });
            }
          });
        }
      }
    }));

    // Post global event
    let eventText = `UNSC DECREE Passed! Resolution "${res.title}" passed successfully. Enforcing strategic penalties on ${res.targetCountryId}.`;
    if (finalStatus === 'VETOED') {
      eventText = `UNSC GRIDLOCK: Resolution "${res.title}" was BLOCK-VETOED by P5 nations [${vetoingP5s.join(', ')}].`;
    } else if (finalStatus === 'FAILED') {
      eventText = `UNSC REJECTION: Resolution "${res.title}" failed to accumulate sufficient votes. (Received ${votesFor.length}/9 minimum votes).`;
    }

    useWorldStore.getState().addGlobalEvent(eventText, finalStatus === 'PASSED' ? 'INFO' : 'WARNING');
  },

  triggerEmergencySpecialSession: (resId) => {
    audio.sfxKlaxon();
    const currentTick = useWorldStore.getState().currentTick;
    const res = get().resolutions[resId];
    if (!res || res.status !== 'VETOED') return '';

    const essId = `ESS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Convene deadlocked General Assembly (abstraction voting of 193 nations)
    // Broad assembly represents high soft-power support for non-interventions
    const votesFor = ['US', 'GB', 'FR', 'DE', 'JP', 'KR', 'IN', 'BR', 'CA', 'AU', 'UA'];
    const votesAgainst = ['RU', 'CN', 'KP', 'IR', 'SY', 'BY'];
    const votesAbstain = ['SA', 'ZA', 'EG', 'PK'];

    // Veto power DOES NOT apply inside General Assembly Emergency Special Sessions!
    const passed = votesFor.length > votesAgainst.length;

    const session: EmergencySpecialSessionRecord = {
      id: essId,
      deadlockedResolutionId: resId,
      conveningSponsors: res.sponsors,
      votesFor,
      votesAgainst,
      votesAbstain,
      outcomeSummary: passed 
        ? `Passed GA Resolution ESS-Bypass! Heavily elevated global soft power. Cast severe moral condemnation against vetoing powers [${res.voteRecord?.vetoingP5s.join(', ')}]` 
        : `Emergency special session convened but failed to achieve required multi-bloc declarations.`,
      tickConvened: currentTick,
      softPowerShiftMagnitude: 35
    };

    set(produce(s => {
      s.specialSessions[essId] = session;
      
      // Inflict heavy moral and legitimacy damage on the original vetoing powers
      if (passed && res.voteRecord?.vetoingP5s) {
        res.voteRecord.vetoingP5s.forEach(v => {
          s.reputationShifts.push({
            id: `REP-${v}-moral-${currentTick}`,
            countryId: v,
            dimension: 'humanitarianCredibility',
            delta: -25, // heavy soft-power hit
            reason: `Moral condemnation issued in General Assembly Emergency Special Session ${essId}.`,
            tickIncurred: currentTick
          });

          s.reputationShifts.push({
            id: `REP-${v}-legit-${currentTick}`,
            countryId: v,
            dimension: 'interventionLegitimacy',
            delta: -20,
            reason: `Global bypass of Security Council Veto via Emergency Special Session.`,
            tickIncurred: currentTick
          });
        });
      }
    }));

    useWorldStore.getState().addGlobalEvent(`GENERAL ASSEMBLY ESS: Deadlock bypassed regarding "${res.title}". Resolution approved with moral-binding force!`, 'INFO');
    return essId;
  },

  fileLegalReferral: (applicantId, respondentId, claimType, evidence) => {
    audio.sfxIntelChime();
    const currentTick = useWorldStore.getState().currentTick;
    const caseId = `ICJ-CASE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newCase: ICJCaseRecord = {
      id: caseId,
      applicantId,
      respondentId,
      claimType,
      evidenceBundle: evidence,
      proceduralStage: 'FILED',
      proceduralTicksElapsed: 0,
      ticksToNextStage: 5,
      tickFiled: currentTick
    };

    set(produce(s => {
      s.icjCases[caseId] = newCase;
    }));

    useWorldStore.getState().addGlobalEvent(`INTERNATIONAL COURT OF JUSTICE: ${applicantId} officially filed legal proceedings against ${respondentId} for ${claimType}.`, 'INFO');
    return caseId;
  },

  escalateCaseToTribunal: (caseId, namedResponsibilitySubject) => {
    audio.sfxWarKlaxon();
    const currentTick = useWorldStore.getState().currentTick;
    const icjCase = get().icjCases[caseId];
    if (!icjCase) return '';

    const id = `TRIB-${icjCase.respondentId}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const trib: TribunalEscalationRecord = {
      id,
      associatedCaseId: caseId,
      targetCountryId: icjCase.respondentId,
      escalationLevel: 'COMMISSION_OF_INQUIRY',
      namedResponsibilitySubject,
      evidenceCorroborated: icjCase.evidenceBundle.admissibilityScore > 60,
      internationalConsequencesRating: 7,
      linkedEventLogs: [`Independent tribunal panel convened concerning breaches linked to ${icjCase.respondentId}.`],
      status: 'ACTIVE',
      tickInitiated: currentTick
    };

    set(produce(s => {
      s.tribunals[id] = trib;
    }));

    useWorldStore.getState().addGlobalEvent(`TRIBUNAL CONVENED: International prosecutors open inquiry targeting "${namedResponsibilitySubject}" in ${icjCase.respondentId}.`, 'WARNING');
    return id;
  },

  triggerNuclearCondemnation: (initiatorCountryId, targetCountryId, yieldKt) => {
    const currentTick = useWorldStore.getState().currentTick;
    const resId = `UNSC-NUKE-${initiatorCountryId}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    const res: UNSCResolution = {
      id: resId,
      title: `SPECIAL UNSC RESOLUTION: CONDEMNATION OF DETONATION BY ${initiatorCountryId.toUpperCase()}`,
      preambularRationale: `Gravely concerned by the catastrophic detonation of a nuclear weapon yielding ${yieldKt}kt in/near ${targetCountryId}.`,
      creatorId: 'UN',
      sponsors: ['UN', 'US', 'GB', 'FR', 'DE', 'JP', 'KR'].filter(c => c !== initiatorCountryId),
      coSponsors: [],
      quietBackers: [],
      clauses: [
        { 
          id: 'clause-1', 
          category: 'CONDEMN', 
          description: 'Demand immediate military stand-down and nuclear inspections.', 
          targetCountryId: initiatorCountryId, 
          severityWeight: 80, 
          reputationalRiskWeight: 10 
        },
        { 
          id: 'clause-2', 
          category: 'ECONOMIC_SANCTIONS', 
          description: 'Impose comprehensive military trade embargoes and strategic sanctions.', 
          targetCountryId: initiatorCountryId, 
          severityWeight: 90, 
          reputationalRiskWeight: 20 
        }
      ],
      status: 'ACTIVE_VOTE',
      targetCountryId: initiatorCountryId,
      roundIntroduced: 1,
      tickIntroduced: currentTick,
      enforcementStrength: 95,
      reviewWindowTicks: 10,
      legalBasisStyle: 'CHARTER_CHAP_VII'
    };

    const votesFor = ['US', 'GB', 'FR', 'DE', 'JP', 'KR', 'IN', 'BR', 'CA', 'AU', 'UA'].filter(c => c !== initiatorCountryId);
    const votesAgainst = ['KP', 'IR', 'BY'].filter(c => c !== initiatorCountryId);
    
    // Check if RU/CN are P5 and whether they support or stand with the using state
    if (initiatorCountryId !== 'RU') {
      if (['CN', 'KP', 'IR'].includes(initiatorCountryId)) {
        votesAgainst.push('RU');
      } else {
        votesFor.push('RU');
      }
    }
    if (initiatorCountryId !== 'CN') {
      if (['RU', 'KP'].includes(initiatorCountryId)) {
         votesAgainst.push('CN');
      } else {
         votesFor.push('CN');
      }
    }

    const isP5 = ['US', 'RU', 'CN', 'GB', 'FR'].includes(initiatorCountryId);
    const vetoingP5s: string[] = [];
    if (isP5) {
      vetoingP5s.push(initiatorCountryId);
      if (!votesAgainst.includes(initiatorCountryId)) {
        votesAgainst.push(initiatorCountryId);
      }
    }

    const finalStatus: 'VETOED' | 'PASSED' = vetoingP5s.length > 0 ? 'VETOED' : 'PASSED';

    res.voteRecord = {
      resolutionId: resId,
      votesFor,
      votesAgainst,
      votesAbstain: ['SA', 'ZA', 'EG', 'PK'].filter(c => c !== initiatorCountryId),
      passed: finalStatus === 'PASSED',
      vetoed: finalStatus === 'VETOED',
      vetoingP5s,
      tickHeld: currentTick
    };
    res.status = finalStatus;

    set(produce((s: UNStoreState) => {
      s.resolutions[resId] = res;
    }));

    let comment = '';
    if (finalStatus === 'VETOED') {
      comment = `UNSC GRIDLOCK: Resolution to condemn nuclear use by ${initiatorCountryId} was BLOCKED by its P5 veto.`;
      useWorldStore.getState().addGlobalEvent(comment, 'WARNING');
      // GA special bypass
      setTimeout(() => {
        get().triggerEmergencySpecialSession(resId);
      }, 500);
    } else {
      comment = `UNSC CONDEMNATION PASSED: UNSC overwhelmingly condemns nuclear use by ${initiatorCountryId}.`;
      useWorldStore.getState().addGlobalEvent(comment, 'CRITICAL');
      // Inflict huge reputation shifts
      set(produce((s: UNStoreState) => {
        s.reputationShifts.push({
          id: `REP-${initiatorCountryId}-nuke-${currentTick}`,
          countryId: initiatorCountryId,
          dimension: 'humanitarianCredibility',
          delta: -50,
          reason: `UN Security Council Resolution passed condemning rogue nuclear usage.`,
          tickIncurred: currentTick
        });
      }));
    }

    return resId;
  },

  applyReputationShift: (countryId, dimension, delta, reason) => set(produce(s => {
    const currentTick = useWorldStore.getState().currentTick;
    s.reputationShifts.push({
      id: `REP-SHIFT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      countryId,
      dimension,
      delta,
      reason,
      tickIncurred: currentTick
    });
  })),

  triggerUNSCReformCrisis: () => {
    audio.sfxKlaxon();
    const currentTick = useWorldStore.getState().currentTick;

    set(produce(s => {
      s.unscReformStatus.activeReformCrisis = true;
      s.unscReformStatus.reformCoersionLevel = 50;
      s.unscReformStatus.reformSponsors = ['DE', 'JP', 'IN', 'BR']; // The G4 nations pushing for structural reforms
    }));

    useWorldStore.getState().addGlobalEvent(`STRUCTURAL CRISIS: P5 deadlock triggers UN reform crisis! Global coalition demands expansion of permanent Council seats!`, 'CRITICAL');
  },

  voteInReformCrisis: (countryId, voteFor) => set(produce(s => {
    if (!s.unscReformStatus.activeReformCrisis) return;

    if (voteFor) {
      if (!s.unscReformStatus.reformSponsors.includes(countryId)) {
        s.unscReformStatus.reformSponsors.push(countryId);
      }
      s.unscReformStatus.reformCoersionLevel = Math.min(100, s.unscReformStatus.reformCoersionLevel + 8);
    } else {
      s.unscReformStatus.reformSponsors = s.unscReformStatus.reformSponsors.filter(c => c !== countryId);
      s.unscReformStatus.reformCoersionLevel = Math.max(0, s.unscReformStatus.reformCoersionLevel - 10);
    }

    if (s.unscReformStatus.reformCoersionLevel >= 95) {
      s.unscReformStatus.activeReformCrisis = false;
      s.unscReformStatus.reformCoersionLevel = 100;
      // Clear all gridlocks after reform passes
      s.unscReformStatus.accumulatedGridlocks = 0;
      
      // Update permanent veto memberships in the state models symbolically!
      useWorldStore.getState().addGlobalEvent(`HISTORIC RESOLUTION: UN Charter successfully revised! Reform powers elevated to permanent Security blocks.`, 'INFO');
    }
  })),

  getResolutionPreview: (resId) => {
    const res = get().resolutions[resId];
    if (!res) {
      return {
        likelyVoteMap: {},
        vetoRiskPercentage: 0,
        potentialVetoingCountries: [],
        expectedSponsorLegitimacyGain: 0,
        financialAndDiplomaticCost: 0,
        reprisalsRiskRating: 0
      };
    }

    // Dynamic modeling preview of vote layouts
    const likelyVoteMap: Record<string, 'FOR' | 'AGAINST' | 'ABSTAIN'> = {};
    const P5 = ['US', 'RU', 'CN', 'GB', 'FR'];
    const potentialVetoingCountries: string[] = [];
    const countries = useWorldStore.getState().countries;

    Object.keys(countries).forEach(cid => {
      if (res.sponsors.includes(cid) || res.coSponsors.includes(cid)) {
        likelyVoteMap[cid] = 'FOR';
      } else if (res.targetCountryId === cid) {
        likelyVoteMap[cid] = 'AGAINST';
        if (P5.includes(cid)) potentialVetoingCountries.push(cid);
      } else {
        const c = countries[cid];
        const opinion = c?.opinions[res.creatorId] ?? 50;

        if (c?.allianceBlock === 'NATO' && ['US', 'GB', 'FR'].includes(res.creatorId)) {
          likelyVoteMap[cid] = 'FOR';
        } else if (c?.allianceBlock === 'BRICS' && ['CN', 'RU'].includes(res.creatorId)) {
          likelyVoteMap[cid] = 'FOR';
          if (P5.includes(cid)) potentialVetoingCountries.push(cid);
        } else if (opinion > 60) {
          likelyVoteMap[cid] = 'FOR';
        } else if (opinion < 40) {
          likelyVoteMap[cid] = 'AGAINST';
          if (P5.includes(cid)) potentialVetoingCountries.push(cid);
        } else {
          likelyVoteMap[cid] = 'ABSTAIN';
        }
      }
    });

    const votesAgainstCount = Object.values(likelyVoteMap).filter(v => v === 'AGAINST').length;
    const vetoRiskPercentage = potentialVetoingCountries.length > 0 ? 90 : 15;

    return {
      likelyVoteMap,
      vetoRiskPercentage,
      potentialVetoingCountries,
      expectedSponsorLegitimacyGain: res.enforcementStrength * 0.4,
      financialAndDiplomaticCost: 5.0,
      reprisalsRiskRating: votesAgainstCount * 12
    };
  },

  tickUNSystem: (currentTick) => {
    get().initializeUNStore();
    const world = useWorldStore.getState().world;
    if (!world) return;

    // A. Tick legal cases along their procedural timeline
    set(produce(s => {
      Object.keys(s.icjCases).forEach(caseId => {
        const icjCase = s.icjCases[caseId];
        if (icjCase.proceduralStage === 'DECIDED' || icjCase.proceduralStage === 'DISMISSED') return;

        icjCase.proceduralTicksElapsed++;
        icjCase.ticksToNextStage--;

        if (icjCase.ticksToNextStage <= 0) {
          // Transition procedural stage
          if (icjCase.proceduralStage === 'FILED') {
            icjCase.proceduralStage = 'ADMISSIBILITY_REVIEW';
            icjCase.ticksToNextStage = 6;
          } else if (icjCase.proceduralStage === 'ADMISSIBILITY_REVIEW') {
            icjCase.proceduralStage = 'HEARINGS';
            icjCase.ticksToNextStage = 8;
          } else if (icjCase.proceduralStage === 'HEARINGS') {
            icjCase.proceduralStage = 'JUDGMENT_PENDING';
            icjCase.ticksToNextStage = 5;
          } else if (icjCase.proceduralStage === 'JUDGMENT_PENDING') {
            icjCase.proceduralStage = 'DECIDED';
            icjCase.ticksToNextStage = 0;

            // Generate Case Judgment Outcome based on Evidentiary strength
            const baseStrength = icjCase.evidenceBundle.admissibilityScore;
            if (baseStrength > 65) {
              icjCase.finalFinding = 'RESPONDENT_GUILTY';
              icjCase.complianceAftermath = 'SELECTIVE';
              
              // Apply heavy legitimacy and legality strikes on guilty respondent country!
              s.reputationShifts.push({
                id: `REP-GUILTY-${icjCase.respondentId}-${currentTick}`,
                countryId: icjCase.respondentId,
                dimension: 'legality',
                delta: -30,
                reason: `Declared guilty of sovereignty trespasses in landmark ICJ ruling.`,
                tickIncurred: currentTick
              });

              s.reputationShifts.push({
                id: `REP-GUILTY-SP-${icjCase.respondentId}-${currentTick}`,
                countryId: icjCase.respondentId,
                dimension: 'interventionLegitimacy',
                delta: -25,
                reason: `Universal court decree finds respondent action unlawful.`,
                tickIncurred: currentTick
              });

              useWorldStore.getState().addGlobalEvent(`ICJ DECISION: Respondent ${icjCase.respondentId} declared GUILTY of treaty infractions and ordered to pay reparative cash packages.`, 'WARNING');
            } else {
              icjCase.finalFinding = 'RESPONDENT_EXONERATED';
              useWorldStore.getState().addGlobalEvent(`ICJ ESCAPEMENT: Tribunal drops charges against ${icjCase.respondentId} due to lack of admissible forensics backing claims.`, 'INFO');
            }
          }
        }
      });

      // B. Process ongoing tribunal investigations and issue arrest warrants or sanctions links
      Object.keys(s.tribunals).forEach(tribId => {
        const t = s.tribunals[tribId];
        if (t.status === 'RESOLVED_COMPLIANCE') return;

        const age = currentTick - t.tickInitiated;
        if (age === 10 && t.escalationLevel === 'INVESTIGATIVE_PANEL') {
          t.escalationLevel = 'EVIDENTIARY_DOSSIER';
          t.linkedEventLogs.push('Evidentiary briefings circulated to major sanctions desks.');
        } else if (age === 18 && t.escalationLevel === 'EVIDENTIARY_DOSSIER') {
          t.escalationLevel = 'FORMAL_CONDEMNATION';
          t.linkedEventLogs.push('Sovereign arrests and financial freezes authorized globally!');
          
          // Apply structural reputation damage
          s.reputationShifts.push({
            id: `REP-TRIB-${t.targetCountryId}-${currentTick}`,
            countryId: t.targetCountryId,
            dimension: 'humanitarianCredibility',
            delta: -35,
            reason: `Arrest directives and war-crime dossiers officially verified.`,
            tickIncurred: currentTick
          });

          useWorldStore.getState().addGlobalEvent(`PROSECUTION WAR DECREE: International warrants published targeting cabinet officers of [${t.targetCountryId}].`, 'CRITICAL');
        }
      });

      // C. Process Diplomatic Debt Horizon Timers and handle Defaults!
      Object.keys(s.diplomaticDebtLedger).forEach(debtId => {
        const debt = s.diplomaticDebtLedger[debtId];
        if (debt.status === 'ACTIVE' || debt.status === 'CALLED_IN') {
          const age = currentTick - debt.tickIncurred;
          if (age > debt.horizonTicks) {
            debt.status = 'DEFAULTED';
            
            // Damage the debtor's default & trustworthiness reputations
            s.reputationShifts.push({
              id: `REP-DEF-${debt.debtorId}-${currentTick}`,
              countryId: debt.debtorId,
              dimension: 'defaultPropensity',
              delta: 25, // higher factor
              reason: `Failed to repay promised sovereign concessions or votes to creditor ${debt.creditorId} before trade horizon.`,
              tickIncurred: currentTick
            });

            s.reputationShifts.push({
              id: `REP-DEF-PRO-${debt.debtorId}-${currentTick}`,
              countryId: debt.debtorId,
              dimension: 'proceduralReliability',
              delta: -20,
              reason: `Defaulted on structured vote-transaction commitments.`,
              tickIncurred: currentTick
            });

            // Update good faith debt ratios
            const targetMem = s.institutionalMemories[debt.debtorId];
            if (targetMem) {
              targetMem.goodFaithDebtRatio = Math.max(0.1, targetMem.goodFaithDebtRatio - 0.15);
            }

            useWorldStore.getState().addGlobalEvent(`DIPLOMATIC DEFAULT: ${debt.debtorId} broken structural commitments owed to ${debt.creditorId}. Core trusts severed.`, 'WARNING');
          }
        }
      });

      // D. Check formatting to verify if reform crisis thresholds are reached
      if (s.unscReformStatus.accumulatedGridlocks >= 4 && !s.unscReformStatus.activeReformCrisis) {
        // Trigger UN reform crisis
        s.unscReformStatus.accumulatedGridlocks = 0;
        get().triggerUNSCReformCrisis();
      }
    }));

    // B. Run strategic AI behaviors each simulation tick
    get().runAILobbyingAndAuthoring(currentTick);
  },

  runAILobbyingAndAuthoring: (currentTick) => {
    // Basic AI procedural agency to draft resolutions, trade favors and vote on pending UNSC rosters
    const resolutions = get().resolutions;
    const activeResKeys = Object.keys(resolutions).filter(k => resolutions[k].status === 'SPONSORSHIP_STAGE' || resolutions[k].status === 'LOBBYING_STAGE');

    if (activeResKeys.length > 0 && Math.random() < 0.25) {
      // 25% chance per tick AI country will dynamically co-sponsor or lobby others
      const targetResId = activeResKeys[Math.floor(Math.random() * activeResKeys.length)];
      const res = resolutions[targetResId];
      const AI_countries = ['RU', 'CN', 'GB', 'FR', 'DE', 'JP', 'IN'];
      const activeAI = AI_countries[Math.floor(Math.random() * AI_countries.length)];

      if (res.creatorId !== activeAI && !res.sponsors.includes(activeAI)) {
        set(produce(s => {
          const targetRes = s.resolutions[targetResId];
          const memory = s.institutionalMemories[activeAI];
          
          if (targetRes.targetCountryId === activeAI) return; // Never back your own condemnation

          // Calculate alliance cohesion to decide if co-sponsoring is useful
          const targetC = useWorldStore.getState().countries[activeAI];
          if (targetC?.allianceBlock === 'NATO' && ['US', 'GB', 'FR'].includes(targetRes.creatorId)) {
            targetRes.coSponsors.push(activeAI);
            memory.democraticNormEntrepreneurship = Math.min(100, memory.democraticNormEntrepreneurship + 3);
          } else if (targetC?.allianceBlock === 'BRICS' && ['CN', 'RU'].includes(targetRes.creatorId)) {
            targetRes.coSponsors.push(activeAI);
          }
        }));
      }
    }
  }
}));
