import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";

// Custom error classes
export class TestRailError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "TestRailError";
	}
}

export class TestRailAPIError extends TestRailError {
	constructor(
		public status: number,
		message: string,
		public data?: unknown,
	) {
		super(message);
		this.name = "TestRailAPIError";
	}
}

export class TestRailTimeoutError extends TestRailError {
	constructor(message = "Request timed out") {
		super(message);
		this.name = "TestRailTimeoutError";
	}
}

export class TestRailNetworkError extends TestRailError {
	constructor(message = "Network error occurred") {
		super(message);
		this.name = "TestRailNetworkError";
	}
}

// TestRail API client configuration interface
export interface TestRailClientConfig {
	baseURL: string;
	auth: {
		username: string;
		password: string;
	};
	timeout?: number;
	headers?: Record<string, string>;
}

/**
 * Base TestRail API client that handles configuration and common functionality
 */
export class BaseTestRailClient {
	protected client: AxiosInstance;

	constructor(config: TestRailClientConfig) {
		const headers = {
			"Content-Type": "application/json",
			...(config.headers || {}),
		};

		this.client = axios.create({
			baseURL: config.baseURL,
			headers,
			timeout: config.timeout ?? 30000,
			auth: config.auth,
		});
	}

	/**
	 * Set a custom header
	 */
	setHeader(name: string, value: string): void {
		this.client.defaults.headers.common[name] = value;
	}

	/**
	 * Wrapper for making HTTP requests with error handling
	 */
	protected async request<T>(
		method: "get" | "post" | "put" | "delete",
		url: string,
		data?: unknown,
	): Promise<T> {
		try {
			const response = await this.client.request<T>({
				method,
				url,
				data,
			});
			return response.data;
		} catch (error) {
			if (error instanceof TestRailError) {
				throw error;
			}
			if (error instanceof AxiosError) {
				if (error.code === "ECONNABORTED") {
					throw new TestRailTimeoutError();
				}
				if (!error.response) {
					throw new TestRailNetworkError();
				}
				const status = error.response.status;
				const errorData = error.response.data as { error?: string };
				const message = errorData?.error || error.message;
				const data = error.response.data;

				switch (status) {
					case 400:
						throw new TestRailAPIError(status, `Bad Request: ${message}`, data);
					case 401:
						throw new TestRailAPIError(status, "Authentication failed", data);
					case 403:
						throw new TestRailAPIError(status, "Permission denied", data);
					case 404:
						throw new TestRailAPIError(status, "Resource not found", data);
					case 429:
						throw new TestRailAPIError(status, "Rate limit exceeded", data);
					default:
						if (status >= 500) {
							throw new TestRailAPIError(status, "TestRail server error", data);
						}
						throw new TestRailAPIError(
							status,
							`Unknown error: ${message}`,
							data,
						);
				}
			}
			throw new TestRailError(
				`Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
}
