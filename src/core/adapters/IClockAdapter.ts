export interface IClockAdapter {
  getCurrentTick(): number;
  getCurrentCalendarDate(): string;
  pause(): void;
  resume(): void;
}
