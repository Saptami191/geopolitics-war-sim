import { create } from 'zustand';
import { produce } from 'immer';
import { useSigintStore } from './sigintStore';
import { useArachneStore } from './arachneStore';
import { useFinintStore } from './finintStore';
import { useWorldStore } from './worldStore';
import { useDefconStore } from './defconStore';
import { useMirrorStore } from './mirrorStore';
import { useConsequenceStore } from './consequenceStore';
import { useCinematicsStore } from './cinematicsStore';
import { audio } from '../utils/audio';

import {
  CIAOperative,
  CIAAsset,
  CIAOperation,
  CIABlowbackEvent,
  CIAStation,
  CIAOversightRecord,
  CIACovertBudget,
  CIAOperativeStatus,
  CIAAssetStatus,
  CIAOperationType,
  CIAOperationStatus,
  CIABlowbackSeverity,
  CIACoverType,
  CIAAssetMotivation
} from '../types';

export interface CIAStoreState {
  cia_operatives: CIAOperative[];
  cia_assets: CIAAsset[];
  cia_operations: CIAOperation[];
  cia_blowbackEvents: CIABlowbackEvent[];
  cia_stations: CIAStation[];
  cia_oversight: CIAOversightRecord;
  cia_covertBudget: CIACovertBudget;
  cia_lastProcessedTick: number;
  cia_totalOperationsRun: number;
  cia_totalAssetsRecruited: number;
  cia_totalBlowbackEvents: number;
  cia_directorBriefingLog: string[];

  cia_deployOperative: (
    operative: Omit<CIAOperative, 'id' | 'deployedAtTick' | 'lastOperationTick' | 'totalOperationsCompleted' | 'arachneNodeId'>,
    currentTick: number
  ) => string;
  cia_retractOperative: (operativeId: string, currentTick: number) => void;
  cia_updateOperativeStatus: (operativeId: string, status: CIAOperativeStatus) => void;
  cia_recruitAsset: (
    asset: Omit<CIAAsset, 'id' | 'recruitedAtTick' | 'totalIntelProduced' | 'linkedArachneNodeId'>,
    currentTick: number
  ) => string;
  cia_updateAssetStatus: (assetId: string, status: CIAAssetStatus) => void;
  cia_launchOperation: (
    operation: Omit<CIAOperation, 'id' | 'startTick' | 'completedAtTick' | 'outcomeSummary' | 'blowbackSeverity'>,
    currentTick: number
  ) => string;
  cia_abortOperation: (operationId: string, currentTick: number) => void;
  cia_notifyOversight: (operationId: string) => void;
  cia_establishStation: (
    station: Omit<CIAStation, 'id' | 'establishedAtTick'>,
    currentTick: number
  ) => string;
  cia_compromiseStation: (stationId: string) => void;
  cia_allocateBudget: (amount: number) => void;
  cia_accessBlackBudget: (amount: number) => boolean;
  cia_resolveBlowback: (blowbackId: string, currentTick: number) => void;
  cia_processTick: (currentTick: number) => void;

  cia_getActiveOperatives: () => CIAOperative[];
  cia_getOperativesInNation: (nationId: string) => CIAOperative[];
  cia_getActiveOperations: () => CIAOperation[];
  cia_getOperationsByType: (type: CIAOperationType) => CIAOperation[];
  cia_getAssetsInNation: (nationId: string) => CIAAsset[];
  cia_getRecruitedAssets: () => CIAAsset[];
  cia_getUnresolvedBlowback: () => CIABlowbackEvent[];
  cia_getStationInNation: (nationId: string) => CIAStation | null;
  cia_getDirectorBriefing: () => string[];
}

// ----------------------------------------------------
// RESOLVER FUNCTIONS
// ----------------------------------------------------

