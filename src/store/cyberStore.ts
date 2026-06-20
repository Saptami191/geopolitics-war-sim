import { create } from 'zustand';
import { produce } from 'immer';
import {
  APT_Phase,
  APT_OperationStatus,
  Cyber_TargetType,
  Cyber_EffectType,
  Cyber_ZeroDayStatus,
  Cyber_AttributionConfidence,
  Cyber_AttributionDecision,
  Cyber_InfrastructureStatus,
  Cyber_DefencePosture,
  APT_Group,
  Cyber_ZeroDay,
  APT_Operation,
  Cyber_CascadeEffect,
  Cyber_Tool,
  Cyber_InfrastructureNode,
  Cyber_Incident,
  Cyber_IncidentResponse,
  Cyber_DefenceOperation,
  Cyber_Budget,
  Cyber_ZeroDayMarket
} from '../types';

import { useSigintStore } from './sigintStore';
import { useArachneStore } from './arachneStore';
import { useFinintStore } from './finintStore';
import { useMirrorStore } from './mirrorStore';
import { useWorldStore } from './worldStore';
import { useMilitaryStore } from './militaryStore';
import { useDefconStore } from './defconStore';
import { useDiplomaticStore } from './diplomaticStore';
import { useConsequenceStore } from './consequenceStore';
import { useCiaStore } from './ciaStore';
import { useEWStore } from './ewStore';
import { useEconomyStore } from './economyStore';
import { useSanctionsStore } from './sanctionsStore';
import { usePlayerStore } from './playerStore';
import { useCinematicsStore } from './cinematicsStore';

interface CyberState {
  cyber_aptOperations: APT_Operation[];
  cyber_zeroDays: Cyber_ZeroDay[];
  cyber_tools: Cyber_Tool[];
  cyber_infrastructure: Cyber_InfrastructureNode[];
  cyber_incidents: Cyber_Incident[];
  cyber_defenceOperations: Cyber_DefenceOperation[];
  cyber_aptGroups: APT_Group[];
  cyber_defencePosture: Cyber_DefencePosture;
  cyber_budget: Cyber_Budget;
  cyber_zeroDay_market: Cyber_ZeroDayMarket;
  cyber_attributionQueue: string[];
  cyber_lastProcessedTick: number;
  cyber_totalOperationsLaunched: number;
  cyber_totalIncidentsDetected: number;
  cyber_totalZeroDaysDeployed: number;
  cyber_directorLog: string[];
  cyber2: Cyber2State;
}

interface CyberActions {
  cyber_launchAPTOperation: (
    operation: Omit<APT_Operation, 'id' | 'startTick' | 'completedAtTick' | 'currentPhase' | 'completedPhases' | 'successProbability' | 'detectionRisk' | 'attributionRisk' | 'attributionConfidence' | 'attributionDecision' | 'outcomeDescription' | 'effectMagnitude' | 'cascadeEffects' | 'isDefenderAware' | 'defenderResponseId'>, 
    currentTick: number
  ) => string;
  cyber_acquireZeroDay: (
    zeroDay: Omit<Cyber_ZeroDay, 'id' | 'discoveredAtTick' | 'deployedInOperationId'>,
    currentTick: number
  ) => string;
  cyber_deployTool: (toolId: string, operationId: string) => void;
  cyber_burnTool: (toolId: string, currentTick: number) => void;
  cyber_setDefencePosture: (posture: Cyber_DefencePosture) => void;
  cyber_launchDefenceOperation: (
    operation: Omit<Cyber_DefenceOperation, 'id' | 'status' | 'outcomeDescription'>,
    currentTick: number
  ) => string;
  cyber_initInfrastructureNode: (
    node: Omit<Cyber_InfrastructureNode, 'id' | 'activeIntrusionIds' | 'lastAuditTick'>,
    currentTick: number
  ) => string;
  cyber_declareAttribution: (
    incidentId: string,
    decision: Cyber_AttributionDecision,
    currentTick: number
  ) => void;
  cyber_respondToIncident: (
    incidentId: string,
    responseId: string,
    currentTick: number
  ) => void;
  cyber_refreshZeroDayMarket: (currentTick: number) => void;
  cyber_processTick: (currentTick: number) => void;
  
