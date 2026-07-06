import { WebSocket } from 'ws';

/**
 * Handles connected WebSocket clients.
 * Manages active sets, registrations, and frame broadcasting.
 */
export class RuntimeConnectionManager {
  private clients: Set<WebSocket> = new Set();

  /** Adds a newly established client connection */
  addClient(ws: WebSocket) {
    this.clients.add(ws);
    console.log(`[Stream Connection] Client connected. Total active: ${this.clients.size}`);
  }

  /** Removes a disconnected client */
  removeClient(ws: WebSocket) {
    this.clients.delete(ws);
    console.log(`[Stream Connection] Client disconnected. Total active: ${this.clients.size}`);
  }

  /** Broadcasts a serialized message payload to all registered clients */
  broadcast(serializedFrame: string) {
    if (this.clients.size === 0) return;

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(serializedFrame, (err) => {
          if (err) {
            console.error('[Stream Connection] Error sending payload to client:', err);
          }
        });
      }
    }
  }

  /** Forcefully disconnects all clients and flushes cache */
  cleanup() {
    for (const client of this.clients) {
      try {
        client.close();
      } catch (err) {}
    }
    this.clients.clear();
    console.log('[Stream Connection] Connection manager cleared.');
  }

  /** Retrieves the number of currently active connections */
  getActiveCount(): number {
    return this.clients.size;
  }
}
