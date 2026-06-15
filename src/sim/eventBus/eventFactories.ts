import { BusEvent, BusEventType, BusEventCategory } from './types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11).toUpperCase();
}

export function createBusEvent(params: {
  type: BusEventType;
  category: BusEventCategory;
  sourceSystem: string;
  sourceEntityType: 'COUNTRY' | 'ORGANIZATION' | 'TREATY' | 'OPERATION' | 'SYSTEM';
  sourceEntityId: string;
  targetEntityType?: 'COUNTRY' | 'TREATY' | 'OPERATION' | null;
  targetEntityIds?: string[] | null;
  tick: number;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  visibility?: 'PUBLIC' | 'CLASSIFIED';
  title: string;
  summary: string;
  payload?: Record<string, any>;
  tags?: string[];
  correlationId?: string;
  parentEventId?: string | null;
}): BusEvent {
  const corrId = params.correlationId || `CORR-${generateId()}`;
  return {
    id: `EV-${params.type}-${generateId()}`,
    type: params.type,
    category: params.category,
    sourceSystem: params.sourceSystem,
    sourceEntityType: params.sourceEntityType,
    sourceEntityId: params.sourceEntityId,
    targetEntityType: params.targetEntityType || null,
    targetEntityIds: params.targetEntityIds || null,
    tick: params.tick,
    severity: params.severity || 'INFO',
    visibility: params.visibility || 'PUBLIC',
    title: params.title,
    summary: params.summary,
    payload: params.payload || {},
    tags: params.tags || [],
    correlationId: corrId,
    parentEventId: params.parentEventId || null,
    status: 'QUEUED',
    createdAtTick: params.tick,
    processedAtTick: null,
  };
}
