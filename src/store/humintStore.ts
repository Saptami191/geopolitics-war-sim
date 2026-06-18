import { create } from 'zustand';
import { produce } from 'immer';
import { useWorldStore } from './worldStore';
import { useSigintStore } from './sigintStore';
import { useConsequenceStore } from './consequenceStore';
import { useCinematicsStore } from './cinematicsStore';
import { useMirrorStore } from './mirrorStore';
import { usePlayerStore } from './playerStore';
import {
  SourceCase,
  HandlerCase,
  DoubleAgentState,
  DefectorCase,
  DiscoveryGraph,
  DiscoveryNode,
  DiscoveryEdge,
  SourceIdentity,
  SourcePsychologyProfile,
  HandlerPsychologyProfile,
  SourceOperationalState,
  SourceType,
  SourceLifecyclePhase,
  MotivationVector
} from '../types';

export interface HumintStore {
  sources: Record<string, SourceCase>;
  handlers: Record<string, HandlerCase>;
  doubleAgents: Record<string, DoubleAgentState>;
  defectors: Record<string, DefectorCase>;
  discoveryGraph: DiscoveryGraph;
  selectedSourceId: string | null;
  selectedHandlerId: string | null;

  // Basic Actions
  addSource: (source: SourceCase) => void;
  removeSource: (sourceId: string) => void;
  updateSource: (sourceId: string, updater: (draft: SourceCase) => void) => void;
  addHandler: (handler: HandlerCase) => void;
  assignSource: (sourceId: string, handlerId: string | null) => void;
  taskSource: (sourceId: string, task: string) => void;
  exfiltrateSource: (sourceId: string) => void;
  burnSource: (sourceId: string, cause?: string) => void;
  convertSourceType: (sourceId: string, newType: SourceType) => void;
  addDiscoveryNode: (node: DiscoveryNode) => void;
  addDiscoveryEdge: (edge: DiscoveryEdge) => void;
  updateDiscoveryGraph: (updater: (draft: DiscoveryGraph) => void) => void;
  recordCompromise: (sourceId: string, description: string) => void;
  recordExfiltration: (sourceId: string, description: string) => void;
  recordIntelligenceBurst: (sourceId: string, value: number, desc: string) => void;
  tickHumint: (currentTick: number) => void;

  // Step 4 Actions - Retroactive Discovery Graph
  initializeDiscoveryGraph: () => void;
  connectSourceToHandler: (sourceId: string, handlerId: string) => void;
  connectSourceToOperation: (sourceId: string, operationId: string) => void;
  connectSourceToTarget: (sourceId: string, targetId: string) => void;
  calculateRetroactiveDiscoveryProbability: (sourceId: string) => number;
  propagateDiscoveryRisk: (sourceId: string) => void;
  revealAncillaryExposure: (sourceId: string) => void;
  markCompromiseChain: (sourceId: string) => void;
  recalculateGraphExposure: () => void;

  // Step 5 Actions - Source Lifecycle
  spotPotentialSource: (candidate: Omit<SourceIdentity, 'currentPhase'>) => void;
  assessSource: (sourceId: string) => void;
  developSource: (sourceId: string) => void;
  recruitSource: (sourceId: string) => void;
  handleSource: (sourceId: string) => void;
  updateSourceRisk: (sourceId: string) => void;
  terminateSource: (sourceId: string) => void;
  updateRetroactiveDiscoveryRisk: (sourceId: string) => void;
  refreshSourceConfidence: (sourceId: string) => void;
  calculateSourceFragility: (sourceId: string) => number;

  // Step 6 Actions - Yield vs Survivability
  calculateYieldPotential: (sourceId: string) => number;
  calculateSurvivability: (sourceId: string) => number;
  calculateTaskingPressure: (sourceId: string) => number;
  calculateHandlerRisk: (sourceId: string) => number;
  recommendTaskIntensity: (sourceId: string) => string;
  simulateSourceStress: (sourceId: string) => void;
  estimateSourceBurnLikelihood: (sourceId: string) => number;

  // Step 7 Actions - Double Agent Console
  initializeDoubleAgent: (sourceId: string) => void;
  updateDualLoyalty: (sourceId: string) => void;
  taskDoubleAgent: (sourceId: string, task: string) => void;
  evaluateDoubleAgentStability: (sourceId: string) => number;
  collapseDoubleAgent: (sourceId: string) => void;
  convertToRedoubledAgent: (sourceId: string) => void;
  computeDoubleAgentYield: (sourceId: string) => number;
  computeDoubleAgentExposure: (sourceId: string) => number;

  // Step 8 Actions - Defector Exfiltration Panel
  receiveDefector: (defectorData: Partial<DefectorCase> & { defectorId: string }) => void;
  verifyDefector: (defectorId: string) => void;
  planExfiltration: (defectorId: string) => void;
  executeExfiltration: (defectorId: string) => void;
  resettleDefector: (defectorId: string) => void;
  recalculateRetroactiveDiscoveryRisk: (defectorId: string) => void;
  exportDefectorIntel: (defectorId: string) => void;

  // Step 9 Actions - Handler Psychology
  createHandler: (handlerData: HandlerCase) => void;
  assignSourceToHandler: (sourceId: string, handlerId: string) => void;
  updateHandlerPsychology: (handlerId: string) => void;
  simulateHandlerFatigue: (handlerId: string) => void;
  calculateHandlerAttachmentRisk: (handlerId: string) => number;
  calculateHandlerCompromiseConcern: (handlerId: string) => number;
  recommendHandlerStyle: (handlerId: string) => string;

  setSelectedSourceId: (sourceId: string | null) => void;
  setSelectedHandlerId: (handlerId: string | null) => void;
}

// ────────────────────────────────────────────────────────────────────────────────
// INITIAL SEED DATA
// ────────────────────────────────────────────────────────────────────────────────

const initialMotivation = (): MotivationVector => ({
  money: 50,
  ideology: 40,
  coercion: 10,
  ego: 30,
  grievance: 20,
  survival: 80,
  status: 40,
  curiosity: 30,
  revenge: 15,
  affiliation: 45
});

const defaultSourcePsychProfile = (): SourcePsychologyProfile => ({
  primaryMotivation: 'survival',
  motivationWeights: initialMotivation(),
  stressTolerance: 75,
  loyaltyFragility: 30,
  deceptionSkill: 65,
  vanity: 40,
  resentment: 25,
  paranoia: 35,
  attachmentToHandler: 50,
  fearOfExposure: 60,
  riskSeeking: 30,
  moralFlexibility: 55,
  needForRecognition: 35,
  needForMoney: 45,
  ideologicalCommitment: 40,
  coercionPressure: 10,
  familyExposureRisk: 25,
  burnoutRisk: 15,
  defectionLikelihood: 10
});

const defaultHandlerPsychProfile = (): HandlerPsychologyProfile => ({
  trustPropensity: 60,
  suspicionBias: 40,
  patience: 75,
  aggression: 50,
  controlNeed: 65,
  empathy: 60,
  compartmentationDiscipline: 80,
  operationalHubris: 30,
  emotionalAttachment: 30,
  riskAversion: 50,
  sourceFetishization: 20,
  moralCompromise: 40,
  improvisationSkill: 75,
  burnoutRisk: 20,
  deceptionSensitivity: 70,
  betrayalTolerance: 40
});

