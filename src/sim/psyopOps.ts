import { PsyopEffect } from '../types';
import { useWorldStore } from '../store/worldStore';
import { usePropagandaStore } from '../store/propagandaStore';
import { useInfluenceStore } from '../store/influenceStore';

export function applyPsyopEffects(
  outcome: 'SUCCEEDED' | 'PARTIALLY_SUCCEEDED' | 'FAILED',
  targetNationId: string,
  currentTick: number
): PsyopEffect[] {
  const effects: PsyopEffect[] = [];

  if (outcome === 'SUCCEEDED') {
    const narrativeShiftMag = 40 + Math.floor(Math.random() * 31); // 40-70
    const unrestIncreaseMag = 20 + Math.floor(Math.random() * 21); // 20-40
    const trustErosionMag = 10 + Math.floor(Math.random() * 11);    // 10-20

    effects.push({
      targetNationId,
      effectType: 'MEDIA_NARRATIVE_SHIFT',
      magnitude: narrativeShiftMag,
      durationTicks: 12,
      description: `Target state broadcaster and digital networks successfully saturated with anti-regime and pro-reform sentiment.`
    });

    effects.push({
      targetNationId,
      effectType: 'UNREST_INCREASE',
      magnitude: unrestIncreaseMag,
      durationTicks: 10,
      description: `Local protest triggers successfully coordinated, sparking coordinated strikes across strategic industrial hubs.`
    });

    effects.push({
      targetNationId,
      effectType: 'TRUST_EROSION',
      magnitude: trustErosionMag,
      durationTicks: 8,
      description: `Public confidence in the ruling cabinet's defense integrity decays under structured narrative leaks.`
    });

  } else if (outcome === 'PARTIALLY_SUCCEEDED') {
    const unrestIncreaseMag = 10 + Math.floor(Math.random() * 16); // 10-25

    effects.push({
      targetNationId,
      effectType: 'UNREST_INCREASE',
      magnitude: unrestIncreaseMag,
      durationTicks: 6,
      description: `Targeted cellular disinformation campaigns spark localized rallies in suburban logistics centers.`
    });

  } else { // FAILED
    // High probability of zero effect, small probability of leak leading to self trust erosion
    if (Math.random() < 0.35) {
      effects.push({
        targetNationId: 'US', // player's nation
        effectType: 'TRUST_EROSION',
        magnitude: 10,
        durationTicks: 5,
        description: `Failed clandestine narrative operation leaked to neutral media, drawing scrutiny to national intelligence procedures.`
      });
    }
  }

  // Apply changes to stores
  effects.forEach(effect => {
    // 1. worldStore Integration
    try {
      const worldStore = useWorldStore.getState();
      if (worldStore) {
        if (effect.targetNationId !== 'US') {
          worldStore.updateCountry(effect.targetNationId, (country) => {
            if (country.political) {
              if (effect.effectType === 'UNREST_INCREASE') {
                country.political.popularUnrest = Math.min(100, (country.political.popularUnrest || 0) + effect.magnitude);
              } else if (effect.effectType === 'MEDIA_NARRATIVE_SHIFT') {
                country.political.stabilityIndex = Math.max(5, (country.political.stabilityIndex || 50) - Math.round(effect.magnitude * 0.25));
              }
            }
          });
        }
        
        worldStore.addGlobalEvent(
          `[PSYOP PROGRESS] Active campaign in ${effect.targetNationId}: ${effect.description}`,
          outcome === 'SUCCEEDED' ? 'INFO' : 'WARNING'
        );
      }
    } catch (e) {
      console.warn('Failed to update worldStore in applyPsyopEffects:', e);
    }

    // 2. propagandaStore Integration
    try {
      const propStore = usePropagandaStore as any;
      if (propStore && propStore.getState) {
        const pState = propStore.getState();
        if (pState.injectNarrative) {
          pState.injectNarrative(effect.targetNationId, effect.magnitude);
        } else if (pState.launchMediaOperation && outcome === 'SUCCEEDED') {
          // If no injectNarrative exists, map to standard media operation
          pState.launchMediaOperation('US', effect.targetNationId, 20, 'DESTABILIZE', 'PROPAGANDA', 'PLAYER');
        }
      }
    } catch (e) {
      console.warn('Failed to update propagandaStore in applyPsyopEffects:', e);
    }

    // 3. influenceStore Integration
    try {
      const infStore = useInfluenceStore as any;
      if (infStore && infStore.getState) {
        const iState = infStore.getState();
        if (iState.recordPsyopEffect) {
          iState.recordPsyopEffect(effect.targetNationId, effect);
        }
      }
    } catch (e) {
      console.warn('Failed to update influenceStore in applyPsyopEffects:', e);
    }
  });

  return effects;
}
