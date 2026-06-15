import { CanonicalWorld, TreatyState } from '../../types';

export function resolveTreaties(world: CanonicalWorld, currentTick: number): { updatedTreaties: Record<string, TreatyState>; logs: string[] } {
  const updatedTreaties = { ...world.treatiesById };
  const logs: string[] = [];

  Object.keys(updatedTreaties).forEach((id) => {
    const treaty = { ...updatedTreaties[id] };

    if (treaty.status === 'ACTIVE') {
      // Compliance drift over time relative to signatory stability
      Object.keys(treaty.complianceByCountry).forEach((cid) => {
        const countryState = world.countriesById[cid];
        if (countryState) {
          let compliance = treaty.complianceByCountry[cid];
          
          // Strains inside the sovereign country reduce compliance
          if (countryState.regimeStability < 50) {
            compliance = Math.max(20, compliance - 1);
          } else if (countryState.regimeStability > 75) {
            compliance = Math.min(100, compliance + 1);
          }

          // Serious popular unrest causes compliance risk
          if (countryState.unrest > 75) {
            compliance = Math.max(10, compliance - 1.5);
          }

          treaty.complianceByCountry[cid] = Math.round(compliance);

          // Log major non-compliance
          if (compliance < 45 && !treaty.violationHistory.includes(`${cid}_unstable_${currentTick}`)) {
            treaty.violationHistory.push(`${cid}_unstable_${currentTick}`);
            logs.push(`Treaty Compliance Risk: Signature partner ${cid} reports falling compliance on "${treaty.name}"!`);
          }
        }
      });

      // Expiration check
      if (treaty.expirationTick !== null && currentTick >= treaty.expirationTick) {
        treaty.status = 'EXPIRED';
        logs.push(`Treaty Expiration: Mutual Accord "${treaty.name}" expired naturally.`);
      }
    }

    updatedTreaties[id] = treaty;
  });

  return { updatedTreaties, logs };
}
