import {
  Econ_NationProfile,
  ActiveSanctionRecord,
  SanctionEvasionRoute,
  SanctionEvasionState
} from '../types';
import { computeSecondarySanctionPressure } from './sanctionTierRules';

/**
 * Computes the total evasion neutralization score (0-85%).
 * Combines all active route effectiveness scores with diminishing returns above 60%.
 * Formula:
 * - rawSum = Sum of all active route effectivenesses
 * - if rawSum <= 60: return rawSum
 * - if rawSum > 60: 60 + (rawSum - 60) * 0.4
 * - Hard cap at 85%
 * @param evasionState General evasion state
 * @returns Total neutralization percentage
 */
export function computeEvasionNeutralizationPct(evasionState: SanctionEvasionState): number {
  let rawSum = 0;
  evasionState.activeRoutes.forEach(r => {
    rawSum += evasionState.routeEffectiveness[r] || 0;
  });

  let neutralized = rawSum;
  if (rawSum > 60) {
    neutralized = 60 + (rawSum - 60) * 0.4;
  }

  // Double check that it aligns with the absolute system constraint
  return Math.min(85, Math.max(0, neutralized));
}

/**
 * Grows the target's static adaptation rate per tick, motivated by sanction pressure duration.
 * Formula:
 * - baseGrowth = 0.5 + (lifetimeTicks * 0.02)
 * - growth = baseGrowth * (sanctionResistanceScore / 100)
 * - If tier is TIER_5_TOTAL_ISOLATION, multiply by 1.4 (maximum urgency)
 * - Hard cap at 80
 * @param targetProfile Economic profile of target nation
 * @param sanctionRecord Active sanction record
 * @returns New adaptationRate value
 */
export function growAdaptationRate(
  targetProfile: Econ_NationProfile,
  sanctionRecord: ActiveSanctionRecord,
  evasionState: SanctionEvasionState
): number {
  const baseGrowth = 0.5 + sanctionRecord.lifetimeTicks * 0.02;
  let growth = baseGrowth * (targetProfile.sanctionResistanceScore / 100);

  if (sanctionRecord.tier === 'TIER_5_TOTAL_ISOLATION') {
    growth *= 1.4;
  }

  const currentRate = targetProfile.adaptationRate ?? 0;
  return Math.min(80, currentRate + growth);
}

/**
 * Examines potential evasion routes and determines which newly qualified routes have activated.
 * @param targetProfile Economic profile of target nation
 * @param sanctionRecord Active sanction record
 * @param worldTick Current game world tick
 * @param activeRoutes Currently active routes
 * @returns Newly detected routes and narrative update
 */
export function detectNewEvasionRoutes(
  targetProfile: Econ_NationProfile,
  sanctionRecord: ActiveSanctionRecord,
  worldTick: number,
  activeRoutes: SanctionEvasionRoute[]
): { newRoutes: SanctionEvasionRoute[]; narrative: string } {
  const lifeTicks = worldTick - sanctionRecord.imposedTick;
  const newRoutes: SanctionEvasionRoute[] = [];

  const techHealth = targetProfile.currentSectorHealth?.['TECHNOLOGY'] ?? 100;
  const financialHealth = targetProfile.currentSectorHealth?.['FINANCIAL_SERVICES'] ?? 100;

  // Evaluate candidate triggers
  if (lifeTicks >= 3 && !activeRoutes.includes('THIRD_PARTY_RELAY')) {
    newRoutes.push('THIRD_PARTY_RELAY');
  }
  if (targetProfile.energyExportRevenueUSD > 0 && !activeRoutes.includes('SHADOW_FLEET')) {
    newRoutes.push('SHADOW_FLEET');
  }
  if (techHealth > 50 && !activeRoutes.includes('CRYPTO_SETTLEMENT')) {
    newRoutes.push('CRYPTO_SETTLEMENT');
  }
  if (lifeTicks >= 8 && !activeRoutes.includes('BARTER_ARRANGEMENT')) {
    newRoutes.push('BARTER_ARRANGEMENT');
  }
  if (financialHealth > 40 && !activeRoutes.includes('SHELL_COMPANY_NETWORK')) {
    newRoutes.push('SHELL_COMPANY_NETWORK');
  }
  if (!activeRoutes.includes('DOMESTIC_SUBSTITUTION')) {
    newRoutes.push('DOMESTIC_SUBSTITUTION');
  }

  if (newRoutes.length === 0) {
    return { newRoutes: [], narrative: '' };
  }

  // Build classified intelligence style feed
  const routeNames = newRoutes.map(r => r.replace(/_/g, ' '));
  const narrative = `[INTEL WIRE] ${targetProfile.nationId} evasion networks expanded. New channels detected: ${routeNames.join(', ')}. Evasion effectiveness rising.`;

  return { newRoutes, narrative };
}