const makeInitialSources = (): Record<string, SourceCase> => ({
  'src_sword': {
    identity: {
      sourceId: 'src_sword',
      coverName: 'SWORD',
      trueIdentity: 'Col. Viktor Petrov, RU MoD attache branch',
      hostileService: 'GRU (Main Intelligence Directorate)',
      hostileCountry: 'RU',
      accessLevel: 'HIGH',
      sourceType: 'MOLE',
      currentPhase: 'HANDLED'
    },
    psychology: {
      ...defaultSourcePsychProfile(),
      primaryMotivation: 'grievance',
      resentment: 75,
      stressTolerance: 80,
      deceptionSkill: 80,
      loyaltyFragility: 45
    },
    handlerPsychology: {
      ...defaultHandlerPsychProfile(),
      trustPropensity: 65,
      compartmentationDiscipline: 85
    },
    state: {
      loyaltyScore: 78,
      handlerTrustScore: 82,
      compromiseRisk: 22,
      survivabilityScore: 85,
      intelYieldScore: 70,
      operationalValue: 80,
      retroactiveDiscoveryRisk: 15,
      burnProbability: 5,
      extractionReadiness: 40,
      compartmentationLevel: 80,
      tradecraftRisk: 12,
      deceptionRisk: 15,
      accessWindowRemaining: 40,
      taskLoad: 1,
      lastContactTick: 0,
      lastTaskTick: 0,
      lastRiskUpdateTick: 0
    },
    notes: ['Invaluable source inside Eurasian strategic channels.', 'Handler notes Petrov appears emotionally fatigued.'],
    provenance: ['Originally spotted as dissident officer.', 'Recruited following strategic blackmail/ego leveraging.'],
    linkedTargets: ['RU_CENTRAL_COMMAND'],
    linkedOperations: ['BLACK_LANTERN_SWORD']
  },
  'src_prism': {
    identity: {
      sourceId: 'src_prism',
      coverName: 'PRISM',
      trueIdentity: 'Dr. Liang Chen, Cyber Directorate Lead',
      hostileService: 'MSS Third Bureau',
      hostileCountry: 'CN',
      accessLevel: 'CORE',
      sourceType: 'DOUBLE_AGENT',
      currentPhase: 'HANDLED'
    },
    psychology: {
      ...defaultSourcePsychProfile(),
      primaryMotivation: 'money',
      needForMoney: 85,
      stressTolerance: 60,
      deceptionSkill: 75,
      loyaltyFragility: 60
    },
    handlerPsychology: {
      ...defaultHandlerPsychProfile(),
      trustPropensity: 40,
      suspicionBias: 75,
      compartmentationDiscipline: 90
    },
    state: {
      loyaltyScore: 55,
      handlerTrustScore: 48,
      compromiseRisk: 42,
      survivabilityScore: 68,
      intelYieldScore: 90,
      operationalValue: 92,
      retroactiveDiscoveryRisk: 35,
      burnProbability: 18,
      extractionReadiness: 30,
      compartmentationLevel: 90,
      tradecraftRisk: 28,
      deceptionRisk: 45,
      accessWindowRemaining: 30,
      taskLoad: 2,
      lastContactTick: 0,
      lastTaskTick: 0,
      lastRiskUpdateTick: 0
    },
    notes: ['Very high yield quantum decryption researcher.', 'Extremely fragile, security sweeps are narrowing.'],
    provenance: ['Walked in at cyber hub portal.', 'Handler trust remains cautious due to active counterintelligence vectors.'],
    linkedTargets: ['CN_CYBER_BASE'],
    linkedOperations: ['BLACK_LANTERN_PRISM']
  },
  'src_walk_in_1': {
    identity: {
      sourceId: 'src_walk_in_1',
      coverName: 'ECHO_SHADOW',
      trueIdentity: 'Undisclosed analyst, RU Grid Command',
      hostileService: 'GRU Cyber Command',
      hostileCountry: 'RU',
      accessLevel: 'MEDIUM',
      sourceType: 'WALK_IN',
      currentPhase: 'SPOTTED'
    },
    psychology: defaultSourcePsychProfile(),
    handlerPsychology: defaultHandlerPsychProfile(),
    state: {
      loyaltyScore: 50,
      handlerTrustScore: 30,
      compromiseRisk: 10,
      survivabilityScore: 90,
      intelYieldScore: 45,
      operationalValue: 35,
      retroactiveDiscoveryRisk: 5,
      burnProbability: 2,
      extractionReadiness: 10,
      compartmentationLevel: 50,
      tradecraftRisk: 5,
      deceptionRisk: 30,
      accessWindowRemaining: 15,
      taskLoad: 0,
      lastContactTick: 0,
      lastTaskTick: 0,
      lastRiskUpdateTick: 0
    },
    notes: ['Anonymous contact established via dead-drop node.', 'Undergoing intensive background validation review.'],
    provenance: ['Autonomous handshake initiated over encrypted Tor router.'],
    linkedTargets: [],
    linkedOperations: []
  }
});

const makeInitialHandlers = (): Record<string, HandlerCase> => ({
  'hnd_vanguard': {
    handlerId: 'hnd_vanguard',
    alias: 'VANGUARD',
    role: 'CASE_OFFICER',
    psychology: {
      ...defaultHandlerPsychProfile(),
      trustPropensity: 65,
      aggression: 55,
      operationalHubris: 20
    },
    sourceLoad: 1,
    activeSources: ['src_sword'],
    trustHistory: [60, 62, 65],
    paranoiaHistory: [30, 28, 30],
    compromiseConcern: 20,
    operationalEmpathy: 60,
    controlCompulsion: 50,
    riskBias: 45,
    attachmentRisk: 30,
    fatigueLevel: 12,
    deceptionTolerance: 50,
    decisionStyle: 'BALANCED',
    lastInteractionTick: 0
  },
  'hnd_serenade': {
    handlerId: 'hnd_serenade',
    alias: 'SERENADE',
    role: 'CONTROLLER',
    psychology: {
      ...defaultHandlerPsychProfile(),
      trustPropensity: 30,
      suspicionBias: 80,
      patience: 85,
      controlNeed: 80,
      compartmentationDiscipline: 95
    },
    sourceLoad: 1,
    activeSources: ['src_prism'],
    trustHistory: [40, 38, 41],
    paranoiaHistory: [65, 70, 72],
    compromiseConcern: 65,
    operationalEmpathy: 30,
    controlCompulsion: 80,
    riskBias: 25,
    attachmentRisk: 15,
    fatigueLevel: 18,
    deceptionTolerance: 30,
    decisionStyle: 'PARANOID',
    lastInteractionTick: 0
  },
  'hnd_orion': {
    handlerId: 'hnd_orion',
    alias: 'ORION',
    role: 'EXFILTRATION_LEAD',
    psychology: {
      ...defaultHandlerPsychProfile(),
      trustPropensity: 70,
      aggression: 80,
      controlNeed: 50,
      compartmentationDiscipline: 55,
      operationalHubris: 70
    },
    sourceLoad: 0,
    activeSources: [],
    trustHistory: [70],
    paranoiaHistory: [35],
    compromiseConcern: 15,
    operationalEmpathy: 50,
    controlCompulsion: 40,
    riskBias: 75,
    attachmentRisk: 35,
    fatigueLevel: 5,
    deceptionTolerance: 60,
    decisionStyle: 'AGGRESSIVE',
    lastInteractionTick: 0
  }
});

const makeInitialDoubleAgentState = (): Record<string, DoubleAgentState> => ({
  'src_prism': {
    primaryLoyalty: 55,
    hiddenLoyalty: 45,
    adversaryExpectation: 65,
    handlerExpectation: 80,
    deceptionDepth: 75,
    coverIntegrity: 70,
    betrayalTolerance: 50,
    resentmentLevel: 15,
    coercionLevel: 10,
    accessWindow: 30,
    performancePressure: 45,
    instabilityScore: 35,
    collapseProbability: 8,
    redoubledProbability: 5,
    lastLoyaltyShiftTick: 0
  }
});

const makeInitialDefectorCase = (): Record<string, DefectorCase> => ({
  'def_oracle': {
    defectorId: 'def_oracle',
    originService: 'CN Ministry of Space Industry (CMSI)',
    originCountry: 'CN',
    verificationStatus: 'PROVISIONAL',
    extractionWindowTicks: 16,
    transitRisk: 42,
    aliasReadiness: 35,
    familyExposureRisk: 65,
    resettlementPressure: 30,
    retroactiveDiscoveryRisk: 25,
    intelligenceBurstValue: 250,
    currentSafetyStatus: 'IN_PLACE',
    lastVerificationTick: 0,
    lastMovementTick: 0
  }
});

