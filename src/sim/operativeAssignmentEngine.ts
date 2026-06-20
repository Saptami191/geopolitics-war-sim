import { CIAOperative, CIAAsset, CIAMissionTemplate, CIAOperativeStatus, CIAAssetStatus } from '../types';

export function canAssignOperative(
  operative: CIAOperative,
  template: CIAMissionTemplate,
  existingAssignment: CIAOperative[]
): { valid: boolean; reason?: string } {
  // 1. Status must be ACTIVE
  if (operative.status !== 'ACTIVE') {
    return { valid: false, reason: `Operative status is ${operative.status}, must be ACTIVE` };
  }

  // 2. Not already assigned to another operation (or participating in existing assignment)
  if (operative.activeOperationId !== null && operative.activeOperationId !== '') {
    return { valid: false, reason: `Operative already assigned to active operation: ${operative.activeOperationId}` };
  }
  if (existingAssignment.some(o => o.id === operative.id)) {
    return { valid: false, reason: 'Operative already assigned to this plan' };
  }

  // 3. Access level >= template required min access level * 15 (mapping scale 1-5 to 0-100)
  const requiredLevel = template.requiredMinAccessLevel * 15;
  if (operative.accessLevel < requiredLevel) {
    return { valid: false, reason: `Access level too low: has ${operative.accessLevel}, requires ${requiredLevel}` };
  }

  // 4. Heat must be <= 70
  if (operative.heatLevel > 70) {
    return { valid: false, reason: `Heat level is too high: ${operative.heatLevel}% (must be <= 70%)` };
  }

  // 5. Cover integrity must be > 20
  if (operative.coverIntegrity <= 20) {
    return { valid: false, reason: `Cover integrity is critically compromised: ${operative.coverIntegrity}% (must be > 20%)` };
  }

  return { valid: true };
}

export function scoreOperativeForMission(
  operative: CIAOperative,
  template: CIAMissionTemplate,
  targetNationId?: string
): number {
  let score = 50; // base score

  // Access level match (higher access level than required provides a small bonus, exact/high matches score better)
  const targetLevel = template.requiredMinAccessLevel * 15;
  const levelDiff = operative.accessLevel - targetLevel;
  if (levelDiff >= 0) {
    score += Math.min(20, levelDiff * 0.4); // bonus for over-qualification
  } else {
    score -= Math.abs(levelDiff); // penalty if below requirement (though normally filtered)
  }

  // Years in field experience bonus
  score += Math.min(10, operative.yearsInField * 0.8);

  // Heat level penalty (cleaner operatives are much more fit)
  score -= operative.heatLevel * 0.4;

  // Cover integrity bonus (more secure covers are better)
  score += (operative.coverIntegrity - 50) * 0.2;

  // Target nation alignment bonus: if current deployed nation matches mission target nation
  if (targetNationId && operative.nationId === targetNationId) {
    score += 15;
  }

  // Specialisation affinity bonus (e.g. PARAMILITARY for SABOTAGE/ASSASSINATION, etc.)
  const specs = operative.specialisations || [];
  if (template.type === 'SABOTAGE' || template.type === 'ASSASSINATION' || template.type === 'RENDITION') {
    if (specs.includes('PARAMILITARY')) score += 15;
  } else if (template.type === 'INTELLIGENCE_COLLECTION' || template.type === 'COUNTER_INTELLIGENCE') {
    if (specs.includes('TECHNICAL_INTELLIGENCE') || specs.includes('COUNTER_INTELLIGENCE')) score += 15;
  } else if (template.type === 'REGIME_DESTABILISATION' || template.type === 'PROPAGANDA_OPERATION') {
    if (specs.includes('INFLUENCE_OPERATIONS')) score += 15;
  } else if (template.type === 'COVERT_FINANCE') {
    if (specs.includes('FINANCIAL_OPERATIONS')) score += 15;
  } else if (template.type === 'COUNTER_PROLIFERATION') {
    if (specs.includes('SIGNALS_SUPPORT') || specs.includes('TECHNICAL_INTELLIGENCE')) score += 15;
  }

  // Clamp within 0-100 range
  return Math.max(0, Math.min(100, score));
}

export function buildOptimalTeam(
  availableOperatives: CIAOperative[],
  template: CIAMissionTemplate,
  targetNationId: string
): CIAOperative[] {
  // Sort operatives by fitness score descending
  const scoredOperatives = availableOperatives
    .map(op => ({ op, score: scoreOperativeForMission(op, template, targetNationId) }))
    .sort((a, b) => b.score - a.score);

  const team: CIAOperative[] = [];
  const { min, max } = template.requiredOperativeCount;

  for (const item of scoredOperatives) {
    if (team.length >= max) break;
    const check = canAssignOperative(item.op, template, team);
    if (check.valid) {
      team.push(item.op);
    }
  }

  // If we couldn't even reach the minimum size, return an empty list indicating assignment failure
  if (team.length < min) {
    return [];
  }

  return team;
}

export function validateAssetSupport(
  assets: CIAAsset[],
  template: CIAMissionTemplate
): { valid: boolean; sigintSupport: boolean; arachneSupport: boolean; finintSupport: boolean } {
  // 1. Assets must be RECRUITED
  const recruitedAssets = assets.filter(a => a.status === 'RECRUITED');

  // 2. Checks asset tier requirements (template.requiredAssetTiers is e.g. [2, 3])
  // Ensure that for each required tier standard, we have at least one asset matching or exceeding that tier
  const validTiers = template.requiredAssetTiers.every(reqTier =>
    recruitedAssets.some(a => a.accessTier >= reqTier)
  );

  if (!validTiers && template.requiredAssetTiers.length > 0) {
    return { valid: false, sigintSupport: false, arachneSupport: false, finintSupport: false };
  }

  // 3. Evaluate support types
  let sigintSupport = false;
  let arachneSupport = false;
  let finintSupport = false;

  for (const asset of recruitedAssets) {
    // If asset has high access and position / details align with signal, cyber, telecom, etc.
    const pos = (asset.position || '').toLowerCase();
    const details = (asset.personalDetails || '').toLowerCase();

    if (pos.includes('signals') || pos.includes('telecom') || pos.includes('cyber') || pos.includes('comm') || pos.includes('defense')) {
      sigintSupport = true;
    }
    // Linked to arachne
    if (asset.linkedArachneNodeId !== null && asset.linkedArachneNodeId !== '') {
      arachneSupport = true;
    }
    // Financial keywords
    if (asset.motivation === 'MONEY' || pos.includes('finance') || pos.includes('bank') || pos.includes('treasury') || pos.includes('commerce') || details.includes('account')) {
      finintSupport = true;
    }
  }

  return {
    valid: true,
    sigintSupport,
    arachneSupport,
    finintSupport
  };
}
