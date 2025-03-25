import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { HevyClient } from "../client/hevyClient.js";
import type { Routine } from "../client/models/index.js";

/**
 * Register all routine-related tools with the MCP server
 */
export function registerRoutineTools(
	server: McpServer,
	hevyClient: HevyClient,
) {
	// Get routines
	server.tool(
		"get-routines",
		{
			page: z.number().int().gte(1).default(1),
			pageSize: z.number().int().gte(1).lte(10).default(5),
		},
		async ({ page, pageSize }) => {
			try {
				const data = await hevyClient.v1.routines.get({
					queryParameters: {
						page,
						pageSize,
					},
				});

				// Process routines to extract relevant information
				const routines =
					data?.routines?.map((routine) => formatRoutine(routine)) || [];

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(routines, null, 2),
						},
					],
				};
			} catch (error) {
				console.error("Error fetching routines:", error);
				return {
					content: [
						{
							type: "text",
							text: `Error fetching routines: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
				};
			}
		},
	);

	// Get single routine by ID
	server.tool(
		"get-routine",
		{
			routineId: z.string().min(1),
		},
		async ({ routineId }) => {
			try {
				// Since the Kiota client doesn't have a get() method for routine by ID, we need to use the list endpoint and filter
				const response = await hevyClient.v1.routines.get();
				const data = response?.routines?.find(
					(routine) => routine.id === routineId,
				);

				if (!data) {
					return {
						content: [
							{
								type: "text",
								text: `Routine with ID ${routineId} not found`,
							},
						],
					};
				}

				const routine = formatRoutine(data);

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(routine, null, 2),
						},
					],
				};
			} catch (error) {
				console.error(`Error fetching routine ${routineId}:`, error);
				return {
					content: [
						{
							type: "text",
							text: `Error fetching routine: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
				};
			}
		},
	);

	// Create new routine
	server.tool(
		"create-routine",
		{
			title: z.string().min(1),
			folderId: z.number().nullable().optional(),
			notes: z.string().optional(),
			exercises: z.array(
				z.object({
					exerciseTemplateId: z.string().min(1),
					supersetId: z.number().nullable().optional(),
					restSeconds: z.number().int().min(0).optional(),
					notes: z.string().optional(),
					sets: z.array(
						z.object({
							type: z
								.enum(["warmup", "normal", "failure", "dropset"])
								.default("normal"),
							weightKg: z.number().optional(),
							reps: z.number().int().optional(),
							distanceMeters: z.number().int().optional(),
							durationSeconds: z.number().int().optional(),
							customMetric: z.number().optional(),
						}),
					),
				}),
			),
		},
		async ({ title, folderId, notes, exercises }) => {
			try {
				const data = await hevyClient.v1.routines.post({
					routine: {
						title,
						folderId: folderId || null,
						notes: notes || "",
						exercises: exercises.map((exercise) => ({
							exerciseTemplateId: exercise.exerciseTemplateId,
							supersetId: exercise.supersetId || null,
							restSeconds: exercise.restSeconds || null,
							notes: exercise.notes || null,
							sets: exercise.sets.map((set) => ({
								type: set.type,
								weightKg: set.weightKg || null,
								reps: set.reps || null,
								distanceMeters: set.distanceMeters || null,
								durationSeconds: set.durationSeconds || null,
								customMetric: set.customMetric || null,
							})),
						})),
					},
				});

				if (!data) {
					return {
						content: [
							{
								type: "text",
								text: "Failed to create routine",
							},
						],
					};
				}

				const routine = formatRoutine(data);

				return {
					content: [
						{
							type: "text",
							text: `Routine created successfully:\n${JSON.stringify(routine, null, 2)}`,
						},
					],
				};
			} catch (error) {
				console.error("Error creating routine:", error);
				return {
					content: [
						{
							type: "text",
							text: `Error creating routine: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
				};
			}
		},
	);

	// Update existing routine
	server.tool(
		"update-routine",
		{
			routineId: z.string().min(1),
			title: z.string().min(1),
			notes: z.string().optional(),
			exercises: z.array(
				z.object({
					exerciseTemplateId: z.string().min(1),
					supersetId: z.number().nullable().optional(),
					restSeconds: z.number().int().min(0).optional(),
					notes: z.string().optional(),
					sets: z.array(
						z.object({
							type: z
								.enum(["warmup", "normal", "failure", "dropset"])
								.default("normal"),
							weightKg: z.number().optional(),
							reps: z.number().int().optional(),
							distanceMeters: z.number().int().optional(),
							durationSeconds: z.number().int().optional(),
							customMetric: z.number().optional(),
						}),
					),
				}),
			),
		},
		async ({ routineId, title, notes, exercises }) => {
			try {
				const data = await hevyClient.v1.routines.byRoutineId(routineId).put({
					routine: {
						title,
						notes: notes || null,
						exercises: exercises.map((exercise) => ({
							exerciseTemplateId: exercise.exerciseTemplateId,
							supersetId: exercise.supersetId || null,
							restSeconds: exercise.restSeconds || null,
							notes: exercise.notes || null,
							sets: exercise.sets.map((set) => ({
								type: set.type,
								weightKg: set.weightKg || null,
								reps: set.reps || null,
								distanceMeters: set.distanceMeters || null,
								durationSeconds: set.durationSeconds || null,
								customMetric: set.customMetric || null,
							})),
						})),
					},
				});

				if (!data) {
					return {
						content: [
							{
								type: "text",
								text: `Failed to update routine with ID ${routineId}`,
							},
						],
					};
				}

				const routine = formatRoutine(data);

				return {
					content: [
						{
							type: "text",
							text: `Routine updated successfully:\n${JSON.stringify(routine, null, 2)}`,
						},
					],
				};
			} catch (error) {
				console.error(`Error updating routine ${routineId}:`, error);
				return {
					content: [
						{
							type: "text",
							text: `Error updating routine: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
				};
			}
		},
	);
}

/**
 * Format a routine object for consistent presentation
 */
function formatRoutine(routine: Routine): Record<string, unknown> {
	return {
		id: routine.id,
		title: routine.title,
		folderId: routine.folderId,
		createdAt: routine.createdAt,
		updatedAt: routine.updatedAt,
		exercises: routine.exercises?.map((exercise) => {
			return {
				name: exercise.title,
				index: exercise.index,
				exerciseTemplateId: exercise.exerciseTemplateId,
				notes: exercise.notes,
				supersetId: exercise.supersetsId,
				sets: exercise.sets?.map((set) => ({
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
