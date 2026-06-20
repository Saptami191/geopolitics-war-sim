import {
  SanctionTier,
  Econ_Sector,
  Econ_NationProfile,
  ActiveSanctionRecord,
  SanctionEvasionRoute
} from '../types';

/**
 * Computes the theoretical GDP damage percentage (0-60%) for a given sanction tier,
 * based on affected sectors, sector criticality, and the target's resistance profile.
 * Formula:
 * - TIER_1: 0%
 * - TIER_2: 3% (minimal macro freeze)
 * - TIER_3: Sum of each affected sector's base criticality (ENERGY=18%, TECHNOLOGY=12%, FINANCIAL_SERVICES=15%, DEFENCE_INDUSTRIAL=8%, others=5%)
 * - TIER_4: Sum of top 4 affected sectors' criticality * 0.7
 * - TIER_5: Base of 45-60%, scaled linearly by (100 - resistance)/100
 * @param tier The sanction tier
 * @param affectedSectors The list of trade sectors affected
 * @param targetProfile The economic profile of the target country
 * @returns Theoretical damage percentage (0-60)
 */
export function computeTheoreticalDamage(
  tier: SanctionTier,
  affectedSectors: Econ_Sector[],
  targetProfile: Econ_NationProfile
): number {
  switch (tier) {
    case 'TIER_1_DIPLOMATIC_WARNING':
      return 0;

    case 'TIER_2_TARGETED_INDIVIDUAL':
      return 3; // 3% average targeted freeze damage

    case 'TIER_3_SECTORAL': {
      let sum = 0;
      affectedSectors.forEach(sector => {
        if (sector === 'ENERGY') sum += 18;
        else if (sector === 'FINANCIAL_SERVICES') sum += 15;
        else if (sector === 'TECHNOLOGY') sum += 12;
        else if (sector === 'DEFENCE_INDUSTRIAL') sum += 8;
        else sum += 5;
      });
      return Math.min(40, sum);
    }

    case 'TIER_4_COMPREHENSIVE': {
      const criticalities = affectedSectors.map(sector => {
        if (sector === 'ENERGY') return 18;
        if (sector === 'FINANCIAL_SERVICES') return 15;
        if (sector === 'TECHNOLOGY') return 12;
        if (sector === 'DEFENCE_INDUSTRIAL') return 8;
        return 5;
      });
      criticalities.sort((a, b) => b - a);
      const top4Sum = criticalities.slice(0, 4).reduce((sum, val) => sum + val, 0);
      return Math.min(50, top4Sum * 0.7);
    }

    case 'TIER_5_TOTAL_ISOLATION': {
      // Base damage is 45% minimum up to 60%, scaled by target's lack of resistance
      const resistanceFactor = (100 - targetProfile.sanctionResistanceScore) / 100;
      const damage = 45 + resistanceFactor * 15;
      return Math.min(60, Math.max(45, damage));
    }

    default:
      return 0;
  }
}

/**
 * Returns a logical list of economic sectors affected by a given sanction tier.
 * TIER_3 can block a specific chosen sector, while others have predetermined sectors.
 * @param tier The sanction tier
 * @param targetProfile The economic profile of the target
 * @param chosenSector For TIER_3 sectoral, the specific sector to target
 * @returns Array of Econ_Sector
 */
export function computeAffectedSectors(
  tier: SanctionTier,
  targetProfile: Econ_NationProfile,
  chosenSector?: Econ_Sector
): Econ_Sector[] {
  switch (tier) {
    case 'TIER_1_DIPLOMATIC_WARNING':
      return [];

    case 'TIER_2_TARGETED_INDIVIDUAL':
      return ['FINANCIAL_SERVICES'];

    case 'TIER_3_SECTORAL':
      return chosenSector ? [chosenSector] : ['ENERGY'];

    case 'TIER_4_COMPREHENSIVE':
      return ['ENERGY', 'TECHNOLOGY', 'FINANCIAL_SERVICES', 'MANUFACTURING', 'TRANSPORT_LOGISTICS'];

    case 'TIER_5_TOTAL_ISOLATION':
      return [
        'ENERGY',
        'DEFENCE_INDUSTRIAL',
        'FINANCIAL_SERVICES',
        'TECHNOLOGY',
        'AGRICULTURE',
        'MANUFACTURING',
        'TRANSPORT_LOGISTICS',
        'RARE_EARTH_MINING',
        'TELECOMS',
        'PHARMACEUTICALS'
      ];

    default:
      return [];
  }
}

