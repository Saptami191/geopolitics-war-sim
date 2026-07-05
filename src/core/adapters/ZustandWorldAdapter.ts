import { IWorldAdapter } from './IWorldAdapter';
import { useWorldStore } from '../../store/worldStore';

export class ZustandWorldAdapter implements IWorldAdapter {
  getCountry(id: string): any {
    return useWorldStore.getState().countries[id];
  }

  getCountries(): Record<string, any> {
    return useWorldStore.getState().countries;
  }

  getCurrentTick(): number {
    return useWorldStore.getState().currentTick;
  }

  updateCountry(id: string, updater: (country: any) => void): void {
    useWorldStore.getState().updateCountry(id, updater);
  }
}