  cyber_getActiveAPTOperations: () => APT_Operation[];
  cyber_getOperationsByNation: (nationId: string) => APT_Operation[];
  cyber_getClassifiedZeroDays: () => Cyber_ZeroDay[];
  cyber_getCompromisedInfrastructure: () => Cyber_InfrastructureNode[];
  cyber_getActiveIncidents: () => Cyber_Incident[];
  cyber_getAttributionQueue: () => Cyber_Incident[];
  cyber_getKnownAPTGroups: () => APT_Group[];
  cyber_getDefenceOperationsActive: () => Cyber_DefenceOperation[];
  cyber_getDirectorLog: () => string[];
}

export function cyber_generateAPTCodename(targetType: Cyber_TargetType, effectType: Cyber_EffectType, tick: number): string {
  const adjectives = ['SILENT', 'PHANTOM', 'GHOST', 'IRON', 'VOLT', 'CRYSTAL', 'DARK', 'VELVET', 'BURNING', 'HOLLOW', 'FROZEN', 'SHADOW', 'ANCIENT', 'COMET', 'BLIZZARD', 'PANDA', 'BEAR', 'TIGER', 'ACID', 'CARBON', 'NOBLE', 'SABLE'];
  let nouns = ['PROTOCOL', 'VECTOR', 'BEACON', 'NODE', 'THREAD'];
  if (targetType === 'POWER_GRID') nouns = ['GRID', 'SURGE', 'WATT', 'CIRCUIT'];
  else if (targetType === 'FINANCIAL_SYSTEM') nouns = ['LEDGER', 'VAULT', 'WIRE', 'COIN'];
  else if (targetType === 'MILITARY_C2') nouns = ['TYPHOON', 'TEMPEST', 'STORM', 'SIGNAL'];
  else if (targetType === 'GOVERNMENT_NETWORK') nouns = ['PRISM', 'WINDOW', 'DOOR', 'ARCHIVE'];
  else if (targetType === 'INTELLIGENCE_AGENCY') nouns = ['MIRROR', 'ECHO', 'VEIL', 'CIPHER'];
  
  return `${adjectives[tick % adjectives.length]} ${nouns[(tick + targetType.length) % nouns.length]}`;
}

export function cyber_generateAPTGroupCodename(nationId: string, sophisticationScore: number): string {
  const adjectives = ['FANCY', 'COZY', 'SANDWORM', 'BERSERK', 'CHARMING', 'TORTOISESHELL', 'OILRIG', 'VOLT', 'BRONZE', 'GRANITE', 'TITAN', 'SCATTERED', 'LOTUS'];
  const nouns = ['BEAR', 'KITTEN', 'TYPHOON', 'PANDA', 'SPIDER', 'DRAGON', 'WOLF', 'CRANE', 'FALCON', 'LYNX', 'VIPER', 'JACKAL'];
  
  const h1 = nationId.charCodeAt(0) % adjectives.length;
  const h2 = Math.floor(sophisticationScore) % nouns.length;
  const aptNum = (nationId.charCodeAt(0) % 40) + 1;
  
  return `${adjectives[h1]} ${nouns[h2]} (APT${aptNum})`;
}

