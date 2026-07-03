import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/**
 * Demonstrates connecting to the SCS MCP server, listing tools, and calling getCountry.
 */
async function main(): Promise<void> {
  const client = new Client({
    name: "test-client",
    version: "1.0.0",
  });

  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "src/index.ts"],
  });

  try {
    await client.connect(transport);

    console.log("✅ Connected to MCP server\n");

    const toolsResponse = await client.listTools();
    console.log("📋 Available Tools:");
    if (toolsResponse.tools.length === 0) {
      console.log("  (no tools registered)");
    } else {
      for (const tool of toolsResponse.tools) {
        console.log(`  - ${tool.name}: ${tool.description}`);
      }
    }

    console.log("\n🔧 Calling getCountry with country='India'...\n");

    const callResponse = await client.callTool({
      name: "getCountry",
      arguments: {
        country: "India",
      },
    });

    console.log("📤 Response:");
    if (Array.isArray(callResponse.content)) {
      for (const content of callResponse.content) {
        if (content && typeof content === "object" && "type" in content && content.type === "text" && "text" in content) {
          console.log(content.text);
        }
      }
    }

    console.log("\n🔒 Closing connection...");
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await client.close();
    console.log("✓ Connection closed");
  }
}

main().catch((error: unknown) => {
  console.error("Fatal error:", error);
  process.exitCode = 1;
});

