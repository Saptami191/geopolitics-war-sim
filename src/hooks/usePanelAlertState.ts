import { useWorldStore } from '../store/worldStore';
import { usePlayerStore } from '../store/playerStore';
import { WorldState, Country } from '../types';

export type AlertSeverity = 'critical' | 'warning' | 'nominal';

/**
 * Reusable hook to monitor and resolve warning/critical alert states for panels.
 * Accepts either a single master evaluator function or a selector with threshold rules.
 */
export function usePanelAlertState<T = any>(
  selectorOrEvaluator: ((worldState: WorldState, playerCountry: Country) => AlertSeverity) | ((worldState: WorldState, playerCountry: Country) => T),
  warningThreshold?: T | ((val: T) => boolean),
  criticalThreshold?: T | ((val: T) => boolean)
): { severity: AlertSeverity; isAlertActive: boolean } {
  // Subscribe to changes in world state and selected player country
  const worldState = useWorldStore();
  const playerCountryId = usePlayerStore((s) => s.countryId);
  const playerCountry = worldState.countries[playerCountryId];

  if (!playerCountry) {
    return { severity: 'nominal', isAlertActive: false };
  }

  // 1. Full-evaluator signature: usePanelAlertState((world, country) => severity)
  if (typeof selectorOrEvaluator === 'function' && warningThreshold === undefined && criticalThreshold === undefined) {
    const customEvaluator = selectorOrEvaluator as (worldState: WorldState, playerCountry: Country) => AlertSeverity;
    try {
      const severity = customEvaluator(worldState, playerCountry);
      return { severity, isAlertActive: severity !== 'nominal' };
    } catch (e) {
      console.error('[usePanelAlertState] Custom evaluator error:', e);
      return { severity: 'nominal', isAlertActive: false };
    }
  }

  // 2. Threshold signature: evaluate a specific property
  const selector = selectorOrEvaluator as (worldState: WorldState, playerCountry: Country) => T;
  const val = selector(worldState, playerCountry);

  const checkMatch = (threshold: any, currentVal: any): boolean => {
    if (typeof threshold === 'function') {
      try {
        return threshold(currentVal);
      } catch (e) {
        return false;
      }
    }
    return currentVal === threshold;
  };

  const isCritical = checkMatch(criticalThreshold, val);
  if (isCritical) {
    return { severity: 'critical', isAlertActive: true };
  }

  const isWarning = checkMatch(warningThreshold, val);
  if (isWarning) {
    return { severity: 'warning', isAlertActive: true };
  }

  return { severity: 'nominal', isAlertActive: false };
}
