import { WebSocket } from 'ws';
import { FrameValidator } from './FrameValidator.js';
import { FrameStatistics } from './FrameStatistics.js';

const STREAM_URL = process.env.STREAM_URL || 'ws://localhost:8080';
const RECONNECT_INTERVAL_MS = 2000;
const PING_INTERVAL_MS = 3000;

class RuntimeClient {
  private ws: WebSocket | null = null;
  private stats: FrameStatistics;
  private pingTimer: NodeJS.Timeout | null = null;
  private lastPingSentTime = 0;

  constructor() {
    this.stats = new FrameStatistics();
  }

  public start() {
    this.connect();
  }

  private connect() {
    console.log(`Connecting to Runtime Stream at ${STREAM_URL}...`);
    this.ws = new WebSocket(STREAM_URL);

    this.ws.on('open', () => {
      console.log('Connected to Runtime Stream');
      this.startPingInterval();
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const payloadStr = data.toString();
        const parsed = JSON.parse(payloadStr);

        // Run validation
        const validation = FrameValidator.validate(parsed);

        // Update statistics
        this.stats.registerFrame(parsed, validation.valid, validation.errors);

        if (!validation.valid) {
          console.warn(`[Protocol Violation] Invalid frame received: ${validation.errors.join(', ')}`);
        }
      } catch (err: any) {
        console.error('[Client Error] Failed to parse/deserialize frame JSON:', err.message);
        this.stats.registerInvalidFrame();
      }
    });

    this.ws.on('pong', () => {
      const rtt = Date.now() - this.lastPingSentTime;
      this.stats.updateLatency(rtt);
    });

    this.ws.on('close', () => {
      console.log(`Connection closed. Reconnecting in ${RECONNECT_INTERVAL_MS / 1000}s...`);
      this.cleanup();
      setTimeout(() => this.connect(), RECONNECT_INTERVAL_MS);
    });

    this.ws.on('error', (err: any) => {
      console.error('[WebSocket Error]:', err.message);
      // 'close' event will follow and handle reconnection
    });
  }

  private startPingInterval() {
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.lastPingSentTime = Date.now();
        this.ws.ping();
      }
    }, PING_INTERVAL_MS);
  }

  private cleanup() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
}

// Start the client instance
const client = new RuntimeClient();
client.start();
