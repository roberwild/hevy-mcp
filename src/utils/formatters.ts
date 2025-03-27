import type {
	Routine_exercises as Exercise,
	Routine_exercises_sets as ExerciseSet,
	ExerciseTemplate,
	Routine,
	RoutineFolder,
	Workout,
} from "../generated/client/models/index.js";

/**
 * Format a workout object for consistent presentation
 */
export function formatWorkout(workout: Workout): Record<string, unknown> {
	return {
		id: workout.id,
		date: workout.createdAt,
		name: workout.title,
		description: workout.description,
		duration: calculateDuration(workout.startTime || "", workout.endTime || ""),
		exercises: workout.exercises?.map((exercise: Exercise) => {
			return {
				name: exercise.title,
				notes: exercise.notes,
				sets: exercise.sets?.map((set: ExerciseSet) => ({
					type: set.type,
					weight: set.weightKg,
					reps: set.reps,
					distance: set.distanceMeters,
					duration: set.durationSeconds,
					rpe: set.rpe,
					customMetric: set.customMetric,
				})),
			};
		}),
	};
}

/**
 * Format a routine object for consistent presentation
 */
export function formatRoutine(routine: Routine): Record<string, unknown> {
	return {
		id: routine.id,
		title: routine.title,
		folderId: routine.folderId,
		createdAt: routine.createdAt,
		updatedAt: routine.updatedAt,
		exercises: routine.exercises?.map((exercise: Exercise) => {
			return {
				name: exercise.title,
				index: exercise.index,
				exerciseTemplateId: exercise.exerciseTemplateId,
				notes: exercise.notes,
				supersetId: exercise.supersetsId,
				sets: exercise.sets?.map((set: ExerciseSet) => ({
					index: set.index,
					type: set.type,
					weight: set.weightKg,
					reps: set.reps,
					distance: set.distanceMeters,
					duration: set.durationSeconds,
					customMetric: set.customMetric,
				})),
			};
		}),
	};
}

/**
 * Format a routine folder object for consistent presentation
 */
export function formatRoutineFolder(
	folder: RoutineFolder,
): Record<string, unknown> {
	return {
		id: folder.id,
		title: folder.title,
		createdAt: folder.createdAt,
		updatedAt: folder.updatedAt,
	};
}

/**
 * Calculate duration between two ISO timestamp strings
 */
export function calculateDuration(
	startTime: string | number | null | undefined,
	endTime: string | number | null | undefined,
): string {
	if (!startTime || !endTime) return "Unknown duration";

	const start = new Date(startTime);
	const end = new Date(endTime);
	const durationMs = end.getTime() - start.getTime();

	const hours = Math.floor(durationMs / (1000 * 60 * 60));
	const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

	return `${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Format an exercise template object for consistent presentation
 */
export function formatExerciseTemplate(
	template: ExerciseTemplate,
): Record<string, unknown> {
	return {
		id: template.id,
		title: template.title,
		type: template.type,
		primaryMuscleGroup: template.primaryMuscleGroup,
		secondaryMuscleGroups: template.secondaryMuscleGroups,
		isCustom: template.isCustom,
	};
}
