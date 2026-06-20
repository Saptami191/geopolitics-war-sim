import { create } from 'zustand';
import { produce } from 'immer';
import { useWorldStore } from './worldStore';
import { usePlayerStore } from './playerStore';
import { usePropagandaStore } from './propagandaStore';
import { useIntelligenceStore } from './intelligenceStore';
import {
  PropagandaCampaign,
  AdversarialDeceptionCampaign,
  PlantedIntelligencePacket,
  CounterintelligenceResponseModel,
  AssumptionProfile,
  PlayerBeliefModel,
  TrustChannelProfile,
  NarrativeFramingModel,
  MisperceptionRiskModel,
  FalseCertaintyVector,
  InfluenceExposureHistory,
  CounterNarrativeAsset,
  SourceCredibilityAttack,
  ManipulationObjective,
  BaitBeliefOpportunity,
  IntelligencePoisoningRecord,
  InfluenceOutcomeTrace,
  AdversarialInfluenceState
} from '../types';

interface InfluenceStoreActions {
  tickInfluenceSystem: (currentTick: number) => void;
  triggerCIAction: (responseId: string) => void;
  investigateBait: (baitId: string) => void;
  scoutPacket: (packetId: string) => void;
  quarantineChannel: (channelId: string) => void;
  toggleCounterAsset: (assetId: string) => void;
  triggerAdversarialCampaign: (adversaryId: string) => void;
  plantFakeIntercept: (adversaryId: string) => void;
  adjustDifficulty: (level: AdversarialInfluenceState['difficultyLevel']) => void;
  dismissOutcomeTrace: (index: number) => void;
  resetInfluenceStore: () => void;
}

const INITIAL_CHANNELS: TrustChannelProfile[] = [
  {
    id: 'dom_media',
    channelName: 'National Chronicle (Domestic Media)',
    category: 'DOMESTIC_MEDIA',
    baseReliability: 85,
    currentPoisoningLevel: 10,
    reachingCoverage: 90,
    susceptibilityRating: 25,
    burnedCount: 0
  },
  {
    id: 'foreign_wire',
    channelName: 'Trans-Atlantic Telegraph (Foreign Wire)',
    category: 'FOREIGN_MEDIA',
    baseReliability: 75,
    currentPoisoningLevel: 25,
    reachingCoverage: 60,
    susceptibilityRating: 45,
    burnedCount: 0
  },
  {
    id: 'social_platforms',
    channelName: 'PulseNet & EchoStreams (Social Platforms)',
    category: 'SOCIAL_PLATFORMS',
    baseReliability: 40,
    currentPoisoningLevel: 45,
    reachingCoverage: 80,
    susceptibilityRating: 75,
    burnedCount: 0
  },
  {
    id: 'diplomatic_back',
    channelName: 'Geneva Backroom Protocol (Diplomatic Backchannels)',
    category: 'DIPLOMATIC_BACKCHANNELS',
    baseReliability: 90,
    currentPoisoningLevel: 5,
    reachingCoverage: 35,
    susceptibilityRating: 15,
    burnedCount: 0
  },
  {
    id: 'forged_docs',
    channelName: 'Clandestine Informant Bundles (Intercepted Docs)',
    category: 'FORGED_DOCUMENTS',
    baseReliability: 65,
    currentPoisoningLevel: 50,
    reachingCoverage: 20,
    susceptibilityRating: 65,
    burnedCount: 0
  },
  {
    id: 'think_tanks',
    channelName: 'Sovereign Consensus Institute (Think Tanks)',
    category: 'THINK_TANKS',
    baseReliability: 80,
    currentPoisoningLevel: 15,
    reachingCoverage: 45,
    susceptibilityRating: 30,
    burnedCount: 0
  }
];

const INITIAL_COUNTER_RESPONSES: CounterintelligenceResponseModel[] = [
  {
    id: 'ci_validation',
    title: 'Validate Source Provenance',
    type: 'SOURCE_VALIDATION',
    costCashB: 1.5,
    costAP: 8,
    successProbability: 80,
    active: false,
    tickActivated: 0,
    cooldownRemaining: 0,
    narrativeOnTrigger: 'Dispatched signals-forensics division to trace file system fingerprints back to adversary intelligence servers.'
  },
  {
    id: 'ci_recalib',
    title: 'Recalibrate Analytic Trust Weights',
    type: 'TRUST_RECALIBRATION',
    costCashB: 0.8,
    costAP: 5,
    successProbability: 95,
    active: false,
    tickActivated: 0,
    cooldownRemaining: 0,
    narrativeOnTrigger: 'Audited intelligence desks, reducing credibility weights on high-susceptibility social feeds.'
  },
  {
    id: 'ci_quarantine',
    title: 'Quarantine Compromised Channels',
    type: 'CHANNEL_QUARANTINE',
    costCashB: 2.2,
    costAP: 12,
    successProbability: 85,
    active: false,
    tickActivated: 0,
    cooldownRemaining: 0,
    narrativeOnTrigger: 'Temporarily blocked unvalidated foreign leaks from being shared across public broadcasting vectors.'
  },
  {
    id: 'ci_disinfo',
    title: 'Activate Mirror Cognitive Counter-Campaign',
    type: 'DISINFO_COUNTER',
    costCashB: 3.5,
    costAP: 15,
    successProbability: 70,
    active: false,
    tickActivated: 0,
    cooldownRemaining: 0,
    narrativeOnTrigger: 'Flooded adversary networks with digital ghost signatures, inducing narrative confusion in their command rooms.'
  },
  {
    id: 'ci_leak',
    title: 'Deploy Leak Containment Firewall',
    type: 'LEAK_CONTAINMENT',
    costCashB: 1.8,
    costAP: 10,
    successProbability: 90,
    active: false,
    tickActivated: 0,
    cooldownRemaining: 0,
    narrativeOnTrigger: 'Enforced high-encryption seals on tactical coordinates files to block leaking front journalists.'
  },
  {
    id: 'ci_double_agent',
    title: 'Turn Exposed Hostile Informants',
    type: 'DOUBLE_AGENT_REVERSAL',
    costCashB: 2.8,
    costAP: 18,
    successProbability: 60,
    active: false,
    tickActivated: 0,
    cooldownRemaining: 0,
    narrativeOnTrigger: 'Re-wired compromised tactical nodes, sowing targeted disinformation directly back into the adversary state desks.'
  }
];

