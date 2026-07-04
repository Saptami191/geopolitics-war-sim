// src/core/types.ts

/**
 * Core types for the Simulation Core. These are deliberately simple and do not import any
 * frontend‑specific modules (React, Zustand, etc.). They are intended to evolve as the
 * migration proceeds.
 */

export interface IWorldState {
  // Minimal placeholder – real fields will be added in later stages.
  // Example: a map of country IDs to country snapshots.
  getCountry(id: string): any;
}

export interface IPlayerState {
  // Placeholder for player‑specific data.
  getCurrentCountryId(): string;
}

export interface ICommand {
  type: string;
  payload?: any;
}

export interface ISimulationCore {
  /** Retrieve the full world state */
  getWorld(): IWorldState;
  /** Retrieve the player state */
  getPlayer(): IPlayerState;
  /** Perform a simulation tick – no‑op for now */
  tick(): void;
  /** Pause simulation execution */
  pause(): void;
  /** Resume simulation execution */
  resume(): void;
  /** Dispatch a command/event – stub implementation */
  dispatch(command: ICommand): void;
}
