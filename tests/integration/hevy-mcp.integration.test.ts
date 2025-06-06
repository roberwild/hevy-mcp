import { config } from "@dotenvx/dotenvx/config";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { registerWorkoutTools } from "../../src/tools/workouts.js";
import { createClient } from "../../src/utils/hevyClient.js";

const HEVY_API_BASEURL = "https://api.hevyapp.com";

describe("Hevy MCP Server Integration Tests", () => {
	let server: McpServer | null = null;
	let client: Client | null = null;
	let hevyApiKey: string;
	let hasApiKey = false;

	beforeAll(() => {
		hevyApiKey = process.env.HEVY_API_KEY || "";
		hasApiKey = !!hevyApiKey;

		if (!hasApiKey) {
			console.warn(
				"HEVY_API_KEY is not set in environment variables. Integration tests will be skipped.",
			);
		}
	});

	beforeEach(async () => {
		if (!hasApiKey) {
			return;
		}

		// Create server instance
		server = new McpServer({
			name: "hevy-mcp-test",
			version: "1.0.0",
		});

		// Configure client
		const hevyClient = createClient(hevyApiKey, HEVY_API_BASEURL);

		// Register workout tools
		registerWorkoutTools(server, hevyClient);

		// Create client
		client = new Client(
			{
				name: "hevy-test-client",
				version: "1.0.0",
			},
			{
				capabilities: {
					tools: {},
				},
			},
		);

		// Connect client and server
		const [clientTransport, serverTransport] =
			InMemoryTransport.createLinkedPair();
		await Promise.all([
			client?.connect(clientTransport),
			server.connect(serverTransport),
		]);
	});

	afterAll(async () => {
		if (client) {
			await client.close();
		}
	});

	describe("Get Workouts", () => {
		it("should be able to get workouts", async () => {
			if (!hasApiKey) {
				// Skip test if no API key is available
				return;
			}

			const args = {
				page: 1,
				pageSize: 5,
			};

			const result = await client?.request(
				{
					method: "tools/call",
					params: {
						name: "get-workouts",
						arguments: args,
					},
				},
				CallToolResultSchema,
			);

			// Check that we got a result
			expect(result).toBeDefined();
			expect(result.content).toBeDefined();
			expect(result.content.length).toBeGreaterThan(0);

			// Parse the JSON content
			const content = result.content[0].text as string;
			const workouts = JSON.parse(content);

			// Validate the structure of the response
			expect(Array.isArray(workouts)).toBe(true);

			// If there are workouts, validate the structure of the first workout
			if (workouts.length > 0) {
				const workout = workouts[0];
				expect(workout).toHaveProperty("id");
				expect(workout).toHaveProperty("title");
				expect(workout).toHaveProperty("startTime");
				expect(workout).toHaveProperty("endTime");
				expect(workout).toHaveProperty("exercises");
				expect(Array.isArray(workout.exercises)).toBe(true);
			}
		}, 30000); // Increase timeout to 30 seconds for API calls
	});
});
