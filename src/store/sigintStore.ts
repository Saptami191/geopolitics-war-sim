import { create } from 'zustand';
import { produce } from 'immer';
import {
  SigintCollectionDomain,
  CollectionBudgetChannel,
  PatternOfLifeState,
  CadenceAnomalyType,
  CollectionAsset,
  SigintTarget,
  SigintObservation,
  PatternOfLifeProfile,
  IntelligenceFusionRecord,
  DeceptionCountermeasure,
  CollectionCampaign,
  CollectionAlert,
  SignalVisibilityTier
} from '../types';
import { useWorldStore } from './worldStore';
import { useCinematicsStore } from './cinematicsStore';
import { useArachneStore } from './arachneStore';
import { useEWStore } from './ewStore';
import { audio } from '../utils/audio';

export interface SigintState {
  totalCollectionBudget: number;
  collectionBudgetByChannel: Record<CollectionBudgetChannel, number>;
  activeCollectionCampaigns: Record<string, CollectionCampaign>;
  targets: Record<string, SigintTarget>;
  observations: Record<string, SigintObservation>;
  polProfiles: Record<string, PatternOfLifeProfile>;
  fusionRecords: Record<string, IntelligenceFusionRecord>;
  deceptionCountermeasures: Record<string, DeceptionCountermeasure>;
  alerts: CollectionAlert[];
}

interface SigintActions {
  initializeSigintSystem: () => void;
  allocateCollectionBudget: (channel: CollectionBudgetChannel, amount: number) => void;
  startCollectionCampaign: (params: { targetId: string; channels: SigintCollectionDomain[]; budget: number }) => void;
  stopCollectionCampaign: (campaignId: string) => void;
  ingestObservation: (obs: Omit<SigintObservation, 'id'>) => string;
  updateVisibilityTier: (targetId: string) => void;
  buildPatternOfLifeProfile: (targetId: string) => void;
  detectCadenceAnomaly: (targetId: string) => void;
  fuseIntel: (targetId: string) => void;
  applyDeceptionCountermeasure: (targetId: string, method: DeceptionCountermeasure['method'], intensity?: number) => void;
  acknowledgeAlert: (alertId: string) => void;
  tickSigint: (currentTick: number) => void;
}

const INITIAL_STATE: SigintState = {
  totalCollectionBudget: 100,
  collectionBudgetByChannel: {
    DIPLOMATIC: 0,
    TELECOM: 0,
    MILITARY: 0,
    CYBER: 0,
    COMMERCIAL: 0,
    IMAGERY: 0,
    OPEN_SOURCE: 0
  },
  activeCollectionCampaigns: {},
  targets: {},
  observations: {},
  polProfiles: {},
  fusionRecords: {},
  deceptionCountermeasures: {},
  alerts: []
};

const CHANNEL_CONFIG: Record<SigintCollectionDomain, { baseYield: number; stealth: number; cost: number; decay: number; falsePosRate: number }> = {
  DIPLOMATIC:  { baseYield: 0.1, stealth: 0.9, cost: 5, decay: 0.05, falsePosRate: 0.01 },
  TELECOM:     { baseYield: 0.6, stealth: 0.4, cost: 8, decay: 0.20, falsePosRate: 0.15 },
  MILITARY:    { baseYield: 0.5, stealth: 0.5, cost: 20, decay: 0.10, falsePosRate: 0.05 },
  CYBER:       { baseYield: 0.8, stealth: 0.2, cost: 15, decay: 0.30, falsePosRate: 0.25 },
  COMMERCIAL:  { baseYield: 0.4, stealth: 0.8, cost: 10, decay: 0.02, falsePosRate: 0.10 },
  IMAGERY:     { baseYield: 0.3, stealth: 1.0, cost: 25, decay: 0.01, falsePosRate: 0.02 },
  OPEN_SOURCE: { baseYield: 1.0, stealth: 1.0, cost: 2,  decay: 0.50, falsePosRate: 0.40 }
};

