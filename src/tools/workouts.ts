import type { RequestConfiguration } from "@microsoft/kiota-abstractions";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { HevyClient } from "../generated/client/hevyClient.js";
import type {
	PostWorkoutsRequestBody,
	Workout,
} from "../generated/client/models/index.js";
import { formatWorkout } from "../utils/formatters.js";

/**
 * Register all workout-related tools with the MCP server
 */
export function registerWorkoutTools(
	server: McpServer,
	hevyClient: HevyClient,
) {
	// Get workouts
	server.tool(
		"get-workouts",
		{
			page: z.number().int().gte(1).default(1),
			pageSize: z.number().int().gte(1).lte(10).default(5),
		},
		async ({ page, pageSize }, extra: unknown) => {
			try {
				const data = await hevyClient.v1.workouts.get({
					queryParameters: {
						page,
						pageSize,
					},
				});

				// Process workouts to extract relevant information
				const workouts =
					data?.workouts?.map((workout) => formatWorkout(workout)) || [];
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(workouts, null, 2),
						},
					],
				};
			} catch (error) {
				console.error("Error fetching workouts:", error);
				return {
					content: [
						{
							type: "text",
							text: `Error fetching workouts: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
				};
			}
		},
	);

	// Get single workout by ID
	server.tool(
		"get-workout",
		{
			workoutId: z.string().min(1),
		},
		async ({ workoutId }, extra: unknown) => {
			try {
				const data = await hevyClient.v1.workouts.byWorkoutId(workoutId).get();

				if (!data) {
					return {
						content: [
							{
								type: "text",
								text: `Workout with ID ${workoutId} not found`,
							},
						],
					};
				}

				const workout = formatWorkout(data);
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(workout, null, 2),
						},
					],
				};
			} catch (error) {
				console.error(`Error fetching workout ${workoutId}:`, error);
				return {
					content: [
						{
							type: "text",
							text: `Error fetching workout: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
				};
			}
		},
	);

	// Get workout count
	server.tool("get-workout-count", {}, async (_, extra: unknown) => {
		try {
			const data = await hevyClient.v1.workouts.count.get();

			return {
				content: [
					{
						type: "text",
						text: `Total workouts: ${data ? (data as { count?: number }).count || 0 : 0}`,
					},
				],
			};
		} catch (error) {
			console.error("Error fetching workout count:", error);
			return {
				content: [
					{
						type: "text",
						text: `Error fetching workout count: ${error instanceof Error ? error.message : String(error)}`,
					},
				],
			};
		}
	});

	// Get workout events (updates/deletes)
	server.tool(
		"get-workout-events",
		{
			page: z.number().int().gte(1).default(1),
			pageSize: z.number().int().gte(1).lte(10).default(5),
			since: z.string().default("1970-01-01T00:00:00Z"),
		},
		async ({ page, pageSize, since }, extra: unknown) => {
			try {
				const data = await hevyClient.v1.workouts.events.get({
					queryParameters: {
						page,
						pageSize,
						since,
					},
				});

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(data?.events || [], null, 2),
						},
					],
				};
			} catch (error) {
				console.error("Error fetching workout events:", error);
				return {
					content: [
						{
							type: "text",
							text: `Error fetching workout events: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
				};
			}
		},
	);

	// Create workout
	server.tool(
		"create-workout",
		{
			title: z.string().min(1),
			description: z.string().optional().nullable(),
			startTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
			endTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
			isPrivate: z.boolean().default(false),
			exercises: z.array(
				z.object({
					exerciseTemplateId: z.string().min(1),
					supersetId: z.number().nullable().optional(),
					notes: z.string().optional().nullable(),
					sets: z.array(
						z.object({
							type: z
								.enum(["warmup", "normal", "failure", "dropset"])
								.default("normal"),
							weightKg: z.number().optional().nullable(),
							reps: z.number().int().optional().nullable(),
							distanceMeters: z.number().int().optional().nullable(),
							durationSeconds: z.number().int().optional().nullable(),
							rpe: z.number().optional().nullable(),
							customMetric: z.number().optional().nullable(),
						}),
					),
				}),
			),
		},
		async (
			{ title, description, startTime, endTime, isPrivate, exercises },
			extra: unknown,
		) => {
			try {
				const requestBody: PostWorkoutsRequestBody = {
					workout: {
						title,
						description: description || null,
						startTime,
						endTime,
						isPrivate,
						exercises: exercises.map((exercise) => ({
							exerciseTemplateId: exercise.exerciseTemplateId,
							supersetId: exercise.supersetId || null,
							notes: exercise.notes || null,
							sets: exercise.sets.map((set) => ({
								type: set.type,
								weightKg: set.weightKg || null,
								reps: set.reps || null,
								distanceMeters: set.distanceMeters || null,
								durationSeconds: set.durationSeconds || null,
								rpe: set.rpe || null,
								customMetric: set.customMetric || null,
							})),
						})),
					},
				};

				const data = await hevyClient.v1.workouts.post(requestBody);

				if (!data) {
					return {
						content: [
							{
								type: "text",
								text: "Failed to create workout",
							},
						],
					};
				}

				const workout = formatWorkout(data);
				return {
					content: [
						{
							type: "text",
							text: `Workout created successfully:\n${JSON.stringify(workout, null, 2)}`,
						},
					],
				};
			} catch (error) {
				console.error("Error creating workout:", error);
				return {
					content: [
						{
							type: "text",
							text: `Error creating workout: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
				};
			}
		},
	);

	// Update workout
	server.tool(
		"update-workout",
		{
			workoutId: z.string().min(1),
			title: z.string().min(1),
			description: z.string().optional().nullable(),
			startTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
			endTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
			isPrivate: z.boolean().default(false),
			exercises: z.array(
				z.object({
					exerciseTemplateId: z.string().min(1),
					supersetId: z.number().nullable().optional(),
					notes: z.string().optional().nullable(),
					sets: z.array(
						z.object({
							type: z
								.enum(["warmup", "normal", "failure", "dropset"])
								.default("normal"),
							weightKg: z.number().optional().nullable(),
							reps: z.number().int().optional().nullable(),
							distanceMeters: z.number().int().optional().nullable(),
							durationSeconds: z.number().int().optional().nullable(),
							rpe: z.number().optional().nullable(),
							customMetric: z.number().optional().nullable(),
						}),
					),
				}),
			),
		},
		async (
			{
				workoutId,
				title,
				description,
				startTime,
				endTime,
				isPrivate,
				exercises,
			},
			extra: unknown,
		) => {
			try {
				const requestBody: PostWorkoutsRequestBody = {
					workout: {
						title,
						description: description || null,
						startTime,
						endTime,
						isPrivate,
						exercises: exercises.map((exercise) => ({
							exerciseTemplateId: exercise.exerciseTemplateId,
							supersetId: exercise.supersetId || null,
							notes: exercise.notes || null,
							sets: exercise.sets.map((set) => ({
								type: set.type,
								weightKg: set.weightKg || null,
								reps: set.reps || null,
								distanceMeters: set.distanceMeters || null,
								durationSeconds: set.durationSeconds || null,
								rpe: set.rpe || null,
								customMetric: set.customMetric || null,
							})),
						})),
					},
				};

				const data = await hevyClient.v1.workouts
					.byWorkoutId(workoutId)
					.put(requestBody);

				if (!data) {
					return {
						content: [
							{
								type: "text",
								text: `Failed to update workout with ID ${workoutId}`,
							},
						],
					};
				}

				const workout = formatWorkout(data);
				return {
					content: [
						{
							type: "text",
							text: `Workout updated successfully:\n${JSON.stringify(workout, null, 2)}`,
						},
					],
				};
			} catch (error) {
				console.error(`Error updating workout ${workoutId}:`, error);
				return {
					content: [
						{
							type: "text",
							text: `Error updating workout: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
				};
			}
		},
	);
}
