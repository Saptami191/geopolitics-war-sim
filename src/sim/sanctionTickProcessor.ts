import {
  SanctionsGameplayState,
  Econ_NationProfile,
  ActiveSanctionRecord,
  SanctionCoalitionMember,
  SanctionFatigueState,
  CounterSanctionRecord,
  Econ_Sector
} from '../types';

import {
  computeTheoreticalDamage,
  computeCoalitionMultiplier,
  canEscalateSanction
} from './sanctionTierRules';

import {
  computeEvasionGrowth,
  computeEvasionImpactOnSanction,
  growAdaptationRate
} from './sanctionsEvasionEngine';

import {
  computeSectorDamageDistribution,
  computeReserveDepletion,
  computeInflationSurge,
  computePopulationUnrestDelta,
  computeDiplomaticReputationDelta,
  buildImpactAssessment
} from './targetDamageModel';

import {
  computeSanctionerDomesticCost,
  computeElectionCyclePressure,
  computeAlliedDefectionRisk,
  processPotentialCoalitionDefection,
  getTierIndex
} from './sanctionerCostModel';

import {
  computeFatigueDelta,
  evaluateFatigueBreakpoint,
  refreshFatigueDrivers
} from './fatigueAccumulationEngine';

import {
  evaluateCounterSanctionTrigger,
  computeCounterSanctionSectors,
  buildCounterSanctionRecord,
  processCounterSanctionEffects
} from './counterSanctionsEngine';

export interface SanctionsTickResults {
  unrestDeltas: Record<string, number>;        // targetNationId -> delta
  stabilityDeltas: Record<string, number>;     // sourceNationId -> delta
  globalEvents: { text: string; severity: 'INFO' | 'WARNING' | 'CRITICAL' }[];
}

/**
 * Main per-tick coordinator for the Sanctions simulation.
 * Iterates through all ACTIVE/ERODING/FATIGUED sanction records, updates state,
 * computes damage, processes domestic blowbacks, allied defections, fatigue, and counter-retaliations.
 * Mutates draft state references directly (Immer compliant) and returns outside store side-effects.
 * @param sanctionsState Draft of deep sanctions gameplay storage
 * @param econNations Draft of live country economic profiles
 * @param currentTick Current game simulation tick
 * @returns Results object tracking unrest, stability deltas, and narrative events
 */
