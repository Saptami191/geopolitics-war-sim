import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  RegimePressureState, 
  RegimePressureOp, 
  RegimePressurePhase, 
  RegimePressureOutcome, 
  EliteFaction, 
  ProtestCampaign, 
  CoupOperation, 
  ElectionOp,
  ElectionInterferenceMethod,
  OppositionAsset, 
  BlowbackMemoryEntry,
  BlowbackSeverity
} from '../types';
import { useWorldStore } from './worldStore';
import { useNationIdentityStore } from './nationIdentityStore';
import { useDefconStore } from './defconStore';
import { useCinematicsStore } from './cinematicsStore';
import { useLeaderStore } from './leaderStore';
import { useLeaderMemoryStore } from './leaderMemoryStore';
import { useUNStore } from './unStore';
import { useBlocStore } from './blocStore';
import { useMirrorStore } from './mirrorStore';
import { usePlayerStore } from './playerStore';

const OP_ADJECTIVES = ['SILENT', 'IRON', 'CRIMSON', 'MIDNIGHT', 'SHATTERED', 'GOLDEN', 'RUSTED', 'HOLLOW', 'BROKEN', 'FRACTURED', 'VEILED', 'HIDDEN', 'WHISPERING', 'OBSIDIAN', 'GHOST', 'PHANTOM', 'COBALT', 'EMBER', 'FROST', 'ECHO'];
const OP_NOUNS = ['WEDGE', 'THUNDER', 'ACCORD', 'DAGGER', 'SHIELD', 'SPEAR', 'SUN', 'RAVEN', 'WOLF', 'VIPER', 'CROWN', 'THRONE', 'SKEPTRE', 'WINTER', 'SUMMER', 'DAWN', 'DUSK', 'SAND', 'STORM', 'GLASS'];

function generateCodename(): string {
  const adj = OP_ADJECTIVES[Math.floor(Math.random() * OP_ADJECTIVES.length)];
  const noun = OP_NOUNS[Math.floor(Math.random() * OP_NOUNS.length)];
  return `${adj} ${noun}`;
}

export interface RegimePressureStoreActions {
  // Protest Engineering
  launchProtestCampaign: (countryId: string, grievanceIssue: string, initialFunding: number) => void;
  escalateProtest: (campaignId: string, fundingIncrease: number) => void;
  suppressionResponse: (campaignId: string) => void;
  concludeProtestCampaign: (campaignId: string) => void;

  // Coup Architecture
  initiateCoupPlanning: (targetCountryId: string, targetLeaderId: string) => EliteFaction[];
  recruitCoupFaction: (coupId: string, factionId: string, fundingOffer: number) => void;
  designateCoupWindow: (coupId: string, executionTick: number) => void;
  executeCoup: (coupId: string) => void;
  
  // Election Interference
  planElectionOp: (countryId: string, electionTick: number, targetCandidateId: string, oppositionCandidateId: string) => void;
  addElectionMethod: (electionOpId: string, method: ElectionInterferenceMethod, funding: number) => void;
  resolveElection: (electionOpId: string) => void;

  // Opposition Funding
  establishOppositionAsset: (countryId: string, assetName: string, assetType: 'POLITICAL_PARTY' | 'MEDIA_OUTLET' | 'CIVIL_SOCIETY_ORG' | 'EXILE_NETWORK', initialFunding: number) => void;
  fundOppositionAsset: (assetId: string, additionalFunding: number) => void;
  regimeCounterOp: (assetId: string) => void;

  // Elite Split Modeling
  initializeEliteFactions: (countryId: string) => void;
  openEliteBackchannel: (countryId: string, factionId: string, operativeId: string) => void;
  cultivateEliteSplit: (countryId: string, targetFactionId: string, investmentAmount: number) => void;

  // Targeted Removal
  initiateTargetedRemoval: (targetLeaderId: string, removalMethod: 'POLITICAL_EXILE' | 'LEGAL_PERSECUTION' | 'ECONOMIC_ISOLATION' | 'REPUTATION_DESTRUCTION' | 'PHYSICAL_REMOVAL') => void;
  advanceRemovalPhase: (opId: string) => void; // Uses completedOps array for tracking right now, simplified

