import { create } from 'zustand';
import { produce } from 'immer';
import { 
  ProliferationNetwork, 
  ProliferationNode, 
  ProliferationEdge, 
  InterdictionCase,
  CounterProliferationAction,
  LegalBlowbackLevel,
  VerificationTier,
  ProliferationThreatLevel,
  NetworkConfidenceProfile,
  ProliferationNodeType
} from '../types';
import { useWorldStore } from './worldStore';
import { useCinematicsStore } from './cinematicsStore';
import { useConsequenceStore } from './consequenceStore';

interface CounterProliferationState {
  networks: Record<string, ProliferationNetwork>;
  cases: Record<string, InterdictionCase>;
  selectedNetworkId: string | null;
  selectedCaseId: string | null;
  logs: string[];
  
  // Base Actions
  createNetwork: (label: string, initialThreat?: ProliferationThreatLevel) => string;
  addNode: (networkId: string, node: Omit<ProliferationNode, 'lastObservedTick'>) => void;
  addEdge: (networkId: string, edge: Omit<ProliferationEdge, 'lastObservedTick'>) => void;
  updateNode: (networkId: string, nodeId: string, updates: Partial<ProliferationNode>) => void;
  selectNetwork: (networkId: string | null) => void;
  addLog: (text: string) => void;
  
  // Tracker Functions
  createProliferationNetwork: (params: { label: string; threatLevel?: ProliferationThreatLevel }) => string;
  addProliferationNode: (networkId: string, node: ProliferationNode) => void;
  addProliferationEdge: (networkId: string, edge: ProliferationEdge) => void;
  updateNodeConfidence: (networkId: string, nodeId: string, confidence: number) => void;
  updateNetworkVerification: (networkId: string) => void;
  recalculateNetworkThreat: (networkId: string) => void;
  flagNetworkAlert: (networkId: string, alert: string) => void;
  tickProliferation: (currentTick: number) => void;

  // Verification & Action Evaluation
  evaluateVerificationThreshold: (networkId: string) => VerificationTier;
  requireLegalThreshold: (networkId: string) => boolean;
  calculateActionReadiness: (networkId: string, action: CounterProliferationAction) => number;
  compareActionRisk: (networkId: string, action: CounterProliferationAction) => {
    collateral: number;
    diplomatic: number;
    operational: number;
  };
  recommendAction: (networkId: string) => CounterProliferationAction;
  blockPrematureAction: (networkId: string, action: CounterProliferationAction) => boolean;
  releaseActionAuthorization: (networkId: string, action: CounterProliferationAction) => boolean;

  // Interdiction Planner
  planInterdiction: (networkId: string, action: CounterProliferationAction) => string;
  executeInterdiction: (caseId: string) => void;
  applySabotageEffect: (networkId: string) => void;
  fragmentNetwork: (networkId: string) => void;
  updateMaterialFlow: (networkId: string) => number;
  reduceNetworkMobility: (networkId: string) => void;
  assessInterdictionOutcome: (caseId: string) => void;
  generatePostActionNetworkState: (networkId: string) => void;

  // Legal Blowback
  calculateLegalBlowback: (networkId: string, action: CounterProliferationAction) => LegalBlowbackLevel;
  updateLegalBlowbackLevel: (networkId: string) => void;
  triggerLegalReview: (networkId: string) => void;
  assessInternationalResponse: (networkId: string) => string;
  assessDomesticOversight: (networkId: string) => string;
  assignPolicyConsequences: (networkId: string, blowback: LegalBlowbackLevel) => void;
  expireLegalBlowback: (networkId: string) => void;
}

