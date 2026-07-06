// src/renderer/models/RendererWorld.ts
import { RendererCountry } from './RendererCountry';
import { RendererUnit } from './RendererUnit';
import { RendererEvent } from './RendererEvent';

export interface RendererWorld {
  /** Current simulation tick */
  currentTick: number;
  /** List of countries for rendering */
  countries: RendererCountry[];
  /** List of units for rendering */
  units: RendererUnit[];
  /** List of events for rendering */
  events: RendererEvent[];
}
