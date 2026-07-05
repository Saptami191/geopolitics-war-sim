import {
  IWorldState,
  IPlayerState,
  ICommand,
  ISimulationCore,
} from './types';
import { WorldState } from '../types';
import { IWorldAdapter } from './adapters/IWorldAdapter';
import { IPlayerAdapter } from './adapters/IPlayerAdapter';
import { IClockAdapter } from './adapters/IClockAdapter';
import { ZustandWorldAdapter } from './adapters/ZustandWorldAdapter';
import { ZustandPlayerAdapter } from './adapters/ZustandPlayerAdapter';
import { ZustandClockAdapter } from './adapters/ZustandClockAdapter';
import { CommodityEngine } from './engines/CommodityEngine';
import { ICommodityEngine } from './engines/ICommodityEngine';
import {
  executeSimulationStep as runSimulationStep,
  restartTickTimer as restartTickEngineTimer,
  stopTickTimer as stopTickEngineTimer,
} from '../sim/tickEngine';

export class SimulationCore implements ISimulationCore {
  constructor(
    private readonly worldAdapter: IWorldAdapter = new ZustandWorldAdapter(),
    private readonly playerAdapter: IPlayerAdapter = new ZustandPlayerAdapter(),
    private readonly clockAdapter: IClockAdapter = new ZustandClockAdapter(),
    private readonly commodityEngine: ICommodityEngine = new CommodityEngine(),
  ) {}

  getWorld(): IWorldState {
    return this.worldAdapter;
  }

  getPlayer(): IPlayerState {
    return this.playerAdapter;
  }

  tick(): void {
    runSimulationStep();
  }

  getCommodityEngine(): ICommodityEngine {
    return this.commodityEngine;
  }

  processCommodityEngine(worldDraft: WorldState): void {
    this.commodityEngine.step(worldDraft);
  }

  pause(): void {
    stopTickEngineTimer();
    this.clockAdapter.pause();
  }

  resume(): void {
    restartTickEngineTimer();
    this.clockAdapter.resume();
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
