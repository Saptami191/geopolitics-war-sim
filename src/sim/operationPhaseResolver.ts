import { CIAOperation, OperationPhase } from '../types';

export function advanceOperationPhase(operation: CIAOperation, currentTick: number): OperationPhase {
  // If the operation is not ACTIVE or has already finished, return COMPLETE or their completed phase
  if (
    operation.status === 'SUCCEEDED' ||
    operation.status === 'PARTIALLY_SUCCEEDED' ||
    operation.status === 'FAILED' ||
    operation.status === 'BLOWN' ||
    operation.status === 'ABORTED'
  ) {
    return 'COMPLETE';
  }

  const elapsed = currentTick - operation.startTick;
  const duration = operation.estimatedDurationTicks || 10;
  
  if (elapsed < 0) {
    return 'PREPARATION';
  }

  const pct = elapsed / duration;

  if (pct >= 1.0) {
    return 'COMPLETE';
  } else if (pct >= 0.75) {
    return 'EXFILTRATION';
  } else if (pct >= 0.45) {
    return 'EXECUTION';
  } else if (pct >= 0.20) {
    return 'INFILTRATION';
  } else {
    return 'PREPARATION';
  }
}

export function getPhaseDetectionMultiplier(phase: OperationPhase): number {
  switch (phase) {
    case 'PREPARATION':
      return 0.5;
    case 'INFILTRATION':
      return 0.8;
    case 'EXECUTION':
      return 1.5;
    case 'EXFILTRATION':
      return 1.2;
    case 'COMPLETE':
      return 0.0; // Concluded operations are inactive, no recurring detection risk
    default:
      return 1.0;
  }
}

export function getPhaseSuccessModifier(phase: OperationPhase): number {
  switch (phase) {
    case 'PREPARATION':
      return -10; // preparing, objectives not yet operational
    case 'INFILTRATION':
      return -5;  // establishing secure lines
    case 'EXECUTION':
      return 0;   // normal operational baseline
    case 'EXFILTRATION':
      return 5;   // wrapping up loose ends, consolidating results
    case 'COMPLETE':
      return 15;  // full operational closure
    default:
      return 0;
  }
}

export function getPhaseDisplayLabel(phase: OperationPhase): string {
  switch (phase) {
    case 'PREPARATION':
      return 'PREP PHASE';
    case 'INFILTRATION':
      return 'INFILTRATION';
    case 'EXECUTION':
      return 'ACTIVE EXECUTION';
    case 'EXFILTRATION':
      return 'EXFIL PHASE';
    case 'COMPLETE':
      return 'CONCLUDED';
    default:
      return 'UNKNOWN';
  }
}
