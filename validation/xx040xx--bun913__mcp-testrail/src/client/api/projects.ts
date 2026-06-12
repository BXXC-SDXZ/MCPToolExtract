import { BaseTestRailClient } from "./baseClient.js";
import {
	GetProjectInput,
	AddProjectInput,
	UpdateProjectInput,
	DeleteProjectInput,
	TestRailProject,
} from "../../shared/schemas/projects.js";
import { handleApiError } from "./utils.js";

export class ProjectsClient extends BaseTestRailClient {
	/**
	 * Get a specific project
	 */
	async getProject(
		projectId: GetProjectInput["projectId"],
	): Promise<TestRailProject> {
		try {
			const response = await this.client.get<TestRailProject>(
				`/api/v2/get_project/${projectId}`,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, `Failed to get project ${projectId}`);
		}
	}

	/**
	 * Get all projects
	 */
	async getProjects(
		params?: Record<string, string | number | boolean | null | undefined>,
	): Promise<TestRailProject[]> {
		try {
			const response = await this.client.get<TestRailProject[]>(
				"/api/v2/get_projects",
				{ params },
			);
			// For debugging
			console.error(
				"TestRail API getProjects raw response:",
				JSON.stringify(response.data),
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, "Failed to get projects");
		}
	}
}
