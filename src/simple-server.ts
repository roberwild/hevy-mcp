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
					validFolderId = existingRoutines.routines[0].folder_id; // Correct field name
					console.log("✅ folder_id por defecto encontrado:", validFolderId);
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

		// Prepare payload with valid folder_id (NOT routine_folder_id!)
		// Process exercises to match API format
		let processedExercises = [];
		if (Array.isArray(exercises) && exercises.length > 0) {
			processedExercises = exercises.map((exercise: any) => ({
				exercise_template_id:
					exercise.exerciseTemplateId || exercise.exercise_template_id,
				superset_id: exercise.supersetId || exercise.superset_id || null,
				rest_seconds: exercise.restSeconds || exercise.rest_seconds || null,
				notes: exercise.notes || null,
				sets:
					Array.isArray(exercise.sets) && exercise.sets.length > 0
						? exercise.sets.map((set: any) => ({
								type: set.type || "normal",
								weight_kg: set.weightKg || set.weight_kg || null,
								reps: set.reps || null,
								distance_meters:
									set.distanceMeters || set.distance_meters || null,
								duration_seconds:
									set.durationSeconds || set.duration_seconds || null,
								custom_metric: set.customMetric || set.custom_metric || null,
							}))
						: [{ type: "normal", reps: 10, weight_kg: null }],
			}));
		} else {
			// Default exercise if none provided
			processedExercises = [
				{
					exercise_template_id: "79D0BB3A", // Press de Banca por defecto
					sets: [
						{ type: "normal", reps: 10, weight_kg: 40 },
						{ type: "normal", reps: 10, weight_kg: 40 },
						{ type: "normal", reps: 10, weight_kg: 40 },
					],
				},
			];
		}

		const hevyRoutineData = removeUndefined({
			routine: {
				title: title || "Nueva Rutina",
				folder_id: validFolderId, // Hevy uses "folder_id", not "routine_folder_id"
				exercises: processedExercises,
			},
		});

		console.log(
			"🔍 Debug - Payload FINAL con folder_id válido:",
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

	async updateRoutine(routineId: string, routineData: Record<string, unknown>) {
		const { title, exercises, notes } = routineData;

		// Helper function to remove undefined/null values recursively
		const removeUndefined = (obj: any) => JSON.parse(JSON.stringify(obj));

		// Ensure we have at least one exercise (API requirement)
		let processedExercises = [];

		if (Array.isArray(exercises) && exercises.length > 0) {
			processedExercises = exercises.map((exercise: any) => ({
				exercise_template_id:
					exercise.exerciseTemplateId || exercise.exercise_template_id,
				superset_id: exercise.supersetId || exercise.superset_id || null,
				rest_seconds: exercise.restSeconds || exercise.rest_seconds || null,
				notes: exercise.notes || null,
				sets:
					Array.isArray(exercise.sets) && exercise.sets.length > 0
						? exercise.sets.map((set: any) => ({
								type: set.type || "normal",
								weight_kg: set.weightKg || set.weight_kg || null,
								reps: set.reps || null,
								distance_meters:
									set.distanceMeters || set.distance_meters || null,
								duration_seconds:
									set.durationSeconds || set.duration_seconds || null,
								custom_metric: set.customMetric || set.custom_metric || null,
							}))
						: [{ type: "normal", reps: 10, weight_kg: null }], // Default set if empty
			}));
		} else {
			// Default exercise if no exercises provided (API requires at least 1)
			processedExercises = [
				{
					exercise_template_id: "79D0BB3A", // Bench Press default
					sets: [{ type: "normal", reps: 10, weight_kg: 40 }],
					notes: "Ejercicio por defecto - actualizar según necesidad",
					superset_id: null,
					rest_seconds: 90,
				},
			];
		}

		const payload = removeUndefined({
			routine: {
				title: title || "Rutina Sin Título",
				notes: notes || null,
				exercises: processedExercises,
			},
		});

		console.log(
			"🔄 Actualizando rutina:",
			routineId,
			"Ejercicios a enviar:",
			processedExercises.length,
			"Payload:",
			JSON.stringify(payload, null, 2),
		);

		const result = await this.makeRequest(`/routines/${routineId}`, {
			method: "PUT",
			body: payload,
		});
		console.log("✅ Rutina actualizada:", result);
		return removeUndefined(result);
	},

	async getRoutineById(routineId: string) {
		const result = await this.makeRequest(`/routines/${routineId}`);
		return result;
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
						"updateRoutine",
						"getRoutineDetails",
						"addExerciseToRoutine",
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

				// Add folder information to the result
				const folderInfo =
					params.folderName || params.folder
						? `en la carpeta "${params.folderName || params.folder}"`
						: "en la carpeta por defecto";

				result = {
					...routineResult,
					message: `🎉 ¡Rutina "${params.title || "Nueva Rutina"}" creada exitosamente ${folderInfo}!`,
					server: "Railway",
				};
				break;
			}

			case "updateRoutine": {
				const routineResult = await hevyClient.updateRoutine(params.routineId, {
					title: params.title,
					exercises: params.exercises,
					notes: params.notes,
				});

				result = {
					...routineResult,
					message: "🔄 ¡Rutina actualizada exitosamente!",
					server: "Railway",
				};
				break;
			}

			case "getRoutineDetails": {
				const routineData = await hevyClient.getRoutineById(params.routineId);
				result = {
					...routineData,
					message: "✅ Detalles de rutina obtenidos de Hevy API",
					server: "Railway",
				};
				break;
			}

			case "addExerciseToRoutine": {
				// First get current routine
				const currentRoutine = await hevyClient.getRoutineById(
					params.routineId,
				);
				if (!currentRoutine) {
					result = {
						error: `Rutina con ID ${params.routineId} no encontrada`,
						server: "Railway",
					};
					break;
				}

				console.log(
					"🔍 addExerciseToRoutine - currentRoutine structure:",
					JSON.stringify(currentRoutine, null, 2),
				);

				// Convert existing exercises to the format expected by updateRoutine (camelCase)
				const existingExercises = (currentRoutine.exercises || []).map(
					(exercise: any) => ({
						exerciseTemplateId: exercise.exercise_template_id,
						supersetId: exercise.superset_id,
						restSeconds: exercise.rest_seconds,
						notes: exercise.notes,
						sets: Array.isArray(exercise.sets)
							? exercise.sets.map((set: any) => ({
									type: set.type,
									weightKg: set.weight_kg,
									reps: set.reps,
									distanceMeters: set.distance_meters,
									durationSeconds: set.duration_seconds,
									customMetric: set.custom_metric,
								}))
							: [],
					}),
				);

				// Prepare new exercise in camelCase format
				const newExercise = {
					exerciseTemplateId: params.exerciseTemplateId,
					supersetId: params.supersetId || null,
					restSeconds: params.restSeconds || null,
					notes: params.notes || null,
					sets: params.sets || [],
				};

				// Combine all exercises in consistent camelCase format
				const allExercises = [...existingExercises, newExercise];

				console.log(
					"🔄 addExerciseToRoutine - Ejercicios finales:",
					JSON.stringify(allExercises, null, 2),
				);

				// Update routine with new exercise
				const updatedRoutine = await hevyClient.updateRoutine(
					params.routineId,
					{
						title: currentRoutine.title,
						notes: currentRoutine.notes,
						exercises: allExercises,
					},
				);

				result = {
					...updatedRoutine,
					message: "✅ Ejercicio añadido exitosamente a la rutina",
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
					pageSize: params.pageSize || 10, // More folders by default
				});
				result = {
					...foldersData,
					message:
						"✅ Carpetas de rutinas disponibles - El usuario puede elegir dónde crear su rutina",
					availableFolders:
						foldersData.routineFolders?.map((folder: any) => ({
							id: folder.id,
							name: folder.title,
							description: `Carpeta "${folder.title}" (ID: ${folder.id})`,
						})) || [],
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
