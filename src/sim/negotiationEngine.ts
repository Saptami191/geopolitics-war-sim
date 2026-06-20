import {
  ActiveNegotiation,
  NegotiationPhase,
  NegotiationTactic,
  NegotiationOutcomeType,
  NegotiationIssue,
  Econ_NationProfile
} from '../types';

/**
 * Initializes a new negotiation regime.
 * @param playerNationId Player political body
 * @param counterpartNationId AI state counterpart
 * @param issues Negotiation issues being tabled
 * @param tactic Player's opening tactic group
 * @param isBackChannel Boolean indicating backcheck clearance
 * @param deadlineTick Max duration boundary
 * @param tick Global clock tick
 * @param counterpartResistance Proximity indicator for AI resistance (sanctionResistanceScore, default 50)
 */
export function initNegotiation(
  playerNationId: string,
  counterpartNationId: string,
  issues: NegotiationIssue[],
  tactic: NegotiationTactic,
  isBackChannel: boolean,
  deadlineTick: number | null,
  tick: number,
  counterpartResistance: number = 50
): ActiveNegotiation {
  // Counterpart tactic by resistance proxy
  let counterpartTactic: NegotiationTactic = 'SALAMI_SLICING';
  if (counterpartResistance > 65) {
    counterpartTactic = 'BRINKMANSHIP';
  } else if (counterpartResistance < 35) {
    counterpartTactic = 'GOOD_FAITH_OVERTURE';
  }

  return {
    id: `neg_${playerNationId}_${counterpartNationId}_${tick}`,
    playerNationId,
    counterpartNationId,
    phase: 'OPENING_POSITIONS',
    activeTactic: tactic,
    counterpartTactic,
    issues: issues.map(iss => ({ ...iss })),
    roundsCompleted: 0,
    startedAtTick: tick,
    deadlineTick,
    isBackChannel,
    isSecretProtocolEnabled: isBackChannel,
    agreedIssues: [],
    wavesCount: 0,
    rawMomentumAccumulator: 0,
    bilateralTrustScore: 50,
    leakRisk: isBackChannel ? 15 : 5,
    counterpartTrustScore: 50,
    momentumScore: 0,
    lastTacticAppliedTick: tick,
    narrativeLog: [`[TALKS OPENED] Bilateral channel opened between ${playerNationId} and ${counterpartNationId} at tick ${tick}.`],
    outcomeType: null,
    concludedAtTick: null,
    secretProtocolClauses: []
  };
}

/**
 * Evaluates the counterpart response metrics per round.
 */
export function applyTacticCounterpartResponse(
  negotiation: ActiveNegotiation,
  tick: number
): { momentumDelta: number; trustDelta: number; counterNarrative: string } {
  const playerT = negotiation.activeTactic;
  const aiT = negotiation.counterpartTactic;
  const pId = negotiation.playerNationId;
  const cId = negotiation.counterpartNationId;

  // Double Brinkmanship spiral
  if (playerT === 'BRINKMANSHIP' && aiT === 'BRINKMANSHIP') {
    return {
      momentumDelta: -10,
      trustDelta: -15,
      counterNarrative: `[BRINKMANSHIP CLASH] Both ${pId} and ${cId} play extreme game of chicken. Core diplomatic lines freezing.`
    };
  }

  // Multilateral pressure vs Back channel
  if (playerT === 'MULTILATERAL_PRESSURE' && aiT === 'BACK_CHANNEL_ONLY') {
    return {
      momentumDelta: -5,
      trustDelta: -20,
      counterNarrative: `[TRUST BREACH] ${cId} discovers that ${pId} is organizing multilateral leverage coalitions despite back-channel vows.`
    };
  }

  // Concession package vs Salami slicing
  if (playerT === 'CONCESSION_PACKAGE' && aiT === 'SALAMI_SLICING') {
    return {
      momentumDelta: 3,
      trustDelta: 5,
      counterNarrative: `[SALAMI VORACITY] ${cId} pockets the concession and immediately leverages it to slicing incremental demands.`
    };
  }

  // Mirror default matching (60% efficiency)
  let momentumDelta = 0;
  let trustDelta = 0;
  let counterNarrative = '';

  switch (aiT) {
    case 'GOOD_FAITH_OVERTURE':
      momentumDelta = 4.8;
      trustDelta = 3;
      counterNarrative = `[AI RESPONSE] ${cId} matches posture with professional diplomatic courtesy.`;
      break;
    case 'BRINKMANSHIP':
      momentumDelta = negotiation.counterpartTrustScore > 50 ? 9 : -12;
      trustDelta = -5;
      counterNarrative = `[AI RESPONSE] ${cId} issues aggressive redlines to pressure negotiators.`;
      break;
    case 'SALAMI_SLICING':
      momentumDelta = 3;
      trustDelta = -2;
      counterNarrative = `[AI RESPONSE] ${cId} introduces micro-adjustments aimed at carving out tactical gains.`;
      break;
    case 'LINKAGE':
      momentumDelta = 6;
      trustDelta = 0;
      counterNarrative = `[AI RESPONSE] ${cId} tries to bind current items to external geopolitical conditions.`;
      break;
    case 'FAIT_ACCOMPLI':
      momentumDelta = 18;
      trustDelta = -12;
      counterNarrative = `[AI RESPONSE] ${cId} takes direct territorial/financial step, forcing negotiators to adapt.`;
      break;
    case 'BACK_CHANNEL_ONLY':
      momentumDelta = 3.6;
      trustDelta = 3;
      counterNarrative = `[AI RESPONSE] ${cId} stresses total confidentiality in operational communications.`;
      break;
    case 'MULTILATERAL_PRESSURE':
      momentumDelta = 7.2;
      trustDelta = -5;
      counterNarrative = `[AI RESPONSE] ${cId} releases hostile statements via sovereign regional allies.`;
      break;
    case 'TIME_PRESSURE':
      momentumDelta = 12;
      trustDelta = -2;
      counterNarrative = `[AI RESPONSE] ${cId} demands accelerated drafts before next review cycle.`;
      break;
    case 'CONCESSION_PACKAGE':
      momentumDelta = 9;
      trustDelta = 6;
      counterNarrative = `[AI RESPONSE] ${cId} tables corresponding concession to keep the momentum active.`;
      break;
    case 'CONSTRUCTIVE_AMBIGUITY':
      momentumDelta = 4.8;
      trustDelta = 0;
      counterNarrative = `[AI RESPONSE] ${cId} accepts vague wording to clear path to drafting.`;
      break;
  }

  return { momentumDelta, trustDelta, counterNarrative };
}

