import { BusEvent } from '../types';
import { HandlerContext, HandlerResult } from './types';

export function handleAIEvent(event: BusEvent, ctx: HandlerContext): HandlerResult {
  const result: HandlerResult = { derivedEvents: [], logs: [] };
  const { rawCountries, worldState } = ctx;

  switch (event.type) {
    case 'AI_THREAT_REASSESSED': {
      const threatSource = event.payload.violatorId || event.payload.mobilizerId || event.payload.threatSource;
      const trigger = event.payload.trigger || 'SYSTEM_ESCALATION';

      if (!threatSource) break;

      result.logs?.push(`[AI THINKING ENGINE] Threat reassessed! Source: ${threatSource}. Trigger: ${trigger}.`);

      // Other AI countries recalculate opinion/threat/trust regarding the threatSource
      Object.keys(rawCountries).forEach(countryId => {
        if (countryId === threatSource) return;

        const raw = rawCountries[countryId];
        const canonical = worldState.countriesById[countryId];

        if (raw) {
          // Adjust opinion based on trigger
          const currentOpinion = raw.opinions[threatSource] ?? 0;
          let opinionDrop = -10;
          if (trigger === 'TREATY_BREACH') opinionDrop = -20;
          if (trigger === 'CYBER_ATTACK') opinionDrop = -15;

          raw.opinions[threatSource] = Math.max(-100, currentOpinion + opinionDrop);
        }

        if (canonical && canonical.ai) {
          const currentThreat = canonical.ai.threatPerceptions[threatSource] ?? 50;
          const currentTrust = canonical.ai.trustByCountry[threatSource] ?? 50;
          const currentHostility = canonical.ai.hostilityByCountry[threatSource] ?? 50;

          let threatIncrease = 15;
          let trustDecrease = 15;

          if (trigger === 'TREATY_BREACH') {
            threatIncrease = 25;
            trustDecrease = 25;
          }

          canonical.ai.threatPerceptions[threatSource] = Math.min(100, currentThreat + threatIncrease);
          canonical.ai.trustByCountry[threatSource] = Math.max(0, currentTrust - trustDecrease);
          canonical.ai.hostilityByCountry[threatSource] = Math.min(100, currentHostility + Math.ceil(threatIncrease / 2));
        }
      });
      break;
    }
  }

  return result;
}
