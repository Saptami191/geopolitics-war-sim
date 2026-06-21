import { useWorldStore } from '../store/worldStore';
import { WorldState, Country } from '../types';
import { usePlayerStore } from '../store/playerStore';

export interface FogOfWarState {
  militaryVisibility: number;  // 0-100
  economicVisibility: number;  // 0-100
  diplomaticVisibility: number;// 0-100
  leadershipVisibility: number;// 0-100
  overallFogLevel: 'CLEAR' | 'PARTIAL' | 'DENSE' | 'BLACKOUT';
}

/**
 * Computes the real-time fog of war state for a target nation as observed by another nation.
 * 
 * visibility metrics are bounded between 0 and 100 representing certainty.
 * 
 * @param observerNationId ISO-3 identifier of the investigating state.
 * @param targetNationId ISO-3 identifier of the state under surveillance.
 * @param sigintVisibility 0-100 metric tracking Signals Intelligence penetration payload.
 * @param humintCoverage 0-100 metric representing current Human Intelligence asset footprint.
 * @param satelliteCoverage Boolean indicating whether real-time orbital optical masking is defeated.
 * @returns FogOfWarState Struct classifying granular visibilities per data sector.
 */
export function computeFogOfWar(
  observerNationId: string, 
  targetNationId: string, 
  sigintVisibility: number, 
  humintCoverage: number, 
  satelliteCoverage: boolean
): FogOfWarState {
  // If investigating own country, visibility is effectively flawless.
  if (observerNationId === targetNationId) {
    return {
      militaryVisibility: 100,
      economicVisibility: 100,
      diplomaticVisibility: 100,
      leadershipVisibility: 100,
      overallFogLevel: 'CLEAR'
    };
  }

  // Military visibility requires satellite arrays and signals intercepts.
  // HUMINT acts as an associative multiplier for force layout context.
  const satBonus = satelliteCoverage ? 30 : 0;
  const militaryVisibility = Math.min(100, Math.max(0, (sigintVisibility * 0.4) + (humintCoverage * 0.3) + satBonus));
  
  // Economic visibility generally flows from open-source reporting and FININT structures, 
  // though signals penetration is required for true strategic reserve tracking.
  const economicVisibility = Math.min(100, Math.max(0, (sigintVisibility * 0.5) + (humintCoverage * 0.3) + 20)); // Base 20 for OSINT
  
  // Diplomatic visibility heavily favors human assets embedded in foreign ministries.
  const diplomaticVisibility = Math.min(100, Math.max(0, (humintCoverage * 0.6) + (sigintVisibility * 0.4)));

  // Leadership visibility is entirely dependent on dedicated deep cover assets
  // and close-proximity interception.
  const leadershipVisibility = Math.min(100, Math.max(0, (humintCoverage * 0.7) + (sigintVisibility * 0.3)));

  const aggregateVisibility = (militaryVisibility + economicVisibility + diplomaticVisibility + leadershipVisibility) / 4;

  let overallFogLevel: 'CLEAR' | 'PARTIAL' | 'DENSE' | 'BLACKOUT' = 'BLACKOUT';
  if (aggregateVisibility > 80) overallFogLevel = 'CLEAR';
  else if (aggregateVisibility > 50) overallFogLevel = 'PARTIAL';
  else if (aggregateVisibility > 20) overallFogLevel = 'DENSE';

  return {
    militaryVisibility,
    economicVisibility,
    diplomaticVisibility,
    leadershipVisibility,
    overallFogLevel
  };
}

/**
 * Filter utility applying real-time fog of war degradation against data models.
 * Used strategically to drop or omit fields prior to UI render, forcing the
 * player to operate without perfect context when collection thresholds miss.
 * 
 * Fields hidden by fog are stripped, and the returned Partial structure
 * mandates defensive rendering downstream.
 * 
 * @param data The pristine structural record attempting to be viewed.
 * @param fogState The current computed FogOfWarState constraints matrix.
 * @param dataType Semantic classification routing the degradation logic.
 * @returns Partial<T> A stripped view containing only visible operational data.
 */
