import type {
	AuthenticationProvider,
	RequestInformation,
} from "@microsoft/kiota-abstractions";
import { FetchRequestAdapter } from "@microsoft/kiota-http-fetchlibrary";
import { createHevyClient } from "../generated/client/hevyClient.js";

class ApiKeyAuthProvider implements AuthenticationProvider {
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async authenticateRequest(request: RequestInformation): Promise<void> {
		request.headers.add("x-api-key", this.apiKey);
	}
}

export function createClient(apiKey: string, baseUrl: string) {
	const authProvider = new ApiKeyAuthProvider(apiKey);
	const adapter = new FetchRequestAdapter(authProvider);
	adapter.baseUrl = baseUrl;

	return createHevyClient(adapter);
}
