import {
  DiplomaticLeverageRecord,
  Econ_NationProfile,
  LeverageType,
  Diplo_Relationship
} from '../types';

/**
 * Computes leverage value from various strategic parameters.
 */
export function computeLeverageScore(
  holderProfile: Econ_NationProfile,
  targetProfile: Econ_NationProfile,
  leverageType: LeverageType,
  hasCovertFinanceOps: boolean = false,
  holderBigRelationshipsCount: number = 0
): number {
  let score = 0;

  switch (leverageType) {
    case 'ECONOMIC_DEPENDENCY': {
      const dependencyRatio = (targetProfile.gdpEstimateUSD * 0.1) / Math.max(1e9, holderProfile.gdpEstimateUSD);
      score = Math.min(100, dependencyRatio * 100);
      break;
    }
    case 'SECURITY_GUARANTEE': {
      score = Math.max(0, 100 - targetProfile.sanctionResistanceScore);
      break;
    }
    case 'INTELLIGENCE_SHARING': {
      score = Math.max(0, Math.min(100, holderProfile.technologyAccessScore - targetProfile.technologyAccessScore));
      break;
    }
    case 'DEBT_OWNERSHIP': {
      score = hasCovertFinanceOps ? 60 : 20;
      break;
    }
    case 'DIASPORA_INFLUENCE': {
      const telecom = targetProfile.currentSectorHealth?.['TELECOMS'] ?? 100;
      const agri = targetProfile.currentSectorHealth?.['AGRICULTURE'] ?? 100;
      score = Math.min(100, telecom * 0.3 + agri * 0.2 + 20);
      break;
    }
    case 'ENERGY_SUPPLY': {
      const targetIsImporter = (targetProfile.energyExportRevenueUSD ?? 0) <= 0;
      const holderIsExporter = (holderProfile.energyExportRevenueUSD ?? 0) > 0;
      if (targetIsImporter && holderIsExporter) {
        const exportsG = (holderProfile.energyExportRevenueUSD ?? 0) / 1e9;
        score = Math.min(90, Math.max(60, 60 + exportsG));
      } else {
        score = 0;
      }
      break;
    }
    case 'ARMS_DEPENDENCY': {
      const ratio = (holderProfile.defenceIndustrialOutput ?? 100) / Math.max(1, targetProfile.defenceIndustrialOutput ?? 100);
      score = Math.min(100, ratio * 50);
      break;
    }
    case 'REPUTATION_CAPITAL': {
      score = Math.min(100, holderBigRelationshipsCount * 3);
      break;
    }
  }

  return Math.round(score);
}

/**
 * Scans relations to identify leverage cards.
 */
export function identifyLeverageOpportunities(
  playerProfile: Econ_NationProfile,
  allNationProfiles: Record<string, Econ_NationProfile>,
  existingLeverageRecords: DiplomaticLeverageRecord[],
  hasCovertFinanceByNation: Record<string, boolean> = {},
  holderBigRelationshipsCount: number = 0,
  tick: number = 0
): DiplomaticLeverageRecord[] {
  const newRecords: DiplomaticLeverageRecord[] = [];
  const types: LeverageType[] = [
    'ECONOMIC_DEPENDENCY',
    'SECURITY_GUARANTEE',
    'INTELLIGENCE_SHARING',
    'DEBT_OWNERSHIP',
    'DIASPORA_INFLUENCE',
    'ENERGY_SUPPLY',
    'ARMS_DEPENDENCY',
    'REPUTATION_CAPITAL'
  ];

  const pId = playerProfile.nationId;

  Object.keys(allNationProfiles).forEach(nid => {
    if (nid === pId) return;
    const targetProfile = allNationProfiles[nid];

    types.forEach(lType => {
      const hasExisting = existingLeverageRecords.some(
        r => r.holderNationId === pId && r.targetNationId === nid && r.leverageType === lType
      );
      if (hasExisting) return;

      const score = computeLeverageScore(
        playerProfile,
        targetProfile,
        lType,
        !!hasCovertFinanceByNation[nid],
        holderBigRelationshipsCount
      );

      if (score > 40) {
        newRecords.push({
          id: `lev_${pId}_${nid}_${lType}_${tick}`,
          holderNationId: pId,
          targetNationId: nid,
          leverageType: lType,
          intensityScore: score,
          isBeingExercised: false,
          createdAtTick: tick,
          expiryTick: tick + 24, // default 24 ticks lifecycle
          narrativeDescription: `Geopolitical leverage vector (${lType.replace(/_/g, ' ')}) established over ${nid} with core intensity of ${score}.`
        });
      }
    });
  });

  return newRecords;
}

