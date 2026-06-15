import { CanonicalWorld, CountryState } from '../../types';

export function resolveAI(world: CanonicalWorld, currentTick: number): { updatedCountries: Record<string, CountryState>; logs: string[] } {
  const updatedCountries = { ...world.countriesById };
  const logs: string[] = [];

  Object.keys(updatedCountries).forEach((id) => {
    const country = { ...updatedCountries[id] };
    const ai = { ...country.ai };

    // Update risk profile to conform to dynamic conditions
    const hasDomesticStrains = country.unrest > 70 || country.regimeStability < 45;

    // Periodically reassess every 8 ticks
    if (currentTick % 8 === 0) {
      if (hasDomesticStrains) {
        ai.currentFocus = 'Domestic Stability Preservation';
        if (Math.random() < 0.1) {
          logs.push(`AI Plan Change: ${country.name} focused resources internally to calm high sovereign unrest.`);
        }
      } else {
        const potentialTensions = Object.values(ai.threatPerceptions).some(tp => (tp as number) > 75);
        if (potentialTensions) {
          ai.currentFocus = 'National Sovereignty Defense';
          if (Math.random() < 0.1) {
            logs.push(`AI Plan Change: ${country.name} shifted doctrine focus to secure strategic defense.`);
          }
        } else {
          ai.currentFocus = 'Economic Development & Trade';
        }
      }

      // Memory logs writeback
      ai.memoryLog.unshift(`Refreshed sovereign assessment framework. Priorities aligned to: ${ai.currentFocus}`);
      if (ai.memoryLog.length > 10) ai.memoryLog.pop();
    }

    country.ai = ai;
    updatedCountries[id] = country;
  });

  return { updatedCountries, logs };
}