function generateOperationOutcomeSummary(operation: CIAOperation, outcome: string, tick: number): string {
  const t = operation.type;
  if (t === 'INTELLIGENCE_COLLECTION') {
    if (outcome === 'SUCCEEDED') return `OPERATION ${operation.codename} — CONCLUDED SUCCESSFULLY. Asset network produced high-quality intelligence reports in ${operation.targetNationId}.`;
    if (outcome === 'PARTIALLY_SUCCEEDED') return `OPERATION ${operation.codename} — PARTIAL YIELD. Some intelligence gathered, but network access was restricted.`;
    return `OPERATION ${operation.codename} — FAILED. Insufficient access to target data.`;
  }
  if (t === 'REGIME_DESTABILISATION') {
    if (outcome === 'SUCCEEDED') return `OPERATION ${operation.codename} — OBJECTIVE ACHIEVED. Political operations against ${operation.targetNationId} government produced measurable fractures.`;
    if (outcome === 'PARTIALLY_SUCCEEDED') return `OPERATION ${operation.codename} — PARTIAL OUTCOME. Limited political disruption achieved.`;
    return `OPERATION ${operation.codename} — OBJECTIVE NOT ACHIEVED. Political conditions proved more resilient than assessed.`;
  }
  if (t === 'ASSASSINATION') {
    if (outcome === 'SUCCEEDED') return `OPERATION ${operation.codename} — TARGET ELIMINATED. Primary objective achieved with precision.`;
    if (outcome === 'PARTIALLY_SUCCEEDED') return `OPERATION ${operation.codename} — TARGET INCAPACITATED. Secondary objectives met.`;
    return `OPERATION ${operation.codename} — OPERATION FAILED. Target survived or was inaccessible. High risk of blowback.`;
  }
  if (t === 'COUP_SUPPORT') {
    if (outcome === 'SUCCEEDED') return `OPERATION ${operation.codename} — COUP SUCCESSFUL. New leadership installed in ${operation.targetNationId}.`;
    if (outcome === 'PARTIALLY_SUCCEEDED') return `OPERATION ${operation.codename} — PARTIAL OUTCOME. Target government retains control but authority significantly weakened.`;
    return `OPERATION ${operation.codename} — FAILED. Target regime suppressed the plot. Assets burned.`;
  }
  // Generic fallbacks
  if (outcome === 'SUCCEEDED') return `OPERATION ${operation.codename} — CONCLUDED SUCCESSFULLY.`;
  if (outcome === 'PARTIALLY_SUCCEEDED') return `OPERATION ${operation.codename} — PARTIALLY SUCCEEDED.`;
  return `OPERATION ${operation.codename} — OPERATION FAILED.`;
}

