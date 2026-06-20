import { create } from 'zustand';
import { produce } from 'immer';
import { 
  SigintObservation, 
  SigintTarget, 
  PatternOfLifeProfile, 
  DeceptionCountermeasure, 
  CollectionCampaign,
  SigintCollectionDomain,
  SignalVisibilityTier
} from '../types';
import { useArachneStore } from './arachneStore';
import { useMirrorStore } from './mirrorStore';
import { useConsequenceStore } from './consequenceStore';
import { useOperativeStore } from './operativeStore';

interface SigintState {
  observations: SigintObservation[];
  targets: Record<string, SigintTarget>;
  patternProfiles: Record<string, PatternOfLifeProfile>;
  deceptionCountermeasures: DeceptionCountermeasure[];
  campaigns: CollectionCampaign[];
  totalCollectionBudget: number;
  collectionBudgetByChannel: Record<string, number>;
  alerts: { id: string; isAcknowledged: boolean; severity: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'; tickTriggered: number; description: string; targetId: string }[];
  polProfiles: Record<string, { targetId: string; state: string; baselineCadenceWindow: [number, number]; timeSinceLastNormalSignal: number; cadenceHistory: number[] }>;
}

interface SigintActions {
  launchCollectionCampaign: (targetId: string, channels: SigintCollectionDomain[], budget: number) => void;
  processRawSignal: (targetId: string, domain: SigintCollectionDomain, confidence: number, rawData: string, isDeceptive: boolean, tick: number) => void;
  updateTargetVisibility: (targetId: string) => void;
  tickSigint: (currentTick: number) => void;
  exportToArachne: (targetId: string) => void;
  initializeSigintSystem: () => void;
  allocateCollectionBudget: (channel: string, budget: number) => void;
  acknowledgeAlert: (alertId: string) => void;
}

export const useSigintStore = create<SigintState & SigintActions>((set, get) => ({
  observations: [],
  targets: {},
  patternProfiles: {},
  deceptionCountermeasures: [],
  campaigns: [],
  totalCollectionBudget: 50,
  collectionBudgetByChannel: {
    diplomatic: 0,
    telecom: 0,
    military: 0,
    cyber: 0,
    commercial: 0,
    imagery: 0,
    openSource: 0,
  },
  alerts: [],
  polProfiles: {},

  allocateCollectionBudget: (channel, budget) => {
    set(produce((draft: SigintState) => {
      draft.collectionBudgetByChannel[channel] = budget;
    }));
  },
  
  acknowledgeAlert: (alertId) => {
    set(produce((draft: SigintState) => {
      const a = draft.alerts.find(x => x.id === alertId);
      if (a) a.isAcknowledged = true;
    }));
  },

  launchCollectionCampaign: (targetId, channels, budget) => {
    // using 'CYBER' for now to fit mirror parameter
    useMirrorStore.getState().recordPlayerAction('CYBER', 10);
    set(produce((draft: SigintState) => {
      draft.campaigns.push({
        id: `campaign_${Date.now()}_${targetId}`,
        targetId,
        channels,
        allocatedBudget: budget,
        startTick: 0,
        expectedDuration: 12,
        status: 'ACTIVE'
      });
    }));
  },

  processRawSignal: (targetId, domain, confidence, rawData, isDeceptive, tick) => {
    set(produce((draft: SigintState) => {
      const newObs: SigintObservation = {
        id: `obs_${Date.now()}_${Math.random()}`,
        targetId,
        domain,
        timestampTick: tick,
        confidenceScore: confidence,
        rawSignalData: rawData,
        isDeceptive,
        corroboratedBy: []
      };
      draft.observations.push(newObs);

      // Simple corroboration logic (if recent ones exist)
      const recent = draft.observations.filter(o => o.targetId === targetId && o.id !== newObs.id && Math.abs(o.timestampTick - tick) < 5);
      if (recent.length > 0) {
        newObs.corroboratedBy.push(recent[0].id);
        recent[0].corroboratedBy.push(newObs.id);
      }

      const target = draft.targets[targetId];
      if (!target) {
        draft.targets[targetId] = {
          id: targetId,
          targetType: 'COUNTRY',
          name: `Unknown Target (${targetId})`,
          visibilityTier: 'HIDDEN',
          analystConfidence: confidence,
          deceptionResistance: 50,
          corroborationCount: 1,
          linkedEntities: [],
          lastObservedTick: tick,
          isActionable: false,
          discoveredThrough: [domain]
        };
      } else {
        if (confidence > 80 && !isDeceptive) {
          target.analystConfidence = Math.min(100, target.analystConfidence + 5);
          target.corroborationCount += 1;
        } else if (isDeceptive) {
          target.analystConfidence = Math.max(0, target.analystConfidence - 10);
        }
        target.lastObservedTick = tick;
        if (!target.discoveredThrough.includes(domain)) {
          target.discoveredThrough.push(domain);
        }
      }
    }));
    get().updateTargetVisibility(targetId);
  },

  updateTargetVisibility: (targetId) => {
    set(produce((draft: SigintState) => {
      const target = draft.targets[targetId];
      if (!target) return;

      const totalObs = draft.observations.filter(o => o.targetId === targetId).length;
      if (totalObs >= 5 && target.analystConfidence > 75) {
        target.visibilityTier = 'CONFIRMED';
        target.isActionable = true;
      } else if (totalObs >= 2 && target.analystConfidence > 40) {
        target.visibilityTier = 'INFERRED';
        target.isActionable = false;
      } else {
        target.visibilityTier = 'HIDDEN';
        target.isActionable = false;
      }
    }));
  },

  exportToArachne: (targetId) => {
    const target = get().targets[targetId];
    if (!target) return;

    useArachneStore.getState().addLiveIntelItem({
      themeTags: ['INTELLIGENCE'],
      sourceType: 'SIGINT',
      urgency: 'HIGH',
      confidence: 'HIGH',
      freshnessState: 'BREAKING',
      title: `SIGINT BREAKTHROUGH: ${target.name}`,
      summary: `Target visibility upgraded to ${target.visibilityTier}. Confidence at ${target.analystConfidence}%.`,
      fullBrief: `Collection domains: ${target.discoveredThrough.join(', ')}. Corroboration count: ${target.corroborationCount}`,
      whyItMatters: '',
      countryIds: [],
      regionIds: [],
      relatedLeaderIds: []
    });
  },

  initializeSigintSystem: () => {
    // Initialization logic if any
  },

  tickSigint: (currentTick) => {
    set(produce((draft: SigintState) => {
      draft.campaigns.forEach(camp => {
        if (camp.status === 'ACTIVE') {
          // Age campaigns
          const duration = currentTick - camp.startTick;
          const networkMult = useOperativeStore.getState().getNetworkMultiplierForCountry(camp.targetId) || 1.0;
          
          if (camp.expectedDuration && duration > camp.expectedDuration * networkMult) {
            camp.status = 'CONCLUDED';
          }

          // Apply deception noise check
          const hasDeception = draft.deceptionCountermeasures.some(c => c.targetId === camp.targetId && c.activeTicksRemaining > 0);
          if (hasDeception) {
            if (Math.random() > 0.8) {
              camp.status = 'PAUSED';
              // Trigger blowback for failed campaign
              useConsequenceStore.getState().triggerBlowback(camp.targetId, 50, 'SIGINT campaign completely bogged down in deception noise.');
            }
          }

          const profile = draft.patternProfiles[camp.targetId];
          if (profile) {
            if (currentTick - (profile.lastAnomalyTick || 0) > 10) {
              if (Math.random() > 0.9) {
                profile.state = 'ANOMALOUS';
                profile.lastAnomalyTick = currentTick;
                useArachneStore.getState().addLiveIntelItem({
                  themeTags: ['INTELLIGENCE'],
                  sourceType: 'SIGINT',
                  urgency: 'CRITICAL',
                  confidence: 'MEDIUM',
                  freshnessState: 'BREAKING',
                  title: `CADENCE ANOMALY DETECTED: ${camp.targetId}`,
                  summary: 'Pattern of life deviation identified. Possible strategic movement or spoofing.',
                  fullBrief: 'Anomaly exceeded baseline parameters.',
                  whyItMatters: '',
                  countryIds: [],
                  regionIds: [],
                  relatedLeaderIds: []
                });
              }
            }
          }
        }
      });

      // Age deception
      draft.deceptionCountermeasures.forEach(c => {
        if (c.activeTicksRemaining > 0) {
          c.activeTicksRemaining -= 1;
        }
      });
    }));
  }
}));
