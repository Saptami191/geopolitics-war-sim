import {
  AllianceStressRecord,
  Econ_NationProfile,
  Diplo_Relationship,
  AllianceStressor,
  SanctionsGameplayState,
  Treaty
} from '../types';

/**
 * Probabilistically and deterministically detects stress factors in alliances.
 */
export function detectAllianceStressors(
  treaty: Treaty,
  memberProfiles: Econ_NationProfile[],
  relationships: Record<string, Diplo_Relationship>,
  sanctionsGameplay: SanctionsGameplayState,
  tick: number,
  hasSigintBreach: boolean = false
): AllianceStressRecord[] {
  const newRecords: AllianceStressRecord[] = [];
  const memberIds = treaty.partyNationIds;

  if (memberIds.length < 2) return [];

  // Helper to lookup relationships
  function getRel(a: string, b: string): Diplo_Relationship | undefined {
    const key1 = `${a}:${b}`;
    const key2 = `${b}:${a}`;
    return relationships[key1] || relationships[key2];
  }

  // 1. BURDEN_SHARING_DISPUTE
  const anyLowOutput = memberProfiles.some(m => (m.defenceIndustrialOutput ?? 100) < 40);
  const anyHighOutput = memberProfiles.some(m => (m.defenceIndustrialOutput ?? 100) > 70);
  if (anyLowOutput && anyHighOutput) {
    const outputs = memberProfiles.map(m => m.defenceIndustrialOutput ?? 100);
    const min = Math.min(...outputs);
    const sum = outputs.reduce((x, y) => x + y, 0);
    const avg = sum / outputs.length;
    const intensity = Math.round((avg - min) * 0.8);

    newRecords.push({
      id: `str_burden_${treaty.id}_${tick}`,
      allianceTreatyId: treaty.id,
      affectedNationIds: [...memberIds],
      stressor: 'BURDEN_SHARING_DISPUTE',
      stressIntensity: Math.min(100, Math.max(0, intensity)),
      onsetTick: tick,
      unaddressedTickCount: 0,
      isResolved: false,
      resolvedAtTick: null,
      narrativeDescription: `[ALLIANCE DISPUTE] Members of ${treaty.codename} clash over defense contributions. Defense outputs diverging.`
    });
  }

  // 2. STRATEGIC_DIVERGENCE
  let maxThreatDiff = 0;
  for (let i = 0; i < memberIds.length; i++) {
    for (let j = i + 1; j < memberIds.length; j++) {
      const rel = getRel(memberIds[i], memberIds[j]);
      if (rel) {
        // Find if threat perceptions diverge (by using mutualThreatPerception proxy)
        const threatA = rel.mutualThreatPerception ?? 0;
        // Search other allies
        memberIds.forEach(k => {
          if (k === memberIds[i] || k === memberIds[j]) return;
          const otherRel = getRel(memberIds[i], k);
          if (otherRel) {
            const threatDiff = Math.abs(threatA - (otherRel.mutualThreatPerception ?? 0));
            if (threatDiff > maxThreatDiff) {
              maxThreatDiff = threatDiff;
            }
          }
        });
      }
    }
  }

  if (maxThreatDiff > 30) {
    const intensity = Math.round(maxThreatDiff * 0.6);
    newRecords.push({
      id: `str_strat_${treaty.id}_${tick}`,
      allianceTreatyId: treaty.id,
      affectedNationIds: [...memberIds],
      stressor: 'STRATEGIC_DIVERGENCE',
      stressIntensity: Math.min(100, Math.max(0, intensity)),
      onsetTick: tick,
      unaddressedTickCount: 0,
      isResolved: false,
      resolvedAtTick: null,
      narrativeDescription: `[ALLIANCE DIVERGENCE] Strategic divergence within ${treaty.codename}. Threats prioritized differently by core signatories.`
    });
  }

  // 3. TRADE_FRICTION
  let hasTradeFriction = false;
  for (let i = 0; i < memberIds.length; i++) {
    for (let j = i + 1; j < memberIds.length; j++) {
      const rel = getRel(memberIds[i], memberIds[j]);
      if (rel && (rel.economicInterdependenceScore ?? 100) < 30) {
        // Overlap in sanctions targets
         hasTradeFriction = true;
      }
    }
  }
  if (hasTradeFriction) {
    newRecords.push({
      id: `str_trade_${treaty.id}_${tick}`,
      allianceTreatyId: treaty.id,
      affectedNationIds: [...memberIds],
      stressor: 'TRADE_FRICTION',
      stressIntensity: 50,
      onsetTick: tick,
      unaddressedTickCount: 0,
      isResolved: false,
      resolvedAtTick: null,
      narrativeDescription: `[ALLIANCE STRESS] Low economic interdependence triggers trade friction and tariff disputes among partners.`
    });
  }

  // 4. SANCTIONS_DIVERGENCE
  let sanctionDiscrepancy = false;
  // If some members have sanctioned a target, and others have not
  if (sanctionsGameplay.activeSanctionRecords.length > 0) {
    sanctionsGameplay.activeSanctionRecords.forEach(rec => {
      const hasOnTarget = memberIds.filter(id => id === rec.sourceId || rec.coalitionMemberIds.includes(id));
      if (hasOnTarget.length > 0 && hasOnTarget.length < memberIds.length) {
         sanctionDiscrepancy = true;
      }
    });
  }
  if (sanctionDiscrepancy) {
    newRecords.push({
      id: `str_sanc_${treaty.id}_${tick}`,
      allianceTreatyId: treaty.id,
      affectedNationIds: [...memberIds],
      stressor: 'SANCTIONS_DIVERGENCE',
      stressIntensity: 60,
      onsetTick: tick,
      unaddressedTickCount: 0,
      isResolved: false,
      resolvedAtTick: null,
      narrativeDescription: `[ALLIANCE FRACTION] Sanctions divergence in ${treaty.codename}. Signatories disagree on multilateral economic exclusions.`
    });
  }

  // 5. INTELLIGENCE_BREACH
  if (hasSigintBreach) {
    newRecords.push({
      id: `str_spy_${treaty.id}_${tick}`,
      allianceTreatyId: treaty.id,
      affectedNationIds: [...memberIds],
      stressor: 'INTELLIGENCE_BREACH',
      stressIntensity: 70,
      onsetTick: tick,
      unaddressedTickCount: 0,
      isResolved: false,
      resolvedAtTick: null,
      narrativeDescription: `[INTELLIGENCE BREACH] Friendly cyber intrusion exposed. Intercept vector found inside allied communication servers.`
    });
  }

  // 6. DOMESTIC_POLITICAL_SHIFT
  if (tick % 30 === 0) {
    memberIds.forEach(nid => {
      if (Math.random() < 0.1) {
        newRecords.push({
          id: `str_dom_${treaty.id}_${nid}_${tick}`,
          allianceTreatyId: treaty.id,
          affectedNationIds: [nid],
          stressor: 'DOMESTIC_POLITICAL_SHIFT',
          stressIntensity: 40,
          onsetTick: tick,
          unaddressedTickCount: 0,
          isResolved: false,
          resolvedAtTick: null,
          narrativeDescription: `[DOMESTIC SHIFT] Leadership rotation in ${nid} shifts security preferences regarding alliance integration.`
        });
      }
    });
  }

  return newRecords;
}

