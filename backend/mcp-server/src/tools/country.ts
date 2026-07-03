import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { CountryService } from "../services/countryService.js";

/**
 * Registers the getCountry MCP tool.
 */
export function registerCountryTool(server: McpServer, countryService: CountryService): void {
  server.registerTool(
    "getCountry",
    {
      title: "Get Country",
      description: "Retrieve information about a country from the simulation.",
      inputSchema: {
        country: z.string().trim().min(1, "Country name is required."),
      },
    },
    async ({ country }) => {
      try {
        const countryData = countryService.getCountry(country);

        if (!countryData) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ error: `Country '${country}' was not found.` }, null, 2),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(countryData, null, 2),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: message }, null, 2),
            },
          ],
          isError: true,
        };
      }
    }
  );
}

