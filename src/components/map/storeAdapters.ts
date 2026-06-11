import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { getCentroid } from './countryCentroids';

/**
 * Procedural adapters to mutate core store states from anywhere within the map layer ecosystem.
 * Eliminates custom store definitions inside view components.
 */
export const storeAdapters = {
  /**
   * Safe getter for standard country coordinate centring
   */
  getCountryCoordinates: (countryId: string): [number, number] => {
    return getCentroid(countryId);
  },

  /**
   * Adjusts target-locked country or opens country analytical sheet
   */
  handleCountrySelection: (countryId: string) => {
    const playerStore = usePlayerStore.getState();
    const uiStore = useUIStore.getState();

    if (playerStore.hudMode === 'WAR_ROOM') {
      if (countryId !== playerStore.countryId) {
        playerStore.setTargetCountry(countryId);
      }
    } else {
      uiStore.setCountryInspector(countryId);
    }
  },

  /**
   * Safely adds high-priority war logging events
   */
  broadcastTacticalWarning: (message: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SYSTEM' = 'INFO') => {
    useWorldStore.getState().addGlobalEvent(message, severity as any);
  },

  /**
   * Updates global threat clearance posture level
   */
  shiftGlobalDefcon: (level: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'BLACK') => {
    useWorldStore.getState().setGlobalThreatLevel(level);
  },
};

export default storeAdapters;
