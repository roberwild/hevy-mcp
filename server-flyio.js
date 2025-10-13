#!/usr/bin/env node

/**
 * Hevy MCP Server - Fly.io Entry Point
 * Optimized for production deployment with HTTP transport
 */

import { createServer } from "./src/index.js";
import { createHttpServer } from "./src/utils/httpServer.js";

const PORT = process.env.PORT || 8080;

async function startServer() {
	try {
		console.log("🚀 Starting Hevy MCP Server on Fly.io...");

		// Create MCP server instance
		const mcpServer = createServer();

		// Create HTTP server with MCP transport
		const httpServer = createHttpServer(mcpServer);

		// Start listening
		httpServer.listen(PORT, "0.0.0.0", () => {
			console.log(`✅ Hevy MCP Server running on port ${PORT}`);
			console.log(`🌐 Health check: http://localhost:${PORT}/health`);
			console.log(`📡 MCP endpoint: http://localhost:${PORT}/mcp`);
			console.log("🏋️ Ready to serve fitness data from Hevy API!");
		});

		// Graceful shutdown
		process.on("SIGTERM", () => {
			console.log("📴 Received SIGTERM, shutting down gracefully...");
			httpServer.close(() => {
				console.log("✅ Server closed");
				process.exit(0);
			});
		});

		process.on("SIGINT", () => {
			console.log("📴 Received SIGINT, shutting down gracefully...");
			httpServer.close(() => {
				console.log("✅ Server closed");
				process.exit(0);
			});
		});
	} catch (error) {
		console.error("❌ Failed to start server:", error);
		process.exit(1);
	}
}

startServer();