/**
 * Computes leakage check per-tick.
 */
export function computeLeakEvent(
  negotiation: ActiveNegotiation,
  tick: number
): { leaked: boolean; narrative: string } {
  const rolled = Math.random() * 100 < negotiation.leakRisk;
  if (rolled) {
    const wasBack = negotiation.isBackChannel;
    negotiation.isBackChannel = false;
    negotiation.leakRisk = 5; // Reset back to baseline open state
    const narrative = wasBack
      ? `[CLASSIFIED LEAK] Highly sensitive back-channel talks between ${negotiation.playerNationId} and ${negotiation.counterpartNationId} exposed via intercept.`
      : `[TALKS DECLASSIFIED] Transcripts of open negotiations leaked to regional outlets.`;
    return { leaked: true, narrative };
  }
  return { leaked: false, narrative: '' };
}

/**
 * Calculates current stalement risk.
 */
export function computeNegotiationBreakdownRisk(
  negotiation: ActiveNegotiation,
  tick: number
): number {
  let base = Math.max(0, -negotiation.momentumScore) * 0.5;
  if (negotiation.phase === 'DEADLOCKED') {
    base += 20;
  }
  if (negotiation.deadlineTick !== null && tick > negotiation.deadlineTick) {
    base += 30;
  }
  if (negotiation.counterpartTrustScore < 20) {
    base += 15;
  }
  return Math.min(100, Math.max(0, base));
}

/**
 * Executes a single round of negotiation, updating positions and momentum.
 */
