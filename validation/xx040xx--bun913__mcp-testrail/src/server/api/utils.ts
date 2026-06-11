// Response type definition
export type FastMCPToolResponse = {
	type: "text";
	text: string;
};

// Function to format error messages
export function formatErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

// Function to create success response
export function createSuccessResponse(
	message: string,
	data?: Record<string, unknown>,
): FastMCPToolResponse {
	return {
		type: "text" as const,
		text: JSON.stringify(
			{
				message,
				...(data || {}),
			},
			null,
			2,
		),
	};
}

// Function to create error response
export function createErrorResponse(
	baseMessage: string,
	error: unknown,
): FastMCPToolResponse {
	const errorMessage = formatErrorMessage(error);
	return {
		type: "text" as const,
		text: JSON.stringify(
			{
				error: `${baseMessage}: ${errorMessage}`,
			},
			null,
			2,
		),
	};
}
