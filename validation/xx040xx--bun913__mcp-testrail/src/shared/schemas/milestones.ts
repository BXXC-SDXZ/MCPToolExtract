import { z } from "zod";

// Schema for retrieving all milestones in a project
export const getMilestonesSchema = {
	projectId: z.number().describe("TestRail Project ID"),
};

// Create Zod objects from each schema
export const GetMilestonesInput = z.object(getMilestonesSchema);

// Extract input types
export type GetMilestonesInputType = z.infer<typeof GetMilestonesInput>;

/**
 * TestRail API Response for Milestone
 */
export const TestRailMilestoneSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().optional(),
	due_on: z.number().optional(),
	start_on: z.number().optional(),
	started_on: z.number().optional(),
	completed_on: z.number().nullable().optional(),
	project_id: z.number(),
	is_completed: z.boolean(),
	is_started: z.boolean().optional(),
	parent_id: z.number().nullable().optional(),
	refs: z.string().optional(),
	url: z.string(),
});
export type TestRailMilestone = z.infer<typeof TestRailMilestoneSchema>;
