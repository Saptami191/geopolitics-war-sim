import {
  DiplomaticIncident,
  DiplomaticIncidentType,
  DiplomaticIncidentSeverity,
  IncidentResponse
} from '../types';

/**
 * Probabilistically generates a diplomatic incident based on active military/clandestine operations.
 */
export function generateDiplomaticIncident(
  playerNationId: string,
  opponentNationId: string,
  defconLevel: number,
  activeIndicators: Record<string, boolean>,
  tick: number
): DiplomaticIncident | null {
  // Check conditions
  let type: DiplomaticIncidentType | null = null;
  const num = Math.random() * 100;

  if (activeIndicators['hasSigintActive'] && num < 8) {
    type = 'SPY_PLANE_INTERCEPT';
  } else if (activeIndicators['hasNavalDeployed'] && num < 5) {
    type = 'NAVAL_STANDOFF';
  } else if (activeIndicators['hasAptOpsActive'] && num < 10) {
    type = 'CYBER_ATTRIBUTION_DISPUTE';
  } else if (activeIndicators['hasConventionalOpsActive'] && num < 4) {
    type = 'TERRITORIAL_INTRUSION';
  } else if (activeIndicators['hasTargetedOpsCompleted'] && num < 3) {
    type = 'ASSASSINATION_ALLEGATION';
  } else if (activeIndicators['hasFinintActive'] && num < 6) {
    type = 'ECONOMIC_ESPIONAGE_EXPOSURE';
  } else if (activeIndicators['hasPsyopActive'] && num < 7) {
    type = 'PROPAGANDA_REVELATION';
  } else if (activeIndicators['hasTreatyViolations'] && num < 5) {
    type = 'TREATY_BREACH_ALLEGATION';
  } else if (num < 2) {
    type = 'DEFECTION_EVENT';
  }

  if (!type) return null;

  // Determine severity based on DEFCON levels
  let severity: DiplomaticIncidentSeverity = 'MINOR';
  const sevRoll = Math.random() * 100;

  if (defconLevel >= 4) {
    // Mostly MINOR
    if (sevRoll < 70) severity = 'MINOR';
    else if (sevRoll < 95) severity = 'SERIOUS';
    else severity = 'GRAVE';
  } else if (defconLevel >= 2) {
    // Mostly SERIOUS/GRAVE
    if (sevRoll < 40) severity = 'SERIOUS';
    else if (sevRoll < 80) severity = 'GRAVE';
    else severity = 'MINOR';
  } else {
    // DEFCON 1 is CRITICAL
    if (sevRoll < 50) severity = 'CRITICAL';
    else if (sevRoll < 90) severity = 'GRAVE';
    else severity = 'SERIOUS';
  }

  // Pre-calculate relationship damage
  let relationshipDamage = 10;
  if (severity === 'SERIOUS') relationshipDamage = 25;
  if (severity === 'GRAVE') relationshipDamage = 45;
  if (severity === 'CRITICAL') relationshipDamage = 70;

  let escalationRisk = 10;
  if (severity === 'SERIOUS') escalationRisk = 25;
  if (severity === 'GRAVE') escalationRisk = 55;
  if (severity === 'CRITICAL') escalationRisk = 85;

  const typeDesc = type.replace(/_/g, ' ');

  return {
    id: `inc_${playerNationId}_${opponentNationId}_${type}_${tick}`,
    type,
    severity,
    initiatorNationId: playerNationId,
    affectedNationId: opponentNationId,
    occurredAtTick: tick,
    isPublic: Math.random() < 0.4,
    playerAwareness: true,
    chosenResponse: null,
    responseDeadlineTick: tick + 3,
    consequenceApplied: false,
    relationshipDamage,
    escalationRisk,
    narrativeDescription: `[FLASH] Urgent diplomatic friction reports a ${severity} ${typeDesc} incident between ${playerNationId} and ${opponentNationId} at tick ${tick}.`
  };
}

/**
 * Evaluates the results of responding to a diplomatic incident.
 */
