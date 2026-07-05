import { IWorldState, IPlayerState, ICommand } from '../core/types';

/**
 * Public Runtime API – the single entry point for UI, server, renderers, etc.
 * Only the methods listed here are exposed; everything else stays internal.
 * Methods that cannot be supported yet are stubbed with TODO comments.
 */
export interface ISimulationRuntime {
  /** Execute a single simulation tick */
  tick(): void;

  /** Pause the simulation (stop timer) */
  pause(): void;

  /** Resume the simulation (restart timer) */
  resume(): void;

  /** Start the simulation runtime – future alias for resume/startup */
  start(): void; // TODO: implement when needed

  /** Stop the simulation runtime – future alias for pause/shutdown */
  stop(): void; // TODO: implement when needed

  /** Access the world state */
  getWorld(): IWorldState;

  /** Access the player state */
  getPlayer(): IPlayerState;

  /** Dispatch a command to the simulation */
  dispatch(command: ICommand): void;

  /** Subscribe to runtime events (e.g., tick, pause) */
  subscribe(listener: () => void): void; // TODO: event system not implemented yet

  /** Unsubscribe from runtime events */
  unsubscribe(listener: () => void): void; // TODO: event system not implemented yet
}
