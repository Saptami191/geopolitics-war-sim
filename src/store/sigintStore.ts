import { create } from 'zustand';
import { produce } from 'immer';
import { 
  SigintObservation, 
  SigintTarget, 
  PatternOfLifeProfile, 
  DeceptionCountermeasure, 
  CollectionCampaign,
  SigintCollectionDomain,
  SignalVisibilityTier,
  SigintCollectionAsset,
  SigintSignal,
  SigintBudget,
  SigintPatternBaseline,
  SigintChannel,
  SigintCategory
} from '../types';
import { useArachneStore, useArachneStore as arachneStore } from './arachneStore';
import { useMirrorStore } from './mirrorStore';
import { useConsequenceStore } from './consequenceStore';
import { useOperativeStore } from './operativeStore';
import { useDefconStore as defconStore } from './defconStore';
import { useFinintStore as finintStore } from './finintStore';

function generateSigintFlavourText(
  channel: SigintChannel,
  category: SigintCategory,
  nationId: string
): string {
  const templates: Record<SigintChannel, Record<SigintCategory, string>> = {
    DIPLOMATIC: {
      MILITARY_MOVEMENT: `[DIPLOMATIC] Encrypted cable from ${nationId} embassy references unusual troop repositioning.`,
      DIPLOMATIC_COMM: `[DIPLOMATIC] Intercept: ${nationId} foreign ministry scheduling emergency secure calls.`,
      ECONOMIC_ANOMALY: `[DIPLOMATIC] ${nationId} ambassador instructed to avoid comment on currency reserves.`,
      WMD_INDICATOR: `[DIPLOMATIC] Coded reference to 'special materials' in ${nationId} diplomatic traffic.`,
      LEADERSHIP_SIGNAL: `[DIPLOMATIC] Secure comms suggest ${nationId} leadership convened unscheduled session.`,
    },
    TELECOM: {
      MILITARY_MOVEMENT: `[TELECOM] Spike in encrypted military-band comms from ${nationId} northern grid.`,
      DIPLOMATIC_COMM: `[TELECOM] Unusual volume of encrypted calls between ${nationId} and known cut-outs.`,
      ECONOMIC_ANOMALY: `[TELECOM] ${nationId} financial sector communications show after-hours anomaly.`,
      WMD_INDICATOR: `[TELECOM] ${nationId} signals intelligence picks up procurement-related keyword clusters.`,
      LEADERSHIP_SIGNAL: `[TELECOM] Comms pattern suggests ${nationId} principal leadership relocated.`,
    },
    MILITARY: {
      MILITARY_MOVEMENT: `[MILITARY] ${nationId} armoured unit comms shifted to burst-transmission mode.`,
      DIPLOMATIC_COMM: `[MILITARY] ${nationId} defence attaché communications flagged for review.`,
      ECONOMIC_ANOMALY: `[MILITARY] ${nationId} logistics frequencies indicate accelerated supply rotation.`,
      WMD_INDICATOR: `[MILITARY] ${nationId} missile unit frequencies active outside normal exercise window.`,
      LEADERSHIP_SIGNAL: `[MILITARY] ${nationId} command-level comms show elevated security protocol.`,
    },
    CYBER: {
      MILITARY_MOVEMENT: `[CYBER] ${nationId} military network traffic surged 340% past 6 hours.`,
      DIPLOMATIC_COMM: `[CYBER] ${nationId} foreign ministry VPN endpoints showing unusual login pattern.`,
      ECONOMIC_ANOMALY: `[CYBER] ${nationId} central bank API calls deviate from baseline by 47%.`,
      WMD_INDICATOR: `[CYBER] Dark web procurement chatter linked to ${nationId} state-adjacent actors.`,
      LEADERSHIP_SIGNAL: `[CYBER] ${nationId} secure government intranet traffic rerouted through alternate nodes.`,
    },
    COMMERCIAL: {
      MILITARY_MOVEMENT: `[COMMERCIAL] ${nationId} rail and logistics booking pattern suggests mass materiel movement.`,
      DIPLOMATIC_COMM: `[COMMERCIAL] ${nationId} state-owned media purchasing surge in foreign broadcast slots.`,
      ECONOMIC_ANOMALY: `[COMMERCIAL] ${nationId} commodity import orders deviate sharply from seasonal norms.`,
      WMD_INDICATOR: `[COMMERCIAL] Dual-use equipment shipments to ${nationId} flagged by partner agencies.`,
      LEADERSHIP_SIGNAL: `[COMMERCIAL] ${nationId} VIP aviation charter activity up 180% this week.`,
    },
    IMAGERY: {
      MILITARY_MOVEMENT: `[IMAGERY] Satellite pass shows ${nationId} armour concentration at forward staging area.`,
      DIPLOMATIC_COMM: `[IMAGERY] Vehicle surge at ${nationId} foreign ministry overnight.`,
      ECONOMIC_ANOMALY: `[IMAGERY] ${nationId} industrial zone shows 24-hour activity, lights, and heat signature.`,
      WMD_INDICATOR: `[IMAGERY] ${nationId} suspected facility shows excavation consistent with hardened storage.`,
      LEADERSHIP_SIGNAL: `[IMAGERY] ${nationId} leadership compound perimeter activity elevated.`,
    },
  };
  return templates[channel]?.[category] ?? `[${channel}] Intercept from ${nationId} — category: ${category}.`;
}

