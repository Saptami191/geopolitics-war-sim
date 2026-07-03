import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { server } from "./server.js";

/**
 * Starts the MCP server over stdio.
 */
async function main(): Promise<void> {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("🚀 SCS MCP Server Started");
}

main().catch((error: unknown) => {
  console.error("Failed to start SCS MCP server", error);
  process.exitCode = 1;
});
