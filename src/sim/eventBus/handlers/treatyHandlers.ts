import { BusEvent } from '../types';
import { HandlerContext, HandlerResult } from './types';
import { createBusEvent } from '../eventFactories';
import { WorldEvent, TreatyState } from '../../../types';

export function handleTreatyEvent(event: BusEvent, ctx: HandlerContext): HandlerResult {
  const result: HandlerResult = { derivedEvents: [], logs: [] };
  const { rawCountries, worldState } = ctx;

  switch (event.type) {
    case 'TREATY_VIOLATED': {
      const treatyId = event.payload.treatyId || event.sourceEntityId;
      const violatorId = event.payload.violatorId;
      const severity = event.payload.severity || 30;

      if (!treatyId || !violatorId) break;

      const treaty: TreatyState | undefined = worldState.treatiesById[treatyId];
      if (treaty) {
        // 1. Update compliance score
        const currentCompliance = treaty.complianceByCountry[violatorId] ?? 100;
        treaty.complianceByCountry[violatorId] = Math.max(0, currentCompliance - severity);
        treaty.violationHistory.unshift(`Tick ${event.tick}: High-profile violation reported for ${violatorId}. Compliance depreciated -${severity}%.`);

        result.logs?.push(`[TREATY EXCLUSION] ${violatorId} violated treaty [${treaty.name}]. Compliance down to ${treaty.complianceByCountry[violatorId]}%.`);

        // 2. Reduce relationship trust between other signatories and the violator
        const otherSignatories = treaty.signatoryCountryIds.filter(id => id !== violatorId);
        otherSignatories.forEach(otherId => {
          // Update raw opinions
          if (rawCountries[otherId] && rawCountries[otherId].opinions) {
            const currentOpinion = rawCountries[otherId].opinions[violatorId] ?? 0;
            rawCountries[otherId].opinions[violatorId] = Math.max(-100, currentOpinion - 25);
          }
          // Update canonicai opinions
          const canonicalCountry = worldState.countriesById[otherId];
          if (canonicalCountry && canonicalCountry.ai) {
            const currentTrust = canonicalCountry.ai.trustByCountry[violatorId] ?? 50;
            canonicalCountry.ai.trustByCountry[violatorId] = Math.max(0, currentTrust - 20);

            const currentThreat = canonicalCountry.ai.threatPerceptions[violatorId] ?? 50;
            canonicalCountry.ai.threatPerceptions[violatorId] = Math.min(100, currentThreat + 15);
          }
        });

        // 3. Create persistent WorldEvent inside worldState (for Dossier/Timeline)
        const crisisId = `CRISIS-TREATY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        const crisisEvent: WorldEvent = {
          id: crisisId,
          type: 'DIPLOMATIC',
          title: `Treaty Breach: ${treaty.name}`,
          description: `The sovereignty agreement was breached on tick ${event.tick} following illicit actions by ${violatorId}. Bilateral communications are failing.`,
          severity: 'CRITICAL',
          status: 'active',
          visibility: 'PUBLIC',
          startTick: event.tick,
          endTick: null,
          involvedCountryIds: treaty.signatoryCountryIds,
          involvedLeaderIds: [],
          originatingSystem: 'DIPLOMATIC_INTELLIGENCE_SERVICE',
          effects: [],
          tags: ['TREATY_VIOLATION', 'DIPLOMACY_COLLAPSE', violatorId],
          linkedOperationIds: [],
          linkedIntelFactIds: [],
          escalationPotential: 65,
          historicalLogEntries: [`Tick ${event.tick}: Clandestine audit confirmed breach of obligations by ${violatorId}.`]
        };

        if (!worldState.eventsById) worldState.eventsById = {};
        worldState.eventsById[crisisId] = crisisEvent;

        // 4. Emit derived events: AI strategic trust reassessment & regional flashpoint escalations
        result.derivedEvents?.push(createBusEvent({
          type: 'AI_THREAT_REASSESSED',
          category: 'AI',
          sourceSystem: 'GLOBAL_DIPLOMACY_HANDLER',
          sourceEntityType: 'TREATY',
          sourceEntityId: treatyId,
          targetEntityType: 'COUNTRY',
          targetEntityIds: [violatorId],
          tick: event.tick,
          severity: 'CRITICAL',
          title: `Strategic Alignment Shakeup`,
          summary: `Sigint and state reactions to the breach of ${treaty.name} triggered rapid global threat updates.`,
          payload: { trigger: 'TREATY_BREACH', violatorId, treatyType: treaty.type },
          correlationId: event.correlationId,
          parentEventId: event.id
        }));

        // If ceasefire or alliance, escalate regional flashpoints
        if (treaty.type === 'CEASE_FIRE' || treaty.type === 'ALLIANCE' || treaty.type === 'NON_AGGRESSION') {
          result.derivedEvents?.push(createBusEvent({
            type: 'FLASHPOINT_ESCALATED',
            category: 'MILITARY',
            sourceSystem: 'GLOBAL_DIPLOMACY_HANDLER',
            sourceEntityType: 'TREATY',
            sourceEntityId: treatyId,
            targetEntityType: 'COUNTRY',
            targetEntityIds: [violatorId, ...otherSignatories],
            tick: event.tick,
            severity: 'CRITICAL',
            title: `Ceasefire Rupture Escalation`,
            summary: `Violating the mutual security compact ${treaty.name} raised combat readiness across multiple borders.`,
            payload: { trigger: 'TREATY_BREACH', treatyType: treaty.type, hazardScoreBoost: 20 },
            correlationId: event.correlationId,
            parentEventId: event.id
          }));
        }
      }
      break;
    }
  }

  return result;
}
