import { create } from 'zustand';
import { produce } from 'immer';
import { 
  EWAsset, EWCampaign, SpectrumContentionEntry, EWIntelProfile, 
  AntiDroneSystem, DroneEWVulnerability, EWOperationMode, 
  EWSpectrumBand, EWEffectType
} from '../types';
import { useWorldStore } from './worldStore';
import { useSigintStore } from './sigintStore';
import { useMilitaryStore } from './militaryStore';
import { useMirrorStore } from './mirrorStore';
import { audio } from '../utils/audio';

// We may need extra types not in types.ts that are internal to the store
export interface EWAlert {
  id: string;
  tick: number;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface AdaptationLogEntry {
  tick: number;
  countryId: string;
  adaptationType: string;
  details: string;
}

export interface LaunchEWCampaignParams {
  initiatorCountryId: string;
  targetCountryId: string;
  targetedBands: EWSpectrumBand[];
  mode: EWOperationMode;
  intensity: number;
  duration?: number;
  objectives: any[];
}

export interface EWEngagementResult {
  droneId: string;
  systemId: string;
  outcome: 'SEVERED' | 'GPS_DENIED' | 'SPOOFED' | 'DEGRADED' | 'EVADED';
  tick: number;
}

export interface EWStoreState {
  ewAssets: Record<string, EWAsset>;
  activeCampaigns: Record<string, EWCampaign>;
  campaignHistory: EWCampaign[];
  spectrumContention: SpectrumContentionEntry[];
  ewIntelProfiles: Record<string, EWIntelProfile>;
  antiDroneSystems: Record<string, AntiDroneSystem>;
  droneVulnerabilityProfiles: Record<string, DroneEWVulnerability>;
  ewBudgetTotal: number;
  ewBudgetAllocated: number;
  globalSpectrumNoise: number;
  globalDetectionEnvironment: number;
  ewAlerts: EWAlert[];
  adversaryAdaptationLog: AdaptationLogEntry[];
}

export interface EWStoreActions {
  deployEWAsset: (asset: Omit<EWAsset, 'id' | 'deployedAtTick'>) => string;
  retractEWAsset: (assetId: string) => void;
  changeAssetMode: (assetId: string, mode: EWOperationMode) => void;
  setAssetPowerOutput: (assetId: string, power: number) => void;

  launchEWCampaign: (params: LaunchEWCampaignParams) => string;
  terminateEWCampaign: (campaignId: string) => void;
  updateCampaignIntensity: (campaignId: string, intensity: number) => void;

  updateSpectrumContention: (regionId: string, band: EWSpectrumBand) => void;
  resolveSpectrumContest: (regionId: string, band: EWSpectrumBand, currentTick: number) => void;

  detectAdversaryEmitter: (assetId: string, detectedByCountryId: string) => void;
  updateEWIntelProfile: (countryId: string, update: Partial<EWIntelProfile>) => void;

  deployAntiDroneSystem: (system: Omit<AntiDroneSystem, 'id'>) => string;
  engageDroneWithEW: (droneId: string, systemId: string, currentTick: number) => EWEngagementResult;

  tickEW: (currentTick: number) => void;

  calculateJammingEffect: (campaign: EWCampaign, target: EWAsset | null) => EWEffectType[];
  calculateSpoofingEffect: (campaign: EWCampaign) => EWEffectType[];
  calculateDetectionRisk: (asset: EWAsset) => number;
  
  applyEWEffectsToMilitaryStore: () => void;
  applyEWEffectsToSigintStore: () => void;
  applyEWEffectsToWorldStore: () => void;

