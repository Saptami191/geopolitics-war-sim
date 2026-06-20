import { create } from 'zustand';
import { produce } from 'immer';
import { 
  CyberGroup, KillChainOperation, PersistentAccessNode, AttributionInvestigation, 
  CyberAlert, AccessLevel, FalseTrail, KillChainStage, CyberObjectiveType, InfrastructureSector
} from '../types';
import { useWorldStore } from './worldStore';
import { useSigintStore } from './sigintStore';
import { useEWStore } from './ewStore';

export interface APTState {
  cyberGroups: Record<string, CyberGroup>;
  killChainOperations: Record<string, KillChainOperation>;
  persistentAccessNodes: Record<string, PersistentAccessNode>;
  operationHistory: KillChainOperation[];
  attributionInvestigations: Record<string, AttributionInvestigation>;
  globalCyberThreatLevel: number;
  cyberAlerts: CyberAlert[];

  createCyberGroup: (params: Partial<CyberGroup>) => string;
  disbandCyberGroup: (groupId: string) => void;
  launchOperation: (params: { groupId: string; targetCountryId: string; targetSector: InfrastructureSector; objectiveType: CyberObjectiveType; payloadId?: string; targetSystemId?: string }) => string;
  advanceKillChain: (operationId: string) => void;
  abortOperation: (operationId: string) => void;
  plantFalseTrail: (operationId: string, mimickedGroupId: string) => string;
  exposeFalseTrail: (falseTrailId: string, operationId: string) => void;
  establishPersistentAccess: (operationId: string, nodeParams: Partial<PersistentAccessNode>) => string;
  activatePayload: (nodeId: string) => void;
  dormantizeAccess: (nodeId: string) => void;
  detectOperation: (operationId: string, detectedBy: string) => void;
  burnGroup: (groupId: string) => void;
  investigateAttribution: (operationId: string, targetCountryId: string) => string;
  resolveAttribution: (investigationId: string) => void;
  tickAPT: () => void;
  
  resolveKillChainStage: (operationId: string) => void;
  calculateDetectionRisk: (operationId: string) => number;
  calculateAttributionConfidence: (operationId: string, investigatingCountryId: string) => number;
  applyDwellTimeGains: (operationId: string) => void;
}

const STAGE_ORDER: KillChainStage[] = [
  'RECONNAISSANCE',
  'WEAPONIZATION',
  'DELIVERY',
  'EXPLOITATION',
  'INSTALLATION',
  'COMMAND_AND_CONTROL',
  'ACTIONS_ON_OBJECTIVES'
];