export function cyber_generatePhaseNarrative(phase: APT_Phase, operation: APT_Operation, isDetected: boolean): string {
  switch (phase) {
     case 'RECONNAISSANCE': return `Phase 1 — RECONNAISSANCE. Passive collection underway against ${operation.targetNationId}'s ${operation.targetType} network. Scanning external attack surface. No active intrusion — clean. Estimated completion: ${operation.estimatedCompletionTick - operation.startTick} ticks. Detection risk: ${operation.detectionRisk}%.`;
     case 'INITIAL_ACCESS': return `Phase 2 — INITIAL ACCESS. Deploying exploit against identified entry vector. Target: ${operation.targetType} network. Zero-day engaged. Foothold pending. This is the highest-risk moment. One anomaly and the operation is burned.`;
     case 'PERSISTENCE': return `Phase 3 — PERSISTENCE. Implant deployed. Maintaining access. Beacon interval: randomised. Traffic blended with legitimate activity. They don't know we're here. Yet.`;
     case 'LATERAL_MOVEMENT': return `Phase 4 — LATERAL MOVEMENT. Traversing internal network. Credentials harvested. This is where most operations are caught. Proceed with discipline.`;
     case 'PRIVILEGE_ESCALATION': return `Phase 5 — PRIVILEGE ESCALATION. Elevating access to admin tier. Required: root/domain admin. Once achieved — the network is ours.`;
     case 'EXECUTION': return `Phase 6 — EXECUTION. Payload staged and ready. Target: ${operation.targetType}. Effect: ${operation.effectType}. This is the point of no return. Authorisation required to proceed to detonation.`;
     case 'EXFILTRATION': return `Phase 7 — EXFILTRATION. Data package prepared. Moving material out of target network. Slowly. Speed creates signatures.`;
     case 'IMPACT': return `Phase 8 — IMPACT. Payload delivered. ${operation.targetType} systems responding to the payload. Effects are propagating. Monitoring for cascade. Attribution clock has started.`;
  }
}

export function cyber_generateIncidentAlert(incident: Cyber_Incident, node: Cyber_InfrastructureNode): string {
  switch (incident.type) {
    case 'INTRUSION_DETECTED': return `[CRITICAL] INTRUSION DETECTED — ${node.targetType} network. Anomalous activity pattern identified at [Tick ${incident.detectedAtTick}]. Attribution confidence: ${incident.attributionConfidence}. Affected system: ${node.id}. Immediate containment recommended.`;
    case 'DATA_BREACH': return `[CRITICAL] DATA BREACH — Unauthorised exfiltration detected from ${node.targetType} network. Source: ${incident.attackingNationId || 'UNKNOWN'}. Incident severity: ${incident.damageScore}. Legal notification required.`;
    case 'DESTRUCTIVE_ATTACK': return `[EMERGENCY] DESTRUCTIVE ATTACK — ${node.targetType} infrastructure under active destructive assault. Wiper/payload detonated. Attribution: ${incident.attributionConfidence}. DEFCON review initiated.`;
    default: return `[CRITICAL] INFRASTRUCTURE ATTACK — ${node.targetType} under sustained assault. Current availability: ${100 - incident.damageScore}%. Source: ${incident.attackingNationId || 'UNKNOWN'}.`;
  }
}