/**
 * Computes stress adjustments per tick.
 */
export function computeStressDelta(
  stressRecord: AllianceStressRecord,
  tick: number,
  lastSummitTickByNation: Record<string, number> = {},
  justRatifiedCount: number = 0
): number {
  let delta = 0;

  switch (stressRecord.stressor) {
    case 'INTELLIGENCE_BREACH':
    case 'NUCLEAR_UMBRELLA_DOUBT':
      delta = 2.0;
      break;
    case 'BURDEN_SHARING_DISPUTE':
    case 'STRATEGIC_DIVERGENCE':
      delta = 1.5;
      break;
    case 'TRADE_FRICTION':
    case 'DOMESTIC_POLITICAL_SHIFT':
    case 'SANCTIONS_DIVERGENCE':
    case 'OUT_OF_AREA_DISAGREEMENT':
    default:
      delta = 0.8;
      break;
  }

  // Check if player deployed active SummitRequest to manage things (mitigates stress)
  stressRecord.affectedNationIds.forEach(nid => {
    const lastSummit = lastSummitTickByNation[nid];
    if (lastSummit !== undefined && tick - lastSummit < 5) {
      delta -= 3.0;
    }
  });

  // Extra mitigation if side treaty got ratified
  if (justRatifiedCount > 0) {
    delta -= 5.0 * justRatifiedCount;
  }

  return delta;
}

/**
 * Evaluates stress consequences.
 */
export function evaluateStressBreakpoint(
  stressRecord: AllianceStressRecord
): { consequence: 'MEMBER_WITHDRAWAL' | 'REDUCED_COMMITMENT' | 'PUBLIC_DISSENT' | 'NONE'; narrative: string } {
  const score = stressRecord.stressIntensity;

  if (score <= 40) {
    return { consequence: 'NONE', narrative: '' };
  } else if (score <= 60) {
    return {
      consequence: 'PUBLIC_DISSENT',
      narrative: `[ALLIANCE WARNING] Signatory nations issue critical statement airing public issues in ${stressRecord.id}.`
    };
  } else if (score <= 80) {
    return {
      consequence: 'REDUCED_COMMITMENT',
      narrative: `[COMMITMENT DROP] Security readiness degraded to minimums. Cohesion levels dropping heavily.`
    };
  } else {
    return {
      consequence: 'MEMBER_WITHDRAWAL',
      narrative: `[ALLIANCE COLLAPSE] Severe fracture forces total exit of disgruntled signatories from treaty framework.`
    };
  }
}

/**
 * Calculates current cohesive score indices for the joint pact.
 */
export function computeAllianceCohesionScore(
  treatyId: string,
  memberCount: number,
  stressRecords: AllianceStressRecord[],
  mutualDefencePairsCount: number = 0,
  hasIntelSharingForAll: boolean = false
): number {
  let score = 100;

  const activeStress = stressRecords.filter(r => r.allianceTreatyId === treatyId && !r.isResolved);
  if (activeStress.length > 0) {
    const totalIntensity = activeStress.reduce((sum, r) => sum + r.stressIntensity, 0);
    score -= (totalIntensity / Math.max(1, memberCount)) * 0.5;
  }

  // Bonus conditions
  score += mutualDefencePairsCount * 10;
  if (hasIntelSharingForAll) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Resolves alliance stressors.
 */
export function resolveAllianceStressor(
  stressRecord: AllianceStressRecord,
  resolutionMethod: 'SUMMIT' | 'SIDE_PAYMENT' | 'STRATEGIC_REALIGNMENT' | 'COSMETIC_CONCESSION',
  tick: number
): AllianceStressRecord {
  const result = { ...stressRecord };

  if (resolutionMethod === 'COSMETIC_CONCESSION') {
    result.stressIntensity = Math.max(0, result.stressIntensity - 30);
    result.narrativeDescription += `\n[ACTION] Cosmetic actions temporary suppressed stress. Risk of re-rupture remains active.`;
  } else {
    result.isResolved = true;
    result.resolvedAtTick = tick;
    result.stressIntensity = 0;
    result.narrativeDescription += `\n[RESOLVED] Tension fully resolved via dedicated ${resolutionMethod} agreement.`;
  }

  return result;
}
