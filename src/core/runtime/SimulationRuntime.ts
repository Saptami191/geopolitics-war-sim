import { executeSimulationStep, restartTickTimer, stopTickTimer } from '../../sim/tickEngine';
import { usePlayerStore } from '../../store/playerStore';
import { RuntimeEventBus } from '../events/RuntimeEventBus';
import { IRuntimeEvent, RuntimeEventType } from '../events/IRuntimeEvent';
/**
 * SimulationRuntime acts as a neutral façade for the simulation runtime.
 * It forwards calls to tickEngine and publishes runtime events.
 */
export class SimulationRuntime {
  private readonly eventBus = new RuntimeEventBus();

  /** Execute a simulation tick – first perform game‑over check */
  tick(): void {
    const player = usePlayerStore.getState();
    if (player.gameOver || player.victoryAchieved || player.aftermathActive) {
      stopTickTimer();
      this.publish({ type: RuntimeEventType.SimulationStopped });
      return;
    }
    executeSimulationStep();
    this.publish({ type: RuntimeEventType.SimulationTickCompleted });
  }

  /** Pause the simulation – stop the tick timer */
  pause(): void {
    stopTickTimer();
    this.publish({ type: RuntimeEventType.SimulationPaused });
  }

  /** Resume the simulation – restart the tick timer */
  resume(): void {
    restartTickTimer();
    this.publish({ type: RuntimeEventType.SimulationResumed });
  }

  /** Subscribe to runtime events */
  subscribe(listener: (event: IRuntimeEvent) => void): void {
    this.eventBus.subscribe(listener);
  }

  /** Unsubscribe from runtime events */
  unsubscribe(listener: (event: IRuntimeEvent) => void): void {
    this.eventBus.unsubscribe(listener);
  }

  /** Internal publish helper */
  private publish(event: IRuntimeEvent): void {
    this.eventBus.publish(event);
  }
}