function cia_operationExposed(operation: CIAOperation, currentTick: number, set: any, get: any) {
  set(produce((draft: CIAStoreState) => {
    const op = draft.cia_operations.find(o => o.id === operation.id);
    if (!op) return;
    op.status = 'BLOWN';

    let severity: CIABlowbackSeverity = 'CONTAINED';
    if (['ASSASSINATION', 'COUP_SUPPORT'].includes(op.type)) severity = op.oversightNotified ? 'EXPOSED' : 'CATASTROPHIC';
    else if (op.type === 'RENDITION') severity = op.oversightNotified ? 'LEAKED' : 'EXPOSED';
    else if (op.type === 'PROPAGANDA_OPERATION') severity = 'LEAKED';
    else severity = op.oversightNotified ? 'CONTAINED' : (Math.random() > 0.5 ? 'LEAKED' : 'CONTAINED');
    
    op.blowbackSeverity = severity;

    const operativesCompromised = op.assignedOperativeIds.filter(id => {
      const operative = draft.cia_operatives.find(o => o.id === id);
      return operative && operative.heatLevel > 60;
    });

    const assetsCompromised = op.supportingAssetIds.filter(id => {
      const asset = draft.cia_assets.find(a => a.id === id);
      return asset && asset.compromiseRisk > 50;
    });

    const blowback: CIABlowbackEvent = {
        id: `bb_${currentTick}_${Math.floor(Math.random()*10000)}`,
        operationId: op.id,
        severity,
        nationId: op.targetNationId,
        description: `OPERATION ${op.codename} — COMPROMISED. ${severity} exposure in ${op.targetNationId}.`,
        triggeredAtTick: currentTick,
        diplomaticDamage: severity === 'CATASTROPHIC' ? 40 : severity === 'EXPOSED' ? 20 : severity === 'LEAKED' ? 5 : 0,
        allianceDamage: severity === 'CATASTROPHIC' ? 20 : severity === 'EXPOSED' ? 10 : 0,
        oversightEscalation: !op.oversightNotified,
        mediaExposure: Math.random() < 0.5,
        operativesCompromised,
        assetsCompromised,
        isResolved: false,
        resolutionTick: null
    };

    draft.cia_blowbackEvents.push(blowback);
    draft.cia_totalBlowbackEvents++;

    operativesCompromised.forEach(id => {
        const opId = draft.cia_operatives.find(o => o.id === id);
        if (opId) opId.status = 'COMPROMISED';
    });
    assetsCompromised.forEach(id => {
        const asst = draft.cia_assets.find(a => a.id === id);
        if (asst) asst.status = 'BURNED';
    });

    draft.cia_directorBriefingLog.unshift(`CARDINAL SHADOW // Tick ${currentTick}: ALERT — Operation ${op.codename} detection event in ${op.targetNationId}. Blowback severity: ${severity}.`);
    if (draft.cia_directorBriefingLog.length > 50) draft.cia_directorBriefingLog.pop();
  }));

  const state = get();
  const op = state.cia_operations.find((o: CIAOperation) => o.id === operation.id);
  const blowback = state.cia_blowbackEvents.find((b: CIABlowbackEvent) => b.operationId === operation.id && b.triggeredAtTick === currentTick);

  if (blowback && op) {
      audio.cia_operation_blown();
      if (blowback.severity === 'CATASTROPHIC') {
          audio.cia_blowback_catastrophic();
      }

      if (blowback.diplomaticDamage > 0) {
          useConsequenceStore.getState().triggerBlowback(op.targetNationId, blowback.diplomaticDamage, `CIA Operation ${op.codename} exposed`);
      }
      if (blowback.severity === 'CATASTROPHIC' || blowback.severity === 'EXPOSED') {
          useWorldStore.getState().addGlobalEvent(`[CIA_OPERATION_EXPOSED] Covert operation ${op.codename} exposed in ${op.targetNationId}.`, 'CRITICAL');
          useCinematicsStore.getState().triggerCinematic('CIA_OPERATION_BLOWN', { operationId: op.id, codename: op.codename });
          if (blowback.severity === 'CATASTROPHIC') {
              useWorldStore.getState().addGlobalEvent(`[CIA_CATASTROPHIC_BLOWBACK] Severe diplomatic repercussions following exposed CIA operation.`, 'CRITICAL');
              useCinematicsStore.getState().triggerCinematic('CIA_CATASTROPHIC_BLOWBACK', { operationId: op.id });
          }
      }
  }
}

