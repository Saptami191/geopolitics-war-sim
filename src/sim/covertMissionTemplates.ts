import { CIAOperationType, CIAMissionTemplate, CIABlowbackSeverity } from '../types';

export const covertMissionTemplates: Record<CIAOperationType, CIAMissionTemplate> = {
  INTELLIGENCE_COLLECTION: {
    type: 'INTELLIGENCE_COLLECTION',
    requiredMinAccessLevel: 1,
    requiredOperativeCount: { min: 1, max: 2 },
    requiredAssetTiers: [1],
    estimatedDurationRange: { min: 4, max: 8 },
    baseSuccessProbability: 75,
    baseDetectionRisk: 10,
    resourceCostRange: { min: 10, max: 30 },
    blowbackProfile: ['CONTAINED', 'CONTAINED', 'LEAKED'],
    sigintBonus: 15,
    arachneBonus: 15,
    finintBonus: 15,
    effects: ['GATHER_INTEL', 'REVEAL_NETWORKS']
  },
  REGIME_DESTABILISATION: {
    type: 'REGIME_DESTABILISATION',
    requiredMinAccessLevel: 3,
    requiredOperativeCount: { min: 2, max: 4 },
    requiredAssetTiers: [2, 3],
    estimatedDurationRange: { min: 10, max: 20 },
    baseSuccessProbability: 50,
    baseDetectionRisk: 30,
    resourceCostRange: { min: 80, max: 150 },
    blowbackProfile: ['LEAKED', 'EXPOSED', 'EXPOSED', 'CATASTROPHIC'],
    sigintBonus: 10,
    arachneBonus: 15,
    finintBonus: 8,
    effects: ['REDUCE_REGIME_STABILITY', 'INCREASE_UNREST', 'FACTION_FRACTURE']
  },
  ASSASSINATION: {
    type: 'ASSASSINATION',
    requiredMinAccessLevel: 4,
    requiredOperativeCount: { min: 1, max: 3 },
    requiredAssetTiers: [3],
    estimatedDurationRange: { min: 2, max: 5 },
    baseSuccessProbability: 40,
    baseDetectionRisk: 50,
    resourceCostRange: { min: 100, max: 250 },
    blowbackProfile: ['EXPOSED', 'EXPOSED', 'CATASTROPHIC', 'CATASTROPHIC'],
    sigintBonus: 8,
    arachneBonus: 10,
    finintBonus: 5,
    effects: ['ELIMINATE_TARGET', 'REDUCE_REGIME_STABILITY']
  },
  COUP_SUPPORT: {
    type: 'COUP_SUPPORT',
    requiredMinAccessLevel: 4,
    requiredOperativeCount: { min: 3, max: 6 },
    requiredAssetTiers: [3, 4],
    estimatedDurationRange: { min: 15, max: 30 },
    baseSuccessProbability: 35,
    baseDetectionRisk: 55,
    resourceCostRange: { min: 150, max: 400 },
    blowbackProfile: ['EXPOSED', 'CATASTROPHIC', 'CATASTROPHIC', 'CATASTROPHIC'],
    sigintBonus: 10,
    arachneBonus: 12,
    finintBonus: 12,
    effects: ['INSTALL_NEW_LEADER', 'MILITARY_DEFECTION', 'REDUCE_REGIME_STABILITY']
  },
  RENDITION: {
    type: 'RENDITION',
    requiredMinAccessLevel: 3,
    requiredOperativeCount: { min: 2, max: 4 },
    requiredAssetTiers: [2],
    estimatedDurationRange: { min: 3, max: 7 },
    baseSuccessProbability: 55,
    baseDetectionRisk: 40,
    resourceCostRange: { min: 50, max: 120 },
    blowbackProfile: ['LEAKED', 'EXPOSED', 'CATASTROPHIC'],
    sigintBonus: 12,
    arachneBonus: 10,
    finintBonus: 5,
    effects: ['ELIMINATE_TARGET', 'GATHER_INTEL']
  },
  SABOTAGE: {
    type: 'SABOTAGE',
    requiredMinAccessLevel: 2,
    requiredOperativeCount: { min: 1, max: 3 },
    requiredAssetTiers: [2],
    estimatedDurationRange: { min: 4, max: 10 },
    baseSuccessProbability: 60,
    baseDetectionRisk: 35,
    resourceCostRange: { min: 40, max: 100 },
    blowbackProfile: ['CONTAINED', 'LEAKED', 'EXPOSED', 'CATASTROPHIC'],
    sigintBonus: 10,
    arachneBonus: 12,
    finintBonus: 5,
    effects: ['DEGRADE_MILITARY_READINESS', 'REDUCE_REGIME_STABILITY']
  },
  COUNTER_PROLIFERATION: {
    type: 'COUNTER_PROLIFERATION',
    requiredMinAccessLevel: 4,
    requiredOperativeCount: { min: 2, max: 5 },
    requiredAssetTiers: [3, 4],
    estimatedDurationRange: { min: 8, max: 16 },
    baseSuccessProbability: 45,
    baseDetectionRisk: 30,
    resourceCostRange: { min: 120, max: 280 },
    blowbackProfile: ['CONTAINED', 'LEAKED', 'EXPOSED', 'CATASTROPHIC'],
    sigintBonus: 20,
    arachneBonus: 15,
    finintBonus: 10,
    effects: ['DEGRADE_MILITARY_READINESS', 'GATHER_INTEL']
  },
  PROPAGANDA_OPERATION: {
    type: 'PROPAGANDA_OPERATION',
    requiredMinAccessLevel: 1,
    requiredOperativeCount: { min: 1, max: 3 },
    requiredAssetTiers: [1],
    estimatedDurationRange: { min: 5, max: 12 },
    baseSuccessProbability: 70,
    baseDetectionRisk: 20,
    resourceCostRange: { min: 20, max: 60 },
    blowbackProfile: ['CONTAINED', 'CONTAINED', 'LEAKED', 'EXPOSED'],
    sigintBonus: 8,
    arachneBonus: 15,
    finintBonus: 12,
    effects: ['INCREASE_UNREST', 'MEDIA_NARRATIVE_SHIFT']
  },
  ASSET_RECRUITMENT: {
    type: 'ASSET_RECRUITMENT',
    requiredMinAccessLevel: 2,
    requiredOperativeCount: { min: 1, max: 2 },
    requiredAssetTiers: [1],
    estimatedDurationRange: { min: 3, max: 7 },
    baseSuccessProbability: 65,
    baseDetectionRisk: 22,
    resourceCostRange: { min: 15, max: 40 },
    blowbackProfile: ['CONTAINED', 'LEAKED'],
    sigintBonus: 5,
    arachneBonus: 10,
    finintBonus: 15,
    effects: ['RECRUIT_STRENGTHEN']
  },
  EXFILTRATION: {
    type: 'EXFILTRATION',
    requiredMinAccessLevel: 2,
    requiredOperativeCount: { min: 1, max: 3 },
    requiredAssetTiers: [1],
    estimatedDurationRange: { min: 2, max: 5 },
    baseSuccessProbability: 70,
    baseDetectionRisk: 30,
    resourceCostRange: { min: 30, max: 80 },
    blowbackProfile: ['CONTAINED', 'LEAKED', 'EXPOSED'],
    sigintBonus: 12,
    arachneBonus: 8,
    finintBonus: 5,
    effects: ['EXTRACT_TARGET']
  },
  COVERT_FINANCE: {
    type: 'COVERT_FINANCE',
    requiredMinAccessLevel: 1,
    requiredOperativeCount: { min: 1, max: 2 },
    requiredAssetTiers: [1],
    estimatedDurationRange: { min: 4, max: 10 },
    baseSuccessProbability: 80,
    baseDetectionRisk: 15,
    resourceCostRange: { min: 50, max: 200 },
    blowbackProfile: ['CONTAINED', 'LEAKED', 'EXPOSED'],
    sigintBonus: 5,
    arachneBonus: 12,
    finintBonus: 25,
    effects: ['INCREASE_UNREST']
  },
  COUNTER_INTELLIGENCE: {
    type: 'COUNTER_INTELLIGENCE',
    requiredMinAccessLevel: 2,
    requiredOperativeCount: { min: 1, max: 3 },
    requiredAssetTiers: [2],
    estimatedDurationRange: { min: 5, max: 12 },
    baseSuccessProbability: 65,
    baseDetectionRisk: 15,
    resourceCostRange: { min: 25, max: 70 },
    blowbackProfile: ['CONTAINED', 'CONTAINED', 'LEAKED'],
    sigintBonus: 15,
    arachneBonus: 12,
    finintBonus: 8,
    effects: ['IDENTIFY_SPIES']
  }
};

