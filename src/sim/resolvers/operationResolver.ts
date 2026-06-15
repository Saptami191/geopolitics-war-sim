import { CanonicalWorld, OperationState } from '../../types';

export function resolveOperations(world: CanonicalWorld, currentTick: number): { updatedOperations: Record<string, OperationState>; logs: string[] } {
  const updatedOperations = { ...world.operationsById };
  const logs: string[] = [];

  Object.keys(updatedOperations).forEach((id) => {
    const op = { ...updatedOperations[id] };

    if (op.status === 'ACTIVE') {
      // Risk profiles accumulation
      op.attributionRisk = Math.min(100, op.attributionRisk + (Math.random() > 0.5 ? 2 : 1));
      op.secrecyLevel = Math.max(0, op.secrecyLevel - 1);

      // Check progression towards projectedEndTick
      if (currentTick >= op.projectedEndTick) {
        // Resolve operation
        const roll = Math.random() * 100;
        if (roll < 65) {
          op.status = 'COMPLETED';
          logs.push(`Covert Success: Sovereign sponsor ${op.sponsorCountryId} successfully finalized action ${op.id} targeting ${op.targetCountryIds.join(', ')}.`);
        } else if (roll < 85) {
          op.status = 'FAILED';
          logs.push(`Covert Failure: Operation ${op.id} sponsored by ${op.sponsorCountryId} failed to meet its strategic objectives.`);
        } else {
          op.status = 'EXPOSED';
          logs.push(`ESPIONAGE BREAK: covert action ${op.id} run by ${op.sponsorCountryId} is fully blown! Diplomatic relations threatened.`);
        }
      } else {
        // Low progression logs
        if (currentTick % 4 === 0) {
          logs.push(`Covert Progression: Sponsored task ${op.id} continues silently. Intrusion confidence rated at ${op.secrecyLevel}%.`);
        }
      }
    }

    updatedOperations[id] = op;
  });

  return { updatedOperations, logs };
}
