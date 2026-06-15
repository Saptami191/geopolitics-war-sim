export type BusEventType =
  | 'ECONOMIC_SANCTION_APPLIED'
  | 'ECONOMIC_STRESS_CHANGED'
  | 'ENERGY_SUPPLY_DISRUPTED'
  | 'TREATY_SIGNED'
  | 'TREATY_EXPIRED'
  | 'TREATY_VIOLATED'
  | 'INTEL_DISCOVERED'
  | 'INTEL_DISPUTED'
  | 'INTEL_STALE'
  | 'OPERATION_STARTED'
  | 'OPERATION_PROGRESS_UPDATED'
  | 'OPERATION_EXPOSED'
  | 'OPERATION_COMPLETED'
  | 'REGIME_INSTABILITY_RISING'
  | 'PUBLIC_UNREST_SPIKE'
  | 'MILITARY_MOBILIZATION_CHANGED'
  | 'NUCLEAR_POSTURE_SHIFTED'
  | 'CYBER_INTRUSION_DETECTED'
  | 'CYBER_RECOVERY_PROGRESS'
  | 'AI_THREAT_REASSESSED'
  | 'FLASHPOINT_ESCALATED'
  | 'FLASHPOINT_DEESCALATED';

export type BusEventCategory =
  | 'ECONOMIC'
  | 'MILITARY'
  | 'COVERT'
  | 'DIPLOMATIC'
  | 'CYBER'
  | 'AI';

export interface BusEvent {
  id: string;
  type: BusEventType;
  category: BusEventCategory;
  sourceSystem: string;
  sourceEntityType: 'COUNTRY' | 'ORGANIZATION' | 'TREATY' | 'OPERATION' | 'SYSTEM';
  sourceEntityId: string;
  targetEntityType: 'COUNTRY' | 'TREATY' | 'OPERATION' | null;
  targetEntityIds: string[] | null;
  tick: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  visibility: 'PUBLIC' | 'CLASSIFIED';
  title: string;
  summary: string;
  payload: Record<string, any>;
  tags: string[];
  correlationId: string; // Chain or transaction identifier
  parentEventId: string | null;
  status: 'QUEUED' | 'PROCESSED' | 'FAILED';
  createdAtTick: number;
  processedAtTick: number | null;
}
