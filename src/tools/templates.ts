import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
// Import types from generated client
import type { ExerciseTemplate } from "../generated/client/types/index.js";
import { withErrorHandling } from "../utils/error-handler.js";
import { formatExerciseTemplate } from "../utils/formatters.js";
import {
	createEmptyResponse,
	createJsonResponse,
} from "../utils/response-formatter.js";

// Type definitions for the template operations
type HevyClient = ReturnType<
	typeof import("../utils/hevyClientKubb.js").createClient
>;

// Load local exercise templates
let templatesData: {
	exercise_templates: ExerciseTemplate[];
	metadata?: {
		total_exercises: number;
		last_updated: string;
	};
} | null = null;

// CSV data for Spanish translations
let csvTranslations: Map<
	string,
	{ id: string; title: string; title_spanish: string }
> | null = null;

function loadTemplatesData() {
	if (!templatesData) {
		try {
			const filePath = join(process.cwd(), "templates-hevy-exercises.json");
			const fileContent = readFileSync(filePath, "utf8");
			templatesData = JSON.parse(fileContent);
		} catch (error) {
			console.warn(
				"⚠️  Could not load templates-hevy-exercises.json:",
				error instanceof Error ? error.message : error,
			);
			templatesData = { exercise_templates: [] };
		}
	}
	return templatesData;
}

function loadCsvTranslations() {
	if (!csvTranslations) {
		csvTranslations = new Map();
		try {
			const filePath = join(process.cwd(), "templates_hevy_exercises.csv");
			const fileContent = readFileSync(filePath, "utf8");
			const lines = fileContent.split("\n").slice(1); // Skip header

			for (const line of lines) {
				if (!line.trim()) {
					continue;
				}
				// Parse CSV properly handling potential commas in titles
				const match = line.match(/^([^,]+),([^,]+),(.+)$/);
				if (match) {
					const [, id, title, title_spanish] = match;
					csvTranslations.set(id.trim(), {
						id: id.trim(),
						title: title.trim(),
						title_spanish: title_spanish.trim(),
					});
				}
			}
			console.log(
				`✅ Loaded ${csvTranslations.size} Spanish translations from CSV`,
			);
		} catch (error) {
			console.warn(
				"⚠️  Could not load templates_hevy_exercises.csv:",
				error instanceof Error ? error.message : error,
			);
		}
	}
	return csvTranslations;
}

// Mapeo de nombres en español a inglés
const EXERCISE_NAMES_ES_EN: Record<string, string> = {
	// Pecho
	"press banca": "bench press",
	"press de banca": "bench press",
	banca: "bench",
	aperturas: "fly",
	fondos: "dips",
	pecho: "chest",

	// Piernas
	sentadilla: "squat",
	prensa: "leg press",
	"peso muerto": "deadlift",
	extensiones: "extension",
	"curl femoral": "leg curl",
	femoral: "hamstring",
	cuadriceps: "quadriceps",
	pantorrilla: "calf",
	gluteos: "glutes",

	// Espalda
	remo: "row",
	dominadas: "pull up",
	jalones: "lat pulldown",
	pulldown: "pulldown",
	espalda: "back",
	dorsales: "lats",

	// Hombros
	"press militar": "military press",
	"elevaciones laterales": "lateral raise",
	pajaros: "reverse fly",
	hombros: "shoulders",
	hombro: "shoulder",

	// Brazos
	"curl biceps": "bicep curl",
	curl: "curl",
	biceps: "bicep",
	triceps: "tricep",
	"extensiones triceps": "tricep extension",

	// Cardio
	cinta: "treadmill",
	bici: "bike",
	bicicleta: "bike",
	eliptica: "elliptical",
	"remo cardio": "rowing",
	"maquina de remo": "rowing",
	correr: "running",
	caminar: "walking",

	// Core
	plancha: "plank",
	abdominales: "crunch",
	abs: "abdominal",
	core: "core",
};

/**
 * Búsqueda fuzzy simple que devuelve un score de coincidencia
 */
