import {
  AIDiplomaticAgenda,
  DiplomaticAgendaGoal,
  NegotiationTactic,
  Econ_NationProfile,
  Diplo_Relationship,
  ActiveNegotiation,
  DiplomaticLeverageRecord,
  Diplo_Instrument
} from '../types';

/**
 * Builds AI agenda for a nation given geopolitical vectors.
 */
export function buildAIAgenda(
  nationId: string,
  playerRelationshipScore: number,
  hasActiveSanctionAgainstIt: boolean,
  isStrongestInRegionByGdp: boolean,
  defconLevel: number,
  sanctionResistance: number = 50,
  tick: number = 0
): AIDiplomaticAgenda {
  let primaryGoal: DiplomaticAgendaGoal = 'LEGITIMIZE_OWN_POSITION';

  if (playerRelationshipScore < -50) {
    primaryGoal = 'ISOLATE_PLAYER';
  } else if (playerRelationshipScore > 60 && sanctionResistance < 40) {
    primaryGoal = 'COURT_PLAYER_AS_ALLY';
  } else if (defconLevel <= 3) {
    primaryGoal = 'SECURE_BUFFER_NATION';
  } else if (hasActiveSanctionAgainstIt) {
    primaryGoal = 'EXTRACT_CONCESSION';
  } else if (isStrongestInRegionByGdp) {
    primaryGoal = 'EXPAND_BLOC_INFLUENCE';
  }

  // Derive secondary goals from rest of priority order
  const potentialGoals: DiplomaticAgendaGoal[] = [
    'ISOLATE_PLAYER',
    'COURT_PLAYER_AS_ALLY',
    'EXPAND_BLOC_INFLUENCE',
    'UNDERMINE_PLAYER_ALLIANCE',
    'SECURE_BUFFER_NATION',
    'EXTRACT_CONCESSION',
    'DELAY_NEGOTIATION',
    'LEGITIMIZE_OWN_POSITION'
  ];

  const secondaryGoals = potentialGoals
    .filter(g => g !== primaryGoal)
    .slice(0, 2);

  // Setup tactic based on goal
  let currentTacticBeingUsed: NegotiationTactic = 'SALAMI_SLICING';
  const goalStr = primaryGoal as string;
  if (goalStr === 'ISOLATE_PLAYER') {
    currentTacticBeingUsed = 'MULTILATERAL_PRESSURE';
  } else if (goalStr === 'COURT_PLAYER_AS_ALLY') {
    currentTacticBeingUsed = 'GOOD_FAITH_OVERTURE';
  } else if (goalStr === 'EXTRACT_CONCESSION') {
    currentTacticBeingUsed = 'BRINKMANSHIP';
  } else if (goalStr === 'DELAY_NEGOTIATION') {
    currentTacticBeingUsed = 'CONSTRUCTIVE_AMBIGUITY';
  } else if (goalStr === 'EXPAND_BLOC_INFLUENCE') {
    currentTacticBeingUsed = 'LINKAGE';
  }

  const allocation = computeAICapitalAllocation(primaryGoal);

  return {
    nationId,
    primaryGoal,
    secondaryGoals,
    targetNationIds: [],
    currentTacticBeingUsed,
    capitalAllocationPct: allocation,
    recentActionsLog: [`[AGENDA ESTABLISHED] Primary objective updated to ${primaryGoal.replace(/_/g, ' ')} at tick ${tick}.`],
    successMetric: `Achievement of target posture adjustments on primary objectives.`,
    agendaUpdateTick: tick
  };
}

/**
 * Computes AI capital allocation percentage.
 */
export function computeAICapitalAllocation(goal: DiplomaticAgendaGoal): number {
  switch (goal) {
    case 'ISOLATE_PLAYER':
      return 40;
    case 'COURT_PLAYER_AS_ALLY':
      return 30;
    case 'EXPAND_BLOC_INFLUENCE':
      return 35;
    case 'DELAY_NEGOTIATION':
      return 15;
    default:
      return 20;
  }
}

/**
 * Returns dynamic tactic to apply for AI state in negotiation.
 */
export function selectAITactic(
  agenda: AIDiplomaticAgenda,
  negotiation: ActiveNegotiation,
  tick: number
): NegotiationTactic {
  const rounds = negotiation.roundsCompleted;

  switch (agenda.primaryGoal) {
    case 'ISOLATE_PLAYER':
      return 'MULTILATERAL_PRESSURE';

    case 'COURT_PLAYER_AS_ALLY':
      return rounds < 3 ? 'GOOD_FAITH_OVERTURE' : 'CONCESSION_PACKAGE';

    case 'EXTRACT_CONCESSION':
      return 'BRINKMANSHIP';

    case 'DELAY_NEGOTIATION':
      return rounds % 2 === 0 ? 'CONSTRUCTIVE_AMBIGUITY' : 'SALAMI_SLICING';

    case 'EXPAND_BLOC_INFLUENCE':
      return 'LINKAGE';

    default:
      return 'SALAMI_SLICING';
  }
}

/**
 * Overrides standard random votes in Part 1 UNSC cycles.
 */
export function computeAIUNSCVotingPosition(
  aiNationId: string,
  isPlayerProposed: boolean,
  isPlayerArmsLeverageActive: boolean,
  isTargetAlly: boolean,
  relationshipWithProposer: number,
  economicInterdependence: number,
  agenda: AIDiplomaticAgenda | undefined
): 'YES' | 'NO' | 'ABSTAIN' {
  if (isPlayerArmsLeverageActive) {
    return 'YES';
  }

  if (agenda) {
    if (agenda.primaryGoal === 'ISOLATE_PLAYER' && isPlayerProposed) {
      return 'NO';
    }
    if (isTargetAlly) {
      return 'NO'; // veto or reject resolution hitting ally
    }
    if (agenda.primaryGoal === 'LEGITIMIZE_OWN_POSITION') {
      return 'ABSTAIN';
    }
  }

  if (economicInterdependence > 70) {
    return 'YES';
  }

  if (relationshipWithProposer > 40) {
    return 'YES';
  } else if (relationshipWithProposer < -30) {
    return 'NO';
  }

  return 'ABSTAIN';
}

