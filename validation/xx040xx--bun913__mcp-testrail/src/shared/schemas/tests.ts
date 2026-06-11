import { z } from "zod";

// Schema for retrieving all tests in a run
export const getTestsSchema = z.object({
	runId: z.number().describe("TestRail Run ID"),
	offset: z.number().optional().describe("The offset to start returning tests"),
	limit: z
		.number()
		.optional()
		.describe("The number of tests to return per page"),
});

// Schema for retrieving a specific test
export const getTestSchema = z.object({
	testId: z.number().describe("TestRail Test ID"),
});

// Create Zod objects from each schema
export const getTestsInputSchema = getTestsSchema;
export const getTestInputSchema = getTestSchema;

// Extract input types
export type GetTestsInput = z.infer<typeof getTestsInputSchema>;
export type GetTestInput = z.infer<typeof getTestInputSchema>;

// -----------------------------------------------
// Response schema definitions migrated from types.ts
// -----------------------------------------------

/**
 * TestRail API Response for Suite
 */
export const TestRailTestSchema = z.object({
	assignedto_id: z
		.number()
		.describe("The ID of the user the test is assigned to"),
	case_id: z.number().describe("The ID of the related test case"),
	estimate: z
		.string()
		.describe("The estimate of the related test case, e.g. '30s' or '1m 45s'"),
	estimate_forecast: z
		.string()
		.describe(
			"The estimated forecast of the related test case, e.g. '30s' or '1m 45s'",
		),
	id: z.number().describe("The unique ID of the test"),
	milestone_id: z
		.number()
		.describe("The ID of the milestone that is linked to the test case"),
	priority_id: z
		.number()
		.describe("The ID of the priority that is linked to the test case"),
	refs: z
		.string()
		.describe(
			"A comma-separated list of references/requirements that are linked to the test case",
		),
	run_id: z.number().describe("The ID of the test run the test belongs to"),
	status_id: z.number().describe("The ID of the current status of the test"),
	title: z.string().describe("The title of the related test case"),
	type_id: z
		.number()
		.describe("The ID of the test case type that is linked to the test case"),
});
export type TestRailTest = z.infer<typeof TestRailTestSchema>;