export function cyber_applyOperationEffect(
  operation: APT_Operation,
  magnitude: number,
  currentTick: number,
  externalStores: any
): Cyber_CascadeEffect[] {
  const cascades: Cyber_CascadeEffect[] = [];
  const logMsg = (msg: string) => { useCyberStore.getState().cyber_directorLog.unshift(`[Tick ${currentTick}] ${msg}`); };

  if (operation.effectType === 'DATA_EXFILTRATION') {
     // Push to sigintStore
     const st = useSigintStore.getState();
     if (st && (st as any).u8200Signals) {
        useSigintStore.setState(produce(draft => {
           (draft as any).u8200Signals.push({
              id: `sig_cyber_${Date.now()}`,
              sourceNationId: operation.targetNationId,
              channel: 'CYBER',
              category: 'CYBER_INTELLIGENCE_PRODUCT',
              rawContent: 'Exfiltrated network intel',
              confidence: magnitude > 50 ? 'CONFIRMED' : 'HIGH',
              status: 'NEW',
              detectedAtTick: currentTick,
              expiresAtTick: currentTick + 30,
              patternOfLifeFlag: false
           });
        }));
     }
     cascades.push({ targetType: 'INTELLIGENCE_AGENCY', affectedNationId: operation.targetNationId, magnitudeDelta: -15, description: 'Intelligence agency degraded', triggeredAtTick: currentTick });
     logMsg(`EXFILTRATION COMPLETE — Data extracted from ${operation.targetNationId}'s ${operation.targetType} network.`);
  } else if ((operation.effectType as string) === 'DESTRUCTIVE_PAYLOAD' || (operation.effectType as string) === 'RANSOMWARE' || (operation.effectType as string) === 'WIPER') {
     useWorldStore.getState().addGlobalEvent(`CYBER DESTRUCTIVE PAYLOAD DETONATED: ${operation.targetType} offline.`, 'CRITICAL');
     logMsg(`DESTRUCTIVE PAYLOAD DETONATED — ${operation.targetNationId}'s ${operation.targetType} infrastructure has been compromised. Estimated recovery time: 10 ticks.`);
  } else if (operation.effectType === 'DENIAL_OF_SERVICE') {
     logMsg(`DENIAL OF SERVICE — ${operation.targetNationId}'s ${operation.targetType} is degraded. Availability: ${100 - magnitude}%.`);
  } else if (operation.effectType === 'MILITARY_DEGRADATION') {
     logMsg(`MILITARY NETWORK COMPROMISED — ${operation.targetNationId}'s command and control degraded.`);
  } else if (operation.effectType === 'COMMAND_DISRUPTION') {
     logMsg(`COMMAND DISRUPTION SUCCESSFUL — ${operation.targetNationId}'s military C2 is unreliable.`);
  } else if (operation.effectType === 'FINANCIAL_DISRUPTION') {
     logMsg(`FINANCIAL SYSTEM ATTACK — ${operation.targetNationId}'s banking infrastructure disrupted.`);
  } else if (operation.effectType === 'ESPIONAGE' || operation.effectType === 'ACCESS_PERSISTENCE') {
     logMsg(`PERSISTENT ACCESS ESTABLISHED — ${operation.targetNationId}'s ${operation.targetType} network is yours.`);
  } else if (operation.effectType === 'INFLUENCE_OPERATION') {
     logMsg(`INFLUENCE OPERATION ACTIVE — narrative seeded in ${operation.targetNationId}'s information environment.`);
  }
  
  if (magnitude >= 80) {
    if (operation.effectType === 'DESTRUCTIVE_PAYLOAD') {
      useCinematicsStore.getState().triggerCinematic('GHOST_PROTOCOL_SUCCESSFUL_IMPACT', { operationId: operation.id });
    }
  }

  return cascades;
}

const PHASES: APT_Phase[] = ['RECONNAISSANCE', 'INITIAL_ACCESS', 'PERSISTENCE', 'LATERAL_MOVEMENT', 'PRIVILEGE_ESCALATION', 'EXECUTION', 'EXFILTRATION', 'IMPACT'];

