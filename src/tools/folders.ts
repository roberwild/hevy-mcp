import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { HevyClient } from "../generated/client/hevyClient.js";
import type { RoutineFolder } from "../generated/client/models/index.js";

/**
 * Register all routine folder-related tools with the MCP server
 */
export function registerFolderTools(server: McpServer, hevyClient: HevyClient) {
	// Get routine folders
	server.tool(
		"get-routine-folders",
		{
			page: z.number().int().gte(1).default(1),
			pageSize: z.number().int().gte(1).lte(10).default(5),
		},
		async ({ page, pageSize }) => {
			try {
				const data = await hevyClient.v1.routine_folders.get({
					queryParameters: {
						page,
						pageSize,
					},
				});

				// Process routine folders to extract relevant information
				const folders =
					data?.routineFolders?.map((folder) => formatRoutineFolder(folder)) ||
					[];

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(folders, null, 2),
						},
					],
				};
			} catch (error) {
				console.error("Error fetching routine folders:", error);
				return {
					content: [
						{
							type: "text",
							text: `Error fetching routine folders: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
				};
			}
		},
	);

	// Get single routine folder by ID
	server.tool(
		"get-routine-folder",
		{
			folderId: z.number().int(),
		},
		async ({ folderId }) => {
			try {
				const data = await hevyClient.v1.routine_folders
					.byFolderId(folderId.toString())
					.get();

				if (!data) {
					return {
						content: [
							{
								type: "text",
								text: `Routine folder with ID ${folderId} not found`,
							},
						],
					};
				}

				const folder = formatRoutineFolder(data);

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(folder, null, 2),
						},
					],
				};
			} catch (error) {
				console.error(`Error fetching routine folder ${folderId}:`, error);
				return {
					content: [
						{
							type: "text",
							text: `Error fetching routine folder: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
				};
			}
		},
	);

	// Create new routine folder
	server.tool(
		"create-routine-folder",
		{
			title: z.string().min(1),
		},
		async ({ title }) => {
			try {
				const data = await hevyClient.v1.routine_folders.post({
					routineFolder: {
						title,
					},
				});

				if (!data) {
					return {
						content: [
							{
								type: "text",
								text: "Failed to create routine folder",
							},
						],
					};
				}

				const folder = formatRoutineFolder(data);

				return {
					content: [
						{
							type: "text",
							text: `Routine folder created successfully:\n${JSON.stringify(folder, null, 2)}`,
						},
					],
				};
			} catch (error) {
				console.error("Error creating routine folder:", error);
				return {
					content: [
						{
							type: "text",
							text: `Error creating routine folder: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
				};
			}
		},
	);
}

/**
 * Format a routine folder object for consistent presentation
 */
function formatRoutineFolder(folder: RoutineFolder): Record<string, unknown> {
	return {
		id: folder.id,
		title: folder.title,
		index: folder.index,
		createdAt: folder.createdAt,
		updatedAt: folder.updatedAt,
	};
}