  // Blowback Memory Engine
  recordBlowback: (params: Partial<BlowbackMemoryEntry>) => void;
  tickBlowback: () => void;
  playerRespondToBlowback: (blowbackId: string, responseType: 'DENY' | 'ACKNOWLEDGE' | 'BLAME_THIRD_PARTY' | 'OFFER_INVESTIGATION') => void;

  // Sim Tick Integration
  tickRegimePressure: () => void;
}

export const useRegimePressureStore = create<RegimePressureState & RegimePressureStoreActions>()(
  persist(
    (set, get) => ({
      activeProtestCampaigns: {},
      activeCoupOps: {},
      activeElectionOps: {},
      activeOppositionAssets: {},
      eliteFactions: {},
      blowbackLog: [],
      activeBlowbackCrises: [],
      playerExposureScore: 0,
      currentlyTargetedCountries: [],
      completedOps: [],

      launchProtestCampaign: (countryId, grievanceIssue, initialFunding) => set((state) => {
        const id = `PROTEST-${Date.now()}`;
        const currentTick = useWorldStore.getState().currentTick;
        const identity = useNationIdentityStore.getState().nationIdentities[countryId];
        const popularity = identity ? (identity.leaderVolatility || 50) : 50; // Just use volatility as inverted popularity or arbitrary base
        
        const initialIntensity = Math.min(100, Math.max(0, 100 - popularity + initialFunding * 5));
        const detectionRisk = Math.min(60, 15 + (initialFunding * 0.8));

        useWorldStore.getState().addGlobalEvent(`Unrest spreading in ${countryId}...`);

        return {
          activeProtestCampaigns: {
            ...state.activeProtestCampaigns,
            [id]: {
              id,
              countryId,
              turnLaunched: currentTick,
              phase: 'PLANNING',
              currentIntensity: initialIntensity,
              grievanceIssue,
              playerFunded: true,
              playerFundingAmount: initialFunding,
              detectionRisk,
              playerFingerprint: 10,
              suppressionStrength: 0,
              internationalCoverage: 0,
              casualtyCount: 0,
              turnsSinceLastEscalation: 0
            }
          },
          currentlyTargetedCountries: Array.from(new Set([...state.currentlyTargetedCountries, countryId]))
        };
      }),

      escalateProtest: (campaignId, fundingIncrease) => set((state) => {
        const campaign = state.activeProtestCampaigns[campaignId];
        if (!campaign) return state;

        let intensity = campaign.currentIntensity + (fundingIncrease * 1.4) - (campaign.suppressionStrength * 0.6);
        intensity = Math.min(100, Math.max(0, intensity));
        let detectionRisk = campaign.detectionRisk + 12;
        let fingerprint = campaign.playerFingerprint + 8;

        if (intensity > 75) {
          const world = useWorldStore.getState().world;
          if (world.countriesById[campaign.countryId]?.military.nuclearStatus) {
            useDefconStore.getState().setDefconLevel(3, 'SYSTEM', 'Internal Crisis in Nuclear State', useWorldStore.getState().currentTick);
          }
        }

        if (campaign.suppressionStrength > 80 && campaign.casualtyCount > 50) {
          useCinematicsStore.getState().queueScene({
            type: 'CIVILIAN_CASUALTY_EVENT',
            payload: { countryId: campaign.countryId },
            isSkippable: true,
            totalPhases: 1,
            blocksInput: false,
            phaseDurationMs: 4000,
            autoAdvance: true,
          });
        }

        return {
          activeProtestCampaigns: {
            ...state.activeProtestCampaigns,
            [campaignId]: {
              ...campaign,
              phase: 'EXECUTION',
              currentIntensity: intensity,
              detectionRisk,
              playerFingerprint: fingerprint,
              playerFundingAmount: campaign.playerFundingAmount + fundingIncrease,
              turnsSinceLastEscalation: 0
            }
          }
        };
      }),

      suppressionResponse: (campaignId) => set((state) => {
        const campaign = state.activeProtestCampaigns[campaignId];
        if (!campaign) return state;

        const identity = useNationIdentityStore.getState().nationIdentities[campaign.countryId];
        const securityDoctrine = identity?.securityDoctrine || 50;
        
        let suppressionStrength = campaign.suppressionStrength + (securityDoctrine * 0.3);
        suppressionStrength = Math.min(100, suppressionStrength);
        
        let casualties = campaign.casualtyCount + Math.floor(suppressionStrength * 0.15 * Math.random());
        let coverage = campaign.internationalCoverage;

        if (suppressionStrength > 85) {
          coverage = Math.min(100, coverage + 25);
        }

        if (coverage > 80 && casualties > 100) {
          // Trigger UN Event
           useWorldStore.getState().addGlobalEvent(`UN Emergency Session called over civilian casualties in ${campaign.countryId}`);
        }

        return {
          activeProtestCampaigns: {
            ...state.activeProtestCampaigns,
            [campaignId]: {
              ...campaign,
              suppressionStrength,
              casualtyCount: casualties,
              internationalCoverage: coverage,
              turnsSinceLastEscalation: campaign.turnsSinceLastEscalation + 1
            }
          }
        };
      }),

      concludeProtestCampaign: (campaignId) => set((state) => {
        const campaign = state.activeProtestCampaigns[campaignId];
        if (!campaign) return state;

        const draftCampaign = { ...campaign };
        let outcome: RegimePressureOutcome = 'PARTIAL_SUCCESS';
        let blowbackId = null;

        if (campaign.currentIntensity > campaign.suppressionStrength + 20) {
          const world = useWorldStore.getState().world;
          if (world.countriesById[campaign.countryId]) {
              const country = world.countriesById[campaign.countryId];
              country.publicSentiment = Math.max(0, country.publicSentiment - Math.floor(15 + Math.random() * 15));
          }
          outcome = 'REGIME_COLLAPSED'; // Can be partial
        }

        let newPhase: RegimePressurePhase = 'COMPLETE';

        if (campaign.playerFingerprint > 65 && Math.random() * 100 < campaign.detectionRisk) {
          newPhase = 'BLOWN';
          outcome = 'BLOWBACK_TRIGGERED';
          
          blowbackId = `BB-${Date.now()}`;
          get().recordBlowback({
            id: blowbackId,
            opType: 'PROTEST_ENGINEERING',
            targetCountryId: campaign.countryId,
            severity: 'PROOF',
            opName: generateCodename()
          });
        }

        const newOps = { ...state.activeProtestCampaigns };
        delete newOps[campaignId];

        return {
          activeProtestCampaigns: newOps,
          completedOps: [...state.completedOps, {
            opId: campaignId,
            opType: 'PROTEST_ENGINEERING',
            targetCountryId: campaign.countryId,
            outcome,
            tick: useWorldStore.getState().currentTick,
            blowbackId
          }]
        };
      }),

      initiateCoupPlanning: (targetCountryId, targetLeaderId) => {
        const factions = get().eliteFactions[targetCountryId] || [];
        get().initializeEliteFactions(targetCountryId); // Ensure initialized
        
        const candidateFactions = get().eliteFactions[targetCountryId].filter(f => f.loyaltyToLeader < 50);
        candidateFactions.sort((a, b) => b.corruptibilityScore - a.corruptibilityScore);
        
        const id = `COUP-${Date.now()}`;
        set((state) => ({
          activeCoupOps: {
            ...state.activeCoupOps,
            [id]: {
              id,
              targetCountryId,
              targetLeaderId,
              turnPlanned: useWorldStore.getState().currentTick,
              phase: 'PLANNING',
              conspiratorFactionIds: [],
              requiredPowerShareForSuccess: 40,
              currentDetectionRisk: 10,
              operativeIds: [],
              executionWindowTick: null,
              hasPlayerDeniability: true,
              fundingCommitted: 0,
              militaryCommitted: false,
              alternateLeaderDesignated: null
            }
          },
          currentlyTargetedCountries: Array.from(new Set([...state.currentlyTargetedCountries, targetCountryId]))
        }));
        
        return get().eliteFactions[targetCountryId].filter(f => f.loyaltyToLeader < 50).sort((a, b) => b.corruptibilityScore - a.corruptibilityScore);
      },

      recruitCoupFaction: (coupId, factionId, fundingOffer) => set((state) => {
        const coup = state.activeCoupOps[coupId];
        if (!coup) return state;

        const allFactions = state.eliteFactions[coup.targetCountryId] || [];
        const faction = allFactions.find(f => f.id === factionId);
        
        if (!faction) return state;

        let joined = false;
        let militaryCommitted = coup.militaryCommitted;
        let deniability = coup.hasPlayerDeniability;

        if (fundingOffer > faction.corruptibilityScore * 1.5) {
          joined = true;
          if (faction.name.includes('Military') || faction.name.includes('Armed')) {
            militaryCommitted = true;
            deniability = false;
          }
        }

        const newFactions = allFactions.map(f => {
          if (f.id === factionId) {
            return {
              ...f,
              loyaltyToLeader: Math.max(0, f.loyaltyToLeader - (fundingOffer * 0.4))
            };
          }
          return f;
        });

        return {
          eliteFactions: {
            ...state.eliteFactions,
            [coup.targetCountryId]: newFactions
          },
          activeCoupOps: {
            ...state.activeCoupOps,
            [coupId]: {
              ...coup,
              conspiratorFactionIds: joined ? [...coup.conspiratorFactionIds, factionId] : coup.conspiratorFactionIds,
              currentDetectionRisk: coup.currentDetectionRisk + 8,
              militaryCommitted,
              hasPlayerDeniability: deniability,
              fundingCommitted: coup.fundingCommitted + fundingOffer
            }
          }
        };
      }),

      designateCoupWindow: (coupId, executionTick) => set((state) => {
        const coup = state.activeCoupOps[coupId];
        if (!coup) return state;
        return {
          activeCoupOps: {
            ...state.activeCoupOps,
            [coupId]: {
              ...coup,
              executionWindowTick: executionTick,
              phase: 'PREPARATION'
            }
          }
        };
      }),

      executeCoup: (coupId) => set((state) => {
        const coup = state.activeCoupOps[coupId];
        if (!coup) return state;

        const allFactions = state.eliteFactions[coup.targetCountryId] || [];
        let totalPowerShare = 0;
        coup.conspiratorFactionIds.forEach(id => {
          const f = allFactions.find(fx => fx.id === id);
          if (f) totalPowerShare += f.powerShare;
        });

        let successProbability = totalPowerShare / 100;
        if (coup.militaryCommitted) successProbability += 0.15;
        if (coup.fundingCommitted > 2) successProbability += 0.10;
        if (!coup.hasPlayerDeniability) successProbability -= 0.20;
        if (coup.currentDetectionRisk > 60) successProbability -= 0.15;

        // Perform standard coup execution logic natively
        let outcome: RegimePressureOutcome;
        let blowbackId = null;

        if (Math.random() < successProbability) {
           // COUP SUCCEEDS
           outcome = 'COUP_SUCCEEDED';
           useCinematicsStore.getState().queueScene({
             type: 'COUP_EXECUTED',
             payload: { countryId: coup.targetCountryId },
             isSkippable: true,
             totalPhases: 1,
             blocksInput: false,
             phaseDurationMs: 4000,
             autoAdvance: true
           });
           
           if (!coup.hasPlayerDeniability) {
             blowbackId = `BB-COUP-${Date.now()}`;
             get().recordBlowback({
                id: blowbackId,
                severity: 'ACCUSATION',
                opType: 'COUP_ARCHITECTURE',
                targetCountryId: coup.targetCountryId,
                targetLeaderId: coup.targetLeaderId,
                opName: generateCodename()
             });
           }
           
           // Nuke Check
           const world = useWorldStore.getState().world;
           if (world.countriesById[coup.targetCountryId]?.military.nuclearStatus) {
             useDefconStore.getState().setDefconLevel(2, 'SYSTEM', 'Coup inside nuclear armed state', useWorldStore.getState().currentTick);
           }

        } else {
           // COUP FAILS
           outcome = 'COUP_FAILED';
           useCinematicsStore.getState().queueScene({
             type: 'COUP_FAILED',
             payload: { countryId: coup.targetCountryId },
             isSkippable: true,
             totalPhases: 1,
             blocksInput: false,
             phaseDurationMs: 4000,
             autoAdvance: true
           });

           // Target Leader Paranoia Spike
           useLeaderMemoryStore.getState().addMemory({
             nationId: coup.targetCountryId,
             tick: useWorldStore.getState().currentTick,
             type: 'HOSTILE_COVERT_OP',
             description: 'Failed coup attempt linked to your nation',
             playerInitiated: true,
             emotionalImpact: { paranoiaSpike: 40, anger: 50 },
             resentmentDelta: 50,
             trustDelta: -50
           });

           blowbackId = `BB-COUP-FAIL-${Date.now()}`;
           get().recordBlowback({
             id: blowbackId,
             severity: 'PROOF',
             opType: 'COUP_ARCHITECTURE',
             targetCountryId: coup.targetCountryId,
             targetLeaderId: coup.targetLeaderId,
             opName: generateCodename()
           });
           
           // Arrest conspirators
           const newFactions = state.eliteFactions[coup.targetCountryId].filter(f => !coup.conspiratorFactionIds.includes(f.id));
           state.eliteFactions[coup.targetCountryId] = newFactions;
        }

        const newOps = { ...state.activeCoupOps };
        delete newOps[coupId];

        return {
          activeCoupOps: newOps,
          eliteFactions: { ...state.eliteFactions },
          completedOps: [...state.completedOps, {
            opId: coupId,
            opType: 'COUP_ARCHITECTURE',
            targetCountryId: coup.targetCountryId,
            outcome,
            tick: useWorldStore.getState().currentTick,
            blowbackId
          }]
        };
      }),

      planElectionOp: (countryId, electionTick, targetCandidateId, oppositionCandidateId) => set((state) => {
        const identity = useNationIdentityStore.getState().nationIdentities[countryId];
        const observers = identity ? (identity.ideologyIndex > 60) : false;
        
        const id = `ELECTION-${Date.now()}`;
        return {
          activeElectionOps: {
            ...state.activeElectionOps,
            [id]: {
              id,
              countryId,
              electionTick,
              phase: 'PLANNING',
              targetCandidateId,
              oppositionCandidateId,
              methods: [],
              fundingDeployed: 0,
              disinfoIntensity: 0,
              voteSuppressionActive: false,
              electoralSystemHacked: false,
              detectionRisk: observers ? 30 : 10,
              projectedMarginShift: 0,
              internationalObserversPresent: observers
            }
          },
          currentlyTargetedCountries: Array.from(new Set([...state.currentlyTargetedCountries, countryId]))
        };
      }),

      addElectionMethod: (electionOpId, method, funding) => set((state) => {
        const op = state.activeElectionOps[electionOpId];
        if (!op) return state;

        let marginShift = 0;
        let risk = 0;
        let disinfo = 0;
        let hacked = false;
        let fingerprint = 0;

        switch (method) {
          case 'DARK_MONEY_FUNDING': marginShift = funding * 1.2; risk = 5; fingerprint = 5; break;
          case 'DISINFORMATION_CAMPAIGN': disinfo = 25; marginShift = 8; risk = 10; break;
          case 'ELECTORAL_SYSTEM_HACK': hacked = true; marginShift = 15; risk = 25; break;
          case 'MEDIA_CAPTURE': disinfo = 15; marginShift = 10; risk = 8; break;
          case 'CANDIDATE_BLACKMAIL': marginShift = 20; risk = 20; fingerprint = 15; break;
          case 'VOTER_INTIMIDATION': marginShift = 12; risk = 15; fingerprint = 10; break;
          case 'OPPOSITION_SUPPRESSION': marginShift = 10; risk = 15; break;
        }

        return {
          activeElectionOps: {
            ...state.activeElectionOps,
            [electionOpId]: {
              ...op,
              methods: [...op.methods, method],
              fundingDeployed: op.fundingDeployed + funding,
              projectedMarginShift: op.projectedMarginShift + marginShift,
              detectionRisk: op.detectionRisk + risk,
              disinfoIntensity: op.disinfoIntensity + disinfo,
              electoralSystemHacked: op.electoralSystemHacked || hacked,
              phase: 'EXECUTION'
            }
          }
        };
      }),

      resolveElection: (electionOpId) => set((state) => {
        const op = state.activeElectionOps[electionOpId];
        if (!op) return state;

        let blowbackId = null;
        let severity: BlowbackSeverity = 'WHISPER';
        
        if (Math.random() * 100 < op.detectionRisk) {
          severity = 'ACCUSATION';
          if (op.electoralSystemHacked) {
             severity = 'PROOF';
             useWorldStore.getState().addGlobalEvent(`UN Emergency Session triggered by exposed cyber attacks on ${op.countryId} electoral systems`);
          }
          blowbackId = `BB-ELECT-${Date.now()}`;
          get().recordBlowback({
            id: blowbackId,
            severity,
            opType: 'ELECTION_INTERFERENCE',
            targetCountryId: op.countryId,
            targetLeaderId: op.targetCandidateId,
            opName: generateCodename()
          });
        }

        useCinematicsStore.getState().queueScene({
          type: 'ELECTION_STOLEN',
          payload: { countryId: op.countryId },
          isSkippable: true,
          totalPhases: 1,
          blocksInput: false,
          phaseDurationMs: 4000,
          autoAdvance: true
        });

        const newOps = { ...state.activeElectionOps };
        delete newOps[electionOpId];

        return {
          activeElectionOps: newOps,
          completedOps: [...state.completedOps, {
            opId: electionOpId,
            opType: 'ELECTION_INTERFERENCE',
            targetCountryId: op.countryId,
            outcome: 'ELECTION_STOLEN',
            tick: useWorldStore.getState().currentTick,
            blowbackId
          }]
        };
      }),

      establishOppositionAsset: (countryId, assetName, assetType, initialFunding) => set((state) => {
        const id = `ASSET-${Date.now()}`;
        return {
          activeOppositionAssets: {
            ...state.activeOppositionAssets,
            [id]: {
              id,
              countryId,
              assetName,
              assetType,
              turnEstablished: useWorldStore.getState().currentTick,
              fundingReceived: initialFunding,
              capacityScore: Math.min(60, initialFunding * 8),
              publicProfile: assetType === 'MEDIA_OUTLET' ? 40 : 20,
              playerFingerprint: 15,
              regimeSuspicion: 0,
              isCompromised: false,
              compromisedSinceTick: null,
              operativeHandlerId: null
            }
          },
          currentlyTargetedCountries: Array.from(new Set([...state.currentlyTargetedCountries, countryId]))
        };
      }),

      fundOppositionAsset: (assetId, additionalFunding) => set((state) => {
        const asset = state.activeOppositionAssets[assetId];
        if (!asset) return state;

        return {
          activeOppositionAssets: {
            ...state.activeOppositionAssets,
            [assetId]: {
              ...asset,
              fundingReceived: asset.fundingReceived + additionalFunding,
              capacityScore: Math.min(100, asset.capacityScore + additionalFunding * 6),
              playerFingerprint: Math.min(100, asset.playerFingerprint + 4),
              regimeSuspicion: Math.min(100, asset.regimeSuspicion + 8)
            }
          }
        };
      }),

      regimeCounterOp: (assetId) => set((state) => {
        const asset = state.activeOppositionAssets[assetId];
        if (!asset || asset.isCompromised) return state;

        if (Math.random() < (asset.regimeSuspicion / 100) * 0.6) {
          useLeaderMemoryStore.getState().addMemory({
            nationId: asset.countryId,
            tick: useWorldStore.getState().currentTick,
            type: 'HOSTILE_COVERT_OP',
            description: `Foreign-backed opposition network operating in ${asset.countryId}`,
            playerInitiated: true,
            emotionalImpact: { anger: 20, paranoiaSpike: 15 },
            resentmentDelta: 15,
            trustDelta: -10
          });
          
          return {
            activeOppositionAssets: {
              ...state.activeOppositionAssets,
              [assetId]: {
                ...asset,
                isCompromised: true,
                compromisedSinceTick: useWorldStore.getState().currentTick
              }
            }
          };
        }
        return state;
      }),

      initializeEliteFactions: (countryId) => set((state) => {
        if (state.eliteFactions[countryId]) return state; // Already init

        const identity = useNationIdentityStore.getState().nationIdentities[countryId];
        const doctrine = identity?.securityDoctrine || 50;
        const economy = identity?.economicModel || 50;
        const ideology = identity?.ideologyIndex || 50;

        const factions: EliteFaction[] = [];

        if (doctrine > 60) {
          factions.push({ id: `F-MIL-${countryId}`, name: 'Military Hardliners', countryId, powerShare: 40, loyaltyToLeader: 80, corruptibilityScore: 30, grievanceLevel: 10, playerContactEstablished: false, contactOperativeId: null, defectionThreshold: 30, publiclyVisible: true });
        }
        if (ideology < 30) {
          factions.push({ id: `F-REL-${countryId}`, name: 'Religious Council', countryId, powerShare: 35, loyaltyToLeader: 70, corruptibilityScore: 20, grievanceLevel: 25, playerContactEstablished: false, contactOperativeId: null, defectionThreshold: 20, publiclyVisible: true });
        }
        if (economy > 50) {
          factions.push({ id: `F-OLI-${countryId}`, name: 'Business Oligarchs', countryId, powerShare: 20, loyaltyToLeader: 50, corruptibilityScore: 80, grievanceLevel: 40, playerContactEstablished: false, contactOperativeId: null, defectionThreshold: 45, publiclyVisible: true });
        }

        // Fill remaining
        factions.push({ id: `F-BUR-${countryId}`, name: 'State Bureaucracy', countryId, powerShare: 5, loyaltyToLeader: 60, corruptibilityScore: 50, grievanceLevel: 30, playerContactEstablished: false, contactOperativeId: null, defectionThreshold: 40, publiclyVisible: true });

        return {
          eliteFactions: {
            ...state.eliteFactions,
            [countryId]: factions
          }
        };
      }),

      openEliteBackchannel: (countryId, factionId, operativeId) => set((state) => {
         // Logic for backchannel success
         const identity = useNationIdentityStore.getState().nationIdentities[countryId];
         const risk = 20 + ((identity?.securityDoctrine || 50) * 0.3);

         if (Math.random() * 100 < risk) {
            // Blown
            get().recordBlowback({
              id: `BB-ELITE-${Date.now()}`,
              severity: 'WHISPER',
              opType: 'ELITE_SPLIT_OPERATION',
              targetCountryId: countryId,
              opName: generateCodename()
            });
            return state;
         }

         const factions = state.eliteFactions[countryId]?.map(f => {
           if (f.id === factionId) {
              return { ...f, playerContactEstablished: true, contactOperativeId: operativeId };
           }
           return f;
         }) || [];

         return {
           eliteFactions: { ...state.eliteFactions, [countryId]: factions }
         };
      }),

      cultivateEliteSplit: (countryId, targetFactionId, investmentAmount) => set((state) => {
         let leaderAffected = false;
         let factionPower = 0;
         const factions = state.eliteFactions[countryId]?.map(f => {
           if (f.id === targetFactionId) {
              const gl = Math.min(100, f.grievanceLevel + investmentAmount * 2);
              const ll = Math.max(0, f.loyaltyToLeader - investmentAmount * 1.5);
              if (ll < f.defectionThreshold) {
                 leaderAffected = true;
                 factionPower = f.powerShare;
              }
              return { ...f, grievanceLevel: gl, loyaltyToLeader: ll };
           }
           return f;
         }) || [];

         if (leaderAffected) {
            useWorldStore.getState().addGlobalEvent(`Elite faction defection in ${countryId}. Regime severely weakened.`);
         }

         useLeaderMemoryStore.getState().addMemory({
            nationId: countryId,
            tick: useWorldStore.getState().currentTick,
            type: 'HOSTILE_COVERT_OP',
            description: `Signs of foreign meddling in internal elite politics`,
            playerInitiated: true,
            emotionalImpact: { paranoiaSpike: 5 },
            resentmentDelta: 5,
            trustDelta: -5
         });

         return {
           eliteFactions: { ...state.eliteFactions, [countryId]: factions }
         };
      }),

      initiateTargetedRemoval: (targetLeaderId, removalMethod) => set((state) => {
         return state; // Basic stub for complex workflow 
      }),

      advanceRemovalPhase: (opId) => set((state) => {
         return state; 
      }),

      recordBlowback: (params) => set((state) => {
         const entry: BlowbackMemoryEntry = {
            id: params.id || `BB-${Date.now()}`,
            opType: params.opType!,
            targetCountryId: params.targetCountryId!,
            targetLeaderId: params.targetLeaderId || null,
            tickOccurred: useWorldStore.getState().currentTick,
            severity: params.severity || 'RUMOR',
            isPubliclyKnown: params.severity === 'RUMOR' ? false : true,
            isAttributedToPlayer: true,
            playerCountryId: usePlayerStore.getState().countryId || 'US',
            opName: params.opName || 'CLASSIFIED NO NAME',
            diplomaticDamage: {}, // calculate via blocs
            sanctionsThreat: params.severity === 'PROOF' || params.severity === 'CRISIS' ? true : false,
            iccReferralRisk: params.severity === 'CRISIS' ? true : false,
            affectedAlliances: [],
            mediaStormActive: params.severity === 'PROOF' || params.severity === 'CRISIS',
            mediaStormTicksRemaining: 15,
            worldReactionText: `International outrage forming around operation ${params.opName || 'UNKNOWN'}`,
            hasBeenAddressedByPlayer: false
         };

         let newActiveCrises = state.activeBlowbackCrises;
         if (entry.severity === 'ACCUSATION' || entry.severity === 'PROOF' || entry.severity === 'CRISIS') {
            newActiveCrises = [...state.activeBlowbackCrises, entry.id];
         }

         return {
            blowbackLog: [entry, ...state.blowbackLog],
            activeBlowbackCrises: newActiveCrises
         };
      }),

      tickBlowback: () => set((state) => {
        let crises = [...state.activeBlowbackCrises];
        let logs = [...state.blowbackLog];

        logs = logs.map(log => {
          if (crises.includes(log.id)) {
             if (log.mediaStormActive) {
                const rem = log.mediaStormTicksRemaining - 1;
                return { ...log, mediaStormTicksRemaining: rem, mediaStormActive: rem > 0 };
             }
          }
          return log;
        });

        return { blowbackLog: logs };
      }),

      playerRespondToBlowback: (blowbackId, responseType) => set((state) => {
        const logs = state.blowbackLog.map(l => {
           if (l.id === blowbackId) {
             let severity = l.severity;
             let mediaTicks = l.mediaStormTicksRemaining;
             if (responseType === 'DENY' && state.playerExposureScore < 50) {
                // Lower severity stub
                mediaTicks = 0;
             }
             if (responseType === 'ACKNOWLEDGE') mediaTicks = Math.max(0, mediaTicks - 3);
             if (responseType === 'OFFER_INVESTIGATION') mediaTicks = 0;
             
             return { ...l, hasBeenAddressedByPlayer: true, mediaStormTicksRemaining: mediaTicks, severity };
           }
           return l;
        });

        return { blowbackLog: logs };
      }),

      tickRegimePressure: () => {
         const state = get();
         const currentTick = useWorldStore.getState().currentTick;
         
         // Protest Campaigns auto suppress
         Object.values(state.activeProtestCampaigns).forEach(cam => {
            if (cam.phase === 'EXECUTION') state.suppressionResponse(cam.id);
         });

         // Coup execution ticker
         Object.values(state.activeCoupOps).forEach(coup => {
            if (coup.executionWindowTick !== null && coup.executionWindowTick <= currentTick) {
               state.executeCoup(coup.id);
            }
         });

         // Counter Op
         Object.values(state.activeOppositionAssets).forEach(asset => {
            if (asset.regimeSuspicion > 70) state.regimeCounterOp(asset.id);
         });

         // Elections
         Object.values(state.activeElectionOps).forEach(elec => {
            if (elec.electionTick <= currentTick) state.resolveElection(elec.id);
         });

         state.tickBlowback();

         // Exposure decay
         set((s) => ({
           playerExposureScore: Math.max(0, s.playerExposureScore - 0.5)
         }));
      }

    }),
    {
      name: 'sc-regime-pressure-store',
      // only persist ops, logs
      partialize: (state) => ({
        activeProtestCampaigns: state.activeProtestCampaigns,
        activeCoupOps: state.activeCoupOps,
        activeElectionOps: state.activeElectionOps,
        activeOppositionAssets: state.activeOppositionAssets,
        eliteFactions: state.eliteFactions,
        blowbackLog: state.blowbackLog,
        activeBlowbackCrises: state.activeBlowbackCrises,
        playerExposureScore: state.playerExposureScore,
        currentlyTargetedCountries: state.currentlyTargetedCountries,
        completedOps: state.completedOps
      })
    }
  )
);