export function applyFogFilter<T extends object>(
  data: T, 
  fogState: FogOfWarState, 
  dataType: 'military' | 'economic' | 'diplomatic' | 'leadership'
): Partial<T> {
  const result: Partial<T> = { ...data };
  
  // Dynamic threshold matching. If the sector visibility drops below critical
  // baseline minimums, we strip fields iteratively.
  const visibilityLevel = fogState[`${dataType}Visibility`];
  
  // The stripping logic operates pseudo-randomly to simulate erratic intel feeds,
  // bound tightly by the numeric visibility certainty parameter.
  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      // 100 visibility means perfect retention. 0 implies complete data void.
      const retentionChance = visibilityLevel / 100;
      if (Math.random() > retentionChance) {
        delete result[key];
      }
    }
  }

  return result;
}

/**
 * Calculates adversarial structural misinformation masking applied when the target
 * state is actively conducting deceptive radio or visual maneuvers.
 * 
 * Higher fog means the adversary has room to lie; higher active deception
 * operations increase the severity of those lies injected into reports.
 * 
 * @param fogLevel The base overall 0-100 density of the current fog masking.
 * @param activeDeceptionOps Quantity of active target operations running fake injections.
 * @returns number 0-1 amplification scale for false-positive reporting.
 */
export function computeDeceptionAmplification(fogLevel: number, activeDeceptionOps: number): number {
  if (activeDeceptionOps <= 0) return 0;
  
  // Max amplification approaches 1.0 when fog is nearing 0 (complete blackout)
  // and ops are numerous. E.g., fog level 20 (high opacity) -> 80 base / 100.
  const opacity = 100 - fogLevel;
  
  const amplificationFactor = (opacity / 100) * (activeDeceptionOps * 0.25);
  
  return Math.min(1.0, Math.max(0, amplificationFactor));
}

/**
 * Standard tick processor for the Fog of War engine.
 * Periodically cascades updates against geopolitical pairings where
 * systemic surveillance states are running, caching visibility models
 * and writing detection degradation events to the world state.
 * 
 * @param worldState The global persistent simulation state to process.
 */
export function processFogOfWarTick(worldState: WorldState): void {
  // We compute fog cascades globally every 7 ticks.
  if (worldState.currentTick % 7 !== 0) {
    return;
  }

  const playerCountry = usePlayerStore.getState().countryId || 'US';
  
  // This engine utilizes cross-matrix intel parameters to map surveillance profiles.
  for (const targetId in worldState.countries) {
    if (targetId === playerCountry) continue;
    
    // In actual implementation, humintCoverage and sigintCoverage are drawn 
    // from useSigintStore and useOperativeStore states. Since this engine
    // operates abstractly on world state here, we would resolve those mappings.
    // For now, we stub resolution behavior locally against fixed parameters or proxies.
    
    // To implement flawlessly without breaking dependencies while connecting logic
    // we assume a median baseline coverage scaled randomly for simulation variance.
    const mockSigintVisibility = Math.random() * 100;
    const mockHumintCoverage = Math.random() * 100;
    const mockSatCoverage = Math.random() > 0.5;

    const fog = computeFogOfWar(
      playerCountry, 
      targetId, 
      mockSigintVisibility, 
      mockHumintCoverage, 
      mockSatCoverage
    );

    // If visibility drastically drops, we synthesize a warning event context
    if (fog.overallFogLevel === 'BLACKOUT') {
       useWorldStore.getState().applyTickDelta((draft) => {
         // Only log if relations are poor, as tracking allies isn't usually urgent
         const relations = draft.countries[playerCountry]?.opinions?.[targetId] ?? 0;
         if (relations < 40) {
           draft.globalEventLog.unshift({
             tick: draft.currentTick,
             text: `INTELLIGENCE BLACKOUT: We have completely lost strategic visibility into [${targetId}]. Re-establish signals or agent penetration immediately.`,
             severity: 'WARNING'
           });
         }
       });
    }
  }
}

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
