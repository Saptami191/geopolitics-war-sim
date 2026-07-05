import { IClockAdapter } from './IClockAdapter';
import { useClockStore } from '../../store/clockStore';

export class ZustandClockAdapter implements IClockAdapter {
  getCurrentTick(): number {
    return useClockStore.getState().currentTick;
  }

  getCurrentCalendarDate(): string {
    return useClockStore.getState().currentCalendarDate;
  }

  pause(): void {
    useClockStore.getState().setTickDuration(useClockStore.getState().tickDuration);
  }

  resume(): void {
    useClockStore.getState().setTickDuration(useClockStore.getState().tickDuration);
  }
}