export function computeIncidentResponseConsequence(
  incident: DiplomaticIncident,
  chosenResponse: IncidentResponse,
  hasAdversaryProof: boolean = false,
  hasPlayerProof: boolean = false
): {
  relationshipDelta: number;
  escalationRiskDelta: number;
  escalationTriggered: boolean;
  capitalCost: number;
  narrative: string;
} {
  let relationshipDelta = 0;
  let escalationRiskDelta = 0;
  let escalationTriggered = false;
  let capitalCost = 0;
  let narrative = '';

  const initN = incident.initiatorNationId;
  const affN = incident.affectedNationId;
  const dmg = incident.relationshipDamage;

  switch (chosenResponse) {
    case 'DENY_AND_DEFLECT':
      relationshipDelta = -(incident.severity === 'CRITICAL' ? 20 : 5);
      escalationRiskDelta = -15; // De-escalation by ignoring
      if (hasAdversaryProof) {
        relationshipDelta -= 15;
        escalationRiskDelta += 30;
        narrative = `[INCIDENT] ${initN} tries to deny the incident. However, ${affN} presents intercept logs completely exposing the lie (-${Math.abs(relationshipDelta)} Relation, +30 War Risk).`;
      } else {
        narrative = `[INCIDENT] ${initN} successfully deflects media attention, casting doubt on the allegations.`;
      }
      break;

    case 'ACKNOWLEDGE_AND_APOLOGIZE':
      relationshipDelta = Math.round(10 - dmg * 0.5);
      escalationRiskDelta = -30;
      capitalCost = 15;
      narrative = `[INCIDENT] ${initN} releases a formal apology and launches investigations. Situation de-escalated at severe domestic political cost (+10 Relation delta, -30 War Risk).`;
      break;

    case 'COUNTER_ACCUSE':
      relationshipDelta = -Math.round(dmg * 0.8);
      if (hasPlayerProof) {
        escalationRiskDelta = -10;
        narrative = `[INCIDENT] ${initN} counters accusation with heavy proof of ${affN}'s hostile actions (-${Math.abs(relationshipDelta)} Relation).`;
      } else {
        escalationRiskDelta = 15;
        narrative = `[INCIDENT] ${initN} blindly counter-accuses without proof, aggravating military watch command structures (+15 War Risk).`;
      }
      break;

    case 'DEMAND_INQUIRY':
      relationshipDelta = -5;
      escalationRiskDelta = -20;
      narrative = `[INCIDENT] ${initN} demands neutral bilateral inspection board, stalling immediate military reaction channels.`;
      break;

    case 'INVOKE_TREATY_ARBITRATION':
      relationshipDelta = 0; // frozen short-term
      escalationRiskDelta = -15;
      capitalCost = 30;
      narrative = `[INCIDENT] Treaty dispute arbitration channels activated. Diplomatic crisis mechanisms declared under supervision.`;
      // Invoking treaty arbitrations requires capital
      break;

    case 'ESCALATE_TO_UNSC':
      escalationRiskDelta = -25;
      capitalCost = 50;
      narrative = `[INCIDENT] Proposer ${initN} brings the cyber/naval issue immediately before the UN Security Council.`;
      break;

    case 'IMPOSE_IMMEDIATE_SANCTION':
      relationshipDelta = -30;
      escalationRiskDelta = 15;
      narrative = `[INCIDENT] ${initN} imposes immediate TIER 2 sanctions on target ${affN} to assert commercial retaliation.`;
      break;

    case 'ISSUE_ULTIMATUM':
      relationshipDelta = -40;
      escalationRiskDelta = 40;
      if (incident.severity !== 'CRITICAL') {
        relationshipDelta -= 25; // Seen as completely disproportionate globally
        narrative = `[ULTIMATUM] ${initN} issues disproportionate ultimatum to ${affN}. Third-party states condemn the brinkmanship (-25 Global standing).`;
      } else {
        narrative = `[ULTIMATUM] Existential alert: ${initN} issues deadline ultimatum to ${affN}. Operational conflict looms.`;
      }
      break;
  }

  // Trigger probability checking
  const finalRisk = Math.min(100, Math.max(0, incident.escalationRisk + escalationRiskDelta));
  if (finalRisk > 75 && Math.random() * 100 < 30) {
    escalationTriggered = true;
  }

  return { relationshipDelta, escalationRiskDelta, escalationTriggered, capitalCost, narrative };
}

/**
 * Handles automatic fallback consequences if player fails to select action in-time.
 */
export function processIncidentDeadlineMiss(
  incident: DiplomaticIncident,
  tick: number
): DiplomaticIncident {
  const expired = { ...incident };
  expired.chosenResponse = 'DENY_AND_DEFLECT';
  expired.isPublic = true;
  expired.relationshipDamage = Math.round(expired.relationshipDamage * 1.3); // compounded damage
  expired.narrativeDescription += `\n[EXPIRED] Missed reaction deadline. System defaults to DENY AND DEFLECT. Damage amplified (+30% friction).`;
  expired.consequenceApplied = true;

  return expired;
}
