import {
	McpServer,
	ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { TestRailClient } from "../client/api/index.js";

/**
 * Function to register resource templates
 * @param server McpServer instance
 * @param testRailClient TestRail client instance
 */
export function registerResourceTemplates(
	server: McpServer,
	testRailClient: TestRailClient,
): void {
	// Test case detail template
	server.resource(
		"testcase",
		new ResourceTemplate("testcase://{caseId}", { list: undefined }),
		async (uri, { caseId }) => {
			try {
				const numericCaseId = Number.parseInt(String(caseId), 10);
				const testCase = await testRailClient.cases.getCase(numericCaseId);

				const content =
					`# Test Case: ${testCase.title} (ID: ${testCase.id})\n\n` +
					`**Type**: ${testCase.type_id}\n` +
					`**Priority**: ${testCase.priority_id}\n` +
					`**Section**: ${testCase.section_id}\n\n` +
					`## Preconditions\n${testCase.custom_preconds || "None"}\n\n` +
					`## Steps\n${testCase.custom_steps || "None"}\n\n` +
					`## Expected Result\n${testCase.custom_expected || "None"}`;

				return {
					contents: [
						{
							uri: uri.href,
							text: content,
						},
					],
				};
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				return {
					contents: [
						{
							uri: uri.href,
							text: `Error fetching test case ${caseId}: ${errorMessage}`,
						},
					],
				};
			}
		},
	);

	// Additional resource templates (projects, sections, milestones, etc.) can be added here as needed
}
