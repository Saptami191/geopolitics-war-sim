import {
  Econ_NationProfile,
  ActiveSanctionRecord,
  SanctionCoalitionMember,
  SanctionTier
} from '../types';

/**
 * Maps SanctionTier to a numerical level index 1-5.
 * @param tier Active sanction tier
 * @returns Numeric representation 1-5
 */
export function getTierIndex(tier: SanctionTier): number {
  switch (tier) {
    case 'TIER_1_DIPLOMATIC_WARNING': return 1;
    case 'TIER_2_TARGETED_INDIVIDUAL': return 2;
    case 'TIER_3_SECTORAL': return 3;
    case 'TIER_4_COMPREHENSIVE': return 4;
    case 'TIER_5_TOTAL_ISOLATION': return 5;
    default: return 1;
  }
}

/**
 * Computes domestic cost and side-effects suffered by the sanctioning country.
 * GDP cost and energy indexes scale based on target size and tier severity.
 * Formula:
 * - gdpCostPct = (tierIndex / 5) * 1.5 * (1 + targetGDP / 2000), capped [0.1, 3.0]%
 * - energyCostIndex = 20 if ENERGY sector is blocked and target is high-export
 * - tradeRevenueLossB = (sanctionerGDP * 0.025) * (tierIndex / 5)
 * - domesticPainScore = weighted sum of cost components, normalized 0-100
 * @param sanctionerProfile Economic profile of sanctioning nation
 * @param targetProfile Economic profile of target nation
 * @param sanctionRecord Active record
 * @returns Breakdown of pain metrics and pain score
 */
export function computeSanctionerDomesticCost(
  sanctionerProfile: Econ_NationProfile,
  targetProfile: Econ_NationProfile,
  sanctionRecord: ActiveSanctionRecord
): {
  gdpCostPct: number;
  energyCostIndex: number;
  tradeRevenueLossB: number;
  domesticPainScore: number;
} {
  const tierIndex = getTierIndex(sanctionRecord.tier);

  // GDP cost pct scale
  const targetScale = 1 + (targetProfile.gdpBaselineUSD / 2000);
  const rawGdpCost = (tierIndex / 5) * 1.5 * targetScale;
  const gdpCostPct = Math.min(3.0, Math.max(0.1, rawGdpCost));

  // Energy cost index
  let energyCostIndex = 0;
  if (
    sanctionRecord.affectedSectors.includes('ENERGY') &&
    targetProfile.energyExportRevenueUSD > 10
  ) {
    energyCostIndex = Math.min(45, 10 + targetProfile.energyExportRevenueUSD * 0.15);
  }

  // Trade revenue loss B
  const tradeRevenueLossB =
    (sanctionerProfile.gdpEstimateUSD / 1000) * 2.5 * (tierIndex / 5);

  // Normalized Domestic pain score (0-100)
  const pain = (energyCostIndex * 1.2) + (tradeRevenueLossB * 4.0) + (gdpCostPct * 15.0);
  const domesticPainScore = Math.min(100, Math.max(0, pain));

  return {
    gdpCostPct: Math.round(gdpCostPct * 100) / 100,
    energyCostIndex: Math.round(energyCostIndex),
    tradeRevenueLossB: Math.round(tradeRevenueLossB * 10) / 10,
    domesticPainScore: Math.round(domesticPainScore)
  };
}

/**
 * Computes simulated domestic political cycle pressures on leadership.
 * Formula:
 * - basePressure = domesticPainScore * 0.8
 * - if worldTick falls inside 5-tick election window recurring every 40 ticks: add +30
 * @param sanctionerId ID of sanctioner nation
 * @param domesticPainScore Domestic pain rating
 * @param worldTick Current game tick
 * @returns Election cycle pressure rating (0-100)
 */
export function computeElectionCyclePressure(
  sanctionerId: string,
  domesticPainScore: number,
  worldTick: number
): number {
  let basePressure = domesticPainScore * 0.8;

  // Recur simulated election windows every 40 ticks, lasting 5 ticks
  const isElectionWindow = (worldTick % 40) < 5;
  if (isElectionWindow) {
    basePressure += 30;
  }

  return Math.min(100, Math.max(0, basePressure));
}

/**
 * Computes a coalition member's tick-based defection vulnerability risk rating.
 * Formula:
 * - base = (domesticPainScore > 65) ? (domesticPainScore - 65) * 2 else 0
 * - modifier = (100 - commitmentScore) * 0.5
 * @param coalitionMember Coalition member record
 * @param domesticPainScore Member's unique domestic pain index
 * @returns Defection risk (0-100)
 */
export function computeAlliedDefectionRisk(
  coalitionMember: SanctionCoalitionMember,
  domesticPainScore: number
): number {
  let risk = 0;
  if (domesticPainScore > 65) {
    risk += (domesticPainScore - 65) * 2.0;
  }

  const commitmentLoss = 100 - coalitionMember.commitmentScore;
  risk += commitmentLoss * 0.5;

  return Math.min(100, Math.max(0, risk));
}

/**
 * Simulates a single random roll for a coalition member defecting on this tick.
 * To maintain stability, we scale risk index down to keep defection event rates balanced.
 * @param member Member state profile
 * @param defectionRisk Calculated probability index
 * @returns Object state representing outcome and narrative
 */
export function processPotentialCoalitionDefection(
  member: SanctionCoalitionMember,
  defectionRisk: number
): { defected: boolean; narrative: string } {
  // Convert 0-100 risk rating to actual per-tick roll probability (risk * 0.05% per tick for pacing)
  const roll = Math.random() * 100;
  const threshold = defectionRisk * 0.08;

  if (roll < threshold && defectionRisk > 20) {
    return {
      defected: true,
      narrative: `[DIPLOMATIC BREAK] ${member.nationId} defected from the sanction coalition. Defector cited unacceptable domestic economic strain.`
    };
  }

  return { defected: false, narrative: '' };
}
