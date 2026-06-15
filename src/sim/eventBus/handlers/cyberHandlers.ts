import { BusEvent } from '../types';
import { HandlerContext, HandlerResult } from './types';
import { createBusEvent } from '../eventFactories';
import { WorldEvent } from '../../../types';

export function handleCyberEvent(event: BusEvent, ctx: HandlerContext): HandlerResult {
  const result: HandlerResult = { derivedEvents: [], logs: [] };
  const { rawCountries, worldState } = ctx;

  switch (event.type) {
    case 'CYBER_INTRUSION_DETECTED': {
      const targetCountryId = event.targetEntityIds?.[0];
      const sponsorCountryId = event.sourceEntityId;

      if (!targetCountryId || !sponsorCountryId) break;

      const rawTarget = rawCountries[targetCountryId];
      const targetCanonical = worldState.countriesById[targetCountryId];

      if (rawTarget) {
        // Decrease firewall ratings or security reserves, raise unrest
        rawTarget.political.popularUnrest = Math.min(100, rawTarget.political.popularUnrest + 12);
        
        result.logs?.push(`[CYBER ATTACK] Intruders sponsored by ${sponsorCountryId} breached firewall systems of ${targetCountryId}. popular unrest spiked.`);

        if (targetCanonical && targetCanonical.cyber) {
          targetCanonical.cyber.activeIncidents += 1;
          targetCanonical.cyber.intrusionLevel = Math.min(100, targetCanonical.cyber.intrusionLevel + 30);
          targetCanonical.cyber.civilianNetworkHealth = Math.max(10, targetCanonical.cyber.civilianNetworkHealth - 25);
          targetCanonical.cyber.financialNetworkHealth = Math.max(10, targetCanonical.cyber.financialNetworkHealth - 20);
          targetCanonical.unrest = Math.min(100, targetCanonical.unrest + 15);
        }

        // Create persistent crisis WorldEvent for cyber conflict
        const cyberCrisisId = `CRISIS-CYBER-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        const cyberEvent: WorldEvent = {
          id: cyberCrisisId,
          type: 'CYBER',
          title: `Infrastructure Intrusion: ${targetCountryId} Power Grid`,
          description: `A sophisticated Advanced Persistent Threat (APT) attack penetrated electrical grid multiplexers in ${targetCountryId}. Signals intelligence tracks command servers back to ${sponsorCountryId}.`,
          severity: 'CRITICAL',
          status: 'active',
          visibility: 'PUBLIC',
          startTick: event.tick,
          endTick: null,
          involvedCountryIds: [sponsorCountryId, targetCountryId],
          involvedLeaderIds: [],
          originatingSystem: 'CYBER_DEFENSE_COMMAND',
          effects: [],
          tags: ['CYBER_WARFARE', 'INFRASTRUCTURE_ATTACK', targetCountryId],
          linkedOperationIds: [],
          linkedIntelFactIds: [],
          escalationPotential: 55,
          historicalLogEntries: [`Tick ${event.tick}: Financial routing nodes declassified and logged under critical cyber status.`]
        };

        if (!worldState.eventsById) worldState.eventsById = {};
        worldState.eventsById[cyberCrisisId] = cyberEvent;

        // Emit derived INTEL_DISCOVERED event
        result.derivedEvents?.push(createBusEvent({
          type: 'INTEL_DISCOVERED',
          category: 'CYBER',
          sourceSystem: 'CYBER_DEFENSE_COMMAND',
          sourceEntityType: 'SYSTEM',
          sourceEntityId: cyberCrisisId,
          targetEntityType: 'COUNTRY',
          targetEntityIds: [targetCountryId],
          tick: event.tick,
          severity: 'WARNING',
          title: `Cyber Forensic Attribution`,
          summary: `Captured telemetry payloads from the power grid attack show high correspondence to known signature files from ${sponsorCountryId}.`,
          payload: { operationId: cyberCrisisId, sponsorCountryId, targetCountryId, breachType: 'GRID_BREACH' },
          correlationId: event.correlationId,
          parentEventId: event.id
        }));

        // Emit derived PUBLIC_UNREST_SPIKE
        result.derivedEvents?.push(createBusEvent({
          type: 'PUBLIC_UNREST_SPIKE',
          category: 'AI',
          sourceSystem: 'CYBER_DEFENSE_COMMAND',
          sourceEntityType: 'COUNTRY',
          sourceEntityId: targetCountryId,
          tick: event.tick,
          severity: 'WARNING',
          title: `Cyber Outage Panic`,
          summary: `Rolling electricity and financial infrastructure blackouts caused localized unrest and run on banks.`,
          payload: { unrestIncrease: 12 },
          correlationId: event.correlationId,
          parentEventId: event.id
        }));
      }

      break;
    }
  }

  return result;
}
