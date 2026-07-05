import { IPlayerAdapter } from './IPlayerAdapter';
import { usePlayerStore } from '../../store/playerStore';

export class ZustandPlayerAdapter implements IPlayerAdapter {
  getPlayer(): any {
    return usePlayerStore.getState();
  }

  getCurrentCountryId(): string {
    return usePlayerStore.getState().countryId;
  }

  getTickSpeed(): string {
    return usePlayerStore.getState().tickSpeed;
  }

  setTickSpeed(speed: string): void {
    usePlayerStore.getState().setTickSpeed(speed as any);
  }
}
