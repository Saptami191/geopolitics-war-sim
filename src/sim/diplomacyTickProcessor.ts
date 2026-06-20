import {
  Diplomacy2GameplayState,
  Diplo_Relationship,
  Treaty,
  Econ_NationProfile,
  Diplo_Instrument,
  NegotiationTactic,
  ActiveNegotiation,
  DiplomaticLeverageRecord,
  AllianceStressRecord,
  PublicDiplomacyCampaign,
  DiplomaticIncident
} from '../types';

import {
  computeLeakEvent,
  computeNegotiationBreakdownRisk
} from './negotiationEngine';

import {
  decayLeverageRecord
} from './leverageEngine';

import {
  detectAllianceStressors,
  computeStressDelta,
  evaluateStressBreakpoint,
  computeAllianceCohesionScore
} from './allianceStressEngine';

import {
  processCampaignTick,
  computeCounterNarrativeResponse,
  computeNarrativeWarfareBalance
} from './publicDiplomacyEngine';

import {
  generateDiplomaticIncident,
  computeIncidentResponseConsequence,
  processIncidentDeadlineMiss
} from './incidentManagementEngine';

import {
  processAIDiplomacyTick,
  computeAIUNSCVotingPosition
} from './aiDiplomacyEngine';

export interface DiplomacyTickResults {
  updatedState: Diplomacy2GameplayState;
  deployedInstruments: { instrument: Diplo_Instrument; from: string; to: string }[];
  negotiationRequests: { nationId: string; targetId: string; tactic: NegotiationTactic }[];
  globalEvents: { text: string; severity: 'INFO' | 'WARNING' | 'CRITICAL' }[];
  relationshipDeltas: Record<string, number>; // key: `${nationA}:${nationB}` -> delta
  withdrawnAllies: { treatyId: string; nationId: string }[];
  unscVotes: Record<string, Record<string, 'YES' | 'NO' | 'ABSTAIN'>>; // resolutionId -> { nationId -> vote }
  capitalGrant: number; // political capital generated via REPUTATION
}

/**
 * Pure master coordinator function for Diplomacy Part 2 per-tick updates.
 */
