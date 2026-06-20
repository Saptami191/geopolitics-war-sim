import { 
  Cyber_ResilienceRecord,
  Cyber_InfrastructureNode
} from '../types';

export function initResilienceRecord(node: Cyber_InfrastructureNode, tick: number): Cyber_ResilienceRecord {
  return {
    nodeId: node.id,
    currentRecoveryStrategy: null,
    redundancyScore: 50,
    isolationCapability: 50,
    backupFreshnessTick: tick,
    estimatedRecoveryTicks: 10,
    isInRecovery: false,
    recoveryStartedAtTick: null,
    recoveryCompletedAtTick: null
  };
}
