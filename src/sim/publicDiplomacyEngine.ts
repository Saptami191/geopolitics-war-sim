import {
  PublicDiplomacyCampaign,
  PublicDiplomacyChannel,
  AIDiplomaticAgenda
} from '../types';

/**
 * Initiates a public diplomacy campaign, computing scores.
 */
export function launchPublicDiplomacyCampaign(
  playerNationId: string,
  targetNationId: string, // 'GLOBAL' or empty/null for international scope
  channel: PublicDiplomacyChannel,
  theme: string,
  capitalBudget: number, // sets audience scale
  tick: number,
  targetResistance: number = 50,
  targetTechScore: number = 50,
  hasUnresolvedIncident: boolean = false
): PublicDiplomacyCampaign {
  let baseEff = 50;

  switch (channel) {
    case 'UN_GENERAL_ASSEMBLY_SPEECH':
      baseEff = 70;
      break;
    case 'STATE_MEDIA_BROADCAST':
      baseEff = 40;
      break;
    case 'CULTURAL_EXCHANGE_PROGRAMME':
      baseEff = 55;
      break;
    case 'FOREIGN_AID_ANNOUNCEMENT':
      baseEff = 65;
      if (targetResistance < 50) {
        baseEff += 15;
      }
      break;
    case 'ACADEMIC_DIASPORA_OUTREACH':
      baseEff = 50;
      if (targetTechScore > 60) {
        baseEff += 20;
      }
      break;
    case 'TRACK_TWO_DIALOGUE':
      baseEff = 45;
      break;
    case 'INTERNATIONAL_PRESS_CONFERENCE':
      baseEff = 60;
      if (hasUnresolvedIncident) {
        baseEff -= 20;
      }
      break;
  }

  const audienceReachScore = Math.min(100, Math.max(10, capitalBudget / 10));
  const reputationDeltaPerTick = (baseEff / 100) * 1.5; // Max 1.5 delta per tick

  return {
    id: `pd_${playerNationId}_${targetNationId || 'GL'}_${channel}_${tick}`,
    playerNationId,
    targetNationId: targetNationId || 'GLOBAL',
    channel,
    narrativeTheme: theme,
    startedAtTick: tick,
    durationTicks: channel === 'CULTURAL_EXCHANGE_PROGRAMME' ? 24 : 12,
    capitalCostPerTick: channel === 'FOREIGN_AID_ANNOUNCEMENT' ? 8 : 4,
    effectivenessScore: baseEff,
    counterNarrativeActive: false,
    counterNarrativeStrength: 0,
    audienceReachScore,
    reputationDeltaPerTick,
    isActive: true,
    cumulativeReputationDelta: 0
  };
}

/**
 * Evolves campaign indicators per tick.
 */
export function processCampaignTick(
  campaign: PublicDiplomacyCampaign,
  counterNarrativeActive: boolean,
  counterStrength: number,
  tick: number
): PublicDiplomacyCampaign {
  const nextC = { ...campaign };

  // Duration exhaustion check
  if (tick - nextC.startedAtTick >= nextC.durationTicks) {
    nextC.isActive = false;
    return nextC;
  }

  // Active pushback
  if (counterNarrativeActive) {
    nextC.counterNarrativeActive = true;
    nextC.counterNarrativeStrength = counterStrength;
    nextC.effectivenessScore -= (counterStrength / 100) * 3;
  }

  // Natural decay adjustments
  const decayRate = nextC.channel === 'CULTURAL_EXCHANGE_PROGRAMME' ? 0.1 : 0.5;
  nextC.effectivenessScore = Math.max(0, nextC.effectivenessScore - decayRate);

  if (nextC.effectivenessScore < 20) {
    nextC.isActive = false;
  }

  // Accumulate changes
  nextC.reputationDeltaPerTick = (nextC.effectivenessScore / 100) * 1.5;
  nextC.cumulativeReputationDelta += nextC.reputationDeltaPerTick;

  return nextC;
}

/**
 * Computes whether AI launches counters.
 */
export function computeCounterNarrativeResponse(
  aiAgenda: AIDiplomaticAgenda,
  targetCampaign: PublicDiplomacyCampaign
): { launches: boolean; strength: number; channel: PublicDiplomacyChannel } {
  // Launches if target targets them specifically, or if they have ISOLATE_PLAYER goals
  const launches = aiAgenda.primaryGoal === 'ISOLATE_PLAYER' || targetCampaign.targetNationId === aiAgenda.nationId;
  const strength = aiAgenda.capitalAllocationPct * 0.8;

  let channel = targetCampaign.channel;
  if (targetCampaign.channel === 'CULTURAL_EXCHANGE_PROGRAMME') {
    channel = 'TRACK_TWO_DIALOGUE';
  }

  return { launches, strength, channel };
}

/**
 * Calculates current balance between campaigns.
 */
export function computeNarrativeWarfareBalance(
  playerCampaigns: PublicDiplomacyCampaign[],
  aiCampaigns: PublicDiplomacyCampaign[],
  targetNationId: string
): { playerAdvantage: number; narrative: string } {
  const pSum = playerCampaigns
    .filter(c => c.isActive && c.targetNationId === targetNationId)
    .reduce((sum, c) => sum + c.effectivenessScore, 0);

  const aiSum = aiCampaigns
    .filter(c => c.isActive && c.targetNationId === targetNationId)
    .reduce((sum, c) => sum + c.effectivenessScore, 0);

  const playerAdvantage = pSum - aiSum;

  let narrative = '';
  if (playerAdvantage > 40) {
    narrative = `[NARRATIVE ADVANTAGE] Player messages dominate local media spaces in ${targetNationId}. Cultural ties growing.`;
  } else if (playerAdvantage < -40) {
    narrative = `[NARRATIVE FRICTION] AI counter-programming completely blunts player outreach in ${targetNationId}. Threat perception rising.`;
  } else {
    narrative = `[NARRATIVE STALEMATE] Media circles in ${targetNationId} split evenly on player-vs-adversary claims.`;
  }

  return { playerAdvantage: Math.min(100, Math.max(-100, playerAdvantage)), narrative };
}