const INITIAL_BAIT_BELIEFS: BaitBeliefOpportunity[] = [
  {
    id: 'bait_siberia_weak',
    statement: 'Adversary Siberian missile silo network suffers extensive liquid-fuel plumbing fracture.',
    baitType: 'FALSE_WEAK_POINT_HARDENED',
    attractivenessScore: 82,
    timesInvestigated: 0,
    revealedAsTrap: false,
    actualTroopCountOffset: -40
  },
  {
    id: 'bait_alliance_fracture',
    statement: 'Sino-Russo joint defense treaty fractures over maritime pricing, resulting in active border redeployments.',
    baitType: 'FALSE_ALLIANCE_SPLIT',
    attractivenessScore: 68,
    timesInvestigated: 0,
    revealedAsTrap: false
  },
  {
    id: 'bait_open_arms',
    statement: 'Hostile supreme council offers secret security concessions on satellite tracking under diplomatic treaty.',
    baitType: 'FAKE_DIPLOMATIC_OPENING',
    attractivenessScore: 75,
    timesInvestigated: 0,
    revealedAsTrap: false
  },
  {
    id: 'bait_tech_gap',
    statement: 'Hostile hypersonic division reports thermal shielding failure, stalling high-altitude tests.',
    baitType: 'FALSE_READY_GAP',
    attractivenessScore: 54,
    timesInvestigated: 0,
    revealedAsTrap: false
  }
];

const INITIAL_COUNTER_ASSETS: CounterNarrativeAsset[] = [
  {
    id: 'asset_truth_wire',
    name: 'Broadband Truth Net',
    mediaCategory: 'FOREIGN_MEDIA',
    credibilityIndex: 88,
    costPerTick: 0.5,
    active: false
  },
  {
    id: 'asset_fact_guard',
    name: 'FactGuard Analytics Coalition',
    mediaCategory: 'SOCIAL_PLATFORMS',
    credibilityIndex: 72,
    costPerTick: 0.3,
    active: false
  },
  {
    id: 'asset_diplomatic_envoy',
    name: 'Dossier Verification Panel',
    mediaCategory: 'DIPLOMATIC_BACKCHANNELS',
    credibilityIndex: 94,
    costPerTick: 0.8,
    active: false
  }
];

