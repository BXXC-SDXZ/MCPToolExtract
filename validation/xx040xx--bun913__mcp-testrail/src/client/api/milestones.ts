import { AxiosResponse } from "axios";
import { BaseTestRailClient } from "./baseClient.js";
import { TestRailMilestone } from "../../shared/schemas/milestones.js";
import { handleApiError } from "./utils.js";
import { GetMilestonesInputType } from "../../shared/schemas/milestones.js";

export class MilestonesClient extends BaseTestRailClient {
	/**
	 * Gets all milestones for a project
	 * @param projectId The ID of the project
	 * @param filters Optional filter parameters
	 * @returns Promise with array of milestones
	 */
	async getMilestones(
		projectId: GetMilestonesInputType["projectId"],
		filters?: Record<string, string | number | boolean | null | undefined>,
	): Promise<TestRailMilestone[]> {
		try {
			const response: AxiosResponse<TestRailMilestone[]> =
				await this.client.get(`/api/v2/get_milestones/${projectId}`, {
					params: filters,
				});
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				`Failed to get milestones for project ${projectId}`,
			);
		}
	}
}
