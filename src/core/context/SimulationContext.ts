import { IWorldState, IPlayerState } from '../types';

export interface ISimulationContext {
  world: IWorldState;
  player: IPlayerState;
  clock: {
    tickCount: number;
    isRunning: boolean;
  };
  engines: {
    [engineName: string]: unknown;
  };
}

export const SimulationContext: ISimulationContext = {
  world: {
    getCountry: () => undefined,
  },
  player: {
    getCurrentCountryId: () => '',
  },
  clock: {
    tickCount: 0,
    isRunning: false,
  },
  engines: {},
};
