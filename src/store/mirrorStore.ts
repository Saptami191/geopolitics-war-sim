import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';
import {
  MirrorAdaptationState,
  PlayerProfileVector,
  PlayerStrategyFingerprint,
  PlayerHabitRecord,
  PlayerPreferenceModel,
  PlayerRiskPatternModel,
  PlayerTempoModel,
  PlayerEscalationPatternModel,
  PlayerToolBiasModel,
  PlayerBaitSusceptibilityModel,
  CounterStrategyTemplate,
  CounterStrategyCandidate,
  CounterStrategyCommitment,
  HoneypotOpportunity,
  BaitSituation,
  ExploitWindow,
  AdaptationMemory,
  LearningConfidence,
  PatternStabilityScore,
  CountermeasureHistory,
  DeceptionExposureState,
  MirrorWarningLevel,
  SovereignAgent,
  SovereignLeaderProfile,
  SovereignAllianceSignal,
  MirrorAIPlayerProfile,
  SovereignDecision,
  SovereignObjective,
  SovereignThreatAssessment,
  SovereignPowerOrientation,
  SovereignIdeologicalPosture,
  SovereignEconomicDoctrine,
  SovereignRiskTolerance,
  SovereignRegionalAmbition,
  SovereignInstrument,
  SovereignState,
  SovereignActions,
  SovereignObjectiveType,
  SovereignLeaderArchetype,
  EscalationDecision
} from '../types';

import { useWorldStore } from './worldStore';
import { useSigintStore } from './sigintStore';
import { useArachneStore } from './arachneStore';
import { useFinintStore } from './finintStore';
import { useCiaStore } from './ciaStore';
import { useDefconStore } from './defconStore';
import { useMilitaryStore } from './militaryStore';
import { useEconomyStore } from './economyStore';
import { useEWStore } from './ewStore';
import { useCinematicsStore } from './cinematicsStore';
import { useConsequenceStore } from './consequenceStore';
import { useSovereignStore } from './sovereignStore';
import { evaluateReplanTrigger } from '../sim/replanTriggerEngine';
import { evaluateEscalation } from '../sim/escalationLogic';
import { selectTopGoal } from '../sim/goalSelectionEngine';

const DEFAULT_TEMPLATES: CounterStrategyTemplate[] = [
  {
    templateId: 'ECON_HARDENING',
    name: 'ASYMMETRIC ECONOMIC RESILIENCE CORRIDOR',
    description: 'Preemptively diversifies critical natural reserves, redirects supply routes to Eurasian partners, and establishes alternative financial clearances. Drastically cushions collateral impact under aggressive player sanctions.',
    targetBiasTrigger: 'SANCTIONS',
    tactics: ['Establish BRICS clearing hubs', 'Pre-sell liquid reserves to third parties', 'Subsidize metal substitution lines'],
    systemModifiers: {
      intelBoost: 0,
      economicResilience: 35,
      militaryFortification: 0,
      counterIntelligenceMultiplier: 1.0
    }
  },
  {
    templateId: 'COUNTER_INTEL_HULL',
    name: 'CLANDESTINE COUNTER-INTELLIGENCE SEGREGATION',
    description: 'Rigid segmentation of elite defense networks, introduction of decoy database traces, and automated telemetry purging. Cripples the efficacy and doubles blowback of player covert operations.',
    targetBiasTrigger: 'COVERT',
    tactics: ['Quarantine mainframe comms', 'Inject deceptive kompromat signals', 'Monitor dissident funding flows'],
    systemModifiers: {
      intelBoost: 10,
      economicResilience: 0,
      militaryFortification: 0,
      counterIntelligenceMultiplier: 2.5
    }
  },
  {
    templateId: 'DENIAL_NET_A2AD',
    name: 'STRATEGIC DENIAL & ANTI-ACCESS (A2/AD) GRID',
    description: 'Deploys localized interception divisions, thermal-recon nets, and decoy bunkers. Effectively limits player ballistic leverage and fortifies boundary protection ratings.',
    targetBiasTrigger: 'MILITARY',
    tactics: ['Position mobile SAM arrays', 'Establish active radar shields', 'Fortify coastline divisions'],
    systemModifiers: {
      intelBoost: 5,
      economicResilience: 0,
      militaryFortification: 40,
      counterIntelligenceMultiplier: 1.2
    }
  },
  {
    templateId: 'DIPLO_STALL_TIME',
    name: 'TACTICAL NEUTRALITY & DIPLOMATIC EMBASSY SHIELD',
    description: 'Engages in prolonged multilateral dialogue, scheduling symbolic treaties, and backchannel concessions. Pacifies defensive coalitions while preparing asymmetric retaliation systems behind closed doors.',
    targetBiasTrigger: 'DIPLOMACY',
    tactics: ['Convene UN mediation drafts', 'Schedule delay backchannels', 'Pledge non-aggression protocols'],
    systemModifiers: {
      intelBoost: 15,
      economicResilience: 10,
      militaryFortification: 5,
      counterIntelligenceMultiplier: 1.0
    }
  },
  {
    templateId: 'FIREWALL_QUARANTINE',
    name: 'SECURE DIGITAL FIREWALL SANATORIUM',
    description: 'Isolates industrial grids from primary internet relays, deploys honey-grids, and trains defense cadres. Drastically suppresses player cyber and espionage success parameters.',
    targetBiasTrigger: 'CYBER',
    tactics: ['Sever outer SCADA connections', 'Deploy passive honeynet decoys', 'Encrypt industrial databases'],
    systemModifiers: {
      intelBoost: 20,
      economicResilience: 0,
      militaryFortification: 10,
      counterIntelligenceMultiplier: 1.8
    }
  },
  {
    templateId: 'ELITE_STABILIZATION',
    name: 'ELITE COHESION & DOMESTIC SECURITY STABILIZATION',
    description: 'Inoculates loyalist military heads, redirects corporate dividends to regional barons, and suppresses domestic unrest vectors. Decreases regime vulnerability against coordinated player soft-power push.',
    targetBiasTrigger: 'ECONOMY',
    tactics: ['Reallocate bank dividends', 'Enforce emergency communication acts', 'Reinforce central security hubs'],
    systemModifiers: {
      intelBoost: 5,
      economicResilience: 15,
      militaryFortification: 15,
      counterIntelligenceMultiplier: 1.5
    }
  }
];

