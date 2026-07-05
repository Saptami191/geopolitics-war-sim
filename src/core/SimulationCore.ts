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
import { FiscalEngine } from './engines/FiscalEngine';
import { IFiscalEngine } from './engines/IFiscalEngine';
import { SimulationRuntime } from './runtime/SimulationRuntime';

export class SimulationCore implements ISimulationCore {
  private readonly runtime = new SimulationRuntime(this);
  constructor(
    private readonly worldAdapter: IWorldAdapter = new ZustandWorldAdapter(),
    private readonly playerAdapter: IPlayerAdapter = new ZustandPlayerAdapter(),
    private readonly clockAdapter: IClockAdapter = new ZustandClockAdapter(),
    private readonly commodityEngine: ICommodityEngine = new CommodityEngine(),
    private readonly fiscalEngine: IFiscalEngine = new FiscalEngine(),
  ) {}

  getWorld(): IWorldState {
    return this.worldAdapter;
  }

  getPlayer(): IPlayerState {
    return this.playerAdapter;
  }

  tick(): void {
    this.runtime.tick();
  }

  getCommodityEngine(): ICommodityEngine {
    return this.commodityEngine;
  }

  processCommodityEngine(worldDraft: WorldState): void {
    this.commodityEngine.step(worldDraft);
  }

  processFiscalEngine(worldDraft: WorldState): void {
    this.fiscalEngine.step(worldDraft);
  }

  pause(): void {
    this.runtime.pause();
    this.clockAdapter.pause();
  }

  resume(): void {
    this.runtime.resume();
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
