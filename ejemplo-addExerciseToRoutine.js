/**
 * EJEMPLO CORRECTO: Cómo usar addExerciseToRoutine
 *
 * Este ejemplo muestra la forma correcta de añadir ejercicios a una rutina
 * usando el método addExerciseToRoutine del servidor MCP Hevy.
 */

// URL del servidor MCP en Railway
const MCP_SERVER_URL = "https://hevy-mcp-production.up.railway.app/mcp";

/**
 * Función para añadir un ejercicio a una rutina existente
 * @param {string} routineId - ID de la rutina donde añadir el ejercicio
 * @param {string} exerciseTemplateId - ID de la plantilla del ejercicio
 * @param {Array} sets - Array de sets con sus propiedades
 * @param {number} [restSeconds] - Tiempo de descanso entre sets (opcional)
 * @param {string} [notes] - Notas sobre el ejercicio (opcional)
 */
async function addExerciseToRoutine(
	routineId,
	exerciseTemplateId,
	sets,
	restSeconds = null,
	notes = null,
) {
	const payload = {
		jsonrpc: "2.0",
		id: 1,
		method: "addExerciseToRoutine",
		params: {
			routineId,
			exerciseTemplateId, // ⚠️ IMPORTANTE: Es exerciseTemplateId, NO templateId
			sets, // ⚠️ REQUERIDO: Debe incluir al menos un set
			...(restSeconds && { restSeconds }),
			...(notes && { notes }),
		},
	};

	console.log("📤 Enviando petición:", JSON.stringify(payload, null, 2));

	try {
		const response = await fetch(MCP_SERVER_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		const data = await response.json();

		if (data.error) {
			console.error("❌ Error:", data.error);
			return null;
		}

		console.log("✅ Ejercicio añadido correctamente");
		return data.result;
	} catch (error) {
		console.error("❌ Error de red:", error.message);
		return null;
	}
}

// ===== EJEMPLOS DE USO =====

// Ejemplo 1: Añadir ejercicio con peso y repeticiones
async function ejemplo1_ejercicioConPeso() {
	console.log("\n=== Ejemplo 1: Ejercicio con peso (Leg Press) ===");

	await addExerciseToRoutine(
		"6fdd6220-8277-460f-bb35-641d225fd4c9", // ID de la rutina
		"C7973E0E", // Leg Press
		[
			{ type: "warmup", reps: 12, weightKg: 30 },
			{ type: "normal", reps: 12, weightKg: 45 },
			{ type: "normal", reps: 12, weightKg: 45 },
			{ type: "normal", reps: 10, weightKg: 50 },
		],
		120, // 120 segundos de descanso
		"Mantener control en el movimiento",
	);
}

// Ejemplo 2: Añadir ejercicio de duración (cardio)
async function ejemplo2_ejercicioDuracion() {
	console.log("\n=== Ejemplo 2: Ejercicio de duración (Air Bike) ===");

	await addExerciseToRoutine(
		"6fdd6220-8277-460f-bb35-641d225fd4c9",
		"43573BB8", // Air Bike
		[
			{ type: "normal", durationSeconds: 600 }, // 10 minutos
		],
		60,
		"Ritmo medio, mantener frecuencia cardíaca en zona 2",
	);
}

// Ejemplo 3: Añadir ejercicio de peso corporal
async function ejemplo3_pesoCorporal() {
	console.log("\n=== Ejemplo 3: Ejercicio de peso corporal (Plank) ===");

	await addExerciseToRoutine(
		"6fdd6220-8277-460f-bb35-641d225fd4c9",
		"C6C9B8A0", // Plank
		[
			{ type: "normal", durationSeconds: 30 },
			{ type: "normal", durationSeconds: 45 },
			{ type: "normal", durationSeconds: 45 },
		],
		60,
		"Mantener core activado, no dejar caer cadera",
	);
}

// Ejemplo 4: Añadir múltiples ejercicios en secuencia
async function ejemplo4_crearRutinaCompleta() {
	console.log("\n=== Ejemplo 4: Crear rutina completa ===");

	const routineId = "6fdd6220-8277-460f-bb35-641d225fd4c9";

	// 1. Calentamiento - Air Bike
	await addExerciseToRoutine(
		routineId,
		"43573BB8",
		[{ type: "warmup", durationSeconds: 600 }],
		0,
		"Calentamiento inicial",
	);

	// 2. Leg Press
	await addExerciseToRoutine(
		routineId,
		"C7973E0E",
		[
			{ type: "normal", reps: 12, weightKg: 40 },
			{ type: "normal", reps: 12, weightKg: 45 },
			{ type: "normal", reps: 10, weightKg: 50 },
		],
		120,
	);

	// 3. Seated Row
	await addExerciseToRoutine(
		routineId,
		"D9A519CE",
		[
			{ type: "normal", reps: 12, weightKg: 25 },
			{ type: "normal", reps: 12, weightKg: 30 },
			{ type: "normal", reps: 10, weightKg: 30 },
		],
		90,
	);

	// 4. Bicep Curl
	await addExerciseToRoutine(
		routineId,
		"ADA8623C",
		[
			{ type: "normal", reps: 12, weightKg: 20 },
			{ type: "normal", reps: 12, weightKg: 22 },
			{ type: "normal", reps: 10, weightKg: 25 },
		],
		60,
	);

	// 5. Triceps Pushdown
	await addExerciseToRoutine(
		routineId,
		"93A552C6",
		[
			{ type: "normal", reps: 12, weightKg: 20 },
			{ type: "normal", reps: 12, weightKg: 22 },
			{ type: "normal", reps: 10, weightKg: 25 },
		],
		60,
	);

	// 6. Plank
	await addExerciseToRoutine(
		routineId,
		"C6C9B8A0",
		[
			{ type: "normal", durationSeconds: 30 },
			{ type: "normal", durationSeconds: 45 },
			{ type: "normal", durationSeconds: 45 },
		],
		60,
	);

	// 7. Treadmill (enfriamiento)
	await addExerciseToRoutine(
		routineId,
		"243710DE",
		[{ type: "normal", durationSeconds: 900 }], // 15 minutos
		0,
		"5 min @ 4 km/h, 5 min @ 6 km/h, 5 min @ 5 km/h con inclinación",
	);

	console.log("✅ Rutina completa creada");
}

// ===== ERRORES COMUNES A EVITAR =====

// ❌ ERROR 1: Usar templateId en lugar de exerciseTemplateId
async function error1_nombreIncorrecto() {
	console.log("\n=== ❌ ERROR 1: Nombre de parámetro incorrecto ===");

	const _payload = {
		jsonrpc: "2.0",
		id: 1,
		method: "addExerciseToRoutine",
		params: {
			routineId: "xxx",
			templateId: "43573BB8", // ❌ INCORRECTO: debería ser exerciseTemplateId
			sets: [{ type: "normal", reps: 10 }],
		},
	};

	console.log("❌ Esto fallará porque 'templateId' es incorrecto");
	console.log("✅ Usar 'exerciseTemplateId' en su lugar");
}

// ❌ ERROR 2: No incluir sets
async function error2_sinSets() {
	console.log("\n=== ❌ ERROR 2: No incluir sets ===");

	const _payload = {
		jsonrpc: "2.0",
		id: 1,
		method: "addExerciseToRoutine",
		params: {
			routineId: "xxx",
			exerciseTemplateId: "43573BB8",
			// ❌ FALTA: sets es requerido
		},
	};

	console.log("❌ Esto fallará porque 'sets' es obligatorio");
	console.log("✅ Siempre incluir al menos un set");
}

// ❌ ERROR 3: Set sin type
async function error3_setSinType() {
	console.log("\n=== ❌ ERROR 3: Set sin type ===");

	const _payload = {
		jsonrpc: "2.0",
		id: 1,
		method: "addExerciseToRoutine",
		params: {
			routineId: "xxx",
			exerciseTemplateId: "43573BB8",
			sets: [
				{ reps: 10, weightKg: 40 }, // ❌ FALTA: type
			],
		},
	};

	console.log("❌ Esto puede causar problemas porque 'type' es requerido");
	console.log("✅ Usar type: 'normal', 'warmup', 'failure', o 'dropset'");
}

// Función principal para ejecutar los ejemplos
async function main() {
	console.log("🏋️ Ejemplos de uso de addExerciseToRoutine\n");
	console.log("Para ejecutar estos ejemplos, necesitas:");
	console.log("1. Un ID de rutina válido");
	console.log("2. IDs de ejercicios válidos de Hevy");
	console.log("3. Conexión al servidor MCP en Railway\n");

	// Descomentar para ejecutar:
	// await ejemplo1_ejercicioConPeso();
	// await ejemplo2_ejercicioDuracion();
	// await ejemplo3_pesoCorporal();
	// await ejemplo4_crearRutinaCompleta();

	// Mostrar errores comunes
	await error1_nombreIncorrecto();
	await error2_sinSets();
	await error3_setSinType();
}

// Ejecutar si se llama directamente
if (require.main === module) {
	main().catch(console.error);
}

// Exportar para uso en otros módulos
module.exports = {
	addExerciseToRoutine,
	ejemplo1_ejercicioConPeso,
	ejemplo2_ejercicioDuracion,
	ejemplo3_pesoCorporal,
	ejemplo4_crearRutinaCompleta,
};
