process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION STACK TRACE:");
  console.error(err.stack || err);
});
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

// Mock window object for Node.js environment to prevent ReferenceError in stores referencing window
(globalThis as any).window = {
  worldStoreHack: null
};

import { RuntimeStreamServer } from './RuntimeStreamServer';
import { initScenario } from '../sim/scenarioEngine';
import { simulationCore } from '../core/SimulationCore';
import { usePlayerStore } from '../store/playerStore';
import { useWorldStore } from '../store/worldStore';

export * from './RuntimeConnectionManager';
export * from './RuntimePublisher';
export * from './RuntimeStreamServer';

// Automatically bootstrap server if executed directly in a Node context
if (typeof process !== 'undefined' && process.env.BOOTSTRAP_STREAM === 'true') {
  console.log("BOOTSTRAP START");

  // Initialize standard scenario state so stores are populated with countries/units
  initScenario('MENA_SPARK', 'US');
  console.log("Scenario initialized");

  const port = parseInt(process.env.STREAM_PORT || '8080', 10);
  const server = new RuntimeStreamServer(port);
  console.log("Server created");
  
  server.start();

  // Standalone simulation ticking: advance tick every 1000ms
  setInterval(() => {
    const player = usePlayerStore.getState();
    // Force reset aftermath/game over state in standalone mode to allow continuous protocol testing
    if (player.aftermathActive || player.gameOver || player.victoryAchieved) {
      usePlayerStore.setState({
        aftermathActive: false,
        gameOver: false,
        victoryAchieved: false,
        aftermathType: 'NONE'
      });
    }
    console.log("Simulation ticking");
    simulationCore.tick();
  }, 1000);
}

