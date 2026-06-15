import { CanonicalWorld, CountryState } from '../../types';

export function resolveEconomy(world: CanonicalWorld, currentTick: number): { updatedCountries: Record<string, CountryState>; logs: string[] } {
  const updatedCountries = { ...world.countriesById };
  const logs: string[] = [];

  Object.keys(updatedCountries).forEach((id) => {
    const country = { ...updatedCountries[id] };
    const economy = { ...country.economy };

    // Determine environmental stress modifiers (e.g. if sanctioned, in crisis, or high unrest/regime instability)
    const isSanctioned = economy.sanctionsExposure > 0;
    const hasHighUnrest = country.unrest > 70;
    const isUnstable = country.regimeStability < 50;

    // Sanctions increase stress and erode reserves, decelerate GDP growth
    if (isSanctioned) {
      economy.economicStress = Math.min(100, economy.economicStress + 1);
      economy.growthRate = Math.max(-5.0, economy.growthRate - 0.05);
      economy.reserves = Math.max(0, economy.reserves - 0.4); // Burn rate
      if (currentTick % 15 === 0) {
        logs.push(`Economic Friction: Sanctions exposure on ${country.name} constrains industrial liquidity.`);
      }
    }

    // High popular unrest slows service sectors
    if (hasHighUnrest) {
      economy.unemployment = Math.min(30, economy.unemployment + 0.1);
      economy.growthRate = Math.max(-8.0, economy.growthRate - 0.08);
      economy.economicStress = Math.min(100, economy.economicStress + 1.2);
    }

    // Base drift toward baseline if stable and safe
    if (!isSanctioned && !hasHighUnrest && !isUnstable) {
      // Natural economic recovery
      if (economy.economicStress > 15) {
        economy.economicStress = Math.max(10, economy.economicStress - 1);
      }
      if (economy.growthRate < 3.2) {
        economy.growthRate = Math.min(3.5, economy.growthRate + 0.04);
      }
      if (economy.unemployment > 4.5) {
        economy.unemployment = Math.max(4.0, economy.unemployment - 0.05);
      }
    }

    // Debt ratios slowly advance due to deficit spending relative to GDP growth
    if (economy.growthRate < 1.0) {
      economy.debtRatio = Math.min(250, economy.debtRatio + 0.15);
    } else {
      economy.debtRatio = Math.max(10, economy.debtRatio - 0.05);
    }

    // Calculate dynamic fiscal space
    economy.fiscalSpace = Math.max(0, Math.round(100 - economy.debtRatio * 0.4));

    country.economy = economy;
    updatedCountries[id] = country;
  });

  return { updatedCountries, logs };
}
