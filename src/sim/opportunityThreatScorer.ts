import {
  SovereignAgentState,
  StrategicPerceptionState,
  OpportunityAssessment,
  ConstraintAssessment,
  WorldState,
  Country
} from '../types';

/**
 * Evaluates opportunity windows and constraints score for a sovereign agent based on the perception state and current world state.
 * 
 * @param agent The current sovereign agent state
 * @param perception The strategic perception state of the agent
 * @param worldDraft Complete current draft of the world state
 * @returns An object containing opportunities, constraints, and opportunityWindow flag
 */
export function scoreOpportunitiesAndConstraints(
  agent: SovereignAgentState,
  perception: StrategicPerceptionState,
  worldDraft: WorldState
): {
  opportunities: OpportunityAssessment[];
  constraints: ConstraintAssessment;
  opportunityWindow: boolean;
} {
  const countryId = agent.identity.countryId;
  const country = worldDraft.countries[countryId];

  // 1. Compute Constraints
  const unrestRisk = country?.political?.popularUnrest ?? 0;
  const treasuryStress = country?.economic?.debtStressIndex ?? 0;
  const readinessDeficit = 100 - (country?.arsenal?.readinessLevel ?? 80);
  const treatyObligationsCount = country?.tradePartners?.length ?? 0;
  const sanctionsPainPercent = Math.min(100, (country?.economic?.sanctionedBy?.length ?? 0) * 15);
  const recreationalSecurityBuffer = Math.max(10, 50 - (country?.political?.stabilityIndex ?? 50));

  const constraints: ConstraintAssessment = {
    unrestRisk,
    treasuryStress,
    readinessDeficit,
    treatyObligationsCount,
    sanctionsPainPercent,
    recreationalSecurityBuffer
  };

  // 2. Compute Opportunities
  const opportunities: OpportunityAssessment[] = [];

  Object.keys(perception.distractionTargets).forEach((targetId) => {
    const targetCountry = worldDraft.countries[targetId];
    if (!targetCountry) return;

    // Military Vulnerability (readiness + wars)
    const baseDeficit = 100 - (targetCountry.arsenal?.readinessLevel ?? 80);
    const warExhaustionMultiplier = targetCountry.atWarWith.length * 20;
    const militaryVulnerability = Math.max(0, Math.min(100, baseDeficit + warExhaustionMultiplier));

    // Diplomatic Isolation (mean hostile opinion of target from others)
    let totalOpinion = 0;
    let opinionCount = 0;
    Object.keys(worldDraft.countries).forEach((cId) => {
      if (cId !== targetId) {
        const otherC = worldDraft.countries[cId];
        if (otherC) {
          totalOpinion += otherC.opinions[targetId] ?? 0;
          opinionCount++;
        }
      }
    });
    const meanOpinionOfTarget = opinionCount > 0 ? totalOpinion / opinionCount : 0;
    // Lower opinion means higher isolation
    const diplomaticIsolation = Math.max(0, Math.min(100, 50 - meanOpinionOfTarget + (targetCountry.atWarWith.length * 10)));

    // Economic Sanctions Fatigue (debt stress + size of sanction lists)
    const targetStress = targetCountry.economic?.debtStressIndex ?? 0;
    const targetSanctioners = targetCountry.economic?.sanctionedBy?.length ?? 0;
    const economicSanctionsFatigue = Math.max(0, Math.min(100, targetStress + (targetSanctioners * 12)));

    // Alliance Cohesion Rank
    // Count of high-opinion countries vs hostile countries to establish a cohesion rank (0-100 where higher is weaker coalition)
    const adversariesOfTargetCount = Object.values(targetCountry.opinions).filter(v => v < -30).length;
    const alliesOfTargetCount = Object.values(targetCountry.opinions).filter(v => v > 40).length;
    const totalVoters = adversariesOfTargetCount + alliesOfTargetCount;
    const allianceCohesionRank = totalVoters > 0
      ? Math.round((adversariesOfTargetCount / totalVoters) * 100)
      : 50;

    // Compound score: weighted average of the structural vulnerabilities
    const score = Math.round(
      militaryVulnerability * 0.4 +
      diplomaticIsolation * 0.2 +
      economicSanctionsFatigue * 0.3 +
      allianceCohesionRank * 0.1
    );

    opportunities.push({
      targetCountryId: targetId,
      type: 'DISTRACTION',
      description: perception.distractionTargets[targetId],
      score: Math.max(0, Math.min(100, score)),
      militaryVulnerability,
      diplomaticIsolation,
      economicSanctionsFatigue,
      allianceCohesionRank
    });
  });

  // Sort opportunities by score descending
  opportunities.sort((a, b) => b.score - a.score);

  // 3. Compute opportunityWindow Flag
  // True when top opportunity score > 55 AND total constraints total < 120 AND no emergency override in last 5 ticks
  const topOpportunityScore = opportunities.length > 0 ? opportunities[0].score : 0;
  const totalConstraintPressure = unrestRisk + treasuryStress + readinessDeficit;

  let hasRecentEmergencyOverride = false;
  if (agent.interruptionHistory) {
    const recentRecord = agent.interruptionHistory.some(
      (record) => record.actionTaken === 'EMERGENCY_OVERRIDE' && (worldDraft.currentTick - record.tick <= 5)
    );
    hasRecentEmergencyOverride = recentRecord;
  }

  const opportunityWindow = 
    topOpportunityScore > 55 && 
    totalConstraintPressure < 120 && 
    !hasRecentEmergencyOverride;

  return {
    opportunities,
    constraints,
    opportunityWindow
  };
}
