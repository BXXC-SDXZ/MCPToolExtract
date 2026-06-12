// import dotenv from 'dotenv'; // Removed redundant dotenv loading
// dotenv.config(); 

import { MCPTool } from "mcp-framework";
// Removed z import as schema is removed
// import { z } from "zod";

// Removed unused input interface
// interface GetSystemsInput {
//   message: string;
// }

// Extend MCPTool<{}> to represent no inputs
class GetSystemsTool extends MCPTool<{}> {
  name = "get-systems";
  // Updated description
  description = "Fetches a list of systems from the team-evolve API";

  // Add an empty schema to satisfy the base class requirement
  schema = {};

  // Removed input parameter from execute method
  async execute() {
    // Read API base URL from environment variable, default to localhost:3000
    const apiBaseUrl = process.env.LOCAL_API_BASE_URL || "http://localhost:3000";
    const apiUrl = `${apiBaseUrl}/api/mcp/systems`;

    // Read the API token from environment variables
    const authToken = process.env.LOCAL_API_TOKEN;

    if (!authToken) {
      console.error("Error: LOCAL_API_TOKEN environment variable is not set.");
      throw new Error("Authentication token is missing. Please set LOCAL_API_TOKEN.");
    }

    console.log(`Fetching systems from: ${apiUrl} with authentication`);
    try {
      // Remove type assertion and log the raw response
      const response = await this.fetch(apiUrl, {
        headers: {
          // Add the Authorization header with the Bearer token
          'Authorization': `Bearer ${authToken}`,
          // Ensure we accept JSON responses
          'Accept': 'application/json'
        }
      }); // No 'as Response'

      console.log("Raw response from this.fetch:", response);

      // Assuming this.fetch throws on HTTP error or returns parsed data directly
      // We remove the 'if (!response.ok)' block
      
      // Let's assume 'response' now holds the parsed data if successful
      const systems = response; 

      console.log("Successfully fetched systems (assuming direct return):", systems);
      // Return the result wrapped in the standard MCP content structure
      return {
        content: [{ type: 'text', text: JSON.stringify(systems, null, 2) }]
      };

    } catch (error: any) {
      // Log the full error for better debugging
      console.error("Error caught in GetSystemsTool execute:", error);
      // Try to create a more informative error message
      let errorMessage = error instanceof Error ? error.message : String(error);
      if (error?.response?.status) { // Check if error object has response status
         errorMessage += ` (Status: ${error.response.status})`;
      }
      throw new Error(`Failed to execute get-systems tool: ${errorMessage}`);
    }
  }
}

export default GetSystemsTool;