export function processNegotiationRound(
  negotiation: ActiveNegotiation,
  playerTactic: NegotiationTactic,
  econNations: Record<string, Econ_NationProfile>,
  tick: number,
  hasMultilateralCapital: boolean = true
): ActiveNegotiation {
  const nextNeg = { ...negotiation };
  nextNeg.activeTactic = playerTactic;
  nextNeg.roundsCompleted++;
  nextNeg.lastTacticAppliedTick = tick;

  let momentumDelta = 0;
  let trustDelta = 0;
  let customNarrative = '';

  // 1. Evaluate player tactic
  switch (playerTactic) {
    case 'GOOD_FAITH_OVERTURE':
      momentumDelta += 8;
      trustDelta += 5;
      nextNeg.leakRisk = Math.max(1, nextNeg.leakRisk - 3);
      customNarrative = `[TACTIC] Player initiates GOOD FAITH OVERTURE, strengthening trust foundations (+5 Trust).`;
      break;

    case 'BRINKMANSHIP':
      if (nextNeg.counterpartTrustScore > 50) {
        momentumDelta += 15;
        customNarrative = `[TACTIC] Player forces game of BRINKMANSHIP. Counterpart compromises under raw leverage (+15 Momentum).`;
      } else {
        momentumDelta -= 20;
        customNarrative = `[TACTIC] Player BRINKMANSHIP backfires! Lack of mutual trust causes negotiation standoff (-20 Momentum).`;
      }
      nextNeg.leakRisk += 8;
      break;

    case 'SALAMI_SLICING':
      if (nextNeg.roundsCompleted <= 3) {
        momentumDelta += 5;
        customNarrative = `[TACTIC] Player applies SALAMI SLICING, masking comprehensive objectives with incremental moves.`;
      } else {
        momentumDelta -= 10;
        customNarrative = `[TACTIC] Counterpart detects SALAMI SLICING tactic, stiffening positions against further demands.`;
      }
      break;

    case 'LINKAGE':
      // Look for any issue targeting linkage
      const hasLinkedIssueResolved = nextNeg.issues.some(iss => iss.linkageTargetId !== null && iss.isResolved);
      if (hasLinkedIssueResolved) {
        momentumDelta += 10;
        customNarrative = `[TACTIC] Player utilizes LINKAGE, resolving secondary items tied to resolved clauses (+10 Momentum).`;
      } else {
        momentumDelta -= 5;
        customNarrative = `[TACTIC] Player attempts LINKAGE but unlinked conditions stall negotiations.`;
      }
      break;

    case 'FAIT_ACCOMPLI':
      momentumDelta += 30;
      trustDelta -= 20;
      nextNeg.leakRisk += 20;
      customNarrative = `[TACTIC] Player springs FAIT ACCOMPLI, presenting finished steps that force negotiation adjustment (+30 Momentum, -20 Trust).`;
      break;

    case 'BACK_CHANNEL_ONLY':
      momentumDelta += 6;
      nextNeg.leakRisk = Math.max(1, nextNeg.leakRisk - 10);
      customNarrative = `[TACTIC] Player shifts strictly to BACK CHANNEL ONLY, silencing media interference.`;
      break;

    case 'MULTILATERAL_PRESSURE':
      if (hasMultilateralCapital) {
        momentumDelta += 12;
        customNarrative = `[TACTIC] Sovereign pressure generated via multilateral diplomatic assets (+12 Momentum).`;
      } else {
        momentumDelta -= 5;
        customNarrative = `[TACTIC] Attempted multi-axis pressure fails due to insufficient geopolitical capital.`;
      }
      break;

    case 'TIME_PRESSURE':
      momentumDelta += 20;
      customNarrative = `[TACTIC] Strict timeline pressure applied to speed up counterpart reactions (+20 Momentum).`;
      if (nextNeg.deadlineTick !== null && nextNeg.deadlineTick - tick < 3) {
        if (Math.random() < 0.5) {
          nextNeg.phase = 'COLLAPSED';
          nextNeg.narrativeLog.push(`[FAILURE] Counterpart breaks off talks under extreme deadline compression!`);
          nextNeg.outcomeType = 'NO_AGREEMENT';
          return nextNeg;
        }
      }
      break;

    case 'CONCESSION_PACKAGE':
      const sacrificeable = nextNeg.issues.find(iss => iss.isSacrificeable && !iss.isResolved);
      if (sacrificeable) {
        sacrificeable.isResolved = true;
        sacrificeable.playerPosition = 0; // complete concession
        momentumDelta += 15;
        customNarrative = `[TACTIC] Player sacrifices ${sacrificeable.label} issue to unlock broader package negotiations (+15 Momentum).`;
      } else {
        momentumDelta += 5;
        customNarrative = `[TACTIC] Concession package offered but no remaining leverage assets found to sacrifice.`;
      }
      break;

    case 'CONSTRUCTIVE_AMBIGUITY':
      momentumDelta += 8;
      nextNeg.leakRisk += 5;
      nextNeg.secretProtocolClauses.push(`Ambiguity Clause: Parties recognize differing local interpretations on operational sovereignty at tick ${tick}.`);
      customNarrative = `[TACTIC] Constructive ambiguity integrated into draft texts to bypass immediate structural friction.`;
      break;
  }

  nextNeg.narrativeLog.push(customNarrative);

  // 2. Evaluate counterpart feedback action
  const response = applyTacticCounterpartResponse(nextNeg, tick);
  momentumDelta += response.momentumDelta;
  trustDelta += response.trustDelta;
  nextNeg.narrativeLog.push(response.counterNarrative);

  // Apply totals
  nextNeg.momentumScore = Math.min(100, Math.max(-100, nextNeg.momentumScore + momentumDelta));
  nextNeg.counterpartTrustScore = Math.min(100, Math.max(0, nextNeg.counterpartTrustScore + trustDelta));

  // If Player conceded an issue in CONCESSION_PACKAGE, let's adjust counterpart position and landing zone
  if (playerTactic === 'CONCESSION_PACKAGE' && nextNeg.counterpartTactic === 'SALAMI_SLICING') {
    nextNeg.issues.forEach(iss => {
      if (!iss.isResolved) {
        iss.counterpartPosition = Math.min(100, iss.counterpartPosition + 5); // demand more
      }
    });
  }

  // Adjust issues proximity toward midway
  nextNeg.issues.forEach(iss => {
    if (!iss.isResolved) {
      const midpoint = Math.round((iss.playerPosition + iss.counterpartPosition) / 2);
      // Moves current landing zone 10% closer to midpoint
      const diff = midpoint - iss.currentLandingZone;
      iss.currentLandingZone += Math.round(diff * 0.15);
      if (Math.abs(iss.playerPosition - iss.counterpartPosition) < 10) {
        iss.isResolved = true;
        iss.currentLandingZone = midpoint;
      }
    }
  });

  // 3. Evaluate Phase Progression
  if (nextNeg.momentumScore < -50) {
    nextNeg.phase = 'COLLAPSED';
    nextNeg.outcomeType = 'NO_AGREEMENT';
    nextNeg.narrativeLog.push(`[COLLAPSED] Negotiations collapsed due to severe lack of momentum or bad-faith friction.`);
  } else if (nextNeg.issues.every(iss => iss.isResolved)) {
    nextNeg.phase = 'CONCLUDED';
  } else if (nextNeg.momentumScore > 80 && nextNeg.roundsCompleted >= 3) {
    nextNeg.phase = 'FINAL_DRAFTING';
  }

  if (nextNeg.phase === 'FINAL_DRAFTING' && nextNeg.momentumScore > 80) {
    // 40% chance of wrapping up or direct progress
    nextNeg.phase = 'CONCLUDED';
  }

  if (nextNeg.roundsCompleted >= 10 && nextNeg.phase !== 'CONCLUDED' && nextNeg.phase !== 'COLLAPSED') {
    nextNeg.phase = 'DEADLOCKED';
    nextNeg.narrativeLog.push(`[DEADLOCKED] Negotiation draft stalls. Exhausted round cycles without complete resolution.`);
  }

  return nextNeg;
}

