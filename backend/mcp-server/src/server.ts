import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { SimulationAdapter } from "./adapters/simulationAdapter.js";
import { CountryService } from "./services/countryService.js";
import { registerCountryTool } from "./tools/country.js";

/**
 * Creates and configures the MCP server instance.
 */
export const server = new McpServer({
  name: "scs-mcp-server",
  version: "1.0.0",
});

const simulationAdapter = new SimulationAdapter();
const countryService = new CountryService(simulationAdapter);

registerCountryTool(server, countryService);

