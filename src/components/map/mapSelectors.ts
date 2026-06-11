import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { deriveCanonicalMapState, CanonicalMapState } from './mapWorldState';
import { LayerToggleState } from './MapLayerPanel';

/**
 * Shared hook to select the canonical geopolitical map representation.
 * Both 2D and 3D maps subscribe to this hook. This guarantees frames/updates stay in lockstep.
 */
export function useCanonicalMapState(
  layers: LayerToggleState,
  theme: 'dark' | 'light' = 'dark'
): CanonicalMapState {
  
  // Zustand Store Subscriptions
  const countries = useWorldStore((s) => s.countries);
  const activeStrikes = useWorldStore((s) => s.activeStrikes);
  const globalThreatLevel = useWorldStore((s) => s.globalThreatLevel);
  const nuclearExchangeOccurred = useWorldStore((s) => s.nuclearExchangeOccurred);
  const currentTick = useWorldStore((s) => s.currentTick);
  
  const playerCountryId = usePlayerStore((s) => s.countryId);
  const hudMode = usePlayerStore((s) => s.hudMode);
  const targetCountryId = usePlayerStore((s) => s.selectedTargetCountryId);

  // Cast layers to Record<string, boolean> safely to satisfy TypeScript
  const layersRecord: Record<string, boolean> = {
    political: !!layers.political,
    conflicts: !!layers.conflicts,
    economic: !!layers.economic,
    cyber: !!layers.cyber,
    population: !!layers.population,
    nuclear: !!layers.nuclear,
    military: !!layers.military,
  };

  // Return derived complete map model
  return deriveCanonicalMapState(
    countries,
    activeStrikes,
    playerCountryId,
    targetCountryId,
    undefined, // hoveredCountryId handled via view local feedback loop
    globalThreatLevel,
    nuclearExchangeOccurred,
    hudMode,
    currentTick,
    theme,
    layersRecord
  );
}
export default useCanonicalMapState;