export function processDiplomacy2Tick(
  diplo2State: Diplomacy2GameplayState,
  relationships: Record<string, Diplo_Relationship>,
  treaties: Record<string, Treaty>,
  econNations: Record<string, Econ_NationProfile>,
  defconLevel: number,
  playerNationId: string,
  playerAllies: string[],
  neutralNations: string[],
  activeIndicators: Record<string, boolean>,
  currentTick: number
): DiplomacyTickResults {
  const results: DiplomacyTickResults = {
    updatedState: JSON.parse(JSON.stringify(diplo2State)), // Deep copy to keep it pure
    deployedInstruments: [],
    negotiationRequests: [],
    globalEvents: [],
    relationshipDeltas: {},
    withdrawnAllies: [],
    unscVotes: {},
    capitalGrant: 0
  };

  const draft = results.updatedState;

  // 1. AI AGENDAS & DECISIONS
  const aiResults = processAIDiplomacyTick(
    draft.aiDiplomaticAgendas,
    econNations,
    relationships,
    draft.activeNegotiations,
    draft.leverageRecords,
    playerNationId,
    playerAllies,
    neutralNations,
    defconLevel,
    currentTick
  );

  draft.aiDiplomaticAgendas = aiResults.updatedAgendas;
  results.deployedInstruments = aiResults.deployedInstruments;
  results.negotiationRequests = aiResults.newNegotiationRequests;
  aiResults.narrativeLog.forEach(log => {
    draft.negotiationEventLog.push(log);
  });

  // 2. ACTIVE NEGOTIATIONS PROCESSING
  draft.activeNegotiations.forEach(neg => {
    if (neg.phase === 'CONCLUDED' || neg.phase === 'COLLAPSED') return;

    // Check deadlines
    if (neg.deadlineTick !== null && currentTick > neg.deadlineTick) {
      neg.phase = 'COLLAPSED';
      neg.outcomeType = 'NO_AGREEMENT';
      const msg = `[TALKS COLLAPSED] Hard deadline reached for negotiations between ${neg.playerNationId} and ${neg.counterpartNationId}.`;
      draft.negotiationEventLog.push(msg);
      results.globalEvents.push({ text: msg, severity: 'CRITICAL' });
      return;
    }

    // Leak assessments
    if (neg.isBackChannel) {
      const leak = computeLeakEvent(neg, currentTick);
      if (leak.leaked) {
        draft.negotiationEventLog.push(leak.narrative);
        results.globalEvents.push({ text: leak.narrative, severity: 'WARNING' });
      }
    }

    // Breakdown evaluations
    const risk = computeNegotiationBreakdownRisk(neg, currentTick);
    if (risk > 85 && neg.phase !== 'DEADLOCKED') {
      neg.phase = 'DEADLOCKED';
      const deadlockMsg = `[TALKS STALLED] Negotiations between ${neg.playerNationId} and ${neg.counterpartNationId} are now deadlocked. Risk of total collapse is extremely high.`;
      draft.negotiationEventLog.push(deadlockMsg);
      results.globalEvents.push({ text: deadlockMsg, severity: 'WARNING' });
    }
  });

  // 3. LEVERAGE RECORDS DECAY
  draft.leverageRecords = draft.leverageRecords.map(lev => {
    const expired = decayLeverageRecord(lev, currentTick);
    if (lev.leverageType === 'REPUTATION_CAPITAL' && lev.isBeingExercised && lev.intensityScore > 10) {
      results.capitalGrant += lev.intensityScore >= 80 ? 5 : 2;
    }
    return expired;
  }).filter(lev => lev.intensityScore >= 10);

  // 4. ALLIANCE STRESS & RELIANCE EVALUATIONS
  Object.keys(treaties).forEach(treatyId => {
    const treaty = treaties[treatyId];
    if (treaty.type !== 'MUTUAL_DEFENCE' || treaty.status !== 'RATIFIED') return;

    // Extract profiles
    const signatories = treaty.partyNationIds;
    const sigProfiles = signatories.map(id => econNations[id]).filter(Boolean) as Econ_NationProfile[];

    // Detect new stressors
    const newStressors = detectAllianceStressors(
      treaty,
      sigProfiles,
      relationships,
      { activeSanctionRecords: [] } as any, // dynamic bypass or integration
      currentTick,
      activeIndicators['hasSigintActive'] && Math.random() < 0.05
    );

    newStressors.forEach(str => {
      const exists = draft.allianceStressRecords.some(
        ex => ex.allianceTreatyId === treatyId && ex.stressor === str.stressor && !ex.isResolved
      );
      if (!exists) {
        draft.allianceStressRecords.push(str);
        draft.allianceEventLog.push(str.narrativeDescription);
        results.globalEvents.push({ text: str.narrativeDescription, severity: 'WARNING' });
      }
    });
  });

  // Process existing stressors
  draft.allianceStressRecords.forEach(str => {
    if (str.isResolved) return;

    str.unaddressedTickCount++;
    const delta = computeStressDelta(str, currentTick);
    str.stressIntensity = Math.min(100, Math.max(0, str.stressIntensity + delta));

    // Breaking evaluations
    const bp = evaluateStressBreakpoint(str);
    if (bp.consequence === 'MEMBER_WITHDRAWAL') {
      const targetAlly = str.affectedNationIds[0];
      if (targetAlly && targetAlly !== playerNationId) {
        str.isResolved = true;
        str.resolvedAtTick = currentTick;
        results.withdrawnAllies.push({ treatyId: str.allianceTreatyId, nationId: targetAlly });
        draft.allianceEventLog.push(`[WITHDRAWAL] ${targetAlly} has formally withdrawn from alliance treaty ${str.allianceTreatyId} due to unaddressed stress.`);
        results.globalEvents.push({
          text: `[ALLIANCE CRACK] ${targetAlly} has formally exited the ${str.allianceTreatyId} defense treaty framework!`,
          severity: 'CRITICAL'
        });
      }
    } else if (bp.consequence === 'PUBLIC_DISSENT' && currentTick % 5 === 0) {
      results.globalEvents.push({ text: bp.narrative, severity: 'WARNING' });
    }
  });

  // 5. PUBLIC DIPLOMACY CAMPAIGNS TICKING
  draft.publicDiplomacyCampaigns = draft.publicDiplomacyCampaigns.map(camp => {
    if (!camp.isActive) return camp;

    // Find if counterpart is running active narrative battle
    let aiCounterActive = false;
    let aiStrength = 0;

    const counterpartAgenda = draft.aiDiplomaticAgendas[camp.targetNationId];
    if (counterpartAgenda) {
      const counter = computeCounterNarrativeResponse(counterpartAgenda, camp);
      if (counter.launches) {
        aiCounterActive = true;
        aiStrength = counter.strength;
      }
    }

    const evolved = processCampaignTick(camp, aiCounterActive, aiStrength, currentTick);

    // Apply reputation gains per-tick
    if (evolved.isActive) {
      const relKey = `${playerNationId}:${camp.targetNationId}`;
      const relKey2 = `${camp.targetNationId}:${playerNationId}`;
      const targetKey = relationships[relKey] ? relKey : relKey2;

      results.relationshipDeltas[targetKey] = (results.relationshipDeltas[targetKey] ?? 0) + evolved.reputationDeltaPerTick;
    }

    return evolved;
  }).filter(c => c.isActive);

  // 6. DIPLOMATIC INCIDENTS TICK
  const hasActiveUnresolvedIncident = draft.diplomaticIncidents.some(inc => !inc.consequenceApplied);
  if (!hasActiveUnresolvedIncident && Math.random() < 0.08) {
    // Collect arbitrary opponent nation (excluding player)
    const opponents = Object.keys(econNations).filter(id => id !== playerNationId);
    if (opponents.length > 0) {
      const oppN = opponents[Math.floor(Math.random() * opponents.length)];
      const inc = generateDiplomaticIncident(playerNationId, oppN, defconLevel, activeIndicators, currentTick);
      if (inc) {
        draft.diplomaticIncidents.push(inc);
         draft.incidentEventLog.push(inc.narrativeDescription);
         results.globalEvents.push({ text: inc.narrativeDescription, severity: 'WARNING' });
      }
    }
  }

  draft.diplomaticIncidents.forEach(inc => {
    if (inc.consequenceApplied) return;

    // Handle deadline missed
    if (currentTick > inc.responseDeadlineTick && inc.chosenResponse === null) {
      const expired = processIncidentDeadlineMiss(inc, currentTick);
      inc.chosenResponse = expired.chosenResponse;
      inc.isPublic = expired.isPublic;
      inc.relationshipDamage = expired.relationshipDamage;
      inc.consequenceApplied = true;

      const relKey = `${playerNationId}:${inc.affectedNationId}`;
      const relKey2 = `${inc.affectedNationId}:${playerNationId}`;
      const targetK = relationships[relKey] ? relKey : relKey2;

      results.relationshipDeltas[targetK] = (results.relationshipDeltas[targetK] ?? 0) - inc.relationshipDamage;
      draft.incidentEventLog.push(`[FALLBACK CONSEQUENCE] Missed reaction deadline. Relation with ${inc.affectedNationId} damaged by -${inc.relationshipDamage}.`);
    }
  });

  return results;
}