export const useAPTStore = create<APTState>((set, get) => ({
  cyberGroups: {},
  killChainOperations: {},
  persistentAccessNodes: {},
  operationHistory: [],
  attributionInvestigations: {},
  globalCyberThreatLevel: 0,
  cyberAlerts: [],

  createCyberGroup: (params) => {
    const id = `APT-${Date.now()}-${Math.floor(Math.random() * 100)}`;
    set(produce((state: APTState) => {
      state.cyberGroups[id] = {
        id,
        name: params.name || 'Unknown Group',
        countryId: params.countryId || 'UNKNOWN',
        archetype: params.archetype || 'HACKTIVIST',
        specializations: params.specializations || [],
        operativeCount: params.operativeCount || 10,
        techLevel: params.techLevel || 1,
        currentOperations: [],
        zeroDaysHeld: params.zeroDaysHeld || 0,
        malwareInventory: params.malwareInventory || [],
        discoveredBy: [],
        attributionConfidence: {},
        coverProfile: params.coverProfile || 'None',
        isActive: true,
        burnProbabilityPerTick: params.burnProbabilityPerTick || 0.05,
        lastOperationTick: 0
      };
    }));
    return id;
  },

  disbandCyberGroup: (groupId) => set(produce((state: APTState) => {
    if (state.cyberGroups[groupId]) {
      state.cyberGroups[groupId].isActive = false;
    }
  })),

  launchOperation: (params) => {
    const id = `OP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const tick = useWorldStore.getState().currentTick;
    set(produce((state: APTState) => {
      state.killChainOperations[id] = {
        id,
        groupId: params.groupId,
        targetCountryId: params.targetCountryId,
        targetSector: params.targetSector,
        targetSystemId: params.targetSystemId || null,
        currentStage: 'RECONNAISSANCE',
        stageProgress: 0,
        stagesCompleted: [],
        dwellTicksAccumulated: 0,
        dwellTicksTarget: 30, // Default baseline based on true-dwell
        isDetected: false,
        detectedAtTick: null,
        detectedBySector: null,
        attributionConfidence: 0,
        falseTrailsActive: [],
        objectiveType: params.objectiveType,
        payloadId: params.payloadId || null,
        accessLevel: 'NONE',
        lateralMovementNodes: 0,
        startedAtTick: tick,
        exfiltrationDataGb: 0,
        isComplete: false,
        completedAtTick: null,
        outcomeSummary: null
      };
      
      const group = state.cyberGroups[params.groupId];
      if (group && !group.currentOperations.includes(id)) {
        group.currentOperations.push(id);
        group.lastOperationTick = tick;
      }
    }));
    return id;
  },

  advanceKillChain: (operationId) => {
    get().resolveKillChainStage(operationId);
  },

  abortOperation: (operationId) => set(produce((state: APTState) => {
    const op = state.killChainOperations[operationId];
    if (op && !op.isComplete) {
      op.isComplete = true;
      op.outcomeSummary = 'ABORTED';
      op.completedAtTick = useWorldStore.getState().currentTick;
      state.operationHistory.push(op);
      delete state.killChainOperations[operationId];
    }
  })),

  plantFalseTrail: (operationId, mimickedGroupId) => {
    const id = `FT-${Date.now()}`;
    set(produce((state: APTState) => {
      const op = state.killChainOperations[operationId];
      if (op) {
        op.falseTrailsActive.push({
          id,
          plantedByGroupId: op.groupId,
          mimickedGroupId,
          mimickedCountryId: state.cyberGroups[mimickedGroupId]?.countryId || 'UNKNOWN',
          convincingnessScore: 50 + (state.cyberGroups[op.groupId]?.techLevel || 1) * 10,
          isExposed: false,
          exposedAtTick: null
        });
      }
    }));
    return id;
  },

  exposeFalseTrail: (falseTrailId, operationId) => set(produce((state: APTState) => {
    const op = state.killChainOperations[operationId];
    if (op) {
      const ft = op.falseTrailsActive.find((f: FalseTrail) => f.id === falseTrailId);
      if (ft) {
        ft.isExposed = true;
        ft.exposedAtTick = useWorldStore.getState().currentTick;
      }
    }
  })),

  establishPersistentAccess: (operationId, nodeParams) => {
    const id = `PAN-${Date.now()}`;
    set(produce((state: APTState) => {
      state.persistentAccessNodes[id] = {
        id,
        operationId,
        targetCountryId: nodeParams.targetCountryId || 'UNKNOWN',
        targetSectorId: nodeParams.targetSectorId || 'COMMUNICATIONS',
        systemType: nodeParams.systemType || 'GenericOS',
        implantType: nodeParams.implantType || 'BACKDOOR',
        isActive: true,
        isDetected: false,
        detectionRisk: nodeParams.detectionRisk || 0.05,
        accessLevel: nodeParams.accessLevel || 'INITIAL',
        dwellTicksActive: 0,
        canTriggerPayload: nodeParams.canTriggerPayload || false,
        payloadReady: nodeParams.payloadReady || false,
        lastActivityTick: useWorldStore.getState().currentTick
      };
    }));
    return id;
  },

  activatePayload: (nodeId) => set(produce((state: APTState) => {
    const node = state.persistentAccessNodes[nodeId];
    if (node && node.canTriggerPayload) {
      node.payloadReady = true;
    }
  })),

  dormantizeAccess: (nodeId) => set(produce((state: APTState) => {
    const node = state.persistentAccessNodes[nodeId];
    if (node) {
      node.isActive = false; // Drops detection risk significantly
    }
  })),

  detectOperation: (operationId, detectedBy) => set(produce((state: APTState) => {
    const op = state.killChainOperations[operationId];
    if (op && !op.isDetected) {
      op.isDetected = true;
      op.detectedAtTick = useWorldStore.getState().currentTick;
      op.detectedBySector = detectedBy;
      
      state.cyberAlerts.unshift({
        id: `ALT-${Date.now()}`,
        title: 'Cyber Intrusion Detected',
        description: `Anomalous activity detected in ${op.targetCountryId} ${op.targetSector}.`,
        severity: 'HIGH',
        tick: useWorldStore.getState().currentTick,
        read: false
      });
      
      // Auto-investigate
      get().investigateAttribution(operationId, op.targetCountryId);
    }
  })),

  burnGroup: (groupId) => set(produce((state: APTState) => {
    const group = state.cyberGroups[groupId];
    if (group) {
      group.isActive = false;
      group.burnProbabilityPerTick = 1.0;
    }
  })),

  investigateAttribution: (operationId, targetCountryId) => {
    const id = `ATT-${Date.now()}`;
    set(produce((state: APTState) => {
      state.attributionInvestigations[id] = {
        id,
        targetCountryId,
        operationId,
        startTick: useWorldStore.getState().currentTick,
        ticksRequired: 10, // Adjusted by SIGINT
        currentConfidence: 0,
        pointingAt: [],
        falseTrailsInfluencing: [],
        isComplete: false,
        conclusionCountryId: null,
        conclusionAccuracy: false
      };
    }));
    return id;
  },

  resolveAttribution: (investigationId) => set(produce((state: APTState) => {
    const inv = state.attributionInvestigations[investigationId];
    if (inv && !inv.isComplete) {
      inv.isComplete = true;
      const op = state.killChainOperations[inv.operationId] || state.operationHistory.find((o: KillChainOperation) => o.id === inv.operationId);
      
      if (op) {
        const group = state.cyberGroups[op.groupId];
        
        let targetId = group ? group.countryId : null;
        
        // Handle false trails
        if (op.falseTrailsActive.length > 0) {
          const activeTrail = op.falseTrailsActive.find((ft: FalseTrail) => !ft.isExposed);
          if (activeTrail && activeTrail.convincingnessScore > 60 && Math.random() > 0.5) {
            targetId = activeTrail.mimickedCountryId; // Bad attribution
          }
        }
        
        if (inv.currentConfidence > 70) {
          inv.conclusionCountryId = targetId;
          inv.conclusionAccuracy = targetId === group?.countryId;
          
          if (targetId) {
             useWorldStore.getState().addGlobalEvent(`[CYBER] ${inv.targetCountryId} attributes attack to ${targetId}`, 'WARNING');
          }
        } else {
          inv.conclusionCountryId = null; // Inconclusive
        }
      }
    }
  })),

  // TICK CYCLE
  tickAPT: () => {
    const state = get();
    const tick = useWorldStore.getState().currentTick;
    
    // 1. Advance Active Kill Chains
    Object.keys(state.killChainOperations).forEach(opId => {
      const op = state.killChainOperations[opId];
      if (!op.isComplete) {
        state.advanceKillChain(opId);
        
        if (op.currentStage === 'COMMAND_AND_CONTROL' || op.currentStage === 'ACTIONS_ON_OBJECTIVES') {
          op.dwellTicksAccumulated++;
          state.applyDwellTimeGains(opId);
          
          // Detection Risk Roll
          const risk = state.calculateDetectionRisk(opId);
          if (Math.random() < risk && !op.isDetected) {
            state.detectOperation(opId, op.targetSector);
          }
        }
      }
    });
    
    // 2. Attribution Investigations
    Object.keys(state.attributionInvestigations).forEach(invId => {
      const inv = state.attributionInvestigations[invId];
      if (!inv.isComplete) {
        // Increment confidence based on time and intelligence
        inv.currentConfidence += (Math.random() * 5); // Base increase
        
        const sigint = useSigintStore.getState().observations; // Valid property
        if (sigint && Object.keys(sigint).length > 3) {
           inv.currentConfidence += 2;
        }

        if (tick - inv.startTick >= inv.ticksRequired || inv.currentConfidence >= 100) {
          state.resolveAttribution(invId);
        }
      }
    });
  },

  resolveKillChainStage: (operationId) => set(produce((state: APTState) => {
    const op = state.killChainOperations[operationId];
    if (!op || op.isComplete) return;

    const group = state.cyberGroups[op.groupId];
    if (!group) return;

    // Stage logic
    const stageIdx = STAGE_ORDER.indexOf(op.currentStage);
    const techMultiplier = group.techLevel * 0.2; // Max +1.0

    // Advance progress
    let progressDelta = 20 * (1 + techMultiplier);
    
    op.stageProgress += progressDelta;

    if (op.stageProgress >= 100) {
      if (stageIdx < STAGE_ORDER.length - 1) {
        // Move to next stage
        op.stagesCompleted.push(op.currentStage);
        op.currentStage = STAGE_ORDER[stageIdx + 1];
        op.stageProgress = 0;

        if (op.currentStage === 'EXPLOITATION') {
          op.accessLevel = 'INITIAL';
        } else if (op.currentStage === 'INSTALLATION') {
          op.accessLevel = 'USER';
        } else if (op.currentStage === 'ACTIONS_ON_OBJECTIVES') {
          op.accessLevel = 'ADMIN';
        }
      }
    }
  })),

  calculateDetectionRisk: (operationId) => {
    const state = get();
    const op = state.killChainOperations[operationId];
    if (!op) return 0;
    
    const group = state.cyberGroups[op.groupId];
    const techMod = group ? (6 - group.techLevel) * 0.01 : 0.05;
    
    let baseRisk = 0.02 + techMod;
    
    // Increase risk significantly if detected previously
    if (op.isDetected) {
      baseRisk += 0.5;
    }
    
    // Actions stage is noisy
    if (op.currentStage === 'ACTIONS_ON_OBJECTIVES') {
      baseRisk += 0.05;
    }
    
    return Math.min(baseRisk, 1.0);
  },

  calculateAttributionConfidence: (operationId, investigatingCountryId) => {
    return Math.floor(Math.random() * 100); // Simplistic for now
  },

  applyDwellTimeGains: (operationId) => set(produce((state: APTState) => {
    const op = state.killChainOperations[operationId];
    if (!op || op.currentStage !== 'ACTIONS_ON_OBJECTIVES') return;
    
    // Dwell benefits
    if (op.objectiveType === 'PERSISTENT_ESPIONAGE') {
      op.exfiltrationDataGb += (Math.random() * 5);
      
      // Crosses into other stores via cyberDefenseStore.exportIntelligenceGains
    } else if (op.objectiveType === 'HACK_AND_LEAK') {
      op.exfiltrationDataGb += (Math.random() * 10);
    }
    
    // Lateral movement
    if (op.dwellTicksAccumulated % 5 === 0) {
      op.lateralMovementNodes++;
      if (op.lateralMovementNodes > 5 && op.accessLevel !== 'ROOT') {
        op.accessLevel = 'ROOT';
      }
    }
  }))
}));
