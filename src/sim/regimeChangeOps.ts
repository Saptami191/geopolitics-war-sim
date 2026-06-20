import { RegimeChangeEffect } from '../types';
import { useWorldStore } from '../store/worldStore';
import { useDiplomaticStore } from '../store/diplomaticStore';
import { useCinematicsStore } from '../store/cinematicsStore';

export function applyRegimeChangeEffects(
  outcome: 'SUCCEEDED' | 'PARTIALLY_SUCCEEDED' | 'FAILED',
  targetNationId: string,
  operationType: 'REGIME_DESTABILISATION' | 'COUP_SUPPORT',
  currentTick: number
): RegimeChangeEffect[] {
  const effects: RegimeChangeEffect[] = [];

  if (operationType === 'COUP_SUPPORT') {
    if (outcome === 'SUCCEEDED') {
      effects.push({
        targetNationId,
        effectType: 'LEADER_CHANGE',
        magnitude: 100,
        description: `Democratically-aligned military junta or civil alliance establishes absolute transition control. Pro-US council takes the helm.`
      });
      effects.push({
        targetNationId,
        effectType: 'MILITARY_DEFECTION',
        magnitude: 75,
        description: `Over 75% of active armor divisions defect and sworn allegiance to the transitional regime.`
      });
      effects.push({
        targetNationId,
        effectType: 'STABILITY_DAMAGE',
        magnitude: 50,
        description: `Administrative systems suffer high-magnitude structural damage during transition.`
      });
    } else if (outcome === 'PARTIALLY_SUCCEEDED') {
      effects.push({
        targetNationId,
        effectType: 'FACTION_FRACTURE',
        magnitude: 60,
        description: `Dissident officers lock down provincial cities but the old regime holds major hubs. Deep national paralysis.`
      });
      effects.push({
        targetNationId,
        effectType: 'POPULAR_UNREST',
        magnitude: 80,
        description: `Unplanned violent clashes between loyalist brigades and democratic forces disrupt regional commerce.`
      });
    } else { // FAILED
      effects.push({
        targetNationId,
        effectType: 'STABILITY_DAMAGE',
        magnitude: 40,
        description: `Failure of proxy forces increases target regime's totalitarian control. Blowback impairs the international standing of the Player nation.`
      });
    }
  } else if (operationType === 'REGIME_DESTABILISATION') {
    if (outcome === 'SUCCEEDED') {
      effects.push({
        targetNationId,
        effectType: 'POPULAR_UNREST',
        magnitude: 85,
        description: `Widespread worker and logistics transport strikes lock down 80% of municipal transport corridors.`
      });
      effects.push({
        targetNationId,
        effectType: 'FACTION_FRACTURE',
        magnitude: 50,
        description: `cabinet splits into fierce infighting following economic policy leaks.`
      });
    } else if (outcome === 'PARTIALLY_SUCCEEDED') {
      effects.push({
        targetNationId,
        effectType: 'POPULAR_UNREST',
        magnitude: 40,
        description: `Localized protests and student clashes reported, easily suppressed but contributing to high-frequency political friction.`
      });
    } else { // FAILED
      effects.push({
        targetNationId,
        effectType: 'STABILITY_DAMAGE',
        magnitude: 15,
        description: `Failed operations unmasked by counter-espionage agencies, leaving target government political structures more unified.`
      });
    }
  }

  // Apple the effects to various global stores
  effects.forEach(effect => {
    try {
      const worldStore = useWorldStore.getState();
      if (worldStore) {
        worldStore.updateCountry(targetNationId, (country) => {
          if (country.political) {
            if (effect.effectType === 'STABILITY_DAMAGE') {
              country.political.stabilityIndex = Math.max(5, (country.political.stabilityIndex || 50) - effect.magnitude);
            } else if (effect.effectType === 'POPULAR_UNREST') {
              country.political.popularUnrest = Math.min(100, (country.political.popularUnrest || 0) + effect.magnitude);
            } else if (effect.effectType === 'LEADER_CHANGE') {
              country.political.leaderName = `Transitional Council Chairman`;
              country.political.stabilityIndex = Math.max(30, (country.political.stabilityIndex || 50) - 20); // moderate stabilization attempt
            } else if (effect.effectType === 'FACTION_FRACTURE') {
              country.political.stabilityIndex = Math.max(10, (country.political.stabilityIndex || 50) - Math.round(effect.magnitude / 2));
              country.political.coupRiskLevel = Math.min(95, (country.political.coupRiskLevel || 0) + 15);
            }
          }
        });

        worldStore.addGlobalEvent(
          `[CIA DIRECTIVE] ${effect.description} (${targetNationId})`,
          outcome === 'SUCCEEDED' ? 'CRITICAL' : 'WARNING'
        );
      }
    } catch (e) {
      console.warn('Failed to update worldStore in applyRegimeChangeEffects:', e);
    }
  });

  // Record action in diplomatic store
  try {
    const diplomaticStore = useDiplomaticStore.getState();
    if (diplomaticStore) {
      const relationshipPenalty = outcome === 'SUCCEEDED' ? -45 : outcome === 'PARTIALLY_SUCCEEDED' ? -25 : -15;
      diplomaticStore.diplo_updateRelationship(
        'US', 
        targetNationId, 
        relationshipPenalty, 
        `CIA Operational Exposure: ${operationType} (${outcome})`, 
        currentTick
      );
    }
  } catch (e) {
    console.warn('Failed to record action in diplomaticStore:', e);
  }

  // Trigger cinematic events
  try {
    const cinematicsStore = useCinematicsStore.getState();
    if (cinematicsStore) {
      const cinematicType = operationType === 'COUP_SUPPORT' && outcome === 'SUCCEEDED' ? 'COUP_NARRATIVE' : 'REGIME_CHANGE_SEQUENCE';
      cinematicsStore.triggerCinematic(cinematicType, { 
        nationId: targetNationId, 
        outcome, 
        type: operationType 
      });
    }
  } catch (e) {
    console.warn('Failed to trigger cinematic in applyRegimeChangeEffects:', e);
  }

  return effects;
}
