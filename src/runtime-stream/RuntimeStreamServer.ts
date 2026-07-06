import { WebSocketServer, WebSocket } from 'ws';
import { simulationCore } from '../core/SimulationCore';
import { RuntimeConnectionManager } from './RuntimeConnectionManager';
import { RuntimePublisher } from './RuntimePublisher';
import { deriveCanonicalMapState } from '../components/map/mapWorldState';
import { useWorldStore } from '../store/worldStore';
import { usePlayerStore } from '../store/playerStore';
import { useUnitStore } from '../store/unitStore';
import { RuntimeEventType } from '../core/events/IRuntimeEvent';

/**
 * Node-based standalone server facilitating WebSocket live-streaming
 * of mapped, serializable simulation frames.
 */
export class RuntimeStreamServer {
  private wss: WebSocketServer | null = null;
  private connectionManager: RuntimeConnectionManager;
  private port: number;
  private firstFrameBuilt = false;

  constructor(port = 8080) {
    this.port = port;
    this.connectionManager = new RuntimeConnectionManager();
  }

  /** Bootstraps the server transport and registers runtime listeners */
  start() {
    this.wss = new WebSocketServer({ port: this.port });
    console.log("Server listening");

    this.wss.on('connection', (ws: WebSocket) => {
      this.connectionManager.addClient(ws);
      console.log("Client connected");

      try {
        // Immediately send the first frame on connect to establish current context
        const initialFrame = this.buildCurrentFrame();
        ws.send(initialFrame);
      } catch (err: any) {
        console.error("ERROR building/sending initial frame:", err.stack || err);
      }

      ws.on('close', () => {
        this.connectionManager.removeClient(ws);
        console.log("Client disconnected");
      });

      ws.on('error', (err) => {
        console.error('[Runtime Stream Server] WebSocket Error:', err.stack || err);
        this.connectionManager.removeClient(ws);
      });
    });

    // Subscribe to simulation tick events to broadcast frames
    simulationCore.subscribe((event) => {
      if (event.type === RuntimeEventType.SimulationTickCompleted) {
        try {
          const frame = this.buildCurrentFrame();
          this.connectionManager.broadcast(frame);
        } catch (err: any) {
          console.error("ERROR building frame on tick:", err.stack || err);
        }
      }
    });
  }


  /** Derives CanonicalMapState and returns the serialized JSON payload */
  private buildCurrentFrame(): string {
    const world = useWorldStore.getState();
    const player = usePlayerStore.getState();
    const unitState = useUnitStore.getState();

    // Map units mapping
    const unitMap: Record<string, any> = {};
    unitState.units.forEach((u) => {
      unitMap[u.id] = u;
    });

    const layersRecord: Record<string, boolean> = {
      political: true,
      conflicts: false,
      economic: false,
      cyber: false,
      population: false,
      nuclear: false,
      military: false,
    };

    // Construct CanonicalMapState using stores
    const canonicalState = deriveCanonicalMapState(
      world.countries,
      world.activeStrikes,
      player.countryId || 'US',
      player.selectedTargetCountryId,
      undefined,
      world.globalThreatLevel,
      world.nuclearExchangeOccurred,
      player.hudMode,
      world.currentTick,
      'dark',
      layersRecord
    );

    // Overwrite mapped units with true unit map (similar to deriveCanonicalMapState inside hooks)
    canonicalState.units = unitMap;

    const frame = RuntimePublisher.publish(canonicalState);
    if (!this.firstFrameBuilt) {
      this.firstFrameBuilt = true;
      console.log("First frame built");
    }
    return frame;
  }

  /** Tears down WebSocket server connections */
  stop() {
    this.connectionManager.cleanup();
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
    console.log('[Runtime Stream Server] Stopped.');
  }
}
