import { create } from 'zustand';
import { produce } from 'immer';
import { 
  TargetDossier, 
  MethodTradeoffs, 
  AttributionPhase, 
  EvidencePiece, 
  AttributionCase, 
  ConsequenceStep, 
  ConsequenceChain,
  SignalVisibilityTier
} from '../types';
import { useWorldStore } from './worldStore';
import { useSigintStore } from './sigintStore';
import { useFinintStore } from './finintStore';
import { useOperativeStore } from './operativeStore';
import { useMirrorStore } from './mirrorStore';
import { useConsequenceStore } from './consequenceStore';
import { useCinematicsStore } from './cinematicsStore';

interface TargetedOperationsState {
  dossiers: Record<string, TargetDossier>;
  attributionCases: Record<string, AttributionCase>;
  consequenceChains: Record<string, ConsequenceChain>;
  selectedTargetId: string | null;
  selectedMethodId: string | null;
  activeOperationId: string | null;
  
  // Actions
  setSelectedTargetId: (targetId: string | null) => void;
  setSelectedMethodId: (methodId: string | null) => void;
  buildTargetDossier: (targetId: string) => TargetDossier;
  refreshTargetDossier: (targetId: string) => void;
  scoreTargetValue: (dossier: TargetDossier) => number;
  scoreTargetRisk: (dossier: TargetDossier) => number;
  markDossierActionable: (targetId: string) => void;
  markDossierStale: (targetId: string) => void;

  evaluateMethodTradeoffs: (dossier: TargetDossier) => Record<string, MethodTradeoffs>;
  rankMethodsForTarget: (dossier: TargetDossier) => string[];
  recommendMethodSet: (dossier: TargetDossier) => string[];

  initializeAttributionCase: (targetId: string, operationId: string, operationType: string, sponsorId: string) => string;
  addAttributionEvidence: (caseId: string, evidence: Omit<EvidencePiece, 'id' | 'tickAdded'> & { id?: string }) => void;
  updateAttributionPhase: (caseId: string) => void;
  challengeAttributionCase: (caseId: string, contradictoryEvidence: Omit<EvidencePiece, 'id' | 'tickAdded'>) => void;
  resolveAttributionCase: (caseId: string) => void;
  exportAttributionSummary: (caseId: string) => { summary: string; verdict: string; piecesCount: number };

  createConsequenceChain: (operationId: string, targetId: string, methodId: string) => string;
  emitConsequenceEvent: (chainId: string, stepId: string) => void;
  resolveConsequenceStep: (chainId: string, stepId: string) => void;
  expireConsequenceChain: (chainId: string) => void;
  feedConsequenceIntoWorld: (chainId: string, stepId: string) => void;

  executeTargetedOperation: (targetId: string, methodId: string) => void;
  tickTargetedOperations: (currentTick: number) => void;
}

