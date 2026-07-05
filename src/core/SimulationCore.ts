import {
  IWorldState,
  IPlayerState,
  ICommand,
  ISimulationCore,
} from './types';
import {
  executeSimulationStep as runSimulationStep,
  restartTickTimer as restartTickEngineTimer,
  stopTickTimer as stopTickEngineTimer,
} from '../sim/tickEngine';

export class SimulationCore implements ISimulationCore {
  constructor(
    private readonly world?: IWorldState,
    private readonly player?: IPlayerState,
  ) {}

  getWorld(): IWorldState {
    return this.world as IWorldState;
  }

  getPlayer(): IPlayerState {
    return this.player as IPlayerState;
  }

  tick(): void {
    runSimulationStep();
  }

  pause(): void {
    stopTickEngineTimer();
  }

  resume(): void {
    restartTickEngineTimer();
  }

  dispatch(command: ICommand): void {
    // Placeholder: command dispatching will be implemented in a later phase.
    void command;
  }
}

export const simulationCore = new SimulationCore();

export const tick = (): void => simulationCore.tick();
export const pause = (): void => simulationCore.pause();
export const resume = (): void => simulationCore.resume();
export const restartTickTimer = (): void => simulationCore.resume();
export const stopTickTimer = (): void => simulationCore.pause();