export const useSigintStore = create<SigintState & SigintActions>((set, get) => ({
  ...INITIAL_STATE,

  initializeSigintSystem: () => {
    set(produce((draft: SigintState) => {
        // Initial sandbox targets for interaction
        draft.targets['target_RU_MOD'] = {
            id: 'target_RU_MOD', targetType: 'FACILITY', name: 'Russian MoD Command',
            visibilityTier: 'HIDDEN', analystConfidence: 0, deceptionResistance: 60,
            corroborationCount: 0, linkedEntities: ['RU'], lastObservedTick: 0,
            isActionable: false, discoveredThrough: []
        };
        draft.targets['target_CN_PLAN'] = {
            id: 'target_CN_PLAN', targetType: 'NETWORK', name: 'PLAN Logistics Node',
            visibilityTier: 'INFERRED', analystConfidence: 45, deceptionResistance: 75,
            corroborationCount: 2, linkedEntities: ['CN'], lastObservedTick: -5,
            isActionable: false, discoveredThrough: ['COMMERCIAL', 'CYBER']
        };
        draft.targets['target_IR_QODS'] = {
            id: 'target_IR_QODS', targetType: 'FACTION', name: 'Qods Force Forward Command',
            visibilityTier: 'CONFIRMED', analystConfidence: 85, deceptionResistance: 90,
            corroborationCount: 8, linkedEntities: ['IR', 'SY'], lastObservedTick: -1,
            isActionable: true, discoveredThrough: ['TELECOM', 'IMAGERY']
        };
    }));
  },

  allocateCollectionBudget: (channel, amount) => {
    set(produce((draft: SigintState) => {
      let currentTotal = 0;
      Object.keys(draft.collectionBudgetByChannel).forEach((c) => {
          if (c !== channel) currentTotal += draft.collectionBudgetByChannel[c as CollectionBudgetChannel];
      });
      if (currentTotal + amount > draft.totalCollectionBudget) {
          amount = draft.totalCollectionBudget - currentTotal;
      }
      draft.collectionBudgetByChannel[channel] = Math.max(0, amount);
    }));
  },

  startCollectionCampaign: ({ targetId, channels, budget }) => {
    set(produce((draft: SigintState) => {
      const id = `camp_${Math.random().toString(36).substring(2,9)}`;
      draft.activeCollectionCampaigns[id] = {
        id, targetId, channels, allocatedBudget: budget,
        startTick: useWorldStore.getState().currentTick,
        expectedDuration: null, status: 'ACTIVE'
      };
    }));
  },

  stopCollectionCampaign: (campaignId) => {
    set(produce((draft: SigintState) => {
      if (draft.activeCollectionCampaigns[campaignId]) {
        draft.activeCollectionCampaigns[campaignId].status = 'CONCLUDED';
      }
    }));
  },

  ingestObservation: (obsInfo) => {
     const id = `obs_${Math.random().toString(36).substring(2,10)}`;
     set(produce((draft: SigintState) => {
        draft.observations[id] = { ...obsInfo, id };
        const target = draft.targets[obsInfo.targetId];
        if (target) {
            target.lastObservedTick = obsInfo.timestampTick;
            if (!target.discoveredThrough.includes(obsInfo.domain)) {
                target.discoveredThrough.push(obsInfo.domain);
            }
            if (!obsInfo.isDeceptive) {
                target.corroborationCount += 1;
                target.analystConfidence = Math.min(100, target.analystConfidence + (obsInfo.confidenceScore * 0.2));
            }
        }
     }));
     get().updateVisibilityTier(obsInfo.targetId);
     get().buildPatternOfLifeProfile(obsInfo.targetId);
     return id;
  },

  updateVisibilityTier: (targetId) => {
    set(produce((draft: SigintState) => {
        const target = draft.targets[targetId];
        if (!target) return;
        
        let newTier: SignalVisibilityTier = 'HIDDEN';
        if (target.corroborationCount >= 5 && target.analystConfidence >= 75) {
            newTier = 'CONFIRMED';
        } else if (target.corroborationCount >= 1 || target.analystConfidence > 20) {
            newTier = 'INFERRED';
        }

        if (newTier !== target.visibilityTier) {
            target.visibilityTier = newTier;
            if (newTier === 'CONFIRMED') {
                target.isActionable = true;
                get().fuseIntel(target.id);
            }
        }
    }));
  },

  buildPatternOfLifeProfile: (targetId) => {
      set(produce((draft: SigintState) => {
          const obsList = Object.values(draft.observations)
              .filter(o => o.targetId === targetId)
              .sort((a,b) => a.timestampTick - b.timestampTick);
          
          if (obsList.length < 3) return; // Not enough history

          if (!draft.polProfiles[targetId]) {
              draft.polProfiles[targetId] = {
                  targetId, state: 'ESTABLISHING', baselineCadenceWindow: [0, 0],
                  confidenceInBaseline: 10, anomalySensitivity: 50,
                  timeSinceLastNormalSignal: 0, lastAnomalyTick: null,
                  falsePositiveProbability: 0.1, cadenceHistory: []
              };
          }
          
          const pol = draft.polProfiles[targetId];
          const deltas: number[] = [];
          for (let i=1; i<obsList.length; i++) {
              deltas.push(obsList[i].timestampTick - obsList[i-1].timestampTick);
          }
          
          pol.cadenceHistory = deltas;
          
          if (deltas.length >= 5) {
              const avg = deltas.reduce((a,b)=>a+b,0) / deltas.length;
              pol.baselineCadenceWindow = [Math.max(1, avg * 0.8), avg * 1.2];
              pol.confidenceInBaseline = Math.min(100, pol.confidenceInBaseline + 5);
              if (pol.confidenceInBaseline > 40) pol.state = 'STABLE';
          }
      }));
  },

  detectCadenceAnomaly: (targetId) => {
      set(produce((draft: SigintState) => {
          const pol = draft.polProfiles[targetId];
          const deception = draft.deceptionCountermeasures[targetId];
          if (!pol || pol.state === 'ESTABLISHING') return;
          
          const isDeceived = deception && deception.activeTicksRemaining > 0;
          let anomalyDetected: CadenceAnomalyType | null = null;
          
          if (pol.timeSinceLastNormalSignal > pol.baselineCadenceWindow[1] * 2) {
              anomalyDetected = 'SILENCE_GAP';
          }

          if (isDeceived && Math.random() < (deception.intensity / 100)) {
              if (deception.method === 'SCHEDULE_SPOOFING') anomalyDetected = 'SPOOFED_NORMALCY';
              if (deception.method === 'DECOY_TRAFFIC') anomalyDetected = 'COMMS_BURST';
          }

          if (anomalyDetected) {
              pol.state = isDeceived ? 'SPOOFED' : 'ANOMALOUS';
              pol.lastAnomalyTick = useWorldStore.getState().currentTick;
              
              draft.alerts.unshift({
                  id: `alert_${Math.random().toString(36).substring(2,9)}`,
                  targetId, anomalyType: anomalyDetected,
                  tickTriggered: pol.lastAnomalyTick,
                  description: `Cadence anomaly detected: ${anomalyDetected.replace(/_/g, ' ')}`,
                  severity: isDeceived ? 'MEDIUM' : 'HIGH',
                  isAcknowledged: false
              });
              
              useWorldStore.getState().addGlobalEvent(`SIGINT ALERT: ${anomalyDetected.replace(/_/g, ' ')} on target ${draft.targets[targetId]?.name}`, 'WARNING');
          }
      }));
  },

  fuseIntel: (targetId) => {
      set(produce((draft: SigintState) => {
          const target = draft.targets[targetId];
          if (!target || target.visibilityTier !== 'CONFIRMED') return;
          
          const obsList = Object.values(draft.observations).filter(o => o.targetId === targetId);
          if (obsList.length === 0) return;

          draft.fusionRecords[`fus_${targetId}`] = {
              id: `fus_${targetId}`,
              targetId,
              contributingObservationIds: obsList.map(o => o.id),
              fusedTick: useWorldStore.getState().currentTick,
              conclusionSummary: `Confirmed intelligence picture established for ${target.name} via ${target.discoveredThrough.join(', ')}.`,
              exportedToModules: ['WORLD', 'ARACHNE']
          };
      }));
  },

  applyDeceptionCountermeasure: (targetId, method, intensity = 50) => {
      set(produce((draft: SigintState) => {
          draft.deceptionCountermeasures[targetId] = {
              id: `dec_${Math.random().toString(36).substring(2,9)}`,
              targetId, method, intensity, activeTicksRemaining: Math.floor(10 + Math.random() * 20)
          };
      }));
  },

  acknowledgeAlert: (alertId) => {
      set(produce((draft: SigintState) => {
          const al = draft.alerts.find(a => a.id === alertId);
          if (al) al.isAcknowledged = true;
      }));
  },

  tickSigint: (currentTick) => {
      set(produce((draft: SigintState) => {
          // 1. Process Active Campaigns & Global Collections
          Object.values(draft.activeCollectionCampaigns).forEach(camp => {
              if (camp.status !== 'ACTIVE') return;
              const target = draft.targets[camp.targetId];
              if (!target) return;
              
              const deception = draft.deceptionCountermeasures[camp.targetId];
              const ewState = useEWStore.getState();
              
              // Find if this target has EW jamming/spoofing active against it
              const activeEwEffects = Object.values(ewState.activeCampaigns).filter(ew => ew.targetCountryId === camp.targetId);
              const isJammed = activeEwEffects.some(ew => ew.mode.includes('JAM'));
              const isSpoofed = activeEwEffects.some(ew => ew.mode === 'DECEPTIVE_SPOOF');

              if (isJammed) {
                  // Play static audio on first detected jam
                  if (Math.random() < 0.1) audio.sfxWhiteout();
                  return; // complete collection blind
              }

              let totalYield = 0;
              let bestChannel: SigintCollectionDomain = 'OPEN_SOURCE';

              camp.channels.forEach(ch => {
                  const effort = (draft.collectionBudgetByChannel[ch] / 100) + (camp.allocatedBudget / 100);
                  const cfg = CHANNEL_CONFIG[ch];
                  let yieldVal = cfg.baseYield * effort;
                  
                  if (deception && deception.activeTicksRemaining > 0) {
                      yieldVal *= (1 - (deception.intensity/200)); // Deception reduces yield
                  }
                  
                  totalYield += yieldVal;
                  if (yieldVal > 0) bestChannel = ch;
              });

              if (Math.random() < totalYield) {
                  const applySpoof = isSpoofed || (deception && deception.activeTicksRemaining > 0 && Math.random() < 0.5);
                  if (applySpoof) {
                       if (Math.random() < 0.2) audio.playEWSpoofSnap();
                  }
                  
                  // Collection succeeded
                  get().ingestObservation({
                      targetId: camp.targetId,
                      domain: bestChannel,
                      timestampTick: currentTick,
                      confidenceScore: Math.floor(Math.random() * 40 + 20),
                      rawSignalData: applySpoof ? `[${bestChannel}] [ANOMALY DETECTED] Corrupted intercepted stream.` : `[${bestChannel}] Intercepted packet fragment.`,
                      isDeceptive: applySpoof ? true : false,
                      corroboratedBy: []
                  });
              }
          });

          // 2. Pattern of Life Aging and Confidence Decay
          Object.values(draft.polProfiles).forEach(pol => {
              pol.timeSinceLastNormalSignal += 1;
              get().detectCadenceAnomaly(pol.targetId);
          });

          Object.values(draft.targets).forEach(tgt => {
              // Target confidence decays slowly if not continually observed
              if (currentTick - tgt.lastObservedTick > 5) {
                  tgt.analystConfidence = Math.max(0, tgt.analystConfidence - 1);
                  if (tgt.analystConfidence < 20 && tgt.visibilityTier === 'CONFIRMED') {
                      tgt.visibilityTier = 'INFERRED';
                      tgt.isActionable = false;
                  }
              }
          });

          // 3. Deception counters age out
          Object.values(draft.deceptionCountermeasures).forEach(dec => {
              if (dec.activeTicksRemaining > 0) dec.activeTicksRemaining -= 1;
          });
      }));
  }
}));
