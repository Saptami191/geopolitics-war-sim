import {
  SanctionTier,
  Econ_Sector,
  Econ_NationProfile,
  ActiveSanctionRecord,
  SanctionImpactAssessment
} from '../types';

/**
 * Distributes actual GDP damage across the target's 10 economic sectors.
 * Each sector's share depends on its relative weight and current health.
 * Sectors take less damage as they deteriorate (representing baseline bottom-out).
 * Formula:
 * - weight share of sector out of total affected weights
 * - sectorBaseDamage = actualDamagePct * (weight / totalWeight) * 2.0
 * - finalSectorDamageDelta = sectorBaseDamage * (currentSectorHealth / 100)
 * @param tier Active sanction tier
 * @param affectedSectors Active affected sectors
 * @param actualDamagePct Computed actual GDP damage %
 * @param targetProfile Economic profile of target nation
 * @returns Record mapping each Econ_Sector to its health damage delta (amount to subtract)
 */
export function computeSectorDamageDistribution(
  tier: SanctionTier,
  affectedSectors: Econ_Sector[],
  actualDamagePct: number,
  targetProfile: Econ_NationProfile
): Record<Econ_Sector, number> {
  const result: Record<Econ_Sector, number> = {
    ENERGY: 0,
    DEFENCE_INDUSTRIAL: 0,
    FINANCIAL_SERVICES: 0,
    TECHNOLOGY: 0,
    AGRICULTURE: 0,
    MANUFACTURING: 0,
    TRANSPORT_LOGISTICS: 0,
    RARE_EARTH_MINING: 0,
    TELECOMS: 0,
    PHARMACEUTICALS: 0
  };

  if (affectedSectors.length === 0 || actualDamagePct <= 0) {
    return result;
  }

  // Calculate total weights
  let totalWeight = 0;
  const weights: Partial<Record<Econ_Sector, number>> = {};

  affectedSectors.forEach(sector => {
    let w = 10; // Default sector weight
    if (sector === 'ENERGY') w = 35;
    else if (sector === 'FINANCIAL_SERVICES') w = 25;
    else if (sector === 'TECHNOLOGY') w = 20;
    else if (sector === 'DEFENCE_INDUSTRIAL') w = 15;

    weights[sector] = w;
    totalWeight += w;
  });

  // Calculate damage delta per sector
  affectedSectors.forEach(sector => {
    const w = weights[sector] || 10;
    const share = w / totalWeight;
    // Scale factor of 2.0 ensures damage is substantial and degrades health appropriately
    const sectorBaseDamage = actualDamagePct * share * 2.0;
    const currentHealth = targetProfile.currentSectorHealth?.[sector] ?? 100;

    // Damaged sectors absorb less further damage due to bottoming out
    const healthFactor = currentHealth / 100;
    const finalDamage = sectorBaseDamage * healthFactor;

    result[sector] = Math.min(25, Math.max(0, finalDamage));
  });

  return result;
}

/**
 * Computes extra currency reserve depletion rate ($B per tick).
 * Formula:
 * - baseDrain = (baselineGDP * actualDamagePct / 100) * 0.05
 * - If FINANCIAL_SERVICES health < 50: baseDrain * 1.5 (capital flight)
 * @param targetProfile Economic profile of target nation
 * @param actualDamagePct Actual GDP damage percentage
 * @returns Dollar value in billions depleted per tick
 */
export function computeReserveDepletion(
  targetProfile: Econ_NationProfile,
  actualDamagePct: number
): number {
  const gdpB = targetProfile.gdpBaselineUSD;
  const baseDrain = (gdpB * (actualDamagePct / 100)) * 0.05;

  const finHealth = targetProfile.currentSectorHealth?.['FINANCIAL_SERVICES'] ?? 100;
  let multiplier = 1.0;
  if (finHealth < 50) {
    multiplier = 1.5;
  }

  return baseDrain * multiplier;
}

/**
 * Computes direct commodity inflation pressures.
 * Formula:
 * - ENERGY sector damage * 0.15
 * - AGRICULTURE sector damage * 0.12
 * - TRANSPORT_LOGISTICS sector damage * 0.08
 * - Sum capped at +25%
 * @param affectedSectors Array of affected sectors
 * @param sectorDamage Damage per sector (0-100 scale)
 * @returns Net inflation rate delta
 */