/**
 * Computes a coalition effectiveness multiplier (0.85 to 2.0) based on the number
 * of co-sanctioning nations and their collective cohesion score.
 * Multiplier Scale:
 * - Solo: 1.0
 * - 2-3 members, cohesion > 60: 1.3
 * - 4-5 members, cohesion > 70: 1.6
 * - 6+ members, cohesion > 80: 1.9
 * - Decayed/broken coalition (cohesion < 40): 0.85
 * @param coalitionMemberIds Coalition participants
 * @param coalitionCohesionScore Cohesion ranking (0-100)
 * @returns Coalition multiplier coefficient
 */
export function computeCoalitionMultiplier(
  coalitionMemberIds: string[],
  coalitionCohesionScore: number
): number {
  if (coalitionCohesionScore < 40) {
    return 0.85; // broken coalition decreases effectiveness from baseline
  }

  const count = coalitionMemberIds.length;
  if (count <= 1) {
    return 1.0; // Solo
  }

  if (count >= 2 && count <= 3 && coalitionCohesionScore > 60) {
    return 1.3;
  }

  if (count >= 4 && count <= 5 && coalitionCohesionScore > 70) {
    return 1.6;
  }

  if (count >= 6 && coalitionCohesionScore > 80) {
    return 1.9;
  }

  // Fallback for mediocre cohesion coalitions
  return 1.1;
}

/**
 * Computes the evasion neutralization penalty (subtracted index) applied to evasion routes
 * based on whether the sanctioner forces secondary sanctions onto third-party helper states.
 * @param secondarySanctionActive Whether the sanctioner has secondary sanctions enabled
 * @param secondarySanctionTargets Third party states being pressured
 * @param evasionRoutes Active methods of evasion
 * @returns Negative reduction delta to evasion effectiveness (e.g. -25 per overlapping route)
 */
export function computeSecondarySanctionPressure(
  secondarySanctionActive: boolean,
  secondarySanctionTargets: string[],
  evasionRoutes: SanctionEvasionRoute[]
): number {
  if (!secondarySanctionActive || secondarySanctionTargets.length === 0) {
    return 0;
  }

  let penalty = 0;
  // If we are actively secondary-sanctioning, each target state under pressure cuts off third party and shadow fleet efficiency
  if (evasionRoutes.includes('THIRD_PARTY_RELAY')) {
    penalty += secondarySanctionTargets.length * 15;
  }
  if (evasionRoutes.includes('SHADOW_FLEET')) {
    penalty += secondarySanctionTargets.length * 10;
  }

  return -Math.min(50, penalty);
}

/**
 * Maps a given sanction tier to its next escalated level, capped at TIER_5.
 * @param currentTier Current tier
 * @returns Next escalated SanctionTier
 */
export function escalateSanctionTier(currentTier: SanctionTier): SanctionTier {
  const progression: Record<SanctionTier, SanctionTier> = {
    'TIER_1_DIPLOMATIC_WARNING': 'TIER_2_TARGETED_INDIVIDUAL',
    'TIER_2_TARGETED_INDIVIDUAL': 'TIER_3_SECTORAL',
    'TIER_3_SECTORAL': 'TIER_4_COMPREHENSIVE',
    'TIER_4_COMPREHENSIVE': 'TIER_5_TOTAL_ISOLATION',
    'TIER_5_TOTAL_ISOLATION': 'TIER_5_TOTAL_ISOLATION'
  };
  return progression[currentTier] || currentTier;
}

/**
 * Evaluates whether a sanction can be escalated based on fatigue, cohesion, and current level limits.
 * @param record Active sanction record
 * @param targetProfile Economic profile of target nation
 * @returns Boolean flag and detailed reason rationale
 */
export function canEscalateSanction(
  record: ActiveSanctionRecord,
  targetProfile: Econ_NationProfile
): { canEscalate: boolean; reason: string } {
  if (record.tier === 'TIER_5_TOTAL_ISOLATION') {
    return { canEscalate: false, reason: 'Sanctions have already reached terminal intensity (TIER_5_TOTAL_ISOLATION).' };
  }

  if (record.sanctionerFatigueScore > 70) {
    return { canEscalate: false, reason: `Sanctioning coalition fatigue (${Math.round(record.sanctionerFatigueScore)}%) is too elevated to support escalation.` };
  }

  if (record.coalitionCohesionScore < 30) {
    return { canEscalate: false, reason: `Coalition cohesion (${Math.round(record.coalitionCohesionScore)}%) is fractured. Structural consensus impossible.` };
  }

  return { canEscalate: true, reason: 'Escalation authorized under current coalition state margins.' };
}
