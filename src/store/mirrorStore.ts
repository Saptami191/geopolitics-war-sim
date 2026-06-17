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
  MirrorWarningLevel
} from '../types/mirror';

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
  resetMirrorStore: () => void;
  triggerDriftRecalibration: () => void;
  tickMirrorState: (currentTick: number) => void;
  injectBait: (bait: HoneypotOpportunity) => void;
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

export const useMirrorStore = create<MirrorAdaptationState & MirrorActions>()(
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
        generalConfidence: 20,
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

      // Actions & Methods
      setDifficulty: (level) => {
        let mult = 1.0;
        if (level === 'EASY') mult = 0.5;
        if (level === 'HARD') mult = 1.6;
        if (level === 'NIGHTMARE') mult = 2.4;
        set({ difficultySetting: level, learningSpeedMultiplier: mult });
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
            generalConfidence: 20,
            historyScaleTicks: 1,
            relearningActive: false,
          },
          stability: {
            coreStability: 85,
            driftDetected: false,
          },
          counterHistory: [],
          warningLevel: 'LOW'
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
      }
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
      }),
    }
  )
);
