import { useEffect, useRef } from 'react';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { mapEventPipeline } from './mapEventPipeline';
import { getCentroid } from './countryCentroids';
import { useCanonicalMapState } from './mapSelectors';
import { CanonicalMapState } from './mapWorldState';
import { LayerToggleState } from './MapLayerPanel';
import { BallisticStrike } from '../../types';

interface MapSyncPayload {
  mapState: CanonicalMapState;
  triggerStrike: (sourceId: string, targetId: string, weaponType: string) => void;
  focusCountry: (countryId: string) => void;
}

/**
 * Universal synchronization orchestrator hook.
 * Monitors raw simulation ticking, intercepts actions, and feeds data to the event pipeline.
 */
export function useMapSync(
  layers: LayerToggleState,
  theme: 'dark' | 'light' = 'dark'
): MapSyncPayload {
  const mapState = useCanonicalMapState(layers, theme);
  const prevStrikesRef = useRef<BallisticStrike[]>([]);
  
  // Real world Store Actions for integration mutations
  const setTargetCountry = usePlayerStore((s) => s.setTargetCountry);
  const setCountryInspector = useUIStore((s) => s.setCountryInspector);
  const addGlobalEvent = useWorldStore((s) => s.addGlobalEvent);

  // Monitor ballistic strikes transition to trigger transient map effects
  useEffect(() => {
    // We fetch raw active strikes from worldStore to track historical transition values
    const rawActiveStrikes = useWorldStore.getState().activeStrikes;
    const prevStrikes = prevStrikesRef.current;

    mapEventPipeline.processStrikeStateChanges(prevStrikes, rawActiveStrikes, getCentroid);
    prevStrikesRef.current = rawActiveStrikes;
  }, [mapState.activeStrikes, mapState.currentTick]);

  // Unified country focus/select controller
  const focusCountry = (countryId: string) => {
    if (!countryId) return;
    
    if (mapState.activeHudMode === 'WAR_ROOM') {
      if (countryId !== mapState.playerCountryId) {
        setTargetCountry(countryId);
      }
    } else {
      setCountryInspector(countryId);
    }
    
    // Log target lock event to pipeline
    mapEventPipeline.emit({
      id: `focus-${countryId}-${Date.now()}`,
      type: 'CYBER_INTRUSION_ALERT',
      longitude: getCentroid(countryId)[0],
      latitude: getCentroid(countryId)[1],
      severity: 'INFO',
      label: `RADAR COUPLING FOCUS SET TO: ${countryId}`,
      durationMs: 2500,
    });
  };

  // Mock-free trigger for missile strikes to verify frame integration
  const triggerStrike = (sourceId: string, targetId: string, weaponType: string) => {
    addGlobalEvent(`Strategic Command Commandment: Launch order authorized. Type: ${weaponType}. Source: ${sourceId} → target: ${targetId}.`, 'CRITICAL');
  };

  return {
    mapState,
    triggerStrike,
    focusCountry,
  };
}

export default useMapSync;