/**
 * Master process for executing AI active decisions per-tick.
 */
export function processAIDiplomacyTick(
  agendas: Record<string, AIDiplomaticAgenda>,
  econNations: Record<string, Econ_NationProfile>,
  relationships: Record<string, Diplo_Relationship>,
  negotiations: ActiveNegotiation[],
  leverageRecords: DiplomaticLeverageRecord[],
  playerNationId: string,
  playerAllies: string[],
  neutralNations: string[],
  defconLevel: number,
  tick: number
): {
  updatedAgendas: Record<string, AIDiplomaticAgenda>;
  newNegotiationRequests: Array<{ nationId: string; targetId: string; tactic: NegotiationTactic }>;
  deployedInstruments: Array<{ instrument: Diplo_Instrument; from: string; to: string }>;
  injectedStressors: Array<{ treatyId: string; nationIds: string[]; type: string }>;
  narrativeLog: string[];
} {
  const updatedAgendas: Record<string, AIDiplomaticAgenda> = {};
  const newNegotiationRequests: Array<{ nationId: string; targetId: string; tactic: NegotiationTactic }> = [];
  const deployedInstruments: Array<{ instrument: Diplo_Instrument; from: string; to: string }> = [];
  const injectedStressors: Array<{ treatyId: string; nationIds: string[]; type: string }> = [];
  const narrativeLog: string[] = [];

  // Sort nations to find strongest by GDP
  const sortedByGdp = Object.values(econNations).sort((a, b) => b.gdpEstimateUSD - a.gdpEstimateUSD);
  const strongestNationId = sortedByGdp[0]?.nationId || '';

  Object.keys(econNations).forEach(nid => {
    if (nid === playerNationId) return;

    const profile = econNations[nid];
    if (!profile) return;

    // Fetch relationship score
    const relKey1 = `${nid}:${playerNationId}`;
    const relKey2 = `${playerNationId}:${nid}`;
    const rel = relationships[relKey1] || relationships[relKey2];
    const relScore = rel ? rel.relationshipScore : 0;

    // Has active sanction
    const hasSanction = profile.sanctionedBy.length > 0;
    const isStrongest = nid === strongestNationId;

    // Build or update agenda
    let agenda = agendas[nid];
    if (!agenda || tick - agenda.agendaUpdateTick > 10) {
      agenda = buildAIAgenda(
        nid,
        relScore,
        hasSanction,
        isStrongest,
        defconLevel,
        profile.sanctionResistanceScore ?? 50,
        tick
      );
    } else {
      agenda = { ...agenda };
    }

    // AI logic application
    const goal = agenda.primaryGoal;

    if (goal === 'ISOLATE_PLAYER') {
      // Lobby player allies to turn away from them
      playerAllies.forEach(allyId => {
        const allyRelKey = `${nid}:${allyId}`;
        const allyRel = relationships[allyRelKey] || relationships[`${allyId}:${nid}`];
        if (allyRel && allyRel.relationshipScore < 50) {
          deployedInstruments.push({
            instrument: 'FORMAL_PROTEST',
            from: nid,
            to: allyId
          });
          narrativeLog.push(`[AI ACTION] ${nid} deploys FORMAL PROTEST against ${allyId} to fracture their coordination with player.`);
        }
      });
    }

    if (goal === 'COURT_PLAYER_AS_ALLY') {
      const activeWithPlayer = negotiations.some(
        n => (n.playerNationId === playerNationId && n.counterpartNationId === nid) &&
             (n.phase !== 'CONCLUDED' && n.phase !== 'COLLAPSED')
      );
      if (!activeWithPlayer) {
        newNegotiationRequests.push({
          nationId: nid,
          targetId: playerNationId,
          tactic: selectAITactic(agenda, { roundsCompleted: 0 } as any, tick)
        });
        narrativeLog.push(`[AI ACTION] ${nid} requests bilateral treaty negotiation panel to secure alliance lines.`);
      }
    }

    if (goal === 'EXPAND_BLOC_INFLUENCE') {
      neutralNations.forEach(neutId => {
        const neutRelKey = `${nid}:${neutId}`;
        const neutRel = relationships[neutRelKey] || relationships[`${neutId}:${nid}`];
        if (neutRel && neutRel.relationshipScore > 40) {
          deployedInstruments.push({
            instrument: 'SUMMIT_REQUEST',
            from: nid,
            to: neutId
          });
          narrativeLog.push(`[AI ACTION] ${nid} issues SUMMIT REQUEST to neutral ${neutId} to lobby for regional integration.`);
        }
      });
    }

    if (goal === 'UNDERMINE_PLAYER_ALLIANCE') {
      // Find a player defense treaty to inject friction
      injectedStressors.push({
        treatyId: 'PENTAGON_JOINT_SHIELD', // default reference
        nationIds: [nid],
        type: 'STRATEGIC_DIVERGENCE'
      });
      narrativeLog.push(`[AI LOBBYING] ${nid} initiates shadow intelligence campaign targeting allied cohesion.`);
    }

    updatedAgendas[nid] = agenda;
  });

  return {
    updatedAgendas,
    newNegotiationRequests,
    deployedInstruments,
    injectedStressors,
    narrativeLog
  };
}
