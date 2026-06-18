import { create } from 'zustand';
import { produce } from 'immer';
import {
  DeceptionCampaign,
  FalseIntelPacket,
  DeceptionSignature,
  DeceptionSignatureFamily,
  DeceptionBeliefState,
  DeceptionDomain,
  DeceptionObjective,
  CounterDeceptionFinding,
  AmbiguityControlMode,
  DeceptionConfidenceProfile,
  DeceptionObjectiveProfile
} from '../types';
import { useWorldStore } from './worldStore';
import { useCinematicsStore } from './cinematicsStore';

// Initial pre-loaded campaign definitions
const INITIAL_CAMPAIGNS: Record<string, DeceptionCampaign> = {
  'camp_cyber_mimic': {
    deceptionId: 'camp_cyber_mimic',
    label: 'Operation Velvet Hammer',
    domain: 'CYBER',
    active: true,
    createdTick: 0,
    lastUpdatedTick: 0,
    linkedOperations: ['OP_GHOST_SUB_4'],
    linkedTargets: ['RU', 'CN'],
    beliefState: 'SUSPECTED',
    objectiveProfile: {
      objective: 'REDIRECT',
      targetBeliefDesired: 'Regional cyber-ops originate from non-aligned criminal syndicate',
      targetBehaviorDesired: 'Direct security countermeasures toward proxy servers' ,
      intendedEffect: 'Shield sovereign network centers from retaliatory cyber action',
      successCriteria: ['Countermeasures deflected', 'Attribution remains ambiguous'],
      fallbackEffect: 'Attribution collapses into generic state-backed criminal style group'
    },
    signature: {
      signatureId: 'sig_velvet_1',
      family: 'APT_STYLE',
      label: 'Gorgon-37 Mimicry Layer',
      observedTraits: ['Double-encoded payloads', 'UTC-3 transit times', 'Zero-day metadata masks'],
      mimickedTTPs: ['T1190 - Exploit Public-Facing Application', 'T1071.001 - Web Protocols'],
      narrativeMarkers: ['Cyrillic dialect annotations in dead-code channels', 'Faked operator logs'],
      infrastructureMarkers: ['Eurasian VPS host ranges', 'Spoofed DNS records'],
      timingMarkers: ['2:00 AM UTC - 11:00 AM UTC burst timings'],
      confidenceWeight: 75,
      authenticityRisk: 15
    },
    confidence: {
      plantedConfidence: 80,
      adversaryConfidence: 45,
      contradictionConfidence: 20,
      analystConfidence: 65,
      ambiguityScore: 40,
      believabilityScore: 78,
      signatureCoherence: 85,
      exposureRisk: 12,
      contaminationRisk: 5,
      decayRate: 2
    },
    packets: [
      {
        packetId: 'pkt_velvet_01',
        deceptionId: 'camp_cyber_mimic',
        sourceDomain: 'CYBER',
        plantedTick: 0,
        expirationTick: 120,
        payloadSummary: 'Breached credentials linked to Siberian routing terminals found inside custom target memory dump.',
        payloadDetails: [
          'Dump file: debug_log_router_77.dmp',
          'IP ranges: 185.112.144.0/24',
          'Compiler headers: GCC 8.3 Russian Language Localization Pack'
        ],
        intendedRecipientProfile: 'Adversary central security agency network forensicians',
        intendedInterpretation: 'The intrusion originated within regional state networks of EURASIA',
        coverStory: 'Accidental leak of intelligence extraction framework by careless operative',
        visibleToPlayer: true,
        visibleToAdversary: true,
        contaminationRisk: 10,
        exposureRisk: 15
      }
    ],
    plantedEvidenceIds: ['ev_velvet_01']
  },
  'camp_humint_cutout': {
    deceptionId: 'camp_humint_cutout',
    label: 'Operation Phantom Sentry',
    domain: 'HUMINT',
    active: true,
    createdTick: 0,
    lastUpdatedTick: 0,
    linkedOperations: [],
    linkedTargets: ['SA'],
    beliefState: 'BELIEVED',
    objectiveProfile: {
      objective: 'FRAME',
      targetBeliefDesired: 'Intelligence is sourced from dissident Gulf oligarch proxy cells',
      targetBehaviorDesired: 'Conduct heavy domestic sweeps targeting wealthy merchants',
      intendedEffect: 'Create internal political gridlock within local state council',
      successCriteria: ['Oligarch assets frozen', 'Sovereign fingerprint invisible'],
      fallbackEffect: 'Local state intelligence marks reports as untrusted noise'
    },
    signature: {
      signatureId: 'sig_phantom_7',
      family: 'THIRD_PARTY_STYLE',
      label: 'Merchant Guild Courier Core',
      observedTraits: ['Encrypted paper drops', 'Cash payouts via sovereign bank drafts'],
      mimickedTTPs: ['T1566.002 - Spearphishing Attachment', 'T1001.002 - Steganography'],
      narrativeMarkers: ['Financial grievance theme', 'Anti-monarchical rhetoric'],
      infrastructureMarkers: ['Geneva offshore clearing accounts', 'Offshore mail nodes'],
      timingMarkers: ['Staggered bi-monthly report intervals'],
      confidenceWeight: 82,
      authenticityRisk: 25
    },
    confidence: {
      plantedConfidence: 75,
      adversaryConfidence: 72,
      contradictionConfidence: 8,
      analystConfidence: 80,
      ambiguityScore: 25,
      believabilityScore: 88,
      signatureCoherence: 90,
      exposureRisk: 18,
      contaminationRisk: 30,
      decayRate: 4
    },
    packets: [
      {
        packetId: 'pkt_phantom_05',
        deceptionId: 'camp_humint_cutout',
        sourceDomain: 'HUMINT',
        plantedTick: 0,
        expirationTick: 200,
        payloadSummary: 'Courier briefcase containing bank drafts and custom transit routes seized at regional border checks.',
        payloadDetails: [
          'Courier nationality: French-Swiss security contractor',
          'Fund origin: Gulf Investment Group (Geneva Branch)',
          'Communications equipment: Military-grade satellite phones with modified firmware'
        ],
        intendedRecipientProfile: 'Adversary counter-terrorism division directors',
        intendedInterpretation: 'State dissidents are funneling resources to fund regional intelligence subversion.',
        coverStory: 'Unfortunate courier breakdown at high-security immigration crossing.',
        visibleToPlayer: true,
        visibleToAdversary: true,
        contaminationRisk: 20,
        exposureRisk: 22
      }
    ],
    plantedEvidenceIds: ['ev_phantom_05']
  }
};

