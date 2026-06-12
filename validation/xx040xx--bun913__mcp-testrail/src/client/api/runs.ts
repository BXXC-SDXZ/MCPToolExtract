import { AxiosResponse } from "axios";
import { BaseTestRailClient } from "./baseClient.js";
import { TestRailRun, TestRailTest } from "../../shared/schemas/runs.js";
import { TestRailResult } from "../../shared/schemas/results.js";
import { handleApiError } from "./utils.js";
import {
	GetRunInputType,
	GetRunsInputType,
	AddRunInputType,
	UpdateRunInputType,
} from "../../shared/schemas/runs.js";

export class RunsClient extends BaseTestRailClient {
	/**
	 * Gets a specific test run by ID
	 * @param runId The ID of the test run
	 * @returns Promise with test run details
	 */
	async getRun(runId: GetRunInputType["runId"]): Promise<TestRailRun> {
		try {
			const response: AxiosResponse<TestRailRun> = await this.client.get(
				`/api/v2/get_run/${runId}`,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, `Failed to get test run ${runId}`);
		}
	}

	/**
	 * Gets all test runs for a project
	 * @param projectId The ID of the project
	 * @param filters Optional filter parameters
	 * @returns Promise with array of test runs
	 */
	async getRuns(
		projectId: GetRunsInputType["projectId"],
		filters?: Record<string, string | number | boolean | null | undefined>,
	): Promise<TestRailRun[]> {
		try {
			const response: AxiosResponse<TestRailRun[]> = await this.client.get(
				`/api/v2/get_runs/${projectId}`,
				{ params: filters },
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				`Failed to get test runs for project ${projectId}`,
			);
		}
	}

	/**
	 * Adds a new test run to a project
	 * @param projectId The ID of the project
	 * @param data The test run data
	 * @returns Promise with created test run
	 */
	async addRun(
		projectId: AddRunInputType["projectId"],
		data: Record<string, unknown>,
	): Promise<TestRailRun> {
		try {
			const response: AxiosResponse<TestRailRun> = await this.client.post(
				`/api/v2/add_run/${projectId}`,
				data,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				`Failed to add test run to project ${projectId}`,
			);
		}
	}

	/**
	 * Updates an existing test run
	 * @param runId The ID of the test run
	 * @param data The test run data to update
	 * @returns Promise with updated test run
	 */
	async updateRun(
		runId: UpdateRunInputType["runId"],
		data: Record<string, unknown>,
	): Promise<TestRailRun> {
		try {
			const response: AxiosResponse<TestRailRun> = await this.client.post(
				`/api/v2/update_run/${runId}`,
				data,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, `Failed to update test run ${runId}`);
		}
	}

	/**
	 * Adds a result to a test
	 * @param testId The ID of the test
	 * @param data The result data
	 * @returns Promise with the created result
	 */
	async addResult(
		testId: number,
		data: Record<string, unknown>,
	): Promise<TestRailResult> {
		try {
			const response: AxiosResponse<TestRailResult> = await this.client.post(
				`/api/v2/add_result/${testId}`,
				data,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, `Failed to add result for test ${testId}`);
		}
	}
}
