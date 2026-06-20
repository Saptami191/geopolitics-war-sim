import {
  SovereignAgentState,
  WorldState,
  ReplanningTriggerResult,
  ReplanningType,
  OpportunityAssessment
} from '../types';

/**
 * Evaluates whether an agent's current active plan needs to be interrupted and replanned, returning the severity and reason.
 * 
 * @param agent The current SovereignAgentState
 * @param worldDraft The current WorldState draft
 * @param defconLevel The current game DEFCON level (1 to 5)
 * @returns ReplanningTriggerResult
 */
export function evaluateReplanTrigger(
  agent: SovereignAgentState,
  worldDraft: WorldState,
  defconLevel: number
): ReplanningTriggerResult {
  const countryId = agent.identity.countryId;
  const country = worldDraft.countries[countryId];
  if (!country) {
    return { shouldReplan: false, type: 'SOFT_UPDATE', reason: '' };
  }

  const constraints = agent.constraints;
  const execution = agent.planExecution;
  const activePlan = agent.activePlan;

  // I. EMERGENCY_OVERRIDE CHECK (Highest priority)
  // Check abort conditions of current active plan
  if (activePlan && execution.isActive) {
    for (const cond of activePlan.abortConditions) {
      if (cond === 'popularUnrest > 50' && constraints.unrestRisk > 50) {
        return {
          shouldReplan: true,
          type: 'EMERGENCY_OVERRIDE',
          reason: `Abort condition met: Popular unrest is extremely elevated (${constraints.unrestRisk}%)`
        };
      }
      if (cond === 'popularUnrest > 75' && constraints.unrestRisk > 75) {
        return {
          shouldReplan: true,
          type: 'EMERGENCY_OVERRIDE',
          reason: `Abort condition met: Unrest has reached terminal state (${constraints.unrestRisk}%)`
        };
      }
      if (cond === 'treasuryStress > 70' && constraints.treasuryStress > 70) {
        return {
          shouldReplan: true,
          type: 'EMERGENCY_OVERRIDE',
          reason: `Abort condition met: National treasury stress is dangerously high (${constraints.treasuryStress}%)`
        };
      }
      if (cond === 'treasuryStress > 85' && constraints.treasuryStress > 85) {
        return {
          shouldReplan: true,
          type: 'EMERGENCY_OVERRIDE',
          reason: `Abort condition met: Treasury solvency is threatened (${constraints.treasuryStress}%)`
        };
      }
      if (cond === 'globalDefconLevel <= 2' && defconLevel <= 2) {
        return {
          shouldReplan: true,
          type: 'EMERGENCY_OVERRIDE',
          reason: `Abort condition met: World DEFCON level (${defconLevel}) forces strategic survival overrides`
        };
      }
      if (cond === 'globalDefconLevel <= 1' && defconLevel <= 1) {
        return {
          shouldReplan: true,
          type: 'EMERGENCY_OVERRIDE',
          reason: 'Abort condition met: Imminence of thermonuclear exchange forces terminal commands'
        };
      }
    }
  }

  // World DEFCON is dangerously terminal
  if (defconLevel <= 2 && activePlan?.title !== 'Heavy Nuclear Deterrence Signal' && activePlan?.title !== 'Sovereign Survival Mobilization') {
    return {
      shouldReplan: true,
      type: 'EMERGENCY_OVERRIDE',
      reason: `DEFCON level is at ${defconLevel}. Forcing immediate emergency deterrence realignment.`
    };
  }

  // Directly joined wars but currently executing a non-defensive template
  const isDirectlyAtWar = country.atWarWith.length > 0;
  const hasDefensivePlan = activePlan?.title === 'Strategic Territorial Defense Shield' || activePlan?.title === 'Sovereign Survival Mobilization';
  if (isDirectlyAtWar && !hasDefensivePlan) {
    return {
      shouldReplan: true,
      type: 'EMERGENCY_OVERRIDE',
      reason: `Direct war engagement detected (At war with: ${country.atWarWith.join(', ')}). Aborting standard protocol.`
    };
  }

  // Popular unrest exceeds extreme threshold
  if (constraints.unrestRisk > 80 && activePlan?.title !== 'Regime Survival Consolidation') {
    return {
      shouldReplan: true,
      type: 'EMERGENCY_OVERRIDE',
      reason: `Civil unrest risk has exceeded warning limit (${constraints.unrestRisk}%). Regime security threatened.`
    };
  }

  // II. HARD_INTERRUPTION CHECK
  // New threat memory with severity > 70 added during this tick
  const newAggressiveThreat = agent.threatMemory.some(
    (tm) => tm.launchTick === worldDraft.currentTick && tm.severityScore > 70
  );
  if (newAggressiveThreat) {
    return {
      shouldReplan: true,
      type: 'HARD_INTERRUPTION',
      reason: 'Sovereign intelligence registers sudden, high-intensity security threat crossing escalation thresholds.'
    };
  }

  // SanctionedBy count has experienced multiple fresh additions
  const activeSanctionsCount = country.economic.sanctionedBy.length;
  if (activeSanctionsCount >= 3 && activePlan?.title !== 'Sanctions Relief Negotiation') {
    return {
      shouldReplan: true,
      type: 'HARD_INTERRUPTION',
      reason: `Multiple trade embargoes active (${activeSanctionsCount}). Standard budget channels throttled.`
    };
  }

  // Plan horizon has run out but plan state is executing
  if (execution.isActive && execution.remainingTicks <= 0 && execution.status === 'EXECUTING') {
    return {
      shouldReplan: true,
      type: 'HARD_INTERRUPTION',
      reason: 'Active strategic planning horizon expired.'
    };
  }

  // III. MEDIUM_INTERRUPTION CHECK
  // Top opportunity score is extremely promising (> 70) and plan is not using it
  const highScoreOpp = agent.opportunities.find(o => o.score > 70);
  if (highScoreOpp && execution.currentStepIndex === 0) {
    return {
      shouldReplan: true,
      type: 'MEDIUM_INTERRUPTION',
      reason: `Emergent high-yield strategic exploit window appears targeting ${highScoreOpp.targetCountryId} (${highScoreOpp.score} points).`
    };
  }

  // Stuck plan check: Step was active for too long with zero completion
  const currentStep = activePlan && execution.currentStepIndex < activePlan.steps.length
    ? activePlan.steps[execution.currentStepIndex]
    : null;
  if (currentStep && currentStep.executionProgressTicks > currentStep.durationTicks + 5) {
    return {
      shouldReplan: true,
      type: 'MEDIUM_INTERRUPTION',
      reason: 'Active plan progression stalled due to structural administrative friction.'
    };
  }

  // IV. SOFT_UPDATE CHECK
  // Top priority goal in stack does not match currently active plan's parentGoal
  const topGoal = agent.goalStack.activeGoals[0];
  if (topGoal && activePlan && !activePlan.parentGoalIds.includes(topGoal.id)) {
    // Check if the priority gap is meaningful (> 15 points)
    const activeGoalRecord = agent.goalStack.priorityRecords.find(r => activePlan.parentGoalIds.includes(r.goalId));
    const topGoalRecord = agent.goalStack.priorityRecords.find(r => r.goalId === topGoal.id);
    const scoreDiff = (topGoalRecord?.finalScore || 0) - (activeGoalRecord?.finalScore || 0);

    if (scoreDiff > 20) {
      return {
        shouldReplan: true,
        type: 'SOFT_UPDATE',
        reason: `New high-priority goal (${topGoal.goalClass}) has superseded old target by substantial margin (+${Math.round(scoreDiff)} points)`
      };
    }
  }

  return {
    shouldReplan: false,
    type: 'SOFT_UPDATE',
    reason: ''
  };
}
