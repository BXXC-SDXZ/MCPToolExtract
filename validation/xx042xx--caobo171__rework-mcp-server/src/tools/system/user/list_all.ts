import { reworkAccountFetcher } from '../../../utils/api/fetcher.js';
import Responder from '../../../utils/responder.js';

/**
 * Tool definition for creating a single task
 */
import { z } from 'zod';


// Define the Zod schema for creating a task
export const listAllUsersSchema = {
	properties: z.enum(['all', 'active', 'inactive']).describe("Required properties, 'all' for all users, 'active' for active users, 'inactive' for inactive users")
};

export const listAllUsersTool = {
    name: "list_users",
    description: `
		Get users from of Rework, returns an array of users contains username, id, name. 
		Every question about user (assignee, creator, etc.) should use this tool first to get username and user id and put it into the params if needed
		If you want an user, and not found any one yet, take the closest match.
		`,
    inputSchema: listAllUsersSchema
};





/**
 * Handler for creating a task
 */
export async function listAllUsersHandler(params: any) {
    const {} = params;
    // Use the fetcher to create the task
    const data = await reworkAccountFetcher.request({
		endpoint: '/account/v1/user/all',
		data: {}
	})

    const users = (data.users || []).map((e: any) => ({
        name: e.name,
        id: e.id,
        username: e.username
    }))

    return Responder.createResponse(users);
}