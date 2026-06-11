import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

/**
 * Handles errors in a consistent way
 * @param error The error to handle
 * @param defaultMessage Default message to use if error doesn't have a message
 * @returns The error result
 */
export function handleError(error: unknown, defaultMessage: string): never {
  console.error(`Error: ${defaultMessage}`, error);
  
  // If it's already an MCP error, rethrow it
  if (error instanceof McpError) {
    throw error;
  }
  
  // Convert standard Error to McpError
  if (error instanceof Error) {
    throw new McpError(
      ErrorCode.InternalError,
      `${defaultMessage}: ${error.message}`
    );
  }
  
  // Handle unknown error types
  throw new McpError(
    ErrorCode.InternalError,
    `${defaultMessage}: ${String(error)}`
  );
}

/**
 * Creates a tool error result
 * @param message Error message
 * @returns Tool error result
 */
export function createToolError(message: string) {
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: message,
      },
    ],
  };
}

/**
 * Safely parses JSON with error handling
 * @param json JSON string to parse
 * @param defaultValue Default value to return if parsing fails
 * @returns Parsed JSON or default value
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return defaultValue;
  }
}
