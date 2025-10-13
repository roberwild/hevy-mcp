#!/usr/bin/env node
// Only load dotenvx in development, not in production
if (process.env.NODE_ENV !== "production") {
	try {
		await import("@dotenvx/dotenvx/config");
	} catch (error) {
		// Ignore if dotenvx is not available
		console.log("dotenvx not available, using process.env directly");
	}
}

// Import tool registration functions
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { name, version } from "../package.json";
import { registerFolderTools } from "./tools/folders.js";
import { registerRoutineTools } from "./tools/routines.js";
import { registerTemplateTools } from "./tools/templates.js";
import { registerWebhookTools } from "./tools/webhooks.js";
// Import tool registration functions
import { registerWorkoutTools } from "./tools/workouts.js";
import { assertApiKey, parseConfig } from "./utils/config.js";
import { createClient } from "./utils/hevyClient.js";
import { createHttpServer } from "./utils/httpServer.js";

const HEVY_API_BASEURL = "https://api.hevyapp.com";

// Parse config (CLI args + env)
const args = process.argv.slice(2);
const cfg = parseConfig(args, process.env);

// Debug: log environment variables (only in production for Railway debugging)
if (process.env.NODE_ENV === "production") {
	console.log("Environment check:");
	console.log("- NODE_ENV:", process.env.NODE_ENV);
	console.log(
		"- HEVY_API_KEY:",
		process.env.HEVY_API_KEY ? "***SET***" : "NOT SET",
	);
	console.log("- MCP_TRANSPORT:", process.env.MCP_TRANSPORT);
	console.log("- PORT:", process.env.PORT);
	console.log("- Parsed config apiKey:", cfg.apiKey ? "***SET***" : "NOT SET");
}

// Create server instance
const server = new McpServer({
	name,
	version,
});

// Validate API key presence
assertApiKey(cfg.apiKey);

// Configure client
const apiKey = cfg.apiKey;
const hevyClient = createClient(apiKey, HEVY_API_BASEURL);

// Register all tools
registerWorkoutTools(server, hevyClient);
registerRoutineTools(server, hevyClient);
registerTemplateTools(server, hevyClient);
registerFolderTools(server, hevyClient);
registerWebhookTools(server, hevyClient);

// Start the server
async function runServer() {
	if (cfg.transportMode === "http") {
		console.log(
			`Starting MCP server in HTTP mode on ${cfg.httpHost}:${cfg.httpPort}`,
		);
		const httpServer = createHttpServer(server, {
			port: cfg.httpPort,
			host: cfg.httpHost,
			enableDnsRebindingProtection: cfg.enableDnsRebindingProtection,
			allowedHosts: cfg.allowedHosts,
		});
		await httpServer.startServer();
	} else {
		console.log("Starting MCP server in stdio mode");
		const transport = new StdioServerTransport();
		await server.connect(transport);
	}
}

runServer().catch((error) => {
	console.error("Fatal error in main():", error);
	process.exit(1);
});
