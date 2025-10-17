/**
 * Funciones de validación para hacer el MCP "a prueba de GPTs tontos"
 * Estas validaciones previenen errores comunes del GPT con IDs inválidos
 */

export interface ValidationError {
	code: string;
	message: string;
	provided?: any;
	expected_format?: string;
	suggestion?: string;
	gpt_instructions?: string;
}

/**
 * Valida que un string sea un UUID válido (formato routine ID)
 */
export function isValidUUID(id: string): boolean {
	if (!id || typeof id !== "string") return false;

	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return uuidRegex.test(id);
}

/**
 * Valida que un string sea un exercise template ID válido (8 caracteres hex)
 */
export function isValidExerciseTemplateId(id: string): boolean {
	if (!id || typeof id !== "string") return false;

	const exerciseIdRegex = /^[0-9A-F]{8}$/i;
	return exerciseIdRegex.test(id);
}

/**
 * Crea un error de validación para routine ID inválido
 */
export function createInvalidRoutineIdError(providedId: any): ValidationError {
	return {
		code: "INVALID_ROUTINE_ID",
		message:
			"❌ CRITICAL ERROR: routineId inválido detectado. STOP inmediatamente.",
		provided: providedId,
		expected_format: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (UUID con guiones)",
		suggestion: "Debes llamar a 'getRoutines' PRIMERO para obtener IDs válidos",
		gpt_instructions:
			"🤖 GPT: 1) Llama a getRoutines, 2) Usa el ID que devuelve la respuesta, 3) NO inventes IDs nunca",
	};
}

/**
 * Crea un error de validación para exercise template ID inválido
 */
export function createInvalidExerciseIdError(providedId: any): ValidationError {
	return {
		code: "INVALID_EXERCISE_ID",
		message:
			"❌ CRITICAL ERROR: exerciseTemplateId inválido detectado. STOP inmediatamente.",
		provided: providedId,
		expected_format: "XXXXXXXX (exactamente 8 caracteres hexadecimales)",
		suggestion:
			"Debes llamar a 'searchExerciseTemplates' PRIMERO para obtener IDs válidos",
		gpt_instructions:
			"🤖 GPT: 1) Llama a searchExerciseTemplates con query, 2) Usa EXACTAMENTE el ID de la respuesta, 3) NO inventes IDs",
	};
}

/**
 * Crea un error cuando se confunden exercise ID con routine ID
 */
export function createIdConfusionError(providedId: any): ValidationError {
	const looks_like_exercise_id =
		typeof providedId === "string" && /^[0-9A-F]{8}$/i.test(providedId);

	if (looks_like_exercise_id) {
		return {
			code: "ID_CONFUSION_EXERCISE_AS_ROUTINE",
			message:
				"❌ CRITICAL ERROR: Estás usando un exercise ID como routine ID. DIFERENTES tipos de ID.",
			provided: providedId,
			expected_format:
				"routineId debe ser UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			suggestion: "Este ID de 8 caracteres es para EJERCICIOS, no rutinas",
			gpt_instructions:
				"🤖 GPT: CONFUSION DETECTADA. 1) Exercise ID = 8 chars, 2) Routine ID = UUID con guiones. Usa getRoutines para rutinas.",
		};
	}

	return createInvalidRoutineIdError(providedId);
}

/**
 * Valida parámetros de sets para addExerciseToRoutine
 */
export function validateSets(sets: any[]): ValidationError | null {
	if (!Array.isArray(sets) || sets.length === 0) {
		return {
			code: "INVALID_SETS",
			message: "❌ CRITICAL ERROR: 'sets' debe ser un array con al menos 1 set",
			provided: sets,
			expected_format: "[{type: 'normal', reps: 12, weightKg: 20}]",
			suggestion:
				"Cada set debe tener 'type' y opcionalmente weightKg, reps, durationSeconds",
			gpt_instructions:
				"🤖 GPT: Siempre incluye un array 'sets' con al menos 1 set válido",
		};
	}

	for (const [index, set] of sets.entries()) {
		if (!set.type) {
			return {
				code: "MISSING_SET_TYPE",
				message: `❌ CRITICAL ERROR: Set ${index + 1} missing required 'type' field`,
				provided: set,
				expected_format:
					"type debe ser: 'normal', 'warmup', 'failure', o 'dropset'",
				suggestion: "Cada set DEBE tener el campo 'type'",
				gpt_instructions: "🤖 GPT: SIEMPRE incluye 'type' en cada set",
			};
		}

		const validTypes = ["normal", "warmup", "failure", "dropset"];
		if (!validTypes.includes(set.type)) {
			return {
				code: "INVALID_SET_TYPE",
				message: `❌ CRITICAL ERROR: Set ${index + 1} has invalid type '${set.type}'`,
				provided: set.type,
				expected_format: `Debe ser uno de: ${validTypes.join(", ")}`,
				suggestion: "Usa 'normal' para sets regulares",
				gpt_instructions: "🤖 GPT: type='normal' es el más común",
			};
		}
	}

	return null; // Valid
}

/**
 * Convierte un ValidationError en el formato estándar de respuesta MCP
 */
export function formatValidationError(error: ValidationError) {
	return {
		error: {
			code: -32603,
			message:
				`${error.message}\n\n` +
				`💡 Provided: ${JSON.stringify(error.provided)}\n` +
				`✅ Expected: ${error.expected_format}\n` +
				`🔧 Suggestion: ${error.suggestion}\n` +
				`${error.gpt_instructions}`,
		},
	};
}
