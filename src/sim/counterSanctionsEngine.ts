import {
  Econ_NationProfile,
  ActiveSanctionRecord,
  CounterSanctionRecord,
  Econ_Sector
} from '../types';

/**
 * Checks whether a sanctioned nation decides to retaliate with counter-sanctions against the sender.
 * Retaliation triggers on high threat/escalation levels or long-term pain parameters.
 * @param targetProfile Target economic profile
 * @param sanctionRecord Active sanction record
 * @param worldTick Current game tick
 * @returns shouldCounter flag, intensity rating (0-100), and reason rationale
 */
export function evaluateCounterSanctionTrigger(
  targetProfile: Econ_NationProfile,
  sanctionRecord: ActiveSanctionRecord,
  worldTick: number
): { shouldCounter: boolean; intensity: number; rationale: string } {
  const activeTicks = worldTick - sanctionRecord.imposedTick;

  // Trigger A: Existential total cutoff (TIER_5)
  if (sanctionRecord.tier === 'TIER_5_TOTAL_ISOLATION') {
    const intensity = Math.min(100, Math.round((sanctionRecord.currentDamagePct * 2.2) + (targetProfile.sanctionResistanceScore * 0.4)));
    return {
      shouldCounter: true,
      intensity,
      rationale: `Existential threat (TIER_5) triggered automatic maximum retaliation in defense.`
    };
  }

  // Trigger B: Medium sanction level + capability margin
  const level3OrAbove =
    sanctionRecord.tier === 'TIER_3_SECTORAL' ||
    sanctionRecord.tier === 'TIER_4_COMPREHENSIVE';
  if (level3OrAbove && targetProfile.sanctionResistanceScore > 40) {
    const intensity = Math.min(90, Math.round((sanctionRecord.currentDamagePct * 1.8) + (targetProfile.sanctionResistanceScore * 0.3)));
    return {
      shouldCounter: true,
      intensity,
      rationale: `Target national capability score (${Math.round(targetProfile.sanctionResistanceScore)}) supports economic defensive retaliation.`
    };
  }

  // Trigger C: Protracted/sustained high-damage pain threshold hit
  if (sanctionRecord.currentDamagePct > 15 && activeTicks > 10) {
    const intensity = Math.min(85, Math.round((sanctionRecord.currentDamagePct * 2.0) + (targetProfile.sanctionResistanceScore * 0.2)));
    return {
      shouldCounter: true,
      intensity,
      rationale: `Protracted sanction pain threshold breached (>15% damage sustained over 10 ticks). Retaliating to force sanctions fatigue.`
    };
  }

  return { shouldCounter: false, intensity: 0, rationale: '' };
}

/**
 * Determines which economic sectors of the sanctioner the target will hit back in.
 * Identifies leverage based on target's export/capacity strengths vs sanctioner values.
 * @param targetProfile Retaliating nation's economic profile
 * @param sanctionerProfile Sanctioning nation's economic profile
 * @returns Array of Econ_Sector
 */
export function computeCounterSanctionSectors(
  targetProfile: Econ_NationProfile,
  sanctionerProfile: Econ_NationProfile
): Econ_Sector[] {
  const targetEnergyExport = targetProfile.energyExportRevenueUSD ?? 0;
  const sectors: Econ_Sector[] = [];

  // Leverage 1: Target has substantial energy exports
  if (targetEnergyExport > 10) {
    sectors.push('ENERGY');
  }

  // Leverage 2: Target is technology-rich or holds mineral leverage
  if (sanctionerProfile.technologyAccessScore < 90) {
    sectors.push('TECHNOLOGY');
    sectors.push('RARE_EARTH_MINING');
  }

  // Leverage 3: Fallback commodity or logistics blocks
  if (sectors.length === 0) {
    sectors.push('TRANSPORT_LOGISTICS');
    sectors.push('AGRICULTURE');
  }

  return sectors;
}

/**
 * Computes estimated counter-sanction GDP damage inflicted back onto the sanctioner.
 * Formula:
 * - baseDamage = intensityScore * 0.15
 * - scale factor = (100 - sanctioner.sanctionResistanceScore) / 100
 * - actualDamagePct = baseDamage * scale, capped [1%, 20%]
 * @param counterRecord Active counter sanction record
 * @param sanctionerProfile Sanctioning target profile
 * @returns Percentage of GDP damage (1-20%)
 */
export function computeCounterSanctionDamage(
  counterRecord: CounterSanctionRecord,
  sanctionerProfile: Econ_NationProfile
): number {
  const baseDamage = counterRecord.intensityScore * 0.15;
  const dependenceFactor = (100 - sanctionerProfile.sanctionResistanceScore) / 100;
  const rawDamage = baseDamage * dependenceFactor;

  return Math.min(20, Math.max(1, Math.round(rawDamage * 10) / 10));
}

/**
 * Factory builder for CounterSanctionRecord entities.
 * @param targetId Initiator country
 * @param sanctionRecord original parent sanction
 * @param intensity Intensity rating (0-100)
 * @param affectedSectors Array of Targeted sectors
 * @param currentTick Imposition Tick
 * @returns Instantiated CounterSanctionRecord
 */
export function buildCounterSanctionRecord(
  targetId: string,
  sanctionRecord: ActiveSanctionRecord,
  intensity: number,
  affectedSectors: Econ_Sector[],
  currentTick: number
): CounterSanctionRecord {
  return {
    id: `counter_${targetId}_${sanctionRecord.sourceId}_${currentTick}`,
    initiatorId: targetId,
    targetId: sanctionRecord.sourceId,
    triggeredAtTick: currentTick,
    affectedSectors,
    intensityScore: intensity,
    estimatedDamageToSanctionerPct: 0, // Solved inside evaluation
    status: 'ACTIVE'
  };
}

/**
 * Processes sector and macro GDP impacts of active counter-sanctions onto the sanctioner.
 * @param counterRecord Active counter record details
 * @param sanctionerProfile Target sanctioner economic profile
 * @returns Deltas mapping impacted sectors to health changes, GDP deltas, and narrative notes
 */
export function processCounterSanctionEffects(
  counterRecord: CounterSanctionRecord,
  sanctionerProfile: Econ_NationProfile
): {
  sectorDamage: Partial<Record<Econ_Sector, number>>;
  gdpDeltaPct: number;
  narrative: string;
} {
  const gdpDeltaPct = computeCounterSanctionDamage(counterRecord, sanctionerProfile);
  const sectorDamage: Partial<Record<Econ_Sector, number>> = {};

  // For each counter sector, direct deterioration proportional to intensity
  const individualSectors = counterRecord.affectedSectors;
  individualSectors.forEach(s => {
    const rawLoss = counterRecord.intensityScore * 0.25;
    sectorDamage[s] = Math.min(20, Math.max(2, rawLoss));
  });

  const sectorNames = individualSectors.join(', ');
  const narrative = `[REPRISAL ACTION] ${counterRecord.initiatorId} imposed counter-retaliation on ${counterRecord.targetId}, squeezing ${sectorNames}. Retaliation intensity: ${counterRecord.intensityScore}%, creating substantial blowback.`;

  return {
    sectorDamage,
    gdpDeltaPct,
    narrative
  };
}