// Helper: initial pre-seeded network data
const seedInitialState = (): Record<string, ProliferationNetwork> => {
  const nodes: Record<string, ProliferationNode> = {
    'node_vienna_front': {
      nodeId: 'node_vienna_front',
      label: 'Aero-Baltic Logistics GmbH',
      nodeType: 'FRONT_COMPANY',
      threatLevel: 'SUSPECTED',
      verificationTier: 'CORROBORATED',
      confidence: 62,
      materialRelevance: 45,
      legalSensitivity: 30,
      operationalSensitivity: 20,
      exposureRisk: 15,
      lastObservedTick: 10,
      associatedCountries: ['Austria', 'Estonia'],
      linkedNodes: ['node_danube_star', 'node_nicosia_bank'],
      notes: ['Identified procurement of corrosion-resistant specialized alloy tubing.', 'Linked to corporate shell networks registered in Tallinn.']
    },
    'node_danube_star': {
      nodeId: 'node_danube_star',
      label: 'M/V Danube Star',
      nodeType: 'VESSEL',
      threatLevel: 'PROBABLE',
      verificationTier: 'STRONG',
      confidence: 78,
      materialRelevance: 75,
      legalSensitivity: 55,
      operationalSensitivity: 40,
      exposureRisk: 35,
      lastObservedTick: 12,
      associatedCountries: ['Panama', 'Cyprus'],
      linkedNodes: ['node_vienna_front', 'node_natanz_complex'],
      notes: ['Maritime transhipment vessel carrying heavy machinery assemblies.', 'Under Panamanian flag of convenience, current location: Aegean Sea.']
    },
    'node_nicosia_bank': {
      nodeId: 'node_nicosia_bank',
      label: 'Levant Credit Corp (Nicosia)',
      nodeType: 'BANK',
      threatLevel: 'LOW',
      verificationTier: 'WEAK',
      confidence: 43,
      materialRelevance: 30,
      legalSensitivity: 80,
      operationalSensitivity: 15,
      exposureRisk: 25,
      lastObservedTick: 8,
      associatedCountries: ['Cyprus', 'Lebanon'],
      linkedNodes: ['node_vienna_front', 'node_broker_khalid'],
      notes: ['Suspicious transactions processed to Vienna front entities.', 'Involved in correspondent banking connections for sanctioned states.']
    },
    'node_broker_khalid': {
      nodeId: 'node_broker_khalid',
      label: 'K. Al-Sudais (Broker)',
      nodeType: 'BROKER',
      threatLevel: 'SUSPECTED',
      verificationTier: 'WEAK',
      confidence: 50,
      materialRelevance: 40,
      legalSensitivity: 60,
      operationalSensitivity: 50,
      exposureRisk: 42,
      lastObservedTick: 15,
      associatedCountries: ['Switzerland', 'Lebanon'],
      linkedNodes: ['node_nicosia_bank'],
      notes: ['Negotiated supply of high-purity carbon composite fiber blocks.']
    },
    'node_natanz_complex': {
      nodeId: 'node_natanz_complex',
      label: 'Sovereign Enrichment Hall 3',
      nodeType: 'FACILITY',
      threatLevel: 'CRITICAL',
      verificationTier: 'LEGAL_THRESHOLD_MET',
      confidence: 90,
      materialRelevance: 100,
      legalSensitivity: 10,
      operationalSensitivity: 95,
      exposureRisk: 80,
      lastObservedTick: 18,
      associatedCountries: ['Iran'],
      linkedNodes: ['node_danube_star'],
      notes: ['Uranium centrifuge cascade operations detected via deep imagery analytics.', 'Expected operational status: 4-6 weeks to breakout.']
    }
  };

  const edges: Record<string, ProliferationEdge> = {
    'edge_bank_to_front': {
      edgeId: 'edge_bank_to_front',
      fromNodeId: 'node_nicosia_bank',
      toNodeId: 'node_vienna_front',
      relationshipType: 'PAYMENT',
      confidence: 55,
      traceability: 60,
      concealmentResistance: 40,
      legalSensitivity: 70,
      lastObservedTick: 8
    },
    'edge_broker_to_bank': {
      edgeId: 'edge_broker_to_bank',
      fromNodeId: 'node_broker_khalid',
      toNodeId: 'node_nicosia_bank',
      relationshipType: 'BROKERAGE',
      confidence: 48,
      traceability: 35,
      concealmentResistance: 60,
      legalSensitivity: 50,
      lastObservedTick: 15
    },
    'edge_front_to_vessel': {
      edgeId: 'edge_front_to_vessel',
      fromNodeId: 'node_vienna_front',
      toNodeId: 'node_danube_star',
      relationshipType: 'SUPPLY',
      confidence: 72,
      traceability: 80,
      concealmentResistance: 25,
      legalSensitivity: 40,
      lastObservedTick: 10
    },
    'edge_vessel_to_facility': {
      edgeId: 'edge_vessel_to_facility',
      fromNodeId: 'node_danube_star',
      toNodeId: 'node_natanz_complex',
      relationshipType: 'TRANSPORT',
      confidence: 85,
      traceability: 90,
      concealmentResistance: 20,
      legalSensitivity: 30,
      lastObservedTick: 12
    }
  };

  return {
    'net_centrifuge_swarm': {
      networkId: 'net_centrifuge_swarm',
      label: 'Astarte Cascade Procurement Syndicate',
      threatLevel: 'PROBABLE',
      verificationTier: 'CORROBORATED',
      confidence: {
        nodeConfidence: 65,
        edgeConfidence: 65,
        materialConfidence: 74,
        attributionConfidence: 58,
        verificationConfidence: 64,
        legalConfidence: 52,
        actionabilityConfidence: 60,
        falsePositiveRisk: 30,
        falseNegativeRisk: 25,
        contaminationRisk: 15,
      },
      nodes,
      edges,
      rootNodes: ['node_broker_khalid', 'node_vienna_front'],
      activeAlerts: ['ALERT: Centrifuge components en-route via Eastern Mediterranean.'],
      legalBlowbackLevel: 'NONE',
      operationalReadiness: 65,
      lastUpdatedTick: 18
    }
  };
};