/**
 * Process evasion growth and updates individual route effectiveness.
 * @param targetProfile Target economic profile
 * @param sanctionRecord Sanctions details record
 * @param worldTick Current game world tick
 * @param existingEvasion Optional preexisting evasion state
 * @returns Updated SanctionEvasionState
 */
export function computeEvasionGrowth(
  targetProfile: Econ_NationProfile,
  sanctionRecord: ActiveSanctionRecord,
  worldTick: number,
  existingEvasion?: SanctionEvasionState
): SanctionEvasionState {
  const state: SanctionEvasionState = existingEvasion
    ? { ...existingEvasion }
    : {
        targetId: targetProfile.nationId,
        activeRoutes: [],
        routeEffectiveness: {
          THIRD_PARTY_RELAY: 0,
          SHADOW_FLEET: 0,
          CRYPTO_SETTLEMENT: 0,
          BARTER_ARRANGEMENT: 0,
          SHELL_COMPANY_NETWORK: 0,
          DOMESTIC_SUBSTITUTION: 0
        },
        totalEvasionNeutralizedPct: 0,
        evasionBuildupTick: 0,
        thirdPartyRelayNations: targetProfile.evadingVia || [],
        adaptationVelocity: Math.round(targetProfile.adaptationRate / 10)
      };

  // 1. Audit and unlock new routes
  const { newRoutes } = detectNewEvasionRoutes(targetProfile, sanctionRecord, worldTick, state.activeRoutes);
  newRoutes.forEach(r => {
    state.activeRoutes.push(r);
    // Initial starting value based on type
    if (r === 'THIRD_PARTY_RELAY') state.routeEffectiveness[r] = 10;
    else if (r === 'SHADOW_FLEET') state.routeEffectiveness[r] = 5;
    else if (r === 'CRYPTO_SETTLEMENT') state.routeEffectiveness[r] = 8;
    else if (r === 'BARTER_ARRANGEMENT') state.routeEffectiveness[r] = 5;
    else if (r === 'SHELL_COMPANY_NETWORK') state.routeEffectiveness[r] = 10;
    else if (r === 'DOMESTIC_SUBSTITUTION') state.routeEffectiveness[r] = Math.round(targetProfile.adaptationRate * 0.3);
  });

  state.evasionBuildupTick++;
  state.adaptationVelocity = Math.round(targetProfile.adaptationRate / 10);
  state.thirdPartyRelayNations = targetProfile.evadingVia || [];

  // Enable secondary pressure deduction
  const secondaryPenalty = computeSecondarySanctionPressure(
    sanctionRecord.secondarySanctionActive,
    sanctionRecord.secondarySanctionTargets,
    state.activeRoutes
  );

  // 2. Grow existing routes
  state.activeRoutes.forEach(r => {
    let growth = 1.0;
    let cap = 30;

    switch (r) {
      case 'THIRD_PARTY_RELAY':
        growth = 3.0;
        cap = sanctionRecord.secondarySanctionActive && sanctionRecord.secondarySanctionTargets.length > 0 ? 20 : 40;
        break;
      case 'SHADOW_FLEET':
        growth = 2.0;
        cap = 30;
        break;
      case 'CRYPTO_SETTLEMENT':
        growth = 1.5;
        cap = 25;
        break;
      case 'BARTER_ARRANGEMENT':
        growth = 1.0;
        cap = 20;
        break;
      case 'SHELL_COMPANY_NETWORK':
        growth = 2.0;
        cap = 35;
        break;
      case 'DOMESTIC_SUBSTITUTION':
        growth = Math.max(0.1, targetProfile.adaptationRate * 0.05);
        cap = 40;
        break;
    }

    const currentVal = state.routeEffectiveness[r] || 0;
    let newVal = currentVal + growth;

    // Apply secondary sanctions penalty directly if relay or shadow fleet
    if (secondaryPenalty !== 0) {
      if (r === 'THIRD_PARTY_RELAY' || r === 'SHADOW_FLEET') {
        newVal += (secondaryPenalty / 2); // Split penalty directly across helper methods
      }
    }

    state.routeEffectiveness[r] = Math.min(cap, Math.max(0, newVal));
  });

  // Calculate total neutralized score
  state.totalEvasionNeutralizedPct = computeEvasionNeutralizationPct(state);

  return state;
}

/**
 * Translates theoretical target damage into actual damage after evasion offsets.
 * Formula: actualDamage = theoreticalDamage * (1 - totalEvasionNeutralization / 100)
 * Min cap floor: 2% macro loss if theoretical was non-zero.
 * @param evasionState Current evasion state
 * @param theoreticalDamage Theoretical damage
 * @returns Net actual damage percentage (0-60%)
 */
export function computeEvasionImpactOnSanction(
  evasionState: SanctionEvasionState,
  theoreticalDamage: number
): number {
  if (theoreticalDamage <= 0) return 0;
  const reduction = theoreticalDamage * (evasionState.totalEvasionNeutralizedPct / 100);
  const actualDamage = theoreticalDamage - reduction;
  return Math.max(2, actualDamage);
}
