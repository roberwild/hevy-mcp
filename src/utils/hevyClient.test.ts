import { ApiKeyAuthenticationProvider } from "@microsoft/kiota-abstractions";
import { FetchRequestAdapter } from "@microsoft/kiota-http-fetchlibrary";
import { describe, expect, it, vi } from "vitest";
import { createClient } from "./hevyClient";

// Mock the imported modules
import { ApiKeyAuthenticationProvider, ApiKeyLocation as ActualApiKeyLocation } from "@microsoft/kiota-abstractions";
import { FetchRequestAdapter } from "@microsoft/kiota-http-fetchlibrary";
import { describe, expect, it, vi } from "vitest";
import { createClient } from "./hevyClient";

// Mock the imported modules
vi.mock("@microsoft/kiota-abstractions", async () => {
	const actual = await vi.importActual("@microsoft/kiota-abstractions");
	return {
		...actual, // Preserve other exports from the module
		ApiKeyAuthenticationProvider: vi.fn(),
		// ApiKeyLocation will be its actual enum implementation
	};
});

vi.mock("@microsoft/kiota-http-fetchlibrary", () => ({
	FetchRequestAdapter: vi.fn(),
}));

vi.mock("../generated/client/hevyClient.js", () => ({
	createHevyClient: vi.fn().mockReturnValue({ mockedClient: true }),
}));

describe("hevyClient", () => {
	describe("createClient", () => {
		it("should create a client with the correct configuration", () => {
			// Arrange
			const apiKey = "test-api-key";
			const baseUrl = "https://api.hevy.com";

			// Reset mocks
			vi.clearAllMocks();

			// Mock implementation for FetchRequestAdapter
			FetchRequestAdapter.mockImplementation(() => ({
				baseUrl: "",
			}));

			// Act
			const client = createClient(apiKey, baseUrl);

			// Assert
			expect(ApiKeyAuthenticationProvider).toHaveBeenCalledWith(
				apiKey,
				"api-key",
				"header",
			);

			expect(FetchRequestAdapter).toHaveBeenCalled();

			// Check that baseUrl was set correctly
			const adapterInstance = FetchRequestAdapter.mock.results[0].value;
			expect(adapterInstance.baseUrl).toBe(baseUrl);

			// Check that the client was created and returned
			expect(client).toEqual({ mockedClient: true });
		});
	});
});