export const useCounterProliferationStore = create<CounterProliferationState>((set, get) => ({
  networks: seedInitialState(),
  cases: {},
  selectedNetworkId: 'net_centrifuge_swarm',
  selectedCaseId: null,
  logs: ['Counter-proliferation tactical network database initialized.', 'Sovereign satellite monitoring active over Levantine ports.'],

  createNetwork: (label, initialThreat) => {
    const id = `net_${Date.now()}`;
    set(produce((draft) => {
      draft.networks[id] = {
        networkId: id,
        label,
        threatLevel: initialThreat || 'SUSPECTED',
        verificationTier: 'UNVERIFIED',
        confidence: {
          nodeConfidence: 20,
          edgeConfidence: 20,
          materialConfidence: 20,
          attributionConfidence: 20,
          verificationConfidence: 20,
          legalConfidence: 20,
          actionabilityConfidence: 20,
          falsePositiveRisk: 50,
          falseNegativeRisk: 50,
          contaminationRisk: 20,
        },
        nodes: {},
        edges: {},
        rootNodes: [],
        activeAlerts: [],
        legalBlowbackLevel: 'NONE',
        operationalReadiness: 20,
        lastUpdatedTick: useWorldStore.getState().currentTick || 0
      };
    }));
    get().addLog(`Discovered new suspected counter-proliferation network target: ${label}`);
    return id;
  },

  addNode: (networkId, node) => {
    set(produce((draft) => {
      if (draft.networks[networkId]) {
        draft.networks[networkId].nodes[node.nodeId] = {
          ...node,
          lastObservedTick: useWorldStore.getState().currentTick || 1
        };
      }
    }));
    get().updateNetworkVerification(networkId);
    get().recalculateNetworkThreat(networkId);
  },

  addEdge: (networkId, edge) => {
    set(produce((draft) => {
      if (draft.networks[networkId]) {
        draft.networks[networkId].edges[edge.edgeId] = {
          ...edge,
          lastObservedTick: useWorldStore.getState().currentTick || 1
        };
      }
    }));
    get().updateNetworkVerification(networkId);
  },

  updateNode: (networkId, nodeId, updates) => {
    set(produce((draft) => {
      if (draft.networks[networkId] && draft.networks[networkId].nodes[nodeId]) {
        draft.networks[networkId].nodes[nodeId] = {
          ...draft.networks[networkId].nodes[nodeId],
          ...updates
        };
      }
    }));
    get().updateNetworkVerification(networkId);
    get().recalculateNetworkThreat(networkId);
  },

  selectNetwork: (networkId) => {
    set({ selectedNetworkId: networkId });
  },

  addLog: (text) => {
    set(produce((draft) => {
      draft.logs.unshift(`[TICK ${useWorldStore.getState().currentTick || 0}] ${text}`);
      if (draft.logs.length > 100) draft.logs.pop();
    }));
  },

  createProliferationNetwork: (params) => {
    return get().createNetwork(params.label, params.threatLevel);
  },

  addProliferationNode: (networkId, node) => {
    get().addNode(networkId, node);
  },

  addProliferationEdge: (networkId, edge) => {
    get().addEdge(networkId, edge);
  },

  updateNodeConfidence: (networkId, nodeId, confidence) => {
    get().updateNode(networkId, nodeId, { confidence });
  },

  updateNetworkVerification: (networkId) => {
    set(produce((draft) => {
      const net = draft.networks[networkId];
      if (!net) return;

      const nodesArray = Object.values(net.nodes) as any[];
      const edgesArray = Object.values(net.edges) as any[];

      if (nodesArray.length === 0) return;

      const avgNodeConf = Math.round(nodesArray.reduce((acc, n) => acc + (n.confidence || 0), 0) / nodesArray.length);
      const avgEdgeConf = edgesArray.length > 0
        ? Math.round(edgesArray.reduce((acc, e) => acc + (e.confidence || 0), 0) / edgesArray.length)
        : avgNodeConf - 5;

      // Material correlation is elevated if we have FACILITIES or MATERIALS verified
      const hasCriticalFacility = nodesArray.some(n => n.nodeType === 'FACILITY' && n.confidence > 70);
      const hasMaterial = nodesArray.some(n => n.nodeType === 'MATERIAL' && n.confidence > 60);
      const materialConf = Math.min(100, (hasCriticalFacility ? 85 : 40) + (hasMaterial ? 15 : 0) + Math.floor(avgNodeConf / 5));

      const attributionConf = Math.min(100, Math.round(avgNodeConf * 0.9));
      const verificationConf = Math.min(100, Math.round((avgNodeConf * 0.5) + (avgEdgeConf * 0.4) + (materialConf * 0.1)));
      const falsePositiveRisk = Math.max(5, 100 - verificationConf);
      const falseNegativeRisk = Math.max(5, 80 - Math.round(avgNodeConf * 0.8));
      const contaminationRisk = Math.max(10, Math.round((100 - avgEdgeConf) * 0.4));

      const legalConf = Math.min(100, Math.round(verificationConf * 0.95));
      const actionabilityConf = Math.min(100, Math.round(verificationConf * 1.05));

      net.confidence = {
        nodeConfidence: avgNodeConf,
        edgeConfidence: avgEdgeConf,
        materialConfidence: materialConf,
        attributionConfidence: attributionConf,
        verificationConfidence: verificationConf,
        legalConfidence: legalConf,
        actionabilityConfidence: actionabilityConf,
        falsePositiveRisk,
        falseNegativeRisk,
        contaminationRisk
      };

      // Set verification tier
      if (verificationConf < 35) {
        net.verificationTier = 'UNVERIFIED';
      } else if (verificationConf < 55) {
        net.verificationTier = 'WEAK';
      } else if (verificationConf < 70) {
        net.verificationTier = 'CORROBORATED';
      } else if (verificationConf < 85) {
        net.verificationTier = 'STRONG';
      } else if (verificationConf < 93) {
        net.verificationTier = 'LEGAL_THRESHOLD_MET';
      } else {
        net.verificationTier = 'OPERATIONALLY_ACTIONABLE';
      }

      // Operational Readiness
      net.operationalReadiness = Math.round(net.confidence.actionabilityConfidence * 0.9);
      net.lastUpdatedTick = useWorldStore.getState().currentTick || 0;
    }));
  },

  recalculateNetworkThreat: (networkId) => {
    set(produce((draft) => {
      const net = draft.networks[networkId];
      if (!net) return;

      const nodesArray = Object.values(net.nodes) as any[];
      if (nodesArray.length === 0) return;

      const maxNodeThreat = nodesArray.reduce((acc, n) => {
        const val = n.threatLevel === 'CRITICAL' ? 5 : n.threatLevel === 'VERIFIED' ? 4 : n.threatLevel === 'PROBABLE' ? 3 : n.threatLevel === 'SUSPECTED' ? 2 : n.threatLevel === 'LOW' ? 1 : 0;
        return Math.max(acc, val);
      }, 0);

      const computedThreat: ProliferationThreatLevel = 
        maxNodeThreat === 5 ? 'CRITICAL' :
        maxNodeThreat === 4 ? 'VERIFIED' :
        maxNodeThreat === 3 ? 'PROBABLE' :
        maxNodeThreat === 2 ? 'SUSPECTED' :
        maxNodeThreat === 1 ? 'LOW' : 'NONE';

      net.threatLevel = computedThreat;
    }));
  },

  flagNetworkAlert: (networkId, alert) => {
    set(produce((draft) => {
      if (draft.networks[networkId]) {
        draft.networks[networkId].activeAlerts.unshift(alert);
        if (draft.networks[networkId].activeAlerts.length > 5) draft.networks[networkId].activeAlerts.pop();
      }
    }));
    get().addLog(`Alert triggered on network [${networkId}]: ${alert}`);
  },

  tickProliferation: (currentTick) => {
    set(produce((draft) => {
      // Degrade confidence of networks not observed recently
      Object.keys(draft.networks).forEach((netId) => {
        const net = draft.networks[netId];
        const age = currentTick - net.lastUpdatedTick;
        if (age > 10) {
          // Degrade edges & nodes
          Object.keys(net.nodes).forEach((nId) => {
            const node = net.nodes[nId];
            node.confidence = Math.max(15, node.confidence - 1);
          });
          Object.keys(net.edges).forEach((eId) => {
            const edge = net.edges[eId];
            edge.confidence = Math.max(10, edge.confidence - 1);
          });
        }
      });
    }));

    // Recalculate everything after degradation
    set(produce((draft) => {
      Object.keys(draft.networks).forEach((netId) => {
        // We'll update stats
        setTimeout(() => get().updateNetworkVerification(netId), 0);
        setTimeout(() => get().recalculateNetworkThreat(netId), 0);
      });
    }));
  },

  evaluateVerificationThreshold: (networkId) => {
    const net = get().networks[networkId];
    if (!net) return 'UNVERIFIED';
    return net.verificationTier;
  },

  requireLegalThreshold: (networkId) => {
    const net = get().networks[networkId];
    if (!net) return false;
    // Strong tier is enough for soft monitoring/sanctions, but Legal threshold must be met (or higher) to avoid blowback on heavy intervention
    const tier = net.verificationTier;
    return tier === 'LEGAL_THRESHOLD_MET' || tier === 'OPERATIONALLY_ACTIONABLE';
  },

  calculateActionReadiness: (networkId, action) => {
    const net = get().networks[networkId];
    if (!net) return 0;
    
    const baseActionability = net.confidence.actionabilityConfidence;
    switch (action) {
      case 'MONITOR': return 100;
      case 'SANCTION': return Math.min(100, Math.round(baseActionability * 1.1));
      case 'EXPOSE': return Math.min(100, Math.round(baseActionability * 1.0));
      case 'DENY_ACCESS': return Math.min(100, Math.round(baseActionability * 0.9));
      case 'DISRUPT': return Math.min(100, Math.round(baseActionability * 0.85));
      case 'FRAGMENT_NETWORK': return Math.min(100, Math.round(baseActionability * 0.8));
      case 'DETAIN': return Math.min(100, Math.round(baseActionability * 0.75));
      case 'SEIZE': return Math.min(100, Math.round(baseActionability * 0.75));
      case 'INTERDICT': return Math.min(100, Math.round(baseActionability * 0.7));
      case 'SABOTAGE': return Math.min(100, Math.round(baseActionability * 0.65));
      default: return 50;
    }
  },

  compareActionRisk: (networkId, action) => {
    const net = get().networks[networkId];
    if (!net) return { collateral: 10, diplomatic: 10, operational: 10 };

    // Standard baseline calculation
    const isWeak = net.verificationTier === 'UNVERIFIED' || net.verificationTier === 'WEAK' || net.verificationTier === 'CORROBORATED';
    const weakMultiplier = isWeak ? 2.0 : 1.0;

    switch (action) {
      case 'MONITOR':
        return { collateral: 0, diplomatic: 5, operational: 15 };
      case 'SANCTION':
        return { collateral: 15, diplomatic: 35, operational: 10 };
      case 'EXPOSE':
        return { collateral: 5, diplomatic: 45, operational: 30 };
      case 'DENY_ACCESS':
        return { collateral: 15, diplomatic: 25 * weakMultiplier, operational: 20 };
      case 'DISRUPT':
        return { collateral: 25, diplomatic: 35 * weakMultiplier, operational: 45 };
      case 'FRAGMENT_NETWORK':
        return { collateral: 30, diplomatic: 40 * weakMultiplier, operational: 50 };
      case 'DETAIN':
        return { collateral: 10, diplomatic: 60 * weakMultiplier, operational: 40 };
      case 'SEIZE':
        return { collateral: 20, diplomatic: 55 * weakMultiplier, operational: 45 };
      case 'INTERDICT':
        return { collateral: 40, diplomatic: 70 * weakMultiplier, operational: 65 };
      case 'SABOTAGE':
        return { collateral: 65, diplomatic: 85 * weakMultiplier, operational: 80 };
      default:
        return { collateral: 20, diplomatic: 30, operational: 30 };
    }
  },

  recommendAction: (networkId) => {
    const net = get().networks[networkId];
    if (!net) return 'MONITOR';

    const conf = net.confidence.verificationConfidence;
    if (conf > 85) return 'SABOTAGE';
    if (conf > 70) return 'INTERDICT';
    if (conf > 55) return 'FRAGMENT_NETWORK';
    if (conf > 40) return 'SANCTION';
    return 'MONITOR';
  },

  blockPrematureAction: (networkId, action) => {
    const net = get().networks[networkId];
    if (!net) return true;

    // Check if player has unlocked authorization. Hard interventions require a minimum corroboration.
    if (action === 'SABOTAGE' || action === 'INTERDICT' || action === 'SEIZE') {
      const isTooWeak = net.verificationTier === 'UNVERIFIED' || net.verificationTier === 'WEAK';
      return isTooWeak;
    }
    return false;
  },

  releaseActionAuthorization: (networkId, action) => {
    // If not severely pre-mature, they can execute
    return !get().blockPrematureAction(networkId, action);
  },

  planInterdiction: (networkId, action) => {
    const caseId = `case_${Date.now()}`;
    const net = get().networks[networkId];
    if (!net) return '';

    const verificationMet = get().evaluateVerificationThreshold(networkId) !== 'UNVERIFIED' && get().evaluateVerificationThreshold(networkId) !== 'WEAK';
    const legalMet = get().requireLegalThreshold(networkId);
    
    const risk = get().compareActionRisk(networkId, action);
    const blowback = get().calculateLegalBlowback(networkId, action);

    const newCase: InterdictionCase = {
      caseId,
      networkId,
      selectedAction: action,
      verificationThresholdMet: verificationMet,
      legalThresholdMet: legalMet,
      confidenceRequired: action === 'SABOTAGE' || action === 'INTERDICT' ? 80 : 50,
      confidenceCurrent: net.confidence.verificationConfidence,
      legalBlowbackLevel: blowback,
      projectedEffectiveness: get().calculateActionReadiness(networkId, action),
      collateralRisk: risk.collateral,
      diplomaticRisk: risk.diplomatic,
      operationalRisk: risk.operational,
      evidenceRefs: Object.values(net.nodes).filter(n => n.confidence > 60).map(n => n.nodeId),
      lastEvaluatedTick: useWorldStore.getState().currentTick || 0,
      active: true
    };

    set(produce((draft) => {
      draft.cases[caseId] = newCase;
      draft.selectedCaseId = caseId;
    }));

    get().addLog(`Formulated operational interdiction charter case [${caseId}] for network ${net.label}. Proposed action: ${action}`);
    return caseId;
  },

  executeInterdiction: (caseId) => {
    const kase = get().cases[caseId];
    if (!kase) return;

    const netId = kase.networkId;
    const net = get().networks[netId];
    if (!net) return;

    // Trigger Cinematics pipeline
    useCinematicsStore.getState().queueScene({
      type: 'INTERDICTION_EXECUTED',
      totalPhases: 3,
      phaseDurationMs: 4000,
      blocksInput: true,
      isSkippable: false,
      autoAdvance: true,
      payload: {
        networkLabel: net.label,
        action: kase.selectedAction,
        outcome: kase.confidenceCurrent >= kase.confidenceRequired ? 'SUCCESS' : 'COMPROMISED',
        legalBlowback: kase.legalBlowbackLevel,
        collateral: kase.collateralRisk
      }
    });

    set(produce((draft) => {
      draft.cases[caseId].active = false;
    }));

    // Consequence and mapping degradation/fragmentation based on legal criteria
    if (!kase.legalThresholdMet && (kase.selectedAction === 'SABOTAGE' || kase.selectedAction === 'INTERDICT' || kase.selectedAction === 'SEIZE')) {
      // Critical Legal Blowback!
      get().triggerLegalReview(netId);
      get().assignPolicyConsequences(netId, kase.legalBlowbackLevel);
      useWorldStore.getState().addGlobalEvent(`CRITICAL: Unauthorized sovereign interdiction violates maritime borders. International inquiry opened!`, 'CRITICAL');
    } else {
      useWorldStore.getState().addGlobalEvent(`SUCCESS: Classified counter-proliferation interdiction completed targeting ${net.label}. Flow disrupted.`, 'SYSTEM');
    }

    // Adapt / fragment the network
    if (kase.selectedAction === 'SABOTAGE') {
      get().applySabotageEffect(netId);
    } else if (kase.selectedAction === 'FRAGMENT_NETWORK') {
      get().fragmentNetwork(netId);
    } else {
      get().generatePostActionNetworkState(netId);
    }

    get().assessInterdictionOutcome(caseId);
  },

  applySabotageEffect: (networkId) => {
    set(produce((draft) => {
      const net = draft.networks[networkId];
      if (!net) return;

      // Sabotage destroys critical structures (Facilities, Materials)
      Object.keys(net.nodes).forEach((nId) => {
        const node = net.nodes[nId];
        if (node.nodeType === 'FACILITY' || node.nodeType === 'LAB' || node.nodeType === 'MATERIAL') {
          node.notes.unshift('[SABOTAGED] Facility/materials compromised by covert task force action.');
          node.confidence = Math.max(5, node.confidence - 60);
          node.threatLevel = 'NONE';
        }
      });
    }));
    get().updateNetworkVerification(networkId);
    get().recalculateNetworkThreat(networkId);
    get().addLog(`Convert non-kinetic kinetics (SABOTAGE) applied to facility nodes in ${networkId}. Real-time flow disabled.`);
  },

  fragmentNetwork: (networkId) => {
    set(produce((draft) => {
      const net = draft.networks[networkId];
      if (!net) return;

      // Fragmentation deletes primary brokers/banks, and spawns newer unknown dark links
      const nodeIds = Object.keys(net.nodes);
      nodeIds.forEach((nId) => {
        const node = net.nodes[nId];
        if (node.nodeType === 'BROKER' || node.nodeType === 'FRONT_COMPANY') {
          node.notes.unshift('[EXPOSED/FRAGMENTED] Operational hub decommissioned. Logistics split.');
          node.confidence = Math.round(node.confidence * 0.3);
        }
      });

      // Add a darker adaptive front company
      const darkId = `node_dark_procure_${Date.now()}`;
      net.nodes[darkId] = {
        nodeId: darkId,
        label: 'Black Sea Transshipment Group',
        nodeType: 'FRONT_COMPANY',
        threatLevel: 'SUSPECTED',
        verificationTier: 'UNVERIFIED',
        confidence: 25,
        materialRelevance: 80,
        legalSensitivity: 15,
        operationalSensitivity: 80,
        exposureRisk: 90,
        lastObservedTick: useWorldStore.getState().currentTick || 1,
        associatedCountries: ['Turkey', 'Georgia'],
        linkedNodes: ['node_natanz_complex'],
        notes: ['Spawned decentralized cell of dismantled Astarte procurement web. Going deeper dark.']
      };

      // Add new dark edge
      const darkEdgeId = `edge_dark_${Date.now()}`;
      net.edges[darkEdgeId] = {
        edgeId: darkEdgeId,
        fromNodeId: darkId,
        toNodeId: 'node_natanz_complex',
        relationshipType: 'TRANSHIPMENT',
        confidence: 15,
        traceability: 10,
        concealmentResistance: 85,
        legalSensitivity: 35,
        lastObservedTick: useWorldStore.getState().currentTick || 1
      };
    }));

    get().addLog(`Adversary network ${networkId} suffered fragmentation. Cellular adaptation observed!`);
    get().updateNetworkVerification(networkId);
    get().recalculateNetworkThreat(networkId);
  },

  updateMaterialFlow: (networkId) => {
    const net = get().networks[networkId];
    if (!net) return 0;
    // Calculate flow based on remaining active links and facility health
    const nodes = Object.values(net.nodes);
    const flow = nodes.reduce((acc, n) => {
      if (n.threatLevel === 'CRITICAL') return acc + 50;
      if (n.threatLevel === 'PROBABLE') return acc + 25;
      return acc;
    }, 10);
    return Math.max(0, flow - Math.max(0, 100 - net.operationalReadiness));
  },

  reduceNetworkMobility: (networkId) => {
    set(produce((draft) => {
      const net = draft.networks[networkId];
      if (net) {
        net.operationalReadiness = Math.max(5, net.operationalReadiness - 35);
      }
    }));
    get().addLog(`Network mobility degraded for ${networkId}. Logistics speed cut.`);
  },

  assessInterdictionOutcome: (caseId) => {
    const kase = get().cases[caseId];
    if (!kase) return;
    const netLabel = get().networks[kase.networkId]?.label || 'WMD Cell';
    get().addLog(`Interdiction case resolution finalized. Action: ${kase.selectedAction} on ${netLabel}. Effectiveness: ${kase.projectedEffectiveness}%.`);
  },

  generatePostActionNetworkState: (networkId) => {
    set(produce((draft) => {
      const net = draft.networks[networkId];
      if (!net) return;
      // Normal action leaves nodes in lower confidence as they scatter
      Object.keys(net.nodes).forEach((nId) => {
        const node = net.nodes[nId];
        if (node.nodeType === 'VESSEL' || node.nodeType === 'FRONT_COMPANY') {
          node.notes.unshift('[ALERTED] Node is modifying trade paths and routing structures.');
          node.confidence = Math.max(10, Math.round(node.confidence * 0.45));
        }
      });
    }));
    get().updateNetworkVerification(networkId);
    get().recalculateNetworkThreat(networkId);
  },

  calculateLegalBlowback: (networkId, action) => {
    const net = get().networks[networkId];
    if (!net) return 'NONE';

    const vt = net.verificationTier;
    const isWeakProof = vt === 'UNVERIFIED' || vt === 'WEAK' || vt === 'CORROBORATED';

    if (action === 'SABOTAGE') {
      return isWeakProof ? 'INTERNATIONAL_CRISIS' : 'SEVERE';
    }
    if (action === 'INTERDICT' || action === 'SEIZE') {
      return isWeakProof ? 'SEVERE' : 'HIGH';
    }
    if (action === 'DISRUPT' || action === 'DETAIN') {
      return isWeakProof ? 'HIGH' : 'MODERATE';
    }
    if (action === 'SANCTION' || action === 'EXPOSE') {
      return isWeakProof ? 'MODERATE' : 'LOW';
    }
    return 'NONE';
  },

  updateLegalBlowbackLevel: (networkId) => {
    // Already simulated within cases, let's keep it updated on network state
  },

  triggerLegalReview: (networkId) => {
    get().addLog(`CRITICAL: Domestic intelligence oversight and Senate legal committees have ordered a secure subpoena review on counter-proliferation actions in network ${networkId}!`);
  },

  assessInternationalResponse: (networkId) => {
    const net = get().networks[networkId];
    if (!net) return 'Stable';
    if (net.legalBlowbackLevel === 'INTERNATIONAL_CRISIS') {
      return 'ALLIED_PULLBACK: Several strategic alliance agreements are suspended pending full tribunal inquiry.';
    }
    if (net.legalBlowbackLevel === 'SEVERE') {
      return 'DIPLOMATIC_PROTEST: Demarches received from 4 neutral sovereign logistics hubs.';
    }
    return 'Nominal containment maintained.';
  },

  assessDomesticOversight: (networkId) => {
    const net = get().networks[networkId];
    if (!net) return 'Cooperative';
    const numCases = Object.values(get().cases).length;
    if (numCases > 3) return 'SUSPICIOUS: Intelligence committees tracking repeated unauthorized non-kinetic interventions.';
    return 'Classified operational freedom verified.';
  },

  assignPolicyConsequences: (networkId, blowback) => {
    // Create actual scars in world / consequences
    const worldStore = useWorldStore.getState();
    const currentTick = worldStore.currentTick || 1;

    let severity: 1 | 2 | 3 = 1;
    let description = 'Covert interdiction fallout';
    
    if (blowback === 'INTERNATIONAL_CRISIS' || blowback === 'SEVERE') {
      severity = 3;
      description = 'Severe sovereign border violation & legal blowback scandal.';
    } else if (blowback === 'HIGH' || blowback === 'MODERATE') {
      severity = 2;
      description = 'Moderately high diplomatic friction & oversight inquiries.';
    }

    useConsequenceStore.getState().addScar({
      id: `scar_blowback_${Date.now()}`,
      type: 'CYBER_BLACKOUT_ZONE', // we use a visual scar representative of sovereignty disputes
      countryId: 'IRN', // proxy area representing the region map
      lat: 32.4279,
      lon: 53.6880,
      radiusKm: 120 * severity,
      createdTick: currentTick,
      severity,
      healingRateTicksPerLevel: 30,
      currentSeverity: severity,
      activeEffects: {
        stabilityPenaltyPerTick: severity * 0.1,
        unrestBonusPerTick: severity * 0.05
      }
    });

    // Subsidize political capital in consequence/national metrics
    get().addLog(`Political Capital penalty active due to diplomatic fallout: -${severity * 10} PC.`);
  },

  expireLegalBlowback: (networkId) => {
    set(produce((draft) => {
      const net = draft.networks[networkId];
      if (net) {
        net.legalBlowbackLevel = 'NONE';
      }
    }));
  },
}));

export default useCounterProliferationStore;