export const useCyberStore = create<CyberState & CyberActions>()(
  (set, get) => ({
    cyber_aptOperations: [],
    cyber_zeroDays: [],
    cyber_tools: [],
    cyber_infrastructure: [],
    cyber_incidents: [],
    cyber_defenceOperations: [],
    cyber_aptGroups: [],
    cyber_defencePosture: 'PASSIVE',
    cyber_budget: { totalAllocated: 700, offensiveSpent: 0, defensiveSpent: 0, zeroDayAcquisitionSpent: 0, remaining: 700 },
    cyber_zeroDay_market: { availableZeroDays: [], lastRefreshTick: 0, blackMarketAccess: false, allyShareAvailable: false, priceModifier: 1.0 },
    cyber_attributionQueue: [],
    cyber_lastProcessedTick: -1,
    cyber_totalOperationsLaunched: 0,
    cyber_totalIncidentsDetected: 0,
    cyber_totalZeroDaysDeployed: 0,
    cyber_directorLog: [],

    cyber_launchAPTOperation: (operation, currentTick) => {
       const id = `apt_op_${Date.now()}_${Math.floor(Math.random()*1000)}`;
       set(produce(draft => {
           draft.cyber_budget.remaining -= operation.operationCost;
           draft.cyber_budget.offensiveSpent += operation.operationCost;
           
           draft.cyber_aptOperations.push({
               ...operation,
               id,
               startTick: currentTick,
               completedAtTick: null,
               currentPhase: 'RECONNAISSANCE',
               completedPhases: [],
               successProbability: 50,
               detectionRisk: operation.phaseDetectionRisk['RECONNAISSANCE'] || 10,
               attributionRisk: 10,
               attributionConfidence: 'UNATTRIBUTED',
               attributionDecision: null,
               outcomeDescription: null,
               effectMagnitude: null,
               cascadeEffects: [],
               isDefenderAware: false,
               defenderResponseId: null
           });
           
           operation.assignedZeroDayIds.forEach(zdId => {
              const zd = draft.cyber_zeroDays.find(z => z.id === zdId);
              if (zd) zd.status = 'DEPLOYED';
           });
           
           draft.cyber_totalOperationsLaunched++;
           useWorldStore.getState().addGlobalEvent(`CYBER_OPERATION_LAUNCHED: ${operation.codename}`, 'INFO');
           
           if (draft.cyber_totalOperationsLaunched === 1) {
              useCinematicsStore.getState().triggerCinematic('GHOST_PROTOCOL_FIRST_OPERATION', { id });
           }
       }));
       return id;
    },

    cyber_acquireZeroDay: (zeroDay, currentTick) => {
       const id = `zd_${Date.now()}`;
       set(produce(draft => {
          draft.cyber_budget.remaining -= zeroDay.acquisitionCost;
          draft.cyber_budget.zeroDayAcquisitionSpent += zeroDay.acquisitionCost;
          draft.cyber_zeroDays.push({ ...zeroDay, id, discoveredAtTick: currentTick, deployedInOperationId: null });
       }));
       return id;
    },

    cyber_deployTool: (toolId, operationId) => set(produce(draft => {
       const op = draft.cyber_aptOperations.find(o => o.id === operationId);
       if (op && !op.assignedToolIds.includes(toolId)) op.assignedToolIds.push(toolId);
    })),

    cyber_burnTool: (toolId, currentTick) => set(produce(draft => {
       const t = draft.cyber_tools.find(tool => tool.id === toolId);
       if (t) {
          t.isBurned = true;
          t.burnedAtTick = currentTick;
       }
    })),

    cyber_setDefencePosture: (posture) => set(produce(draft => {
       draft.cyber_defencePosture = posture;
       if (posture === 'OFFENSIVE_DEFENCE') {
          useCinematicsStore.getState().triggerCinematic('GHOST_PROTOCOL_HACK_BACK_AUTHORITY', {});
       }
    })),

    cyber_launchDefenceOperation: (operation, currentTick) => {
       const id = `def_op_${Date.now()}`;
       set(produce(draft => {
          draft.cyber_budget.remaining -= operation.cost;
          draft.cyber_budget.defensiveSpent += operation.cost;
          draft.cyber_defenceOperations.push({ ...operation, id, status: 'ACTIVE' });
       }));
       return id;
    },

    cyber_initInfrastructureNode: (node, currentTick) => {
       const id = `infra_node_${Date.now()}_${Math.floor(Math.random()*1000)}`;
       set(produce(draft => {
          draft.cyber_infrastructure.push({ ...node, id, activeIntrusionIds: [], lastAuditTick: currentTick });
       }));
       return id;
    },

    cyber_declareAttribution: (incidentId, decision, currentTick) => set(produce(draft => {
       const inc = draft.cyber_incidents.find(i => i.id === incidentId);
       if (inc) {
          draft.cyber_attributionQueue = draft.cyber_attributionQueue.filter(x => x !== incidentId);
          if (decision === 'PUBLIC_ATTRIBUTION') {
             useWorldStore.getState().addGlobalEvent(`CYBER_ATTRIBUTION_DECISION: Public attribution of ${incidentId}`, 'CRITICAL');
          } else if (decision === 'PRIVATE_ATTRIBUTION') {
             // backchannel handling
          }
       }
    })),

    cyber_respondToIncident: (incidentId, responseId, currentTick) => set(produce(draft => {
       const inc = draft.cyber_incidents.find(i => i.id === incidentId);
       if (inc) {
          inc.chosenResponseId = responseId;
          inc.resolvedAtTick = currentTick;
       }
    })),

    cyber_refreshZeroDayMarket: (currentTick) => set(produce(draft => {
       draft.cyber_zeroDay_market.lastRefreshTick = currentTick;
       draft.cyber_zeroDay_market.availableZeroDays = [
           { id: `m_zd_${Date.now()}_1`, codename: 'SILENT_SPRING', targetSystem: 'WIN32K', targetSector: ['POWER_GRID', 'FINANCIAL_SYSTEM'], exploitabilityScore: 75, detectionDifficulty: 80, status: 'CLASSIFIED', discoveredAtTick: currentTick, deployedInOperationId: null, estimatedPatchWindow: 15, acquisitionCost: 200, sourceType: 'PURCHASED', linkedAPTGroupId: null },
           { id: `m_zd_${Date.now()}_2`, codename: 'GHOST_ROOT', targetSystem: 'LINUX_KERNEL', targetSector: ['MILITARY_C2'], exploitabilityScore: 85, detectionDifficulty: 90, status: 'CLASSIFIED', discoveredAtTick: currentTick, deployedInOperationId: null, estimatedPatchWindow: 10, acquisitionCost: 350, sourceType: 'PURCHASED', linkedAPTGroupId: null }
       ];
    })),

    cyber_processTick: (currentTick) => set(produce(draft => {
       if (draft.cyber_lastProcessedTick === currentTick) return;

       draft.cyber_aptOperations.forEach(op => {
          if (op.status === 'ACTIVE') {
              op.successProbability = 50; 
              op.detectionRisk = op.phaseDetectionRisk[op.currentPhase] || 20;
              
              if (Math.random() < (op.detectionRisk / 100) * 0.12) {
                 op.isDefenderAware = true;
                 if (Math.random() < 0.2) {
                    op.attributionConfidence = 'HIGH';
                    op.status = 'ATTRIBUTED';
                    useWorldStore.getState().addGlobalEvent(`CYBER_OPERATION_ATTRIBUTED: ${op.codename}`, 'WARNING');
                    draft.cyber_attributionQueue.push(op.id);
                    useCinematicsStore.getState().triggerCinematic('GHOST_PROTOCOL_ATTRIBUTION', { operationId: op.id });
                 } else if (op.status !== 'ATTRIBUTED') {
                    op.status = 'STALLED';
                 }
              }

              if (currentTick >= op.startTick + (op.phaseDurationTicks[op.currentPhase] || 10)) {
                 op.completedPhases.push(op.currentPhase);
                 if (op.currentPhase === 'IMPACT' || op.currentPhase === 'EXFILTRATION') {
                    if (Math.random() < op.successProbability / 100) {
                       op.status = 'SUCCEEDED';
                       op.effectMagnitude = 85; 
                       op.completedAtTick = currentTick;
                       op.cascadeEffects = cyber_applyOperationEffect(op, op.effectMagnitude, currentTick, {});
                       useWorldStore.getState().addGlobalEvent(`CYBER_OPERATION_SUCCEEDED: ${op.codename}`, 'CRITICAL');
                    } else {
                       op.status = 'FAILED';
                       useWorldStore.getState().addGlobalEvent(`CYBER_OPERATION_FAILED: ${op.codename}`, 'WARNING');
                    }
                 } else {
                    const nextIdx = PHASES.indexOf(op.currentPhase) + 1;
                    if (nextIdx < PHASES.length) op.currentPhase = PHASES[nextIdx];
                    if (op.currentPhase === 'EXECUTION') {
                       useWorldStore.getState().addGlobalEvent(`CYBER_EXECUTION_PHASE: ${op.codename}`, 'WARNING');
                       useCinematicsStore.getState().triggerCinematic('GHOST_PROTOCOL_EXECUTION', { operationId: op.id });
                    }
                    if (op.currentPhase === 'IMPACT') {
                       useWorldStore.getState().addGlobalEvent(`CYBER_IMPACT_IMMINENT: ${op.codename}`, 'CRITICAL');
                    }
                 }
              }
          }
       });

       // AI Adversary Cyber Operations (Step 4)
       const mirrorState = useMirrorStore.getState() as any;
       if (mirrorState && mirrorState.sovereign_agents) {
          const playerNationId = usePlayerStore.getState().countryId;
          Object.values(mirrorState.sovereign_agents).forEach((agent: any) => {
             if (agent.nationId !== playerNationId && agent.sophisticationScore && agent.sophisticationScore > 30) {
                 const prob = (agent.mirrorAdaptationScore / 200) + (agent.threatAssessments?.[playerNationId]?.covertThreatScore || 0) / 300;
                 if (Math.random() < prob * 0.05) { // scale down purely for pacing
                    const eligibleTargets = draft.cyber_infrastructure;
                    if (eligibleTargets.length > 0) {
                        const targetNode = eligibleTargets[Math.floor(Math.random() * eligibleTargets.length)];
                        const incidentId = `inc_ai_${Date.now()}`;
                        draft.cyber_incidents.push({
                           id: incidentId,
                           type: 'INTRUSION_DETECTED',
                           affectedNodeId: targetNode.id,
                           attackingNationId: agent.nationId,
                           attackingAPTGroupId: null,
                           attributionConfidence: 'UNATTRIBUTED',
                           detectedAtTick: currentTick,
                           resolvedAtTick: null,
                           damageScore: 10 + Math.floor(Math.random() * 40),
                           description: `Adversary ${agent.nationId} launched a covert cyber operation against ${targetNode.targetType}.`,
                           responseOptions: [],
                           chosenResponseId: null,
                           isEscalated: false
                        });
                        draft.cyber_totalIncidentsDetected++;
                        useWorldStore.getState().addGlobalEvent(`CYBER_INCIDENT_DETECTED: Target ${targetNode.targetType}`, 'CRITICAL');
                    }
                 }
             }
          });
       }

       draft.cyber_infrastructure.forEach(node => {
          node.vulnerabilityScore = Math.min(100, node.vulnerabilityScore + 0.2);
          if (node.activeIntrusionIds.length > 0) {
             node.vulnerabilityScore += 2;
             if (node.vulnerabilityScore >= 100) {
                node.status = 'DESTROYED';
                useCinematicsStore.getState().triggerCinematic('GHOST_PROTOCOL_INFRASTRUCTURE_DESTROYED', { nodeId: node.id });
                useWorldStore.getState().addGlobalEvent(`CYBER_INFRASTRUCTURE_DESTROYED: ${node.id}`, 'CRITICAL');
             }
          }
       });

       draft.cyber_defenceOperations.forEach(defOp => {
          if (defOp.status === 'ACTIVE' && currentTick >= defOp.startTick + defOp.durationTicks) {
             defOp.status = 'COMPLETED';
             useWorldStore.getState().addGlobalEvent(`CYBER_DEFENCE_OPERATION_COMPLETED: ${defOp.type}`, 'INFO');
          }
       });

       if (currentTick - draft.cyber_zeroDay_market.lastRefreshTick >= 20) {
           draft.cyber_zeroDay_market.lastRefreshTick = currentTick;
       }

       draft.cyber_lastProcessedTick = currentTick;
    })),

    cyber_getActiveAPTOperations: () => get().cyber_aptOperations.filter(o => o.status === 'ACTIVE'),
    cyber_getOperationsByNation: (nationId) => get().cyber_aptOperations.filter(o => o.targetNationId === nationId || o.sponsoringNationId === nationId),
    cyber_getClassifiedZeroDays: () => get().cyber_zeroDays.filter(z => z.status === 'CLASSIFIED'),
    cyber_getCompromisedInfrastructure: () => get().cyber_infrastructure.filter(i => i.status === 'COMPROMISED' || i.status === 'DEGRADED' || i.status === 'DESTROYED'),
    cyber_getActiveIncidents: () => get().cyber_incidents.filter(i => i.resolvedAtTick === null),
    cyber_getAttributionQueue: () => get().cyber_incidents.filter(i => get().cyber_attributionQueue.includes(i.id)),
    cyber_getKnownAPTGroups: () => get().cyber_aptGroups.filter(g => g.isAttributed),
    cyber_getDefenceOperationsActive: () => get().cyber_defenceOperations.filter(d => d.status === 'ACTIVE'),
    cyber_getDirectorLog: () => get().cyber_directorLog
  })
);
