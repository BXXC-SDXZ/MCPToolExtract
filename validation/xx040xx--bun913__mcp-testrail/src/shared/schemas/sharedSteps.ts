import { z } from "zod";

// Schema for shared step item
export const sharedStepItemSchema = z.object({
	content: z.string().describe("Step content"),
	expected: z.string().optional().describe("Expected result"),
	additionalInfo: z.string().optional().describe("Additional information"),
	refs: z.string().optional().describe("References"),
});

// Schema for retrieving all shared steps for a project
export const getSharedStepsSchema = {
	projectId: z.number().describe("TestRail Project ID"),
	createdAfter: z
		.number()
		.optional()
		.describe("Only return shared steps created after this timestamp"),
	createdBefore: z
		.number()
		.optional()
		.describe("Only return shared steps created before this timestamp"),
	createdBy: z
		.number()
		.optional()
		.describe("Only return shared steps created by this user ID"),
	updatedAfter: z
		.number()
		.optional()
		.describe("Only return shared steps updated after this timestamp"),
	updatedBefore: z
		.number()
		.optional()
		.describe("Only return shared steps updated before this timestamp"),
	updatedBy: z
		.number()
		.optional()
		.describe("Only return shared steps last updated by this user ID"),
	limit: z
		.number()
		.optional()
		.describe("The number of shared steps to return per page"),
	offset: z
		.number()
		.optional()
		.describe("The offset to start returning shared steps"),
};

// Create Zod objects from each schema
export const GetSharedStepsInput = z.object(getSharedStepsSchema);

// Extract input types
export type GetSharedStepsInputType = z.infer<typeof GetSharedStepsInput>;
export type SharedStepItemType = z.infer<typeof sharedStepItemSchema>;

// Response schema definitions
export const TestRailSharedStepItemSchema = z.object({
	content: z.string(),
	additional_info: z.string().nullable().optional(),
	expected: z.string().nullable().optional(),
	refs: z.string().nullable().optional(),
});
export type TestRailSharedStepItem = z.infer<
	typeof TestRailSharedStepItemSchema
>;

export const TestRailSharedStepSchema = z.object({
	id: z.number(),
	title: z.string(),
	project_id: z.number(),
	created_by: z.number(),
	created_on: z.number(),
	updated_by: z.number(),
	updated_on: z.number(),
	custom_steps_separated: z.array(TestRailSharedStepItemSchema),
	case_ids: z.array(z.number()),
});
export type TestRailSharedStep = z.infer<typeof TestRailSharedStepSchema>;
