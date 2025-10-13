#!/usr/bin/env node

// Simple HTTP server that replicates the Vercel api/index.js functionality
// This bypasses all MCP complexity and works directly with GPT requests

import express from "express";

const app = express();
app.use(express.json());

// Environment variables
const HEVY_API_KEY = process.env.HEVY_API_KEY;
const PORT = Number.parseInt(process.env.PORT || "8080", 10);

if (!HEVY_API_KEY) {
	console.error("❌ HEVY_API_KEY is required");
	process.exit(1);
}

console.log("🚀 Starting simple HTTP server for GPT compatibility");
console.log("- HEVY_API_KEY:", HEVY_API_KEY ? "***SET***" : "NOT SET");
console.log("- PORT:", PORT);

// Cliente real de Hevy API (copied from api/index.js)
const hevyClient = {
	baseURL: "https://api.hevyapp.com/v1",
	apiKey: HEVY_API_KEY,

	async makeRequest(endpoint: string, options: Record<string, unknown> = {}) {
		const url = `${this.baseURL}${endpoint}`;
		const headers: Record<string, string> = {
			accept: "application/json",
			"api-key": this.apiKey,
			"X-API-Key": this.apiKey,
			"Content-Type": "application/json",
			...((options.headers as Record<string, string>) || {}),
		};

		console.log(`🌐 Llamando a Hevy API: ${options.method || "GET"} ${url}`);
		if (options.body) {
			console.log("📤 Payload:", JSON.stringify(options.body, null, 2));
		}

		try {
			// No timeout limits in Railway
			const response = await fetch(url, {
				method: (options.method as string) || "GET",
				headers,
				body: options.body ? JSON.stringify(options.body) : undefined,
			});

			console.log(
				`📊 Hevy API Status: ${response.status} ${response.statusText}`,
			);

			if (!response.ok) {
				let errorDetails = `${response.status} ${response.statusText}`;

				try {
					const errorBody = await response.text();
					console.log("❌ Error Response Body:", errorBody);
					errorDetails += ` - ${errorBody}`;
				} catch (_e) {
					console.log("❌ No se pudo leer el cuerpo del error");
				}

				throw new Error(`Hevy API Error: ${errorDetails}`);
			}

			const data = await response.json();
			console.log("✅ Respuesta de Hevy API recibida correctamente");
			return data;
		} catch (error: unknown) {
			console.error("❌ Error en makeRequest:", (error as Error).message);
			throw error;
		}
	},

	async getWorkouts({ page = 1, pageSize = 5 }) {
		const data = await this.makeRequest(
			`/workouts?page=${page}&pageSize=${pageSize}`,
		);
		return {
			workouts: data.workouts || [],
			totalCount: data.page_count
				? data.page_count * pageSize
				: data.workouts?.length || 0,
			page: data.page || page,
			pageSize,
		};
	},

	async getLastWorkouts(count = 1) {
		const data = await this.makeRequest(`/workouts?page=1&pageSize=${count}`);
		return {
			workouts: data.workouts?.slice(0, count) || [],
		};
	},

	async getRoutines({ page = 1, pageSize = 5 }) {
		const data = await this.makeRequest(
			`/routines?page=${page}&pageSize=${pageSize}`,
		);
		return {
			routines: data.routines || [],
			totalCount: data.page_count
				? data.page_count * pageSize
				: data.routines?.length || 0,
			page: data.page || page,
			pageSize,
		};
	},

	async searchExerciseTemplates(query: string) {
		const data = await this.makeRequest(
			`/exercise_templates?search=${encodeURIComponent(query)}`,
		);
		return {
			exerciseTemplates: data.exercise_templates || [],
			message: `Encontrados ${data.exercise_templates?.length || 0} ejercicios para "${query}"`,
		};
	},

	async getExerciseTemplates({ page = 1, pageSize = 20 }) {
		const data = await this.makeRequest(
			`/exercise_templates?page=${page}&pageSize=${pageSize}`,
		);
		return {
			exerciseTemplates: data.exercise_templates || [],
			totalCount: data.page_count
				? data.page_count * pageSize
				: data.exercise_templates?.length || 0,
			page: data.page || page,
			pageSize,
		};
	},

	async getRoutineFolders({ page = 1, pageSize = 5 }) {
		const data = await this.makeRequest(
			`/routine_folders?page=${page}&pageSize=${pageSize}`,
		);
		return {
			routineFolders: data.routine_folders || [],
			totalCount: data.page_count
				? data.page_count * pageSize
				: data.routine_folders?.length || 0,
			page: data.page || page,
			pageSize,
		};
	},

	async createRoutine(routineData: Record<string, unknown>) {
		// Extract fields including folder preference
		const { title, exercises, folderName } = routineData;

		let validFolderId = null;

		// If user specified a folder name, try to find its ID
		if (folderName) {
			console.log(`🔍 Buscando carpeta "${folderName}"...`);
			try {
				const folders = await this.makeRequest("/routine_folders");
				if (folders.routine_folders && folders.routine_folders.length > 0) {
					const targetFolder = folders.routine_folders.find((folder: any) =>
						folder.title
							?.toLowerCase()
							.includes(folderName.toString().toLowerCase()),
					);
					if (targetFolder) {
						validFolderId = targetFolder.id;
						console.log(
							`✅ Carpeta "${folderName}" encontrada con ID:`,
							validFolderId,
						);
					} else {
						console.log(
							`⚠️ Carpeta "${folderName}" no encontrada, usando carpeta por defecto`,
						);
					}
				}
			} catch (folderError) {
				console.log("⚠️ Error obteniendo carpetas:", folderError);
			}
		}

		// If no specific folder found or specified, get default from existing routines
		if (!validFolderId) {
			console.log("🔍 Obteniendo routine_folder_id por defecto...");
			try {
				const existingRoutines = await this.makeRequest(
					"/routines?page=1&pageSize=1",
				);
				if (existingRoutines.routines && existingRoutines.routines.length > 0) {
					validFolderId = existingRoutines.routines[0].routine_folder_id;
					console.log(
						"✅ routine_folder_id por defecto encontrado:",
						validFolderId,
					);
				}
			} catch (routineError) {
				console.log("⚠️ Error obteniendo rutinas existentes:", routineError);
			}
		}

		// If still no folder ID, try to get first available folder
		if (!validFolderId) {
			console.log("🔍 Intentando obtener primera carpeta disponible...");
			try {
				const folders = await this.makeRequest("/routine_folders");
				if (folders.routine_folders && folders.routine_folders.length > 0) {
					validFolderId = folders.routine_folders[0].id;
					console.log("✅ Primera carpeta disponible:", validFolderId);
				}
			} catch (_folderError) {
				console.log("⚠️ No se pudo obtener carpetas");
			}
		}

		// Helper function to remove undefined/null values recursively
		const removeUndefined = (obj: any) => JSON.parse(JSON.stringify(obj));

		// Prepare payload with valid routine_folder_id
		const hevyRoutineData = removeUndefined({
			routine: {
				title: title || "Nueva Rutina",
				routine_folder_id: validFolderId, // Use the valid folder ID we found
				exercises: exercises || [
					{
						exercise_template_id: "79D0BB3A", // Press de Banca por defecto
						sets: [
							{ type: "normal", reps: 10, weight_kg: 40 },
							{ type: "normal", reps: 10, weight_kg: 40 },
							{ type: "normal", reps: 10, weight_kg: 40 },
						],
					},
				],
			},
		});

		console.log(
			"🔍 Debug - Payload FINAL con routine_folder_id válido:",
			JSON.stringify(hevyRoutineData, null, 2),
		);

		const data = await this.makeRequest("/routines", {
			method: "POST",
			body: hevyRoutineData,
		});

		return {
			success: true,
			routine: data,
			message: "Rutina creada exitosamente en Railway sin timeouts",
		};
	},
};

