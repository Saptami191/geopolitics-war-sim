import { BusEvent } from '../types';
import { HandlerContext, HandlerResult } from './types';
import { createBusEvent } from '../eventFactories';
import { WorldEvent, OperationState } from '../../../types';

export function handleOperationEvent(event: BusEvent, ctx: HandlerContext): HandlerResult {
  const result: HandlerResult = { derivedEvents: [], logs: [] };
  const { rawCountries, worldState } = ctx;

  switch (event.type) {
    case 'OPERATION_EXPOSED': {
      const operationId = event.payload.operationId || event.sourceEntityId;
      const sponsorCountryId = event.payload.sponsorCountryId;
      const targetCountryId = event.payload.targetCountryId || event.targetEntityIds?.[0];

      if (!operationId || !sponsorCountryId || !targetCountryId) break;

      const op: OperationState | undefined = worldState.operationsById[operationId];
      if (op) {
        op.exposed = true;
        op.status = 'EXPOSED';
        result.logs?.push(`[COUNTER-ESPIONAGE] Intelligence agency of ${targetCountryId} successfully exposed covert action [${op.type}] sponsored by ${sponsorCountryId}.`);

        // 1. Decline opinions and trust scores
        if (rawCountries[targetCountryId] && rawCountries[targetCountryId].opinions) {
          const opinionDrop = -35;
          const currentOpinion = rawCountries[targetCountryId].opinions[sponsorCountryId] ?? 0;
          rawCountries[targetCountryId].opinions[sponsorCountryId] = Math.max(-100, currentOpinion + opinionDrop);
        }

        const canonicalTarget = worldState.countriesById[targetCountryId];
        if (canonicalTarget && canonicalTarget.ai) {
          canonicalTarget.ai.trustByCountry[sponsorCountryId] = Math.max(0, (canonicalTarget.ai.trustByCountry[sponsorCountryId] ?? 50) - 30);
          canonicalTarget.ai.threatPerceptions[sponsorCountryId] = Math.min(100, (canonicalTarget.ai.threatPerceptions[sponsorCountryId] ?? 50) + 25);
        }

        // 2. Reduce approval/stability of the sponsor country (spy scandal backlash)
        if (rawCountries[sponsorCountryId]) {
          const sponsor = rawCountries[sponsorCountryId];
          sponsor.political.leaderApprovalRating = Math.max(1, sponsor.political.leaderApprovalRating - 12);
          sponsor.political.stabilityIndex = Math.max(1, sponsor.political.stabilityIndex - 8);

          const canonicalSponsor = worldState.countriesById[sponsorCountryId];
          if (canonicalSponsor) {
            canonicalSponsor.publicSentiment = Math.round(sponsor.political.leaderApprovalRating);
            canonicalSponsor.regimeStability = Math.round(sponsor.political.stabilityIndex);
          }
        }

        // 3. Create persistent crisis espionage world event
        const spyScandalId = `CRISIS-SPY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        const scandalEvent: WorldEvent = {
          id: spyScandalId,
          type: 'COVERT',
          title: `Clandestine Incident: Operation ${op.type} Exposed`,
          description: `A severe diplomatic breach occurred following the physical discovery and capture of covert espionage cells. The operations are attributed with high-confidence to ${sponsorCountryId} targeting ${targetCountryId}.`,
          severity: 'CRITICAL',
          status: 'active',
          visibility: 'PUBLIC',
          startTick: event.tick,
          endTick: null,
          involvedCountryIds: [sponsorCountryId, targetCountryId],
          involvedLeaderIds: [],
          originatingSystem: 'INTEL_AUDIT_SYSTEM',
          effects: [],
          tags: ['SPY_SCANDAL', 'COVERT_ACTION', 'ATTRIBUTION_CRISIS', sponsorCountryId, targetCountryId],
          linkedOperationIds: [operationId],
          linkedIntelFactIds: [],
          escalationPotential: 50,
          historicalLogEntries: [`Tick ${event.tick}: High-confidence attribution telemetry provided to public media channels.`]
        };

        if (!worldState.eventsById) worldState.eventsById = {};
        worldState.eventsById[spyScandalId] = scandalEvent;
        op.linkedEventIds.push(spyScandalId);

        // 4. Emit derived events: DISCOVERED intel fact & AI alert levels
        result.derivedEvents?.push(createBusEvent({
          type: 'INTEL_DISCOVERED',
          category: 'COVERT',
          sourceSystem: 'COUNTER_ESPIONAGE_BUS',
          sourceEntityType: 'OPERATION',
          sourceEntityId: operationId,
          targetEntityType: 'COUNTRY',
          targetEntityIds: [targetCountryId],
          tick: event.tick,
          severity: 'CRITICAL',
          title: `Clandestine Breach Dossier Created`,
          summary: `Declassified telemetry confirms operational payload footprint linked to sponsor ${sponsorCountryId}.`,
          payload: { operationId, sponsorCountryId, targetCountryId, breachType: op.type },
          correlationId: event.correlationId,
          parentEventId: event.id
        }));
      }
      break;
    }

    case 'OPERATION_COMPLETED': {
      const operationId = event.payload.operationId || event.sourceEntityId;
      const op: OperationState | undefined = worldState.operationsById[operationId];
      if (op) {
        op.status = 'COMPLETED';
        result.logs?.push(`[ESPIONAGE COMPLETE] Covert mission [${op.type}] successfully concluded.`);
      }
      break;
    }
  }

  return result;
}