const makeInitialDiscoveryGraph = (): DiscoveryGraph => {
  const nodes: Record<string, DiscoveryNode> = {
    'node_src_sword': { nodeId: 'node_src_sword', nodeType: 'SOURCE', label: 'SOURCE: SWORD', sourceId: 'src_sword', riskWeight: 15, traceability: 25, compartmentationPenalty: 80, createdTick: 0 },
    'node_src_prism': { nodeId: 'node_src_prism', nodeType: 'SOURCE', label: 'SOURCE: PRISM', sourceId: 'src_prism', riskWeight: 35, traceability: 45, compartmentationPenalty: 90, createdTick: 0 },
    'node_hnd_vanguard': { nodeId: 'node_hnd_vanguard', nodeType: 'HANDLER', label: 'HANDLER: VANGUARD', riskWeight: 20, traceability: 15, compartmentationPenalty: 80, createdTick: 0 },
    'node_hnd_serenade': { nodeId: 'node_hnd_serenade', nodeType: 'HANDLER', label: 'HANDLER: SERENADE', riskWeight: 10, traceability: 10, compartmentationPenalty: 95, createdTick: 0 },
    'node_tgt_ru_cmd': { nodeId: 'node_tgt_ru_cmd', nodeType: 'TARGET', label: 'TARGET: RU CENTRAL COMMAND', targetId: 'RU_CENTRAL_COMMAND', riskWeight: 5, traceability: 35, compartmentationPenalty: 50, createdTick: 0 },
    'node_tgt_cn_cyber': { nodeId: 'node_tgt_cn_cyber', nodeType: 'TARGET', label: 'TARGET: CN CYBER BASE', targetId: 'CN_CYBER_BASE', riskWeight: 8, traceability: 40, compartmentationPenalty: 60, createdTick: 0 }
  };
  const edges: Record<string, DiscoveryEdge> = {
    'edge_sword_vanguard': { edgeId: 'edge_sword_vanguard', fromNodeId: 'node_src_sword', toNodeId: 'node_hnd_vanguard', relationshipType: 'HANDLING', weight: 40, traceabilityContribution: 12, concealmentResistance: 80, lastObservedTick: 0 },
    'edge_prism_serenade': { edgeId: 'edge_prism_serenade', fromNodeId: 'node_src_prism', toNodeId: 'node_hnd_serenade', relationshipType: 'HANDLING', weight: 20, traceabilityContribution: 8, concealmentResistance: 95, lastObservedTick: 0 },
    'edge_sword_target': { edgeId: 'edge_sword_target', fromNodeId: 'node_src_sword', toNodeId: 'node_tgt_ru_cmd', relationshipType: 'SHARED_ACCESS', weight: 60, traceabilityContribution: 30, concealmentResistance: 50, lastObservedTick: 0 },
    'edge_prism_target': { edgeId: 'edge_prism_target', fromNodeId: 'node_src_prism', toNodeId: 'node_tgt_cn_cyber', relationshipType: 'SHARED_ACCESS', weight: 80, traceabilityContribution: 45, concealmentResistance: 60, lastObservedTick: 0 }
  };
  const adjacency: Record<string, string[]> = {
    'node_src_sword': ['node_hnd_vanguard', 'node_tgt_ru_cmd'],
    'node_src_prism': ['node_hnd_serenade', 'node_tgt_cn_cyber'],
    'node_hnd_vanguard': ['node_src_sword'],
    'node_hnd_serenade': ['node_src_prism'],
    'node_tgt_ru_cmd': ['node_src_sword'],
    'node_tgt_cn_cyber': ['node_src_prism']
  };

  return {
    graphId: 'g_humint_forensics',
    nodes,
    edges,
    adjacency,
    rootExposureRisk: 22,
    totalTraceability: 120,
    cascadeDepth: 3,
    lastUpdatedTick: 0
  };
};

