import { BusEvent } from '../types';
import { HandlerContext, HandlerResult } from './types';
import { createBusEvent } from '../eventFactories';
import { IntelFact } from '../../../types';

export function handleIntelEvent(event: BusEvent, ctx: HandlerContext): HandlerResult {
  const result: HandlerResult = { derivedEvents: [], logs: [] };
  const { worldState } = ctx;

  switch (event.type) {
    case 'INTEL_DISCOVERED': {
      const operationId = event.payload.operationId || event.sourceEntityId;
      const targetCountryId = event.payload.targetCountryId || event.targetEntityIds?.[0] || 'US';
      const sponsorCountryId = event.payload.sponsorCountryId || 'RU';
      const breachType = event.payload.breachType || 'GRID_BREACH';

      // 1. Create a structured declassified IntelFact
      const factId = `INTEL-FACT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const newFact: IntelFact = {
        id: factId,
        subjectType: 'OPERATION',
        subjectId: operationId,
        title: `Declassified Signals Intelligence: ${breachType}`,
        summary: `Captured operational traffic confirms covert cyber network activities tracing directly to state sponsor ${sponsorCountryId}. Intercept reliability is above 90%.`,
        sourceType: 'SIGINT',
        confidence: 90,
        discoveredTick: event.tick,
        expiresTick: null,
        verified: true,
        disputed: false,
        visibilityScope: 'PUBLIC',
        relatedCountryIds: [sponsorCountryId, targetCountryId],
        relatedEventIds: [],
        relatedOperationIds: [operationId],
        tags: ['INTELLIGENCE_RELEASE', 'SIGINT_BREACH', sponsorCountryId],
        metadata: {}
      };

      if (!worldState.intelFactsById) worldState.intelFactsById = {};
      worldState.intelFactsById[factId] = newFact;

      result.logs?.push(`[INTELLIGENCE SYSTEM] Logged persistent declassified IntelFact ${factId} regarding ${breachType}.`);

      // 2. Cascade update to AI strategic focus
      result.derivedEvents?.push(createBusEvent({
        type: 'AI_THREAT_REASSESSED',
        category: 'AI',
        sourceSystem: 'GLOBAL_INTELLIGENCE_SERVICE',
        sourceEntityType: 'OPERATION',
        sourceEntityId: factId,
        targetEntityType: 'COUNTRY',
        targetEntityIds: [sponsorCountryId],
        tick: event.tick,
        severity: 'WARNING',
        title: `Defensive Alert Adaptation`,
        summary: `Declassified Intel Fact regarding hostiles generated structural changes to tactical AI assessment protocols.`,
        payload: { factId, threatSource: sponsorCountryId, multiplier: 1.25 },
        correlationId: event.correlationId,
        parentEventId: event.id
      }));
      break;
    }
  }

  return result;
}
