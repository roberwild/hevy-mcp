// api/index.js

const { startHttpServer } = require("../dist/utils/httpServer");
const { default: dotenv } = require("dotenv");

dotenv.config();

module.exports = async (req, res) => {
	try {
		if (req.method === "GET" && req.url === "/health") {
			res.statusCode = 200;
			res.end("OK");
			return;
		}

		const mod = await import("../dist/index.js");
		const main = mod?.default?.main ?? mod?.main;

		if (typeof main !== "function") {
			throw new Error(
				"No se encontró la función `main` exportada en dist/index.js",
			);
		}

		await main();

		res.statusCode = 200;
		res.end("Hevy MCP launched (check logs)");
	} catch (err) {
		console.error("❌ Error en la función API:", err);
		res.statusCode = 500;
		res.end(`Error interno: ${err.message}`);
	}
};
