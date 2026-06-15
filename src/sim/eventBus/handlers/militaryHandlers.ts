import { BusEvent } from '../types';
import { HandlerContext, HandlerResult } from './types';
import { createBusEvent } from '../eventFactories';
import { WorldEvent } from '../../../types';

export function handleMilitaryEvent(event: BusEvent, ctx: HandlerContext): HandlerResult {
  const result: HandlerResult = { derivedEvents: [], logs: [] };
  const { rawCountries, worldState } = ctx;

  switch (event.type) {
    case 'MILITARY_MOBILIZATION_CHANGED': {
      const countryId = event.sourceEntityId;
      const level = event.payload.level || 50;

      if (!countryId || !rawCountries[countryId]) break;

      const raw = rawCountries[countryId];
      if (raw.arsenal) {
        raw.arsenal.readinessLevel = Math.min(100, Math.max(10, raw.arsenal.readinessLevel + 15));
      }

      const canonical = worldState.countriesById[countryId];
      if (canonical && canonical.military) {
        canonical.military.mobilizationLevel = level;
        canonical.military.readiness = Math.min(100, canonical.military.readiness + 15);
        canonical.military.forceProjection = Math.min(100, canonical.military.forceProjection + 10);
      }

      result.logs?.push(`[MILITARY COMMAND] ${countryId} raised military mobilization level to ${level}%. readiness and force projection increased.`);

      // Trigger AI threat perception shift in neighboring rivals
      result.derivedEvents?.push(createBusEvent({
        type: 'AI_THREAT_REASSESSED',
        category: 'AI',
        sourceSystem: 'MILITARY_COMMAND_BUS',
        sourceEntityType: 'COUNTRY',
        sourceEntityId: countryId,
        tick: event.tick,
        severity: 'WARNING',
        title: `Tactical Mobilization Warning`,
        summary: `Rival nations are updating border monitoring systems in response to ${countryId}'s mobilization level of ${level}%.`,
        payload: { mobilizerId: countryId, mobilizationLevel: level },
        correlationId: event.correlationId,
        parentEventId: event.id
      }));

      break;
    }

    case 'FLASHPOINT_ESCALATED': {
      const hazardBoost = event.payload.hazardScoreBoost || 15;
      const targetIds = event.targetEntityIds || [];

      result.logs?.push(`[MILITARY ALERT] Regional flashpoint escalation! Border friction spiked by +${hazardBoost}%.`);

      // If there are target countries, increase their military readiness and decrease their trust
      targetIds.forEach(id => {
        const raw = rawCountries[id];
        if (raw) {
          raw.political.popularUnrest = Math.min(100, raw.political.popularUnrest + 5);
          if (raw.arsenal) {
            raw.arsenal.readinessLevel = Math.min(100, raw.arsenal.readinessLevel + 10);
          }
        }
        const canonical = worldState.countriesById[id];
        if (canonical) {
          canonical.unrest = Math.min(100, canonical.unrest + 5);
          if (canonical.military) {
            canonical.military.readiness = Math.min(100, canonical.military.readiness + 10);
          }
        }
      });

      // Create a persistent crisis event for militarized build-up
      if (targetIds.length >= 2) {
        const crisisId = `CRISIS-MILITARY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        const militaryCrisis: WorldEvent = {
          id: crisisId,
          type: 'MILITARY',
          title: `Mobilized Border Crisis: ${targetIds.join(' vs ')}`,
          description: `Military command registers high concentration of armored and airborne elements at active borders. Danger of accidental kinetic escalation is high.`,
          severity: 'CRITICAL',
          status: 'active',
          visibility: 'PUBLIC',
          startTick: event.tick,
          endTick: null,
          involvedCountryIds: targetIds,
          involvedLeaderIds: [],
          originatingSystem: 'STRATEGIC_SATELLITE_RECON',
          effects: [],
          tags: ['BORDER_FLASHPOINT', 'MILITARY_STANDOFF', ...targetIds],
          linkedOperationIds: [],
          linkedIntelFactIds: [],
          escalationPotential: 75,
          historicalLogEntries: [`Tick ${event.tick}: High-altitude imaging confirmed forward operating ordnance and supplies.`]
        };

        if (!worldState.eventsById) worldState.eventsById = {};
        worldState.eventsById[crisisId] = militaryCrisis;
      }

      break;
    }
  }

  return result;
}
