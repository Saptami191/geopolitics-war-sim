import { useNuclearStore } from '../store/nuclearStore';

/**
 * Main tactical dispatcher for nuclear detonations.
 * Handles state transformation (scars, total megatons, DEFCON decrease),
 * triggers screen-space white flashes, and broadcasts custom event for 3D visualizers.
 */
export function dispatchNuclearImpact(lat: number, lon: number, yieldMT: number = 1.2) {
  console.log(`[NUCLEAR ENGINE] Detonating ${yieldMT}MT warhead at lat: ${lat}, lon: ${lon}`);

  // 1. Record scar to local storage/state and decrement DEFCON level
  useNuclearStore.getState().addScar(lat, lon, yieldMT);

  // 2. Blinding screen space full viewport white flash
  useNuclearStore.getState().triggerFlash();

  // 3. Dispatch global DOM Event for active 3D/2D visualizers (including Three.js Globe)
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('nuclear-impact', {
      detail: { lat, lon, yieldMT }
    });
    window.dispatchEvent(event);
  }
}