const INITIAL_FINDINGS: Record<string, CounterDeceptionFinding[]> = {
  'camp_cyber_mimic': [
    {
      findingId: 'find_velv_01',
      deceptionId: 'camp_cyber_mimic',
      severity: 20,
      contradictionType: 'BEHAVIORAL_OUTLIER',
      description: 'Payload transmission occurred during Siberian state holidays, which conflicts with expected official downtime trends.',
      evidenceRefs: ['pkt_velvet_01'],
      analystNote: 'Adversary analysts noted a minor timing drift, but marked it as low-significance operational drift for now.',
      createdTick: 0
    }
  ]
};

export interface DeceptionStore {
  campaigns: Record<string, DeceptionCampaign>;
  findings: Record<string, CounterDeceptionFinding[]>;
  selectedCampaignId: string | null;
  signaturePenalties: Record<DeceptionSignatureFamily, number>;
  ambiguityModes: Record<string, { mode: AmbiguityControlMode; value: number }>;

  // CORE ACTIONS
  addDeceptionCampaign: (campaign: DeceptionCampaign) => void;
  updateDeceptionCampaign: (campaignId: string, updater: (campaign: DeceptionCampaign) => void) => void;
  plantFalseIntel: (campaignId: string, packet: FalseIntelPacket) => void;
  addFalseFlagSignature: (campaignId: string, signature: DeceptionSignature) => void;
  setAmbiguityMode: (campaignId: string, mode: AmbiguityControlMode) => void;
  updateBeliefState: (campaignId: string) => void;
  addCounterDeceptionFinding: (campaignId: string, finding: CounterDeceptionFinding) => void;
  markCampaignCompromised: (campaignId: string) => void;
  disableCampaign: (campaignId: string) => void;
  tickDeception: (currentTick: number) => void;

  // ADDITIONAL REQUIRED FUNCTIONS
  createDeceptionCampaign: (params: {
    label: string,
    domain: DeceptionDomain,
    objective: DeceptionObjective,
    targetBeliefDesired: string,
    targetBehaviorDesired: string,
    intendedEffect: string,
    fallbackEffect: string,
    linkedTargets: string[]
  }) => string;
  addDeceptionSignature: (campaignId: string, signature: DeceptionSignature) => void;
  recalculateBelievability: (campaignId: string) => void;
  evaluateContaminationRisk: (campaignId: string) => void;
  expireFalseIntel: (packetId: string) => void;
  reinforceDeceptionCampaign: (campaignId: string) => void;
  disableDeceptionCampaign: (campaignId: string) => void;
  routeFalseSignal: (campaignId: string, channel: string) => void;