export function processSanctionsTick(
  sanctionsState: SanctionsGameplayState,
  econNations: Record<string, Econ_NationProfile>,
  currentTick: number
): SanctionsTickResults {
  const results: SanctionsTickResults = {
    unrestDeltas: {},
    stabilityDeltas: {},
    globalEvents: []
  };

  // Filter records that are actively in force
  const activeRecords = sanctionsState.activeSanctionRecords.filter(
    r => r.status === 'ACTIVE' || r.status === 'ERODING' || r.status === 'FATIGUED'
  );

  activeRecords.forEach(record => {
    const targetId = record.targetId;
    const sourceId = record.sourceId;

    const targetProfile = econNations[targetId];
    const sourceProfile = econNations[sourceId];

    if (!targetProfile || !sourceProfile) {
      return; // Skip if dependent economic data is missing
    }

    // 1. Increment lifetime tracking duration
    record.lifetimeTicks++;

    // 2. Fetch and evolve Evasion State
    const existingEvasion = sanctionsState.evasionStates[targetId];
    const evolvedEvasion = computeEvasionGrowth(targetProfile, record, currentTick, existingEvasion);
    sanctionsState.evasionStates[targetId] = evolvedEvasion;

    // Synchronize record with evolved evasion state
    record.evasionRoutes = evolvedEvasion.activeRoutes;
    record.evasionEffectivenessScore = evolvedEvasion.totalEvasionNeutralizedPct;

    // Status shifts based on evasion levels
    if (record.status !== 'FATIGUED') {
      record.status = evolvedEvasion.totalEvasionNeutralizedPct > 45 ? 'ERODING' : 'ACTIVE';
    }

    // Adapt / Grow static adaptation rate
    targetProfile.adaptationRate = growAdaptationRate(targetProfile, record, evolvedEvasion);

    // 3. Compute structural damage limits
    const theoreticalDmg = computeTheoreticalDamage(record.tier, record.affectedSectors, targetProfile);
    record.theoreticalDamagePct = theoreticalDmg;

    // 4. Multiply limits against coalition consensus stability
    const coalitionCohesion = record.coalitionCohesionScore;
    const coalitionMult = computeCoalitionMultiplier(record.coalitionMemberIds, coalitionCohesion);

    // 5. Evaluate final actual GDP loss inflicted
    const baseActualDmg = computeEvasionImpactOnSanction(evolvedEvasion, theoreticalDmg);
    const prevDamagePct = record.currentDamagePct;
    record.currentDamagePct = Math.min(60, baseActualDmg * coalitionMult);
    const damageGrown = record.currentDamagePct > prevDamagePct;

    // 6. Sectoral distribution of damage onto target economy
    const sectorDeltas = computeSectorDamageDistribution(record.tier, record.affectedSectors, record.currentDamagePct, targetProfile);
    for (const key in sectorDeltas) {
      const sector = key as Econ_Sector;
      const currentHealth = targetProfile.currentSectorHealth?.[sector] ?? 100;
      targetProfile.currentSectorHealth[sector] = Math.max(0, currentHealth - sectorDeltas[sector]);
    }

    // 7. Accumulate Treasury reserve depletion
    const reserveDrain = computeReserveDepletion(targetProfile, record.currentDamagePct);
    targetProfile.reserveDepletionRatePerTick = Math.max(0.1, targetProfile.reserveDepletionRatePerTick + reserveDrain);
    targetProfile.currencyReserveUSD = Math.max(0, targetProfile.currencyReserveUSD - reserveDrain);

    // 8. Commodities Inflation Surges
    const inflationDelta = computeInflationSurge(record.affectedSectors, sectorDeltas);
    targetProfile.inflationRate = Math.min(100, targetProfile.inflationRate + inflationDelta);

    // 9. Civil unrest delta calculations
    const unrestD = computePopulationUnrestDelta(record.currentDamagePct, inflationDelta, targetProfile.foodSecurityScore);
    results.unrestDeltas[targetId] = (results.unrestDeltas[targetId] ?? 0) + unrestD;

    // 10. Global diplomatic standing rep changes
    const repDelta = computeDiplomaticReputationDelta(record.tier, record.currentDamagePct, targetProfile.foodSecurityScore);
    results.stabilityDeltas[sourceId] = (results.stabilityDeltas[sourceId] ?? 0) + repDelta;

    // 11. Impact assessment compiling
    const assessment = buildImpactAssessment(
      record,
      sectorDeltas,
      reserveDrain,
      inflationDelta,
      targetProfile.foodSecurityScore,
      unrestD,
      repDelta
    );
    sanctionsState.impactAssessments[record.id] = assessment;

    // 12. Domestic Blowback cost calculations for Sanctioner
    const domesticCosts = computeSanctionerDomesticCost(sourceProfile, targetProfile, record);
    sourceProfile.gdpEstimateUSD = Math.max(10, sourceProfile.gdpEstimateUSD * (1 - domesticCosts.gdpCostPct / 100));

    // 13. Election cycle political pressures
    const electionPressure = computeElectionCyclePressure(sourceId, domesticCosts.domesticPainScore, currentTick);

    // 14. Coalition allied defection evaluations
    let defectionCount = 0;
    const activeCoalitionId = record.id;
    const allies = sanctionsState.coalitionMembers[activeCoalitionId] || [];

    const remainingAllies: SanctionCoalitionMember[] = [];
    allies.forEach(ally => {
      const allyProfile = econNations[ally.nationId];
      if (!allyProfile) {
        remainingAllies.push(ally);
        return;
      }

      // Calculate ally's unique cost in coalition
      const allyCost = computeSanctionerDomesticCost(allyProfile, targetProfile, record);
      const defectionRisk = computeAlliedDefectionRisk(ally, allyCost.domesticPainScore);

      // Decays loyalty if pain is active
      if (allyCost.domesticPainScore > 50) {
        ally.commitmentScore = Math.max(0, ally.commitmentScore - 1.5);
      }
      ally.defectionRisk = defectionRisk;

      const { defected, narrative } = processPotentialCoalitionDefection(ally, defectionRisk);
      if (defected) {
        defectionCount++;
        // Remove from list of co-signers
        record.coalitionMemberIds = record.coalitionMemberIds.filter(id => id !== ally.nationId);
        record.coalitionCohesionScore = Math.max(0, record.coalitionCohesionScore - 25);
        record.blowbackEventsLog.push(narrative);
        sanctionsState.sanctionEventLog.push(narrative);
        results.globalEvents.push({ text: narrative, severity: 'WARNING' });
      } else {
        remainingAllies.push(ally);
      }
    });
    sanctionsState.coalitionMembers[activeCoalitionId] = remainingAllies;

    // 15. Coalition Fatigue state evolution
    let fatigueState = sanctionsState.fatigueStates[`${sourceId}_${targetId}`];
    if (!fatigueState) {
      fatigueState = {
        sanctionerNationId: sourceId,
        targetNationId: targetId,
        fatigueScore: 0,
        activeDrivers: [],
        domesticEconomicPainScore: 0,
        politicalPressureScore: 0,
        alliedDefectionCount: 0,
        ticksWithNoProgress: 0,
        breakpointReached: false
      };
    }

    fatigueState.alliedDefectionCount += defectionCount;
    fatigueState.domesticEconomicPainScore = domesticCosts.domesticPainScore;
    fatigueState.politicalPressureScore = electionPressure;

    const fatigueD = computeFatigueDelta(
      fatigueState,
      record,
      domesticCosts,
      defectionCount,
      electionPressure,
      targetProfile,
      damageGrown,
      assessment.effectivenessRating
    );
    fatigueState.fatigueScore = Math.round(Math.min(100, Math.max(0, fatigueState.fatigueScore + fatigueD)));
    fatigueState.activeDrivers = refreshFatigueDrivers(domesticCosts, electionPressure, targetProfile, record);

    // Mirror fatigue score onto record
    record.sanctionerFatigueScore = fatigueState.fatigueScore;

    // 16. Breakpoint warning actions
    const breakpoint = evaluateFatigueBreakpoint(fatigueState);
    if (breakpoint.breakpointReached) {
      fatigueState.breakpointReached = true;

      if (breakpoint.consequence === 'COALITION_FRACTURE') {
        const coalitionAllies = sanctionsState.coalitionMembers[record.id] || [];
        if (coalitionAllies.length > 0) {
          // Find the member with highest defection risk or lowest commitment
          let worstIndex = 0;
          for (let i = 1; i < coalitionAllies.length; i++) {
            if (coalitionAllies[i].commitmentScore < coalitionAllies[worstIndex].commitmentScore) {
              worstIndex = i;
            }
          }
          const fracturedAlly = coalitionAllies[worstIndex];
          record.coalitionMemberIds = record.coalitionMemberIds.filter(id => id !== fracturedAlly.nationId);
          record.coalitionCohesionScore = Math.max(0, record.coalitionCohesionScore - 15);
          coalitionAllies.splice(worstIndex, 1);

          const msg = `[COALITION CRACK] Severe fatigue forced ${fracturedAlly.nationId} to break ranks from the ${record.id} sanctions regime.`;
          record.blowbackEventsLog.push(msg);
          sanctionsState.sanctionEventLog.push(msg);
          results.globalEvents.push({ text: msg, severity: 'WARNING' });
        }
      } else if (breakpoint.consequence === 'TIER_ROLLBACK') {
        // Rollback sanction tier downwards
        let nextTier = record.tier;
        if (record.tier === 'TIER_5_TOTAL_ISOLATION') nextTier = 'TIER_4_COMPREHENSIVE';
        else if (record.tier === 'TIER_4_COMPREHENSIVE') nextTier = 'TIER_3_SECTORAL';
        else if (record.tier === 'TIER_3_SECTORAL') nextTier = 'TIER_2_TARGETED_INDIVIDUAL';
        else if (record.tier === 'TIER_2_TARGETED_INDIVIDUAL') nextTier = 'TIER_1_DIPLOMATIC_WARNING';

        if (nextTier !== record.tier) {
          const msg = `[TIER DEGRADATION] Extreme fatigue forced sanctioner coalition to scale down sanctions on ${record.targetId} to ${nextTier.replace(/_/g, ' ')}.`;
          record.tier = nextTier;
          record.status = 'FATIGUED';
          record.blowbackEventsLog.push(msg);
          sanctionsState.sanctionEventLog.push(msg);
          results.globalEvents.push({ text: msg, severity: 'INFO' });
        }
      } else if (breakpoint.consequence === 'SANCTION_LIFT') {
        // Total fatigue collapse forces complete lift of the sanction regime
        record.status = 'LIFTED';
        const msg = `[COALITION COLLAPSE] Total fatigue collapse. Sanction regime against ${record.targetId} has fully disintegrated.`;
        record.blowbackEventsLog.push(msg);
        sanctionsState.sanctionEventLog.push(msg);
        results.globalEvents.push({ text: msg, severity: 'CRITICAL' });
      }
    }
    sanctionsState.fatigueStates[`${sourceId}_${targetId}`] = fatigueState;

    // 17. Counter-sanctions triggering
    if (!record.counterSanctionActive && record.status !== 'LIFTED') {
      const counterCheck = evaluateCounterSanctionTrigger(targetProfile, record, currentTick);
      if (counterCheck.shouldCounter) {
        const counterSectors = computeCounterSanctionSectors(targetProfile, sourceProfile);
        const counterRecord = buildCounterSanctionRecord(targetId, record, counterCheck.intensity, counterSectors, currentTick);

        sanctionsState.counterSanctionRecords.push(counterRecord);
        record.counterSanctionActive = true;
        record.counterSanctionSectors = counterSectors;

        const msg = `[REPRISAL TRIGGER] ${targetId} retaliates against ${sourceId}! Counter-sanctions declared in sectors: ${counterSectors.join(', ')}.`;
        record.blowbackEventsLog.push(msg);
        sanctionsState.sanctionEventLog.push(msg);
        results.globalEvents.push({ text: msg, severity: 'WARNING' });
      }
    }

    // 18. Counter-sanctions continuous damage effects
    if (record.counterSanctionActive && record.status !== 'LIFTED') {
      const counterRecord = sanctionsState.counterSanctionRecords.find(
        cr => cr.initiatorId === targetId && cr.targetId === sourceId && cr.status === 'ACTIVE'
      );
      if (counterRecord) {
        const reprisals = processCounterSanctionEffects(counterRecord, sourceProfile);
        counterRecord.estimatedDamageToSanctionerPct = reprisals.gdpDeltaPct;

        // Apply health hits to sanctioner economic sectors
        for (const key in reprisals.sectorDamage) {
          const s = key as Econ_Sector;
          const currentH = sourceProfile.currentSectorHealth?.[s] ?? 100;
          sourceProfile.currentSectorHealth[s] = Math.max(0, currentH - (reprisals.sectorDamage[s] || 0));
        }

        // Apply GDP penalty to sanctioner
        sourceProfile.gdpEstimateUSD = Math.max(10, sourceProfile.gdpEstimateUSD * (1 - reprisals.gdpDeltaPct / 100));

        // Add to log occasionally to reduce spam
        if (currentTick % 5 === 0) {
          record.blowbackEventsLog.push(reprisals.narrative);
        }
      }
    }
  });

  return results;
}
