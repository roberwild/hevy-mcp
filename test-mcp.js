const https = require("node:https");

const data = JSON.stringify({
	jsonrpc: "2.0",
	id: 1,
	method: "initialize",
	params: {
		protocolVersion: "2024-11-05",
		capabilities: {},
		clientInfo: {
			name: "test-client",
			version: "1.0.0",
		},
	},
});

const options = {
	hostname: "hevy-4b7i7z1ox-roberwilds-projects.vercel.app",
	port: 443,
	path: "/mcp",
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		"Content-Length": data.length,
		"User-Agent": "test-client/1.0.0",
	},
};

console.log("🚀 Probando endpoint MCP...");
console.log("URL: https://hevy-4b7i7z1ox-roberwilds-projects.vercel.app/mcp");
console.log("Request:", data);

const req = https.request(options, (res) => {
	console.log(`\n✅ Status: ${res.statusCode}`);
	console.log("Headers:", res.headers);

	let responseData = "";

	res.on("data", (chunk) => {
		responseData += chunk;
	});

	res.on("end", () => {
		console.log("\n📄 Response:");
		try {
			const parsed = JSON.parse(responseData);
			console.log(JSON.stringify(parsed, null, 2));
		} catch (_e) {
			console.log("Raw response:", responseData);
		}
	});
});

req.on("error", (error) => {
	console.error("❌ Error:", error.message);
});

req.write(data);
req.end();