  // FALSE FLAG ARCHITECTURE FUNCTIONS
  buildFalseFlagArchitecture: (params: {
    campaignId: string;
    family: DeceptionSignatureFamily;
    ttpList: string[];
    languageMarkers: string[];
    infrastructureMarkers: string[];
    timingMarkers: string[];
  }) => void;
  selectMimicryFamily: (campaignId: string, family: DeceptionSignatureFamily) => void;
  attachTTPMimicry: (campaignId: string, ttpList: string[]) => void;
  attachLanguageMarkers: (campaignId: string, markers: string[]) => void;
  attachInfrastructureMarkers: (campaignId: string, markers: string[]) => void;
  attachTimingMarkers: (campaignId: string, markers: string[]) => void;
  scoreFalseFlagBelievability: (campaignId: string) => number;
  scoreFalseFlagExposure: (campaignId: string) => number;
  exportFalseFlagSummary: (campaignId: string) => string;

  // STRATEGIC AMBIGUITY FUNCTIONS
  setAmbiguityModeValue: (campaignId: string, mode: AmbiguityControlMode, sliderVal: number) => void;
  increaseAmbiguity: (campaignId: string) => void;
  decreaseAmbiguity: (campaignId: string) => void;
  calculateAmbiguityScore: (campaignId: string) => number;
  determineBeliefSpread: (campaignId: string) => string[];
  modelAdversaryInterpretation: (campaignId: string) => string;
  resolveAmbiguityTradeoff: (campaignId: string) => { utility: number; noisePenalty: number };

  // COUNTER-DECEPTION ANALYSIS
  detectContradictions: (campaignId: string) => CounterDeceptionFinding[];
  analyzeBelievability: (campaignId: string) => number;
  analyzeSignatureCoherence: (campaignId: string) => number;
  identifyOvertBreadcrumbs: (campaignId: string) => string[];
  computeAdversarySuspicion: (campaignId: string) => number;
  generateCounterDeceptionFindings: (campaignId: string) => void;
  recommendDeceptionAdjustment: (campaignId: string) => string;

  // UI State Helpers
  selectCampaign: (id: string | null) => void;
}