export const useTargetedOperationsStore = create<TargetedOperationsState>((set, get) => ({
  dossiers: {},
  attributionCases: {},
  consequenceChains: {},
  selectedTargetId: null,
  selectedMethodId: null,
  activeOperationId: null,

  setSelectedTargetId: (targetId) => set({ selectedTargetId: targetId }),
  setSelectedMethodId: (methodId) => set({ selectedMethodId: methodId }),

  buildTargetDossier: (targetId) => {
    const existing = get().dossiers[targetId];
    if (existing) return existing;

    const sigintState = useSigintStore.getState();
    const sigintTarget = sigintState.targets[targetId];

    const finintState = useFinintStore.getState();
    const matchedActor = finintState.actors.find(a => a.id === targetId || a.linkedCountryId === targetId);

    const operativeState = useOperativeStore.getState();
    const relatedOps = Object.values(operativeState.operatives).filter(o => o.regionOfOperation === targetId);

    // Initial parameters derived from live systems
    const name = sigintTarget?.name || matchedActor?.name || `TARGET-[${targetId.toUpperCase()}]`;
    const targetType = sigintTarget?.targetType || (matchedActor ? 'NETWORK' : 'COUNTRY');
    const affCountry = sigintTarget?.id || matchedActor?.linkedCountryId || 'CN';
    const vis = sigintTarget?.visibilityTier || 'INFERRED';
    const conf = sigintTarget?.analystConfidence || (matchedActor ? 65 : 40);

    // Determine security based on target's size / power
    const isMajorLower = ['US', 'CN', 'RU', 'IL'].includes(affCountry.toUpperCase());
    const protection = isMajorLower ? 85 : 45;

    const opVal = targetType === 'LEADER' ? 95 : targetType === 'FACILITY' ? 80 : targetType === 'NETWORK' ? 75 : 60;
    const attrRisk = 40 + (isMajorLower ? 35 : 10);
    const expRisk = matchedActor ? 30 : 60;
    const collRisk = targetType === 'FACILITY' ? 70 : targetType === 'LEADER' ? 30 : 15;

    // Build the dossier
    const dossier: TargetDossier = {
      targetId,
      targetType,
      name,
      affiliationCountryId: affCountry,
      locationHistory: [
        `${affCountry} Grid quadrant Alpha-1`,
        `${affCountry} High security complex Sector G`
      ],
      patternOfLifeSummary: sigintTarget ? `Active transmissions. High frequency signal cadence of ca. 50 ticks observed.` : `Restricted financial flow trace detected. Low transaction jitter.`,
      visibilityTier: vis,
      confidenceScore: conf,
      protectionLevel: protection,
      operationalValue: opVal,
      attributionRisk: attrRisk,
      exposureRisk: expRisk,
      estimatedCollateralRisk: collRisk,
      recommendedMethods: targetType === 'LEADER' ? ['capture / extraction', 'covert insertion'] : ['cyber intrusion', 'sabotage'],
      knownDeceptionMethods: ['SCHEDULE_SPOOFING', 'DECOY_TRAFFIC'],
      linkedIntelligenceSources: sigintTarget ? ['SIGINT', 'ELINT'] : ['FININT', 'HUMINT'],
      lastObservedTick: sigintTarget?.lastObservedTick || useWorldStore.getState().currentTick || 1,
      dossierFreshness: 100,
      analystNotes: `Intelligence composite collected via ECHO GRID under Unit 8200 authorization. Dossier verified with ${relatedOps.length} operational human assets.`,
      isActionable: conf >= 70 && vis === 'CONFIRMED',
      markedStaleTick: null
    };

    set(produce((draft: TargetedOperationsState) => {
      draft.dossiers[targetId] = dossier;
    }));

    useWorldStore.getState().addGlobalEvent(`Classified tactical dossier compiled for target [${dossier.name}] (Affiliation: ${dossier.affiliationCountryId}).`, 'INFO');
    useCinematicsStore.getState().triggerCinematic('DOSSIER_COMPLETE', { targetId, targetName: dossier.name });

    return dossier;
  },

  refreshTargetDossier: (targetId) => {
    set(produce((draft: TargetedOperationsState) => {
      const dossier = draft.dossiers[targetId];
      if (!dossier) return;

      const sigintState = useSigintStore.getState();
      const sigintTarget = sigintState.targets[targetId];
      
      dossier.confidenceScore = Math.min(100, sigintTarget ? sigintTarget.analystConfidence : dossier.confidenceScore + 5);
      dossier.visibilityTier = sigintTarget ? sigintTarget.visibilityTier : dossier.visibilityTier;
      dossier.dossierFreshness = 100;
      dossier.isActionable = dossier.confidenceScore >= 70 && dossier.visibilityTier === 'CONFIRMED';
      dossier.lastObservedTick = useWorldStore.getState().currentTick || 1;
    }));
  },

  scoreTargetValue: (dossier) => {
    const tierMultiplier = dossier.visibilityTier === 'CONFIRMED' ? 1.0 : dossier.visibilityTier === 'INFERRED' ? 0.6 : 0.2;
    return Math.floor(dossier.operationalValue * (dossier.confidenceScore / 100.0) * tierMultiplier * 10);
  },

  scoreTargetRisk: (dossier) => {
    const freshPenalty = (100 - dossier.dossierFreshness) * 0.4;
    return Math.min(100, Math.floor((dossier.attributionRisk + dossier.exposureRisk + dossier.estimatedCollateralRisk) / 3 + freshPenalty));
  },

  markDossierActionable: (targetId) => {
    set(produce((draft: TargetedOperationsState) => {
      if (draft.dossiers[targetId]) {
        draft.dossiers[targetId].isActionable = true;
      }
    }));
  },

  markDossierStale: (targetId) => {
    set(produce((draft: TargetedOperationsState) => {
      if (draft.dossiers[targetId]) {
        draft.dossiers[targetId].dossierFreshness = Math.max(0, draft.dossiers[targetId].dossierFreshness - 30);
        draft.dossiers[targetId].confidenceScore = Math.max(10, draft.dossiers[targetId].confidenceScore - 15);
        draft.dossiers[targetId].isActionable = false;
      }
    }));
  },

  evaluateMethodTradeoffs: (dossier) => {
    const methods = [
      { id: 'cyber intrusion', name: 'Cyber Intrusion', s: 80, st: 85, ar: 30, cr: 10, db: 20, cost: 1, rev: 80, ig: 90, su: 85 },
      { id: 'covert insertion', name: 'Covert Insertion', s: 50, st: 75, ar: 50, cr: 15, db: 45, cost: 3, rev: 40, ig: 95, su: 75 },
      { id: 'signal disruption', name: 'Signal Disruption', s: 90, st: 60, ar: 40, cr: 5, db: 30, cost: 1, rev: 95, ig: 25, su: 70 },
      { id: 'financial pressure', name: 'Financial Pressure', s: 30, st: 80, ar: 20, cr: 5, db: 40, cost: 2, rev: 80, ig: 50, su: 72 },
      { id: 'influence / deception', name: 'Influence & Deception', s: 40, st: 90, ar: 25, cr: 5, db: 20, cost: 1, rev: 85, ig: 70, su: 80 },
      { id: 'kinetic strike', name: 'Kinetic Strike', s: 100, st: 10, ar: 95, cr: 90, db: 95, cost: 8, rev: 0, ig: 30, su: 30 },
      { id: 'capture / extraction', name: 'Capture & Extraction', s: 45, st: 55, ar: 75, cr: 30, db: 80, cost: 5, rev: 35, ig: 98, su: 60 },
      { id: 'sabotage', name: 'Sabotage Operation', s: 60, st: 70, ar: 80, cr: 55, db: 75, cost: 4, rev: 10, ig: 15, su: 55 },
      { id: 'public attribution', name: 'Public Attribution Release', s: 100, st: 95, ar: 10, cr: 0, db: 25, cost: 1, rev: 100, ig: 60, su: 90 },
      { id: 'diplomatic exposure', name: 'Diplomatic Espionage Exposure', s: 50, st: 80, ar: 45, cr: 5, db: 85, cost: 2, rev: 20, ig: 75, su: 68 }
    ];

    const results: Record<string, MethodTradeoffs> = {};

    methods.forEach((m) => {
      const penalties: string[] = [];
      let successRoll = 80;

      // Penalize physical attacks on high-protection targets
      if (['kinetic strike', 'sabotage', 'capture / extraction', 'covert insertion'].includes(m.id)) {
        if (dossier.protectionLevel > 70) {
          successRoll -= 30;
          penalties.push(`Target state protection fortress (${dossier.protectionLevel}) compromises operational entry risk.`);
        }
      }

      // Penalize cyber / sigint if comms discipline is active
      const hasDeception = useSigintStore.getState().deceptionCountermeasures[dossier.targetId];
      if (hasDeception) {
        if (['cyber intrusion', 'signal disruption'].includes(m.id)) {
          successRoll -= 35;
          penalties.push(`Active enemy countermeasure: ${hasDeception.method} increases signal distortion.`);
        }
      }

      // Freshness degradation
      if (dossier.dossierFreshness < 50) {
        successRoll -= 20;
        penalties.push('Stale intelligence indicators reduce precision alignment.');
      }

      const calculatedSuitability = Math.max(5, Math.floor(
        (successRoll * 0.3) + 
        (m.st * 0.2) + 
        ((100 - m.ar) * 0.3) + 
        ((100 - m.cr) * 0.2)
      ));

      results[m.id] = {
        methodId: m.id,
        name: m.name,
        speed: m.s,
        stealth: m.st,
        attributionRisk: m.ar,
        collateralRisk: m.cr,
        diplomaticBlowback: m.db,
        resourceCost: m.cost,
        reversibility: m.rev,
        intelligenceGain: m.ig,
        likelihoodOfSuccess: Math.max(10, Math.min(100, successRoll)),
        suitabilityScore: calculatedSuitability,
        blockerPenalties: penalties
      };
    });

    return results;
  },

  rankMethodsForTarget: (dossier) => {
    const tradeoffs = get().evaluateMethodTradeoffs(dossier);
    return Object.values(tradeoffs)
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
      .map(t => t.methodId);
  },

  recommendMethodSet: (dossier) => {
    return get().rankMethodsForTarget(dossier).slice(0, 3);
  },

  initializeAttributionCase: (targetId, operationId, operationType, sponsorId) => {
    const caseId = `case_${Math.random().toString(36).substring(2, 9)}`;
    const currentTick = useWorldStore.getState().currentTick || 1;

    const newCase: AttributionCase = {
      caseId,
      targetId,
      operationId,
      operationType,
      phase: 'UNKNOWN',
      confidence: 10,
      evidencePieces: [],
      contradictoryEvidence: [],
      possibleSponsors: [
        { countryId: sponsorId, probability: 35 },
        { countryId: 'RU', probability: 20 },
        { countryId: 'CN', probability: 20 }
      ],
      falsePositiveProbability: 15,
      confidenceDecayRate: 2,
      chronologicalJournal: [`[Tick ${currentTick}] Operation fingerprint identified on global grid; initial forensic scope established.`],
      lastUpdatedTick: currentTick,
      isResolved: false,
      attributedSponsor: null
    };

    set(produce((draft: TargetedOperationsState) => {
      draft.attributionCases[caseId] = newCase;
    }));

    return caseId;
  },

  addAttributionEvidence: (caseId, evidence) => {
    set(produce((draft: TargetedOperationsState) => {
      const cases = draft.attributionCases[caseId];
      if (!cases) return;

      const currentTick = useWorldStore.getState().currentTick || 1;
      const pieceId = evidence.id || `ev_${Math.random().toString(36).substring(2, 9)}`;

      const element: EvidencePiece = {
        ...evidence,
        id: pieceId,
        tickAdded: currentTick
      };

      cases.evidencePieces.push(element);
      
      // Accumulate confidence based on credibility & source weight
      const certGain = Math.floor(element.credibilityScore * (element.weight / 100.0) * 0.4);
      cases.confidence = Math.min(100, cases.confidence + certGain);
      cases.chronologicalJournal.push(`[Tick ${currentTick}] Acquired corroboration piece: ${element.description} via ${element.sourceType}.`);
      cases.lastUpdatedTick = currentTick;

      // Recalculate possible sponsors
      const sponsor = cases.possibleSponsors.find(s => s.countryId === 'US');
      if (sponsor) {
        sponsor.probability = Math.min(100, sponsor.probability + Math.floor(certGain * 0.8));
      }
    }));

    get().updateAttributionPhase(caseId);
  },

  challengeAttributionCase: (caseId, contradictoryEvidence) => {
    set(produce((draft: TargetedOperationsState) => {
      const cases = draft.attributionCases[caseId];
      if (!cases) return;

      const currentTick = useWorldStore.getState().currentTick || 1;
      const pieceId = `ev_contra_${Math.random().toString(36).substring(2, 9)}`;

      const element: EvidencePiece = {
        ...contradictoryEvidence,
        id: pieceId,
        tickAdded: currentTick
      };

      cases.contradictoryEvidence.push(element);
      
      // Decelerate attribution confidence
      const loss = Math.floor(element.credibilityScore * (element.weight / 100.0) * 0.5);
      cases.confidence = Math.max(0, cases.confidence - loss);
      cases.chronologicalJournal.push(`[Tick ${currentTick}] Deception payload injected: ${element.description}. Conflicting forensic trace noted.`);
      cases.lastUpdatedTick = currentTick;

      // Dilute player sponsor probability
      const sponsor = cases.possibleSponsors.find(s => s.countryId === 'US');
      if (sponsor) {
        sponsor.probability = Math.max(5, sponsor.probability - Math.floor(loss * 0.6));
      }
    }));

    get().updateAttributionPhase(caseId);
  },

  updateAttributionPhase: (caseId) => {
    set(produce((draft: TargetedOperationsState) => {
      const cases = draft.attributionCases[caseId];
      if (!cases) return;

      let nextPhase: AttributionPhase = 'UNKNOWN';
      const c = cases.confidence;

      if (c >= 90) nextPhase = 'CONFIRMED';
      else if (c >= 75) nextPhase = 'HIGH_CONFIDENCE';
      else if (c >= 50) nextPhase = 'PROBABLE';
      else if (c >= 20) nextPhase = 'SUSPECTED';

      if (cases.phase !== nextPhase) {
        cases.phase = nextPhase;
        cases.chronologicalJournal.push(`[Tick ${cases.lastUpdatedTick}] Attribution level advanced to: ${nextPhase}.`);
        
        useWorldStore.getState().addGlobalEvent(`Counter-intel attribution progress for op [${cases.operationType}]: status shifted to ${nextPhase}.`, 'WARNING');
        useCinematicsStore.getState().triggerCinematic('ATTRIBUTION_ADVANCED', { caseId, phase: nextPhase });
      }
    }));
  },

  resolveAttributionCase: (caseId) => {
    set(produce((draft: TargetedOperationsState) => {
      const cases = draft.attributionCases[caseId];
      if (!cases) return;

      const currentTick = useWorldStore.getState().currentTick || 1;
      cases.isResolved = true;
      cases.attributedSponsor = cases.confidence >= 75 ? 'US' : 'UNKNOWN';
      cases.chronologicalJournal.push(`[Tick ${currentTick}] Case formally closed with verdict: ${cases.attributedSponsor === 'US' ? 'CONFIRMED SPONSOR attribution to domestic assets' : 'INCONCLUSIVE attribution metrics.'}`);
    }));
  },

  exportAttributionSummary: (caseId) => {
    const cases = get().attributionCases[caseId];
    if (!cases) return { summary: 'CASE NOT FOUND', verdict: 'NONE', piecesCount: 0 };

    const evidenceText = cases.evidencePieces.map(e => `[${e.sourceType}] ${e.description}`).join('; ');
    return {
      summary: `Case ${caseId} tracing a ${cases.operationType} attack has identified ${cases.evidencePieces.length} active forensic items. Current highlights: ${evidenceText || 'No clear forensic items yet.'}`,
      verdict: cases.phase,
      piecesCount: cases.evidencePieces.length
    };
  },

  createConsequenceChain: (operationId, targetId, methodId) => {
    const chainId = `chain_${Math.random().toString(36).substring(2, 9)}`;
    const currentTick = useWorldStore.getState().currentTick || 1;

    const steps: ConsequenceStep[] = [];
    
    // Add 3 customized consequence steps depending on the operational method
    if (methodId === 'kinetic strike') {
      steps.push({
        stepId: `${chainId}_step1`,
        chainId,
        delayTicks: 1,
        resolveTick: currentTick + 1,
        label: 'Structural Demolition',
        description: 'Primary structural architecture collapses following payload impact. Direct target asset pulverized.',
        severity: 'CRITICAL',
        probability: 1.0,
        triggerCondition: 'Immediate execution confirmation',
        affectedSystems: ['MILITARY', 'CIVILIAN_INFRASTRUCTURE'],
        reversibility: false,
        isResolved: false,
        isHappening: false,
        isPlayerVisible: true,
        followUpStepIds: [`${chainId}_step2`]
      });
      steps.push({
        stepId: `${chainId}_step2`,
        chainId,
        delayTicks: 3,
        resolveTick: currentTick + 3,
        label: 'International Condemnation',
        description: 'Satellite feeds confirm secondary collateral damage. UN assembly calls for emergency hearings.',
        severity: 'HIGH',
        probability: 0.85,
        triggerCondition: 'High public footprint of kinetic payload',
        affectedSystems: ['DIPLOMATIC_RELATIONS', 'POLITICAL_CAPITAL'],
        reversibility: false,
        isResolved: false,
        isHappening: false,
        isPlayerVisible: true,
        followUpStepIds: [`${chainId}_step3`]
      });
      steps.push({
        stepId: `${chainId}_step3`,
        chainId,
        delayTicks: 6,
        resolveTick: currentTick + 6,
        label: 'Adversary Hardening & Retaliation',
        description: 'Tactical missile alerts raised in border airspace. Sovereign defense systems active to prevent future entries.',
        severity: 'CRITICAL',
        probability: 0.9,
        triggerCondition: 'Escalating security tension indices',
        affectedSystems: ['AIR_DEFENSE_LEVEL', 'RIVAL_HARDENING'],
        reversibility: false,
        isResolved: false,
        isHappening: false,
        isPlayerVisible: true,
        followUpStepIds: []
      });
    } else if (methodId === 'cyber intrusion') {
      steps.push({
        stepId: `${chainId}_step1`,
        chainId,
        delayTicks: 1,
        resolveTick: currentTick + 1,
        label: 'Data Integrity Breach',
        description: 'Siphoned core command data logs are decrypted securely. Initial target telemetry uploaded.',
        severity: 'LOW',
        probability: 0.95,
        triggerCondition: 'Successful cyber payload injection',
        affectedSystems: ['INTELLIGENCE_PROVENANCE', 'COVERT_RESERVES'],
        reversibility: true,
        isResolved: false,
        isHappening: false,
        isPlayerVisible: true,
        followUpStepIds: [`${chainId}_step2`]
      });
      steps.push({
        stepId: `${chainId}_step2`,
        chainId,
        delayTicks: 2,
        resolveTick: currentTick + 2,
        label: 'Target Digital Awareness Shift',
        description: 'Security engineers detect anomalistic CPU spike. Port blocks initialized, locking down subsequent avenues.',
        severity: 'MEDIUM',
        probability: 0.7,
        triggerCondition: 'Analyst visibility decay triggered',
        affectedSystems: ['TARGET_AWARENESS', 'DOSSIER_FRESHNESS'],
        reversibility: false,
        isResolved: false,
        isHappening: false,
        isPlayerVisible: true,
        followUpStepIds: [`${chainId}_step3`]
      });
      steps.push({
        stepId: `${chainId}_step3`,
        chainId,
        delayTicks: 5,
        resolveTick: currentTick + 5,
        label: 'Adversary Network Hardening',
        description: 'Hostile nation issues full server rotation. Cyber intrusion risk parameters permanently spiked.',
        severity: 'MEDIUM',
        probability: 0.8,
        triggerCondition: 'Target awareness exceeds 50%',
        affectedSystems: ['NETWORK_HARDENING', 'CYBER_DEFENSE_LEVEL'],
        reversibility: false,
        isResolved: false,
        isHappening: false,
        isPlayerVisible: true,
        followUpStepIds: []
      });
    } else {
      // Default stealth operation consequence
      steps.push({
        stepId: `${chainId}_step1`,
        chainId,
        delayTicks: 1,
        resolveTick: currentTick + 1,
        label: 'Tactical Outcome Resolution',
        description: 'Target compound infiltrated as planned. Covert footprints masked.',
        severity: 'LOW',
        probability: 1.0,
        triggerCondition: 'Covert plan activation',
        affectedSystems: ['TACTICAL_STATUS'],
        reversibility: true,
        isResolved: false,
        isHappening: false,
        isPlayerVisible: true,
        followUpStepIds: [`${chainId}_step2`]
      });
      steps.push({
        stepId: `${chainId}_step2`,
        chainId,
        delayTicks: 4,
        resolveTick: currentTick + 4,
        label: 'Dossier Signal Decay',
        description: 'Operations teams lose steady surveillance contact. Dossier indices entering stale zone.',
        severity: 'LOW',
        probability: 0.6,
        triggerCondition: 'Unobserved ticks accumulated',
        affectedSystems: ['DOSSIER_FRESHNESS'],
        reversibility: true,
        isResolved: false,
        isHappening: false,
        isPlayerVisible: true,
        followUpStepIds: [`${chainId}_step3`]
      });
      steps.push({
        stepId: `${chainId}_step3`,
        chainId,
        delayTicks: 8,
        resolveTick: currentTick + 8,
        label: 'Hostile Hardening cycle',
        description: 'Encountered patrol units increased. Subsequent attempts carry higher structural risk.',
        severity: 'MEDIUM',
        probability: 0.5,
        triggerCondition: 'General awareness buildup',
        affectedSystems: ['RIVAL_HARDENING'],
        reversibility: false,
        isResolved: false,
        isHappening: false,
        isPlayerVisible: true,
        followUpStepIds: []
      });
    }

    const newChain: ConsequenceChain = {
      chainId,
      operationId,
      targetId,
      methodId,
      initiatedTick: currentTick,
      steps,
      isExpired: false,
      totalDamageScore: methodId === 'kinetic strike' ? 90 : 30,
      worldLogGenerated: false
    };

    set(produce((draft: TargetedOperationsState) => {
      draft.consequenceChains[chainId] = newChain;
    }));

    return chainId;
  },

  emitConsequenceEvent: (chainId, stepId) => {
    const chain = get().consequenceChains[chainId];
    const step = chain?.steps.find(s => s.stepId === stepId);
    if (!step) return;

    const mappedSeverity = step.severity === 'CRITICAL' ? 'CRITICAL' : step.severity === 'HIGH' ? 'WARNING' : 'INFO';
    useWorldStore.getState().addGlobalEvent(`[CONSEQUENCE ALERT]: Chain ${chainId} reports critical progress on step "${step.label}".`, mappedSeverity);
  },

  resolveConsequenceStep: (chainId, stepId) => {
    const currentTick = useWorldStore.getState().currentTick || 1;
    set(produce((draft: TargetedOperationsState) => {
      const chain = draft.consequenceChains[chainId];
      if (!chain) return;

      const step = chain.steps.find(s => s.stepId === stepId);
      if (step) {
        step.isHappening = false;
        step.isResolved = true;
        
        // Feed effect into the active state model
        draft.feedConsequenceIntoWorld(chainId, stepId);

        // Advance to next phase if any
        step.followUpStepIds.forEach((fId) => {
          const next = chain.steps.find(s => s.stepId === fId);
          if (next) {
            next.isHappening = true;
          }
        });
      }
    }));
  },

  expireConsequenceChain: (chainId) => {
    set(produce((draft: TargetedOperationsState) => {
      if (draft.consequenceChains[chainId]) {
        draft.consequenceChains[chainId].isExpired = true;
      }
    }));
  },

  feedConsequenceIntoWorld: (chainId, stepId) => {
    const chain = get().consequenceChains[chainId];
    const step = chain?.steps.find(s => s.stepId === stepId);
    if (!step) return;

    const worldState = useWorldStore.getState();
    const targetedCountry = worldState.countries[chain.targetId];

    // Alter live statistics based on consequence outcomes
    if (targetedCountry) {
      if (step.affectedSystems.includes('CIVILIAN_INFRASTRUCTURE') || step.severity === 'CRITICAL') {
        // Apply Gdp impact or structural unrest to world nation
        useWorldStore.setState(produce((draft: any) => {
          const country = draft.countries[chain.targetId];
          if (country) {
            country.political.unrest = Math.min(100, country.political.unrest + 15);
            country.political.stability = Math.max(0, country.political.stability - 12);
          }
        }));
      }
    }

    // Retaliation risk increases mirror activities
    if (step.affectedSystems.includes('RIVAL_HARDENING')) {
      useMirrorStore.setState(produce((draft: any) => {
        draft.counterTacticsUsed = draft.counterTacticsUsed || [];
        if (!draft.counterTacticsUsed.includes('INTELLIGENCE_HARDENING')) {
          draft.counterTacticsUsed.push('INTELLIGENCE_HARDENING');
        }
      }));
    }

    const mappedSeverity = step.severity === 'CRITICAL' ? 'CRITICAL' : step.severity === 'HIGH' ? 'WARNING' : 'INFO';
    useWorldStore.getState().addGlobalEvent(`Sovereign resolution engine executed: Step "${step.label}" integrated cleanly.`, mappedSeverity);
    useCinematicsStore.getState().triggerCinematic('CONSEQUENCE_CASCADE', { stepLabel: step.label, chainId });
  },

  executeTargetedOperation: (targetId, methodId) => {
    const dossier = get().dossiers[targetId];
    if (!dossier) return;

    const currentTick = useWorldStore.getState().currentTick || 1;
    const opId = `op_lantern_${Math.random().toString(36).substring(2, 9)}`;

    // Build the tradeoff matrix for this exact target to get stats
    const tradeoffs = get().evaluateMethodTradeoffs(dossier)[methodId];
    const successRaw = tradeoffs ? tradeoffs.likelihoodOfSuccess : 60;
    const success = Math.random() * 100 <= successRaw;

    // Check financial reserves
    const cost = tradeoffs ? tradeoffs.resourceCost : 2;
    const finStore = useFinintStore.getState();
    
    // Log selected tactical decision
    useWorldStore.getState().addGlobalEvent(`[TACTICAL LAUNCH] Code BLACK LANTERN // Method: ${methodId.toUpperCase()} active on [${dossier.name}]. Budget allocated: $${cost}B.`, 'WARNING');
    useCinematicsStore.getState().triggerCinematic('METHOD_SELECTED', { methodId, targetName: dossier.name });

    // Initialize an attribution case
    const caseId = get().initializeAttributionCase(targetId, opId, methodId, 'US');

    // Add immediate evidence based on method's exposure
    const attrRisk = tradeoffs ? tradeoffs.attributionRisk : 50;
    if (attrRisk > 40) {
      get().addAttributionEvidence(caseId, {
        sourceType: 'SIGINT',
        description: `Corrupted routing table traces discovered pointing to proxy server arrays registered in friendly zones.`,
        credibilityScore: Math.min(100, attrRisk + 10),
        weight: 60,
        associatedArtifacts: ['trace_proxy_headers', 'payload_timestamp_alignment']
      });
    }

    if (success) {
      useWorldStore.getState().addGlobalEvent(`[MISSION SUCCESS] Target dossier [${dossier.name}] successfully engaged. Code BLACK LANTERN completed.`, 'CRITICAL');
      useCinematicsStore.getState().triggerCinematic('OPERATION_SUCCESS', { opId, targetName: dossier.name });
    } else {
      useWorldStore.getState().addGlobalEvent(`[MISSION COMPROMISED] Target [${dossier.name}] operational run failed. Payloads intercepted.`, 'WARNING');
      useCinematicsStore.getState().triggerCinematic('OPERATION_EXPOSED', { opId, targetName: dossier.name });

      // Add incriminating evidence immediately
      get().addAttributionEvidence(caseId, {
        sourceType: 'FORENSICS',
        description: `Exposed direct human compiler markers in memory registers. Attenuation matches tactical command style.`,
        credibilityScore: 90,
        weight: 90,
        associatedArtifacts: ['memory_core_fingerprint', 'compiled_source_id_us']
      });
    }

    // Trigger post-operation consequences
    get().createConsequenceChain(opId, targetId, methodId);

    // Stale the dossier after operation
    get().markDossierStale(targetId);

    set({ activeOperationId: opId });
  },

  tickTargetedOperations: (currentTick) => {
    // 1. Decay dossier freshness on tick
    set(produce((draft: TargetedOperationsState) => {
      Object.keys(draft.dossiers).forEach((id) => {
        const dossier = draft.dossiers[id];
        // Decelerate freshness slightly every tick
        dossier.dossierFreshness = Math.max(0, dossier.dossierFreshness - 4);
        if (dossier.dossierFreshness < 40) {
          dossier.isActionable = false;
        }
      });
    }));

    // 2. Resolve scheduled consequence steps
    const chains = get().consequenceChains;
    Object.keys(chains).forEach((chainId) => {
      const chain = chains[chainId];
      if (chain.isExpired) return;

      let allResolved = true;
      chain.steps.forEach((step) => {
        if (!step.isResolved) {
          allResolved = false;
          // If the resolveTick is reached and not resolved yet
          if (step.resolveTick <= currentTick && !step.isHappening) {
            get().resolveConsequenceStep(chainId, step.stepId);
          }
        }
      });

      if (allResolved) {
        get().expireConsequenceChain(chainId);
      }
    });
  }
}));
