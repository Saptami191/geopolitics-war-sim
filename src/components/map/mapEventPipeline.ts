import { BallisticStrike } from '../../types';
import { dispatchNuclearImpact } from '../../utils/nuclearVfx';

export type MapTransientEventType = 
  | 'STRIKE_LAUNCHED' 
  | 'STRIKE_IMPACT' 
  | 'STRIKE_INTERCEPTED' 
  | 'NUCLEAR_ALERT_LEVEL_UP'
  | 'CYBER_INTRUSION_ALERT'
  | 'UNREST_EXPLOSION';

export interface MapTransientEvent {
  id: string;
  type: MapTransientEventType;
  latitude: number;
  longitude: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  label: string;
  timestamp: number; // millisecond epoch
  durationMs: number;
}

type MapEventSubscriber = (event: MapTransientEvent) => void;

class MapEventPipeline {
  private subscribers: Set<MapEventSubscriber> = new Set();
  private activeEvents: MapTransientEvent[] = [];

  /**
   * Subscribe a map view (2D or 3D renderer) to receive live dynamic events
   */
  public subscribe(callback: MapEventSubscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Dispatches a fresh tactical transient event to all active visual maps simultaneously
   */
  public emit(event: Omit<MapTransientEvent, 'timestamp'>): void {
    const fullEvent: MapTransientEvent = {
      ...event,
      timestamp: Date.now(),
    };
    
    this.activeEvents.push(fullEvent);
    this.subscribers.forEach((sub) => {
      try {
        sub(fullEvent);
      } catch (err) {
        console.error('[MAP-EVENT-PIPELINE] Error in subscriber callback:', err);
      }
    });

    // Cleanup ended events from active list
    setTimeout(() => {
      this.activeEvents = this.activeEvents.filter((e) => e.id !== fullEvent.id);
    }, fullEvent.durationMs);
  }

  /**
   * Helper to derive dynamic events from incoming store updates (e.g. tracking strike progress transitions)
   */
  public processStrikeStateChanges(
    prevStrikes: BallisticStrike[],
    nextStrikes: BallisticStrike[],
    getTargetCentroid: (id: string) => [number, number]
  ): void {
    nextStrikes.forEach((next) => {
      const prev = prevStrikes.find((p) => p.id === next.id);
      
      // Target coordinates
      const coords = getTargetCentroid(next.targetCountryId);
      const [lng, lat] = coords;

      if (!prev) {
        // Strike is brand new -> emitting launch flare
        this.emit({
          id: `launch-${next.id}`,
          type: 'STRIKE_LAUNCHED',
          longitude: lng,
          latitude: lat,
          severity: (next.warheadYieldMT ?? 0) > 0 ? 'CRITICAL' : 'WARNING',
          label: `${next.weaponType} MISSILE DETECTED INSIDE RADAR CELL`,
          durationMs: 4000,
        });
      } else if (prev.status === 'IN_FLIGHT' && next.status === 'IMPACT') {
        // Impact occurred -> emitting catastrophic strike shockwave
        const isNuke = (next.warheadYieldMT ?? 0) > 0;
        this.emit({
          id: `impact-${next.id}`,
          type: 'STRIKE_IMPACT',
          longitude: lng,
          latitude: lat,
          severity: isNuke ? 'CRITICAL' : 'WARNING',
          label: isNuke ? `☢ THERMONUCLEAR EXPLOSION IN BARRIER ZONE` : `⚔ CONVENTIONAL ROCKET IMPACT VERIFIED`,
          durationMs: 7000,
        });

        if (isNuke) {
          try {
            dispatchNuclearImpact(lat, lng, next.warheadYieldMT || 1.2);
          } catch (e) {
            console.error('[MAP-EVENT-PIPELINE] Error dispatching nuclear impact:', e);
          }
        }
      } else if (prev.status === 'IN_FLIGHT' && next.status === 'INTERCEPTED') {
        // Intercept occurred -> emitting shield success sparkles
        this.emit({
          id: `intercept-${next.id}`,
          type: 'STRIKE_INTERCEPTED',
          longitude: lng,
          latitude: lat,
          severity: 'INFO',
          label: `⚡ SHIELD INTERCEPT OF ${next.weaponType} CONFIRMED`,
          durationMs: 3000,
        });
      }
    });
  }

  public getActiveEvents(): MapTransientEvent[] {
    return this.activeEvents;
  }
}

// Export single shared pipeline across the core build workspace assets
export const mapEventPipeline = new MapEventPipeline();
export default mapEventPipeline;
