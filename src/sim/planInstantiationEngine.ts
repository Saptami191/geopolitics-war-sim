import {
  StrategicGoal,
  NationalIdentityVector,
  StrategicPlan,
  PlanStep,
  SovereignRiskTolerance,
  SecurityDoctrineTendency
} from '../types';
import { PLAN_TEMPLATE_LIBRARY, PlanTemplateDefinition } from './planTemplateLibrary';
import { generateStrategicPlan } from '../store/sovereignStore'; // Part 1 fallback

/**
 * Derives a categorical SovereignRiskTolerance from numerical escalationThreshold.
 * 
 * @param escalationThreshold number score (0-100)
 * @returns SovereignRiskTolerance
 */
export function getDerivedRiskTolerance(escalationThreshold: number): SovereignRiskTolerance {
  if (escalationThreshold < 30) return 'RECKLESS';
  if (escalationThreshold < 45) return 'AGGRESSIVE';
  if (escalationThreshold < 65) return 'CALCULATED';
  if (escalationThreshold < 80) return 'CAUTIOUS';
  return 'RISK_AVERSE';
}

/**
 * Selects the best template matched by goal and identity characteristics and instantiates a StrategicPlan.
 * 
 * @param goal The selected active StrategicGoal
 * @param identity The agent's NationalIdentityVector
 * @param templates Custom plan templates (defaults to PLAN_TEMPLATE_LIBRARY)
 * @param worldTick Current game world tick count
 * @returns StrategicPlan
 */
export function instantiatePlan(
  goal: StrategicGoal,
  identity: NationalIdentityVector,
  templates: PlanTemplateDefinition[] = PLAN_TEMPLATE_LIBRARY,
  worldTick: number
): StrategicPlan {
  const countryId = identity.countryId;
  const derivedRisk = getDerivedRiskTolerance(identity.security.escalationThreshold);
  const secTendency = identity.security.tendency;

  // 1. Filter templates that match the goal's goalClass
  let candidates = templates.filter((t) => t.targetGoalClasses.includes(goal.goalClass));

  // 2. Filter by security tendency if specified on template
  candidates = candidates.filter((t) => {
    if (!t.requiredSecurityTendency || t.requiredSecurityTendency.length === 0) return true;
    return t.requiredSecurityTendency.includes(secTendency);
  });

  // 3. Filter by risk tolerance if specified on template
  candidates = candidates.filter((t) => {
    if (!t.requiredRiskTolerance || t.requiredRiskTolerance.length === 0) return true;
    return t.requiredRiskTolerance.includes(derivedRisk);
  });

  // 4. If no templates found, try relaxing the tendency and risk constraints
  if (candidates.length === 0) {
    candidates = templates.filter((t) => t.targetGoalClasses.includes(goal.goalClass));
  }

  // 5. Hard fallback if still empty: call Part 1 generator
  if (candidates.length === 0) {
    return generateStrategicPlan(countryId, goal, identity, worldTick);
  }

  // 6. Score matching candidate templates to find the optimal fit
  let bestTemplate = candidates[0];
  let highestScore = -Infinity;

  candidates.forEach((temp) => {
    let score = 0;

    // Secrecy Alignment: high covertPropensity agents prefer high secrecyScore templates
    const covertPropensity = identity.security.covertPropensity;
    score += (covertPropensity / 100) * temp.secrecyScore;

    // Aggression Alignment: high forcePostureOffensive agents prefer higher escalationRisk
    const forcePosture = identity.security.forcePostureOffensive;
    const riskAffinity = 100 - identity.security.escalationThreshold; // lower threshold = higher affinity
    const avgAggression = (forcePosture + riskAffinity) / 2;
    score += (avgAggression / 100) * temp.escalationRisk;

    // Volatility Alignment: stable nations prefer low risk plans; volatile/regime endangered prefer high-payout/covert plans
    const urgency = identity.volatility.regimeSustenanceUrgency;
    if (urgency > 60) {
      score += temp.secrecyScore * 0.5; // push for secrecy
    }

    if (score > highestScore) {
      highestScore = score;
      bestTemplate = temp;
    }
  });

  // 7. Instantiate the steps
  const steps: PlanStep[] = bestTemplate.steps.map((s) => ({
    stepIndex: s.stepIndex,
    actionType: s.actionType,
    targetCountryId: goal.targetCountryId,
    description: s.description,
    durationTicks: s.durationTicks,
    executionProgressTicks: 0,
    completed: false
  }));

  // Total tick length of actual steps
  const totalStepTicks = steps.reduce((sum, s) => sum + s.durationTicks, 0);
  const planningHorizonTicks = Math.max(5, Math.min(15, totalStepTicks + 3));

  // Build abort conditions
  const abortConditions: string[] = [];
  if (identity.volatility.regimeSustenanceUrgency > 60) {
    abortConditions.push('popularUnrest > 50');
  }
  if (identity.security.escalationThreshold > 70) {
    abortConditions.push('globalDefconLevel <= 2');
  } else {
    abortConditions.push('globalDefconLevel <= 1');
  }
  abortConditions.push('popularUnrest > 75');
  abortConditions.push('treasuryStress > 85');

  // Instantiate complete StrategicPlan object
  const instantiatedPlan: StrategicPlan = {
    id: `plan_${countryId}_${bestTemplate.templateId}_${worldTick}`,
    countryId,
    parentGoalIds: [goal.id],
    title: bestTemplate.title,
    planningHorizonTicks,
    desiredEndState: goal.successCondition || 'Stabilized strategic interests.',
    steps,
    prerequisites: [],
    resourceCostB: steps.length * 1.5,
    escalationRisk: bestTemplate.escalationRisk,
    secrecyScore: bestTemplate.secrecyScore,
    abortConditions,
    successCriteria: goal.title,
    fallbackPathSteps: [
      {
        stepIndex: 1,
        actionType: bestTemplate.fallbackActionType,
        targetCountryId: goal.targetCountryId,
        description: `Execute backup emergency maneuver: ${bestTemplate.fallbackActionType} to absorb tactical disruption.`,
        durationTicks: 3,
        executionProgressTicks: 0,
        completed: false
      }
    ]
  };

  return instantiatedPlan;
}
