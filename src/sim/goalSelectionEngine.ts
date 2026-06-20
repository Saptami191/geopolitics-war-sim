import {
  GoalStack,
  StrategicPerceptionState,
  OpportunityAssessment,
  ConstraintAssessment,
  NationalIdentityVector,
  ThreatMemoryRecord,
  StrategicGoal,
  GoalPriorityRecord
} from '../types';

/**
 * Computes the scores for all goals in the stack and selects the highest-scoring goal.
 * 
 * @param goalStack The agent's current GoalStack
 * @param perception The agent's current StrategicPerceptionState
 * @param opportunities Refreshed collection of OpportunityAssessment
 * @param constraints Refreshed ConstraintAssessment
 * @param identity The agent's NationalIdentityVector
 * @param threatMemory Current threat memories
 * @returns An object containing ranked records and the top selected goal
 */
export function selectTopGoal(
  goalStack: GoalStack,
  perception: StrategicPerceptionState,
  opportunities: OpportunityAssessment[],
  constraints: ConstraintAssessment,
  identity: NationalIdentityVector,
  threatMemory: ThreatMemoryRecord[]
): {
  rankedRecords: GoalPriorityRecord[];
  selectedGoal: StrategicGoal;
} {
  const rankedRecords: GoalPriorityRecord[] = [];

  // 1. Pre-calculate constraint penalty
  // penalty derived from unrest + treasury + readiness deficit, capped at 30 points
  const totalPressure = constraints.unrestRisk + constraints.treasuryStress + constraints.readinessDeficit;
  const constraintPenalty = Math.min(30, totalPressure * 0.1);

  // 2. Loop and score each goal
  goalStack.activeGoals.forEach((goal) => {
    // 2a. Calculate identityFitWeight (0.5 to 2.0 range)
    let identityFitWeight = 1.0;
    const goalClass = goal.goalClass;

    switch (goalClass) {
      case 'REGIONAL_DOMINANCE':
      case 'BORDER_EXPANSION':
        identityFitWeight = 0.5 + (identity.regional.expansionistDesire / 50);
        break;

      case 'ADVERSARY_WEAKENING':
      case 'PROXY_ESCALATION':
      case 'COVERT_PREPARATION':
        identityFitWeight = 0.5 + Math.max(
          identity.ideology.revolutionaryRevisionist,
          identity.security.covertPropensity
        ) / 50;
        break;

      case 'SANCTIONS_RELIEF':
      case 'ECONOMIC_RECOVERY':
        identityFitWeight = 0.5 + Math.max(
          identity.economy.sanctionsResilience,
          identity.economy.exportDependencyPct
        ) / 50;
        break;

      case 'REGIME_STABILIZATION':
      case 'INTERNAL_CONSOLIDATION':
      case 'SURVIVAL':
        identityFitWeight = 0.5 + (identity.volatility.regimeSustenanceUrgency / 50);
        break;

      case 'DETERRENCE':
      case 'MILITARY_BUILDUP':
      case 'TERRITORIAL_DEFENSE':
        identityFitWeight = 0.5 + (identity.security.forcePostureOffensive / 50);
        break;

      case 'PRESTIGE':
      case 'SOFT_POWER_ACCUMULATION':
        identityFitWeight = 0.5 + (identity.regional.blocLeadershipInterest / 50);
        break;

      case 'ALLIANCE_PRESERVATION':
        identityFitWeight = 0.5 + (identity.security.allianceCommitment / 50);
        break;

      case 'TECHNOLOGICAL_CATCH_UP':
        identityFitWeight = 0.5 + (100 - identity.economy.stateControlPct) / 100 + 0.5;
        break;

      case 'INFORMATION_SATURATION':
        identityFitWeight = 0.5 + (identity.regional.mediationDisposition / 50);
        break;

      default:
        identityFitWeight = 1.0;
        break;
    }

    identityFitWeight = Math.max(0.5, Math.min(2.0, identityFitWeight));

    // 2b. Calculate threatMultiplier (1.0 to 2.0 range)
    let threatMultiplier = 1.0;
    if (goal.targetCountryId) {
      const relevantThreats = threatMemory.filter(tm => tm.targetCountryId === goal.targetCountryId);
      if (relevantThreats.length > 0) {
        const sumSeverity = relevantThreats.reduce((sum, tm) => sum + tm.severityScore, 0);
        threatMultiplier = 1.0 + Math.min(1.0, sumSeverity / 150);
      }
    }

    // 2c. Calculate opportunityBonus
    let opportunityBonus = 0;
    if (goal.targetCountryId) {
      // +15 check
      if (perception.distractionTargets[goal.targetCountryId]) {
        opportunityBonus += 15;
      }
      // +10 check
      const opp = opportunities.find(o => o.targetCountryId === goal.targetCountryId);
      if (opp && opp.militaryVulnerability > 60) {
        opportunityBonus += 10;
      }
    }

    // 2d. Compute Final Score
    // finalScore = basePriority × identityFitWeight × threatMultiplier + opportunityBonus - constraintPenalty
    const basePriority = goal.priorityScore;
    const finalScore = Math.max(0, Math.min(100, Math.round(
      (basePriority * identityFitWeight * threatMultiplier) + opportunityBonus - constraintPenalty
    )));

    rankedRecords.push({
      goalId: goal.id,
      basePriority,
      threatMultiplier,
      opportunityBonus,
      identityFitWeight,
      finalScore
    });
  });

  // Sort active goals in sovereign's stack by score
  goalStack.activeGoals.sort((a, b) => {
    const scoreA = rankedRecords.find(r => r.goalId === a.id)?.finalScore ?? 0;
    const scoreB = rankedRecords.find(r => r.goalId === b.id)?.finalScore ?? 0;
    return scoreB - scoreA;
  });

  // Return the priority records and select top sorted active goal
  const selectedGoal = goalStack.activeGoals[0];

  return {
    rankedRecords,
    selectedGoal
  };
}
