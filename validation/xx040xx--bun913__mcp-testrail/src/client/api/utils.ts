import { AxiosError } from "axios";

/**
 * Handles API errors with better context
 * @param error The error object from catch
 * @param message Optional context message
 * @returns Enhanced error with better context
 */
export function handleApiError(error: unknown, message: string): Error {
	// If it's an Axios error, we can get more context
	if (error instanceof Error) {
		const axiosError = error as AxiosError;
		if (axiosError.response) {
			const status = axiosError.response.status;
			const responseData = axiosError.response.data;
			console.error(
				`${message}: ${JSON.stringify({ response: { status, data: responseData } })}`,
			);
		} else {
			console.error(`${message}: ${error}`);
		}
		return error;
	}

	// For non-Error objects, create a new Error
	return new Error(`${message}: ${String(error)}`);
}
