import { SimulationAdapter, type CountrySnapshot } from "../adapters/simulationAdapter.js";

/**
 * Contains country-specific business logic for the MCP server.
 */
export class CountryService {
  public constructor(private readonly simulationAdapter: SimulationAdapter) {}

  /**
   * Retrieves country information for the provided name.
   */
  public getCountry(name: string): CountrySnapshot | null {
    const normalizedName = name.trim();

    if (!normalizedName) {
      throw new Error("Country name is required.");
    }

    try {
      return this.simulationAdapter.getCountry(normalizedName);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown simulation error";
      throw new Error(`Unable to retrieve country '${normalizedName}': ${message}`);
    }
  }
}