function checkFinintCorroboration(finintState: any, nationId: string, currentTick: number): boolean {
  try {
    const incidents = finintState?.incidentsLog ?? [];
    const actors = finintState?.actors ?? [];
    return incidents.some(
      (incident: any) => {
        if (Math.abs(incident.tick - currentTick) > 5) return false;
        const actor = actors.find((a: any) => a.id === incident.actorId);
        return actor && actor.linkedCountryId === nationId;
      }
    );
  } catch {
    return false;
  }
}

function updatePatternBaselines(
  existing: SigintPatternBaseline[],
  signals: SigintSignal[],
  currentTick: number
): SigintPatternBaseline[] {
  const nationSignalCounts: Record<string, number> = {};
  signals.forEach(s => {
    nationSignalCounts[s.sourceNationId] = (nationSignalCounts[s.sourceNationId] ?? 0) + 1;
  });

  const updated = [...existing];
  Object.entries(nationSignalCounts).forEach(([nationId, count]) => {
    const idx = updated.findIndex(b => b.nationId === nationId);
    if (idx >= 0) {
      updated[idx] = {
        ...updated[idx],
        baselineScore: Math.round(updated[idx].baselineScore * 0.8 + count * 10 * 0.2),
        lastUpdatedTick: currentTick,
      };
    } else {
      updated.push({ nationId, baselineScore: count * 10, lastUpdatedTick: currentTick });
    }
  });
  return updated;
}

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
  
  // Unit 8200 SIGINT Platform — new fields
  u8200Assets: SigintCollectionAsset[];
  u8200Signals: SigintSignal[];
  u8200Budget: SigintBudget;
  u8200Baselines: SigintPatternBaseline[];
  u8200LastProcessedTick: number;
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
  
  // Unit 8200 SIGINT Platform — new actions
  u8200DeployAsset: (asset: Omit<SigintCollectionAsset, 'id' | 'deployedAtTick'>, currentTick: number) => void;
  u8200RetractAsset: (assetId: string) => void;
  u8200AllocateBudget: (amount: number) => void;
  u8200ProcessTick: (currentTick: number) => void;
  u8200GetSignalsForNation: (nationId: string) => SigintSignal[];
  u8200GetConfirmedSignals: () => SigintSignal[];
  u8200GetAnomalyAlerts: () => SigintSignal[];
  u8200GetActiveAssets: () => SigintCollectionAsset[];
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
  
  u8200Assets: [],
  u8200Signals: [],
  u8200Budget: { totalAllocated: 500, spent: 0, remaining: 500 },
  u8200Baselines: [],
  u8200LastProcessedTick: -1,

  u8200GetSignalsForNation: (nationId: string) =>
    get().u8200Signals.filter(s => s.sourceNationId === nationId),

  u8200GetConfirmedSignals: () =>
    get().u8200Signals.filter(s => s.status === 'CONFIRMED'),

  u8200GetAnomalyAlerts: () =>
    get().u8200Signals.filter(s => s.anomalyFlag === true),

  u8200GetActiveAssets: () =>
    get().u8200Assets.filter(a => a.isActive),

  u8200DeployAsset: (asset, currentTick) => set(state => ({
    u8200Assets: [
      ...state.u8200Assets,
      {
        ...asset,
        id: `asset-${currentTick}-${Math.random().toString(36).slice(2, 7)}`,
        deployedAtTick: currentTick,
      }
    ]
  })),

  u8200RetractAsset: (assetId) => set(state => ({
    u8200Assets: state.u8200Assets.map(a =>
      a.id === assetId ? { ...a, isActive: false } : a
    )
  })),

  u8200AllocateBudget: (amount) => set(state => ({
    u8200Budget: {
      ...state.u8200Budget,
      totalAllocated: state.u8200Budget.totalAllocated + amount,
      remaining: state.u8200Budget.remaining + amount,
    }
  })),

  u8200ProcessTick: (currentTick: number) => {
    const state = get();

    // Idempotency guard
    if (state.u8200LastProcessedTick === currentTick) return;

    // Read from other stores (read-only, never write)
    const defcon = defconStore.getState().currentDefconLevel ?? 3;
    const arachneFeeds = arachneStore.getState().feed ?? [];
    const finintAnomalies = finintStore.getState(); // read as needed

    // 1. Deduct daily costs, auto-retract if budget exhausted
    let budgetSpent = state.u8200Budget.spent;
    const activeAssets = state.u8200Assets.filter(a => a.isActive);
    activeAssets.forEach(asset => { budgetSpent += asset.dailyCost; });
    const remaining = state.u8200Budget.totalAllocated - budgetSpent;

    let assets = state.u8200Assets.map(asset => {
      if (asset.isActive && remaining <= 0) {
        return { ...asset, isActive: false };
      }
      return asset;
    });

    // 2. For each active asset, attempt signal detection
    const newSignals: SigintSignal[] = [];
    const defconMultiplier = (6 - defcon) * 0.1; // DEFCON 1 = 0.5 boost, DEFCON 5 = 0.1

    assets.filter(a => a.isActive).forEach(asset => {
      // Base detection probability: coverageLevel / 100, scaled by DEFCON
      const baseProbability = (asset.coverageLevel / 100) * (1 + defconMultiplier);
      const roll = Math.random();

      if (roll < baseProbability) {
        const categories: SigintCategory[] = [
          'MILITARY_MOVEMENT', 'DIPLOMATIC_COMM', 'ECONOMIC_ANOMALY',
          'WMD_INDICATOR', 'LEADERSHIP_SIGNAL'
        ];
        const category = categories[Math.floor(Math.random() * categories.length)];

        // Get nation baseline
        const baseline = state.u8200Baselines.find(b => b.nationId === asset.targetNationId);
        const baselineScore = baseline?.baselineScore ?? 50;
        const signalScore = Math.floor(Math.random() * 100);
        const anomalyFlag = Math.abs(signalScore - baselineScore) > 30;

        // Check for pattern of life (2+ signals from same nation in last 10 ticks)
        const recentSameNation = state.u8200Signals.filter(
          s => s.sourceNationId === asset.targetNationId &&
          currentTick - s.detectedAtTick <= 10
        );
        const patternOfLifeFlag = recentSameNation.length >= 2;

        const signal: SigintSignal = {
          id: `sigint-${currentTick}-${asset.id}-${Math.random().toString(36).slice(2, 7)}`,
          sourceNationId: asset.targetNationId,
          channel: asset.channel,
          category,
          rawContent: generateSigintFlavourText(asset.channel, category, asset.targetNationId),
          confidence: 'RUMINT',
          status: 'HIDDEN',
          detectedAtTick: currentTick,
          expiresAtTick: currentTick + 30,
          patternOfLifeFlag,
          anomalyFlag,
          linkedSignalIds: recentSameNation.map(s => s.id),
        };
        newSignals.push(signal);
      }
    });

    // 3. Merge new signals with existing, promote statuses
    let allSignals = [...state.u8200Signals, ...newSignals]
      .filter(s => s.expiresAtTick > currentTick); // expire old signals

    allSignals = allSignals.map(signal => {
      let { status, confidence } = signal;

      // HIDDEN → INFERRED: 2+ signals from same nation in last 10 ticks
      const corroborating = allSignals.filter(
        s => s.id !== signal.id &&
        s.sourceNationId === signal.sourceNationId &&
        currentTick - s.detectedAtTick <= 10
      );
      if (status === 'HIDDEN' && corroborating.length >= 1) {
        status = 'INFERRED';
        confidence = 'SIGINT';
      }

      // INFERRED → CONFIRMED: corroborated by Arachne OSINT or FININT anomaly
      const arachneCorroboration = arachneFeeds.some(
        (f: any) => f.countryIds?.includes(signal.sourceNationId) && (f.confidence === 'HIGH' || f.confidence === 'MEDIUM') && Math.abs((f.timestampTick ?? currentTick) - currentTick) <= 10
      );
      const finintCorroboration = checkFinintCorroboration(finintAnomalies, signal.sourceNationId, currentTick);

      if (status === 'INFERRED' && (arachneCorroboration || finintCorroboration)) {
        status = 'CONFIRMED';
        confidence = 'CONFIRMED';
      }

      return { ...signal, status, confidence };
    });

    // 4. Update baselines (rolling average)
    const updatedBaselines = updatePatternBaselines(state.u8200Baselines, allSignals, currentTick);

    set({
      u8200Assets: assets,
      u8200Signals: allSignals,
      u8200Budget: {
        ...state.u8200Budget,
        spent: budgetSpent,
        remaining: Math.max(0, remaining),
      },
      u8200Baselines: updatedBaselines,
      u8200LastProcessedTick: currentTick,
    });
  },

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
