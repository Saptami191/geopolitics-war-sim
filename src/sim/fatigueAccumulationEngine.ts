import {
  ActiveSanctionRecord,
  SanctionFatigueDriver,
  SanctionFatigueState,
  Econ_NationProfile
} from '../types';

/**
 * Sweeps economic indicators and compiles active fatigue driver categories representing
 * points of political friction in the sanctioning nation.
 * @param sanctionerCost Domestic cost values of the sanctioner
 * @param politicalPressure Election pressure score
 * @param targetProfile Economic profile of the target
 * @param record Active sanction record
 * @returns Array of active SanctionFatigueDriver elements
 */
export function refreshFatigueDrivers(
  sanctionerCost: { energyCostIndex: number; tradeRevenueLossB: number },
  politicalPressure: number,
  targetProfile: Econ_NationProfile,
  record: ActiveSanctionRecord
): SanctionFatigueDriver[] {
  const drivers: SanctionFatigueDriver[] = [];

  if (sanctionerCost.energyCostIndex > 40) {
    drivers.push('DOMESTIC_ENERGY_COSTS');
  }
  if (sanctionerCost.tradeRevenueLossB > 5) {
    drivers.push('TRADE_REVENUE_LOSS');
  }
  if (targetProfile.foodSecurityScore < 25) {
    drivers.push('HUMANITARIAN_OPTICS');
  }
  if (politicalPressure > 60) {
    drivers.push('ELECTION_CYCLE_PRESSURE');
  }
  if (record.counterSanctionActive) {
    drivers.push('COUNTER_SANCTIONS_PAIN');
  }

  return drivers;
}

/**
 * Computes the fatigue score delta (+ or -) added to the current fatigue level for this tick.
 * Base fatigue increases slowly over time, accelerated by pain drivers, and mitigated by progress/success.
 * Formula:
 * - baseDelta = +0.3
 * - +0.8 if DOMESTIC_ENERGY_COSTS active
 * - +0.5 if TRADE_REVENUE_LOSS active
 * - +2.5 * coalitionDefectionCount if defects happened this tick
 * - +1.5 if HUMANITARIAN_OPTICS active
 * - +1.2 if ELECTION_CYCLE_PRESSURE active
 * - +1.0 if COUNTER_SANCTIONS_PAIN active
 * - Mitigations: -0.5 if rating is CRUSHING
 * - Mitigations: -0.3 if damage increased compared to previous state progress
 * @param fatigueState Current fatigue state
 * @param sanctionRecord Active sanction record
 * @param sanctionerCost Costs suffered by the sanctioner
 * @param coalitionDefectionCount New defection count this turn
 * @param politicalPressure Election pressure score
 * @param targetProfile Economic profile of target nation
 * @param damageGrown Whether damage has increased on this tick
 * @returns Raw numeric level change to add to fatigueScore (can be negative)
 */
export function computeFatigueDelta(
  fatigueState: SanctionFatigueState,
  sanctionRecord: ActiveSanctionRecord,
  sanctionerCost: { energyCostIndex: number; tradeRevenueLossB: number },
  coalitionDefectionCount: number,
  politicalPressure: number,
  targetProfile: Econ_NationProfile,
  damageGrown: boolean,
  effectivenessRating: string
): number {
  let delta = 0.3; // Baseline grind of continuous sanctions

  const drivers = refreshFatigueDrivers(sanctionerCost, politicalPressure, targetProfile, sanctionRecord);

  // Add driver pressures
  if (drivers.includes('DOMESTIC_ENERGY_COSTS')) delta += 0.8;
  if (drivers.includes('TRADE_REVENUE_LOSS')) delta += 0.5;
  if (drivers.includes('HUMANITARIAN_OPTICS')) delta += 1.5;
  if (drivers.includes('ELECTION_CYCLE_PRESSURE')) delta += 1.2;
  if (drivers.includes('COUNTER_SANCTIONS_PAIN')) delta += 1.0;

  // Defection spikes
  if (coalitionDefectionCount > 0) {
    delta += coalitionDefectionCount * 2.5;
  }

  // Mitigations based on effectiveness and forward progress
  if (effectivenessRating === 'CRUSHING') {
    delta -= 0.5;
  }
  if (damageGrown) {
    delta -= 0.3;
  }

  return delta;
}

/**
 * Evaluates the fatigue level and issues warnings or actions when specific thresholds are breached.
 * Consequence Map:
 * - 0-50: NONE (healthy)
 * - 50-70: NONE (moderate pressure)
 * - 70-85: COALITION_FRACTURE (highest risk ally leaves)
 * - 85-95: TIER_ROLLBACK (automatic tier downgrade)
 * - > 95: SANCTION_LIFT (total coalition collapse)
 * @param fatigueState Current fatigue state
 * @returns Severity breakpoint validation and structural consequence outcome
 */
export function evaluateFatigueBreakpoint(
  fatigueState: SanctionFatigueState
): {
  breakpointReached: boolean;
  consequence: 'COALITION_FRACTURE' | 'TIER_ROLLBACK' | 'SANCTION_LIFT' | 'NONE';
} {
  const score = fatigueState.fatigueScore;

  if (score <= 50) {
    return { breakpointReached: false, consequence: 'NONE' };
  }

  if (score > 50 && score <= 70) {
    return { breakpointReached: false, consequence: 'NONE' };
  }

  if (score > 70 && score <= 85) {
    return { breakpointReached: true, consequence: 'COALITION_FRACTURE' };
  }

  if (score > 85 && score <= 95) {
    return { breakpointReached: true, consequence: 'TIER_ROLLBACK' };
  }

  return { breakpointReached: true, consequence: 'SANCTION_LIFT' };
}
