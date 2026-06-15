import { BusEvent } from '../types';
import { CanonicalWorld, Country } from '../../../types';

export interface HandlerResult {
  derivedEvents?: BusEvent[];
  logs?: string[];
}

export interface HandlerContext {
  worldState: CanonicalWorld;
  rawCountries: Record<string, Country>;
}
