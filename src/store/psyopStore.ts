import { create } from 'zustand';
import { produce } from 'immer';
import { useWorldStore } from './worldStore';
import { useNationIdentityStore } from './nationIdentityStore';
import { useDefconStore } from './defconStore';
import { useRegimePressureStore } from './regimePressureStore';
import { useIntelligenceStore } from './intelligenceStore';
import { useLeaderStore } from './leaderStore';
import { useLeaderMemoryStore } from './leaderMemoryStore';
import { useCinematicsStore } from './cinematicsStore';
import { useEconomyStore } from './economyStore';
import { usePlayerStore } from './playerStore';
import { useMirrorStore } from './mirrorStore';
import {
  NarrativeCampaign,
  BotNetwork,
  MediaCutout,
  KomprómatOperation,
  PublicOpinionPoll,
  PSYOPState,
  NarrativeTheme,
  NarrativePhase,
  DistributionChannel,
  KomprómatType,
  DiscoveryVector
} from '../types';

const OP_ADJECTIVES = ['SILENT', 'IRON', 'CRIMSON', 'MIDNIGHT', 'SHATTERED', 'GOLDEN', 'RUSTED', 'HOLLOW', 'BROKEN', 'FRACTURED', 'VEILED', 'HIDDEN', 'WHISPERING', 'OBSIDIAN', 'GHOST', 'PHANTOM', 'COBALT', 'EMBER', 'FROST', 'ECHO', 'VOID', 'STEALTH', 'SOLAR', 'LUNAR', 'ASTRAL'];
const OP_NOUNS = ['WEDGE', 'THUNDER', 'ACCORD', 'DAGGER', 'SHIELD', 'SPEAR', 'SUN', 'RAVEN', 'WOLF', 'VIPER', 'CROWN', 'THRONE', 'SKEPTRE', 'WINTER', 'SUMMER', 'DAWN', 'DUSK', 'SAND', 'STORM', 'GLASS', 'TEMPEST', 'ECHO', 'SHADOW', 'FLAME', 'ICE'];

function generateCodename(): string {
  const adj = OP_ADJECTIVES[Math.floor(Math.random() * OP_ADJECTIVES.length)];
  const noun = OP_NOUNS[Math.floor(Math.random() * OP_NOUNS.length)];
  return `${adj} ${noun}`;
}

export interface PsyopStoreState extends PSYOPState {}

export interface PsyopStoreActions {
  createNarrativeCampaign: (params: {
    targetCountryId: string;
    theme: NarrativeTheme;
    coreMessage: string;
    targetDemographic: string;
    emotionalRegister: NarrativeCampaign['emotionalRegister'];
    initialFunding: number;
  }) => string;
  addChannelToCampaign: (campaignId: string, channel: DistributionChannel, funding: number, networkId?: string, cutoutId?: string) => void;
  advanceCampaignPhase: (campaignId: string) => void;
  tickNarrativeCampaigns: () => void;

  createBotNetwork: (params: {
    targetCountryId: string;
    size: number;
    sophisticationLevel: number;
    fundingPerTick: number;
  }) => string;
  activateBotNetwork: (networkId: string, campaignId: string) => void;
  tickBotNetworks: () => void;
  triggerNetworkTakedown: (networkId: string) => void;
  buildNewBotNetwork: (countryId: string, sizeTier: 'MICRO' | 'REGIONAL' | 'NATIONAL' | 'GLOBAL', operativeHandlerId: string | null) => string;

  establishMediaCutout: (params: {
    outletName: string;
    registrationCountry: string;
    appearsAs: MediaCutout['appearsAs'];
    initialFunding: number;
  }) => string;
  publishCutoutContent: (cutoutId: string, campaignId: string, contentType: 'BREAKING_NEWS' | 'ANALYSIS_PIECE' | 'OPINION' | 'RESEARCH_PAPER') => void;
  checkMainstreamPickup: () => void;
  exposeCutout: (cutoutId: string, exposedBy: string) => void;

  initiateKomprómatOp: (params: {
    targetLeaderId: string;
    komprómatType: KomprómatType;
    isFabricated: boolean;
    placementChannels: DistributionChannel[];
    primaryOutletId?: string | null;
  }) => string;
  advanceKomprómatPhase: (opId: string) => void;
  tickKomprómatDebunk: () => void;

  generatePublicOpinionPoll: (countryId: string) => void;
  storePollHistory: (countryId: string, poll: PublicOpinionPoll) => void;
  manipulatePollSource: (countryId: string, targetMetric: string, manipulationAmount: number) => void;

