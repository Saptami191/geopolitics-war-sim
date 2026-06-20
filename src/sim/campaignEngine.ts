import { 
  Campaign_Node, 
  Campaign_Definition, 
  Role_Type, 
  Mode_ToneMode,
  CampaignBranch
} from '../types';

export const PREDEFINED_CAMPAIGNS: Record<string, Campaign_Definition> = {
  CAMPAIGN_COLD_WAR_REDUX: {
    id: 'CAMPAIGN_COLD_WAR_REDUX',
    title: 'THE LONG TWILIGHT STRUGGLE',
    subtitle: 'A revanchist power is rebuilding its sphere of influence.',
    classificationLevel: 'TOP_SECRET',
    synopsis: 'A revanchist power is rebuilding its Cold War-era sphere of influence. Over 4 acts, manage the intelligence, economic, military, and diplomatic dimensions of a great power confrontation before one side reaches the point of no return.',
    rootNodeId: 'PROLOGUE',
    nodes: {
      PROLOGUE: {
        nodeId: 'PROLOGUE',
        scenarioId: 'SCENARIO_GREAT_POWER_01',
        act: 'PROLOGUE',
        title: 'The Opening Move',
        description: 'Tensions are rising as the adversary bloc expands its influence in contested regions.',
        branches: [
          {
            branchType: 'DIPLOMATIC',
            nextNodeId: 'ACT_I_DIPLO',
            unlockCondition: 'NO_CONDITION',
            narrativeConsequence: 'Emphasis on de-escalation.' ,
            worldStateModifiers: [{ storeTarget: 'worldStore', field: 'globalTension', delta: -5, description: '- Tension' }]
          },
          {
            branchType: 'COVERT',
            nextNodeId: 'ACT_I_SHADOW',
            unlockCondition: 'NO_CONDITION',
            narrativeConsequence: 'Emphasis on intelligence-led pressure.',
            worldStateModifiers: [{ storeTarget: 'worldStore', field: 'globalTension', delta: 5, description: '+ Tension' }]
          },
          {
            branchType: 'MILITARY',
            nextNodeId: 'ACT_I_DET',
            unlockCondition: 'NO_CONDITION',
            narrativeConsequence: 'Military posturing takes priority.',
            worldStateModifiers: [{ storeTarget: 'defconStore', field: 'currentDefconLevel', delta: -1, description: 'DEFCON -1' }]
          }
        ],
        isTerminal: false,
        terminalOutcome: null
      },
      ACT_I_DIPLO: {
        nodeId: 'ACT_I_DIPLO',
        scenarioId: 'DYN_ACT1_DIPLO',
        act: 'ACT_I',
        title: 'Diplomatic Manouevring',
        description: 'Negotiations continue.',
        branches: [{
            branchType: 'DIPLOMATIC',
            nextNodeId: 'ACT_II_CONV',
            unlockCondition: 'NO_CONDITION',
            narrativeConsequence: 'Tension remains manageable.',
            worldStateModifiers: []
        }],
        isTerminal: false,
        terminalOutcome: null
      },
      ACT_I_SHADOW: {
        nodeId: 'ACT_I_SHADOW',
        scenarioId: 'DYN_ACT1_COVERT',
        act: 'ACT_I',
        title: 'Shadow Games',
        description: 'Intelligence gathering.',
        branches: [{
            branchType: 'COVERT',
            nextNodeId: 'ACT_II_CONV',
            unlockCondition: 'NO_CONDITION',
            narrativeConsequence: 'Intelligence established.',
            worldStateModifiers: []
        }],
        isTerminal: false,
        terminalOutcome: null
      },
      ACT_I_DET: {
        nodeId: 'ACT_I_DET',
        scenarioId: 'DYN_ACT1_MILITARY',
        act: 'ACT_I',
        title: 'Deterrence Posture',
        description: 'Military readiness.',
        branches: [{
            branchType: 'MILITARY',
            nextNodeId: 'ACT_II_CONV',
            unlockCondition: 'NO_CONDITION',
            narrativeConsequence: 'Deterrence solidified.',
            worldStateModifiers: []
        }],
        isTerminal: false,
        terminalOutcome: null
      },
      ACT_II_CONV: {
        nodeId: 'ACT_II_CONV',
        scenarioId: 'SCENARIO_NUCLEAR_STANDOFF_01',
        act: 'ACT_II',
        title: 'The Point of No Return',
        description: 'A major crisis.',
        branches: [
            {
                branchType: 'DIPLOMATIC',
                nextNodeId: 'EPILOGUE_VICTORY',
                unlockCondition: 'DIPLOMATIC_RESOLUTION',
                narrativeConsequence: 'World order neutralized.',
                worldStateModifiers: []
            },
            {
                branchType: 'HYBRID',
                nextNodeId: 'EPILOGUE_PYRRHIC',
                unlockCondition: 'NO_CONDITION',
                narrativeConsequence: 'Mutual exhaustion.',
                worldStateModifiers: []
            }
        ],
        isTerminal: false,
        terminalOutcome: null
      },
      EPILOGUE_VICTORY: {
        nodeId: 'EPILOGUE_VICTORY',
        scenarioId: 'NULL',
        act: 'EPILOGUE',
        title: 'Victory',
        description: 'Order restored.',
        branches: [],
        isTerminal: true,
        terminalOutcome: 'VICTORY'
      },
      EPILOGUE_PYRRHIC: {
        nodeId: 'EPILOGUE_PYRRHIC',
        scenarioId: 'NULL',
        act: 'EPILOGUE',
        title: 'Pyrrhic',
        description: 'Exhaustion.',
        branches: [],
        isTerminal: true,
        terminalOutcome: 'PYRRHIC'
      }
    },
    totalActs: 4,
    estimatedPlaytimeHours: 2,
    availableRoles: ['SHADOW_DIRECTOR', 'SUPREME_COMMANDER', 'CHIEF_OF_INTELLIGENCE'],
    availableToneModes: ['REALISM', 'TECHNO_THRILLER', 'ALTERNATE_HISTORY'],
    isUnlocked: true,
    unlockCondition: null,
    historicalInspiration: 'Cold War'
  },
  CAMPAIGN_NUCLEAR_SHADOW: {
      id: 'CAMPAIGN_NUCLEAR_SHADOW',
      title: 'THE OPPENHEIMER DOCTRINE',
      subtitle: 'A rogue state is weeks from a deliverable nuclear weapon.',
      classificationLevel: 'UMBRA',
      synopsis: 'A rogue state is weeks from a deliverable nuclear weapon. Counter-proliferation operations, covert sabotage, and a final kinetic decision define a 3-act crisis.',
      rootNodeId: 'PROLOGUE',
      nodes: {
        PROLOGUE: {
            nodeId: 'PROLOGUE',
            scenarioId: 'SCENARIO_COUNTER_PROLIFERATION_01',
            act: 'PROLOGUE',
            title: 'Initial Discovery',
            description: 'The discovery of the project.',
            branches: [{
                branchType: 'COVERT',
                nextNodeId: 'ACT_I_SABOTAGE',
                unlockCondition: 'NO_CONDITION',
                narrativeConsequence: 'Covert prep.',
                worldStateModifiers: []
            }],
            isTerminal: false,
            terminalOutcome: null
        },
        ACT_I_SABOTAGE: {
          nodeId: 'ACT_I_SABOTAGE',
          scenarioId: 'SCENARIO_COVERT_CAMPAIGN_01',
          act: 'ACT_I',
          title: 'Sabotage',
          description: 'Sabotaging the facilities.',
          branches: [{
              branchType: 'COVERT',
              nextNodeId: 'ACT_II_FINAL',
              unlockCondition: 'NO_CONDITION',
              narrativeConsequence: 'Sabotage success.',
              worldStateModifiers: []
          }],
          isTerminal: false,
          terminalOutcome: null
        },
        ACT_II_FINAL: {
            nodeId: 'ACT_II_FINAL',
            scenarioId: 'SCENARIO_NUCLEAR_STANDOFF_01',
            act: 'ACT_II',
            title: 'Final Ultimatum',
            description: 'The final push.',
            branches: [{
                branchType: 'DIPLOMATIC',
                nextNodeId: 'EPILOGUE_VICTORY',
                unlockCondition: 'NO_CONDITION',
                narrativeConsequence: 'Resolution.',
                worldStateModifiers: []
            }],
            isTerminal: false,
            terminalOutcome: null
        },
        EPILOGUE_VICTORY: {
            nodeId: 'EPILOGUE_VICTORY',
            scenarioId: 'NULL',
            act: 'EPILOGUE',
            title: 'Victory',
            description: 'Crisis averted.',
            branches: [],
            isTerminal: true,
            terminalOutcome: 'VICTORY'
          }
      },
      totalActs: 3,
      estimatedPlaytimeHours: 1.5,
      availableRoles: ['SHADOW_DIRECTOR', 'SUPREME_COMMANDER', 'CHIEF_OF_INTELLIGENCE'],
      availableToneModes: ['REALISM', 'TECHNO_THRILLER', 'ALTERNATE_HISTORY'],
      isUnlocked: true,
      unlockCondition: null,
      historicalInspiration: 'Proliferation crises'
  }
};
