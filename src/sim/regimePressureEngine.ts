import { useWorldStore } from '../store/worldStore';
import { WorldState, Country, CovertOp } from '../types';
import { usePlayerStore } from '../store/playerStore';

export interface RegimePressureScore {
  totalPressure: number;
  economicStressContribution: number;
  eliteDefectionContribution: number;
  popularUnrestContribution: number;
  internationalIsolationContribution: number;
}

/**
 * Computes the overall regime pressure score for a specific target nation
 * based on a multi-factor weighted algorithm encompassing economic,
 * domestic, elite, and international stressors.
 * 
 * Formula mapping:
 * - Economic Stress: Derived from inflation, GDP contraction, and trade deficits.
 * - Elite Defection: Derived from corruption indices, factional loyalty drops.
 * - Popular Unrest: Derived from public stability metrics and civil society protests.
 * - International Isolation: Derived from sanctions index, diplomatic embargoes.
 * 
 * @param targetNationId  The ISO-3 style string identifier for the target nation.
 * @param worldState      The current global simulation state containing country data.
 * @returns RegimePressureScore structured data showing total and individual contributions.
 */
export function computeRegimePressure(targetNationId: string, worldState: WorldState): RegimePressureScore {
  const targetData: CountryData | undefined = worldState.countries[targetNationId];
  
  if (!targetData) {
    return {
      totalPressure: 0,
      economicStressContribution: 0,
      eliteDefectionContribution: 0,
      popularUnrestContribution: 0,
      internationalIsolationContribution: 0
    };
  }

  // Base metrics derived defensively with safety bounds from CountryData where available.
  const inflationRaw = targetData.economic?.inflationRate ?? 0;
  const growthRaw = targetData.economic?.gdpGrowthRate ?? 0;
  
  // Synthesize Economic Stress (0-100)
  // High inflation and negative growth drive economic stress.
  let economicStress = (inflationRaw * 2.5) + (growthRaw < 0 ? Math.abs(growthRaw) * 5 : 0);
  if (targetData.economic?.sanctionsPenaltyMultiplier) {
     economicStress += (targetData.economic.sanctionsPenaltyMultiplier - 1) * 50;
  }
  economicStress = Math.max(0, Math.min(100, economicStress));

  // Synthesize Elite Defection (0-100)
  // Driven by inverse of stability or military loyalty if available.
  let eliteDefection = 0;
  if (targetData.military?.readiness) {
    eliteDefection += (100 - targetData.military.readiness) * 0.4;
  }
  if (targetData.domestic?.stability) {
    eliteDefection += (100 - targetData.domestic.stability) * 0.6;
  }
  eliteDefection = Math.max(0, Math.min(100, eliteDefection));

  // Synthesize Popular Unrest (0-100)
  let popularUnrest = 0;
  if (targetData.domestic?.stability) {
     popularUnrest = 100 - targetData.domestic.stability;
  }
  popularUnrest += (inflationRaw > 10 ? (inflationRaw - 10) * 2 : 0);
  popularUnrest = Math.max(0, Math.min(100, popularUnrest));

  // Synthesize International Isolation (0-100)
  let internationalIsolation = 0;
  if (targetData.diplomacy?.alignmentWest && targetData.diplomacy?.alignmentEast) {
      const neutralDistance = Math.abs(50 - targetData.diplomacy.alignmentWest) + Math.abs(50 - targetData.diplomacy.alignmentEast);
      internationalIsolation = Math.max(0, 100 - neutralDistance);
  }
  
  const economicContribution = economicStress * 0.30;
  const eliteContribution = eliteDefection * 0.25;
  const unrestContribution = popularUnrest * 0.25;
  const isolationContribution = internationalIsolation * 0.20;

  const totalPressure = economicContribution + eliteContribution + unrestContribution + isolationContribution;

  return {
    totalPressure,
    economicStressContribution: economicContribution,
    eliteDefectionContribution: eliteContribution,
    popularUnrestContribution: unrestContribution,
    internationalIsolationContribution: isolationContribution
  };
}

/**
 * Calculates the operational exposure risk for the player nation when conducting
 * covert operations within a target nation.
 * 
 * Formula: P(exposure) = Σ(op.attributionRisk) / (ops.length × playerCounterIntelLevel)
 * 
 * @param playerCountryId Identifier for the player's sponsoring nation.
 * @param targetNationId  Identifier for the nation being targeted by covert ops.
 * @param activeOps       Array of CovertOps currently executing.
 * @returns number 0-1 representing the probability of operational exposure.
 */