  triggerDiscoveryInvestigation: (opId: string, opType: 'NARRATIVE' | 'BOT_NETWORK' | 'CUTOUT' | 'KOMPROMAT') => void;
  tickInvestigations: () => void;
  playerCounterInvestigation: (investigationId: string, method: 'LEGAL_THREAT' | 'SOURCE_INTIMIDATION' | 'COUNTER_DISINFO' | 'EVIDENCE_DESTRUCTION' | 'DIPLOMATIC_PRESSURE') => void;
  exposeOperation: (opId: string, opType: 'NARRATIVE' | 'BOT_NETWORK' | 'CUTOUT' | 'KOMPROMAT') => void;

  tickPSYOP: () => void;
  resetPsyopStore: () => void;
}

export const usePsyopStore = create<PsyopStoreState & PsyopStoreActions>((set, get) => ({
  narrativeCampaigns: {},
  botNetworks: {},
  mediaCutouts: {},
  komprómatOps: {},
  publicOpinionData: {},
  pollHistory: {},
  globalDisinfoIndex: 0,
  playerInfoWarReputation: 0,
  counterNarrativeResistance: {},
  activeDiscoveryInvestigations: [],
  completedCampaigns: [],

  createNarrativeCampaign: (params) => {
    const id = `CAMPAIGN-${Date.now()}`;
    const worldState = useWorldStore.getState();
    const currentTick = worldState.currentTick;
    
    // Calculate initial values
    const targetCountryIdentity = useNationIdentityStore.getState().nationIdentities[params.targetCountryId];
    const securityDoctrine = targetCountryIdentity?.securityDoctrine || 50;
    const mediaFreedomIndex = targetCountryIdentity ? (100 - targetCountryIdentity.ideologyIndex) : 50; // simple approximation if missing
    
    // Susceptibility calc
    const susceptibility = (100 - mediaFreedomIndex) * 0.5 + 
      ((get().publicOpinionData[params.targetCountryId]?.polarizationIndex || 50) * 0.3);
      
    const initialPenetration = 5 + (susceptibility * 0.2);
    const initialRisk = 10 + (securityDoctrine * 0.3) + (params.initialFunding * 0.5);

    const campaign: NarrativeCampaign = {
      id,
      codename: generateCodename(),
      targetCountryId: params.targetCountryId,
      theme: params.theme,
      phase: 'SEEDING',
      turnLaunched: currentTick,
      turnPhaseChanged: currentTick,

      coreMessage: params.coreMessage,
      supportingNarratives: [],
      targetDemographic: params.targetDemographic,
      emotionalRegister: params.emotionalRegister,

      activeChannels: [],
      botNetworkIds: [],
      cutoutIds: [],
      totalFundingDeployed: params.initialFunding,

      narrativePenetration: initialPenetration,
      beliefAdoption: 0,
      organicSpreadMultiplier: 1.0,
      viralMomentCount: 0,
      counterNarrativeStrength: get().counterNarrativeResistance[params.targetCountryId] || 0,

      discoveryRisk: initialRisk,
      playerFingerprint: 10,
      platformSuspicion: 0,
      targetIntelAwareness: 0,

      legitimacyDamage: 0,
      socialCohesionDamage: 0,
      targetDefconInfluence: 0
    };

    set(produce((draft: PsyopStoreState) => {
      draft.narrativeCampaigns[id] = campaign;
    }));

    worldState.addGlobalEvent(`SIGINT: unusual information environment activity detected in ${params.targetCountryId}`);
    return id;
  },

  addChannelToCampaign: (campaignId, channel, funding, networkId, cutoutId) => {
    set(produce((draft: PsyopStoreState) => {
      const campaign = draft.narrativeCampaigns[campaignId];
      if (!campaign) return;

      if (!campaign.activeChannels.includes(channel)) {
        campaign.activeChannels.push(channel);
      }
      campaign.totalFundingDeployed += funding;

      switch (channel) {
        case 'SOCIAL_MEDIA_ORGANIC':
          campaign.narrativePenetration += 8;
          // beliefAdoption handles believability conceptually here
          campaign.discoveryRisk += 5;
          campaign.playerFingerprint += 3;
          break;
        case 'BOT_NETWORK':
          campaign.narrativePenetration += 25;
          campaign.discoveryRisk += 18;
          campaign.playerFingerprint += 12;
          if (networkId && draft.botNetworks[networkId]) {
            campaign.botNetworkIds.push(networkId);
            draft.botNetworks[networkId].isActive = true;
            draft.botNetworks[networkId].assignedCampaignId = campaignId;
          }
          break;
        case 'STATE_MEDIA_CUTOUT':
          campaign.narrativePenetration += 15;
          campaign.discoveryRisk += 8;
          campaign.playerFingerprint += 6;
          if (cutoutId && draft.mediaCutouts[cutoutId]) {
             campaign.cutoutIds.push(cutoutId);
             if (!draft.mediaCutouts[cutoutId].assignedCampaignIds.includes(campaignId)) {
                draft.mediaCutouts[cutoutId].assignedCampaignIds.push(campaignId);
             }
          }
          break;
        case 'INFLUENCER_LAUNDERING':
          campaign.narrativePenetration += 20;
          campaign.organicSpreadMultiplier += 0.3;
          campaign.discoveryRisk += 10;
          campaign.playerFingerprint += 4;
          break;
        case 'ACADEMIC_CITATION':
          campaign.discoveryRisk += 6;
          campaign.playerFingerprint += 8;
          break;
        case 'LEAKED_DOCUMENT':
          campaign.narrativePenetration += 30;
          campaign.discoveryRisk += 25;
          campaign.playerFingerprint += 20;
          break;
        case 'DIPLOMATIC_WHISPERING':
          campaign.discoveryRisk += 3;
          campaign.playerFingerprint += 2;
          break;
        case 'ENCRYPTED_CHANNEL':
          campaign.narrativePenetration += 5;
          campaign.organicSpreadMultiplier += 0.1;
          campaign.discoveryRisk += 2;
          break;
      }
    }));
  },

  advanceCampaignPhase: (campaignId) => {
    set(produce((draft: PsyopStoreState) => {
      const campaign = draft.narrativeCampaigns[campaignId];
      if (!campaign) return;
      
      const currentTick = useWorldStore.getState().currentTick;

      let advanced = false;
      switch (campaign.phase) {
        case 'SEEDING':
          if (campaign.narrativePenetration >= 15 && campaign.totalFundingDeployed >= 0.5) {
            campaign.phase = 'AMPLIFICATION';
            advanced = true;
          }
          break;
        case 'AMPLIFICATION':
          if (campaign.narrativePenetration >= 35 && campaign.beliefAdoption >= 20) {
            campaign.phase = 'SATURATION';
            campaign.platformSuspicion += 20;
            advanced = true;
            try {
              useMirrorStore.getState().recordPlayerAction('COVERT', 15, currentTick);
            } catch (e) {}
          }
          break;
        case 'SATURATION':
          if (campaign.beliefAdoption >= 45 && campaign.counterNarrativeStrength < 40) {
            campaign.phase = 'CRYSTALLIZATION';
            advanced = true;
            if (campaign.organicSpreadMultiplier > 1.5) {
              // self sustaining
            }
            useCinematicsStore.getState().queueScene({
              type: 'NARRATIVE_CRYSTALLIZED',
              payload: { campaignCodename: campaign.codename, theme: campaign.theme, targetCountry: campaign.targetCountryId, beliefAdoption: Math.floor(campaign.beliefAdoption) },
              isSkippable: true, totalPhases: 2, blocksInput: false, phaseDurationMs: 3000, autoAdvance: true
            });
          }
          break;
        case 'CRYSTALLIZATION':
          if (campaign.beliefAdoption >= 65) {
            campaign.phase = 'WEAPONIZATION';
            campaign.targetIntelAwareness += 25;
            advanced = true;
          }
          break;
        case 'WEAPONIZATION':
          campaign.phase = 'COMPLETE';
          advanced = true;
          draft.completedCampaigns.push({
            campaignId: campaign.id,
            targetCountryId: campaign.targetCountryId,
            outcome: campaign.beliefAdoption > 70 ? 'SUCCESS' : (campaign.beliefAdoption > 40 ? 'PARTIAL' : 'FAILURE'),
            tick: currentTick,
            finalBeliefAdoption: campaign.beliefAdoption,
            wasExposed: false
          });
          break;
      }
      
      if (advanced) {
        campaign.turnPhaseChanged = currentTick;
        campaign.discoveryRisk += 8;
      }
    }));
  },

  tickNarrativeCampaigns: () => {
    set(produce((draft: PsyopStoreState) => {
      Object.values(draft.narrativeCampaigns).forEach(campaign => {
        if (campaign.phase === 'COMPLETE' || campaign.phase === 'BURNED' || campaign.phase === 'DORMANT') return;
        
        const targetCountryIdentity = useNationIdentityStore.getState().nationIdentities[campaign.targetCountryId];
        const mediaFreedomIndex = targetCountryIdentity ? (100 - targetCountryIdentity.ideologyIndex) : 50;

        campaign.narrativePenetration += (campaign.activeChannels.length * 2) - (campaign.counterNarrativeStrength * 0.3);
        campaign.beliefAdoption += (campaign.narrativePenetration * 0.08) * campaign.organicSpreadMultiplier;
        
        // cap by media freedom
        const adoptionCap = mediaFreedomIndex > 70 ? 70 : 100;
        if (campaign.beliefAdoption > adoptionCap) campaign.beliefAdoption = adoptionCap;
        if (campaign.narrativePenetration > 100) campaign.narrativePenetration = 100;

        campaign.counterNarrativeStrength += campaign.targetIntelAwareness * 0.15;
        
        // Discovery roll
        const roll = Math.random() * 100;
        if (roll < campaign.discoveryRisk) {
          get().triggerDiscoveryInvestigation(campaign.id, 'NARRATIVE');
        }

        // Notify other systems
        if (campaign.beliefAdoption > 60 && campaign.emotionalRegister === 'ANGER') {
           const poll = draft.publicOpinionData[campaign.targetCountryId];
           if (poll) {
             poll.protestLikelihood = Math.min(100, poll.protestLikelihood + 5);
           }
        }
        
        if (campaign.beliefAdoption > 70 && campaign.theme === 'DEMOCRATIC_LEGITIMACY') {
           // Notify RegimePressureStore internally via global state if needed, or ui display
        }
      });
    }));
  },

  createBotNetwork: (params) => {
    const id = `BOTNET-${Date.now()}`;
    const network: BotNetwork = {
      id,
      codename: generateCodename(),
      ownerCountryId: usePlayerStore.getState().countryId || 'US',
      targetCountryId: params.targetCountryId,
      size: params.size,
      sophisticationLevel: params.sophisticationLevel,
      activityLevel: 50,
      detectability: Math.max(0, 100 - params.sophisticationLevel),
      platformDistribution: { "Twitter/X": 40, "Facebook": 30, "Telegram": 20, "TikTok": 10 },
      assignedCampaignId: null,
      isActive: false,
      isBurned: false,
      burnedTick: null,
      accountsRemaining: params.size,
      operativeHandlerId: null,
      metadataConsistency: params.sophisticationLevel * 0.7 + Math.random() * 20,
      behavioralConsistency: params.sophisticationLevel * 0.8,
      linguisticAuthenticity: params.sophisticationLevel * 0.9
    };

    set(produce((draft: PsyopStoreState) => {
      draft.botNetworks[id] = network;
    }));
    return id;
  },

  activateBotNetwork: (networkId, campaignId) => {
    set(produce((draft: PsyopStoreState) => {
      const net = draft.botNetworks[networkId];
      const camp = draft.narrativeCampaigns[campaignId];
      if (net && camp && !net.isBurned) {
        net.isActive = true;
        net.assignedCampaignId = campaignId;
        camp.platformSuspicion += net.detectability * 0.3;
      }
    }));
  },

  tickBotNetworks: () => {
    set(produce((draft: PsyopStoreState) => {
      const currentTick = useWorldStore.getState().currentTick;
      Object.values(draft.botNetworks).forEach(network => {
        if (!network.isActive || network.isBurned) return;

        const campaign = network.assignedCampaignId ? draft.narrativeCampaigns[network.assignedCampaignId] : null;
        if (campaign) {
          campaign.narrativePenetration += (network.size / 200000);
        }

        const campSuspicion = campaign ? campaign.platformSuspicion : 0;
        const detectionChance = (network.detectability * 0.8) + (network.activityLevel * 0.15) + (campSuspicion * 0.2);

        if (Math.random() * 100 < detectionChance * 0.1) {
           const removed = network.accountsRemaining * (0.05 + Math.random() * 0.10);
           network.accountsRemaining = Math.max(0, network.accountsRemaining - removed);
        }

        if (network.accountsRemaining < (network.size * 0.6)) {
           // lost 40%
           get().triggerNetworkTakedown(network.id);
        }

        if (currentTick % 5 === 0) {
          const degradation = network.operativeHandlerId ? 1 : 2;
          network.sophisticationLevel = Math.max(0, network.sophisticationLevel - degradation);
        }
      });
    }));
  },

  triggerNetworkTakedown: (networkId) => {
    set(produce((draft: PsyopStoreState) => {
      const currentTick = useWorldStore.getState().currentTick;
      const net = draft.botNetworks[networkId];
      if (!net) return;

      net.isBurned = true;
      net.isActive = false;
      net.burnedTick = currentTick;

      if (net.assignedCampaignId) {
        const camp = draft.narrativeCampaigns[net.assignedCampaignId];
        if (camp) {
          camp.activeChannels = camp.activeChannels.filter(c => c !== 'BOT_NETWORK');
          camp.narrativePenetration = Math.max(0, camp.narrativePenetration - 20);
        }
      }

      draft.playerInfoWarReputation += 15;
      
      useWorldStore.getState().addGlobalEvent(`SOCIAL PLATFORM REMOVES FOREIGN INFLUENCE NETWORK — ${Math.floor(net.size/1000)}K accounts removed, ${net.targetCountryId} origin suspected`);
      
      useCinematicsStore.getState().queueScene({
        type: 'BOTNET_EXPOSED',
        payload: { networkCodename: net.codename, size: net.size, targetCountry: net.targetCountryId, attributionConfidence: 60 },
        isSkippable: true, totalPhases: 3, blocksInput: false, phaseDurationMs: 4000, autoAdvance: true
      });

      // auto trigger investigation
      draft.activeDiscoveryInvestigations.push({
        investigationId: `INV-${Date.now()}`,
        targetOpId: networkId,
        opType: 'BOT_NETWORK',
        progressPercent: 0,
        investigatingEntity: `Platform Trust & Safety + ${net.targetCountryId} cyber agency`,
        ticksUntilResolution: 8 + Math.floor(Math.random() * 8)
      });
    }));
  },

  buildNewBotNetwork: (countryId, sizeTier, operativeHandlerId) => {
    const params = {
      targetCountryId: countryId,
      size: 10000,
      sophisticationLevel: 40,
      fundingPerTick: 0.1
    };
    switch (sizeTier) {
      case 'MICRO': params.size = 10000; params.sophisticationLevel = 40; params.fundingPerTick = 0.1; break;
      case 'REGIONAL': params.size = 500000; params.sophisticationLevel = 60; params.fundingPerTick = 0.5; break;
      case 'NATIONAL': params.size = 2000000; params.sophisticationLevel = 75; params.fundingPerTick = 1.5; break;
      case 'GLOBAL': params.size = 10000000; params.sophisticationLevel = 88; params.fundingPerTick = 4; break;
    }
    
    const id = get().createBotNetwork(params);
    set(produce((draft: PsyopStoreState) => {
      draft.botNetworks[id].operativeHandlerId = operativeHandlerId;
    }));
    return id;
  },

  establishMediaCutout: (params) => {
    const id = `CUTOUT-${Date.now()}`;
    let credBonus = 0;
    if (params.appearsAs === 'ACADEMIC_JOURNAL') credBonus = 25;
    if (params.appearsAs === 'NEWS_OUTLET') credBonus = 15;
    if (params.appearsAs === 'THINK_TANK') credBonus = 20;

    const cutout: MediaCutout = {
      id,
      outletName: params.outletName,
      registrationCountry: params.registrationCountry,
      appearsAs: params.appearsAs,
      credibilityScore: params.initialFunding * 10 + credBonus,
      reachScore: params.initialFunding * 8,
      playerFingerprint: 20,
      registrationCoverStrength: 50 + 30, // assuming shell friendly
      assignedCampaignIds: [],
      isExposed: false,
      exposedTick: null,
      totalArticlesPublished: 0,
      citedByMainstreamMedia: false,
      citedByMainstreamSinceTick: null
    };

    set(produce((draft: PsyopStoreState) => {
      draft.mediaCutouts[id] = cutout;
    }));
    return id;
  },

  publishCutoutContent: (cutoutId, campaignId, contentType) => {
    set(produce((draft: PsyopStoreState) => {
      const cutout = draft.mediaCutouts[cutoutId];
      const camp = draft.narrativeCampaigns[campaignId];
      if (!cutout || !camp) return;

      switch(contentType) {
        case 'BREAKING_NEWS':
          camp.narrativePenetration += 15;
          camp.discoveryRisk += 10;
          break;
        case 'ANALYSIS_PIECE':
          cutout.credibilityScore += 8;
          camp.narrativePenetration += 8;
          break;
        case 'RESEARCH_PAPER':
          cutout.credibilityScore += 20;
          camp.narrativePenetration += 5;
          break;
      }
      
      cutout.playerFingerprint += 3;
      cutout.totalArticlesPublished++;
    }));
  },

  checkMainstreamPickup: () => {
    set(produce((draft: PsyopStoreState) => {
      const currentTick = useWorldStore.getState().currentTick;
      Object.values(draft.mediaCutouts).forEach(cutout => {
        if (cutout.isExposed || cutout.citedByMainstreamMedia) return;

        if (cutout.credibilityScore > 65 && cutout.reachScore > 50) {
           if (Math.random() < 0.05) {
             cutout.citedByMainstreamMedia = true;
             cutout.citedByMainstreamSinceTick = currentTick;
             cutout.playerFingerprint += 15;
             
             cutout.assignedCampaignIds.forEach(cid => {
                if (draft.narrativeCampaigns[cid]) {
                  draft.narrativeCampaigns[cid].beliefAdoption += 20;
                }
             });

             useCinematicsStore.getState().queueScene({
               type: 'NARRATIVE_GOES_MAINSTREAM',
               payload: { outletName: cutout.outletName, headline: 'Shocking revelations via ' + cutout.outletName, targetCountry: 'Global', beliefAdoption: 20 },
               isSkippable: true, totalPhases: 3, blocksInput: false, phaseDurationMs: 3000, autoAdvance: true
             });
           }
        }
      });
    }));
  },

  exposeCutout: (cutoutId, exposedBy) => {
    set(produce((draft: PsyopStoreState) => {
      const cutout = draft.mediaCutouts[cutoutId];
      if (!cutout) return;

      cutout.isExposed = true;
      cutout.exposedTick = useWorldStore.getState().currentTick;
      
      draft.playerInfoWarReputation += 20;
      
      useWorldStore.getState().addGlobalEvent(`${cutout.outletName} identified as foreign-funded disinformation outlet — ${cutout.registrationCountry} shell company traced`);

      useCinematicsStore.getState().queueScene({
         type: 'CUTOUT_EXPOSED',
         payload: { outletName: cutout.outletName, registrationCountry: cutout.registrationCountry, citedByMainstream: cutout.citedByMainstreamMedia },
         isSkippable: true, totalPhases: 2, blocksInput: false, phaseDurationMs: 4000, autoAdvance: true
      });
    }));
  },

  initiateKomprómatOp: (params) => {
    const id = `KOMP-${Date.now()}`;
    const fabQuality = params.isFabricated ? (Math.floor(Math.random() * 30) + 60) : 100;
    const est = params.isFabricated ? (fabQuality * 0.85) : (70 + Math.random() * 30);
    
    // Simplification for v-score
    const vscore = 70; 

    const op: KomprómatOperation = {
      id,
      codename: generateCodename(),
      targetLeaderId: params.targetLeaderId,
      targetCountryId: Object.values(useLeaderStore.getState().leadersByCountryId).find(l => l.id === params.targetLeaderId)?.countryId || 'UNKNOWN',
      komprómatType: params.komprómatType,
      phase: 'PRODUCTION',
      turnInitiated: useWorldStore.getState().currentTick,
      isFabricated: params.isFabricated,
      fabricationQuality: fabQuality,
      evidenceStrength: est,
      targetVulnerabilityScore: vscore,
      placementChannels: params.placementChannels,
      primaryOutletId: params.primaryOutletId || null,
      embeddedJournalistId: null,
      productionDiscoveryRisk: 20,
      validationDiscoveryRisk: 28,
      placementDiscoveryRisk: 35,
      detonationDiscoveryRisk: 15,
      projectedLegitimacyDamage: 25,
      projectedApprovalDrop: 15,
      internationalCondemnationRisk: params.isFabricated ? 80 : 20,
      iccReferralRisk: params.komprómatType === 'WAR_CRIMES',
      forensicTraceLevel: 10,
      debunkProbability: params.isFabricated ? (100 - fabQuality) * 0.8 : 5,
      isDebunked: false,
      debunkedTick: null,
      debunkedBy: null
    };

    set(produce((draft: PsyopStoreState) => {
      draft.komprómatOps[id] = op;
    }));
    return id;
  },

  advanceKomprómatPhase: (opId) => {
    set(produce((draft: PsyopStoreState) => {
      const op = draft.komprómatOps[opId];
      if (!op) return;

      switch(op.phase) {
        case 'PRODUCTION':
          op.phase = 'VALIDATION';
          if (op.isFabricated && op.fabricationQuality < 60) {
            op.evidenceStrength = Math.min(50, op.evidenceStrength);
          }
          break;
        case 'VALIDATION':
          op.phase = 'PLACEMENT';
          if (op.primaryOutletId && draft.mediaCutouts[op.primaryOutletId]) {
            // Target country gets intel awareness boost
          }
          break;
        case 'PLACEMENT':
          op.phase = 'DETONATION';
          const leader = Object.values(useLeaderStore.getState().leadersByCountryId).find(l => l.id === op.targetLeaderId);
          if (leader) {
             const updatedLeader = {
               ...leader,
               popularity: Math.max(0, ((leader as any).popularity || 50) - (op.projectedApprovalDrop || 0)),
               legitimacyBonus: Math.max(-50, ((leader as any).legitimacyBonus || 0) - (op.projectedLegitimacyDamage || 0))
             };
             useLeaderStore.getState().setLeader(leader.countryId, updatedLeader as any);
          }
          useWorldStore.getState().addGlobalEvent(`BREAKING: Scandal involving ${leader?.name || 'Leader'} breaks internationally.`);
          
          useCinematicsStore.getState().queueScene({
            type: 'KOMPROMAT_DETONATES',
            payload: { leaderName: leader?.name || 'Target', komprómatType: op.komprómatType, evidenceStrength: Math.floor(op.evidenceStrength), isFabricated: op.isFabricated },
             isSkippable: true, totalPhases: 4, blocksInput: false, phaseDurationMs: 3000, autoAdvance: true
          });
          break;
        case 'DETONATION':
          op.phase = 'AFTERMATH';
          break;
      }
    }));
  },

  tickKomprómatDebunk: () => {
    set(produce((draft: PsyopStoreState) => {
      const currentTick = useWorldStore.getState().currentTick;
      Object.values(draft.komprómatOps).forEach(op => {
        if ((op.phase === 'DETONATION' || op.phase === 'AFTERMATH') && !op.isDebunked) {
          if (op.komprómatType === 'DEEPFAKE_VIDEO') op.debunkProbability += 3;
          // check media freedom
          
          if (Math.random() * 100 < op.debunkProbability) {
            op.isDebunked = true;
            op.debunkedTick = currentTick;
            op.debunkedBy = "International OSINT Consortium";
            
            if (op.isFabricated) {
               draft.playerInfoWarReputation += 35;
               useCinematicsStore.getState().queueScene({
                  type: 'DEEPFAKE_DEBUNKED',
                  payload: { komprómatType: op.komprómatType, debunkedBy: op.debunkedBy, playerAttributionLevel: op.forensicTraceLevel },
                   isSkippable: true, totalPhases: 3, blocksInput: false, phaseDurationMs: 4000, autoAdvance: true
               });
            }
            // Add blowback
          }
        }
      });
    }));
  },

  generatePublicOpinionPoll: (countryId) => {
    set(produce((draft: PsyopStoreState) => {
      const currentTick = useWorldStore.getState().currentTick;
      const leader = useLeaderStore.getState().getLeader(countryId) as any;
      const economy = useWorldStore.getState().world.countriesById[countryId]?.economy;
      
      let approval = leader ? (leader.popularity || 50) + (leader.legitimacyBonus || 0)*0.6 : 50;
      if (economy) approval += economy.growthRate * 8;
      
      let peaceEffect = 0;
      let totalNegativeBelief = 0;
      
      const beliefScores: Record<string, number> = {};
      
      Object.values(draft.narrativeCampaigns).filter(c => c.targetCountryId === countryId && c.phase !== 'DORMANT' && c.phase !== 'BURNED').forEach(c => {
         beliefScores[c.id] = c.beliefAdoption;
         if (c.theme === 'REGIME_CORRUPTION') approval -= c.beliefAdoption * 0.35;
         if (c.theme === 'DEMOCRATIC_LEGITIMACY') approval -= c.beliefAdoption * 0.40;
         if (c.theme === 'MILITARY_GLORIFICATION') approval += c.beliefAdoption * 0.25;
         if (c.theme === 'PEACE_NARRATIVE') peaceEffect += c.beliefAdoption;
      });

      approval = Math.max(0, Math.min(100, approval));
      
      const poll: PublicOpinionPoll = {
        id: `POLL-${Date.now()}`,
        countryId,
        tick: currentTick,
        leaderApprovalRating: approval,
        leaderApprovalTrend: 0,
        governmentTrustScore: approval * 0.9,
        foreignPolicyApproval: 50,
        warSupportIndex: Math.max(0, approval * 0.4 - peaceEffect * 0.5),
        economicOptimism: 50,
        nationalPrideScore: 60,
        activeNarrativeBeliefScores: beliefScores,
        socialCohesionIndex: 50,
        polarizationIndex: 50 + (Object.keys(beliefScores).length * 3),
        protestLikelihood: approval < 40 ? 40 : 10,
        coupLikelihood: approval < 25 ? 30 : 0,
        pollConfidence: 80,
        isManipulatedPoll: false
      };
      
      draft.publicOpinionData[countryId] = poll;
      get().storePollHistory(countryId, poll);
    }));
  },

  storePollHistory: (countryId, poll) => {
    set(produce((draft: PsyopStoreState) => {
      if (!draft.pollHistory[countryId]) draft.pollHistory[countryId] = [];
      
      const history = draft.pollHistory[countryId];
      if (history.length > 0) {
         poll.leaderApprovalTrend = poll.leaderApprovalRating - history[history.length - 1].leaderApprovalRating;
      }
      history.push(poll);
      if (history.length > 10) history.shift();
      
      if (poll.leaderApprovalTrend < -10) {
        useWorldStore.getState().addGlobalEvent(`Approval freefall: Leader approval drops ${Math.abs(Math.floor(poll.leaderApprovalTrend))} points in ${countryId}`);
      }
      
      if (poll.leaderApprovalRating < 20) {
        useDefconStore.getState().setDefconLevel(3, 'SYSTEM', `Leader of ${countryId} losing control`, useWorldStore.getState().currentTick);
      }
    }));
  },

  manipulatePollSource: (countryId, targetMetric, manipulationAmount) => {
    set(produce((draft: PsyopStoreState) => {
       const p = draft.publicOpinionData[countryId];
       if (p) {
         p.isManipulatedPoll = true;
         if (targetMetric === 'approval') p.leaderApprovalRating += manipulationAmount;
       }
    }));
  },

  triggerDiscoveryInvestigation: (opId, opType) => {
    set(produce((draft: PsyopStoreState) => {
      draft.activeDiscoveryInvestigations.push({
        investigationId: `INV-${Date.now()}-${Math.random()}`,
        targetOpId: opId,
        opType,
        progressPercent: 0,
        investigatingEntity: opType === 'KOMPROMAT' ? 'ICIJ' : 'EU DisinfoLab',
        ticksUntilResolution: 8 + Math.floor(Math.random() * 8)
      });
    }));
  },

  tickInvestigations: () => {
    set(produce((draft: PsyopStoreState) => {
      draft.activeDiscoveryInvestigations.forEach(inv => {
        let fingerprint = 30; // default
        if (inv.opType === 'NARRATIVE' && draft.narrativeCampaigns[inv.targetOpId]) fingerprint = draft.narrativeCampaigns[inv.targetOpId].playerFingerprint;
        
        inv.progressPercent += (0.8 * 10) + (fingerprint * 0.3); // simplified
        
        if (inv.progressPercent >= 100) {
           get().exposeOperation(inv.targetOpId, inv.opType);
           inv.ticksUntilResolution = 0; // mark done
        }
      });
      // Filter out completed ones
      draft.activeDiscoveryInvestigations = draft.activeDiscoveryInvestigations.filter(i => i.progressPercent < 100);
    }));
  },

  playerCounterInvestigation: (investigationId, method) => {
    set(produce((draft: PsyopStoreState) => {
      const inv = draft.activeDiscoveryInvestigations.find(i => i.investigationId === investigationId);
      if (inv) {
         switch(method) {
           case 'LEGAL_THREAT':
             inv.ticksUntilResolution += 4;
             draft.playerInfoWarReputation += 5;
             break;
           case 'COUNTER_DISINFO':
             inv.progressPercent = Math.max(0, inv.progressPercent - 15);
             break;
           case 'EVIDENCE_DESTRUCTION':
             inv.progressPercent = Math.max(0, inv.progressPercent - 30);
             break;
         }
      }
    }));
  },

  exposeOperation: (opId, opType) => {
     set(produce((draft: PsyopStoreState) => {
        draft.playerInfoWarReputation += 25;
        useCinematicsStore.getState().queueScene({
           type: 'PSYOP_EXPOSED',
           payload: { opType, investigatingEntity: 'Independent Researchers', fingerprint: 80, severity: 'HIGH' },
            isSkippable: true, totalPhases: 3, blocksInput: false, phaseDurationMs: 4000, autoAdvance: true
        });
        
        if (opType === 'NARRATIVE') {
          const camp = draft.narrativeCampaigns[opId];
          if (camp) camp.phase = 'BURNED';
        } else if (opType === 'KOMPROMAT') {
          const op = draft.komprómatOps[opId];
          if (op) { op.isDebunked = true; op.phase = 'BLOWN'; }
        }
     }));
  },

  tickPSYOP: () => {
    get().tickNarrativeCampaigns();
    get().tickBotNetworks();
    get().checkMainstreamPickup();
    get().tickKomprómatDebunk();
    get().tickInvestigations();
    
    const currentTick = useWorldStore.getState().currentTick;
    
    set(produce((draft: PsyopStoreState) => {
        draft.globalDisinfoIndex += (Object.keys(draft.narrativeCampaigns).length * 0.5) + (Object.keys(draft.botNetworks).length * 0.3) - 1;
        draft.globalDisinfoIndex = Math.max(0, Math.min(100, draft.globalDisinfoIndex));
        
        Object.values(useWorldStore.getState().world.countriesById).forEach(c => {
           if (currentTick % 3 === 0) {
             get().generatePublicOpinionPoll(c.id);
           }
        });
    }));
  },

  resetPsyopStore: () => set({
    narrativeCampaigns: {},
    botNetworks: {},
    mediaCutouts: {},
    komprómatOps: {},
    publicOpinionData: {},
    pollHistory: {},
    globalDisinfoIndex: 0,
    playerInfoWarReputation: 0,
    counterNarrativeResistance: {},
    activeDiscoveryInvestigations: [],
    completedCampaigns: []
  })
}));
