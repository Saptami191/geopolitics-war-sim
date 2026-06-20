import { 
  OPSEC_Profile,
  APT_Operation,
  Cyber_Tool,
  APT_Group,
  Cyber_Incident,
  Cyber_EffectType,
  Cyber_TargetType
} from '../types';

export function initOpsecProfile(operationId: string, assignedTools: Cyber_Tool[], aptGroup: APT_Group, tick: number): OPSEC_Profile {
  const isUsed = assignedTools.some(t => t.isBurned);
  const isAttributed = assignedTools.some(t => t.lastUsedInOperationId && aptGroup.attributedOperationIds.includes(t.lastUsedInOperationId));
  
  let level = 'BLACK' as any;
  if(isAttributed) level = 'WHITE';
  else if(isUsed) level = 'GREY';

  const tradecraftScore = aptGroup.sophisticationScore * 0.8;
  const opsecDecayPerTick = (100 - tradecraftScore) / 50;

  return {
    operationId,
    level,
    violations: [],
    c2InfrastructureScore: 80 - (10 * assignedTools.filter(t => t.isBurned).length),
    tradecraftScore,
    coverProfileId: null,
    falseFlagActive: false,
    falseFlagTargetNationId: null,
    falseFlagPlausibilityScore: 0,
    opsecDecayPerTick,
    lastMaintainedTick: tick
  };
}

export function detectOpsecViolation(profile: OPSEC_Profile, operation: APT_Operation, allOperations: APT_Operation[], allTools: Cyber_Tool[], tick: number) {
    if (Math.random() < 0.08 && operation.assignedToolIds.some(tId => allTools.find(t => t.id === tId)?.isBurned)) return { type: 'TOOL_REUSE', attributionRiskIncrease: 25 };
    if (Math.random() < 0.05 && profile.c2InfrastructureScore < 50) return { type: 'INFRASTRUCTURE_REUSE', attributionRiskIncrease: 20 };
    if (Math.random() < 0.04 && allOperations.filter(o => o.sponsoringNationId === operation.sponsoringNationId && o.status === 'ACTIVE').length > 1) return { type: 'TIMING_SIGNATURE', attributionRiskIncrease: 15 };
    if (Math.random() < 0.03) return { type: 'LANGUAGE_ARTEFACT', attributionRiskIncrease: 30 };
    if (Math.random() < 0.06 && allOperations.some(o => o.effectType === operation.effectType && o.attributionConfidence !== 'UNATTRIBUTED')) return { type: 'TTP_OVERLAP', attributionRiskIncrease: 20 };
    if (Math.random() < 0.04 && profile.tradecraftScore < 60) return { type: 'BEACON_INTERVAL_MATCH', attributionRiskIncrease: 15 };
    if (Math.random() < 0.02) return { type: 'ALLY_EXPOSURE', attributionRiskIncrease: 40 };
    return null;
}

export function processOpsecDecay(profile: OPSEC_Profile, currentTick: number): OPSEC_Profile {
   // ... simplified decay logic for brevity
   return profile;
}
