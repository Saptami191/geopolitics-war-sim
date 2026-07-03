export interface CountrySnapshot {
  name: string;
  capital: string;
  population: number;
  gdp: number;
  region: string;
  government: string;
}

const mockCountries: Record<string, CountrySnapshot> = {
  india: {
    name: "India",
    capital: "New Delhi",
    population: 1428000000,
    gdp: 3900,
    region: "South Asia",
    government: "Federal parliamentary republic",
  },
  usa: {
    name: "United States",
    capital: "Washington, D.C.",
    population: 340000000,
    gdp: 28700,
    region: "North America",
    government: "Federal presidential constitutional republic",
  },
  china: {
    name: "China",
    capital: "Beijing",
    population: 1410000000,
    gdp: 17700,
    region: "East Asia",
    government: "One-party socialist republic",
  },
  germany: {
    name: "Germany",
    capital: "Berlin",
    population: 84000000,
    gdp: 4300,
    region: "Europe",
    government: "Federal parliamentary republic",
  },
};

/**
 * Provides read access to simulation state.
 *
 * This adapter keeps the data access boundary explicit so tools and services
 * never reach into raw simulation state directly.
 */
export class SimulationAdapter {
  /**
   * Returns a country's snapshot from the mock simulation store.
   */
  public getCountry(name: string): CountrySnapshot | null {
    const normalizedName = name.trim().toLowerCase();

    if (!normalizedName) {
      return null;
    }

    return mockCountries[normalizedName] ?? null;
  }
}
