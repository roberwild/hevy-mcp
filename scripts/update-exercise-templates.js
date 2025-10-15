#!/usr/bin/env node

/**
 * Script para actualizar el catálogo de ejercicios de Hevy
 *
 * Este script obtiene todos los ejercicios disponibles desde la API de Hevy
 * y genera el archivo templates-hevy-exercises.json
 *
 * Uso:
 *   HEVY_API_KEY=tu_api_key node scripts/update-exercise-templates.js
 *   o
 *   npm run update-templates
 */

const fs = require("node:fs");
const https = require("node:https");

const HEVY_API_KEY = process.env.HEVY_API_KEY;
const MAX_PAGE_SIZE = 100; // Máximo permitido por Hevy API
const DELAY_BETWEEN_REQUESTS = 500; // ms - para no saturar la API

async function makeRequest(endpoint) {
	return new Promise((resolve, reject) => {
		const options = {
			hostname: "api.hevyapp.com",
			path: `/v1${endpoint}`,
			method: "GET",
			headers: {
				"api-key": HEVY_API_KEY,
				"Content-Type": "application/json",
			},
			timeout: 10000, // 10 segundos timeout
		};

		https
			.get(options, (res) => {
				let data = "";

				res.on("data", (chunk) => {
					data += chunk;
				});

				res.on("end", () => {
					try {
						if (res.statusCode === 200) {
							resolve(JSON.parse(data));
						} else {
							reject(new Error(`HTTP ${res.statusCode}: ${data}`));
						}
					} catch (e) {
						reject(new Error(`Error parsing JSON: ${e.message}`));
					}
				});
			})
			.on("error", reject)
			.on("timeout", () => reject(new Error("Request timeout")));
	});
}

async function fetchAllExerciseTemplates() {
	console.log("🔄 Obteniendo ejercicios de Hevy API...");
	console.log(`📏 Tamaño de página: ${MAX_PAGE_SIZE} ejercicios\n`);

	let allTemplates = [];
	let page = 1;
	let hasMore = true;
	let _totalPages = 0;

	while (hasMore) {
		try {
			const startTime = Date.now();
			console.log(`📄 Página ${page}...`);

			const data = await makeRequest(
				`/exercise-templates?page=${page}&pageSize=${MAX_PAGE_SIZE}`,
			);

			const elapsed = Date.now() - startTime;

			if (data.exercise_templates && data.exercise_templates.length > 0) {
				const count = data.exercise_templates.length;
				allTemplates = allTemplates.concat(data.exercise_templates);

				console.log(`   ✅ ${count} ejercicios obtenidos (${elapsed}ms)`);
				console.log(`   📊 Total acumulado: ${allTemplates.length}`);

				// Si la página devolvió menos de MAX_PAGE_SIZE, es la última
				if (count < MAX_PAGE_SIZE) {
					console.log(
						`   🏁 Última página detectada (${count} < ${MAX_PAGE_SIZE})`,
					);
					hasMore = false;
				} else {
					page++;
					_totalPages++;

					// Pausa entre requests para no saturar
					console.log(`   ⏳ Esperando ${DELAY_BETWEEN_REQUESTS}ms...\n`);
					await new Promise((resolve) =>
						setTimeout(resolve, DELAY_BETWEEN_REQUESTS),
					);
				}
			} else {
				console.log("   ℹ️  Página vacía, finalizando");
				hasMore = false;
			}
		} catch (error) {
			console.error(`❌ Error en página ${page}:`, error.message);

			// Si es la primera página, es un error crítico
			if (page === 1) {
				throw error;
			}

			// Si ya tenemos datos, continuamos con lo que tenemos
			console.log(
				`⚠️  Continuando con ${allTemplates.length} ejercicios obtenidos`,
			);
			hasMore = false;
		}
	}

	return { templates: allTemplates, totalPages: page };
}

async function updateTemplateFile() {
	const startTime = Date.now();

	try {
		if (!HEVY_API_KEY) {
			console.error("❌ Error: HEVY_API_KEY no está configurada en .env");
			console.error("💡 Ejecuta: export HEVY_API_KEY=tu_api_key");
			console.error("   o agrega HEVY_API_KEY a tu archivo .env");
			process.exit(1);
		}

		console.log("🏋️  Actualizador de Plantillas de Ejercicios Hevy\n");

		// Leer el archivo actual (si existe)
		let oldData = null;
		let oldCount = 0;

		try {
			oldData = JSON.parse(
				fs.readFileSync("templates-hevy-exercises.json", "utf8"),
			);
			oldCount = oldData.exercise_templates?.length || 0;
			console.log(`📦 Archivo actual: ${oldCount} ejercicios`);
			console.log(
				`📅 Última actualización: ${oldData.metadata?.last_updated || "Desconocido"}\n`,
			);
		} catch (_e) {
			console.log("ℹ️  No se encontró archivo previo (primera ejecución)\n");
		}

		// Obtener todos los templates
		const { templates, totalPages } = await fetchAllExerciseTemplates();

		const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2);

		console.log(`\n${"=".repeat(60)}`);
		console.log("📊 RESUMEN:");
		console.log(`   • Total de ejercicios: ${templates.length}`);
		console.log(`   • Páginas procesadas: ${totalPages}`);
		console.log(`   • Tiempo total: ${elapsedSeconds}s`);
		console.log(
			`   • Promedio: ${(templates.length / totalPages).toFixed(1)} ejercicios/página`,
		);

		// Calcular diferencias
		if (oldCount > 0) {
			const diff = templates.length - oldCount;
			if (diff > 0) {
				console.log(`   • 🆕 Nuevos: +${diff} ejercicios`);
			} else if (diff < 0) {
				console.log(`   • ⚠️  Eliminados: ${diff} ejercicios`);
			} else {
				console.log("   • ℹ️  Sin cambios en cantidad");
			}
		}
		console.log(`${"=".repeat(60)}\n`);

		// Crear el objeto final con metadata
		const templateData = {
			page: 1,
			page_count: Math.ceil(templates.length / MAX_PAGE_SIZE),
			exercise_templates: templates,
			metadata: {
				total_exercises: templates.length,
				last_updated: new Date().toISOString(),
				generated_by: "scripts/update-exercise-templates.js",
				source: "Hevy API v1",
				max_page_size: MAX_PAGE_SIZE,
				total_pages_fetched: totalPages,
				generation_time_seconds: Number.parseFloat(elapsedSeconds),
			},
		};

		// Guardar backup del archivo anterior
		if (oldData) {
			const backupPath = "templates-hevy-exercises.json.bak";
			fs.writeFileSync(backupPath, JSON.stringify(oldData, null, "\t"));
			console.log(`💾 Backup guardado: ${backupPath}`);
		}

		// Guardar el archivo actualizado
		const filePath = "templates-hevy-exercises.json";
		fs.writeFileSync(filePath, JSON.stringify(templateData, null, "\t"));

		console.log(`✅ Archivo actualizado: ${filePath}`);
		console.log(`📅 Fecha: ${templateData.metadata.last_updated}`);

		// Verificar el archivo guardado
		const savedSize = fs.statSync(filePath).size;
		console.log(`📦 Tamaño del archivo: ${(savedSize / 1024).toFixed(2)} KB\n`);
	} catch (error) {
		console.error("\n❌ ERROR CRÍTICO:", error.message);
		console.error("Stack:", error.stack);
		process.exit(1);
	}
}

// Manejar señales de interrupción
process.on("SIGINT", () => {
	console.log("\n⚠️  Proceso interrumpido por el usuario");
	process.exit(1);
});

updateTemplateFile();
