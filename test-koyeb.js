#!/usr/bin/env node

/**
 * Script de prueba para el deployment de Hevy MCP en Koyeb
 * Verifica que el servidor esté funcionando correctamente
 */

const https = require("https");
const http = require("http");

// Configura tu URL de Koyeb aquí
const KOYEB_URL = process.env.KOYEB_URL || "https://tu-app.koyeb.app";

console.log("🧪 Probando Hevy MCP Server en Koyeb...");
console.log(`📍 URL: ${KOYEB_URL}\n`);

/**
 * Hace una petición HTTP/HTTPS
 */
function makeRequest(url, options, postData) {
	return new Promise((resolve, reject) => {
		const client = url.startsWith("https") ? https : http;

		const req = client.request(url, options, (res) => {
			let data = "";

			res.on("data", (chunk) => {
				data += chunk;
			});

			res.on("end", () => {
				try {
					const parsed = JSON.parse(data);
					resolve({ status: res.statusCode, data: parsed });
				} catch (e) {
					resolve({ status: res.statusCode, data: data });
				}
			});
		});

		req.on("error", (e) => {
			reject(e);
		});

		if (postData) {
			req.write(postData);
		}

		req.end();
	});
}

/**
 * Test 1: Health Check
 */
async function testHealthCheck() {
	console.log("1️⃣  Test: Health Check");
	try {
		const result = await makeRequest(`${KOYEB_URL}/health`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (result.status === 200 && result.data.status === "ok") {
			console.log("   ✅ Health check OK");
			console.log(`   📊 Version: ${result.data.version}`);
			console.log(`   🚀 Service: ${result.data.service}`);
			console.log(`   🔌 Transport: ${result.data.transport}\n`);
			return true;
		}
		console.log("   ❌ Health check falló");
		console.log(`   Status: ${result.status}`);
		console.log(`   Data: ${JSON.stringify(result.data, null, 2)}\n`);
		return false;
	} catch (error) {
		console.log("   ❌ Error en health check");
		console.log(`   Error: ${error.message}\n`);
		return false;
	}
}

/**
 * Test 2: Listar herramientas disponibles
 */
async function testListTools() {
	console.log("2️⃣  Test: Listar herramientas MCP");
	try {
		const payload = JSON.stringify({
			jsonrpc: "2.0",
			method: "tools/list",
			params: {},
			id: 1,
		});

		const result = await makeRequest(
			`${KOYEB_URL}/mcp/v1`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Content-Length": Buffer.byteLength(payload),
				},
			},
			payload,
		);

		if (result.status === 200 && result.data.result) {
			const tools = result.data.result.tools || [];
			console.log(`   ✅ ${tools.length} herramientas disponibles`);
			console.log("   📋 Herramientas:");
			tools.slice(0, 5).forEach((tool) => {
				console.log(`      - ${tool.name}`);
			});
			if (tools.length > 5) {
				console.log(`      ... y ${tools.length - 5} más\n`);
			} else {
				console.log("");
			}
			return true;
		}
		console.log("   ❌ No se pudieron listar las herramientas");
		console.log(`   Status: ${result.status}`);
		console.log(`   Data: ${JSON.stringify(result.data, null, 2)}\n`);
		return false;
	} catch (error) {
		console.log("   ❌ Error al listar herramientas");
		console.log(`   Error: ${error.message}\n`);
		return false;
	}
}

/**
 * Test 3: Buscar ejercicio
 */
async function testSearchExercise() {
	console.log("3️⃣  Test: Buscar ejercicio");
	try {
		const payload = JSON.stringify({
			jsonrpc: "2.0",
			method: "tools/call",
			params: {
				name: "search_exercise_template",
				arguments: {
					query: "bench press",
				},
			},
			id: 2,
		});

		const result = await makeRequest(
			`${KOYEB_URL}/mcp/v1`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Content-Length": Buffer.byteLength(payload),
				},
			},
			payload,
		);

		if (result.status === 200 && result.data.result) {
			console.log("   ✅ Búsqueda exitosa");
			const content = result.data.result.content;
			if (content && content.length > 0) {
				console.log("   📝 Resultados encontrados en la respuesta\n");
			} else {
				console.log("   ℹ️  No se encontraron resultados\n");
			}
			return true;
		}
		console.log("   ❌ Búsqueda falló");
		console.log(`   Status: ${result.status}`);
		console.log(`   Data: ${JSON.stringify(result.data, null, 2)}\n`);
		return false;
	} catch (error) {
		console.log("   ❌ Error en la búsqueda");
		console.log(`   Error: ${error.message}\n`);
		return false;
	}
}

/**
 * Ejecutar todos los tests
 */
async function runTests() {
	console.log("═══════════════════════════════════════════════\n");

	const results = {
		healthCheck: await testHealthCheck(),
		listTools: await testListTools(),
		searchExercise: await testSearchExercise(),
	};

	console.log("═══════════════════════════════════════════════");
	console.log("\n📊 RESUMEN DE TESTS:\n");

	const passed = Object.values(results).filter((r) => r).length;
	const total = Object.keys(results).length;

	console.log(`   Health Check:     ${results.healthCheck ? "✅" : "❌"}`);
	console.log(`   List Tools:       ${results.listTools ? "✅" : "❌"}`);
	console.log(`   Search Exercise:  ${results.searchExercise ? "✅" : "❌"}`);
	console.log("");
	console.log(`   Total: ${passed}/${total} tests pasados`);
	console.log("");

	if (passed === total) {
		console.log(
			"🎉 ¡Todos los tests pasaron! El servidor está funcionando correctamente.\n",
		);
		process.exit(0);
	} else {
		console.log("⚠️  Algunos tests fallaron. Revisa la configuración.\n");
		process.exit(1);
	}
}

// Ejecutar
runTests().catch((error) => {
	console.error("💥 Error fatal:", error);
	process.exit(1);
});