function cia_resolveOperation(
  operation: CIAOperation,
  outcome: 'SUCCEEDED' | 'PARTIALLY_SUCCEEDED' | 'FAILED',
  currentTick: number,
  set: any,
  get: any
) {
  set(produce((draft: CIAStoreState) => {
    const op = draft.cia_operations.find(o => o.id === operation.id);
    if (!op) return;
    
    op.status = outcome;
    op.completedAtTick = currentTick;
    op.outcomeSummary = generateOperationOutcomeSummary(op, outcome, currentTick);

    if (outcome === 'SUCCEEDED') {
      op.objectives.forEach(obj => {
         if (obj.type === 'PRIMARY') {
            obj.isAchieved = true;
            obj.achievedAtTick = currentTick;
         }
      });
    } else if (outcome === 'PARTIALLY_SUCCEEDED') {
      op.objectives.forEach(obj => {
         if (obj.type === 'PRIMARY' && Math.random() > 0.5) {
            obj.isAchieved = true;
            obj.achievedAtTick = currentTick;
         }
      });
    }

    if (outcome === 'FAILED' && Math.random() < 0.4) {
      const blowback: CIABlowbackEvent = {
        id: `bb_${currentTick}_${Math.floor(Math.random()*10000)}`,
        operationId: op.id,
        severity: 'CONTAINED',
        nationId: op.targetNationId,
        description: `OPERATION ${op.codename} — FAILED. Minor internal intelligence leak.`,
        triggeredAtTick: currentTick,
        diplomaticDamage: 0,
        allianceDamage: 0,
        oversightEscalation: false,
        mediaExposure: false,
        operativesCompromised: [],
        assetsCompromised: [],
        isResolved: false,
        resolutionTick: null
      };
      draft.cia_blowbackEvents.push(blowback);
      draft.cia_totalBlowbackEvents++;
    }

    draft.cia_directorBriefingLog.unshift(`CARDINAL SHADOW // Tick ${currentTick}: Operation ${op.codename} concluded with status ${outcome} in ${op.targetNationId}.`);
    if (draft.cia_directorBriefingLog.length > 50) draft.cia_directorBriefingLog.pop();
  }));

  if (outcome === 'SUCCEEDED' || outcome === 'PARTIALLY_SUCCEEDED') {
      audio.cia_operation_succeeded();
  } else {
      audio.cia_operation_failed();
  }

  const op = get().cia_operations.find((o: CIAOperation) => o.id === operation.id);
  if (outcome === 'SUCCEEDED' && op && (op.type === 'COUP_SUPPORT' || op.type === 'ASSASSINATION')) {
      useWorldStore.getState().addGlobalEvent(`[CIA_COVERT_ACTION_SUCCEEDED] Major regime change event executed in ${op.targetNationId}.`, 'WARNING');
      if (op.type === 'COUP_SUPPORT') {
          useCinematicsStore.getState().triggerCinematic('CIA_COUP_SUCCEEDED', { nationId: op.targetNationId });
      }
  }
}

// ----------------------------------------------------
// STORE DEFINITION
// ----------------------------------------------------