const CODENAME_PREFIXES = [
  'CARDINAL', 'NIGHTHAWK', 'BASILISK', 'COBALT', 'SILVER', 'UMBRA', 'AMBER', 'ZERO',
  'ECLIPSE', 'IVORY', 'NEPTUNE', 'PHANTOM', 'VORTEX', 'TEMPEST', 'OBLIVION', 'VALKYRIE',
  'APOLLO', 'GLADIATOR', 'CHIMERA', 'HARBINGER', 'GHOST', 'SPARTAN', 'LEGION', 'TRIDENT',
  'SAPPHIRE', 'JADE', 'GARNET', 'SIERRA', 'ORION', 'TITAN', 'CYPRUS', 'ZODIAC', 'CALYPSO'
];

const CODENAME_SUFFIXES = [
  'SHADOW', 'CHOKE', 'FORK', 'POINT', 'HORIZON', 'STRIKE', 'FALL', 'STORM', 'RISE',
  'DAGGER', 'BREACH', 'SHIELD', 'THRUST', 'PULSE', 'GRIFFIN', 'SABER', 'SPECTRE',
  'ANVIL', 'REAPER', 'SCYTHE', 'SHROUD', 'WAVE', 'MIRAGE', 'CAGE', 'ECHO', 'WHISPER'
];

export function generateMissionCodename(type: CIAOperationType): string {
  // Select prefix and suffix, ensure variety
  const prefix = CODENAME_PREFIXES[Math.floor(Math.random() * CODENAME_PREFIXES.length)];
  const suffix = CODENAME_SUFFIXES[Math.floor(Math.random() * CODENAME_SUFFIXES.length)];
  return `${prefix} ${suffix}`;
}

export function getMissionTemplate(type: CIAOperationType): CIAMissionTemplate {
  return covertMissionTemplates[type];
}
