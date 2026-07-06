import { RuntimeStreamServer } from './RuntimeStreamServer';

export * from './RuntimeConnectionManager';
export * from './RuntimePublisher';
export * from './RuntimeStreamServer';

// Automatically bootstrap server if executed directly in a Node context
if (typeof process !== 'undefined' && process.env.BOOTSTRAP_STREAM === 'true') {
  const port = parseInt(process.env.STREAM_PORT || '8080', 10);
  const server = new RuntimeStreamServer(port);
  server.start();
}