export const useInfluenceStore = create<AdversarialInfluenceState & InfluenceStoreActions>((set, get) => ({
  propagandaCampaigns: [
    {
      id: 'ru_camp_1',
      codename: 'CAMPAIGN VOLGOGRAD ECHO',
      adversaryCountryId: 'RU',
      targetChannelId: 'social_platforms',
      narrativeFrame: 'PLAYER_IS_AGGRESSOR',
      reachIndex: 65,
      susceptibilityIndex: 55,
      seedingTick: 1,
      stage: 'SEEDING',
      decayRate: 4,
      unrestImpact: 1.2,
      credibilityScars: 5,
      isExposed: false,
      investmentB: 2.0
    },
    {
      id: 'cn_camp_1',
      codename: 'CAMPAIGN PACIFIC HARBOR',
      adversaryCountryId: 'CN',
      targetChannelId: 'foreign_wire',
      narrativeFrame: 'PLAYER_IS_ISOLATED',
      reachIndex: 45,
      susceptibilityIndex: 40,
      seedingTick: 3,
      stage: 'SETUP',
      decayRate: 3,
      unrestImpact: 0.8,
      credibilityScars: 8,
      isExposed: false,
      investmentB: 3.5
    }
  ],
  deceptionCampaigns: [
    {
      id: 'ru_dec_1',
      codename: 'OPERATION BLACK GLASS',
      adversaryCountryId: 'RU',
      objective: 'PROTECT_HIDDEN_BUILDUP',
      baitAssumptionId: 'bait_siberia_weak',
      active: true,
      intensityAndScope: 55,
      successProbability: 75,
      blowbackRisk: 30,
      exposureHistory: []
    }
  ],
  plantedPackets: [
    {
      id: 'pkt_forged_1',
      sourceType: 'FORGED_INTERCEPT',
      format: 'TACTICAL_FACT_FALSE_STRATEGIC',
      provenanceSource: 'Classified Baltic COMSEC Wire',
      headline: 'LEAKED Baltic Intercept: Hostile divisions pull back from border limits.',
      content: 'Leaked logistics file index b-405 indicates active tank command withdraws heavy armor by 80km. Strategic analysts suggest a complete retreat, though local cyber alarms on satellite sensors indicate visual tracking feeds are being systematically jammed.',
      analyzed: false,
      isExposed: false,
      perceivedCredibility: 78,
      actualAccuracy: 15,
      implantedBeliefId: 'bluff_anchored',
      detectionDifficulty: 65,
      tickPlanted: 1
    }
  ],
  counterintelligenceResponses: INITIAL_COUNTER_RESPONSES,
  playerBelief: {
    dominantNarrative: 'Democratic Alliance Sovereign Integrity',
    perceivedMainThreatVector: 'NORTH_SEA_STRIKE',
    allianceConfidenceRating: 80,
    bluffConfidenceRating: 50,
    anchoredAssumptions: ['NATO forces maintain full tactical intelligence superiority'],
    activeMisperceptions: ['Baltic armored withdrawals are genuine security gestures'],
    estimatedAdversaryBuildupConfidence: 65
  },
  assumptionProfiles: {
    US: {
      id: 'US',
      expectedAttackVectorBias: 'NORTH_SEA_STRIKE',
      trustBias: 'SIGINT_OVERRELIANCE',
      escalationExpectation: 'BLUFF_ANCHORED',
      allianceReliabilityExpectation: 'ALLIES_WILL_HOLD',
      intelligenceConfidenceBias: 85,
      bluffDetectionBias: 45,
      threatSalienceBias: 60
    }
  },
  trustChannels: INITIAL_CHANNELS,
  narrativeFraming: [
    {
      id: 'frame_1',
      opponentId: 'RU',
      frameType: 'PLAYER_IS_AGGRESSOR',
      intensity: 35,
      disseminationReach: 50,
      status: 'INFRA_SEEDED'
    }
  ],
  misperceptionRisk: {
    riskScore: 28,
    primaryFactor: 'Overvaluing unvalidated intercept leaks without visual satellite cross-check.',
    escalationSensitivity: 1.15,
    confirmationBiasAnchor: 'NATO superiority assumption prevents searching for hidden troop redeployments.'
  },
  falseCertaintyVectors: [
    {
      id: 'fcv_1',
      beliefStatement: 'The Northern Siberian front contains negligible ballistic capabilities.',
      perceivedCertainty: 72,
      actualRealityInverted: true,
      implantedByCampaignId: 'ru_dec_1'
    }
  ],
  exposureHistory: [],
  counterAssets: INITIAL_COUNTER_ASSETS,
  credibilityAttacks: [],
  manipulationObjectives: [
    {
      id: 'obj_delay_1',
      codename: 'DECEPTION SYALLBUS',
      type: 'DELAY_PLAYER_RESPONSE',
      status: 'ACTIVE',
      targetValue: 3
    }
  ],
  baitOpportunities: INITIAL_BAIT_BELIEFS,
  poisoningRecords: {
    SIGINT: { id: 'SIGINT', sourceId: 'SIGINT_WIRE', noiseLevelDelta: 20, conflictingReportsEnabled: true, timesFlaggedByCI: 0 }
  },
  outcomeTraces: [
    {
      tick: 3,
      campaignCodename: 'OPERATION BLACK GLASS',
      effectDescription: 'Player delayed mobilizing reserves in Northern Corridor due to false certainty regarding liquid fuel hardware collapse leaks.',
      outcomeType: 'DELIBERATE_HESITATION'
    }
  ],
  difficultyLevel: 'NORMAL',
  warningMetrics: {
    rumorPressure: 22,
    anomalyPressure: 15,
    deceptionSuspicion: 18,
    sourceBurnRisk: 10,
    contaminationLevel: 14
  },

  tickInfluenceSystem: (currentTick) => set(produce((draft: AdversarialInfluenceState) => {
    // 1. Advance Active Propaganda campaigns
    draft.propagandaCampaigns.forEach((camp) => {
      if (camp.stage === 'SETUP') {
        camp.stage = 'SEEDING';
      } else if (camp.stage === 'SEEDING' && currentTick - camp.seedingTick >= 3) {
        camp.stage = 'AMPLIFICATION';
      } else if (camp.stage === 'AMPLIFICATION' && currentTick - camp.seedingTick >= 8) {
        camp.stage = 'REINFORCEMENT';
      } else if (camp.stage === 'REINFORCEMENT' && currentTick - camp.seedingTick >= 14) {
        camp.stage = 'EXPLOITATION';
      } else if (camp.stage === 'EXPLOITATION' && currentTick - camp.seedingTick >= 22) {
        camp.stage = 'DECAY';
      }

      // Poison channels based on active campaigns
      const channel = draft.trustChannels.find(ch => ch.id === camp.targetChannelId);
      if (channel) {
        const poisoningIncr = draft.difficultyLevel === 'EASY' ? 1.5 : draft.difficultyLevel === 'NORMAL' ? 3.0 : draft.difficultyLevel === 'HARD' ? 5.0 : 7.0;
        channel.currentPoisoningLevel = Math.min(100, channel.currentPoisoningLevel + poisoningIncr);
      }

      // Spend money from adversary treasury dynamically
      const adversary = useWorldStore.getState().countries[camp.adversaryCountryId];
      if (adversary && adversary.economic.treasuryCashB > camp.unrestImpact * 0.5) {
        // Safe procedural state mutation
        useWorldStore.getState().updateCountry(camp.adversaryCountryId, (n) => {
          n.economic.treasuryCashB = Math.max(0, n.economic.treasuryCashB - camp.unrestImpact * 0.4);
        });

        // Apply media/democratization or popular unrest penalties to player homeland!
        const playerCountryId = usePlayerStore.getState().countryId || 'US';
        useWorldStore.getState().updateCountry(playerCountryId, (p) => {
          const impact = camp.stage === 'EXPLOITATION' ? camp.unrestImpact * 1.8 : camp.unrestImpact;
          p.political.popularUnrest = Math.min(100, p.political.popularUnrest + impact);
          p.political.stabilityIndex = Math.max(0, p.political.stabilityIndex - (impact * 0.4));
        });
      }
    });

    // 2. Cooldown processing for player counterintelligence responses
    draft.counterintelligenceResponses.forEach((ci) => {
      if (ci.cooldownRemaining > 0) {
        ci.cooldownRemaining--;
      }
    });

    // 3. Process Counter Narrative active costs
    draft.counterAssets.forEach((asset) => {
      if (asset.active) {
        const player = usePlayerStore.getState();
        if (player.cashB >= asset.costPerTick) {
          usePlayerStore.setState((state) => ({ cashB: state.cashB - asset.costPerTick }));
          usePlayerStore.getState().syncCashToCountry();

          // Mitigate trust channel poisoning based on active counter narrative target categories
          draft.trustChannels.forEach((ch) => {
            if (ch.category === asset.mediaCategory) {
              const reclaimFactor = draft.difficultyLevel === 'EASY' ? 8 : draft.difficultyLevel === 'NORMAL' ? 5 : 3;
              ch.currentPoisoningLevel = Math.max(0, ch.currentPoisoningLevel - reclaimFactor);
            }
          });
        } else {
          asset.active = false; // suspend due to lack of treasury funds
        }
      }
    });

    // 4. Evolving the warning metrics based on average channel poisoning and active packets
    const totalPoison = draft.trustChannels.reduce((sum, c) => sum + c.currentPoisoningLevel, 0);
    const unexposedPacketsCount = draft.plantedPackets.filter(p => !p.isExposed && !p.analyzed).length;
    const activeCampCount = draft.propagandaCampaigns.filter(c => !c.isExposed).length;

    draft.warningMetrics.contaminationLevel = Math.round(totalPoison / draft.trustChannels.length);
    draft.warningMetrics.rumorPressure = Math.min(100, Math.round(activeCampCount * 18 + totalPoison * 0.3));
    draft.warningMetrics.deceptionSuspicion = Math.min(100, Math.round(unexposedPacketsCount * 22 + draft.warningMetrics.contaminationLevel * 0.6));
    draft.warningMetrics.anomalyPressure = Math.min(100, Math.round(draft.warningMetrics.deceptionSuspicion * 0.8 + (draft.difficultyLevel === 'COGNITIVE_WARFARE' ? 25 : 10)));
    draft.warningMetrics.sourceBurnRisk = Math.min(100, Math.round(draft.warningMetrics.contaminationLevel * 1.1));

    // Dynamic misperception risk score evaluation
    const calculatedRisk = Math.min(100, Math.round((draft.warningMetrics.deceptionSuspicion + draft.warningMetrics.contaminationLevel) * 0.6 + (draft.difficultyLevel === 'EASY' ? 0 : draft.difficultyLevel === 'NORMAL' ? 10 : 25)));
    draft.misperceptionRisk.riskScore = calculatedRisk;

    // 5. Automated AI actions: periodic campaign seeding or packet planting based on difficulty level
    const spawnChance = draft.difficultyLevel === 'EASY' ? 0.05 : draft.difficultyLevel === 'NORMAL' ? 0.12 : draft.difficultyLevel === 'HARD' ? 0.22 : 0.35;
    if (Math.random() < spawnChance && currentTick % 5 === 0) {
      const adversaries = ['RU', 'CN', 'KP', 'IR'];
      const randomAdv = adversaries[Math.floor(Math.random() * adversaries.length)];
      
      if (Math.random() < 0.5) {
        // Spawn propagation campaign
        const codenames = ['RED HORIZON', 'WHITE FOX', 'GOLDEN MANDATE', 'COSMIC HARVEST', 'STEEL TEMPEST'];
        const randomCodename = `CAMPAIGN ${codenames[Math.floor(Math.random() * codenames.length)]}`;
        const frames: Array<PropagandaCampaign['narrativeFrame']> = ['PLAYER_IS_AGGRESSOR', 'PLAYER_IS_ISOLATED', 'PLAYER_IS_BLUFFING', 'MILITARY_SUPERIORITY_POSTURING', 'ALLIES_WILL_ABANDON_YOU'];
        const randomFrame = frames[Math.floor(Math.random() * frames.length)];
        const channels = ['dom_media', 'foreign_wire', 'social_platforms', 'diplomatic_back', 'think_tanks'];
        const randomChannel = channels[Math.floor(Math.random() * channels.length)];

        draft.propagandaCampaigns.push({
          id: `camp_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          codename: randomCodename,
          adversaryCountryId: randomAdv,
          targetChannelId: randomChannel,
          narrativeFrame: randomFrame,
          reachIndex: Math.round(40 + Math.random() * 40),
          susceptibilityIndex: Math.round(30 + Math.random() * 50),
          seedingTick: currentTick,
          stage: 'SETUP',
          decayRate: 4,
          unrestImpact: parseFloat((0.5 + Math.random() * 1.5).toFixed(1)),
          credibilityScars: Math.round(3 + Math.random() * 10),
          isExposed: false,
          investmentB: parseFloat((1.0 + Math.random() * 4.0).toFixed(1))
        });

        useWorldStore.getState().addGlobalEvent(`⚠️ COGNITIVE ANOMALY: Signals analysts track a sharp rise in narrative framing from ${randomAdv} targeting the "${randomFrame.replace(/_/g, ' ')}" archetype.`, 'WARNING');
      } else {
        // Spawn Planted packet
        const sources: Array<PlantedIntelligencePacket['sourceType']> = ['COMPROMISED_AGENT', 'FORGED_INTERCEPT', 'MANIPULATED_LEAK', 'CORRUPTED_DOCUMENT', 'STAGED_SIGNAL'];
        const types: Array<PlantedIntelligencePacket['format']> = ['TACTICAL_FACT_FALSE_STRATEGIC', 'ACCURATE_DETAIL_WRONG_CONCLUSION', 'BELIEVABLE_INCOMPLETE', 'FORGED_PROVENANCE', 'MIXED_TRUTH_LIE'];
        const randSource = sources[Math.floor(Math.random() * sources.length)];
        const randType = types[Math.floor(Math.random() * types.length)];
        
        const headlines = [
          `Intercepted decrypt: Core command center in ${randomAdv} reports severe fuel delivery defaults.`,
          `Leaked tactical memo: Third echelon division complains about broken logistics relays.`,
          `Maritime radar intercept: Strategic missile frigates cancel joint exercises claiming drydock failures.`,
          `Defense board transcript: Hostile supreme ministry halts reserve recruitment due to economic stress.`
        ];

        draft.plantedPackets.push({
          id: `pkt_${Date.now()}`,
          sourceType: randSource,
          format: randType,
          provenanceSource: `${randomAdv} Secure Communication Grid`,
          headline: headlines[Math.floor(Math.random() * headlines.length)],
          content: 'Classified transcript files indicate deep administrative distress inside their regional deployment command. Elite defense columns reportedly lack active battery units, pointing to severe supply gaps.',
          analyzed: false,
          isExposed: false,
          perceivedCredibility: Math.round(60 + Math.random() * 30),
          actualAccuracy: Math.round(5 + Math.random() * 25),
          implantedBeliefId: 'ready_gap_anchored',
          detectionDifficulty: Math.round(45 + Math.random() * 40),
          tickPlanted: currentTick
        });
      }
    }
  })),

  triggerCIAction: (responseId) => set(produce((draft: AdversarialInfluenceState) => {
    const ci = draft.counterintelligenceResponses.find(r => r.id === responseId);
    if (!ci || ci.cooldownRemaining > 0) return;

    const player = usePlayerStore.getState();
    if (player.cashB < ci.costCashB) {
      useWorldStore.getState().addGlobalEvent(`❌ COUNTER-INTEL DENIED: Insufficient treasury reserves to execute ${ci.title}.`, 'CRITICAL');
      return;
    }

    // Deduct player reserves
    usePlayerStore.setState((state) => ({ cashB: state.cashB - ci.costCashB }));
    usePlayerStore.getState().syncCashToCountry();

    ci.active = true;
    ci.tickActivated = useWorldStore.getState().currentTick;
    ci.cooldownRemaining = 6; // ticks cooldown

    const successRoll = Math.random() * 100;
    const successThreshold = ci.successProbability;

    if (successRoll < successThreshold) {
      // Counter-INTEL Succeeded!
      let logDesc = `🛡️ COUNTER-INTELLIGENCE SUCCESS: "${ci.title}" successfully completed. `;
      
      if (ci.type === 'SOURCE_VALIDATION') {
        // Expose a planted packet
        const packet = draft.plantedPackets.find(p => !p.isExposed);
        if (packet) {
          packet.isExposed = true;
          packet.analyzed = true;
          logDesc += `Exposed forged packet "${packet.headline}" proving it was fabricated provenance generated by third parties!`;
          
          // Expose the corresponding propaganda campaign if any
          const matchingCamp = draft.propagandaCampaigns.find(c => c.targetChannelId === 'forged_docs' || c.adversaryCountryId === 'RU');
          if (matchingCamp) {
            matchingCamp.isExposed = true;
            matchingCamp.stage = 'DECAY';
          }
        } else {
          logDesc += `No active unvalidated packets found; signal integrity thoroughly audited.`;
        }
        draft.warningMetrics.deceptionSuspicion = Math.max(0, draft.warningMetrics.deceptionSuspicion - 35);
      } else if (ci.type === 'TRUST_RECALIBRATION') {
        draft.trustChannels.forEach((ch) => {
          ch.currentPoisoningLevel = Math.max(0, ch.currentPoisoningLevel - 30);
        });
        logDesc += `All mass trust channel poisoning indices reduced by 30%. Digital signal integrity restored.`;
      } else if (ci.type === 'CHANNEL_QUARANTINE') {
        const primaryPoisoned = [...draft.trustChannels].sort((a,b) => b.currentPoisoningLevel - a.currentPoisoningLevel)[0];
        if (primaryPoisoned) {
          primaryPoisoned.currentPoisoningLevel = Math.max(5, Math.round(primaryPoisoned.currentPoisoningLevel * 0.2));
          logDesc += `Quarantined ${primaryPoisoned.channelName}, crashing its poisoning index by 80%.`;
        }
      } else if (ci.type === 'DISINFO_COUNTER') {
        draft.warningMetrics.anomalyPressure = Math.max(0, draft.warningMetrics.anomalyPressure - 40);
        draft.warningMetrics.rumorPressure = Math.max(0, draft.warningMetrics.rumorPressure - 45);
        logDesc += `Adversary media centers flooded with mirror counternoise. Rumor metrics collapsed!`;
      } else if (ci.type === 'LEAK_CONTAINMENT') {
        const packets = draft.plantedPackets.filter(p => !p.isExposed);
        packets.forEach(p => { p.isExposed = true; p.actualAccuracy = 0; });
        logDesc += `Enforced absolute media encryption locks. All planted leaks neutralized instantly.`;
      } else if (ci.type === 'DOUBLE_AGENT_REVERSAL') {
        // Highly aggressive: turn exposed packet into double blowback
        draft.exposureHistory.push({
          campaignId: `reversal_${Date.now()}`,
          tickExposed: useWorldStore.getState().currentTick,
          blowbackSeverity: 'DIPLOMATIC_CRISIS',
          outcomeNarrative: 'Successfully funneled corrupt ballistic data back to enemy operations desk, triggering internal sabotage.'
        });
        draft.outcomeTraces.push({
          tick: useWorldStore.getState().currentTick,
          campaignCodename: 'DOUBLE REVERSAL PROJECT',
          effectDescription: 'Enemy signals command misread troop coordinates, resulting in failed sabotage targeting our fleet.',
          outcomeType: 'PUBLIC_LEGITIMACY_SAP'
        });
        logDesc += `Exposed hostile agents reversed. Sown double-deception returned directly into adversary networks.`;
      }

      useWorldStore.getState().addGlobalEvent(logDesc, 'INFO');
    } else {
      // Failed Counter-INTEL response!
      useWorldStore.getState().addGlobalEvent(`⚠️ COUNTER-INTEL SLIP: Executed "${ci.title}" but operations assets encountered severe encryption roadblocks. Target campaign remains active.`, 'WARNING');
    }
  })),

  investigateBait: (baitId) => set(produce((draft: AdversarialInfluenceState) => {
    const bait = draft.baitOpportunities.find(b => b.id === baitId);
    if (!bait) return;

    bait.timesInvestigated++;
    
    const successRoll = Math.random() * 100;
    // Investigate bait checks. If roll exceeds 65, player discovers it is a hollow trap!
    if (successRoll > 65 / bait.timesInvestigated) {
      bait.revealedAsTrap = true;
      useWorldStore.getState().addGlobalEvent(`🚨 BAIT UNMASKED: Deep analytical review validates that "${bait.statement}" was a STAGED BAIT designed to trick our command response!`, 'INFO');
      
      // Reduce perceived certainty of correspond vectors
      draft.falseCertaintyVectors.forEach((v) => {
        if (v.beliefStatement.includes('Siberian') && baitId === 'bait_siberia_weak') {
          v.perceivedCertainty = Math.max(5, v.perceivedCertainty - 50);
        }
      });
    } else {
      useWorldStore.getState().addGlobalEvent(`🔍 BAIT RECONNAISSANCE: Dispatched field analysts to investigate: "${bait.statement}". Visual data appears plausible but unconfirmed.`, 'WARNING');
    }
  })),

  scoutPacket: (packetId) => set(produce((draft: AdversarialInfluenceState) => {
    const packet = draft.plantedPackets.find(p => p.id === packetId);
    if (!packet) return;

    packet.analyzed = true;
    
    // Check if detected
    const playerCIBuff = draft.counterintelligenceResponses.find(r => r.active && r.type === 'SOURCE_VALIDATION') ? 35 : 0;
    const detectionRoll = Math.random() * 100 + playerCIBuff;

    if (detectionRoll > packet.detectionDifficulty) {
      packet.isExposed = true;
      useWorldStore.getState().addGlobalEvent(`🔍 COMPROMISE EXPOSED: Forged details unmasked in leak: "${packet.headline}". File metadata traced directly back to hostile regional command registries!`, 'INFO');
      
      // Expose blowback
      draft.exposureHistory.push({
        campaignId: packet.id,
        tickExposed: useWorldStore.getState().currentTick,
        blowbackSeverity: 'CIVIC_OUTRAGE',
        outcomeNarrative: `Publicly unmasked enemy forged files. Media backlash against adversary credibility.`
      });
    } else {
      useWorldStore.getState().addGlobalEvent(`✔️ INTEL PACKET ASSIGNED: Analysts integrate payload coordinates from "${packet.headline}" into defense models with cautious trust.`, 'SYSTEM');
    }
  })),

  quarantineChannel: (channelId) => set(produce((draft: AdversarialInfluenceState) => {
    const channel = draft.trustChannels.find(ch => ch.id === channelId);
    if (!channel) return;

    const cost = 0.5; // $0.5B
    const player = usePlayerStore.getState();
    if (player.cashB < cost) return;

    usePlayerStore.setState((state) => ({ cashB: state.cashB - cost }));
    usePlayerStore.getState().syncCashToCountry();

    channel.currentPoisoningLevel = Math.max(0, channel.currentPoisoningLevel - 45);
    channel.burnedCount++;
    useWorldStore.getState().addGlobalEvent(`🛡️ SIGNAL QUARANTINE: Administered temporary broadcast containment on channel: "${channel.channelName}". Poisoning index lowered.`, 'INFO');
  })),

  toggleCounterAsset: (assetId) => set(produce((draft: AdversarialInfluenceState) => {
    const asset = draft.counterAssets.find(a => a.id === assetId);
    if (asset) {
      asset.active = !asset.active;
      useWorldStore.getState().addGlobalEvent(`📡 NARRATIVE VECTOR: Fact checking and editorial counter-asset "${asset.name}" toggled to: ${asset.active ? 'ACTIVE' : 'OFFLINE'}.`, 'SYSTEM');
    }
  })),

  triggerAdversarialCampaign: (adversaryId) => set(produce((draft: AdversarialInfluenceState) => {
    const frames: Array<PropagandaCampaign['narrativeFrame']> = ['PLAYER_IS_AGGRESSOR', 'PLAYER_IS_ISOLATED', 'PLAYER_IS_BLUFFING', 'MILITARY_SUPERIORITY_POSTURING', 'ALLIES_WILL_ABANDON_YOU'];
    const randomFrame = frames[Math.floor(Math.random() * frames.length)];
    const channelId = draft.trustChannels[Math.floor(Math.random() * draft.trustChannels.length)].id;

    draft.propagandaCampaigns.push({
      id: `camp_manual_${Date.now()}`,
      codename: `OPERATION TSAR FLASH`,
      adversaryCountryId: adversaryId,
      targetChannelId: channelId,
      narrativeFrame: randomFrame,
      reachIndex: 85,
      susceptibilityIndex: 70,
      seedingTick: useWorldStore.getState().currentTick,
      stage: 'SETUP',
      decayRate: 4,
      unrestImpact: 2.2,
      credibilityScars: 15,
      isExposed: false,
      investmentB: 5.0
    });

    useWorldStore.getState().addGlobalEvent(`⚠️ COMBAT PERSUASION TRIGGERED: Intelligence monitors detect deep-infrastructure narrative attack launched by ${adversaryId} to subvert alliance trust channels!`, 'CRITICAL');
  })),

  plantFakeIntercept: (adversaryId) => set(produce((draft: AdversarialInfluenceState) => {
    draft.plantedPackets.push({
      id: `pkt_manual_${Date.now()}`,
      sourceType: 'COMPROMISED_AGENT',
      format: 'MIXED_TRUTH_LIE',
      provenanceSource: `${adversaryId} Cabinet Decrypts`,
      headline: `COMPROMISED AGENT report: Secret command coup underway in ${adversaryId}.`,
      content: 'Clandestine asset "Kestrel" reports massive fracture in the adversary inner politburo, claiming key nuclear trigger officers are placed under administrative house arrest. Defense preparedness levels reportedly halved.',
      analyzed: false,
      isExposed: false,
      perceivedCredibility: 85,
      actualAccuracy: 10,
      implantedBeliefId: 'false_coup_belief',
      detectionDifficulty: 75,
      tickPlanted: useWorldStore.getState().currentTick
    });

    useWorldStore.getState().addGlobalEvent(`⚠️ PLANT DETECTION: Crucial file packet injected into player SIGINT queues claiming high-level inner cabinet coups. Validation recommended.`, 'WARNING');
  })),

  adjustDifficulty: (level) => set({ difficultyLevel: level }),

  dismissOutcomeTrace: (index) => set(produce((draft: AdversarialInfluenceState) => {
    draft.outcomeTraces.splice(index, 1);
  })),

  resetInfluenceStore: () => set({
    propagandaCampaigns: [
      {
        id: 'ru_camp_1',
        codename: 'CAMPAIGN VOLGOGRAD ECHO',
        adversaryCountryId: 'RU',
        targetChannelId: 'social_platforms',
        narrativeFrame: 'PLAYER_IS_AGGRESSOR',
        reachIndex: 65,
        susceptibilityIndex: 55,
        seedingTick: 1,
        stage: 'SEEDING',
        decayRate: 4,
        unrestImpact: 1.2,
        credibilityScars: 5,
        isExposed: false,
        investmentB: 2.0
      },
      {
        id: 'cn_camp_1',
        codename: 'CAMPAIGN PACIFIC HARBOR',
        adversaryCountryId: 'CN',
        targetChannelId: 'foreign_wire',
        narrativeFrame: 'PLAYER_IS_ISOLATED',
        reachIndex: 45,
        susceptibilityIndex: 40,
        seedingTick: 3,
        stage: 'SETUP',
        decayRate: 3,
        unrestImpact: 0.8,
        credibilityScars: 8,
        isExposed: false,
        investmentB: 3.5
      }
    ],
    deceptionCampaigns: [
      {
        id: 'ru_dec_1',
        codename: 'OPERATION BLACK GLASS',
        adversaryCountryId: 'RU',
        objective: 'PROTECT_HIDDEN_BUILDUP',
        baitAssumptionId: 'bait_siberia_weak',
        active: true,
        intensityAndScope: 55,
        successProbability: 75,
        blowbackRisk: 30,
        exposureHistory: []
      }
    ],
    plantedPackets: [
      {
        id: 'pkt_forged_1',
        sourceType: 'FORGED_INTERCEPT',
        format: 'TACTICAL_FACT_FALSE_STRATEGIC',
        provenanceSource: 'Classified Baltic COMSEC Wire',
        headline: 'LEAKED Baltic Intercept: Hostile divisions pull back from border limits.',
        content: 'Leaked logistics file index b-405 indicates active tank command withdraws heavy armor by 80km. Strategic analysts suggest a complete retreat, though local cyber alarms on satellite sensors indicate visual tracking feeds are being systematically jammed.',
        analyzed: false,
        isExposed: false,
        perceivedCredibility: 78,
        actualAccuracy: 15,
        implantedBeliefId: 'bluff_anchored',
        detectionDifficulty: 65,
        tickPlanted: 1
      }
    ],
    counterintelligenceResponses: INITIAL_COUNTER_RESPONSES,
    playerBelief: {
      dominantNarrative: 'Democratic Alliance Sovereign Integrity',
      perceivedMainThreatVector: 'NORTH_SEA_STRIKE',
      allianceConfidenceRating: 80,
      bluffConfidenceRating: 50,
      anchoredAssumptions: ['NATO forces maintain full tactical intelligence superiority'],
      activeMisperceptions: ['Baltic armored withdrawals are genuine security gestures'],
      estimatedAdversaryBuildupConfidence: 65
    },
    assumptionProfiles: {
      US: {
        id: 'US',
        expectedAttackVectorBias: 'NORTH_SEA_STRIKE',
        trustBias: 'SIGINT_OVERRELIANCE',
        escalationExpectation: 'BLUFF_ANCHORED',
        allianceReliabilityExpectation: 'ALLIES_WILL_HOLD',
        intelligenceConfidenceBias: 85,
        bluffDetectionBias: 45,
        threatSalienceBias: 60
      }
    },
    trustChannels: INITIAL_CHANNELS,
    narrativeFraming: [
      {
        id: 'frame_1',
        opponentId: 'RU',
        frameType: 'PLAYER_IS_AGGRESSOR',
        intensity: 35,
        disseminationReach: 50,
        status: 'INFRA_SEEDED'
      }
    ],
    misperceptionRisk: {
      riskScore: 28,
      primaryFactor: 'Overvaluing unvalidated intercept leaks without visual satellite cross-check.',
      escalationSensitivity: 1.15,
      confirmationBiasAnchor: 'NATO superiority assumption prevents searching for hidden troop redeployments.'
    },
    falseCertaintyVectors: [
      {
        id: 'fcv_1',
        beliefStatement: 'The Northern Siberian front contains negligible ballistic capabilities.',
        perceivedCertainty: 72,
        actualRealityInverted: true,
        implantedByCampaignId: 'ru_dec_1'
      }
    ],
    exposureHistory: [],
    counterAssets: INITIAL_COUNTER_ASSETS,
    credibilityAttacks: [],
    manipulationObjectives: [
      {
        id: 'obj_delay_1',
        codename: 'DECEPTION SYALLBUS',
        type: 'DELAY_PLAYER_RESPONSE',
        status: 'ACTIVE',
        targetValue: 3
      }
    ],
    baitOpportunities: INITIAL_BAIT_BELIEFS,
    poisoningRecords: {
      SIGINT: { id: 'SIGINT', sourceId: 'SIGINT_WIRE', noiseLevelDelta: 20, conflictingReportsEnabled: true, timesFlaggedByCI: 0 }
    },
    outcomeTraces: [
      {
        tick: 3,
        campaignCodename: 'OPERATION BLACK GLASS',
        effectDescription: 'Player delayed mobilizing reserves in Northern Corridor due to false certainty regarding liquid fuel hardware collapse leaks.',
        outcomeType: 'DELIBERATE_HESITATION'
      }
    ],
    difficultyLevel: 'NORMAL',
    warningMetrics: {
      rumorPressure: 22,
      anomalyPressure: 15,
      deceptionSuspicion: 18,
      sourceBurnRisk: 10,
      contaminationLevel: 14
    }
  })
}));