export const useCiaStore = create<CIAStoreState>((set, get) => ({
  cia_operatives: [],
  cia_assets: [],
  cia_operations: [],
  cia_blowbackEvents: [],
  cia_stations: [],
  cia_oversight: {
    id: 'oversight-primary',
    status: 'CLEAR',
    activeInquiryOperationIds: [],
    restrictedOperationTypes: [],
    lastReviewTick: 0,
    hearingScheduledTick: null,
    clearanceGrantedForTypes: [],
    legalCounselNotes: 'No active concerns.'
  },
  cia_covertBudget: {
    totalAllocated: 800,
    spent: 0,
    remaining: 800,
    blackBudgetUntracked: 200
  },
  cia_lastProcessedTick: -1,
  cia_totalOperationsRun: 0,
  cia_totalAssetsRecruited: 0,
  cia_totalBlowbackEvents: 0,
  cia_directorBriefingLog: [],

  cia_deployOperative: (operative, currentTick) => {
    const newId = `op_${currentTick}_${get().cia_operatives.length}`;
    const arachneNodeId = `node_${newId}`;
    
    // Create mapping in Arachne immediately
    useArachneStore.setState(produce((draft) => {
       const exists = draft.arachne_nodes.find((n: any) => n.id === arachneNodeId);
       if (!exists) {
         draft.arachne_nodes.push({
           id: arachneNodeId,
           label: operative.codename,
           type: 'PERSON',
           exposureLevel: 'UNKNOWN',
           nationId: operative.nationId,
           aliases: operative.realName ? [operative.realName] : [],
           linkedFlagIds: [],
           linkedIntelIds: [],
           linkedSignals: [],
           isBurned: false
         });
       }
    }));

    set(produce((draft: CIAStoreState) => {
      draft.cia_operatives.push({
        ...operative,
        id: newId,
        deployedAtTick: currentTick,
        lastOperationTick: 0,
        totalOperationsCompleted: 0,
        arachneNodeId
      });
    }));
    audio.cia_operative_deployed();
    return newId;
  },

  cia_retractOperative: (operativeId, currentTick) => {
    set(produce((draft: CIAStoreState) => {
      const operative = draft.cia_operatives.find(o => o.id === operativeId);
      if (operative) {
          operative.status = 'EXTRACTED';
          if (operative.activeOperationId) {
              const op = draft.cia_operations.find(op => op.id === operative.activeOperationId);
              if (op) {
                  op.assignedOperativeIds = op.assignedOperativeIds.filter(id => id !== operativeId);
              }
              operative.activeOperationId = null;
          }
      }
    }));
    audio.cia_operative_extracted();
  },

  cia_updateOperativeStatus: (operativeId, status) => set(produce((draft: CIAStoreState) => {
    const op = draft.cia_operatives.find(o => o.id === operativeId);
    if (op) {
        op.status = status;
        if (status === 'COMPROMISED') {
            useArachneStore.setState(produce((d) => {
                const node = d.arachne_nodes.find((n: any) => n.id === op.arachneNodeId);
                if (node) node.exposureLevel = 'IDENTIFIED';
            }));
        } else if (status === 'KIA') {
            useArachneStore.setState(produce((d) => {
                const node = d.arachne_nodes.find((n: any) => n.id === op.arachneNodeId);
                if (node) { node.exposureLevel = 'BURNED'; node.isBurned = true; }
            }));
        }
    }
  })),

  cia_recruitAsset: (asset, currentTick) => {
    const newId = `asset_${currentTick}_${get().cia_assets.length}`;
    const arachneNodeId = `node_${newId}`;

    useArachneStore.setState(produce((draft) => {
       const exists = draft.arachne_nodes.find((n: any) => n.id === arachneNodeId);
       if (!exists) {
         draft.arachne_nodes.push({
           id: arachneNodeId,
           label: asset.codename,
           type: 'PERSON',
           exposureLevel: 'SUSPECTED',
           nationId: asset.nationId,
           aliases: [asset.position],
           linkedFlagIds: [],
           linkedIntelIds: [],
           linkedSignals: [],
           isBurned: false
         });
       }
    }));

    set(produce((draft: CIAStoreState) => {
      draft.cia_assets.push({
        ...asset,
        id: newId,
        recruitedAtTick: currentTick,
        totalIntelProduced: 0,
        linkedArachneNodeId: arachneNodeId
      });
      draft.cia_totalAssetsRecruited++;
    }));
    return newId;
  },

  cia_updateAssetStatus: (assetId, status) => set(produce((draft: CIAStoreState) => {
    const a = draft.cia_assets.find(as => as.id === assetId);
    if (a) a.status = status;
  })),

  cia_launchOperation: (operation, currentTick) => {
    const state = get();
    if (state.cia_oversight.status === 'RESTRICTED' && state.cia_oversight.restrictedOperationTypes.includes(operation.type)) {
       // Oversight restricts it -- in UI it shouldn't allow it, but we log it instead of throwing to be safe
       return "";
    }

    const newId = `op_${currentTick}_${state.cia_operations.length}`;
    set(produce((draft: CIAStoreState) => {
      draft.cia_operations.push({
        ...operation,
        id: newId,
        startTick: currentTick,
        completedAtTick: null,
        outcomeSummary: null,
        blowbackSeverity: null,
        status: 'ACTIVE'
      });
      draft.cia_covertBudget.remaining -= operation.resourceCost;
      draft.cia_covertBudget.spent += operation.resourceCost;
      draft.cia_totalOperationsRun++;
      
      operation.assignedOperativeIds.forEach(id => {
          const op = draft.cia_operatives.find(o => o.id === id);
          if (op) {
              op.activeOperationId = newId;
              op.lastOperationTick = currentTick;
          }
      });
      
      draft.cia_directorBriefingLog.unshift(`CARDINAL SHADOW // Tick ${currentTick}: Operation ${operation.codename} launched in ${operation.targetNationId}.`);
      if (draft.cia_directorBriefingLog.length > 50) draft.cia_directorBriefingLog.pop();
    }));

    if (get().cia_totalOperationsRun === 1) {
        useCinematicsStore.getState().triggerCinematic('CIA_FIRST_OPERATION_LAUNCHED', { operationId: newId });
    }

    audio.cia_operation_launched();
    return newId;
  },

  cia_abortOperation: (operationId, currentTick) => set(produce((draft: CIAStoreState) => {
    const op = draft.cia_operations.find(o => o.id === operationId);
    if (op && op.status === 'ACTIVE') {
        op.status = 'ABORTED';
        draft.cia_covertBudget.remaining += op.resourceCost * 0.5;
        draft.cia_covertBudget.spent -= op.resourceCost * 0.5;
        
        op.assignedOperativeIds.forEach(id => {
            const operative = draft.cia_operatives.find(o => o.id === id);
            if (operative) operative.activeOperationId = null;
        });

        draft.cia_directorBriefingLog.unshift(`CARDINAL SHADOW // Tick ${currentTick}: Operation ${op.codename} manually aborted.`);
    }
  })),

  cia_notifyOversight: (operationId) => {
    set(produce((draft: CIAStoreState) => {
      const op = draft.cia_operations.find(o => o.id === operationId);
      if (op) op.oversightNotified = true;
    }));
    audio.cia_oversight_inquiry();
  },

  cia_establishStation: (station, currentTick) => {
      const newId = `station_${station.nationId}_${currentTick}`;
      set(produce((draft: CIAStoreState) => {
          draft.cia_stations.push({
              ...station,
              id: newId,
              establishedAtTick: currentTick
          });
      }));
      return newId;
  },

  cia_compromiseStation: (stationId) => set(produce((draft: CIAStoreState) => {
      const st = draft.cia_stations.find(s => s.id === stationId);
      if (st) st.isCompromised = true;
  })),

  cia_allocateBudget: (amount) => set(produce((draft: CIAStoreState) => {
      draft.cia_covertBudget.totalAllocated += amount;
      draft.cia_covertBudget.remaining += amount;
  })),

  cia_accessBlackBudget: (amount) => {
      let success = false;
      set(produce((draft: CIAStoreState) => {
          if (draft.cia_covertBudget.blackBudgetUntracked >= amount) {
              draft.cia_covertBudget.blackBudgetUntracked -= amount;
              draft.cia_covertBudget.remaining += amount;
              success = true;
          } else {
              draft.cia_directorBriefingLog.unshift("WARNING: Black budget funds exhausted. Access denied.");
          }
      }));
      return success;
  },

  cia_resolveBlowback: (blowbackId, currentTick) => set(produce((draft: CIAStoreState) => {
      const bb = draft.cia_blowbackEvents.find(b => b.id === blowbackId);
      if (bb) {
          bb.isResolved = true;
          bb.resolutionTick = currentTick;
      }
  })),

  cia_processTick: (currentTick) => {
      const state = get();
      if (state.cia_lastProcessedTick === currentTick) return;

      const defconStore = useDefconStore.getState();
      const currentDefcon = defconStore.currentDefconLevel;

      set(produce((draft: CIAStoreState) => {
          draft.cia_lastProcessedTick = currentTick;

          const stationMaint = draft.cia_stations.length * 20;
          const opMaint = draft.cia_operatives.filter(o => o.status === 'ACTIVE').length * 10;
          draft.cia_covertBudget.remaining -= (stationMaint + opMaint);

          if (draft.cia_covertBudget.remaining <= 0) {
              const ops = draft.cia_operatives.filter(o => o.status === 'ACTIVE').sort((a,b) => b.heatLevel - a.heatLevel);
              if (ops.length > 0) {
                  ops[0].status = 'EXTRACTED';
                  draft.cia_directorBriefingLog.unshift(`WARNING: Budget critically low. Auto-extracted ${ops[0].codename}.`);
              }
          }

          draft.cia_operations.filter(o => o.status === 'ACTIVE').forEach(op => {
              let baseSuccess = 50;
              baseSuccess += op.assignedOperativeIds.reduce((sum, id) => {
                  const operative = draft.cia_operatives.find(o => o.id === id);
                  return sum + (operative ? operative.accessLevel * 0.3 : 0);
              }, 0);
              
              baseSuccess += op.supportingAssetIds.reduce((sum, id) => {
                  const asset = draft.cia_assets.find(a => a.id === id);
                  return sum + (asset ? asset.accessTier * 8 : 0);
              }, 0);

              if (op.sigintSupport) baseSuccess += 10;
              if (op.arachneSupport) baseSuccess += 8;
              if (op.finintSupport) baseSuccess += 7;

              op.assignedOperativeIds.forEach(id => {
                  const operative = draft.cia_operatives.find(o => o.id === id);
                  if (operative && operative.heatLevel > 30) {
                      baseSuccess -= (operative.heatLevel - 30) * 0.5;
                  }
              });

              if (currentDefcon <= 2) baseSuccess -= (6 - currentDefcon) * 3;
              if (draft.cia_oversight.status === 'INQUIRY' || draft.cia_oversight.status === 'RESTRICTED') {
                  baseSuccess -= 15;
              }

              op.successProbability = Math.min(95, Math.max(5, baseSuccess));

              let baseDet = 15;
              const typeRiskMap: Record<string, number> = {
                  'ASSASSINATION': 35, 'COUP_SUPPORT': 25, 'RENDITION': 20,
                  'SABOTAGE': 18, 'REGIME_DESTABILISATION': 15, 'COUNTER_PROLIFERATION': 12,
                  'PROPAGANDA_OPERATION': 10, 'INTELLIGENCE_COLLECTION': 5
              };
              baseDet += (typeRiskMap[op.type] || 8);

              op.assignedOperativeIds.forEach(id => {
                  const operative = draft.cia_operatives.find(o => o.id === id);
                  if (operative) baseDet += (operative.heatLevel / 100) * 20;
              });

              const st = draft.cia_stations.find(s => s.nationId === op.targetNationId);
              if (st && st.isCompromised) baseDet += 25;
              
              if (op.oversightNotified) baseDet -= 10;
              op.detectionRisk = Math.min(90, Math.max(5, baseDet));

              if (Math.random() < (op.detectionRisk / 100) * 0.15) {
                  // Will be processed outside
                  op.status = 'BLOWN'; 
              } else if (currentTick >= op.startTick + op.estimatedDurationTicks) {
                  if (Math.random() < (op.successProbability / 100)) op.status = 'SUCCEEDED';
                  else op.status = 'FAILED';
              }
          });

          draft.cia_operatives.filter(o => o.status === 'ACTIVE').forEach(op => {
              if (op.lastOperationTick === currentTick - 1) op.heatLevel += 3;
              else op.heatLevel -= 1;
              op.heatLevel = Math.max(0, Math.min(100, op.heatLevel));

              op.coverIntegrity -= 0.2;
              if (op.coverIntegrity <= 0) op.coverIntegrity = 0; 

              if (op.heatLevel >= 80 && Math.random() < 0.1) {
                  draft.cia_directorBriefingLog.unshift(`WARNING: Operative ${op.codename} heat critical.`);
              }
          });

          draft.cia_assets.filter(a => a.status === 'RECRUITED').forEach(asset => {
              const daysSinceContact = currentTick - asset.lastContactTick;
              if (daysSinceContact > asset.meetingFrequency) {
                  asset.motivationStrength -= asset.motivationDecayRate;
              }

              if (asset.motivationStrength <= 20) {
                  if (asset.motivation === 'MONEY' && Math.random() < 0.6) asset.status = 'DORMANT';
                  else if (asset.motivation === 'IDEOLOGY' && Math.random() < 0.3) asset.status = 'DORMANT';
                  else if (asset.motivation === 'COMPROMISE' && Math.random() < 0.7) asset.status = 'DORMANT';
                  else if (asset.motivation === 'EGO' && Math.random() < 0.5) asset.status = 'DORMANT';
              }

              asset.doubledRisk += (asset.compromiseRisk > 60) ? 2 : 0.5;
              if (asset.doubledRisk >= 85 && Math.random() < 0.15) {
                  asset.status = 'DOUBLED';
                  audio.cia_asset_doubled();
              }
          });
      }));

      // External resolvers
      const s2 = get();
      s2.cia_operations.forEach(op => {
          if (op.status === 'BLOWN' && !op.outcomeSummary) {
              cia_operationExposed(op, currentTick, set, get);
          } else if ((op.status === 'SUCCEEDED' || op.status === 'PARTIALLY_SUCCEEDED' || op.status === 'FAILED') && !op.outcomeSummary) {
              cia_resolveOperation(op, op.status as any, currentTick, set, get);
          }
      });

      // Asset production
      const s3 = get();
      s3.cia_assets.filter(a => a.status === 'RECRUITED').forEach(asset => {
          if (currentTick - asset.lastContactTick <= asset.meetingFrequency + 2) {
              if (Math.random() < (asset.productionRate / 100)) {
                  useSigintStore.getState().processRawSignal(
                      asset.nationId,
                      'TELECOM',
                      80,
                      `[HUMINT SOURCE ${asset.codename}]: Operational intelligence package.`,
                      false,
                      currentTick
                  );
              }
          }
      });

      // Mirror Store Integration
      const activeOps = s3.cia_operations.filter(o => o.status === 'ACTIVE');
      if (activeOps.length > 0) {
          const typeCount: Record<string, number> = {};
          const nationCount: Record<string, number> = {};
          activeOps.forEach(op => {
              typeCount[op.type] = (typeCount[op.type] || 0) + 1;
              nationCount[op.targetNationId] = (nationCount[op.targetNationId] || 0) + 1;
          });
          const mostUsedOpType = Object.keys(typeCount).sort((a,b) => typeCount[b] - typeCount[a])[0];
          const mostTargetedNation = Object.keys(nationCount).sort((a,b) => nationCount[b] - nationCount[a])[0];
          
          const activeOperatives = s3.cia_operatives.filter(o => o.status === 'ACTIVE');
          const avgHeat = activeOperatives.length > 0 
            ? activeOperatives.reduce((sum, o) => sum + o.heatLevel, 0) / activeOperatives.length 
            : 0;

          if (useMirrorStore.getState().registerCIAPatterns) {
              useMirrorStore.getState().registerCIAPatterns(mostTargetedNation, mostUsedOpType, avgHeat);
          }
      }
  },

  // SELECTORS
  cia_getActiveOperatives: () => get().cia_operatives.filter(o => o.status === 'ACTIVE'),
  cia_getOperativesInNation: (nationId) => get().cia_operatives.filter(o => o.nationId === nationId),
  cia_getActiveOperations: () => get().cia_operations.filter(o => o.status === 'ACTIVE'),
  cia_getOperationsByType: (type) => get().cia_operations.filter(o => o.type === type),
  cia_getAssetsInNation: (nationId) => get().cia_assets.filter(a => a.nationId === nationId),
  cia_getRecruitedAssets: () => get().cia_assets.filter(o => o.status === 'RECRUITED'),
  cia_getUnresolvedBlowback: () => get().cia_blowbackEvents.filter(b => !b.isResolved),
  cia_getStationInNation: (nationId) => get().cia_stations.find(s => s.nationId === nationId) || null,
  cia_getDirectorBriefing: () => get().cia_directorBriefingLog,
}));
