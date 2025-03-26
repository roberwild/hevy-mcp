import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { HevyClient } from "../generated/client/hevyClient.js";
import type { ExerciseTemplate } from "../generated/client/models/index.js";

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
		{
			page: z.number().int().gte(1).default(1),
			pageSize: z.number().int().gte(1).lte(100).default(20),
		},
		async ({ page, pageSize }) => {
			try {
				const data = await hevyClient.v1.exercise_templates.get({
					queryParameters: {
						page,
						pageSize,
					},
				});

				// Process exercise templates to extract relevant information
				const templates =
					data?.exerciseTemplates?.map((template) =>
						formatExerciseTemplate(template),
					) || [];

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(templates, null, 2),
						},
					],
				};
			} catch (error) {
				console.error("Error fetching exercise templates:", error);
				return {
					content: [
						{
							type: "text",
							text: `Error fetching exercise templates: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
				};
			}
		},
	);

	// Get single exercise template by ID
	server.tool(
		"get-exercise-template",
		{
			exerciseTemplateId: z.string().min(1),
		},
		async ({ exerciseTemplateId }) => {
			try {
				const data = await hevyClient.v1.exercise_templates
					.byExerciseTemplateId(exerciseTemplateId)
					.get();

				if (!data) {
					return {
						content: [
							{
								type: "text",
								text: `Exercise template with ID ${exerciseTemplateId} not found`,
							},
						],
					};
				}

				const template = formatExerciseTemplate(data);

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(template, null, 2),
						},
					],
				};
			} catch (error) {
				console.error(
					`Error fetching exercise template ${exerciseTemplateId}:`,
					error,
				);
				return {
					content: [
						{
							type: "text",
							text: `Error fetching exercise template: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
				};
			}
		},
	);
}

/**
 * Format an exercise template object for consistent presentation
 */
function formatExerciseTemplate(
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
