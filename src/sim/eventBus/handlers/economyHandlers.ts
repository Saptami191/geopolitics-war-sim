import { BusEvent } from '../types';
import { HandlerContext, HandlerResult } from './types';
import { createBusEvent } from '../eventFactories';

export function handleEconomyEvent(event: BusEvent, ctx: HandlerContext): HandlerResult {
  const result: HandlerResult = { derivedEvents: [], logs: [] };
  const { rawCountries, worldState } = ctx;

  switch (event.type) {
    case 'ECONOMIC_SANCTION_APPLIED': {
      const targetId = event.targetEntityIds?.[0];
      const sourceId = event.sourceEntityId;
      if (targetId && rawCountries[targetId]) {
        const country = rawCountries[targetId];
        const canonical = worldState.countriesById[targetId];

        // Apply economic stress
        const sanctionSeverity = event.payload.severity || 20;
        country.economic.debtStressIndex = Math.min(100, country.economic.debtStressIndex + sanctionSeverity);
        country.economic.gdpGrowthRate = Math.max(-0.15, country.economic.gdpGrowthRate - 0.025);

        if (canonical && canonical.economy) {
          canonical.economy.economicStress = Math.min(100, canonical.economy.economicStress + sanctionSeverity);
        }

        result.logs?.push(`[ECONOMIC SCORING] Sovereign ${sourceId} applied heavy trade embargo on ${targetId}. Economic Stress raised by +${sanctionSeverity}%.`);

        // Emit derived event ECONOMIC_STRESS_CHANGED
        result.derivedEvents?.push(createBusEvent({
          type: 'ECONOMIC_STRESS_CHANGED',
          category: 'ECONOMIC',
          sourceSystem: 'ECON_REACTION_BUS',
          sourceEntityType: 'COUNTRY',
          sourceEntityId: targetId,
          tick: event.tick,
          severity: 'WARNING',
          title: `Fiscal Stress Rising in ${targetId}`,
          summary: `Aggressive embargoes and secondary constraints pushed the national economic friction index to elevated levels.`,
          payload: { stressChange: sanctionSeverity, reason: 'CONSTRAINTS_PROPAGATED', trigger: 'SANCTIONS', originalSource: sourceId },
          correlationId: event.correlationId,
          parentEventId: event.id
        }));
      }
      break;
    }

    case 'ECONOMIC_STRESS_CHANGED': {
      const targetId = event.sourceEntityId; // The country undergoing stress
      if (targetId && rawCountries[targetId]) {
        const country = rawCountries[targetId];
        const canonical = worldState.countriesById[targetId];

        const stressChange = event.payload.stressChange || 0;
        
        // Decreased leadership approval rating and raised popular unrest
        if (country.economic.debtStressIndex > 40) {
          const rawApprovalDrop = Math.min(20, Math.ceil(stressChange * 0.6));
          const unrestIncr = Math.ceil(stressChange * 0.8);
          
          country.political.leaderApprovalRating = Math.max(1, country.political.leaderApprovalRating - rawApprovalDrop);
          country.political.popularUnrest = Math.min(100, country.political.popularUnrest + unrestIncr);

          if (canonical) {
            canonical.publicSentiment = Math.max(1, canonical.publicSentiment - rawApprovalDrop);
            canonical.unrest = Math.min(100, canonical.unrest + unrestIncr);
          }

          result.logs?.push(`[SOCIO-POLITICAL CAP] National approval rating of ${targetId} dipped by -${rawApprovalDrop}% following inflation and supply strain.`);

          result.derivedEvents?.push(createBusEvent({
            type: 'PUBLIC_UNREST_SPIKE',
            category: 'AI',
            sourceSystem: 'SOCIETAL_REACTION_BUS',
            sourceEntityType: 'COUNTRY',
            sourceEntityId: targetId,
            tick: event.tick,
            severity: 'CRITICAL',
            title: `Severe Unrest Cascade in ${targetId}`,
            summary: `High public dissatisfaction recorded in response to sudden standard-of-living contraction.`,
            payload: { unrestIncrease: unrestIncr, triggerSource: 'ECONOMIC_STRESS_CHANGED' },
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