/**
 * Concludes negotiations and outcomes.
 */
export function resolveNegotiation(
  negotiation: ActiveNegotiation,
  tick: number
): {
  outcomeType: NegotiationOutcomeType;
  treatyTerms: NegotiationIssue[];
  secretClauses: string[];
  narrative: string;
} {
  let outcomeType: NegotiationOutcomeType = 'NO_AGREEMENT';
  let narrative = '';

  if (negotiation.isBackChannel && negotiation.isSecretProtocolEnabled) {
    outcomeType = 'SECRET_PROTOCOL_ONLY';
    narrative = `[SECRET COMPACT] ${negotiation.playerNationId} and ${negotiation.counterpartNationId} complete classified protocol without public disclosure.`;
  } else if (negotiation.momentumScore > 90) {
    outcomeType = 'TREATY_SIGNED';
    narrative = `[TREATY SIGNED] Formal strategic agreement signed between ${negotiation.playerNationId} and ${negotiation.counterpartNationId}.`;
  } else if (negotiation.momentumScore > 70) {
    outcomeType = 'FRAMEWORK_AGREEMENT';
    narrative = `[FRAMEWORK AGREEMENT] Binding framework established, aligning forward interests.`;
  } else if (negotiation.momentumScore > 50) {
    outcomeType = 'MEMORANDUM_OF_UNDERSTANDING';
    narrative = `[MOU SIGNED] Non-binding memorandum signed, clarifying mutual operational tolerances.`;
  } else if (negotiation.momentumScore > 30) {
    outcomeType = 'JOINT_COMMUNIQUE';
    narrative = `[JOINT COMMUNIQUE] Press statement released on shared bilateral concerns.`;
  } else {
    outcomeType = 'NO_AGREEMENT';
    narrative = `[NO AGREEMENT] Bilateral dialogue ends with impasse.`;
  }

  return {
    outcomeType,
    treatyTerms: negotiation.issues.filter(iss => iss.isResolved),
    secretClauses: [...negotiation.secretProtocolClauses],
    narrative
  };
}
