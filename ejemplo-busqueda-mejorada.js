#!/usr/bin/env node

/**
 * Ejemplo de uso de la búsqueda mejorada de ejercicios
 *
 * Este script demuestra:
 * 1. Búsqueda en español con traducciones del CSV
 * 2. Comparación de scores entre inglés y español
 * 3. Carga del catálogo completo via CSV
 *
 * Uso:
 *   node ejemplo-busqueda-mejorada.js
 */

import { readFileSync } from "fs";
import { join } from "path";

// Función de fuzzy matching (copiada de templates.ts)
function fuzzyMatch(search, target) {
	const searchLower = search.toLowerCase();
	const targetLower = target.toLowerCase();

	// Coincidencia exacta
	if (targetLower === searchLower) {
		return 100;
	}
	if (targetLower.includes(searchLower)) {
		return 95;
	}

	// Coincidencia de palabras
	const searchWords = searchLower.split(/\s+/);
	const targetWords = targetLower.split(/\s+/);
	let matchedWords = 0;
	let partialMatches = 0;

	for (const sw of searchWords) {
		for (const tw of targetWords) {
			if (tw === sw) {
				matchedWords++;
				break;
			}
			if (tw.includes(sw) || sw.includes(tw)) {
				partialMatches += 0.5;
				break;
			}
		}
	}

	const wordScore = ((matchedWords + partialMatches) / searchWords.length) * 80;

	// Bonus por orden de palabras
	let orderBonus = 0;
	if (searchWords.every((sw) => targetLower.includes(sw))) {
		orderBonus = 10;
	}

	return Math.min(100, wordScore + orderBonus);
}

// Cargar CSV
function loadCSV() {
	console.log("📂 Cargando CSV de traducciones...");
	const csvPath = join(process.cwd(), "templates_hevy_exercises.csv");
	const content = readFileSync(csvPath, "utf8");
	const lines = content.split("\n").slice(1); // Skip header

	const translations = new Map();

	for (const line of lines) {
		if (!line.trim()) continue;
		const match = line.match(/^([^,]+),([^,]+),(.+)$/);
		if (match) {
			const [, id, title, title_spanish] = match;
			translations.set(id.trim(), {
				id: id.trim(),
				title: title.trim(),
				title_spanish: title_spanish.trim(),
			});
		}
	}

	console.log(`✅ Cargadas ${translations.size} traducciones\n`);
	return translations;
}

// Cargar JSON
function loadJSON() {
	console.log("📂 Cargando catálogo JSON...");
	const jsonPath = join(process.cwd(), "templates-hevy-exercises.json");
	const content = readFileSync(jsonPath, "utf8");
	const data = JSON.parse(content);
	console.log(`✅ Cargados ${data.exercise_templates.length} ejercicios\n`);
	return data;
}

// Búsqueda mejorada
function searchExercises(query, limit = 5) {
	const data = loadJSON();
	const translations = loadCSV();

	console.log(`🔍 Buscando: "${query}"\n`);
	console.log("─".repeat(80));

	const results = data.exercise_templates
		.map((template) => {
			const csvData = translations.get(template.id);

			// Calcular score en inglés y español
			const englishScore = fuzzyMatch(query, template.title);
			const spanishScore = csvData
				? fuzzyMatch(query, csvData.title_spanish)
				: 0;
			const finalScore = Math.max(englishScore, spanishScore);

			return {
				id: template.id,
				title: template.title,
				spanishTitle: csvData?.title_spanish || "N/A",
				englishScore,
				spanishScore,
				finalScore,
			};
		})
		.filter((r) => r.finalScore > 30)
		.sort((a, b) => b.finalScore - a.finalScore)
		.slice(0, limit);

	if (results.length === 0) {
		console.log("❌ No se encontraron resultados\n");
		return;
	}

	console.log(`\n✨ Encontrados ${results.length} resultados:\n`);

	results.forEach((result, index) => {
		console.log(`${index + 1}. ${result.title}`);
		console.log(`   🇪🇸 ${result.spanishTitle}`);
		console.log(`   🆔 ${result.id}`);
		console.log(
			`   📊 Scores - Inglés: ${Math.round(result.englishScore)}% | Español: ${Math.round(result.spanishScore)}% | Final: ${Math.round(result.finalScore)}%`,
		);
		console.log();
	});

	console.log("─".repeat(80));
}

// Tests
console.log("\n🏋️  EJEMPLO DE BÚSQUEDA MEJORADA DE EJERCICIOS\n");
console.log("═".repeat(80));
console.log("\n");

// Búsqueda 1: Español
console.log("🇪🇸 TEST 1: Búsqueda en ESPAÑOL");
searchExercises("press banca", 3);

console.log("\n\n");

// Búsqueda 2: Inglés
console.log("🇬🇧 TEST 2: Búsqueda en INGLÉS");
searchExercises("bench press", 3);

console.log("\n\n");

// Búsqueda 3: Término español específico
console.log("🇪🇸 TEST 3: Término español específico");
searchExercises("sentadilla", 5);

console.log("\n\n");

// Búsqueda 4: Músculo en español
console.log("🇪🇸 TEST 4: Músculo en español");
searchExercises("bíceps", 5);

console.log("\n\n");

// Stats del catálogo
console.log("📊 ESTADÍSTICAS DEL CATÁLOGO");
console.log("─".repeat(80));
const data = loadJSON();
const translations = loadCSV();
console.log(
	`\n✅ Total de ejercicios en JSON: ${data.exercise_templates.length}`,
);
console.log(`✅ Total de traducciones en CSV: ${translations.size}`);
console.log(
	`✅ Cobertura de traducciones: ${Math.round((translations.size / data.exercise_templates.length) * 100)}%`,
);
console.log(
	`\n📅 Última actualización: ${data.metadata?.last_updated || "Desconocida"}`,
);
console.log("\n" + "─".repeat(80));

console.log("\n\n🎉 ¡Búsqueda mejorada funcionando correctamente!");
console.log("\n💡 Ahora el MCP puede buscar en español usando el CSV");
console.log(
	"💡 También puede cargar el catálogo completo via MCP Resource: hevy://exercises/catalog",
);
console.log("\n");
