import { CanonicalWorld, CountryState } from '../../types';

export function resolveMilitary(world: CanonicalWorld, currentTick: number): { updatedCountries: Record<string, CountryState>; logs: string[] } {
  const updatedCountries = { ...world.countriesById };
  const logs: string[] = [];

  // Identify who is in active crises
  const crisisCountryIdsSet = new Set<string>();
  if (world.eventsById) {
    Object.values(world.eventsById).forEach((evt) => {
      if (evt.status === 'active' && evt.severity === 'CRITICAL') {
        evt.involvedCountryIds.forEach(id => crisisCountryIdsSet.add(id));
      }
    });
  }

  Object.keys(updatedCountries).forEach((id) => {
    const country = { ...updatedCountries[id] };
    const military = { ...country.military };

    const inCriticalCrisis = crisisCountryIdsSet.has(id);

    if (inCriticalCrisis) {
      // Build mobilization and exhaust logistics
      military.mobilizationLevel = Math.min(100, military.mobilizationLevel + 4);
      military.logisticsCapacity = Math.max(30, military.logisticsCapacity - 1);
      military.readiness = Math.min(100, military.readiness + 2);
      military.morale = Math.max(40, military.morale - 0.5); // Strains on troops
      
      if (currentTick % 10 === 0) {
        logs.push(`Military Alert: ${country.name} expanded reserve forces, current level ${military.mobilizationLevel}%.`);
      }
    } else {
      // Demobilize towards default standby (e.g. 10%)
      if (military.mobilizationLevel > 10) {
        military.mobilizationLevel = Math.max(10, military.mobilizationLevel - 2);
      }
      
      // Recuperate equipment, morals, and logistics slowly
      military.readiness = Math.min(95, military.readiness + 1);
      if (military.morale < 85) military.morale = Math.min(85, military.morale + 0.8);
      if (military.logisticsCapacity < 90) military.logisticsCapacity = Math.min(90, military.logisticsCapacity + 1.2);

      // War fatigue burns down
      if (military.warFatigue > 0) {
        military.warFatigue = Math.max(0, military.warFatigue - 1.5);
      }
    }

    country.military = military;
    updatedCountries[id] = country;
  });

  return { updatedCountries, logs };
}
