/**
 * Centralized error handling utility for MCP tools
 */

import type { McpToolResponse } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Standard error response interface
 */
export interface ErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Create a standardized error response for MCP tools
 * 
 * @param error - The error object or message
 * @param context - Optional context information about where the error occurred
 * @returns A formatted MCP tool response with error information
 */
export function createErrorResponse(
  error: unknown,
  context?: string
): McpToolResponse {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode = error instanceof Error && "code" in error 
    ? (error as any).code 
    : undefined;
  
  const contextPrefix = context ? `[${context}] ` : "";
  const formattedMessage = `${contextPrefix}Error: ${errorMessage}`;
  
  // Log the error for server-side debugging
  console.error(formattedMessage, error);
  
  return {
    content: [
      {
        type: "text",
        text: formattedMessage,
      },
    ],
    isError: true,
  };
}

/**
 * Wrap an async function with standardized error handling
 * 
 * @param fn - The async function to wrap
 * @param context - Context information for error messages
 * @returns A function that catches errors and returns standardized error responses
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<McpToolResponse>>(
  fn: T,
  context: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      return createErrorResponse(error, context);
    }
  }) as T;
}