export function computePlayerExposureRisk(
  playerCountryId: string, 
  targetNationId: string, 
  activeOps: CovertOp[]
): number {
  if (!activeOps || activeOps.length === 0) {
    return 0;
  }

  const worldState = useWorldStore.getState();
  const playerData: CountryData | undefined = worldState.countries[playerCountryId];
  
  // We extract counter-intelligence from cybersecurity or general defense readiness
  // as a proxy, enforcing a minimum basement value so division doesn't fail.
  const playerCounterIntelLevel = Math.max(10, (playerData?.military?.readiness ?? 50));

  let totalAttributionRisk = 0;
  for (const op of activeOps) {
    // Utilize blowbackRisk as our attributionRisk metric from the CovertOp type
    const risk = typeof op.blowbackRisk === 'number' ? op.blowbackRisk : 50;
    totalAttributionRisk += risk;
  }

  // Calculate base risk using the specified formula
  let baseRisk = totalAttributionRisk / (activeOps.length * playerCounterIntelLevel);

  // Apply a dynamic scaling factor to ensure the probability feels realistic based
  // on standard simulation parameters for visibility and cover density.
  if (baseRisk > 1) {
    baseRisk = 0.95 + (Math.random() * 0.04);
  }
  
  return Math.max(0, Math.min(1, baseRisk));
}


/**
 * Maps a continuous regime pressure score mathematically into a distinct
 * operational classification label used for UI reporting, strategic triggers,
 * and bayesian consequence branching.
 * 
 * @param score The aggregated total regime pressure score (typically 0-100).
 * @returns Literal string type for the severity classification bracket.
 */
export function getRegimePressureLabel(score: number): 'STABLE' | 'STRESSED' | 'CRISIS' | 'COLLAPSE_IMMINENT' {
  if (score < 40) {
    return 'STABLE';
  } else if (score < 65) {
    return 'STRESSED';
  } else if (score < 85) {
    return 'CRISIS';
  } else {
    return 'COLLAPSE_IMMINENT';
  }
}

/**
 * Standard tick processor for the Regime Pressure simulation engine.
 * Evaluates the regime stability of all non-player nations on each state tick.
 * Generates destabilization consequence events when high systemic pressure is detected.
 * 
 * @param worldState The global persistent simulation state to process.
 */
export function processRegimePressureTick(worldState: WorldState): void {
  const currentTick = worldState.currentTick;
  
  // Processing throttle: We only compute heavy systemic regime evaluations
  // every 5 ticks to save performance budgeting overhead during late-game.
  if (currentTick % 5 !== 0) {
    return;
  }

  // Resolve player identity
  const playerNationId = usePlayerStore.getState().countryId || 'US';

  for (const [nationId, nationData] of Object.entries(worldState.countries)) {
    // We only process regime pressure for non-player AI nations
    if (nationId === playerNationId) continue;
    
    // Safety check on corrupt data nodes
    if (!nationData) continue;

    const pressureScore = computeRegimePressure(nationId, worldState);
    const label = getRegimePressureLabel(pressureScore.totalPressure);
    
    // Inject consequence events directly into the world state delta stream
    // when a critical systemic threshold evaluates as true.
    if (pressureScore.totalPressure > 75) {
      // At CRISIS/COLLAPSE_IMMINENT level, there is a rolling chance for actual 
      // destabilization outbreak events to catalyze in the narrative log.
      const outbreakChance = (pressureScore.totalPressure - 75) * 0.02; // max ~0.50 probability
      
      if (Math.random() < outbreakChance) {
        // Compose event string based on dominant pressure facet.
        let dominantFactor = 'systemic economic collapse';
        const maxFactor = Math.max(
          pressureScore.economicStressContribution,
          pressureScore.eliteDefectionContribution,
          pressureScore.popularUnrestContribution,
          pressureScore.internationalIsolationContribution
        );

        if (maxFactor === pressureScore.eliteDefectionContribution) dominantFactor = 'widespread military and political elite defection';
        if (maxFactor === pressureScore.popularUnrestContribution) dominantFactor = 'massive popular uprisings and civil unrest';
        if (maxFactor === pressureScore.internationalIsolationContribution) dominantFactor = 'total international diplomatic isolation and blockades';

        const severityLevel: 'WARNING' | 'CRITICAL' | 'INFO' = label === 'COLLAPSE_IMMINENT' ? 'CRITICAL' : 'WARNING';
        
        const eventText = `REGIME DESTABILIZATION IN [${nationId}]: The government is struggling to maintain authority amidst ${dominantFactor}. Regional security forces are entering a state of high alert.`;

        useWorldStore.getState().applyTickDelta((draft) => {
           draft.globalEventLog.unshift({
             tick: currentTick,
             text: eventText,
             severity: severityLevel
           });
           
           // Apply actual mechanical penalties to the simulated nation
           if (draft.countries[nationId] && draft.countries[nationId].political) {
              draft.countries[nationId].political.stabilityIndex = Math.max(0, Math.floor(draft.countries[nationId].political.stabilityIndex * 0.90));
           }
        });
      }
    }
  }
}

// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 
