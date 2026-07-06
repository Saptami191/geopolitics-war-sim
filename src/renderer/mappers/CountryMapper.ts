import { Country } from '../../types';
import { RendererCountry } from '../models/RendererCountry';

/** Simple deterministic colour generator based on country id */
function colourFromId(id: string): string {
  const colours = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC949', '#AF7AA1', '#FF9DA7', '#9C755F', '#BAB0AB'];
  const index = Math.abs(Array.from(id).reduce((a, c) => a + c.charCodeAt(0), 0)) % colours.length;
  return colours[index];
}

export class CountryMapper {
  static map(country: Country): RendererCountry {
    return {
      id: country.id,
      name: country.name,
      latitude: 0, // Placeholder – runtime lacks geo coordinates
      longitude: 0,
      stability: country.political?.stabilityIndex ?? 0,
      economy: country.economic?.gdpB ?? 0,
      military: country.arsenal?.totalPowerRating ?? 0,
      color: colourFromId(country.id),
    };
  }
}