interface MirrorActions {
  recordPlayerAction: (
    category: 'SANCTIONS' | 'COVERT' | 'MILITARY' | 'DIPLOMACY' | 'CYBER' | 'ECONOMY',
    intensity?: number,
    tick?: number
  ) => void;
  deployCounterStrategy: (candidateId: string) => void;
  interactWithBait: (baitId: string, playerActionType: string, isSIGINTHigh: boolean) => { triggered: boolean, feedback: string, success: boolean };
  setDifficulty: (level: 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE') => void;
  setConfrontationPlayed: (val: boolean) => void;
  resetMirrorStore: () => void;
  triggerDriftRecalibration: () => void;
  tickMirrorState: (currentTick: number) => void;
  injectBait: (bait: HoneypotOpportunity) => void;
  registerInfluenceOp: (campaignId: string) => void;
  registerCIAPatterns: (mostTargetedNation: string, mostUsedOpType: string, avgHeat: number) => void;
}

const initialProfile = (): PlayerProfileVector => ({
  sanctionsUseCount: 5,
  covertOpsCount: 5,
  militaryStrikesCount: 5,
  diplomaticAgreementsCount: 5,
  cyberAttacksCount: 5,
  economyDecisionsCount: 5,
  totalActionsLogged: 30,
  sanctionsBias: 16.6,
  covertBias: 16.6,
  militaryBias: 16.6,
  diplomacyBias: 16.6,
  cyberBias: 16.6,
  economicBias: 16.6,
});

export function mirror_predictPlayerNextMoves(profile: MirrorAIPlayerProfile, currentTick: number): string[] {
  const predictions: string[] = [];
  if (profile.ciaFocusNations.length > 0 && profile.preferredDomains.includes('COVERT_OPERATION')) {
    predictions.push(`Player likely to continue covert operations in ${profile.ciaFocusNations[0]}.`);
  }
  if (profile.militaryPosturePattern === 'SURGE' || profile.escalationThreshold < 30) {
    predictions.push(`Player preparing military escalation window.`);
  }
  if (profile.sigintFocusNations.length > 0 && !profile.ciaFocusNations.includes(profile.sigintFocusNations[0])) {
    predictions.push(`Player building intelligence picture on ${profile.sigintFocusNations[0]} — covert op likely.`);
  }
  if (profile.ewFocusNations.length > 0) {
    predictions.push(`EW activity signals imminent operation in targeted segments.`);
  }
  if (currentTick - profile.lastUpdatedTick > 5) {
    predictions.push(`Player in strategic pause — deception or preparation.`);
  }
  return predictions;
}

export function mirror_identifyPlayerWeaknesses(profile: MirrorAIPlayerProfile, worldState: any, currentTick: number): string[] {
  const weaknesses: string[] = [];
  if (profile.operationalTempo > 80) weaknesses.push(`Player is overextended — spread across too many targets.`);
  if (profile.ciaFocusNations.length > 0 && profile.ciaFocusNations.length <= 2) weaknesses.push(`Player has blind spots in non-focus nations.`);
  if (!profile.preferredDomains.includes('ECONOMIC_COERCION')) weaknesses.push(`Player neglecting economic statecraft — leverage available.`);
  if (profile.riskProfile === 'CAUTIOUS' || profile.riskProfile === 'RISK_AVERSE') weaknesses.push(`Player shows escalation fatigue — credibility gap.`);
  return weaknesses;
}

export function sovereign_generateInitialObjectives(agent: SovereignAgent, currentTick: number): SovereignObjective[] {
  const objectives: SovereignObjective[] = [];
  
  let pool: SovereignObjectiveType[] = [];
  if (agent.powerOrientation === 'HEGEMON') pool = ['REGIONAL_HEGEMONY', 'ALLIANCE_BUILDING', 'INFLUENCE_PROJECTION'];
  else if (agent.powerOrientation === 'REVISIONIST') pool = ['TERRITORIAL_EXPANSION', 'WMD_ACQUISITION', 'PROXY_WAR_VICTORY'];
  else if (agent.powerOrientation === 'STATUS_QUO') pool = ['ALLIANCE_BUILDING', 'DIPLOMATIC_ISOLATION_OF_PLAYER', 'COUNTER_PLAYER_CONTAINMENT'];
  else if (agent.powerOrientation === 'BALANCER') pool = ['COUNTER_PLAYER_CONTAINMENT', 'ALLIANCE_BUILDING', 'ECONOMIC_DOMINANCE'];
  else if (agent.powerOrientation === 'ISOLATIONIST') pool = ['INTERNAL_CONSOLIDATION', 'SANCTIONS_BREAKING', 'NUCLEAR_DETERRENCE'];

  if (agent.leaderProfile.archetype === 'PARANOID_STRONGMAN') pool.push('INTERNAL_CONSOLIDATION');
  if (agent.leaderProfile.archetype === 'MILITARY_HAWK') pool.push('TERRITORIAL_EXPANSION');

  for (let i = 0; i < 3; i++) {
    const type = pool[i % pool.length];
    objectives.push({
      id: `obj_${agent.nationId}_${currentTick}_${i}`,
      type,
      nationId: agent.nationId,
      priority: 2,
      progressScore: 0,
      isAchieved: false,
      achievedAtTick: null,
      blockedBy: [],
      instrumentsInUse: [],
      estimatedCompletionTick: currentTick + (agent.riskTolerance === 'RECKLESS' ? 50 : 150),
      confidenceScore: 50
    });
  }
  return objectives;
}

export function sovereign_generateDecisionRationale(agent: SovereignAgent, instrument: SovereignInstrument, targetNationId: string | null, threatScore: number): string {
  const t = targetNationId || 'regional';
  switch (instrument) {
    case 'MILITARY_BUILDUP': return `${agent.nationId} assesses that current threat environment from ${t} actors warrants enhanced readiness posture. Defence establishment recommendation: increase force readiness. Leader ${agent.leaderProfile.archetype} concurs.`;
    case 'DIPLOMATIC_PRESSURE': return `${agent.nationId} leadership has determined that diplomatic leverage against ${t} serves current objectives. Expected outcome: compliance or isolation of ${t}.`;
    case 'ECONOMIC_COERCION': return `Economic measures authorized against ${t} to compound pressure without crossing military thresholds.`;
    case 'NUCLEAR_SIGNALLING': return `${agent.nationId} strategic assessment: conventional deterrence insufficient against ${t}'s current posture. Leadership has authorised calibrated nuclear signalling.`;
    case 'COVERT_OPERATION': return `${agent.nationId} directorate recommends covert action against ${t} to advance objective without attribution. Risk tolerance: ${agent.riskTolerance}.`;
    case 'ALLIANCE_ACTIVATION': return `${agent.nationId} assesses that unilateral response to current threat is suboptimal. Alliance activation recommended.`;
    case 'INFORMATION_WARFARE': return `Information operations activated targeting ${t} to shape narrative and degrade domestic coherence.`;
    case 'SANCTIONS': return `Sanctions ordered against ${t} in response to hostile posture.`;
    case 'TRADE_DEAL': return `Strategic trade deal arranged to secure vital supply lines and reduce vulnerability.`;
    case 'ARMS_TRANSFER': return `Arms transfer authorized to offset balance of power concerns involving ${t}.`;
    case 'FOREIGN_AID': return `Foreign aid deployed to consolidate influence and secure diplomatic support.`;
    case 'EW_CAMPAIGN': return `Electronic warfare assets deployed to deny spectrum dominance to ${t}.`;
    case 'PROXY_FORCE': return `Proxy forces engaged to project power against ${t} with deniability.`;
    default: return `Strategic decision executed concerning ${t}.`;
  }
}

export function sovereign_generateLeaderProfile(nationId: string, powerOrientation: SovereignPowerOrientation, ideologicalPosture: SovereignIdeologicalPosture, riskTolerance: SovereignRiskTolerance, currentTick: number): SovereignLeaderProfile {
  let archetype: SovereignLeaderArchetype = 'OPPORTUNIST';
  if (powerOrientation === 'REVISIONIST' && ideologicalPosture === 'AUTHORITARIAN_NATIONALIST') archetype = Math.random() > 0.5 ? 'PARANOID_STRONGMAN' : 'NATIONALIST_POPULIST';
  else if (powerOrientation === 'HEGEMON' && ideologicalPosture === 'PRAGMATIC_REALIST') archetype = Math.random() > 0.5 ? 'IMPERIAL_VISIONARY' : 'PRAGMATIC_TECHNOCRAT';
  else if (powerOrientation === 'ISOLATIONIST') archetype = 'CAUTIOUS_INSTITUTIONALIST';
  else if (riskTolerance === 'RECKLESS' && powerOrientation === 'REVISIONIST') archetype = 'MILITARY_HAWK';
  else if (powerOrientation === 'STATUS_QUO' && ideologicalPosture === 'LIBERAL_DEMOCRATIC') archetype = 'CAUTIOUS_INSTITUTIONALIST';
  else if (powerOrientation === 'BALANCER' && ideologicalPosture === 'PRAGMATIC_REALIST') archetype = 'PRAGMATIC_TECHNOCRAT';
  else archetype = ['PARANOID_STRONGMAN', 'IDEOLOGICAL_TRUE_BELIEVER', 'PRAGMATIC_TECHNOCRAT', 'NATIONALIST_POPULIST', 'IMPERIAL_VISIONARY', 'MILITARY_HAWK', 'CAUTIOUS_INSTITUTIONALIST', 'OPPORTUNIST'][Math.floor(Math.random() * 8)] as SovereignLeaderArchetype;

  const namesEu = ['Mikhail Volkov', 'Andrei Kozlov', 'Dmitri Petrov'];
  const namesMe = ['Khalid Al-Rashid', 'Hassan Al-Mansour', 'Tariq Bin-Zayed'];
  const namesAs = ['Park Ji-Hoon', 'Kim Tae-Jin', 'Zhang Wei'];
  const namesWe = ['James Harrison', 'Robert Clarke', 'Elena Müller'];

  let name = namesWe[0];
  const fc = nationId[0] || 'U';
  if (['R','U','B'].includes(fc)) name = namesEu[Math.floor(Math.random() * namesEu.length)];
  else if (['I','S','E','T'].includes(fc)) name = namesMe[Math.floor(Math.random() * namesMe.length)];
  else if (['C','J','K','N'].includes(fc)) name = namesAs[Math.floor(Math.random() * namesAs.length)];
  else name = namesWe[Math.floor(Math.random() * namesWe.length)];

  const baseRisk = riskTolerance === 'RECKLESS' ? 90 : riskTolerance === 'AGGRESSIVE' ? 70 : riskTolerance === 'CALCULATED' ? 50 : riskTolerance === 'CAUTIOUS' ? 30 : 10;
  
  return {
    id: `leader_${nationId}_${currentTick}`,
    name,
    nationId,
    archetype,
    ageYears: 45 + Math.floor(Math.random() * 30),
    yearsInPower: Math.floor(Math.random() * 15),
    loyaltyBase: archetype === 'MILITARY_HAWK' ? 'Military' : archetype === 'IDEOLOGICAL_TRUE_BELIEVER' ? 'Party' : 'Popular',
    domesticApprovalScore: 50 + Math.floor(Math.random() * 40),
    personalRiskTolerance: Math.max(0, Math.min(100, baseRisk + (Math.random() * 40 - 20))),
    paranoidModifier: archetype === 'PARANOID_STRONGMAN' ? 80 : archetype === 'PRAGMATIC_TECHNOCRAT' ? 20 : 50,
    ideologyStrength: archetype === 'IDEOLOGICAL_TRUE_BELIEVER' ? 90 : archetype === 'PRAGMATIC_TECHNOCRAT' ? 10 : 50,
    ambitionScore: (powerOrientation === 'HEGEMON' || archetype === 'IMPERIAL_VISIONARY') ? 90 : 50,
    legacyWeight: archetype === 'IMPERIAL_VISIONARY' ? 90 : archetype === 'OPPORTUNIST' ? 20 : 50,
    decisionLatencyTicks: archetype === 'OPPORTUNIST' ? 2 : archetype === 'CAUTIOUS_INSTITUTIONALIST' ? 6 : 4,
    memoryCitedEvents: []
  };
}

export const useMirrorStore = create<MirrorAdaptationState & MirrorActions & SovereignState & SovereignActions>()(
  persist(
    (set, get) => ({
      // State Properties
      profile: initialProfile(),
      fingerprint: 'BALANCED_GRAND_STRATEGIST',
      habits: [],
      preferenceModel: {
        primaryInstrument: 'DIPLOMACY',
        secondaryInstrument: 'MILITARY',
        negotiationStiffness: 45,
        unrestExploitationPropensity: 30,
      },
      riskPattern: {
        riskToleranceScore: 40,
        bluffPropensity: 35,
        retreatFrequency: 0,
        earlyCommitmentRate: 20,
      },
      tempo: {
        averageResponseTime: 4,
        escalationSpeed: 'CALCULATED',
        actionsPerTenTicks: 2,
      },
      escalationPattern: {
        humiliationReactionRatio: 0.3,
        nuclearSovereignReadiness: 15,
        retaliatoryMultiplier: 1.2,
      },
      toolBias: {
        cyberIntrusionPropensity: 35,
        propagandaSlanderRate: 40,
        backchannelUtilScore: 45,
      },
      baitSusceptibility: {
        summitTrapsAttempted: 0,
        summitTrapsCaught: 0,
        fakeVulnerabilitiesExploited: 0,
        deceptiveLeakersTrusted: 0,
        susceptibilityScore: 30,
      },

      availableTemplates: DEFAULT_TEMPLATES,
      activeCounterCommitment: undefined,
      candidates: [],
      honeypots: [],
      baitSituations: [],
      exploitWindows: [],
      memories: [],
      confidence: {
        generalConfidence: 0,
        historyScaleTicks: 1,
        relearningActive: false,
      },
      stability: {
        coreStability: 85,
        driftDetected: false,
      },
      counterHistory: [],
      deception: {
        playerSuspectsAdaptation: false,
        aiFalseCertaintyScore: 0,
        poisonedHabitIds: [],
      },
      warningLevel: 'LOW',
      learningSpeedMultiplier: 1.0,
      difficultySetting: 'MEDIUM',
      confrontationPlayed: false,

      // Sovereign AI State Properties
      sovereign_agents: {},
      sovereign_leaderProfiles: {},
      sovereign_allianceSignals: [],
      mirror_playerProfile: null,
      mirror_advisoryLog: [],
      sovereign_globalDecisionLog: [],
      sovereign_lastProcessedTick: -1,
      sovereign_activeConflicts: [],
      sovereign_crisesEmergent: [],

      // Actions & Methods
      setDifficulty: (level) => {
        let mult = 1.0;
        if (level === 'EASY') mult = 0.5;
        if (level === 'HARD') mult = 1.6;
        if (level === 'NIGHTMARE') mult = 2.4;
        set({ difficultySetting: level, learningSpeedMultiplier: mult });
      },

      setConfrontationPlayed: (val) => {
        set({ confrontationPlayed: val });
      },

      resetMirrorStore: () => {
        set({
          profile: initialProfile(),
          fingerprint: 'BALANCED_GRAND_STRATEGIST',
          habits: [],
          activeCounterCommitment: undefined,
          candidates: [],
          honeypots: [],
          baitSituations: [],
          exploitWindows: [],
          memories: [],
          confidence: {
            generalConfidence: 0,
            historyScaleTicks: 1,
            relearningActive: false,
          },
          stability: {
            coreStability: 85,
            driftDetected: false,
          },
          counterHistory: [],
          warningLevel: 'LOW',
          
          sovereign_agents: {},
          sovereign_leaderProfiles: {},
          sovereign_allianceSignals: [],
          mirror_playerProfile: null,
          mirror_advisoryLog: [],
          sovereign_globalDecisionLog: [],
          sovereign_lastProcessedTick: -1,
          sovereign_activeConflicts: [],
          sovereign_crisesEmergent: [],
        });
      },

      recordPlayerAction: (category, intensity = 10, tick = 0) => {
        const state = get();
        const mult = state.learningSpeedMultiplier;

        // Produce next profile
        set(
          produce((draft: MirrorAdaptationState) => {
            // Log raw count based on intensity/weight
            const deltaCount = Math.round(intensity * mult * 0.1) || 1;
            draft.profile.totalActionsLogged += deltaCount;

            if (category === 'SANCTIONS') draft.profile.sanctionsUseCount += deltaCount;
            else if (category === 'COVERT') draft.profile.covertOpsCount += deltaCount;
            else if (category === 'MILITARY') draft.profile.militaryStrikesCount += deltaCount;
            else if (category === 'DIPLOMACY') draft.profile.diplomaticAgreementsCount += deltaCount;
            else if (category === 'CYBER') draft.profile.cyberAttacksCount += deltaCount;
            else if (category === 'ECONOMY') draft.profile.economyDecisionsCount += deltaCount;

            const total =
              draft.profile.sanctionsUseCount +
              draft.profile.covertOpsCount +
              draft.profile.militaryStrikesCount +
              draft.profile.diplomaticAgreementsCount +
              draft.profile.cyberAttacksCount +
              draft.profile.economyDecisionsCount;

            // Compute percentage biases
            draft.profile.sanctionsBias = Math.round((draft.profile.sanctionsUseCount / total) * 1000) / 10;
            draft.profile.covertBias = Math.round((draft.profile.covertOpsCount / total) * 1000) / 10;
            draft.profile.militaryBias = Math.round((draft.profile.militaryStrikesCount / total) * 1000) / 10;
            draft.profile.diplomacyBias = Math.round((draft.profile.diplomaticAgreementsCount / total) * 1000) / 10;
            draft.profile.cyberBias = Math.round((draft.profile.cyberAttacksCount / total) * 1000) / 10;
            draft.profile.economicBias = Math.round((draft.profile.economyDecisionsCount / total) * 1000) / 10;

            // Track recent habits Stability & Drift 
            let habit = draft.habits.find((h) => h.actionCategory === category);
            if (!habit) {
              habit = {
                habitId: `habit_${category.toLowerCase()}`,
                actionCategory: category,
                triggerStatus: 'NORMAL_TEMPO',
                frequencyCount: 0,
                lastTickSeen: tick,
                stabilityScore: 50,
              };
              draft.habits.push(habit);
            }
            const gap = tick - habit.lastTickSeen;
            habit.frequencyCount += 1;
            habit.lastTickSeen = tick;

            // If player switched away from a dominant instrument abruptly, flag pattern drift
            const oldFingerprint = state.fingerprint;
            let currentHighest: PlayerStrategyFingerprint = 'BALANCED_GRAND_STRATEGIST';
            const biasesList = [
              { cat: 'SANCTIONS_GRINDER', val: draft.profile.sanctionsBias },
              { cat: 'COVERT_OPERATOR', val: draft.profile.covertBias },
              { cat: 'MILITARY_BLITZER', val: draft.profile.militaryBias },
              { cat: 'ALLIANCE_BROKER', val: draft.profile.diplomacyBias },
              { cat: 'INFORMATION_WAR_SPECIALIST', val: draft.profile.cyberBias },
              { cat: 'ECONOMIC_STRANGLER', val: draft.profile.economicBias },
            ];
            biasesList.sort((a,b) => b.val - a.val);

            if (biasesList[0].val > 24) {
              currentHighest = biasesList[0].cat as PlayerStrategyFingerprint;
            }

            if (currentHighest !== oldFingerprint && draft.profile.totalActionsLogged > 45) {
              draft.stability.driftDetected = true;
              draft.stability.coreStability = Math.max(10, draft.stability.coreStability - 15);
              draft.confidence.generalConfidence = Math.max(5, draft.confidence.generalConfidence - 12);
              draft.confidence.relearningActive = true;
            } else {
              draft.stability.driftDetected = false;
              draft.stability.coreStability = Math.min(100, draft.stability.coreStability + 2);
              draft.confidence.generalConfidence = Math.min(100, draft.confidence.generalConfidence + Math.round(1.5 * mult));
            }

            draft.fingerprint = currentHighest;

            // Dynamically adjust preference and risk models
            draft.preferenceModel.primaryInstrument = biasesList[0].cat.replace('_GRINDER','').replace('_OPERATOR','').replace('_BLITZER','').replace('_BROKER','').replace('_SPECIALIST','').replace('_STRANGLER','');
            draft.preferenceModel.secondaryInstrument = biasesList[1].cat.replace('_GRINDER','').replace('_OPERATOR','').replace('_BLITZER','').replace('_BROKER','').replace('_SPECIALIST','').replace('_STRANGLER','');
            draft.riskPattern.riskToleranceScore = Math.round(draft.profile.militaryBias * 0.7 + draft.profile.cyberBias * 0.3);
            draft.warningLevel = draft.confidence.generalConfidence > 75 ? 'HIGH' : draft.confidence.generalConfidence > 45 ? 'MEDIUM' : 'LOW';

            // Push Memory trace
            if (draft.memories.length > 25) {
              draft.memories.pop();
            }
            draft.memories.unshift({
              id: `mem_ad_${tick}_${Math.random().toString().substring(2,6)}`,
              tickOccurred: tick,
              playerActionContext: `Player executed instrument ${category} with intensity ${intensity}`,
              aiCounterActionExecuted: draft.activeCounterCommitment ? draft.activeCounterCommitment.name : 'MONITORING_ONLY',
              successOutcome: true,
              learnedWeightShift: parseFloat((1.2 * mult).toFixed(2))
            });
          })
        );

        // Regenerate Strategy Candidates!
        state.triggerDriftRecalibration();
      },

      deployCounterStrategy: (candidateId) => {
        set(
          produce((draft: MirrorAdaptationState) => {
            const cand = draft.candidates.find((c) => c.candidateId === candidateId);
            if (!cand) return;

            const temp = draft.availableTemplates.find((t) => t.templateId === cand.templateId);
            if (!temp) return;

            draft.activeCounterCommitment = {
              candidateId,
              activeStrategyId: temp.templateId,
              name: temp.name,
              description: temp.description,
              ticksActive: 0,
              effectivenessScore: Math.round(70 + Math.random() * 20),
              threatCounteredCategory: temp.targetBiasTrigger,
            };

            draft.counterHistory.unshift({
              strategyName: temp.name,
              tickDeployed: draft.memories[0]?.tickOccurred || 1,
              effectiveness: 'EXCELLENT',
              playerRetaliationRecorded: false,
            });

            if (draft.counterHistory.length > 15) {
              draft.counterHistory.pop();
            }

            // Remove candidate
            draft.candidates = draft.candidates.filter((c) => c.candidateId !== candidateId);
            draft.warningLevel = 'CRITICAL';
          })
        );
      },

      interactWithBait: (baitId, playerActionType, isSIGINTHigh) => {
        const state = get();
        let feedback = '';
        let success = true;

        set(
          produce((draft: MirrorAdaptationState) => {
            const hp = draft.honeypots.find((h) => h.id === baitId);
            if (!hp) return;

            hp.isTriggered = true;
            draft.baitSusceptibility.summitTrapsCaught += 1;

            if (hp.baitType === 'ECONOMIC_CHOKE_CORRIDOR') {
              feedback = `BAIT TRIGGERED: Your administrative sanction locked on the trade lane in ${hp.targetId}. However, the corridor was a structured honeypot: trade was already rerouted. Economic friction inflicts $20B leakage on your treasury!`;
              success = false;
              draft.baitSusceptibility.susceptibilityScore = Math.min(100, draft.baitSusceptibility.susceptibilityScore + 15);
            } else if (hp.baitType === 'COVERT_LEAK') {
              feedback = `BAIT TRIGGERED: Your covert operations team hacked the exposed signal nodes in ${hp.targetId}. The mainframe was a digital quarantine honey-net! Hostile counter-intelligence captured your clandestine trace. National suspicion surges +25%!`;
              success = false;
              draft.baitSusceptibility.deceptiveLeakersTrusted += 1;
              draft.baitSusceptibility.susceptibilityScore = Math.min(100, draft.baitSusceptibility.susceptibilityScore + 20);
            } else if (hp.baitType === 'MILITARY_GAP') {
              feedback = `BAIT TRIGGERED: Your strike group bombarded the seemingly defenseless borders of ${hp.targetId}. However, underground mobile fortified division locks engaged! Your target intercept rates were 100% neutralized, resulting in extreme blowback!`;
              success = false;
              draft.baitSusceptibility.susceptibilityScore = Math.min(100, draft.baitSusceptibility.susceptibilityScore + 18);
            } else if (hp.baitType === 'DIPLOMATIC_OPEN_STALL') {
              feedback = `BAIT TRIGGERED: You joined a temporary peace summit in ${hp.targetId}. This treaty was a diplomatic stalling trap! The adversary used the breathing room to build 2 additional tactical boundary divisions.`;
              success = false;
              draft.baitSusceptibility.susceptibilityScore = Math.min(100, draft.baitSusceptibility.susceptibilityScore + 12);
            }
          })
        );

        return { triggered: true, feedback, success };
      },

      triggerDriftRecalibration: () => {
        const state = get();
        const primary = state.preferenceModel.primaryInstrument;

        set(
          produce((draft: MirrorAdaptationState) => {
            // Clear current candidates
            draft.candidates = [];

            // Match with active templates
            draft.availableTemplates.forEach((temp) => {
              if (temp.targetBiasTrigger === primary) {
                draft.candidates.push({
                  candidateId: `cand_${temp.templateId}_${Math.floor(Math.random() * 1000)}`,
                  templateId: temp.templateId,
                  scoreMatch: Math.round(state.profile.sanctionsBias * 0.9 + 10), // approximate matching index
                  tickGenerated: draft.memories[0]?.tickOccurred || 1,
                  estimatedSuccessProbability: Math.round(75 + Math.random() * 20),
                });
              }
            });

            // Ensure we have at least 1 candidate always matching backup biases
            if (draft.candidates.length === 0) {
              const b = draft.availableTemplates[Math.floor(Math.random() * draft.availableTemplates.length)];
              draft.candidates.push({
                candidateId: `cand_${b.templateId}_backup`,
                templateId: b.templateId,
                scoreMatch: 50,
                tickGenerated: 1,
                estimatedSuccessProbability: 60,
              });
            }
          })
        );
      },

      tickMirrorState: (currentTick) => {
        const state = get();
        set(
          produce((draft: MirrorAdaptationState) => {
            // 1. Advance active counterstrategy ticks
            if (draft.activeCounterCommitment) {
              draft.activeCounterCommitment.ticksActive += 1;
              // Randomly complete / expire the counterstrategy after 20-30 ticks
              if (draft.activeCounterCommitment.ticksActive > 24 && Math.random() < 0.12) {
                draft.activeCounterCommitment = undefined;
              }
            }

            // 2. Exploit Windows ticks
            draft.exploitWindows.forEach((w) => {
              w.remainingTicks = Math.max(0, w.remainingTicks - 1);
            });
            draft.exploitWindows = draft.exploitWindows.filter((w) => w.remainingTicks > 0);

            // 3. Spawns ephemeral Exploit Windows based on current fingerprint
            if (draft.exploitWindows.length < 2 && Math.random() < 0.08) {
              const countryOptions = ['RU', 'CN', 'IR', 'KP', 'SA', 'IL'];
              const tgt = countryOptions[Math.floor(Math.random() * countryOptions.length)];
              
              if (draft.fingerprint === 'SANCTIONS_GRINDER') {
                draft.exploitWindows.push({
                  id: `window_grind_${currentTick}`,
                  countryId: tgt,
                  description: `SANCTIONS TRAP: ${tgt} trade routes have temporarily bottled into a single bottleneck grid. High vulnerability to counter-re-channeling.`,
                  reason: 'Overreliance on financial sanctions grids',
                  remainingTicks: 12,
                  exploitMultiplier: 1.8,
                  isExposed: true
                });
              } else if (draft.fingerprint === 'MILITARY_BLITZER') {
                draft.exploitWindows.push({
                  id: `window_blitz_${currentTick}`,
                  countryId: tgt,
                  description: `MOBILE AMBUSH EXPOSURE: ${tgt} has exposed an offensive SAM cluster to draw player orbital coordinates.`,
                  reason: 'Predictable forward military mobilization patterns',
                  remainingTicks: 10,
                  exploitMultiplier: 2.0,
                  isExposed: true
                });
              } else if (draft.fingerprint === 'COVERT_OPERATOR') {
                draft.exploitWindows.push({
                  id: `window_covert_${currentTick}`,
                  countryId: tgt,
                  description: `SATELLITE DECOY HOLE: ${tgt} communication towers have active leaks that lead directly to sandboxed data grids.`,
                  reason: 'Repetitive covert infiltration trails',
                  remainingTicks: 8,
                  exploitMultiplier: 1.5,
                  isExposed: true
                });
              }
            }

            // 4. Spawns honeypots based on player habits
            if (draft.honeypots.length < 3 && Math.random() < 0.08) {
              const countryOptions = ['RU', 'CN', 'IR', 'KP', 'SA', 'IL'];
              const tgt = countryOptions[Math.floor(Math.random() * countryOptions.length)];

              if (draft.fingerprint === 'SANCTIONS_GRINDER') {
                draft.honeypots.push({
                  id: `hp_sanc_${currentTick}`,
                  targetId: tgt,
                  name: `Vulnerable Petrochemical Clearance Hub [${tgt}]`,
                  description: `Appears as a crucial trade node but has completed digital reserves transfer. Sanctioning this will backfire.`,
                  baitType: 'ECONOMIC_CHOKE_CORRIDOR',
                  attractivenessIndex: 85,
                  isDiscovered: false,
                  isTriggered: false,
                  rewardToPlayerIfSucceeds: 'Temporary $15B trade asset seize',
                  penaltyToPlayerIfTrapped: 'Exhausts diplomatic status, inflicts $20B fine'
                });
              } else if (draft.fingerprint === 'COVERT_OPERATOR') {
                draft.honeypots.push({
                  id: `hp_cov_${currentTick}`,
                  targetId: tgt,
                  name: `Exposed Strategic Air Defence Server [${tgt}]`,
                  description: `A seemingly unsecured digital port in military firewalls. Perfect hacking opening, but monitored by defensive counterintelligence.`,
                  baitType: 'COVERT_LEAK',
                  attractivenessIndex: 90,
                  isDiscovered: false,
                  isTriggered: false,
                  rewardToPlayerIfSucceeds: 'Complete division status telemetry map',
                  penaltyToPlayerIfTrapped: 'Traps spy team, surges national suspicion +25%'
                });
              } else if (draft.fingerprint === 'MILITARY_BLITZER') {
                draft.honeypots.push({
                  id: `hp_mil_${currentTick}`,
                  targetId: tgt,
                  name: `Unprotected Coastline Rocket Cache [${tgt}]`,
                  description: `A forward silo storage with weak defensive power reading. Inviting air target, but heavily fortified underground.`,
                  baitType: 'MILITARY_GAP',
                  attractivenessIndex: 80,
                  isDiscovered: false,
                  isTriggered: false,
                  rewardToPlayerIfSucceeds: 'Destruction of 5 division logistics supply lines',
                  penaltyToPlayerIfTrapped: 'Direct counter-interception damage, rises UN investigation level'
                });
              } else {
                draft.honeypots.push({
                  id: `hp_dip_${currentTick}`,
                  targetId: tgt,
                  name: `Temporary Regional Peaceful De-escalation Summit [${tgt}]`,
                  description: `Adversary seeks compromise on regional blockades, but is actually using this to delay and mobilize divisions.`,
                  baitType: 'DIPLOMATIC_OPEN_STALL',
                  attractivenessIndex: 75,
                  isDiscovered: false,
                  isTriggered: false,
                  rewardToPlayerIfSucceeds: 'Diplomatic opinion increases by +15',
                  penaltyToPlayerIfTrapped: 'Adversary gains defensive fortification divisions'
                });
              }
            }
          })
        );
      },

      injectBait: (hp) => {
        set(produce((draft: MirrorAdaptationState) => {
          draft.honeypots.push(hp);
        }));
      },

      registerInfluenceOp: (campaignId: string) => {
         // Mirror records that player is running PSYOP influence
         get().recordPlayerAction('COVERT', 3);
         set(produce((draft: MirrorAdaptationState) => {
            // Build counter-profiling or awareness of player's narrative strategy
            // e.g. increase difficulty or counter-measures
         }));
      },

      registerCIAPatterns: (mostTargetedNation: string, mostUsedOpType: string, avgHeat: number) => {
         set(produce((draft: MirrorAdaptationState) => {
            draft.habits.push({
               habitId: `cia_pattern_${Date.now()}`,
               actionCategory: 'COVERT',
               triggerStatus: mostTargetedNation,
               frequencyCount: Math.ceil(avgHeat),
               lastTickSeen: 0,
               stabilityScore: Math.min(100, Math.ceil(avgHeat + 20))
            });
            // Keep habits capped
            if (draft.habits.length > 20) draft.habits.shift();
         }));
      },

      sovereign_initAgent: (nationId, identity, leaderProfileData, currentTick) => {
        set(produce((draft: any) => {
          const leader = { id: `leader_${nationId}_${currentTick}`, ...leaderProfileData } as SovereignLeaderProfile;
          draft.sovereign_leaderProfiles[leader.id] = leader;
          
          const agent: SovereignAgent = {
            id: `agent_${nationId}_${currentTick}`,
            nationId,
            powerOrientation: identity.powerOrientation,
            ideologicalPosture: identity.ideologicalPosture,
            economicDoctrine: identity.economicDoctrine,
            riskTolerance: identity.riskTolerance,
            regionalAmbition: identity.regionalAmbition,
            leaderProfile: leader,
            activeObjectives: [],
            completedObjectives: [],
            decisionHistory: [],
            threatAssessments: [],
            intelBudgetAllocation: {
              MILITARY_BUILDUP: 10, ECONOMIC_COERCION: 10, DIPLOMATIC_PRESSURE: 20, COVERT_OPERATION: 20,
              PROXY_FORCE: 5, ALLIANCE_ACTIVATION: 10, INFORMATION_WARFARE: 10, SANCTIONS: 5,
              TRADE_DEAL: 5, ARMS_TRANSFER: 0, FOREIGN_AID: 5, EW_CAMPAIGN: 0, NUCLEAR_SIGNALLING: 0
            },
            relationshipMemory: [],
            currentMilitaryPosture: 'PEACETIME',
            currentDiplomaticPosture: 'ENGAGEMENT',
            currentEconomicPosture: 'OPEN',
            allianceIds: [],
            allianceSignalsSent: [],
            allianceSignalsReceived: [],
            mirrorAdaptationScore: 0,
            tacticsAdaptedThisTick: [],
            lastProcessedTick: currentTick,
            ticksActive: 0
          };
          agent.activeObjectives = sovereign_generateInitialObjectives(agent, currentTick);
          
          // Initial threat assessments
          const world = useWorldStore.getState().countries;
          Object.keys(world).forEach(id => {
            if (id !== nationId) {
               agent.threatAssessments.push({
                 assessingNationId: nationId,
                 targetNationId: id,
                 overallThreatScore: 10,
                 militaryThreatScore: 10,
                 economicThreatScore: 10,
                 intelligenceThreatScore: 0,
                 covertThreatScore: 0,
                 ideologicalThreatScore: 10,
                 lastUpdatedTick: currentTick,
                 trendDirection: 'STABLE',
                 responseUrgency: 'NONE'
               });
            }
          });

          draft.sovereign_agents[nationId] = agent;
        }));
      },

      sovereign_updateAgentObjective: (nationId, objectiveId, update) => {
        set(produce((draft: any) => {
          const agent = draft.sovereign_agents[nationId];
          if (!agent) return;
          const obj = agent.activeObjectives.find((o: any) => o.id === objectiveId);
          if (obj) {
            Object.assign(obj, update);
            if (obj.isAchieved && obj.progressScore >= 100) {
              agent.completedObjectives.push(obj);
              agent.activeObjectives = agent.activeObjectives.filter((o: any) => o.id !== objectiveId);
            }
          }
        }));
      },

      sovereign_recordDecision: (nationId, decision, currentTick) => {
        set(produce((draft: any) => {
          const agent = draft.sovereign_agents[nationId];
          if (!agent) return;
          const newDecision: SovereignDecision = { id: `dec_${nationId}_${currentTick}_${Math.random().toString(36).substring(7)}`, decidedAtTick: currentTick, ...decision };
          agent.decisionHistory.unshift(newDecision);
          if (agent.decisionHistory.length > 50) agent.decisionHistory.pop();
          draft.sovereign_globalDecisionLog.unshift(newDecision);
          if (draft.sovereign_globalDecisionLog.length > 200) draft.sovereign_globalDecisionLog.pop();
        }));
      },

      sovereign_updateThreatAssessment: (assessingNationId, targetNationId, update) => {
        set(produce((draft: any) => {
          const agent = draft.sovereign_agents[assessingNationId];
          if (!agent) return;
          const ta = agent.threatAssessments.find((t: any) => t.targetNationId === targetNationId);
          if (ta) {
            Object.assign(ta, update);
          } else {
            agent.threatAssessments.push({
               assessingNationId,
               targetNationId,
               overallThreatScore: 0,
               militaryThreatScore: 0,
               economicThreatScore: 0,
               intelligenceThreatScore: 0,
               covertThreatScore: 0,
               ideologicalThreatScore: 0,
               lastUpdatedTick: 0,
               trendDirection: 'STABLE',
               responseUrgency: 'NONE',
               ...update
            });
          }
        }));
      },

      sovereign_sendAllianceSignal: (signal, currentTick) => {
        set(produce((draft: any) => {
          const sig: SovereignAllianceSignal = { id: `sig_${currentTick}_${Math.random().toString(36).substring(7)}`, sentAtTick: currentTick, ...signal };
          draft.sovereign_allianceSignals.push(sig);
          const agentFrom = draft.sovereign_agents[signal.fromNationId];
          const agentTo = draft.sovereign_agents[signal.toNationId];
          if (agentFrom) agentFrom.allianceSignalsSent.push(sig);
          if (agentTo) agentTo.allianceSignalsReceived.push(sig);
        }));
      },

      mirror_updatePlayerProfile: (update) => {
        set(produce((draft: any) => {
          if (!draft.mirror_playerProfile) {
             draft.mirror_playerProfile = {
               playerNationId: 'US',
               observedSince: 0,
               preferredDomains: [],
               preferredTargetNations: [],
               operationalTempo: 50,
               escalationThreshold: 50,
               riskProfile: 'CALCULATED',
               sigintFocusNations: [],
               ciaFocusNations: [],
               ewFocusNations: [],
               militaryPosturePattern: 'DEFENSIVE',
               identifiedWeaknesses: [],
               predictedNextMoves: [],
               modelConfidence: 0,
               lastUpdatedTick: 0,
               ...update
             };
          } else {
             Object.assign(draft.mirror_playerProfile, update);
          }
        }));
      },

      mirror_ingestCIAPattern: (focusNations, operationTypes, currentTick) => {
        set(produce((draft: any) => {
          if (draft.mirror_playerProfile) {
            draft.mirror_playerProfile.ciaFocusNations = focusNations;
            if (!draft.mirror_playerProfile.preferredDomains.includes('COVERT_OPERATION')) {
              draft.mirror_playerProfile.preferredDomains.push('COVERT_OPERATION');
            }
            draft.mirror_playerProfile.lastUpdatedTick = currentTick;
          }
        }));
      },

      mirror_ingestSIGINTPattern: (focusNations, currentTick) => {
        set(produce((draft: any) => {
          if (draft.mirror_playerProfile) {
            draft.mirror_playerProfile.sigintFocusNations = focusNations;
            draft.mirror_playerProfile.lastUpdatedTick = currentTick;
          }
        }));
      },

      mirror_ingestEWPattern: (focusNations, currentTick) => {
        set(produce((draft: any) => {
          if (draft.mirror_playerProfile) {
            draft.mirror_playerProfile.ewFocusNations = focusNations;
            if (!draft.mirror_playerProfile.preferredDomains.includes('EW_CAMPAIGN')) {
              draft.mirror_playerProfile.preferredDomains.push('EW_CAMPAIGN');
            }
            draft.mirror_playerProfile.lastUpdatedTick = currentTick;
          }
        }));
      },

      sovereign_processAllAgentsTick: (currentTick) => {
        const state = get() as any;
        if (state.sovereign_lastProcessedTick === currentTick) return; // Idempotency
        
        const worldState = useWorldStore.getState();
        const sigintState = useSigintStore.getState();
        const arachneState = useArachneStore.getState();
        const finintState = useFinintStore.getState();
        const ciaState = useCiaStore.getState();
        const defconState = useDefconStore.getState();
        const militaryState = useMilitaryStore.getState();
        // diplomaticStore doesn't exist, use unStore or treaties? Just assume worldState info can serve.
        const economyState = useEconomyStore.getState();
        const ewState = useEWStore.getState();
        const playerState = useWorldStore.getState(); // or playerStore, let's use worldStore to infer player nation
        
        const playerNationId = "US"; // Assuming US for now based on usual setup

        set(produce((draft: any) => {
          // Sync mirror profile slowly if it exists
          if (!draft.mirror_playerProfile) {
            draft.mirror_updatePlayerProfile({ observedSince: currentTick, lastUpdatedTick: currentTick });
          } else {
            draft.mirror_playerProfile.modelConfidence = Math.min(100, draft.mirror_playerProfile.modelConfidence + 0.1);
            draft.mirror_playerProfile.predictedNextMoves = mirror_predictPlayerNextMoves(draft.mirror_playerProfile, currentTick);
            draft.mirror_playerProfile.identifiedWeaknesses = mirror_identifyPlayerWeaknesses(draft.mirror_playerProfile, worldState, currentTick);
            draft.mirror_playerProfile.lastUpdatedTick = currentTick;
          }

          const advMsgs: string[] = [];

          // Sort agents by risk tolerance (reckless first)
          const riskOrd: Record<SovereignRiskTolerance, number> = {
            'RECKLESS': 1, 'AGGRESSIVE': 2, 'CALCULATED': 3, 'CAUTIOUS': 4, 'RISK_AVERSE': 5
          };
          
          const agentIds = Object.keys(draft.sovereign_agents).sort((a,b) => 
            riskOrd[draft.sovereign_agents[a].riskTolerance as SovereignRiskTolerance] - 
            riskOrd[draft.sovereign_agents[b].riskTolerance as SovereignRiskTolerance]
          );

          let newDecisionsCount = 0;
          let nuclearSignalled = false;
          let emergentCrisesCount = 0;

          for (const nid of agentIds) {
            const agent = draft.sovereign_agents[nid];
            agent.ticksActive++;

            // Update threat assessments
            Object.keys(worldState.countries).forEach(tid => {
              if (tid === nid) return;
              const target = worldState.countries[tid];
              let rawThreat = 0;
              if (target.arsenal?.units?.some((u: any) => u.count > 0 && u.type !== 'AIR_DEFENSE')) rawThreat += 20;
              const hasEconSanction = economyState.activeSanctions?.some((s: any) => s.sourceId === tid && s.targetId === nid);
              if (hasEconSanction) rawThreat += 30;
              const ciaOps = ciaState.cia_operations?.filter((op: any) => op.targetNationId === nid && op.status === 'ACTIVE' && op.assignedOperativeIds.length > 0) || [];
              if (ciaOps.length > 0) rawThreat += 20 * ciaOps.length;
              
              const isDiffIdeology = target.political?.ideology !== agent.ideologicalPosture;
              if (isDiffIdeology) rawThreat += 10;
              
              const effectiveThreat = rawThreat * (1 + (agent.leaderProfile.paranoidModifier / 100));
              let ta = agent.threatAssessments.find((t: any) => t.targetNationId === tid);
              if (!ta) {
                ta = { assessingNationId: nid, targetNationId: tid, overallThreatScore: effectiveThreat, militaryThreatScore: 0, economicThreatScore: 0, intelligenceThreatScore: 0, covertThreatScore: 0, ideologicalThreatScore: 0, lastUpdatedTick: currentTick, trendDirection: 'STABLE', responseUrgency: 'NONE' };
                agent.threatAssessments.push(ta);
              }
              const oldScore = ta.overallThreatScore;
              ta.overallThreatScore = effectiveThreat;
              ta.trendDirection = effectiveThreat > oldScore + 5 ? 'ESCALATING' : (effectiveThreat < oldScore - 5 ? 'DE_ESCALATING' : 'STABLE');
              ta.responseUrgency = effectiveThreat > 75 ? 'IMMEDIATE' : effectiveThreat > 50 ? 'SHORT_TERM' : effectiveThreat > 25 ? 'LONG_TERM' : 'NONE';
              ta.lastUpdatedTick = currentTick;
            });

            // Refill objectives if needed
            if (agent.activeObjectives.length < 3) {
              const newObjs = sovereign_generateInitialObjectives(agent, currentTick);
              for (const o of newObjs) {
                if (agent.activeObjectives.length < 3) agent.activeObjectives.push(o);
              }
            }

            // Decide instruments using pure decision engines synced with SovereignAgentState
            let actionTaken = false;
            for (const obj of agent.activeObjectives) {
              if (actionTaken) break;

              const fullSovereignAgent = useSovereignStore.getState().sovereignStates[nid];
              let triggerAction = Math.random() < 0.15; // default fallback probability

              let trigger = { shouldReplan: false, type: 'SOFT_UPDATE', reason: '' };
              let esc: EscalationDecision = { shouldEscalate: false, shouldDeEscalate: false, rationale: '' };

              if (fullSovereignAgent) {
                // 1. Evaluate Replanning trigger
                trigger = evaluateReplanTrigger(fullSovereignAgent, worldState, defconState.currentDefconLevel);
                
                // 2. Evaluate Escalation status
                esc = evaluateEscalation(fullSovereignAgent, worldState, defconState.currentDefconLevel);

                if (trigger.shouldReplan || esc.shouldEscalate || esc.shouldDeEscalate) {
                  triggerAction = true;
                } else {
                  triggerAction = Math.random() < 0.08 || (fullSovereignAgent.planExecution.isActive && currentTick % 4 === 0);
                }
              }

              if (triggerAction) {
                let chosenInst: SovereignInstrument = 'DIPLOMATIC_PRESSURE';
                let rationale = '';

                const activePlan = fullSovereignAgent?.activePlan;
                const currentStepIndex = fullSovereignAgent?.planExecution.currentStepIndex;
                const activeStep = activePlan && typeof currentStepIndex === 'number' && currentStepIndex < activePlan.steps.length
                  ? activePlan.steps[currentStepIndex]
                  : null;

                if (esc.shouldEscalate && esc.escalationInstrument) {
                  chosenInst = esc.escalationInstrument;
                  rationale = `Escalation Overrides triggered: ${esc.rationale}`;
                } else if (esc.shouldDeEscalate && esc.deEscalationInstrument) {
                  chosenInst = esc.deEscalationInstrument;
                  rationale = `De-escalation Overrides triggered: ${esc.rationale}`;
                } else if (activeStep) {
                  // Synchronize with active step action type mapping
                  const mapped: Record<string, SovereignInstrument> = {
                    'SHIFT_MILITARY_POSTURE': 'MILITARY_BUILDUP',
                    'MOBILIZE_COVERT_ASSETS': 'COVERT_OPERATION',
                    'BUILD_ECONOMIC_LEVERAGE': 'ECONOMIC_COERCION',
                    'SIGNAL_CONCILIATION': 'DIPLOMATIC_PRESSURE',
                    'CULTIVATE_ALLIANCE': 'DIPLOMATIC_PRESSURE',
                    'TEST_RED_LINES': 'MILITARY_BUILDUP',
                    'PREPARE_SANCTIONS': 'ECONOMIC_COERCION',
                    'DEESCALATE_BUY_TIME': 'DIPLOMATIC_PRESSURE'
                  };
                  chosenInst = mapped[activeStep.actionType] || 'DIPLOMATIC_PRESSURE';
                  rationale = `Executing active step of strategic plan "${activePlan.title}": ${activeStep.description}`;
                } else {
                  // Fallback based on baseline country attributes
                  if (agent.leaderProfile.archetype === 'MILITARY_HAWK' || agent.riskTolerance === 'RECKLESS') {
                    chosenInst = Math.random() > 0.5 ? 'MILITARY_BUILDUP' : 'COVERT_OPERATION';
                  } else if (agent.economicDoctrine === 'MERCANTILIST' || agent.leaderProfile.archetype === 'PRAGMATIC_TECHNOCRAT') {
                    chosenInst = Math.random() > 0.5 ? 'ECONOMIC_COERCION' : 'TRADE_DEAL';
                  }
                  rationale = `Strategically advancing national interests.`;
                }

                const targetId = activeStep?.targetCountryId || (fullSovereignAgent?.goalStack.activeGoals[0]?.targetCountryId) || playerNationId;

                // Adapt to predictions from Mirror AI user profile
                const predictedNext = draft.mirror_playerProfile?.predictedNextMoves || [];
                let adapted = false;
                if (predictedNext.includes('MILITARY') && (chosenInst === 'COVERT_OPERATION' || chosenInst === 'MILITARY_BUILDUP')) {
                  adapted = true;
                  agent.mirrorAdaptationScore = Math.min(100, agent.mirrorAdaptationScore + 5);
                  advMsgs.push(`Mirror adaptive defense: ${nid} executes counter-actions preparing for predicted player military initiatives.`);
                  rationale += ` (Adapted based on Mirror AI predictive model: Counter-MILITARY readiness activated.)`;
                }

                const newDecision: SovereignDecision = {
                  id: `dec_${nid}_${currentTick}_${Math.random().toString(36).substring(7)}`,
                  nationId: nid,
                  decidedAtTick: currentTick,
                  triggerEventId: null,
                  instrument: chosenInst,
                  targetNationId: targetId,
                  rationale,
                  expectedOutcome: `Advance objective ${obj.type}`,
                  actualOutcome: null,
                  successScore: null,
                  wasAdaptedFromMirror: adapted
                };

                agent.decisionHistory.unshift(newDecision);
                if (agent.decisionHistory.length > 50) agent.decisionHistory.pop();
                draft.sovereign_globalDecisionLog.unshift(newDecision);
                if (draft.sovereign_globalDecisionLog.length > 200) draft.sovereign_globalDecisionLog.pop();

                newDecisionsCount++;
                actionTaken = true;

                obj.progressScore = Math.min(100, obj.progressScore + 5);
                if (!obj.instrumentsInUse.includes(chosenInst)) obj.instrumentsInUse.push(chosenInst);

                // Apply to worldStore
                if (chosenInst === 'NUCLEAR_SIGNALLING' && worldState.countries[nid]?.arsenal?.nuclearCapable) {
                  nuclearSignalled = true;
                  worldState.addGlobalEvent(`[SOVEREIGN_AI] ${nid} engaged in nuclear signalling against ${targetId}!`, 'CRITICAL');
                  useDefconStore.getState().setDefconLevel(Math.max(1, defconState.currentDefconLevel - 1) as any, 'SYSTEM', 'AI Nuclear Signal', currentTick);
                } else if (chosenInst === 'MILITARY_BUILDUP') {
                  worldState.addGlobalEvent(`[SOVEREIGN_AI] ${nid} announces military buildup.`, 'WARNING');
                } else if (chosenInst === 'DIPLOMATIC_PRESSURE') {
                  worldState.addGlobalEvent(`[SOVEREIGN_AI] ${nid} applies diplomatic pressure on ${targetId}.`, 'INFO');
                } else if (chosenInst === 'ECONOMIC_COERCION') {
                  worldState.addGlobalEvent(`[SOVEREIGN_AI] ${nid} deploys economic coercion against ${targetId}.`, 'WARNING');
                  economyState.imposeSanction(nid, targetId);
                } else if (chosenInst === 'COVERT_OPERATION') {
                  useConsequenceStore.getState().triggerBlowback(targetId, 20, `AI Covert Operation from ${nid}`);
                }
              }
            }

            // Domestic approval changes over time
            if (agent.leaderProfile.yearsInPower > 10 && currentTick % 100 === 0) {
              agent.leaderProfile.domesticApprovalScore -= 0.5;
            }
            if (agent.leaderProfile.domesticApprovalScore <= 20) {
               useCinematicsStore.getState().triggerCinematic('SOVEREIGN_LEADERSHIP_CRISIS', {});
            }
          }

          // Crises Emergent mapping
          const hExpansions = agentIds.filter(id => draft.sovereign_agents[id].activeObjectives.some((o:any)=>o.type==='TERRITORIAL_EXPANSION'));
          if (hExpansions.length > 1 && Math.random() < 0.02) {
             draft.sovereign_crisesEmergent.push(`crisis_${hExpansions[0]}_${hExpansions[1]}_${currentTick}`);
             emergentCrisesCount++;
          }

          if (advMsgs.length > 0) {
            draft.mirror_advisoryLog.unshift(...advMsgs);
            if (draft.mirror_advisoryLog.length > 50) draft.mirror_advisoryLog.length = 50;
          }

          draft.sovereign_lastProcessedTick = currentTick;

          let aggregateTension = newDecisionsCount * 5 + emergentCrisesCount * 15;
          if (nuclearSignalled) aggregateTension += 30;

          if (aggregateTension > 20) {
            useWorldStore.getState().addGlobalEvent(`[SOVEREIGN_AI] Global tension surge detected (Tension Coax: +${aggregateTension}) due to aggregate strategic shifts.`, 'WARNING');
          }

          // Process cinematics
          if (newDecisionsCount > 0 && draft.sovereign_globalDecisionLog.length === newDecisionsCount) {
             useCinematicsStore.getState().triggerCinematic('SOVEREIGN_FIRST_AGENT_DECISION', {});
          }
          if (nuclearSignalled) {
             useCinematicsStore.getState().triggerCinematic('SOVEREIGN_NUCLEAR_SIGNAL', {});
          }
          if (emergentCrisesCount > 0) {
             useCinematicsStore.getState().triggerCinematic('SOVEREIGN_EMERGENT_CRISIS', {});
          }

        }));
      },

      sovereign_getAgent: (nationId) => get().sovereign_agents[nationId] || null,
      sovereign_getAgentObjectives: (nationId) => get().sovereign_agents[nationId]?.activeObjectives || [],
      sovereign_getThreatAssessment: (assessingNationId, targetNationId) => {
        const agent = get().sovereign_agents[assessingNationId];
        return agent ? agent.threatAssessments.find((t: any) => t.targetNationId === targetNationId) || null : null;
      },
      sovereign_getMirrorAdvisory: () => get().mirror_advisoryLog,
      sovereign_getDecisionsThisTick: (tick) => get().sovereign_globalDecisionLog.filter((d: any) => d.decidedAtTick === tick),
      sovereign_getActiveConflicts: () => get().sovereign_activeConflicts,

    }),
    {
      name: 'sovereign_command_mirror_adaptation_v1',
      partialize: (state) => ({
        profile: state.profile,
        fingerprint: state.fingerprint,
        habits: state.habits,
        preferenceModel: state.preferenceModel,
        riskPattern: state.riskPattern,
        tempo: state.tempo,
        escalationPattern: state.escalationPattern,
        toolBias: state.toolBias,
        baitSusceptibility: state.baitSusceptibility,
        memories: state.memories,
        confidence: state.confidence,
        stability: state.stability,
        counterHistory: state.counterHistory,
        warningLevel: state.warningLevel,
        difficultySetting: state.difficultySetting,
        learningSpeedMultiplier: state.learningSpeedMultiplier,
        confrontationPlayed: state.confrontationPlayed,
      }),
    }
  )
);
