import { CanonicalWorld, CountryState } from '../../types';

export function resolveCyber(world: CanonicalWorld, currentTick: number): { updatedCountries: Record<string, CountryState>; logs: string[] } {
  const updatedCountries = { ...world.countriesById };
  const logs: string[] = [];

  Object.keys(updatedCountries).forEach((id) => {
    const country = { ...updatedCountries[id] };
    const cyber = { ...country.cyber };

    // Threat triggers: if opponent cyber offensive is extremely high
    // or if a cyber event is registered against this country.
    const isUnderAttack = cyber.activeIncidents > 0;

    if (isUnderAttack) {
      // Degrade network health
      cyber.civilianNetworkHealth = Math.max(40, cyber.civilianNetworkHealth - 1.5 * cyber.activeIncidents);
      cyber.financialNetworkHealth = Math.max(35, cyber.financialNetworkHealth - 2.0 * cyber.activeIncidents);
      cyber.militaryNetworkHealth = Math.max(65, cyber.militaryNetworkHealth - 0.5 * cyber.activeIncidents);
      cyber.intrusionLevel = Math.min(100, cyber.intrusionLevel + 4);

      // Defenses attempt containment
      const defenseSuccessChance = cyber.defensiveCapability * 0.01;
      if (Math.random() < defenseSuccessChance) {
        cyber.activeIncidents = Math.max(0, cyber.activeIncidents - 1);
        cyber.intrusionLevel = Math.max(0, cyber.intrusionLevel - 20);
        logs.push(`Cyber Defense: ${country.name} network security teams contained a critical intrusion vector.`);
      }
    } else {
      // Normal recovery
      if (cyber.civilianNetworkHealth < 95) cyber.civilianNetworkHealth = Math.min(95, cyber.civilianNetworkHealth + 1);
      if (cyber.financialNetworkHealth < 98) cyber.financialNetworkHealth = Math.min(98, cyber.financialNetworkHealth + 1.2);
      if (cyber.militaryNetworkHealth < 99) cyber.militaryNetworkHealth = Math.min(99, cyber.militaryNetworkHealth + 0.8);
      
      if (cyber.intrusionLevel > 0) {
        cyber.intrusionLevel = Math.max(0, cyber.intrusionLevel - 4);
      }
    }

    country.cyber = cyber;
    updatedCountries[id] = country;
  });

  return { updatedCountries, logs };
}
