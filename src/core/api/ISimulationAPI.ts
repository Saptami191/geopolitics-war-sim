import { IWorldState, IPlayerState, ICommand } from '../types';

export interface ISimulationAPI {
  getWorld(): IWorldState;
  getPlayer(): IPlayerState;
  tick(): void;
  pause(): void;
  resume(): void;
  dispatch(command: ICommand): void;
}
