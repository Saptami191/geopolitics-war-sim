import { CountryState, WorldEvent } from '../../types';

export interface DerivedWorldMetrics {
  unstableCountries: string[];
  nuclearCountries: string[];
  sanctionedCountries: string[];
  highRiskFlashpoints: { countryId: string; score: number; hazardReason: string }[];
  globalAverageStability: number;
  globalTensionIndex: number;
}

export function computeDerivedMetrics(
  countriesById: Record<string, CountryState>,
  eventsById: Record<string, WorldEvent>
): DerivedWorldMetrics {
  const unstableCountries = Object.keys(countriesById)
    .filter((cid) => countriesById[cid].regimeStability < 45);

  const nuclearCountries = Object.keys(countriesById)
    .filter((cid) => countriesById[cid].military.nuclearStatus);

  // Derive sanctioned from the model's economy fields or exposures
  const sanctionedCountries = Object.keys(countriesById)
    .filter((cid) => countriesById[cid].economy.sanctionsExposure > 0);

  // Compute average stability
  const totalStab = Object.values(countriesById).reduce((a, b) => a + b.regimeStability, 0);
  const globalAverageStability = Math.round(totalStab / Object.keys(countriesById).length);

  // High-risk flashpoints calculations
  const highRiskFlashpoints = Object.keys(countriesById).map((cid) => {
    let score = 0;
    let hazardReason = 'Standard Regional Profile';

    const opinionSum = Object.values(countriesById[cid].ai.hostilityByCountry).reduce((a, b) => a + b, 0);
    const instability = 100 - countriesById[cid].regimeStability;

    // Direct formula incorporating hostility, instability, and crises
    score = Math.round((opinionSum / Object.keys(countriesById).length) * 0.45 + instability * 0.55);

    if (cid === 'PS') {
      hazardReason = 'Severe sectarian disputes and unstable administrative borders.';
      score = 95;
    } else if (cid === 'TW') {
      hazardReason = 'Sovereignty claims by persistent regional competitors.';
      score = 88;
    } else if (cid === 'PK') {
      hazardReason = 'Regime transition strains combined with regional defense postures.';
      score = 78;
    } else if (score > 60) {
      hazardReason = 'High levels of local friction or recent military events.';
    }

    return { countryId: cid, score, hazardReason };
  }).sort((a, b) => b.score - a.score);

  // Hostility index of the world
  const totalHostility = Object.values(countriesById).reduce((sum, c) => {
    return sum + Object.values(c.ai.hostilityByCountry).reduce((s, h) => s + (h as number), 0);
  }, 0);
  
  const divisor = Object.keys(countriesById).length * (Object.keys(countriesById).length - 1) || 1;
  const averageHostility = totalHostility / divisor;
  
  // Mix in active critical events
  const criticalCrisesCount = Object.values(eventsById).filter(e => e.status === 'active' && e.severity === 'CRITICAL').length;
  
  const globalTensionIndex = Math.min(100, Math.max(10, Math.round(averageHostility + 15 + criticalCrisesCount * 8)));

  return {
    unstableCountries,
    nuclearCountries,
    sanctionedCountries,
    highRiskFlashpoints,
    globalAverageStability,
    globalTensionIndex,
  };
}