// Health check endpoint
app.get("/health", (_req, res) => {
	res.json({
		status: "ok",
		timestamp: new Date().toISOString(),
		server: "Railway Simple HTTP Server",
	});
});

// Main GPT endpoint (exactly like Vercel api/index.js)
app.post("/mcp", async (req, res) => {
	try {
		console.log("🤖 GPT Request:", JSON.stringify(req.body, null, 2));

		const { method, params = {} } = req.body;

		if (!method) {
			return res.status(400).json({
				jsonrpc: "2.0",
				error: { code: -32600, message: "Invalid Request: method is required" },
				id: req.body.id || null,
			});
		}

		let result: Record<string, unknown>;

		switch (method) {
			case "help":
				result = {
					message: "🚀 Hevy MCP Server en Railway - Funcionando perfectamente",
					server: "Railway Simple HTTP Server",
					availableMethods: [
						"help",
						"getLastWorkout",
						"getLastWorkouts",
						"getWorkouts",
						"getRoutines",
						"getRoutineFolders",
						"createRoutine",
						"getExerciseTemplates",
						"searchExerciseTemplates",
					],
					capabilities:
						"✅ CRUD completo sin timeouts - Perfecto para crear rutinas",
					timestamp: new Date().toISOString(),
				};
				break;

			case "getLastWorkout":
			case "getLastWorkouts": {
				const count = params.count || 1;
				const workoutData = await hevyClient.getLastWorkouts(count);
				result = {
					...workoutData,
					message: `✅ Últimos ${count} entrenamientos obtenidos de Hevy API`,
					server: "Railway",
				};
				break;
			}

			case "getWorkouts": {
				const workoutsData = await hevyClient.getWorkouts({
					page: params.page || 1,
					pageSize: params.pageSize || 5,
				});
				result = {
					...workoutsData,
					message: "✅ Entrenamientos obtenidos de Hevy API",
					server: "Railway",
				};
				break;
			}

			case "createRoutine": {
				const routineResult = await hevyClient.createRoutine({
					title: params.title || "Nueva Rutina",
					exercises: params.exercises,
					folderName: params.folderName || params.folder, // Support both parameter names
				});
				result = {
					...routineResult,
					message: "🎉 ¡Rutina creada exitosamente en Railway!",
					server: "Railway",
				};
				break;
			}

			case "getRoutines": {
				const routinesData = await hevyClient.getRoutines({
					page: params.page || 1,
					pageSize: params.pageSize || 5,
				});
				result = {
					...routinesData,
					message: "✅ Rutinas obtenidas de Hevy API",
					server: "Railway",
				};
				break;
			}

			case "getRoutineFolders": {
				const foldersData = await hevyClient.getRoutineFolders({
					page: params.page || 1,
					pageSize: params.pageSize || 5,
				});
				result = {
					...foldersData,
					message: "✅ Carpetas de rutinas obtenidas de Hevy API",
					server: "Railway",
				};
				break;
			}

			case "getExerciseTemplates": {
				const exerciseData = await hevyClient.getExerciseTemplates({
					page: params.page || 1,
					pageSize: params.pageSize || 20,
				});
				result = {
					...exerciseData,
					message: "✅ Plantillas de ejercicios obtenidas de Hevy API",
					server: "Railway",
				};
				break;
			}

			case "searchExerciseTemplates": {
				const searchQuery = params.query || params.search || "";
				if (!searchQuery) {
					result = {
						error: "Se requiere un término de búsqueda",
						server: "Railway",
					};
				} else {
					const searchResults =
						await hevyClient.searchExerciseTemplates(searchQuery);
					result = {
						...searchResults,
						message: `✅ Búsqueda de ejercicios completada para "${searchQuery}"`,
						server: "Railway",
					};
				}
				break;
			}

			default:
				result = {
					message: `Método ${method} recibido pero no implementado aún`,
					params,
					server: "Railway Simple HTTP Server",
					timestamp: new Date().toISOString(),
					availableMethods: [
						"help",
						"getLastWorkout",
						"getLastWorkouts",
						"getWorkouts",
						"getRoutines",
						"getRoutineFolders",
						"createRoutine",
						"getExerciseTemplates",
						"searchExerciseTemplates",
					],
				};
		}

		res.json({
			jsonrpc: "2.0",
			result,
			id: req.body.id || 1,
		});
	} catch (error: unknown) {
		console.error("❌ Error processing request:", error);
		res.status(500).json({
			jsonrpc: "2.0",
			error: {
				code: -32603,
				message: `Error: ${(error as Error).message}`,
			},
			id: req.body.id || null,
		});
	}
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
	console.log(`🚀 Simple HTTP server listening on http://0.0.0.0:${PORT}`);
	console.log(`📋 Health check: http://0.0.0.0:${PORT}/health`);
	console.log(`🤖 GPT endpoint: http://0.0.0.0:${PORT}/mcp`);
	console.log("✅ Railway deployment ready for GPT integration!");
});
