import { executeSimulationStep, restartTickTimer, stopTickTimer } from '../../sim/tickEngine';
/**
 * SimulationRuntime acts as a neutral façade for the simulation runtime.
 * In Phase 6A it simply forwards calls to the existing tickEngine implementation.
 */
export class SimulationRuntime {
  /** Execute a simulation tick – delegated to tickEngine */
  tick(): void {
    executeSimulationStep();
  }

  /** Pause the simulation – stop the tick timer */
  pause(): void {
    stopTickTimer();
  }

  /** Resume the simulation – restart the tick timer */
  resume(): void {
    restartTickTimer();
  }
}