/**
 * Computes active exercise deltas.
 */
export function computeLeverageExerciseDelta(
  leverageRecord: DiplomaticLeverageRecord,
  targetRelationshipScore: number
): { relationshipDelta: number; momentumDelta: number; capitalDelta: number; narrative: string } {
  let relationshipDelta = 0;
  let momentumDelta = 0;
  let capitalDelta = 0;
  let narrative = '';

  const holder = leverageRecord.holderNationId;
  const target = leverageRecord.targetNationId;
  const val = leverageRecord.intensityScore;

  switch (leverageRecord.leverageType) {
    case 'ECONOMIC_DEPENDENCY':
      if (val >= 80) {
        relationshipDelta = -25;
        momentumDelta = 10;
        narrative = `[LEVERAGE EXERCISED] ${holder} weaponizes economic dependency terms against ${target}, demanding key concessions at the negotiation table (-25 Relation, +10 Negotiation Momentum).`;
      } else {
        relationshipDelta = -10;
        momentumDelta = 4;
        narrative = `[LEVERAGE EXERCISED] ${holder} pressures ${target} commercial channels (-10 Relation, +4 Negotiation Momentum).`;
      }
      break;

    case 'SECURITY_GUARANTEE':
      relationshipDelta = 15;
      narrative = `[LEVERAGE EXERCISED] ${holder} solidifies extended security guarantees for ${target}. Target feels strategically insulated (+15 Relation).`;
      break;

    case 'ENERGY_SUPPLY':
      if (val >= 70) {
        relationshipDelta = -10;
        narrative = `[LEVERAGE EXERCISED] ${holder} issues restrictive energy supply indicators to ${target}. ${target} complies under direct coercion.`;
      } else {
        relationshipDelta = -5;
        narrative = `[LEVERAGE EXERCISED] ${holder} points to resource shipping dependencies on ${target}.`;
      }
      break;

    case 'INTELLIGENCE_SHARING':
      relationshipDelta = 8;
      narrative = `[LEVERAGE EXERCISED] ${holder} executes classified SIGINT summary share with ${target}, strengthening tactical defense cooperation (+8 Relation).`;
      break;

    case 'REPUTATION_CAPITAL':
      if (val >= 80) {
        capitalDelta = 5;
        narrative = `[LEVERAGE EXERCISED] ${holder} deploys global moral high-ground to boost sovereign political capital pools (+5 Capital/Tick).`;
      } else {
        capitalDelta = 2;
        narrative = `[LEVERAGE EXERCISED] ${holder} uses standing panels to bolster standing network (+2 Capital/Tick).`;
      }
      break;

    case 'ARMS_DEPENDENCY':
      narrative = `[LEVERAGE EXERCISED] ${holder} reviews precision military maintenance logs with ${target}. Target strategic autonomy is restricted.`;
      break;

    case 'DEBT_OWNERSHIP':
      relationshipDelta = -30;
      narrative = `[LEVERAGE EXERCISED] ${holder} forces sovereign debt covenants on ${target}, forcing structural credit renegotiations (-30 Relation).`;
      break;

    case 'DIASPORA_INFLUENCE':
      relationshipDelta = -5;
      narrative = `[LEVERAGE EXERCISED] ${holder} deploys localized media outreach affecting target public views.`;
      break;
  }

  return { relationshipDelta, momentumDelta, capitalDelta, narrative };
}

/**
 * Handles decaying leverage levels per tick.
 */
export function decayLeverageRecord(
  leverageRecord: DiplomaticLeverageRecord,
  tick: number
): DiplomaticLeverageRecord {
  const dRecord = { ...leverageRecord };
  
  const decayRate = dRecord.isBeingExercised ? 1.0 : 0.5;
  dRecord.intensityScore = Math.max(0, dRecord.intensityScore - decayRate);

  return dRecord;
}