  adaptAIEWResponse: (countryId: string, currentTick: number) => void;
}

export const useEWStore = create<EWStoreState & EWStoreActions>((set, get) => ({
  ewAssets: {},
  activeCampaigns: {},
  campaignHistory: [],
  spectrumContention: [],
  ewIntelProfiles: {},
  antiDroneSystems: {},
  droneVulnerabilityProfiles: {},
  ewBudgetTotal: 1000,
  ewBudgetAllocated: 0,
  globalSpectrumNoise: 0,
  globalDetectionEnvironment: 0,
  ewAlerts: [],
  adversaryAdaptationLog: [],

  deployEWAsset: (asset) => {
    const id = `EW-ASSET-${Math.random().toString(36).substr(2, 9)}`;
    set(produce((draft: EWStoreState) => {
      draft.ewAssets[id] = {
        ...asset,
        id,
        deployedAtTick: useWorldStore.getState().currentTick
      };
    }));
    return id;
  },

  retractEWAsset: (assetId) => {
    set(produce((draft: EWStoreState) => {
      delete draft.ewAssets[assetId];
    }));
  },

  changeAssetMode: (assetId, mode) => {
    set(produce((draft: EWStoreState) => {
      const asset = draft.ewAssets[assetId];
      if (asset) {
        asset.currentMode = mode;
        asset.lastModeChangeTick = useWorldStore.getState().currentTick;
        
        if (mode.includes('JAM')) {
          audio.playEWJammingBurst();
        } else if (mode === 'DECEPTIVE_SPOOF') {
          audio.playEWSpoofSnap();
        } else if (mode === 'DIRECTION_FIND') {
          audio.playEWDetectionPulse();
        } else if (mode === 'CYBER_RF_INJECT') {
          audio.playEWCognitiveRadar();
        }
      }
    }));
  },

  setAssetPowerOutput: (assetId, power) => {
    set(produce((draft: EWStoreState) => {
      const asset = draft.ewAssets[assetId];
      if (asset) {
        asset.powerOutput = Math.max(0, Math.min(100, power));
      }
    }));
  },

  launchEWCampaign: (params) => {
    const id = `EW-CAMP-${Math.random().toString(36).substr(2, 9)}`;
    const currentTick = useWorldStore.getState().currentTick;
    set(produce((draft: EWStoreState) => {
      draft.activeCampaigns[id] = {
        id,
        ...params,
        startTick: currentTick,
        endTick: params.duration ? currentTick + params.duration : null,
        activeEffects: [],
        successProbability: 0.5,
        detectionRisk: params.intensity * 0.8,
        powerDrainPerTick: params.intensity * 0.5
      };
      draft.ewBudgetAllocated += params.intensity * 0.5;
    }));
    
    useWorldStore.getState().applyTickDelta(draft => {
      draft.globalEventLog.unshift({
        tick: currentTick,
        text: `EW Operations: Campaign ${id} launched by ${params.initiatorCountryId} against ${params.targetCountryId}.`,
        severity: 'WARNING'
      });
    });

    if (params.mode.includes('JAM')) {
      audio.playEWJammingBurst();
    } else if (params.mode === 'DECEPTIVE_SPOOF') {
      audio.playEWSpoofSnap();
    } else if (params.mode === 'CYBER_RF_INJECT') {
      audio.playEWCognitiveRadar();
    }

    return id;
  },

  terminateEWCampaign: (campaignId) => {
    const currentTick = useWorldStore.getState().currentTick;
    set(produce((draft: EWStoreState) => {
      const camp = draft.activeCampaigns[campaignId];
      if (camp) {
        camp.endTick = currentTick;
        draft.ewBudgetAllocated = Math.max(0, draft.ewBudgetAllocated - camp.powerDrainPerTick);
        draft.campaignHistory.unshift(camp);
        delete draft.activeCampaigns[campaignId];
      }
    }));
  },

  updateCampaignIntensity: (campaignId, intensity) => {
    set(produce((draft: EWStoreState) => {
      const camp = draft.activeCampaigns[campaignId];
      if (camp) {
        draft.ewBudgetAllocated -= camp.powerDrainPerTick;
        camp.intensity = Math.max(0, Math.min(100, intensity));
        camp.powerDrainPerTick = camp.intensity * 0.5;
        draft.ewBudgetAllocated += camp.powerDrainPerTick;
        camp.detectionRisk = camp.intensity * 0.8;
      }
    }));
  },

  updateSpectrumContention: (regionId, band) => {
    // Basic helper to flag a region/band for resolution
  },

  resolveSpectrumContest: (regionId, band, currentTick) => {
    set(produce((draft: EWStoreState) => {
      let entry = draft.spectrumContention.find(e => e.regionId === regionId && e.band === band);
      if (!entry) {
        entry = {
          regionId,
          band,
          contestingCountries: [],
          dominantCountryId: null,
          contentionLevel: 0,
          effectsActive: [],
          lastUpdatedTick: currentTick
        };
        draft.spectrumContention.push(entry);
      }
      
      const assetsInRegion = Object.values(draft.ewAssets).filter(a => a.regionId === regionId && a.spectrumBands.includes(band) && a.isActive);
      const scores: Record<string, number> = {};
      
      assetsInRegion.forEach(asset => {
        let score = asset.powerOutput;
        if (asset.currentMode === 'BARRAGE_JAM') score *= 0.5; // wider area, lower intensity
        if (asset.currentMode === 'SPOT_JAM') score *= 1.5; // narrow area, higher intensity
        scores[asset.countryId] = (scores[asset.countryId] || 0) + score;
        
        if (!entry!.contestingCountries.includes(asset.countryId)) {
            entry!.contestingCountries.push(asset.countryId);
        }
      });
      
      let highestScore = 0;
      let dominantCountry: string | null = null;
      let totalContention = 0;
      
      for (const [cid, s] of Object.entries(scores)) {
        totalContention += s;
        if (s > highestScore) {
          highestScore = s;
          dominantCountry = cid;
        }
      }
      
      entry.contentionLevel = Math.min(100, totalContention);
      entry.dominantCountryId = dominantCountry;
      entry.lastUpdatedTick = currentTick;
      
      if (totalContention > 50) {
          draft.globalSpectrumNoise = Math.min(100, draft.globalSpectrumNoise + 1);
      }
    }));
  },

  detectAdversaryEmitter: (assetId, detectedByCountryId) => {
    set(produce((draft: EWStoreState) => {
      const asset = draft.ewAssets[assetId];
      if (asset && !asset.detectedBy.includes(detectedByCountryId)) {
        asset.detectedBy.push(detectedByCountryId);
        
        if (asset.countryId === 'US') { // Player alert
          audio.playEWDetectionPulse();
          draft.ewAlerts.unshift({
            id: `EW-ALERT-${Date.now()}`,
            tick: useWorldStore.getState().currentTick,
            message: `Asset ${asset.name} detected by ${detectedByCountryId}`,
            severity: 'CRITICAL'
          });
        }
      }
    }));
  },

  updateEWIntelProfile: (countryId, update) => {
    const currentTick = useWorldStore.getState().currentTick;
    set(produce((draft: EWStoreState) => {
      if (!draft.ewIntelProfiles[countryId]) {
        draft.ewIntelProfiles[countryId] = {
          countryId,
          knownAssets: [],
          suspectedCapabilities: [],
          observedPatterns: [],
          lastEWActivityTick: currentTick,
          adaptationScore: 0
        };
      }
      Object.assign(draft.ewIntelProfiles[countryId], update);
    }));
  },

  deployAntiDroneSystem: (system) => {
    const id = `AD-SYS-${Math.random().toString(36).substr(2, 9)}`;
    set(produce((draft: EWStoreState) => {
      draft.antiDroneSystems[id] = {
        ...system,
        id
      };
    }));
    return id;
  },

  engageDroneWithEW: (droneId, systemId, currentTick) => {
    const system = get().antiDroneSystems[systemId];
    if (!system) return { droneId, systemId, outcome: 'EVADED', tick: currentTick };
    
    // Simplistic roll
    const roll = Math.random();
    let outcome: 'SEVERED' | 'GPS_DENIED' | 'SPOOFED' | 'DEGRADED' | 'EVADED' = 'EVADED';
    if (roll < 0.2) outcome = 'SEVERED';
    else if (roll < 0.5) outcome = 'GPS_DENIED';
    else if (roll < 0.8) outcome = 'DEGRADED';
    
    return { droneId, systemId, outcome, tick: currentTick };
  },

  calculateJammingEffect: (camp, target) => {
    return ['COMMS_DEGRADED', 'RADAR_BLINDED'];
  },

  calculateSpoofingEffect: (camp) => {
    return ['FALSE_TARGET_INJECTED', 'MISSILE_GUIDANCE_CORRUPTED'];
  },

  calculateDetectionRisk: (asset) => {
    let risk = asset.powerOutput * 0.8;
    if (asset.currentMode === 'EMISSION_CONTROL') risk *= 0.1;
    if (asset.currentMode === 'BARRAGE_JAM') risk *= 1.5;
    return Math.min(100, risk);
  },

  applyEWEffectsToMilitaryStore: () => {
    // To be fleshed out by reading state and pushing modifiers
  },

  applyEWEffectsToSigintStore: () => {
    // To be fleshed out by reading state and pushing modifiers
  },

  applyEWEffectsToWorldStore: () => {
    // To be fleshed out by reading state and pushing modifiers
  },

  adaptAIEWResponse: (countryId, currentTick) => {
    set(produce((draft: EWStoreState) => {
      const prof = draft.ewIntelProfiles[countryId];
      if (prof) {
        prof.adaptationScore += 1;
        draft.adversaryAdaptationLog.unshift({
          tick: currentTick,
          countryId,
          adaptationType: 'FREQUENCY_HOP',
          details: `${countryId} adjusted frequencies to evade jamming.`
        });
      }
    }));
  },

  tickEW: (currentTick: number) => {
    const state = get();
    
    // 1. Advance campaigns
    Object.values(state.activeCampaigns).forEach(camp => {
      if (camp.endTick && currentTick >= camp.endTick) {
        state.terminateEWCampaign(camp.id);
      }
    });

    // 2. Resolve spectrum contests
    // We get unique regions with active assets
    const activeRegions = Array.from(new Set(Object.values(state.ewAssets).filter(a => a.isActive).map(a => a.regionId)));
    activeRegions.forEach(regionId => {
      state.resolveSpectrumContest(regionId, 'VHF', currentTick); // Basic placeholder 
      state.resolveSpectrumContest(regionId, 'UHF', currentTick);
      state.resolveSpectrumContest(regionId, 'SHF', currentTick);
    });

    // 3. Apply effects
    state.applyEWEffectsToMilitaryStore();
    state.applyEWEffectsToSigintStore();
    state.applyEWEffectsToWorldStore();

    // 4. Update detection states
    set(produce((draft: EWStoreState) => {
      Object.values(draft.ewAssets).forEach(asset => {
        if (asset.isActive) {
          asset.emissionProfile = get().calculateDetectionRisk(asset);
          // 10% chance to be detected by adversary if high profile
          if (asset.emissionProfile > 70 && Math.random() < 0.1) {
             if (asset.countryId === 'US') {
                 // detected by enemy
                 if (!asset.detectedBy.includes('CN')) asset.detectedBy.push('CN');
                 
                 audio.playEWDetectionPulse();
                 draft.ewAlerts.unshift({
                     id: `EW-BURN-${Date.now()}`,
                     tick: currentTick,
                     message: `Asset ${asset.name} exposed. Detectable EM signature high.`,
                     severity: 'WARNING'
                 });
             }
          }
        }
      });
    }));

    // 5. Anti-Drone
    // Simplistic pass

    // 6. EW Intel Updates
    // Simplistic pass

    // 7. AI EW Adaptation
    // Simplistic pass
    const mirrorTheme = useMirrorStore.getState().activeCounterCommitment;
    if (mirrorTheme) {
        // AI sees aggressive EW, maybe adapts
        if (Object.keys(state.activeCampaigns).length > 2) {
            state.adaptAIEWResponse('CN', currentTick);
        }
    }
    
    // Decay alerts
    set(produce((draft: EWStoreState) => {
      if (draft.ewAlerts.length > 20) draft.ewAlerts = draft.ewAlerts.slice(0, 20);
    }));
  }
}));
