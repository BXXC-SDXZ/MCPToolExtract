import { z } from "zod";

/**
 * Status IDs used in TestRail
 */
export const TestStatusEnum = {
	Passed: 1,
	Blocked: 2,
	Untested: 3,
	Retest: 4,
	Failed: 5,
} as const;

export const TestStatusSchema = z.nativeEnum(TestStatusEnum);
export type TestStatus = z.infer<typeof TestStatusSchema>;

/**
 * Payload schema for creating a new test run
 */
export const AddRunPayloadSchema = z.object({
	suite_id: z.number().optional(),
	name: z.string(),
	description: z.string().optional(),
	milestone_id: z.number().optional(),
	assignedto_id: z.number().optional(),
	include_all: z.boolean().optional(),
	case_ids: z.array(z.number()).optional(),
});
export type AddRunPayload = z.infer<typeof AddRunPayloadSchema>;

/**
 * Payload schema for adding a test result
 */
export const AddResultPayloadSchema = z.object({
	status_id: z.number(),
	comment: z.string().optional(),
	version: z.string().optional(),
	elapsed: z.string().optional(),
	defects: z.string().optional(),
	assignedto_id: z.number().optional(),
	custom_fields: z.record(z.unknown()).optional(),
});
export type AddResultPayload = z.infer<typeof AddResultPayloadSchema>;

/**
 * Paginated response schema
 */
export const PaginatedResponseSchema = z.object({
	offset: z.number(),
	limit: z.number(),
	size: z.number(),
	_links: z.object({
		next: z.string().optional(),
		prev: z.string().optional(),
	}),
	items: z.array(z.any()),
});
export type PaginatedResponse<T> = Omit<
	z.infer<typeof PaginatedResponseSchema>,
	"items"
> & {
	items: T[];
};