export const useDeceptionStore = create<DeceptionStore>((set, get) => ({
  campaigns: INITIAL_CAMPAIGNS,
  findings: INITIAL_FINDINGS,
  selectedCampaignId: 'camp_cyber_mimic',
  signaturePenalties: {
    'APT_STYLE': 0,
    'STATE_ACTOR_STYLE': 0,
    'CRIMINAL_STYLE': 0,
    'INSIDER_STYLE': 0,
    'THIRD_PARTY_STYLE': 0,
    'NATURAL_NOISE': 0,
    'PLATFORM_ARTIFACT': 0,
    'LANGUAGE_STYLE': 0,
    'TIMING_STYLE': 0,
    'INFRASTRUCTURE_STYLE': 0,
  },
  ambiguityModes: {
    'camp_cyber_mimic': { mode: 'SELECTIVE_CLARITY', value: 40 },
    'camp_humint_cutout': { mode: 'SINGLE_NARRATIVE', value: 25 }
  },

  selectCampaign: (id) => set({ selectedCampaignId: id }),

  addDeceptionCampaign: (campaign) => set(produce((draft) => {
    draft.campaigns[campaign.deceptionId] = campaign;
    if (!draft.selectedCampaignId) {
      draft.selectedCampaignId = campaign.deceptionId;
    }
  })),

  updateDeceptionCampaign: (campaignId, updater) => set(produce((draft) => {
    const campaign = draft.campaigns[campaignId];
    if (campaign) {
      updater(campaign);
    }
  })),

  plantFalseIntel: (campaignId, packet) => set(produce((draft) => {
    const campaign = draft.campaigns[campaignId];
    if (campaign) {
      campaign.packets.push(packet);
      campaign.lastUpdatedTick = useWorldStore.getState().currentTick;
    }
  })),

  addFalseFlagSignature: (campaignId, signature) => set(produce((draft) => {
    const campaign = draft.campaigns[campaignId];
    if (campaign) {
      campaign.signature = signature;
      campaign.lastUpdatedTick = useWorldStore.getState().currentTick;
    }
  })),

  setAmbiguityMode: (campaignId, mode) => set(produce((draft) => {
    if (!draft.ambiguityModes[campaignId]) {
      draft.ambiguityModes[campaignId] = { mode, value: 50 };
    } else {
      draft.ambiguityModes[campaignId].mode = mode;
    }
    const campaign = draft.campaigns[campaignId];
    if (campaign) {
      campaign.lastUpdatedTick = useWorldStore.getState().currentTick;
    }
  })),

  updateBeliefState: (campaignId) => set(produce((draft) => {
    const campaign = draft.campaigns[campaignId] as DeceptionCampaign;
    if (!campaign) return;

    const b = campaign.confidence.believabilityScore;
    const c = campaign.confidence.contradictionConfidence;
    const exposure = campaign.confidence.exposureRisk;

    let newState: DeceptionBeliefState = campaign.beliefState;
    if (exposure > 80 || c > 70) {
      newState = 'REJECTED';
    } else if (c > 35) {
      newState = 'CONTRADICTED';
    } else if (b > 85) {
      newState = 'OVERCONFIDENT';
    } else if (b > 60) {
      newState = 'BELIEVED';
    } else if (b > 30) {
      newState = 'SUSPECTED';
    } else if (b > 10) {
      newState = 'DISMISSED';
    } else {
      newState = 'UNSEEN';
    }

    campaign.beliefState = newState;
  })),

  addCounterDeceptionFinding: (campaignId, finding) => set(produce((draft) => {
    if (!draft.findings[campaignId]) {
      draft.findings[campaignId] = [];
    }
    draft.findings[campaignId].unshift(finding);
  })),

  markCampaignCompromised: (campaignId) => set(produce((draft) => {
    const campaign = draft.campaigns[campaignId];
    if (campaign) {
      campaign.beliefState = 'REJECTED';
      campaign.confidence.exposureRisk = 100;
      campaign.confidence.believabilityScore = 0;
      campaign.confidence.contradictionConfidence = 100;
    }
  })),

  disableCampaign: (campaignId) => set(produce((draft) => {
    const campaign = draft.campaigns[campaignId];
    if (campaign) {
      campaign.active = false;
      campaign.lastUpdatedTick = useWorldStore.getState().currentTick;
    }
  })),

  createDeceptionCampaign: (params) => {
    const id = `camp_${Date.now()}`;
    const newCampaign: DeceptionCampaign = {
      deceptionId: id,
      label: params.label,
      domain: params.domain,
      active: true,
      createdTick: useWorldStore.getState().currentTick,
      lastUpdatedTick: useWorldStore.getState().currentTick,
      linkedOperations: [],
      linkedTargets: params.linkedTargets,
      beliefState: 'UNSEEN',
      objectiveProfile: {
        objective: params.objective,
        targetBeliefDesired: params.targetBeliefDesired,
        targetBehaviorDesired: params.targetBehaviorDesired,
        intendedEffect: params.intendedEffect,
        successCriteria: ['Adversary actions diverted', 'Fingerprint hidden'],
        fallbackEffect: params.fallbackEffect
      },
      signature: {
        signatureId: `sig_${Date.now()}`,
        family: 'APT_STYLE',
        label: `${params.domain} Dummy Signature`,
        observedTraits: ['Incomplete routing indicators'],
        mimickedTTPs: [],
        narrativeMarkers: [],
        infrastructureMarkers: [],
        timingMarkers: [],
        confidenceWeight: 50,
        authenticityRisk: 10
      },
      confidence: {
        plantedConfidence: 50,
        adversaryConfidence: 0,
        contradictionConfidence: 0,
        analystConfidence: 50,
        ambiguityScore: 30,
        believabilityScore: 50,
        signatureCoherence: 50,
        exposureRisk: 5,
        contaminationRisk: 0,
        decayRate: 3
      },
      packets: [],
      plantedEvidenceIds: []
    };

    get().addDeceptionCampaign(newCampaign);

    // Call cinematics and logs
    useWorldStore.getState().addGlobalEvent(
      `DECEPTION CAMPAIGN INIT: ${params.label} initiated in the ${params.domain} domain targeting ${params.linkedTargets.join(', ')}.`,
      'INFO'
    );

    try {
      useCinematicsStore.getState().triggerCinematic('DEEP_DECEPTION_PLANTED', {
        campaignId: id,
        label: params.label,
        domain: params.domain,
      });
    } catch (e) {
      // safe fallback
    }

    return id;
  },

  addDeceptionSignature: (campaignId, signature) => {
    get().addFalseFlagSignature(campaignId, signature);
  },

  recalculateBelievability: (campaignId) => set(produce((draft) => {
    const campaign = draft.campaigns[campaignId] as DeceptionCampaign;
    if (!campaign) return;

    const signature = campaign.signature;
    const baseVal = signature.confidenceWeight;

    // Weight indicators: TTP mimicry, infrastructure, timing, language
    const ttpCount = signature.mimickedTTPs.length;
    const infraCount = signature.infrastructureMarkers.length;
    const langCount = signature.narrativeMarkers.length;
    const timingCount = signature.timingMarkers.length;

    const totalClues = ttpCount + infraCount + langCount + timingCount;
    let coherence = 30 + Math.min(60, totalClues * 12);

    // If mimicry is too perfect, say over-obvious clues backfire (Breadcrumb Risk)
    let breadcrumbPenalty = 0;
    if (totalClues > 6) {
      breadcrumbPenalty = (totalClues - 6) * 15; // penalty for over-explicit breadcrumbs
    }

    // Reuse penalty based on signature family
    const familyPenalties = draft.signaturePenalties[signature.family] || 0;
    const reusePenalty = familyPenalties * 15;

    // Ambiguity mitigation: higher ambiguity reduces direct believability of specific plant
    const ambState = draft.ambiguityModes[campaignId] || { mode: 'SINGLE_NARRATIVE', value: 20 };
    const ambPenalty = Math.max(0, (ambState.value - 30) * 0.4);

    let finalBelievability = baseVal + coherence - breadcrumbPenalty - reusePenalty - ambPenalty;
    finalBelievability = Math.max(5, Math.min(100, Math.round(finalBelievability)));

    campaign.confidence.signatureCoherence = Math.round(coherence);
    campaign.confidence.believabilityScore = finalBelievability;

    // Calculate contradiction chance if coherence is low but clues are numerous
    if (coherence < 50 && totalClues > 3) {
      campaign.confidence.contradictionConfidence = Math.min(100, (totalClues * 18));
    } else {
      campaign.confidence.contradictionConfidence = Math.max(0, Math.round(breadcrumbPenalty * 0.5));
    }
  })),

  evaluateContaminationRisk: (campaignId) => set(produce((draft) => {
    const campaign = draft.campaigns[campaignId];
    if (!campaign) return;

    const family = campaign.signature.family;
    const penalty = draft.signaturePenalties[family] || 0;

    // Contamination risks increase with the number of packets and signature reuse
    const packetCount = campaign.packets.length;
    let risk = (packetCount * 12) + (penalty * 20);
    risk = Math.max(0, Math.min(95, risk));

    campaign.confidence.contaminationRisk = risk;
    campaign.confidence.exposureRisk = Math.min(100, Math.max(campaign.confidence.exposureRisk, Math.round(risk * 0.8)));
  })),

  expireFalseIntel: (packetId) => set(produce((draft) => {
    Object.keys(draft.campaigns).forEach((campaignId) => {
      const c = draft.campaigns[campaignId];
      const packetIdx = c.packets.findIndex((p) => p.packetId === packetId);
      if (packetIdx > -1) {
        c.packets[packetIdx].visibleToPlayer = false; // expire visually or flag
        c.lastUpdatedTick = useWorldStore.getState().currentTick;
      }
    });
  })),

  reinforceDeceptionCampaign: (campaignId) => set(produce((draft) => {
    const campaign = draft.campaigns[campaignId];
    if (campaign) {
      campaign.confidence.plantedConfidence = Math.min(100, campaign.confidence.plantedConfidence + 15);
      campaign.confidence.believabilityScore = Math.min(100, campaign.confidence.believabilityScore + 10);
      campaign.confidence.exposureRisk = Math.max(0, campaign.confidence.exposureRisk - 5);
      campaign.lastUpdatedTick = useWorldStore.getState().currentTick;

      useWorldStore.getState().addGlobalEvent(
        `DECEPTION REINFORCEMENT: Transmitted secondary data logs supporting cover story of campaign ${campaign.label}.`,
        'INFO'
      );
    }
  })),

  disableDeceptionCampaign: (campaignId) => {
    get().disableCampaign(campaignId);
  },

  routeFalseSignal: (campaignId, channel) => {
    // Injects false signals into existing systems like SIGINT or HUMINT
    const campaign = get().campaigns[campaignId];
    if (!campaign) return;

    useWorldStore.getState().addGlobalEvent(
      `FALSE FLAG OVERRIDE: Injecting faked network headers mimicking ${campaign.signature.label} into ${channel} stream.`,
      'WARNING'
    );
  },

  // FALSE FLAG ARCHITECTURE IMPLEMENTATION
  buildFalseFlagArchitecture: (params) => {
    const { campaignId, family, ttpList, languageMarkers, infrastructureMarkers, timingMarkers } = params;

    set(produce((draft) => {
      const campaign = draft.campaigns[campaignId];
      if (campaign) {
        // Increment usage count of signature family
        draft.signaturePenalties[family] = (draft.signaturePenalties[family] || 0) + 1;

        campaign.signature.family = family;
        campaign.signature.mimickedTTPs = ttpList;
        campaign.signature.narrativeMarkers = languageMarkers;
        campaign.signature.infrastructureMarkers = infrastructureMarkers;
        campaign.signature.timingMarkers = timingMarkers;
        campaign.signature.label = `${family.replace('_STYLE', '')} Architectural Model - Level ${draft.signaturePenalties[family]}`;
        campaign.lastUpdatedTick = useWorldStore.getState().currentTick;
      }
    }));

    get().recalculateBelievability(campaignId);
    get().evaluateContaminationRisk(campaignId);
    get().updateBeliefState(campaignId);

    // Cinematic trigger
    try {
      useCinematicsStore.getState().triggerCinematic('DEEP_FALSE_FLAG_ACTIVATED', {
        campaignId,
        family
      });
    } catch (e) {
      // safe fallback
    }
  },

  selectMimicryFamily: (campaignId, family) => {
    get().updateDeceptionCampaign(campaignId, (c) => {
      c.signature.family = family;
    });
    get().recalculateBelievability(campaignId);
  },

  attachTTPMimicry: (campaignId, ttpList) => {
    get().updateDeceptionCampaign(campaignId, (c) => {
      c.signature.mimickedTTPs = ttpList;
    });
    get().recalculateBelievability(campaignId);
  },

  attachLanguageMarkers: (campaignId, markers) => {
    get().updateDeceptionCampaign(campaignId, (c) => {
      c.signature.narrativeMarkers = markers;
    });
    get().recalculateBelievability(campaignId);
  },

  attachInfrastructureMarkers: (campaignId, markers) => {
    get().updateDeceptionCampaign(campaignId, (c) => {
      c.signature.infrastructureMarkers = markers;
    });
    get().recalculateBelievability(campaignId);
  },

  attachTimingMarkers: (campaignId, markers) => {
    get().updateDeceptionCampaign(campaignId, (c) => {
      c.signature.timingMarkers = markers;
    });
    get().recalculateBelievability(campaignId);
  },

  scoreFalseFlagBelievability: (campaignId) => {
    const campaign = get().campaigns[campaignId];
    return campaign ? campaign.confidence.believabilityScore : 50;
  },

  scoreFalseFlagExposure: (campaignId) => {
    const campaign = get().campaigns[campaignId];
    return campaign ? campaign.confidence.exposureRisk : 10;
  },

  exportFalseFlagSummary: (campaignId) => {
    const campaign = get().campaigns[campaignId];
    if (!campaign) return 'Campaign not found';
    return JSON.stringify({
      campaignId,
      signatureFamily: campaign.signature.family,
      label: campaign.signature.label,
      coherence: campaign.confidence.signatureCoherence,
      believability: campaign.confidence.believabilityScore,
      exposureRisk: campaign.confidence.exposureRisk
    }, null, 2);
  },

  // STRATEGIC AMBIGUITY IMPLEMENTATION
  setAmbiguityModeValue: (campaignId, mode, sliderVal) => set(produce((draft) => {
    draft.ambiguityModes[campaignId] = { mode, value: sliderVal };
    const campaign = draft.campaigns[campaignId];
    if (campaign) {
      campaign.confidence.ambiguityScore = sliderVal;
      campaign.lastUpdatedTick = useWorldStore.getState().currentTick;
    }
  })),

  increaseAmbiguity: (campaignId) => set(produce((draft) => {
    const current = draft.ambiguityModes[campaignId] || { mode: 'CONTROLLED_NOISE', value: 50 };
    const newVal = Math.min(100, current.value + 10);
    draft.ambiguityModes[campaignId] = { mode: current.mode, value: newVal };
    if (draft.campaigns[campaignId]) {
      draft.campaigns[campaignId].confidence.ambiguityScore = newVal;
    }
  })),

  decreaseAmbiguity: (campaignId) => set(produce((draft) => {
    const current = draft.ambiguityModes[campaignId] || { mode: 'CONTROLLED_NOISE', value: 50 };
    const newVal = Math.max(0, current.value - 10);
    draft.ambiguityModes[campaignId] = { mode: current.mode, value: newVal };
    if (draft.campaigns[campaignId]) {
      draft.campaigns[campaignId].confidence.ambiguityScore = newVal;
    }
  })),

  calculateAmbiguityScore: (campaignId) => {
    const val = get().ambiguityModes[campaignId];
    return val ? val.value : 30;
  },

  determineBeliefSpread: (campaignId) => {
    const mode = get().ambiguityModes[campaignId]?.mode || 'SINGLE_NARRATIVE';
    switch (mode) {
      case 'SINGLE_NARRATIVE': return ['Planted Attribution (High)'];
      case 'MULTIPLE_NARRATIVES': return ['Planted Attribution (Medium)', 'Dissident Elements (Low)', 'Unclassified Criminal (Low)'];
      case 'CONTROLLED_NOISE': return ['Static Interference (High)', 'Undetermined Origins (Medium)'];
      case 'SIGNATURE_BLENDING': return ['State-backed Mimic (Medium)', 'Joint Defense Proxy Team (Medium)'];
      case 'BELIEF_SATURATION': return ['Eurasia Rogue (Low)', 'Syndicate Hackers (Low)', 'Internal Rogue IT Elite (Low)'];
      case 'SELECTIVE_CLARITY': return ['Target State (Extremely High)', 'Sovereign fingerprint (Minimal Risk)'];
      default: return ['Undetermined'];
    }
  },

  modelAdversaryInterpretation: (campaignId) => {
    const mode = get().ambiguityModes[campaignId]?.mode || 'SINGLE_NARRATIVE';
    const val = get().ambiguityModes[campaignId]?.value || 50;

    if (val > 80) {
      return "Adversary command is paralyzed by contradictory data points, halting offensive escalation.";
    } else if (val < 25) {
      return "Adversary is highly focused on a single culprit trace, increasing direct countermeasures precision.";
    }

    switch (mode) {
      case 'SINGLE_NARRATIVE': return 'Target standard analysts are converging on our planted rogue trace.';
      case 'MULTIPLE_NARRATIVES': return 'Defense ministries are split between dissident subversion or foreign intelligence vectors.';
      case 'CONTROLLED_NOISE': return 'System logs are flooded with redundant, corrupted telemetry signals.';
      case 'SIGNATURE_BLENDING': return 'Commanders trace signatures to a shared dark forum toolset, blurring responsibility.';
      case 'BELIEF_SATURATION': return 'Adversary has over 15 active threat theories, completely clouding clear attribution.';
      case 'SELECTIVE_CLARITY': return 'Target confidently believes our false flag while ignoring anomalous signals.';
      default: return 'Evaluating historical patterns.';
    }
  },

  resolveAmbiguityTradeoff: (campaignId) => {
    const score = get().calculateAmbiguityScore(campaignId);
    // Utility increases with ambiguity by blocking direct retaliation (hiding truth),
    // but reduces believability score.
    const utility = score * 0.85;
    const noisePenalty = score * 0.6;
    return { utility, noisePenalty };
  },

  // COUNTER-DECEPTION ANALYSIS METHODS
  detectContradictions: (campaignId) => {
    const campaign = get().campaigns[campaignId];
    if (!campaign) return [];

    const signature = campaign.signature;
    const items: CounterDeceptionFinding[] = [];
    const tick = useWorldStore.getState().currentTick;

    // 1. TTP vs Signature Family mismatch
    if (signature.family === 'APT_STYLE' && signature.mimickedTTPs.includes('T1001.002 - Steganography')) {
      items.push({
        findingId: `find_contra_${Date.now()}_1`,
        deceptionId: campaignId,
        severity: 35,
        contradictionType: 'TTP_MISMATCH',
        description: 'Steganography indicators are typically avoided by advanced threat groups, creating a tradecraft anomaly.',
        evidenceRefs: ['T1001.002'],
        analystNote: 'Adversary signals security flag: High sophistication payload matched to amateurish cover craft.',
        createdTick: tick
      });
    }

    // 2. Timing marker checks
    if (signature.timingMarkers.some(m => m.includes('2:00 AM')) && signature.family === 'INSIDER_STYLE') {
      items.push({
        findingId: `find_contra_${Date.now()}_2`,
        deceptionId: campaignId,
        severity: 45,
        contradictionType: 'TIMING_MISMATCH',
        description: 'Insider style files were updated at 2:00 AM local time, inconsistent with expected working logs of target office staff.',
        evidenceRefs: ['timingMarkers'],
        analystNote: 'Command forensicians noticed access times outside staff login windows.',
        createdTick: tick
      });
    }

    // 3. Overexplicit breadcrumbs
    const totalClues = signature.mimickedTTPs.length + signature.infrastructureMarkers.length + signature.narrativeMarkers.length + signature.timingMarkers.length;
    if (totalClues > 6) {
      items.push({
        findingId: `find_contra_${Date.now()}_3`,
        deceptionId: campaignId,
        severity: 60,
        contradictionType: 'OVEREXPLICIT_BREADCRUMB',
        description: 'The forensic trace leaves too many recognizable indicators, looking suspiciously like a staged false flag layout.',
        evidenceRefs: ['signatureIndicators'],
        analystNote: 'Forensic team reports anomalous density of incriminating evidence files inside system crash dumps.',
        createdTick: tick
      });
    }

    // 4. Source contamination
    if (campaign.confidence.contaminationRisk > 50) {
      items.push({
        findingId: `find_contra_${Date.now()}_4`,
        deceptionId: campaignId,
        severity: 55,
        contradictionType: 'SOURCE_CONTAMINATION',
        description: 'Intelligence routing channels show traces of cross-contamination with known player operations.',
        evidenceRefs: ['packets'],
        analystNote: 'Alert: Trace routing links metadata segments to a prior regional cover campaign.',
        createdTick: tick
      });
    }

    return items;
  },

  analyzeBelievability: (campaignId) => {
    return get().scoreFalseFlagBelievability(campaignId);
  },

  analyzeSignatureCoherence: (campaignId) => {
    const campaign = get().campaigns[campaignId];
    return campaign ? campaign.confidence.signatureCoherence : 50;
  },

  identifyOvertBreadcrumbs: (campaignId) => {
    const campaign = get().campaigns[campaignId];
    if (!campaign) return [];
    const list: string[] = [];
    const signature = campaign.signature;
    if (signature.mimickedTTPs.length > 3) list.push('Excessive TTP mimicry records');
    if (signature.infrastructureMarkers.length > 2) list.push('High-density VPS spoofs');
    if (signature.narrativeMarkers.length > 2) list.push('Cluttered dialect annotations');
    return list;
  },

  computeAdversarySuspicion: (campaignId) => {
    const campaign = get().campaigns[campaignId];
    if (!campaign) return 0;
    const contrads = get().findings[campaignId] || [];
    const totalContraSeverity = contrads.reduce((acc, curr) => acc + curr.severity, 0);
    return Math.min(100, Math.round(campaign.confidence.exposureRisk + totalContraSeverity * 0.4));
  },

  generateCounterDeceptionFindings: (campaignId) => {
    const contrads = get().detectContradictions(campaignId);
    if (contrads.length > 0) {
      const existing = get().findings[campaignId] || [];
      // Only add those that don't match existing descriptions
      contrads.forEach((c) => {
        const alreadyExists = existing.some(e => e.description === c.description);
        if (!alreadyExists) {
          get().addCounterDeceptionFinding(campaignId, c);
        }
      });

      // Show console alarm
      useWorldStore.getState().addGlobalEvent(
        `COUNTER-DECEPTION DETECTED: Counter-intelligence analysis identified ${contrads.length} tradecraft contradictions in Operation ${get().campaigns[campaignId]?.label || ''}!`,
        'WARNING'
      );

      try {
        useCinematicsStore.getState().triggerCinematic('DEEP_COUNTER_DECEPTION_BREAKTHROUGH', {
          campaignId,
          findingCount: contrads.length
        });
      } catch (e) {
        // safe wrap
      }
    }
  },

  recommendDeceptionAdjustment: (campaignId) => {
    const contrads = get().findings[campaignId] || [];
    if (contrads.length === 0) {
      return "Current operational posture looks nominal. Maintain single narrative focus to secure attribution targets.";
    }

    const types = contrads.map(c => c.contradictionType);
    if (types.includes('OVEREXPLICIT_BREADCRUMB')) {
      return "Recommendation: Purge excessive TTP mimicry files immediately. The decoy trail is overly clear.";
    }
    if (types.includes('TIMING_MISMATCH')) {
      return "Recommendation: Modify log update scheduler to fit local standard work-hours of target state offices.";
    }
    if (types.includes('SOURCE_CONTAMINATION')) {
      return "Recommendation: Rotate communication cutouts. Stop routing transport data via Swiss servers.";
    }
    return "Recommendation: Increase Controlled Noise levels via strategic ambiguity controls to scramble analysis teams.";
  },

  tickDeception: (currentTick) => set(produce((draft) => {
    Object.keys(draft.campaigns).forEach((campaignId) => {
      const c = draft.campaigns[campaignId];
      if (!c.active) return;

      // 1. Packet decay and expirations
      c.packets.forEach((pkt) => {
        if (currentTick >= pkt.expirationTick) {
          pkt.visibleToPlayer = false; // flag expired
        }
      });

      // 2. Recalculate confidence profiles
      // Decrease player confidence over time slightly due to decay rate
      c.confidence.plantedConfidence = Math.max(10, c.confidence.plantedConfidence - (c.confidence.decayRate || 2));

      // Natural trace exposure risk rises slightly per tick if active
      c.confidence.exposureRisk = Math.min(100, c.confidence.exposureRisk + 1);

      // Trigger automatic counterintelligence verification check periodically (e.g. every 5 ticks)
      if (currentTick % 5 === 0) {
        // trigger recalculations
        setTimeout(() => {
          get().recalculateBelievability(campaignId);
          get().evaluateContaminationRisk(campaignId);
          get().generateCounterDeceptionFindings(campaignId);
          get().updateBeliefState(campaignId);
        }, 10);
      }
    });
  }))
}));
