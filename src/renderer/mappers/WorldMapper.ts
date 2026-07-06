import { RendererWorld } from '../models/RendererWorld';
import { CountryMapper } from './CountryMapper';
import { UnitMapper } from './UnitMapper';
import { EventMapper } from './EventMapper';
import { IWorldState } from '../../core/api/ISimulationRuntime';
import { IRuntimeEvent } from '../../core/events/IRuntimeEvent';

export class WorldMapper {
  /**
   * Maps the runtime world state to a RendererWorld DTO.
   * Units and events are placeholders – they can be populated when the runtime provides them.
   */
  static map(world: IWorldState, events?: IRuntimeEvent[], tick?: number): RendererWorld {
    const countriesArray = Object.values((world as any).countries || {});
    const renderedCountries = countriesArray.map((c) => CountryMapper.map(c));

    // Placeholder unit extraction – assuming each country may have an "units" array of BaseUnit
    const renderedUnits = [] as any[];
    countriesArray.forEach((c: any) => {
      if (Array.isArray((c as any).units)) {
        (c as any).units.forEach((u: any) => {
          renderedUnits.push(UnitMapper.map(u));
        });
      }
    });

    const renderedEvents = (events || []).map((e) => EventMapper.map(e, tick ?? 0));

    return {
      currentTick: (world as any).currentTick ?? 0,
      countries: renderedCountries,
      units: renderedUnits,
      events: renderedEvents,
    };
  }
}
