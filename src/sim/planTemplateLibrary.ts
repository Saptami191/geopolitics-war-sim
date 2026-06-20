import {
  StrategicGoalClass,
  PlanStepAction,
  PlanStep,
  SecurityDoctrineTendency,
  SovereignRiskTolerance
} from '../types';

export interface PlanTemplateDefinition {
  templateId: string;
  title: string;
  targetGoalClasses: StrategicGoalClass[];
  requiredSecurityTendency?: SecurityDoctrineTendency[];
  requiredRiskTolerance?: SovereignRiskTolerance[];
  steps: Omit<PlanStep, 'executionProgressTicks' | 'completed'>[];
  escalationRisk: number; // 0-100
  secrecyScore: number;   // 0-100
  fallbackActionType: PlanStepAction;
}

export const PLAN_TEMPLATE_LIBRARY: PlanTemplateDefinition[] = [
  {
    templateId: 'PROXY_ESCALATION_LADDER',
    title: 'Covert Proxy Escalation Ladder',
    targetGoalClasses: ['COVERT_PREPARATION', 'PROXY_ESCALATION'],
    requiredSecurityTendency: ['PROXY_COMPETITION', 'STRATEGIC_AMBIGUITY', 'FORWARD_DEFENSE'],
    requiredRiskTolerance: ['CALCULATED', 'AGGRESSIVE', 'RECKLESS'],
    steps: [
      {
        stepIndex: 1,
        actionType: 'MOBILIZE_COVERT_ASSETS',
        description: 'Establish supply lines and activate local cells in regional conflict zones.',
        durationTicks: 3
      },
      {
        stepIndex: 2,
        actionType: 'DISINFORMATION_INTELLIGENCE',
        description: 'Saturate tactical communications channels with conflicting intelligence signals.',
        durationTicks: 2
      },
      {
        stepIndex: 3,
        actionType: 'TEST_RED_LINES',
        description: 'Conduct probe maneuvers utilizing local militia and proxy brigades.',
        durationTicks: 3
      }
    ],
    escalationRisk: 65,
    secrecyScore: 80,
    fallbackActionType: 'DEESCALATE_BUY_TIME'
  },
  {
    templateId: 'ECONOMIC_SIEGE_ARCHITECTURE',
    title: 'Asymmetrical Economic Siege',
    targetGoalClasses: ['ECONOMIC_RECOVERY', 'ADVERSARY_WEAKENING'],
    requiredSecurityTendency: ['FORWARD_DEFENSE', 'DETERRENCE_HEAVY'],
    steps: [
      {
        stepIndex: 1,
        actionType: 'BUILD_ECONOMIC_LEVERAGE',
        description: 'Reroute critical supply chains and accumulate secondary currency assets.',
        durationTicks: 3
      },
      {
        stepIndex: 2,
        actionType: 'EXPLOIT_MARKET_DEPENDENCY',
        description: 'Constrain exports of key semiconductor raw materials and critical refining parts.',
        durationTicks: 4
      },
      {
        stepIndex: 3,
        actionType: 'PREPARE_SANCTIONS',
        description: 'Deploy aggressive targeted asset bans on strategic adversary industrial networks.',
        durationTicks: 3
      }
    ],
    escalationRisk: 40,
    secrecyScore: 45,
    fallbackActionType: 'SIGNAL_CONCILIATION'
  },
  {
    templateId: 'NUCLEAR_COERCION_DANCE',
    title: 'Heavy Nuclear Deterrence Signal',
    targetGoalClasses: ['DETERRENCE', 'SURVIVAL'],
    requiredSecurityTendency: ['ESCALATION_DOMINANCE', 'DETERRENCE_HEAVY'],
    requiredRiskTolerance: ['AGGRESSIVE', 'RECKLESS'],
    steps: [
      {
        stepIndex: 1,
        actionType: 'SHIFT_MILITARY_POSTURE',
        description: 'Activate regional nuclear division relays and reposition ballistic missile launch subs.',
        durationTicks: 2
      },
      {
        stepIndex: 2,
        actionType: 'TEST_RED_LINES',
        description: 'Conduct unannounced dual-capable missile firing drills inside bordering maritime basins.',
        durationTicks: 3
      },
      {
        stepIndex: 3,
        actionType: 'SHIFT_MILITARY_POSTURE',
        description: 'Increase strategic nuclear alert parameters across central heavy bomber silos.',
        durationTicks: 3
      }
    ],
    escalationRisk: 90,
    secrecyScore: 10,
    fallbackActionType: 'DEESCALATE_BUY_TIME'
  },
  {
    templateId: 'INFORMATION_SATURATION_CAMPAIGN',
    title: 'Hybrid Information Saturation',
    targetGoalClasses: ['SOFT_POWER_ACCUMULATION', 'INFORMATION_SATURATION'],
    steps: [
      {
        stepIndex: 1,
        actionType: 'DISINFORMATION_INTELLIGENCE',
        description: 'Deploy deepfake media cycles highlighting systemic elite instability in target areas.',
        durationTicks: 3
      },
      {
        stepIndex: 2,
        actionType: 'DIPLOMATIC_PRESSURE',
        description: 'Sponsor dedicated multilateral motions in human rights structures.',
        durationTicks: 3
      },
      {
        stepIndex: 3,
        actionType: 'SIGNAL_CONCILIATION',
        description: 'Issue grand proposal for high-visibility dialogue on structural communications standards.',
        durationTicks: 2
      }
    ],
    escalationRisk: 20,
    secrecyScore: 75,
    fallbackActionType: 'SIGNAL_CONCILIATION'
  },
  {
    templateId: 'DIPLOMATIC_ISOLATION_MANEUVER',
    title: 'Multilateral Diplomatic Isolation',
    targetGoalClasses: ['ADVERSARY_WEAKENING', 'PRESTIGE'],
    steps: [
      {
        stepIndex: 1,
        actionType: 'DIPLOMATIC_PRESSURE',
        description: 'Lobby non-aligned treaty signatures to actively freeze formal adversary state ties.',
        durationTicks: 3
      },
      {
        stepIndex: 2,
        actionType: 'CULTIVATE_ALLIANCE',
        description: 'Establish new dedicated intelligence pool with flanking peripheral partners.',
        durationTicks: 4
      },
      {
        stepIndex: 3,
        actionType: 'PREPARE_SANCTIONS',
        description: 'Implement co-sponsored global trade blockades restricting high-tech microelectronics.',
        durationTicks: 3
      }
    ],
    escalationRisk: 30,
    secrecyScore: 30,
    fallbackActionType: 'DEESCALATE_BUY_TIME'
  },
  {
    templateId: 'INTERNAL_CONSOLIDATION_PURGE',
    title: 'Regime Survival Consolidation',
    targetGoalClasses: ['REGIME_STABILIZATION', 'INTERNAL_CONSOLIDATION', 'SURVIVAL'],
    requiredSecurityTendency: ['INTERNAL_SECURITY_FIRST', 'FORTRESS_DEFENSE'],
    steps: [
      {
        stepIndex: 1,
        actionType: 'MOBILIZE_COVERT_ASSETS',
        description: 'Initiate defensive checks on potential disloyal cabinet members and cabinet factions.',
        durationTicks: 4
      },
      {
        stepIndex: 2,
        actionType: 'DEESCALATE_BUY_TIME',
        description: 'Provide state-subsidized currency adjustments to lower consumer unrest vectors quickly.',
        durationTicks: 3
      },
      {
        stepIndex: 3,
        actionType: 'SHIFT_MILITARY_POSTURE',
        description: 'Reposition domestic military reserves closer to regional flashpoint urban center nodes.',
        durationTicks: 3
      }
    ],
    escalationRisk: 15,
    secrecyScore: 90,
    fallbackActionType: 'DEESCALATE_BUY_TIME'
  },
  {
    templateId: 'BORDER_CREEP_FAIT_ACCOMPLI',
    title: 'Border Creep Fait Accompli',
    targetGoalClasses: ['REGIONAL_DOMINANCE', 'BORDER_EXPANSION'],
    requiredSecurityTendency: ['FORWARD_DEFENSE', 'ESCALATION_DOMINANCE', 'EXPEDITIONARY_INTERVENTIONISM'],
    steps: [
      {
        stepIndex: 1,
        actionType: 'SHIFT_MILITARY_POSTURE',
        description: 'Assemble border garrison armor elements under cover of routine annual defense tests.',
        durationTicks: 4
      },
      {
        stepIndex: 2,
        actionType: 'TEST_RED_LINES',
        description: 'Relocate defense markers forward across designated uninhabited valley zones.',
        durationTicks: 3
      },
      {
        stepIndex: 3,
        actionType: 'MOBILIZE_COVERT_ASSETS',
        description: 'Fund local proxy administrators to formalize defensive integration files.',
        durationTicks: 3
      }
    ],
    escalationRisk: 75,
    secrecyScore: 50,
    fallbackActionType: 'DEESCALATE_BUY_TIME'
  },
  {
    templateId: 'TECHNOLOGY_DENIAL_CAMPAIGN',
    title: 'High-Tech Trade Denial Campaign',
    targetGoalClasses: ['TECHNOLOGICAL_CATCH_UP'],
    steps: [
      {
        stepIndex: 1,
        actionType: 'BUILD_ECONOMIC_LEVERAGE',
        description: 'Restrict essential sovereign lithium and palladium flows to overseas tech markets.',
        durationTicks: 3
      },
      {
        stepIndex: 2,
        actionType: 'MOBILIZE_COVERT_ASSETS',
        description: 'Deploy corporate espionage channels to retrieve design schematics for sub-10nm fabrication.',
        durationTicks: 4
      },
      {
        stepIndex: 3,
        actionType: 'DIPLOMATIC_PRESSURE',
        description: 'Pressure intermediary tech producers to cancel planned high-end component transfers.',
        durationTicks: 3
      }
    ],
    escalationRisk: 35,
    secrecyScore: 65,
    fallbackActionType: 'SIGNAL_CONCILIATION'
  },
  {
    templateId: 'STANDARD_ALLIANCE_PRESERVATION',
    title: 'Protector Alliance Preservation',
    targetGoalClasses: ['ALLIANCE_PRESERVATION'],
    steps: [
      {
        stepIndex: 1,
        actionType: 'SIGNAL_CONCILIATION',
        description: 'Offer mutual security coordinates and issue guarantees to regional buffer allies.',
        durationTicks: 3
      },
      {
        stepIndex: 2,
        actionType: 'CULTIVATE_ALLIANCE',
        description: 'Consolidate treaty structures with joint command maneuvers and logistics sharing.',
        durationTicks: 3
      },
      {
        stepIndex: 3,
        actionType: 'DIPLOMATIC_PRESSURE',
        description: 'Demand member-states expand defense outlays to meet core collective targets.',
        durationTicks: 2
      }
    ],
    escalationRisk: 10,
    secrecyScore: 20,
    fallbackActionType: 'SIGNAL_CONCILIATION'
  },
  {
    templateId: 'SANCTIONS_RELIEF_MANEUVER',
    title: 'Sanctions Relief Negotiation',
    targetGoalClasses: ['SANCTIONS_RELIEF'],
    steps: [
      {
        stepIndex: 1,
        actionType: 'SIGNAL_CONCILIATION',
        description: 'Signal structural openness to monitor weapons systems if economic barriers drop.',
        durationTicks: 3
      },
      {
        stepIndex: 2,
        actionType: 'BUILD_ECONOMIC_LEVERAGE',
        description: 'Secure illicit export pathways via maritime transport nodes and shadow fleets.',
        durationTicks: 3
      },
      {
        stepIndex: 3,
        actionType: 'DIPLOMATIC_PRESSURE',
        description: 'Exert direct pressure on third-party traders to challenge external sanction legality.',
        durationTicks: 2
      }
    ],
    escalationRisk: 15,
    secrecyScore: 40,
    fallbackActionType: 'SIGNAL_CONCILIATION'
  },
  {
    templateId: 'MILITARY_BUILDUP_CRISIS',
    title: 'Crisis Force Mobilization',
    targetGoalClasses: ['MILITARY_BUILDUP'],
    steps: [
      {
        stepIndex: 1,
        actionType: 'SHIFT_MILITARY_POSTURE',
        description: 'Ramp factory shifts for ballistic munitions and authorize secondary recruitment rounds.',
        durationTicks: 4
      },
      {
        stepIndex: 2,
        actionType: 'BUILD_ECONOMIC_LEVERAGE',
        description: 'Nationalize critical deep-water ports to consolidate supply handling.',
        durationTicks: 3
      },
      {
        stepIndex: 3,
        actionType: 'SHIFT_MILITARY_POSTURE',
        description: 'Reposition fleet components to forward staging and patrol coordinates.',
        durationTicks: 4
      }
    ],
    escalationRisk: 55,
    secrecyScore: 25,
    fallbackActionType: 'DEESCALATE_BUY_TIME'
  },
  {
    templateId: 'SURVIVAL_EMERGENCY_MOBILIZATION',
    title: 'Sovereign Survival Mobilization',
    targetGoalClasses: ['SURVIVAL'],
    steps: [
      {
        stepIndex: 1,
        actionType: 'DEESCALATE_BUY_TIME',
        description: 'Propose temporary global truce sessions while reinforcing core interior lines.',
        durationTicks: 3
      },
      {
        stepIndex: 2,
        actionType: 'SHIFT_MILITARY_POSTURE',
        description: 'Mobilize all heavy strategic reserves and place nuclear intercept systems on prime alert.',
        durationTicks: 4
      },
      {
        stepIndex: 3,
        actionType: 'CULTIVATE_ALLIANCE',
        description: 'Request immediate direct military hardware drops from primary defense sponsors.',
        durationTicks: 3
      }
    ],
    escalationRisk: 45,
    secrecyScore: 30,
    fallbackActionType: 'DEESCALATE_BUY_TIME'
  },
  {
    templateId: 'PRESTIGE_PROJECTS',
    title: 'International Prestige Enhancement',
    targetGoalClasses: ['PRESTIGE'],
    steps: [
      {
        stepIndex: 1,
        actionType: 'SIGNAL_CONCILIATION',
        description: 'Host international technological forum highlighting next-generation atomic energy builds.',
        durationTicks: 3
      },
      {
        stepIndex: 2,
        actionType: 'CULTIVATE_ALLIANCE',
        description: 'Extend comprehensive low-interest credits to emerging oceanic and space exploration bodies.',
        durationTicks: 4
      },
      {
        stepIndex: 3,
        actionType: 'BUILD_ECONOMIC_LEVERAGE',
        description: 'Finalize transnational high-speed rail links connecting key non-aligned central capital cities.',
        durationTicks: 3
      }
    ],
    escalationRisk: 10,
    secrecyScore: 15,
    fallbackActionType: 'SIGNAL_CONCILIATION'
  },
  {
    templateId: 'TERRITORIAL_DEFENSE_PLAN',
    title: 'Strategic Territorial Defense Shield',
    targetGoalClasses: ['TERRITORIAL_DEFENSE'],
    steps: [
      {
        stepIndex: 1,
        actionType: 'SHIFT_MILITARY_POSTURE',
        description: 'Lay modern anti-aircraft defenses and naval mine lines inside defensive sea sectors.',
        durationTicks: 4
      },
      {
        stepIndex: 2,
        actionType: 'DIPLOMATIC_PRESSURE',
        description: 'Demand neighboring entities guarantee zero flight paths for foreign surveillance drones.',
        durationTicks: 3
      },
      {
        stepIndex: 3,
        actionType: 'TEST_RED_LINES',
        description: 'Deploy interceptor scrambles near border airspace anomalies to assert jurisdiction.',
        durationTicks: 3
      }
    ],
    escalationRisk: 60,
    secrecyScore: 35,
    fallbackActionType: 'DEESCALATE_BUY_TIME'
  }
];
