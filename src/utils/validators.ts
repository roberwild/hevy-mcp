/**
 * Utility functions for validating input data
 */
import { z } from "zod";

/**
 * Validation schema for pagination parameters
 */
export const paginationSchema = z.object({
	page: z.number().int().gte(1).default(1),
	pageSize: z.number().int().gte(1).lte(10).default(5),
});

/**
 * Validation schema for workout set input
 */
export const workoutSetSchema = z.object({
	type: z.enum(["warmup", "normal", "failure", "dropset"]).default("normal"),
	weightKg: z.number().optional().nullable(),
	reps: z.number().int().optional().nullable(),
	distanceMeters: z.number().int().optional().nullable(),
	durationSeconds: z.number().int().optional().nullable(),
	customMetric: z.number().optional().nullable(),
	rpe: z.number().optional().nullable(),
});

/**
 * Validation schema for exercise input in workouts
 */
export const workoutExerciseSchema = z.object({
	exerciseTemplateId: z.string().min(1),
	supersetId: z.number().nullable().optional(),
	notes: z.string().optional().nullable(),
	sets: z.array(workoutSetSchema),
});

/**
 * Validation schema for workout creation
 */
export const createWorkoutSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional().nullable(),
	startTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
	endTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
	isPrivate: z.boolean().default(false),
	exercises: z.array(workoutExerciseSchema),
});

/**
 * Validation schema for routine set input
 */
export const routineSetSchema = z.object({
	type: z.enum(["warmup", "normal", "failure", "dropset"]).default("normal"),
	weightKg: z.number().optional().nullable(),
	reps: z.number().int().optional().nullable(),
	distanceMeters: z.number().int().optional().nullable(),
	durationSeconds: z.number().int().optional().nullable(),
	customMetric: z.number().optional().nullable(),
});

/**
 * Validation schema for exercise input in routines
 */
export const routineExerciseSchema = z.object({
	exerciseTemplateId: z.string().min(1),
	supersetId: z.number().nullable().optional(),
	restSeconds: z.number().int().min(0).optional().nullable(),
	notes: z.string().optional().nullable(),
	sets: z.array(routineSetSchema),
});

/**
 * Validation schema for routine creation
 */
export const createRoutineSchema = z.object({
	title: z.string().min(1),
	folderId: z.number().nullable().optional(),
	notes: z.string().optional(),
	exercises: z.array(routineExerciseSchema),
});

/**
 * Validation schema for routine folder creation
 */
export const createRoutineFolderSchema = z.object({
	title: z.string().min(1),
});
