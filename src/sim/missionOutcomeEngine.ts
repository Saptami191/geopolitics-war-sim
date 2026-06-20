import { 
  CIAOperation, 
  CIAOperative, 
  CIAAsset, 
  CIAStation, 
  MissionOutcomeResult, 
  WorldEffect, 
  OperativeEffect, 
  AssetEffect, 
  CIABlowbackSeverity, 
  CIAOperativeStatus, 
  CIAAssetStatus 
} from '../types';
import { getMissionTemplate } from './covertMissionTemplates';

export function resolveMissionOutcome(
  operation: CIAOperation,
  operatives: CIAOperative[],
  assets: CIAAsset[],
  station: CIAStation | null,
  defconLevel: number,
  oversightStatus: string,
  currentTick: number
): MissionOutcomeResult {
  const template = getMissionTemplate(operation.type);
  
  // 1. Calculate Success Probability
  let successProb = template.baseSuccessProbability;

  // Modifiers: Operatives access levels and years in field
  operatives.forEach(op => {
    // scale 1-100 to standard bonus
    successProb += op.accessLevel * 0.2;
    successProb += op.yearsInField * 1.5;
    // heat level penalty
    if (op.heatLevel > 30) {
      successProb -= (op.heatLevel - 30) * 0.4;
    }
    // cover integrity penalty if cover integrity is shaky
    if (op.coverIntegrity < 50) {
      successProb -= (50 - op.coverIntegrity) * 0.3;
    }
  });

  // Supporting assets bonuses
  const recruitedAssets = assets.filter(a => a.status === 'RECRUITED');
  recruitedAssets.forEach(asset => {
    successProb += asset.accessTier * 6;
    successProb += asset.reliabilityScore * 0.1;
  });

  // Intel support bonuses
  if (operation.sigintSupport) successProb += template.sigintBonus;
  if (operation.arachneSupport) successProb += template.arachneBonus;
  if (operation.finintSupport) successProb += template.finintBonus;

  // DEFCON modifier (high DEFCON level = lower DEFCON state value i.e. 1 is highest military alert)
  // High military alert decreases chance of subtle operations
  if (defconLevel <= 2) {
    successProb -= (6 - defconLevel) * 4;
  }

  // Oversight status modifier
  if (oversightStatus === 'INQUIRY') {
    successProb -= 15;
  } else if (oversightStatus === 'RESTRICTED') {
    successProb -= 10;
  } else if (oversightStatus === 'SUSPENDED') {
    successProb -= 35;
  } else if (oversightStatus === 'CLEAR') {
    successProb += 5;
  }

  // Station support
  if (station) {
    if (station.isCompromised) {
      successProb -= 25;
    } else {
      successProb += 10;
    }
  } else {
    // Minus small amount for lacking local support hub
    successProb -= 5;
  }

  const finalSuccessProbability = Math.min(95, Math.max(5, successProb));

  // 2. Calculate Detection Risk
  let detectionRisk = template.baseDetectionRisk;

  // Operative heat modifier
  operatives.forEach(op => {
    detectionRisk += (op.heatLevel / 100) * 20;
    // NOC operatives have lower risk, check cover class or details
    if (op.coverType === 'NOC') {
      detectionRisk -= 5;
    }
  });

  // Oversight configuration
  if (operation.oversightNotified) {
    detectionRisk -= 10; // pre-briefed means controlled lines and lower risk of leaking
  } else {
    detectionRisk += 8;  // rogue action increases whistle-blowing and leak risks
  }

  // Station status
  if (station && station.isCompromised) {
    detectionRisk += 25;
  } else if (!station) {
    detectionRisk += 8; // no local safe houses
  }

  if (oversightStatus === 'MONITORING' || oversightStatus === 'INQUIRY') {
    detectionRisk += 12; // deep monitoring
  }

  const finalDetectionRisk = Math.min(90, Math.max(5, detectionRisk));

  // 3. Resolve Outcome Roll
  let outcome: 'SUCCEEDED' | 'PARTIALLY_SUCCEEDED' | 'FAILED' | 'BLOWN' = 'FAILED';
  let blowbackSeverity: CIABlowbackSeverity | null = null;
  let narrativeSummary = '';

  // Roll for Blown state
  const blownRoll = Math.random() * 100;
  const isBlown = blownRoll < finalDetectionRisk * 0.45; // 45% scalar for outcome-level exposure check

  if (isBlown) {
    outcome = 'BLOWN';
    // Determine severity from blowback profile
    const profile = template.blowbackProfile || ['CONTAINED', 'LEAKED', 'EXPOSED'];
    let idx = Math.floor(Math.random() * profile.length);
    // If oversight was notified, lower severity by 1 step if possible
    if (operation.oversightNotified && idx > 0) {
      idx -= 1;
    }
    blowbackSeverity = profile[idx];

    narrativeSummary = `OPERATION ${operation.codename} COMPROMISED // LETHAL BLOWBACK DETECTED\nSubadversary counter-intelligence intercepted critical logistics linked to operatives. Operational files leaked. Severity assessed as: ${blowbackSeverity}.`;
  } else {
    // Roll for success
    const successRoll = Math.random() * 100;
    if (successRoll < finalSuccessProbability) {
      outcome = 'SUCCEEDED';
      narrativeSummary = `OPERATION ${operation.codename} COMPLETE // SUCCESSFUL DIRECTIVE YIELD\nPrimary and secondary objectives achieved. Staging assets performed within high tolerance. Target infrastructure deeply impacted with zero public trace.`;
    } else if (successRoll < finalSuccessProbability + 25) {
      outcome = 'PARTIALLY_SUCCEEDED';
      narrativeSummary = `OPERATION ${operation.codename} PARTIAL YIELD // SECONDARY OBJECTIVES CONCLUDED\nAdversary resistance or high localized security prevented final primary closure. Sub-objectives cleared, producing valuable diplomatic and organizational footholds.`;
    } else {
      outcome = 'FAILED';
      narrativeSummary = `OPERATION ${operation.codename} UNRESOLVED // OBJECTIVES UNSATISFIED\nTarget defenses proved more resilient than our pre-mission threat intelligence predicted. Operational window closed without achieving desired changes. Team has retracted.`;

      // 40% chance of minor contained leak on failed mission
      if (Math.random() < 0.40) {
        blowbackSeverity = 'CONTAINED';
      }
    }
  }

  // 4. Compute Downstream Effects
  const worldEffects: WorldEffect[] = [];
  const operativeEffects: OperativeEffect[] = [];
  const assetEffects: AssetEffect[] = [];

  // World Effects
  const effectTemplates = template.effects || [];
  const effectScale = outcome === 'SUCCEEDED' ? 1.0 : outcome === 'PARTIALLY_SUCCEEDED' ? 0.5 : 0.0;

  if (effectScale > 0) {
    effectTemplates.forEach(effectType => {
      // determine base magnitude based on type
      let magnitude = 15 + Math.floor(Math.random() * 20); // 15-35
      if (operation.type === 'COUP_SUPPORT') {
        magnitude = 45 + Math.floor(Math.random() * 30); // 45-75
      } else if (operation.type === 'REGIME_DESTABILISATION') {
        magnitude = 25 + Math.floor(Math.random() * 25); // 25-50
      }

      worldEffects.push({
        effectType,
        targetNationId: operation.targetNationId,
        magnitude: Math.round(magnitude * effectScale)
      });
    });
  }

  // Operative Effects
  operatives.forEach(op => {
    let heatDelta = 0;
    let coverDelta = 0;
    let newStatus: CIAOperativeStatus | undefined;

    if (outcome === 'SUCCEEDED') {
      heatDelta = 5 + Math.floor(Math.random() * 10);        // +5 to +15
      coverDelta = -(3 + Math.floor(Math.random() * 8));     // -3 to -11
    } else if (outcome === 'PARTIALLY_SUCCEEDED') {
      heatDelta = 10 + Math.floor(Math.random() * 12);       // +10 to +22
      coverDelta = -(6 + Math.floor(Math.random() * 12));    // -6 to -18
    } else if (outcome === 'FAILED') {
      heatDelta = 15 + Math.floor(Math.random() * 15);       // +15 to +30
      coverDelta = -(10 + Math.floor(Math.random() * 15));   // -10 to -25
    } else { // BLOWN
      heatDelta = 35 + Math.floor(Math.random() * 25);       // +35 to +60
      coverDelta = -(35 + Math.floor(Math.random() * 30));   // -35 to -65
      newStatus = 'COMPROMISED';
    }

    operativeEffects.push({
      operativeId: op.id,
      heatDelta,
      coverIntegrityDelta: coverDelta,
      newStatus
    });
  });

  // Asset Effects
  recruitedAssets.forEach(asset => {
    let motivationDelta = 0;
    let newStatus: CIAAssetStatus | undefined;

    if (outcome === 'SUCCEEDED') {
      motivationDelta = 6 + Math.floor(Math.random() * 8); // +6 to +14 motivation
    } else if (outcome === 'PARTIALLY_SUCCEEDED') {
      motivationDelta = 2 + Math.floor(Math.random() * 6); // +2 to +8
    } else if (outcome === 'FAILED') {
      motivationDelta = -(5 + Math.floor(Math.random() * 8)); // -5 to -13
    } else { // BLOWN
      motivationDelta = -(25 + Math.floor(Math.random() * 15)); // -25 to -40
      newStatus = Math.random() < 0.6 ? 'BURNED' : 'DORMANT';
    }

    assetEffects.push({
      assetId: asset.id,
      motivationDelta,
      newStatus
    });
  });

  return {
    outcome,
    successProbabilityUsed: finalSuccessProbability,
    detectionRiskUsed: finalDetectionRisk,
    worldEffects,
    operativeEffects,
    assetEffects,
    blowbackSeverity,
    narrativeSummary
  };
}
