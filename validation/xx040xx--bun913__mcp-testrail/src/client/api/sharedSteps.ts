import { BaseTestRailClient } from "./baseClient.js";
import {
	TestRailSharedStep,
	GetSharedStepsInputType,
} from "../../shared/schemas/sharedSteps.js";
import { handleApiError } from "./utils.js";

export class SharedStepsClient extends BaseTestRailClient {
	/**
	 * Get all shared steps for a project
	 * @param projectId The ID of the project
	 * @param filters Optional filter parameters (created_after, created_before, updated_after, updated_before, created_by, limit, offset)
	 * @returns Promise with array of shared steps
	 */
	async getSharedSteps(
		projectId: GetSharedStepsInputType["projectId"],
		filters?: Record<string, string | number | boolean | null | undefined>,
	): Promise<TestRailSharedStep[]> {
		try {
			const response = await this.client.get<TestRailSharedStep[]>(
				`/api/v2/get_shared_steps/${projectId}`,
				{ params: filters },
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				`Failed to get shared steps for project ${projectId}`,
			);
		}
	}
}
