import {
  SovereignAgentState,
  WorldState,
  SovereignInstrument,
  EscalationDecision
} from '../types';

/**
 * Pure function evaluating physical and strategic escalation parameters for a sovereign agent.
 * 
 * @param agent The current SovereignAgentState
 * @param worldDraft The current WorldState draft
 * @param defconLevel Current world DEFCON level (1 to 5)
 * @returns EscalationDecision
 */
export function evaluateEscalation(
  agent: SovereignAgentState,
  worldDraft: WorldState,
  defconLevel: number
): EscalationDecision {
  const countryId = agent.identity.countryId;
  const identity = agent.identity;
  const constraints = agent.constraints;

  let shouldEscalate = false;
  let shouldDeEscalate = false;
  let escalationInstrument: SovereignInstrument | undefined = undefined;
  let deEscalationInstrument: SovereignInstrument | undefined = undefined;
  let rationale = '';

  // Get max threat memory score
  let topThreatScore = 0;
  if (agent.threatMemory && agent.threatMemory.length > 0) {
    topThreatScore = Math.max(...agent.threatMemory.map(tm => tm.severityScore));
  }

  // Active step evaluation
  const activePlan = agent.activePlan;
  const currentStepIndex = agent.planExecution.currentStepIndex;
  const activeStep = activePlan && currentStepIndex < activePlan.steps.length 
    ? activePlan.steps[currentStepIndex] 
    : null;

  // I. SHOULD ESCALATE evaluate
  // top threat score > 70 AND escalationThreshold < 40 AND step is active TEST_RED_LINES or SHIFT_MILITARY_POSTURE AND treasuryStress < 50
  const threshold = identity.security.escalationThreshold;
  const stepIsEscalatory = activeStep && (activeStep.actionType === 'TEST_RED_LINES' || activeStep.actionType === 'SHIFT_MILITARY_POSTURE');
  const treasuryStress = constraints?.treasuryStress ?? 0;

  if (topThreatScore > 70 && threshold < 40 && stepIsEscalatory && treasuryStress < 50) {
    shouldEscalate = true;

    // Pick escalation instrument based on security doctrine tendency
    const doctrine = identity.security.tendency;
    if (doctrine === 'ESCALATION_DOMINANCE' && defconLevel <= 3) {
      escalationInstrument = 'NUCLEAR_SIGNALLING';
    } else if (doctrine === 'PROXY_COMPETITION' || doctrine === 'STRATEGIC_AMBIGUITY') {
      escalationInstrument = 'PROXY_FORCE';
    } else {
      escalationInstrument = 'MILITARY_BUILDUP';
    }
  }

  // II. SHOULD DE-ESCALATE evaluate
  // INTERRUPTION_HISTORY had EMERGENCY_OVERRIDE in last 3 ticks OR treasuryStress > 70 OR world DEFCON <= 2
  let hasRecentEmergencyOverride = false;
  if (agent.interruptionHistory) {
    hasRecentEmergencyOverride = agent.interruptionHistory.some(
      (record) => record.actionTaken === 'EMERGENCY_OVERRIDE' && (worldDraft.currentTick - record.tick <= 3)
    );
  }

  if (hasRecentEmergencyOverride || treasuryStress > 70 || defconLevel <= 2) {
    // Only deescalate if we aren't at extreme risk forcing desperate survival
    shouldDeEscalate = true;
    shouldEscalate = false; // de-escalation supersedes escalation

    const volatility = identity.volatility.tendency;
    if (volatility === 'CRISIS_OVERREACTION' && defconLevel <= 2) {
      deEscalationInstrument = 'TRADE_DEAL';
    } else {
      deEscalationInstrument = 'DIPLOMATIC_PRESSURE';
    }
  }

  // III. Generate descriptive narrative rationale
  if (shouldEscalate) {
    rationale = `Escalation triggered: Threat memory index (${topThreatScore}) exceeds acceptable ceiling while structural capability remains high. Unleashing ${escalationInstrument}.`;
  } else if (shouldDeEscalate) {
    if (defconLevel <= 2) {
      rationale = `Strategic de-escalation triggered: World DEFCON level (${defconLevel}) has degraded to terminal proximity. Forcing structural safety buffer.`;
    } else if (treasuryStress > 70) {
      rationale = `Friction de-escalation triggered: Internal treasury stress (${treasuryStress}%) limits capability to absorb strategic friction. Pulling back.`;
    } else {
      rationale = 'Tactical pause triggered by rapid recent plan interruptions. Stabilizing core operational commands.';
    }
  } else {
    rationale = 'Status quo maintained. Operations proceeding inside baseline risk margins.';
  }

  return {
    shouldEscalate,
    shouldDeEscalate,
    escalationInstrument,
    deEscalationInstrument,
    rationale
  };
}
