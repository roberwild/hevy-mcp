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
		"Get a paginated list of workouts. Returns workout details including title, description, start/end times, and exercises performed. Results are ordered from newest to oldest.",
		{
			page: z.coerce.number().gte(1).default(1),
			pageSize: z.coerce.number().int().gte(1).lte(10).default(5),
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
					isError: true,
				};
			}
		},
	);

	// Get single workout by ID
	server.tool(
		"get-workout",
		"Get complete details of a specific workout by ID. Returns all workout information including title, description, start/end times, and detailed exercise data.",
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
					isError: true,
				};
			}
		},
	);

	// Get workout count
	server.tool(
		"get-workout-count",
		"Get the total number of workouts on the account. Useful for pagination or statistics.",
		{},
		async (_, extra: unknown) => {
			try {
				const data = await hevyClient.v1.workouts.count.get();

				return {
					content: [
						{
							type: "text",
							text: `Total workouts: ${data ? data.workoutCount || 0 : 0}`,
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
					isError: true,
				};
			}
		},
	);

	// Get workout events (updates/deletes)
	server.tool(
		"get-workout-events",
		"Retrieve a paged list of workout events (updates or deletes) since a given date. Events are ordered from newest to oldest. The intention is to allow clients to keep their local cache of workouts up to date without having to fetch the entire list of workouts.",
		{
			page: z.coerce.number().int().gte(1).default(1),
			pageSize: z.coerce.number().int().gte(1).lte(10).default(5),
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
					isError: true,
				};
			}
		},
	);

	// Create workout
	server.tool(
		"create-workout",
		"Create a new workout in your Hevy account. Requires title, start/end times, and at least one exercise with sets. Returns the complete workout details upon successful creation including the newly assigned workout ID.",
		{
			title: z.string().min(1),
			description: z.string().optional().nullable(),
			startTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
			endTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
			isPrivate: z.boolean().default(false),
			exercises: z.array(
				z.object({
					exerciseTemplateId: z.string().min(1),
					supersetId: z.coerce.number().nullable().optional(),
					notes: z.string().optional().nullable(),
					sets: z.array(
						z.object({
							type: z
								.enum(["warmup", "normal", "failure", "dropset"])
								.default("normal"),
							weightKg: z.coerce.number().optional().nullable(),
							reps: z.coerce.number().int().optional().nullable(),
							distanceMeters: z.coerce.number().int().optional().nullable(),
							durationSeconds: z.coerce.number().int().optional().nullable(),
							rpe: z.coerce.number().optional().nullable(),
							customMetric: z.coerce.number().optional().nullable(),
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
					isError: true,
				};
			}
		},
	);

	// Update workout
	server.tool(
		"update-workout",
		"Update an existing workout by ID. You can modify the title, description, start/end times, privacy setting, and exercise data. Returns the updated workout with all changes applied.",
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
					supersetId: z.coerce.number().nullable().optional(),
					notes: z.string().optional().nullable(),
					sets: z.array(
						z.object({
							type: z
								.enum(["warmup", "normal", "failure", "dropset"])
								.default("normal"),
							weightKg: z.coerce.number().optional().nullable(),
							reps: z.coerce.number().int().optional().nullable(),
							distanceMeters: z.coerce.number().int().optional().nullable(),
							durationSeconds: z.coerce.number().int().optional().nullable(),
							rpe: z.coerce.number().optional().nullable(),
							customMetric: z.coerce.number().optional().nullable(),
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
					isError: true,
				};
			}
		},
	);
}
