import {
  IWorldState,
  IPlayerState,
  ICommand,
  ISimulationCore,
} from './types';

export class SimulationCore implements ISimulationCore {
  constructor(private readonly world: IWorldState, private readonly player: IPlayerState) {}

  getWorld(): IWorldState {
    return this.world;
  }

  getPlayer(): IPlayerState {
    return this.player;
  }

  tick(): void {
    // Placeholder: tick execution will be wired in later phases.
  }

  pause(): void {
    // Placeholder: pause behavior will be added in future refactor stages.
  }

  resume(): void {
    // Placeholder: resume behavior will be added in future refactor stages.
  }

  dispatch(command: ICommand): void {
    // Placeholder: command dispatching will be implemented in a later phase.
  }
}