function fuzzyMatch(search: string, target: string): number {
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

/**
 * Register all exercise template-related tools with the MCP server
 */
export function registerTemplateTools(
	server: McpServer,
	hevyClient: HevyClient,
) {
	// Get exercise templates
	server.tool(
		"get-exercise-templates",
		"Get a paginated list of exercise templates (default and custom) with details like name, category, equipment, and muscle groups. Useful for browsing or searching available exercises.",
		{
			page: z.coerce.number().int().gte(1).default(1),
			pageSize: z.coerce.number().int().gte(1).lte(100).default(5),
		},
		withErrorHandling(
			async ({ page, pageSize }: { page: number; pageSize: number }) => {
				const data = await hevyClient.getExerciseTemplates({
					page,
					pageSize,
				});

				// Process exercise templates to extract relevant information
				const templates =
					data?.exercise_templates?.map((template: ExerciseTemplate) =>
						formatExerciseTemplate(template),
					) || [];

				if (templates.length === 0) {
					return createEmptyResponse(
						"No exercise templates found for the specified parameters",
					);
				}

				return createJsonResponse(templates);
			},
			"get-exercise-templates",
		),
	);

	// Get single exercise template by ID
	server.tool(
		"get-exercise-template",
		"Get complete details of a specific exercise template by its ID, including name, category, equipment, muscle groups, and notes.",
		{
			exerciseTemplateId: z.string().min(1),
		},
		withErrorHandling(
			async ({ exerciseTemplateId }: { exerciseTemplateId: string }) => {
				const data = await hevyClient.getExerciseTemplate(exerciseTemplateId);

				if (!data) {
					return createEmptyResponse(
						`Exercise template with ID ${exerciseTemplateId} not found`,
					);
				}

				const template = formatExerciseTemplate(data);
				return createJsonResponse(template);
			},
			"get-exercise-template",
		),
	);

	// Search exercise templates locally (no API calls, instant results)
	server.tool(
		"search-exercise-templates",
		"Search for exercise templates by name in English or Spanish using LOCAL data (no API calls, instant results). Supports fuzzy matching and Spanish translations. Perfect for finding exercise IDs to use with addExerciseToRoutine. Examples: 'press banca', 'sentadilla', 'remo', 'bicep curl', 'leg press'.",
		{
			query: z
				.string()
				.min(1)
				.describe(
					"Search term in English or Spanish (e.g., 'press banca', 'bench press', 'leg press', 'sentadilla')",
				),
			limit: z.coerce
				.number()
				.int()
				.gte(1)
				.lte(50)
				.default(10)
				.describe("Maximum number of results to return"),
		},
		withErrorHandling(
			async ({ query, limit }: { query: string; limit: number }) => {
				const data = loadTemplatesData();
				const translations = loadCsvTranslations();

				if (!data || data.exercise_templates.length === 0) {
					return createEmptyResponse(
						"Exercise templates database not available. Run 'npm run update-templates' to fetch the latest exercises.",
					);
				}

				// Traducir si es español
				let searchTerm = query.toLowerCase();
				const originalTerm = searchTerm;

				// Aplicar traducciones del diccionario (fallback)
				for (const [es, en] of Object.entries(EXERCISE_NAMES_ES_EN)) {
					if (searchTerm.includes(es)) {
						searchTerm = searchTerm.replace(es, en);
					}
				}

				// Buscar en el JSON local - ahora también buscamos en español usando el CSV
				const results = data.exercise_templates
					.map((template) => {
						const csvData = translations?.get(template.id);
						// Calcular score buscando en inglés Y español
						const englishScore = fuzzyMatch(searchTerm, template.title);
						const spanishScore = csvData
							? fuzzyMatch(originalTerm, csvData.title_spanish)
							: 0;
						// Usar el score más alto
						const finalScore = Math.max(englishScore, spanishScore);

						return {
							...template,
							score: finalScore,
							spanishTitle: csvData?.title_spanish,
						};
					})
					.filter((template) => template.score > 30) // Umbral de relevancia
					.sort((a, b) => b.score - a.score)
					.slice(0, limit)
					.map(({ score, spanishTitle, ...template }) => ({
						id: template.id,
						title: template.title,
						spanishTitle: spanishTitle,
						type: template.type,
						primaryMuscleGroup: template.primary_muscle_group,
						equipment: template.equipment,
						isCustom: template.is_custom,
						relevance: `${Math.round(score)}%`,
					}));

				if (results.length === 0) {
					// Sugerencias basadas en grupos musculares
					const suggestions = [
						"Try searching in English or Spanish",
						"Examples: 'bench press', 'press banca', 'squat', 'sentadilla'",
						"Use general terms: 'press', 'curl', 'row', 'extension'",
					];

					return createEmptyResponse(
						`No se encontraron ejercicios para "${query}".\n\n${suggestions.join("\n")}`,
					);
				}

				return createJsonResponse({
					query: originalTerm,
					translatedQuery: searchTerm !== originalTerm ? searchTerm : undefined,
					results,
					totalResults: results.length,
					catalogInfo: {
						totalExercises:
							data.metadata?.total_exercises || data.exercise_templates.length,
						lastUpdated: data.metadata?.last_updated || "Unknown",
						spanishTranslationsAvailable: translations ? translations.size : 0,
					},
				});
			},
			"search-exercise-templates",
		),
	);

	// Get exercise templates catalog info
	server.tool(
		"get-exercise-templates-info",
		"Get information about the local exercise templates catalog, including total count and last update date. Use this to check if the catalog needs updating.",
		{},
		withErrorHandling(async () => {
			const data = loadTemplatesData();

			if (!data || data.exercise_templates.length === 0) {
				return createEmptyResponse(
					"Exercise templates database not available. Run 'npm run update-templates' to fetch the latest exercises.",
				);
			}

			return createJsonResponse({
				totalExercises:
					data.metadata?.total_exercises || data.exercise_templates.length,
				lastUpdated: data.metadata?.last_updated || "Unknown",
				catalogVersion: "Local JSON file",
				updateInstructions:
					"Run 'npm run update-templates' to fetch latest exercises from Hevy API",
				source: "templates-hevy-exercises.json",
			});
		}, "get-exercise-templates-info"),
	);
}

/**
 * Register exercise template resources (for LLM to access full catalog on demand)
 */
export async function registerTemplateResources(server: McpServer) {
	const { ListResourcesRequestSchema, ReadResourceRequestSchema } =
		await import("@modelcontextprotocol/sdk/types.js");

	// List available resources
	server.setRequestHandler(ListResourcesRequestSchema, async () => ({
		resources: [
			{
				uri: "hevy://exercises/catalog",
				name: "Exercise Templates Catalog",
				description:
					"Complete list of 432 Hevy exercise templates with Spanish translations (id, English name, Spanish name). Use this when you need to see the full catalog to help users find exercises by name.",
				mimeType: "text/csv",
			},
		],
	}));

	// Read resource content
	server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
		const { uri } = request.params;

		if (uri === "hevy://exercises/catalog") {
			try {
				const filePath = join(process.cwd(), "templates_hevy_exercises.csv");
				const csvContent = readFileSync(filePath, "utf8");

				return {
					contents: [
						{
							uri,
							mimeType: "text/csv",
							text: csvContent,
						},
					],
				};
			} catch (error) {
				throw new Error(
					`Failed to read exercise catalog: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		}

		throw new Error(`Unknown resource URI: ${uri}`);
	});
}