export function computeInflationSurge(
  affectedSectors: Econ_Sector[],
  sectorDamage: Record<Econ_Sector, number>
): number {
  let surge = 0;

  if (affectedSectors.includes('ENERGY')) {
    surge += (sectorDamage['ENERGY'] || 0) * 0.15;
  }
  if (affectedSectors.includes('AGRICULTURE')) {
    surge += (sectorDamage['AGRICULTURE'] || 0) * 0.12;
  }
  if (affectedSectors.includes('TRANSPORT_LOGISTICS')) {
    surge += (sectorDamage['TRANSPORT_LOGISTICS'] || 0) * 0.08;
  }

  return Math.min(25, Math.max(0, surge));
}

/**
 * Computes popular civil unrest deltas per tick.
 * Formula:
 * - delta = (damagePct * 0.4) + (inflationSurge * 0.3) + (max(0, 30 - foodSecurityImpact) * 0.5)
 * - Capped at +20 per tick
 * @param actualDamagePct Actual GDP damage percentage
 * @param inflationSurge Inflation surge rate
 * @param foodSecurityImpact Current food security score (0-100)
 * @returns Political unrest score change
 */
export function computePopulationUnrestDelta(
  actualDamagePct: number,
  inflationSurge: number,
  foodSecurityImpact: number
): number {
  const foodPain = Math.max(0, 30 - foodSecurityImpact) * 0.5;
  const delta = (actualDamagePct * 0.4) + (inflationSurge * 0.3) + foodPain;
  return Math.min(20, Math.max(0, delta));
}

/**
 * Computes raw global diplomatic standing changes for the sanctioning nation.
 * Formula:
 * - Gained reps if high-impact damage > 20%: +5
 * - Lost reps if disproportionate (TIER_5 block with target food < 30): -15
 * - Lost reps if humanitarian optics failure: -8 per tick if target food < 25
 * @param tier Sanction Tier
 * @param actualDamagePct Actual GDP damage %
 * @param sanctionRecord Active sanction record
 * @param foodSecurity Current food security of target (0-100)
 * @returns Diplomatic reputation delta index
 */
export function computeDiplomaticReputationDelta(
  tier: SanctionTier,
  actualDamagePct: number,
  foodSecurity: number
): number {
  let delta = 0;

  if (actualDamagePct > 20) {
    delta += 5; // Sanctions appear effective and strong
  }

  if (tier === 'TIER_5_TOTAL_ISOLATION' && foodSecurity < 30) {
    delta -= 15; // Deemed excessive, international backlash
  } else if (foodSecurity < 25) {
    delta -= 8; // Humanitarian pain is causing public optics blowback
  }

  return delta;
}

/**
 * Compiles a comprehensive Impact Assessment record based on all live damage metrics.
 * @param sanctionRecord Active record details
 * @param sectorDamage Distributed sector damage
 * @param reserveDrain Extra reserve drain per tick
 * @param inflationSurge Inflation surge %
 * @param foodImpact Target food security score
 * @param unrestDelta Target popular unrest delta
 * @param repDelta Sanctioner reputation delta
 * @returns SanctionImpactAssessment
 */
export function buildImpactAssessment(
  sanctionRecord: ActiveSanctionRecord,
  sectorDamage: Record<Econ_Sector, number>,
  reserveDrain: number,
  inflationSurge: number,
  foodImpact: number,
  unrestDelta: number,
  repDelta: number
): SanctionImpactAssessment {
  let rating: 'CRUSHING' | 'EFFECTIVE' | 'MODERATE' | 'WEAK' | 'NEGLIGIBLE' = 'NEGLIGIBLE';
  const dmg = sanctionRecord.currentDamagePct;
  const evasionScore = sanctionRecord.evasionEffectivenessScore;

  if (dmg > 25 && evasionScore < 30) {
    rating = 'CRUSHING';
  } else if (dmg > 15) {
    rating = 'EFFECTIVE';
  } else if (dmg > 8) {
    rating = 'MODERATE';
  } else if (dmg > 3) {
    rating = 'WEAK';
  }

  return {
    sanctionId: sanctionRecord.id,
    targetId: sanctionRecord.targetId,
    totalGdpDamagePct: Math.round(dmg * 10) / 10,
    sectorBreakdown: sectorDamage,
    reserveDepletionAcceleration: reserveDrain,
    inflationSurge,
    foodSecurityImpact: Math.max(0, 100 - foodImpact),
    populationUnrestDelta: unrestDelta,
    diplomaticReputationDelta: repDelta,
    effectivenessRating: rating
  };
}
