import {
	ApiKeyAuthenticationProvider,
	ApiKeyLocation,
} from "@microsoft/kiota-abstractions";
import { FetchRequestAdapter } from "@microsoft/kiota-http-fetchlibrary";
import { createHevyClient } from "../generated/client/hevyClient.js";

export function createClient(apiKey: string, baseUrl: string) {
	const authProvider = new ApiKeyAuthenticationProvider(apiKey, "api-key", ApiKeyLocation.Header);
	const adapter = new FetchRequestAdapter(authProvider);
	adapter.baseUrl = baseUrl;

	return createHevyClient(adapter);
}