export const useHumintStore = create<HumintStore>((set, get) => ({
  sources: makeInitialSources(),
  handlers: makeInitialHandlers(),
  doubleAgents: makeInitialDoubleAgentState(),
  defectors: makeInitialDefectorCase(),
  discoveryGraph: makeInitialDiscoveryGraph(),
  selectedSourceId: null,
  selectedHandlerId: null,

  // ────────────────────────────────────────────────────────────────────────────────
  // BASIC ACTIONS
  // ────────────────────────────────────────────────────────────────────────────────

  addSource: (source) => set(produce((draft: HumintStore) => {
    draft.sources[source.identity.sourceId] = source;
  })),

  removeSource: (sourceId) => set(produce((draft: HumintStore) => {
    delete draft.sources[sourceId];
  })),

  updateSource: (sourceId, updater) => set(produce((draft: HumintStore) => {
    const s = draft.sources[sourceId];
    if (s) updater(s);
  })),

  addHandler: (handler) => set(produce((draft: HumintStore) => {
    draft.handlers[handler.handlerId] = handler;
  })),

  assignSource: (sourceId, handlerId) => set(produce((draft: HumintStore) => {
    const s = draft.sources[sourceId];
    if (!s) return;

    // Remove from previous handler
    Object.values(draft.handlers).forEach(h => {
      const idx = h.activeSources.indexOf(sourceId);
      if (idx !== -1) {
        h.activeSources.splice(idx, 1);
        h.sourceLoad = h.activeSources.length;
      }
    });

    if (handlerId) {
      const h = draft.handlers[handlerId];
      if (h) {
        h.activeSources.push(sourceId);
        h.sourceLoad = h.activeSources.length;
        s.handlerPsychology = { ...h.psychology };
        s.notes.push(`[System] Replaced active handler with Officer: ${h.alias}.`);
        get().connectSourceToHandler(sourceId, handlerId);
      }
    } else {
      s.notes.push(`[System] Disconnected current handler. Source is currently unassigned.`);
    }
  })),

  taskSource: (sourceId, task) => {
    const s = get().sources[sourceId];
    if (!s) return;

    set(produce((draft: HumintStore) => {
      const src = draft.sources[sourceId];
      src.state.taskLoad += 1;
      src.state.lastTaskTick = useWorldStore.getState().currentTick;
      src.state.lastContactTick = useWorldStore.getState().currentTick;
      src.notes.push(`Tasked: [${task.toUpperCase()}]. Stress increasing.`);
      if (src.identity.currentPhase === 'RECRUITED' || src.identity.currentPhase === 'HANDLED') {
        src.identity.currentPhase = 'TASKED';
      }
    }));

    if (s.identity.sourceType === 'DOUBLE_AGENT') {
      get().taskDoubleAgent(sourceId, task);
    }

    useWorldStore.getState().addGlobalEvent(`BLACK LANTERN tasking initiated: Source [${s.identity.coverName}] dispatched on mission "${task}".`, 'WARNING');
    useCinematicsStore.getState().triggerCinematic('SOURCE_TASKED', { sourceId, coverName: s.identity.coverName, task });
  },

  exfiltrateSource: (sourceId) => {
    const s = get().sources[sourceId];
    if (!s) return;

    set(produce((draft: HumintStore) => {
      const src = draft.sources[sourceId];
      src.identity.currentPhase = 'EXFILTRATED';
      src.notes.push(`Exfiltration pipeline executed successfully. Source extracted to high-security safehouse.`);
    }));

    // Trigger exfiltration of defector case if matching
    const defCase = Object.values(get().defectors).find(d => d.defectorId === sourceId || d.defectorId.includes(sourceId));
    if (defCase) {
      get().executeExfiltration(defCase.defectorId);
    } else {
      // Create defector case on-the-fly to handle exfiltration benefits
      const defId = `def_${sourceId}`;
      get().receiveDefector({
        defectorId: defId,
        originService: s.identity.hostileService,
        originCountry: s.identity.hostileCountry,
        verificationStatus: 'VERIFIED',
        currentSafetyStatus: 'EXFILTRATED'
      });
      get().executeExfiltration(defId);
    }
  },

  burnSource: (sourceId, cause = 'Counterintelligence compromise') => {
    const s = get().sources[sourceId];
    if (!s) return;

    set(produce((draft: HumintStore) => {
      const src = draft.sources[sourceId];
      src.identity.currentPhase = 'BURNED';
      src.state.compromiseRisk = 100;
      src.state.survivabilityScore = 0;
      src.notes.push(`[CRITICAL] Asset COMPROMISED/BURNED: ${cause}. Communication channels fractured.`);
    }));

    // Trigger consequences
    const severityMap: Record<string, 1 | 2 | 3> = { CORE: 3, HIGH: 2, MEDIUM: 1, LOCAL: 1 };
    const scarSeverity = severityMap[s.identity.accessLevel] || 1;

    useConsequenceStore.getState().addScar({
      id: `scar_burn_${s.identity.sourceId}`,
      type: 'CYBER_BLACKOUT_ZONE',
      countryId: s.identity.hostileCountry,
      lat: s.identity.hostileCountry === 'RU' ? 55.75 : s.identity.hostileCountry === 'CN' ? 39.90 : 35.68,
      lon: s.identity.hostileCountry === 'RU' ? 37.61 : s.identity.hostileCountry === 'CN' ? 116.40 : 51.38,
      radiusKm: scarSeverity * 150,
      createdTick: useWorldStore.getState().currentTick,
      severity: scarSeverity,
      healingRateTicksPerLevel: 30,
      currentSeverity: scarSeverity,
      activeEffects: {
        stabilityPenaltyPerTick: scarSeverity * 0.5,
        unrestBonusPerTick: scarSeverity * 1.5
      }
    });

    useWorldStore.getState().addGlobalEvent(`[COUNTER-INTEL BLOWBACK] Safe communication collapsed. Source [${s.identity.coverName}] was BURNED inside ${s.identity.hostileService}.`, 'CRITICAL');
    useCinematicsStore.getState().triggerCinematic('SOURCE_BURNED', { sourceId, coverName: s.identity.coverName, reason: cause });

    // Propagate risk backward!
    get().propagateDiscoveryRisk(sourceId);
  },

  convertSourceType: (sourceId, newType) => set(produce((draft: HumintStore) => {
    const s = draft.sources[sourceId];
    if (s) {
      s.identity.sourceType = newType;
      s.notes.push(`Re-classified source paradigm to: ${newType}`);
    }
  })),

  // ────────────────────────────────────────────────────────────────────────────────
  // STEP 4: RETROACTIVE DISCOVERY GRAPH
  // ────────────────────────────────────────────────────────────────────────────────

  initializeDiscoveryGraph: () => set(produce((draft: HumintStore) => {
    draft.discoveryGraph = makeInitialDiscoveryGraph();
  })),

  addDiscoveryNode: (node) => set(produce((draft: HumintStore) => {
    draft.discoveryGraph.nodes[node.nodeId] = node;
    if (!draft.discoveryGraph.adjacency[node.nodeId]) {
      draft.discoveryGraph.adjacency[node.nodeId] = [];
    }
  })),

  addDiscoveryEdge: (edge) => set(produce((draft: HumintStore) => {
    draft.discoveryGraph.edges[edge.edgeId] = edge;
    const fromAdj = draft.discoveryGraph.adjacency[edge.fromNodeId] || [];
    if (!fromAdj.includes(edge.toNodeId)) {
      fromAdj.push(edge.toNodeId);
      draft.discoveryGraph.adjacency[edge.fromNodeId] = fromAdj;
    }
    const toAdj = draft.discoveryGraph.adjacency[edge.toNodeId] || [];
    if (!toAdj.includes(edge.fromNodeId)) {
      toAdj.push(edge.fromNodeId);
      draft.discoveryGraph.adjacency[edge.toNodeId] = toAdj;
    }
  })),

  updateDiscoveryGraph: (updater) => set(produce((draft: HumintStore) => {
    updater(draft.discoveryGraph);
  })),

  connectSourceToHandler: (sourceId, handlerId) => {
    const fromId = `node_src_${sourceId}`;
    const toId = `node_hnd_${handlerId}`;
    const tick = useWorldStore.getState().currentTick;

    get().addDiscoveryNode({
      nodeId: fromId,
      nodeType: 'SOURCE',
      label: `SOURCE: ${sourceId.toUpperCase().replace('SRC_', '')}`,
      sourceId,
      riskWeight: 15,
      traceability: 20,
      compartmentationPenalty: 80,
      createdTick: tick
    });

    get().addDiscoveryNode({
      nodeId: toId,
      nodeType: 'HANDLER',
      label: `HANDLER: ${handlerId.toUpperCase().replace('HND_', '')}`,
      riskWeight: 10,
      traceability: 15,
      compartmentationPenalty: 85,
      createdTick: tick
    });

    get().addDiscoveryEdge({
      edgeId: `edge_${sourceId}_assigned_${handlerId}`,
      fromNodeId: fromId,
      toNodeId: toId,
      relationshipType: 'HANDLING',
      weight: 35,
      traceabilityContribution: 10,
      concealmentResistance: 80,
      lastObservedTick: tick
    });
  },

  connectSourceToOperation: (sourceId, operationId) => {
    const fromId = `node_src_${sourceId}`;
    const toId = `node_op_${operationId}`;
    const tick = useWorldStore.getState().currentTick;

    get().addDiscoveryNode({
      nodeId: toId,
      nodeType: 'OPERATION',
      label: `OPERATION: ${operationId}`,
      operationId,
      riskWeight: 25,
      traceability: 35,
      compartmentationPenalty: 70,
      createdTick: tick
    });

    get().addDiscoveryEdge({
      edgeId: `edge_${sourceId}_ops_${operationId}`,
      fromNodeId: fromId,
      toNodeId: toId,
      relationshipType: 'OPERATIONAL_DEPENDENCY',
      weight: 55,
      traceabilityContribution: 20,
      concealmentResistance: 70,
      lastObservedTick: tick
    });
  },

  connectSourceToTarget: (sourceId, targetId) => {
    const fromId = `node_src_${sourceId}`;
    const toId = `node_tgt_${targetId}`;
    const tick = useWorldStore.getState().currentTick;

    get().addDiscoveryNode({
      nodeId: toId,
      nodeType: 'TARGET',
      label: `TARGET: ${targetId}`,
      targetId,
      riskWeight: 8,
      traceability: 20,
      compartmentationPenalty: 60,
      createdTick: tick
    });

    get().addDiscoveryEdge({
      edgeId: `edge_${sourceId}_target_${targetId}`,
      fromNodeId: fromId,
      toNodeId: toId,
      relationshipType: 'SHARED_ACCESS',
      weight: 45,
      traceabilityContribution: 15,
      concealmentResistance: 60,
      lastObservedTick: tick
    });
  },

  calculateRetroactiveDiscoveryProbability: (sourceId) => {
    const s = get().sources[sourceId];
    if (!s) return 0;
    const state = s.state;
    const base = state.compromiseRisk * 0.4 + state.tradecraftRisk * 0.3 + (100 - state.compartmentationLevel) * 0.3;
    return Math.max(0, Math.min(100, Math.round(base)));
  },

  propagateDiscoveryRisk: (sourceId) => {
    // DFS traversal up to cascadeDepth on adjacent nodes in discoveryGraph
    const g = get().discoveryGraph;
    const startNodeId = `node_src_${sourceId}`;
    const visited = new Set<string>();

    set(produce((draft: HumintStore) => {
      const q: { nodeId: string; depth: number; sourceRisk: number }[] = [{ nodeId: startNodeId, depth: 0, sourceRisk: 100 }];
      visited.add(startNodeId);

      while (q.length > 0) {
        const item = q.shift()!;
        if (item.depth >= g.cascadeDepth) continue;

        const adjacents = g.adjacency[item.nodeId] || [];
        adjacents.forEach(adjId => {
          if (!visited.has(adjId)) {
            visited.add(adjId);
            const edgeKey = Object.keys(g.edges).find(k => 
              (g.edges[k].fromNodeId === item.nodeId && g.edges[k].toNodeId === adjId) ||
              (g.edges[k].fromNodeId === adjId && g.edges[k].toNodeId === item.nodeId)
            );
            const edgeWeight = edgeKey ? g.edges[edgeKey].weight : 20;
            const node = draft.discoveryGraph.nodes[adjId];
            if (node) {
              const increase = Math.round((item.sourceRisk * edgeWeight) / Math.max(10, node.compartmentationPenalty));
              node.riskWeight = Math.min(100, node.riskWeight + increase);

              // Apply passive damage downstream to matching live handlers
              if (node.nodeType === 'HANDLER') {
                const hAlias = node.label.replace('HANDLER: ', '');
                const handler = Object.values(draft.handlers).find(ha => ha.alias === hAlias);
                if (handler) {
                  handler.compromiseConcern = Math.min(100, handler.compromiseConcern + Math.round(increase * 1.5));
                  handler.fatigueLevel = Math.min(100, handler.fatigueLevel + 10);
                  handler.trustHistory.push(Math.max(10, (handler.trustHistory[handler.trustHistory.length - 1] || 50) - 15));
                }
              }
              
              q.push({ nodeId: adjId, depth: item.depth + 1, sourceRisk: node.riskWeight });
            }
          }
        });
      }
    }));

    useWorldStore.getState().addGlobalEvent(`[FORENSICS BLAST] Compromise cascade propagated in digital/logistical graph for ${sourceId}. Adjacent systems exposed.`, 'WARNING');
    useCinematicsStore.getState().triggerCinematic('DISCOVERY_CHAIN', { sourceId });
  },

  revealAncillaryExposure: (sourceId) => {
    // Add randomly selected indicators of trace exposure to notes
    set(produce((draft: HumintStore) => {
      const src = draft.sources[sourceId];
      if (src) {
        src.notes.push(`[ANCILLARY TRACE] Counterintelligence monitoring found correlation logs mapping ${src.identity.coverName} to suspected operational logistics nodes.`);
        src.state.retroactiveDiscoveryRisk = Math.min(100, src.state.retroactiveDiscoveryRisk + 18);
      }
    }));
  },

  markCompromiseChain: (sourceId) => {
    set(produce((draft: HumintStore) => {
      const src = draft.sources[sourceId];
      if (src) {
        src.state.deceptionRisk = Math.min(100, src.state.deceptionRisk + 25);
        src.state.compromiseRisk = Math.min(100, src.state.compromiseRisk + 15);
      }
    }));
  },

  recalculateGraphExposure: () => set(produce((draft: HumintStore) => {
    let sumRisk = 0;
    let count = 0;
    Object.values(draft.discoveryGraph.nodes).forEach(n => {
      sumRisk += n.riskWeight;
      count++;
    });
    draft.discoveryGraph.rootExposureRisk = count > 0 ? Math.round(sumRisk / count) : 10;
  })),

  // ────────────────────────────────────────────────────────────────────────────────
  // STEP 5: SOURCE LIFECYCLE
  // ────────────────────────────────────────────────────────────────────────────────

  spotPotentialSource: (candidate) => set(produce((draft: HumintStore) => {
    const sourceId = candidate.sourceId;
    const caseObj: SourceCase = {
      identity: {
        ...candidate,
        currentPhase: 'SPOTTED'
      },
      psychology: defaultSourcePsychProfile(),
      handlerPsychology: defaultHandlerPsychProfile(),
      state: {
        loyaltyScore: 30,
        handlerTrustScore: 20,
        compromiseRisk: 10,
        survivabilityScore: 90,
        intelYieldScore: 20,
        operationalValue: 15,
        retroactiveDiscoveryRisk: 5,
        burnProbability: 1,
        extractionReadiness: 0,
        compartmentationLevel: 50,
        tradecraftRisk: 5,
        deceptionRisk: 10,
        accessWindowRemaining: 20,
        taskLoad: 0,
        lastContactTick: useWorldStore.getState().currentTick,
        lastTaskTick: 0,
        lastRiskUpdateTick: useWorldStore.getState().currentTick
      },
      notes: [`Candidate spotted inside ${candidate.hostileService}. Evaluating access channels.`],
      provenance: ['Intel sweep spotted access indicators.'],
      linkedOperations: [],
      linkedTargets: []
    };
    draft.sources[sourceId] = caseObj;
    useWorldStore.getState().addGlobalEvent(`[HUMINT DEVELOP] Candidate [${candidate.coverName}] spotted in hostile service ${candidate.hostileService}. Initial background file initialized.`, 'INFO');
  })),

  assessSource: (sourceId) => set(produce((draft: HumintStore) => {
    const s = draft.sources[sourceId];
    if (!s) return;
    s.identity.currentPhase = 'ASSESSED';
    s.state.handlerTrustScore = Math.min(100, s.state.handlerTrustScore + 15);
    s.notes.push(`Assessment verified matching psychology with primary driver: [${s.psychology.primaryMotivation.toUpperCase()}].`);
  })),

  developSource: (sourceId) => set(produce((draft: HumintStore) => {
    const s = draft.sources[sourceId];
    if (!s) return;
    s.identity.currentPhase = 'DEVELOPING';
    s.state.loyaltyScore = Math.min(100, s.state.loyaltyScore + 12);
    s.state.compartmentationLevel = Math.min(100, s.state.compartmentationLevel + 5);
    s.notes.push(`Asset relationships expanded under cover contact drills. Transitioning closer to handler.`);
  })),

  recruitSource: (sourceId) => {
    const s = get().sources[sourceId];
    if (!s) return;

    set(produce((draft: HumintStore) => {
      const src = draft.sources[sourceId];
      src.identity.currentPhase = 'RECRUITED';
      src.state.loyaltyScore = Math.min(100, src.state.loyaltyScore + 20);
      src.state.operationalValue = Math.min(100, src.state.operationalValue + 30);
      src.notes.push(`[CLASSIFIED] Recruitment envelope finalized. Code alignment formal.`);
    }));

    useWorldStore.getState().addGlobalEvent(`[MISSION KEY] Source [${s.identity.coverName}] successfully RECRUITED into active geopolitical infiltration program.`, 'WARNING');
    useCinematicsStore.getState().triggerCinematic('SOURCE_RECRUITED', { sourceId, coverName: s.identity.coverName });
  },

  handleSource: (sourceId) => set(produce((draft: HumintStore) => {
    const s = draft.sources[sourceId];
    if (!s) return;
    s.identity.currentPhase = 'HANDLED';
    s.state.handlerTrustScore = Math.min(100, s.state.handlerTrustScore + 10);
    s.notes.push(`Standard safe communications matrix initialized. Structured courier drops activated.`);
  })),

  updateSourceRisk: (sourceId) => set(produce((draft: HumintStore) => {
    const s = draft.sources[sourceId];
    if (!s) return;
    const CI = useMirrorStore.getState().activeCounterCommitment?.activeStrategyId === 'COUNTER_INTEL_HULL' ? 1.4 : 1.0;
    
    // Core risk metrics calculations
    s.state.tradecraftRisk = Math.max(5, Math.min(100, Math.round((s.state.taskLoad * 18 + s.psychology.paranoia * 0.4) * CI)));
    s.state.compromiseRisk = Math.max(5, Math.min(100, Math.round((s.state.tradecraftRisk * 0.7 + s.state.retroactiveDiscoveryRisk * 0.4))));
    s.state.survivabilityScore = Math.max(0, Math.min(100, 100 - s.state.compromiseRisk));
    s.state.burnProbability = Math.round(s.state.compromiseRisk * (s.psychology.loyaltyFragility / 100 + 0.15));
  })),

  terminateSource: (sourceId) => set(produce((draft: HumintStore) => {
    const s = draft.sources[sourceId];
    if (!s) return;

    // Disconnect active handler active sources list
    Object.values(draft.handlers).forEach(h => {
      const idx = h.activeSources.indexOf(sourceId);
      if (idx !== -1) {
        h.activeSources.splice(idx, 1);
        h.sourceLoad = h.activeSources.length;
      }
    });

    s.identity.currentPhase = 'TERMINATED';
    s.state.survivabilityScore = 100;
    s.notes.push(`[System] Human intelligence case file closed and archived. Operation terminated.`);
    useWorldStore.getState().addGlobalEvent(`Case file ended: Asset [${s.identity.coverName}] retired from intelligence grids.`, 'INFO');
  })),

  updateRetroactiveDiscoveryRisk: (sourceId) => set(produce((draft: HumintStore) => {
    const s = draft.sources[sourceId];
    if (s) {
      const prob = get().calculateRetroactiveDiscoveryProbability(sourceId);
      s.state.retroactiveDiscoveryRisk = prob;
    }
  })),

  refreshSourceConfidence: (sourceId) => set(produce((draft: HumintStore) => {
    const s = draft.sources[sourceId];
    if (s) {
      s.state.handlerTrustScore = Math.round((s.state.loyaltyScore * 0.6 + (100 - s.psychology.deceptionSkill) * 0.4));
    }
  })),

  calculateSourceFragility: (sourceId) => {
    const s = get().sources[sourceId];
    if (!s) return 0;
    return Math.round((s.psychology.loyaltyFragility * 0.4 + s.psychology.burnoutRisk * 0.3 + s.state.taskLoad * 15));
  },

  // ────────────────────────────────────────────────────────────────────────────────
  // STEP 6: YIELD VS SURVIVABILITY MODEL
  // ────────────────────────────────────────────────────────────────────────────────

  calculateYieldPotential: (sourceId) => {
    const s = get().sources[sourceId];
    if (!s) return 0;
    const baseMap: Record<string, number> = { CORE: 90, HIGH: 70, MEDIUM: 50, LOCAL: 30 };
    const accessVal = baseMap[s.identity.accessLevel] || 40;
    return Math.max(5, Math.min(100, Math.round((accessVal * 0.6 + s.state.handlerTrustScore * 0.3 + s.state.loyaltyScore * 0.1))));
  },

  calculateSurvivability: (sourceId) => {
    const s = get().sources[sourceId];
    if (!s) return 0;
    return s.state.survivabilityScore;
  },

  calculateTaskingPressure: (sourceId) => {
    const s = get().sources[sourceId];
    if (!s) return 0;
    return Math.max(0, s.state.taskLoad * 15);
  },

  calculateHandlerRisk: (sourceId) => {
    const s = get().sources[sourceId];
    if (!s) return 0;
    const activeHandler = Object.values(get().handlers).find(h => h.activeSources.includes(sourceId));
    if (!activeHandler) return 10;
    return Math.round(activeHandler.fatigueLevel * 0.5 + activeHandler.compromiseConcern * 0.5);
  },

  recommendTaskIntensity: (sourceId) => {
    const frag = get().calculateSourceFragility(sourceId);
    if (frag > 70) return 'DANGEROUS / CRITICAL PAUSE REQUESTED';
    if (frag > 40) return 'MODERATE / CONSERVATIVE PULSE';
    return 'HIGH SUSTAINABLE CAPABILITY';
  },

  simulateSourceStress: (sourceId) => set(produce((draft: HumintStore) => {
    const s = draft.sources[sourceId];
    if (!s) return;
    const currentTick = useWorldStore.getState().currentTick;
    const ticksSinceTask = currentTick - s.state.lastTaskTick;

    // Burnout risk calculations
    let change = s.state.taskLoad * 3;
    if (ticksSinceTask > 4 && s.state.taskLoad > 0) {
      s.state.taskLoad = Math.max(0, s.state.taskLoad - 1);
      change -= 10;
    }
    s.psychology.burnoutRisk = Math.max(5, Math.min(100, s.psychology.burnoutRisk + change));
  })),

  estimateSourceBurnLikelihood: (sourceId) => {
    const s = get().sources[sourceId];
    if (!s) return 0;
    const CI = useMirrorStore.getState().activeCounterCommitment?.activeStrategyId === 'COUNTER_INTEL_HULL' ? 1.5 : 1.0;
    return Math.max(1, Math.min(100, Math.round((s.state.compromiseRisk * 0.5 + s.state.tradecraftRisk * 0.3 + s.psychology.paranoia * 0.2) * CI)));
  },

  // ────────────────────────────────────────────────────────────────────────────────
  // STEP 7: DOUBLE AGENT PARADIGM
  // ────────────────────────────────────────────────────────────────────────────────

  initializeDoubleAgent: (sourceId) => set(produce((draft: HumintStore) => {
    draft.doubleAgents[sourceId] = {
      primaryLoyalty: 60,
      hiddenLoyalty: 40,
      adversaryExpectation: 50,
      handlerExpectation: 70,
      deceptionDepth: 65,
      coverIntegrity: 80,
      betrayalTolerance: 50,
      resentmentLevel: 10,
      coercionLevel: 10,
      accessWindow: 25,
      performancePressure: 40,
      instabilityScore: 20,
      collapseProbability: 5,
      redoubledProbability: 1,
      lastLoyaltyShiftTick: useWorldStore.getState().currentTick
    };
    const s = draft.sources[sourceId];
    if (s) {
      s.identity.sourceType = 'DOUBLE_AGENT';
      s.notes.push('[System] Active dual-loyalty system initialized for double agent.');
    }
  })),

  updateDualLoyalty: (sourceId) => set(produce((draft: HumintStore) => {
    const da = draft.doubleAgents[sourceId];
    const s = draft.sources[sourceId];
    if (!da || !s) return;

    // Loyalty drift depends on handlerTrust vs stress
    const currentTick = useWorldStore.getState().currentTick;
    da.lastLoyaltyShiftTick = currentTick;

    const pressure = Math.round(da.performancePressure * 0.3 + s.psychology.paranoia * 0.2);
    da.instabilityScore = Math.max(10, Math.min(100, Math.round((da.resentmentLevel + pressure))));

    // hidden loyalty drift
    if (da.instabilityScore > 60) {
      da.hiddenLoyalty = Math.min(100, da.hiddenLoyalty + 4);
      da.primaryLoyalty = Math.max(0, da.primaryLoyalty - 3);
    } else {
      da.primaryLoyalty = Math.min(100, da.primaryLoyalty + 2);
    }

    da.collapseProbability = Math.round(da.instabilityScore * 0.25);
  })),

  taskDoubleAgent: (sourceId, task) => {
    get().updateDualLoyalty(sourceId);
    set(produce((draft: HumintStore) => {
      const da = draft.doubleAgents[sourceId];
      if (da) {
        da.performancePressure = Math.min(100, da.performancePressure + 15);
        da.deceptionDepth = Math.min(100, da.deceptionDepth + 8);
      }
    }));
  },

  evaluateDoubleAgentStability: (sourceId) => {
    const da = get().doubleAgents[sourceId];
    return da ? 100 - da.instabilityScore : 100;
  },

  collapseDoubleAgent: (sourceId) => {
    const s = get().sources[sourceId];
    if (!s) return;

    const roll = Math.random() * 100;
    if (roll < 40) {
      // Flip to Redoubled Agent feeding bad information
      get().convertToRedoubledAgent(sourceId);
    } else {
      // Expose and burn
      get().burnSource(sourceId, 'Exposed during contradictory dual-routing tasks.');
    }
  },

  convertToRedoubledAgent: (sourceId) => {
    set(produce((draft: HumintStore) => {
      const s = draft.sources[sourceId];
      const da = draft.doubleAgents[sourceId];
      if (s) {
        s.identity.sourceType = 'REDOUBLED_AGENT';
        s.notes.push('[FATAL] Asset successfully turned against handler by hostile counter-intelligence! Feeding false traces.');
      }
      if (da) {
        da.hiddenLoyalty = 100;
        da.primaryLoyalty = 10;
        da.redoubledProbability = 100;
      }
    }));

    useWorldStore.getState().addGlobalEvent(`[CRITICAL LEAK] Double Agent [${sourceId}] collapsed and redoubled. Adversary counterintelligence now feed poisoned operations.`, 'CRITICAL');
  },

  computeDoubleAgentYield: (sourceId) => {
    const da = get().doubleAgents[sourceId];
    if (!da) return 0;
    return Math.round(da.primaryLoyalty * 0.7 + da.deceptionDepth * 0.3);
  },

  computeDoubleAgentExposure: (sourceId) => {
    const da = get().doubleAgents[sourceId];
    if (!da) return 0;
    return Math.round(da.collapseProbability * 2.5);
  },

  // ────────────────────────────────────────────────────────────────────────────────
  // STEP 8: DEFECTOR EXFILTRATION
  // ────────────────────────────────────────────────────────────────────────────────

  receiveDefector: (defectorData) => set(produce((draft: HumintStore) => {
    const defId = defectorData.defectorId;
    const def: DefectorCase = {
      defectorId: defId,
      originService: defectorData.originService || 'Foreign Service',
      originCountry: defectorData.originCountry || 'RU',
      verificationStatus: defectorData.verificationStatus || 'UNVERIFIED',
      extractionWindowTicks: defectorData.extractionWindowTicks || 20,
      transitRisk: defectorData.transitRisk || 50,
      aliasReadiness: defectorData.aliasReadiness || 20,
      familyExposureRisk: defectorData.familyExposureRisk || 40,
      resettlementPressure: defectorData.resettlementPressure || 20,
      retroactiveDiscoveryRisk: defectorData.retroactiveDiscoveryRisk || 15,
      intelligenceBurstValue: defectorData.intelligenceBurstValue || 150,
      currentSafetyStatus: defectorData.currentSafetyStatus || 'IN_PLACE',
      lastVerificationTick: useWorldStore.getState().currentTick,
      lastMovementTick: useWorldStore.getState().currentTick
    };
    draft.defectors[defId] = def;

    // Create a corresponding source registry item if not exists
    if (!draft.sources[defId]) {
      draft.sources[defId] = {
        identity: {
          sourceId: defId,
          coverName: `DEFECTOR-${defId.toUpperCase().replace('DEF_', '')}`,
          hostileService: def.originService,
          hostileCountry: def.originCountry,
          accessLevel: 'HIGH',
          sourceType: 'DEFECTOR',
          currentPhase: 'SPOTTED'
        },
        psychology: defaultSourcePsychProfile(),
        handlerPsychology: defaultHandlerPsychProfile(),
        state: {
          loyaltyScore: 80,
          handlerTrustScore: 60,
          compromiseRisk: 30,
          survivabilityScore: 70,
          intelYieldScore: 90,
          operationalValue: 85,
          retroactiveDiscoveryRisk: 25,
          burnProbability: 10,
          extractionReadiness: 40,
          compartmentationLevel: 70,
          tradecraftRisk: 20,
          deceptionRisk: 10,
          accessWindowRemaining: 20,
          taskLoad: 0,
          lastContactTick: useWorldStore.getState().currentTick,
          lastTaskTick: 0,
          lastRiskUpdateTick: useWorldStore.getState().currentTick
        },
        notes: [`Defection inquiry established with verification value: ${def.intelligenceBurstValue}B.`],
        provenance: ['Dissident outreach.'],
        linkedOperations: [],
        linkedTargets: []
      };
    }
  })),

  verifyDefector: (defectorId) => set(produce((draft: HumintStore) => {
    const d = draft.defectors[defectorId];
    if (!d) return;
    d.verificationStatus = 'VERIFIED';
    d.transitRisk = Math.max(10, d.transitRisk - 15);
    d.retroactiveDiscoveryRisk = Math.max(5, d.retroactiveDiscoveryRisk - 10);
    d.lastVerificationTick = useWorldStore.getState().currentTick;
    useWorldStore.getState().addGlobalEvent(`Defector verification finalized. Source verified inside secure channel.`, 'INFO');
  })),

  planExfiltration: (defectorId) => set(produce((draft: HumintStore) => {
    const d = draft.defectors[defectorId];
    if (!d) return;
    d.aliasReadiness = Math.min(100, d.aliasReadiness + 25);
    d.transitRisk = Math.max(5, d.transitRisk - 20);
    useWorldStore.getState().addGlobalEvent(`Clandestine logistical route established for defector exfiltration. Transit risks lowered.`, 'INFO');
  })),

  executeExfiltration: (defectorId) => {
    const d = get().defectors[defectorId];
    if (!d) return;

    if (d.currentSafetyStatus !== 'IN_PLACE' && d.currentSafetyStatus !== 'MOVING') return;

    const roll = Math.random() * 100;
    const successChance = 100 - d.transitRisk;

    set(produce((draft: HumintStore) => {
      const def = draft.defectors[defectorId];
      const s = draft.sources[defectorId] || draft.sources[defectorId.replace('def_', 'src_')];
      
      if (roll < successChance) {
        def.currentSafetyStatus = 'EXFILTRATED';
        def.extractionWindowTicks = 0;
        if (s) {
          s.identity.currentPhase = 'EXFILTRATED';
          s.notes.push('[EXFIL] Transferred safely through custom entry points.');
        }
        useWorldStore.getState().addGlobalEvent(`[EXFIL SUCCESS] Defector [${defectorId.toUpperCase()}] safely exfiltrated from hostile territories. Safe house secure.`, 'CRITICAL');
        useCinematicsStore.getState().triggerCinematic('DEFECTOR_EXFILTRATED', { defectorId });
        get().exportDefectorIntel(defectorId);
      } else {
        def.currentSafetyStatus = 'COMPROMISED';
        if (s) {
          s.identity.currentPhase = 'BURNED';
          s.notes.push('[FATAL] Compromised during exfiltration transit sequence!');
        }
        useWorldStore.getState().addGlobalEvent(`[EXFIL CRASH] Exfiltration failed! Defector [${defectorId.toUpperCase()}] intercepted by national tactical border guards.`, 'CRITICAL');
        get().burnSource(s?.identity.sourceId || defectorId, 'Exfiltration transit intercept');
      }
    }));
  },

  resettleDefector: (defectorId) => set(produce((draft: HumintStore) => {
    const d = draft.defectors[defectorId];
    if (!d || d.currentSafetyStatus !== 'EXFILTRATED') return;
    d.currentSafetyStatus = 'SEALED';
    d.resettlementPressure = 0;
    useWorldStore.getState().addGlobalEvent(`Defector resettled under deep cover synthetic ID portfolio. Case closed.`, 'INFO');
  })),

  recalculateRetroactiveDiscoveryRisk: (defectorId) => set(produce((draft: HumintStore) => {
    const d = draft.defectors[defectorId];
    if (!d) return;
    d.retroactiveDiscoveryRisk = Math.round(d.familyExposureRisk * 0.4 + (100 - d.aliasReadiness) * 0.5);
  })),

  exportDefectorIntel: (defectorId) => {
    const d = get().defectors[defectorId];
    if (!d) return;

    // Yield burst of budget or intel to player store
    const payout = d.intelligenceBurstValue;
    const playerStore = usePlayerStore.getState() as any;
    if (playerStore.addInfluenceCapital) {
      playerStore.addInfluenceCapital(payout);
    } else {
      // fallback
      useWorldStore.getState().updateCountry(playerStore.countryId || 'US', (c) => {
        c.economic.treasuryCashB = Math.min(9999, c.economic.treasuryCashB + (payout / 10));
      });
    }

    // Accelerate a pending SIGINT transition
    const sigintState = useSigintStore.getState() as any;
    const targetedTarget = Object.keys(sigintState.targets)[0];
    if (targetedTarget && sigintState.accelerateTargetSignal) {
      sigintState.accelerateTargetSignal(targetedTarget, 40);
    }

    useWorldStore.getState().addGlobalEvent(`[INTELLIGENCE BURST] Resettlement intelligence debrief unlocked. Advanced strategic files ingested. Yield: +${payout} Influence.`, 'INFO');
    get().recordIntelligenceBurst(defectorId, payout, `Ingested strategic documents.`);
  },

  // ────────────────────────────────────────────────────────────────────────────────
  // STEP 9: HANDLER PSYCHOLOGY
  // ────────────────────────────────────────────────────────────────────────────────

  createHandler: (handlerData) => set(produce((draft: HumintStore) => {
    draft.handlers[handlerData.handlerId] = handlerData;
  })),

  assignSourceToHandler: (sourceId, handlerId) => {
    get().assignSource(sourceId, handlerId);
  },

  updateHandlerPsychology: (handlerId) => set(produce((draft: HumintStore) => {
    const h = draft.handlers[handlerId];
    if (!h) return;

    // Suspicion bias climbs if sources are highly unstable
    const loads = h.activeSources.length;
    h.compromiseConcern = Math.min(100, Math.max(10, h.compromiseConcern + loads * 2));
    h.attachmentRisk = Math.min(100, Math.round(h.operationalEmpathy * 1.5 + loads * 4));
  })),

  simulateHandlerFatigue: (handlerId) => set(produce((draft: HumintStore) => {
    const h = draft.handlers[handlerId];
    if (!h) return;
    const loadPenalty = h.activeSources.length * 4;
    h.fatigueLevel = Math.min(100, h.fatigueLevel + Math.max(1, loadPenalty));

    if (h.fatigueLevel > 85) {
      h.decisionStyle = 'PARANOID';
      h.activeSources.forEach(sId => {
        const s = draft.sources[sId];
        if (s) {
          s.state.handlerTrustScore = Math.max(10, s.state.handlerTrustScore - 12);
          s.notes.push(`[System Warning] Handler fatigue is extreme. Communication checks are failing.`);
        }
      });
      useWorldStore.getState().addGlobalEvent(`[HANDLER BURNOUT] Officer [${h.alias}] is fatigued. Operational control compromising.`, 'WARNING');
      useCinematicsStore.getState().triggerCinematic('HANDLER_BURNOUT', { handlerId, alias: h.alias });
    }
  })),

  calculateHandlerAttachmentRisk: (handlerId) => {
    const h = get().handlers[handlerId];
    return h ? h.attachmentRisk : 0;
  },

  calculateHandlerCompromiseConcern: (handlerId) => {
    const h = get().handlers[handlerId];
    return h ? h.compromiseConcern : 20;
  },

  recommendHandlerStyle: (handlerId) => {
    const h = get().handlers[handlerId];
    if (!h) return 'BALANCED';
    if (h.fatigueLevel > 60) return 'URGENT ROTATION SUGGESTED';
    return h.decisionStyle;
  },

  setSelectedSourceId: (sourceId) => set({ selectedSourceId: sourceId }),
  setSelectedHandlerId: (handlerId) => set({ selectedHandlerId: handlerId }),

  recordCompromise: (sourceId, description) => set(produce((draft: HumintStore) => {
    const s = draft.sources[sourceId];
    if (s) {
      s.notes.push(`Compromised: ${description}`);
      s.state.compromiseRisk = Math.min(100, s.state.compromiseRisk + 30);
    }
  })),

  recordExfiltration: (sourceId, description) => set(produce((draft: HumintStore) => {
    const s = draft.sources[sourceId];
    if (s) {
       s.notes.push(`Exfiltrated: ${description}`);
    }
  })),

  recordIntelligenceBurst: (sourceId, value, desc) => set(produce((draft: HumintStore) => {
    const s = draft.sources[sourceId];
    if (s) {
       s.state.intelYieldScore = Math.min(100, s.state.intelYieldScore + 10);
       s.provenance.push(`Yield Burst: ${desc} (+${value})`);
    }
  })),

  // ────────────────────────────────────────────────────────────────────────────────
  // ATOMIC TICK SIMULATION STEP
  // ────────────────────────────────────────────────────────────────────────────────

  tickHumint: (currentTick) => {
    set(produce((draft: HumintStore) => {
      // 1. Process handlers fatigue and psychological drift
      Object.keys(draft.handlers).forEach(hId => {
        const h = draft.handlers[hId];
        const loads = h.activeSources.length;
        
        // Recover fatigue slightly if zero sources
        if (loads === 0) {
          h.fatigueLevel = Math.max(0, h.fatigueLevel - 2);
        } else {
          h.fatigueLevel = Math.min(100, h.fatigueLevel + Math.round(loads * 1.5));
        }

        // Drifts
        if (h.fatigueLevel > 80) {
          h.compromiseConcern = Math.min(100, h.compromiseConcern + 3);
        }
      });

      // 2. Process active sources reporting and stress simulation
      Object.keys(draft.sources).forEach(sId => {
        const s = draft.sources[sId];
        if (s.identity.currentPhase === 'BURNED' || s.identity.currentPhase === 'TERMINATED') return;

        // Simulate stress / burnout
        const load = s.state.taskLoad;
        const currentBurnout = s.psychology.burnoutRisk;
        let stressInc = load * 4;
        
        const CI = useMirrorStore.getState().activeCounterCommitment?.activeStrategyId === 'COUNTER_INTEL_HULL' ? 1.4 : 1.0;
        s.state.tradecraftRisk = Math.max(5, Math.min(100, Math.round((load * 15 + s.psychology.paranoia * 0.3) * CI)));
        s.state.compromiseRisk = Math.max(5, Math.min(100, Math.round((s.state.tradecraftRisk * 0.7 + s.state.retroactiveDiscoveryRisk * 0.3))));
        s.state.survivabilityScore = Math.max(0, Math.min(100, 100 - s.state.compromiseRisk));
        s.state.burnProbability = Math.round(s.state.compromiseRisk * (s.psychology.loyaltyFragility / 100 + 0.15));

        // Age access window remaining
        if (s.identity.currentPhase === 'TASKED' || s.identity.currentPhase === 'HANDLED') {
          s.state.accessWindowRemaining = Math.max(0, s.state.accessWindowRemaining - 1);
          if (s.state.accessWindowRemaining === 0) {
            s.notes.push(`[Warning] Source clearance window has expired. Access lost recursively.`);
            s.identity.currentPhase = 'TERMINATED';
          }
        }

        // Drift loyalty and trust
        if (load > 2) {
          s.state.loyaltyScore = Math.max(10, s.state.loyaltyScore - 5);
        }

        // Auto trigger collapse for high risk double agents
        if (s.identity.sourceType === 'DOUBLE_AGENT' || s.identity.sourceType === 'REDOUBLED_AGENT') {
          const da = draft.doubleAgents[sId];
          if (da) {
            const pressure = Math.round(da.performancePressure * 0.3 + s.psychology.paranoia * 0.2);
            da.instabilityScore = Math.max(10, Math.min(100, Math.round((da.resentmentLevel + pressure))));
            da.collapseProbability = Math.round(da.instabilityScore * 0.25);
            
            if (da.instabilityScore > 80 && Math.random() < 0.15) {
              // collapse double agent
              da.collapseProbability = 100;
              s.notes.push(`[Double Agent Collapse] Instability exceeded tolerance levels!`);
            }
          }
        }

        // Random survival collapse
        if (s.state.burnProbability > 65 && Math.random() < 0.25) {
          s.notes.push(`[CI INTERCEPT] Enemy counterintelligence detected abnormal access telemetry.`);
        }
      });

      // 3. Process defector windows
      Object.keys(draft.defectors).forEach(defId => {
        const d = draft.defectors[defId];
        if (d.currentSafetyStatus === 'IN_PLACE') {
          d.extractionWindowTicks = Math.max(0, d.extractionWindowTicks - 1);
          if (d.extractionWindowTicks === 0) {
            d.currentSafetyStatus = 'COMPROMISED';
            const s = draft.sources[defId] || draft.sources[defId.replace('def_', 'src_')];
            if (s) {
              s.identity.currentPhase = 'BURNED';
              s.notes.push('[FATAL] Verification window expired in place. Target compromised by internal audit sweeps.');
            }
            useWorldStore.getState().addGlobalEvent(`[DEFECTOR TIMEOUT] Logistical sweep caught defector candidate [${defId.toUpperCase()}] before exfil. Link severed.`, 'CRITICAL');
          }
        }
      });

      // 4. Recalculate graph risk
      let sumRisk = 0;
      let count = 0;
      Object.values(draft.discoveryGraph.nodes).forEach(n => {
        sumRisk += n.riskWeight;
        count++;
      });
      draft.discoveryGraph.rootExposureRisk = count > 0 ? Math.round(sumRisk / count) : 10;
    }));
  }
}));
