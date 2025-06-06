import { Client } from "@microsoft/mcp";
import { InMemoryTransport } from "@microsoft/mcp/lib/transports/in-memory";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vitest";
import { GetWorkoutsHandler } from "../../src/handlers/get-workouts";
import { HevyApiClient } from "../../src/hevy-api-client";
import { HevyApiClientFactory } from "../../src/hevy-api-client-factory";
import { McpServer } from "../../src/server";

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
			throw new Error(
				"HEVY_API_KEY is not set in environment variables. Integration tests cannot run without a valid API key.\n\n" +
					"For local development:\n" +
					"1. Create a .env file in the project root\n" +
					"2. Add HEVY_API_KEY=your_api_key to the file\n\n" +
					"For GitHub Actions:\n" +
					"1. Go to your GitHub repository\n" +
					"2. Click on Settings > Secrets and variables > Actions\n" +
					"3. Click on New repository secret\n" +
					"4. Set the name to HEVY_API_KEY and the value to your Hevy API key\n" +
					"5. Click Add secret",
			);
		}
	});

	beforeEach(async () => {
		// Create server instance
		server = new McpServer({
			name: "hevy-mcp-test",
			version: "1.0.0",
		});

		// Create Hevy API client
		const hevyApiClient = new HevyApiClient(HEVY_API_BASEURL, hevyApiKey);

		// Create Hevy API client factory
		const hevyApiClientFactory = new HevyApiClientFactory(
			HEVY_API_BASEURL,
			hevyApiKey,
		);

		// Register handlers
		server.registerHandler(new GetWorkoutsHandler(hevyApiClientFactory));

		// Create client
		client = new Client({
			name: "hevy-mcp-test-client",
			version: "1.0.0",
		});

		// Connect client and server
		const [clientTransport, serverTransport] =
			InMemoryTransport.createLinkedPair();
		await Promise.all([
			client.connect(clientTransport),
			server.connect(serverTransport),
		]);
	});

	afterEach(async () => {
		if (server) {
			await server.close();
		}
	});

	afterAll(async () => {
		if (client) {
			await client.close();
		}
	});

	describe("Get Workouts", () => {
		it("should be able to get workouts", async () => {
			const args = {
				page: 1,
				pageSize: 5,
			};

			const result = await client?.request({
				method: "tools/call",
				params: {
					name: "get-workouts",
					arguments: args,
				},
			});

			expect(result).toBeDefined();
			expect(result.result).toBeDefined();
			expect(result.result.workouts).toBeDefined();
			expect(Array.isArray(result.result.workouts)).toBe(true);
			expect(result.result.workouts.length).toBeGreaterThan(0);
			expect(result.result.workouts[0].id).toBeDefined();
			expect(result.result.workouts[0].title).toBeDefined();
			expect(result.result.workouts[0].start_time).toBeDefined();
		});
	});
});
