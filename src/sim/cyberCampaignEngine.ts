import { 
  Cyber_Campaign,
  CyberCampaignObjective
} from '../types';

export function initCyberCampaign(sponsoringNationId: string, targetNationIds: string[], objective: CyberCampaignObjective, operationIds: string[], estimatedCulminationTick: number, budget: number, isPlayer: boolean, tick: number): Cyber_Campaign {
  return {
    id: `camp_${Date.now()}`,
    codename: `CAMPAIGN_${Date.now()}`,
    sponsoringNationId,
    targetNationIds,
    objective,
    currentPhase: 'PREPARATION',
    linkedOperationIds: operationIds,
    startedAtTick: tick,
    estimatedCulminationTick,
    isPlayerControlled: isPlayer,
    coordinationScore: 70,
    adversaryAwarenessLevel: 0,
    campaignBudget: budget,
    campaignBudgetSpent: 0,
    narrativeLog: [],
    status: 'ACTIVE',
    successMetrics: []
  };
}
