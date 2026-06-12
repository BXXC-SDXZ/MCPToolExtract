import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface GetSystemArchitectureByNameInput {
  systemName: string;
}

class GetSystemArchitectureByNameTool extends MCPTool<GetSystemArchitectureByNameInput> {
  name = "get_system_architecture_by_name";
  description = "Gets architecture information (high-level, application, deployment) for a specific system by its name.";

  schema = {
    systemName: {
      type: z.string(),
      description: "The name of the system to query (e.g., QARE, RBS)",
    },
  };

  async execute({ systemName }: GetSystemArchitectureByNameInput) {
    const apiBaseUrl = process.env.LOCAL_API_BASE_URL || "http://localhost:3000";
    const apiUrl = new URL(`${apiBaseUrl}/api/mcp/systems/architecture`);
    apiUrl.searchParams.append('name', systemName);

    const authToken = process.env.LOCAL_API_TOKEN;

    if (!authToken) {
      console.error("Error: LOCAL_API_TOKEN environment variable is not set.");
      throw new Error("Authentication token is missing. Please set LOCAL_API_TOKEN.");
    }

    console.log(`Fetching architecture info for system: ${systemName} from ${apiUrl.toString()} with authentication`);
    try {
      const response = await this.fetch(apiUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });

      console.log(`Raw response from fetch for ${systemName} architecture:`, response);

      const architectureInfo = response as any;

      if (!architectureInfo || (typeof architectureInfo !== 'object') || Object.keys(architectureInfo).length === 0) {
         console.error(`Unexpected or empty architecture data format received for system ${systemName}:`, response);
         throw new Error(`Unexpected or empty architecture data format received from API for system ${systemName}.`);
      }
      
      if (!architectureInfo.highLevel && !architectureInfo.microservice && !architectureInfo.deployment) {
          console.warn(`Architecture info for system ${systemName} might be incomplete or missing expected fields:`, architectureInfo);
      }

      console.log(`Successfully fetched architecture info for ${systemName}:`, architectureInfo);
      return {
        content: [{ type: 'text', text: JSON.stringify(architectureInfo, null, 2) }]
      };

    } catch (error: any) {
      console.error(`Error caught in GetSystemArchitectureByNameTool execute for ${systemName}:`, error);
      let errorMessage = error instanceof Error ? error.message : String(error);
      const status = error?.response?.status || error?.status;
      if (status) {
         errorMessage += ` (Status: ${status})`;
      }
      if (status === 404 || errorMessage.includes("404")) {
         errorMessage = `System named '${systemName}' not found or has no architecture info.`;
      } else if (status === 401 || errorMessage.includes("401")) {
         errorMessage = `Authentication failed when fetching architecture for system '${systemName}'. Check token.`;
      } else if (status === 400 || errorMessage.includes("400")) {
         errorMessage = `Bad request when fetching architecture for system '${systemName}'. Check 'name' parameter.`;
      }
      throw new Error(`Failed to execute get_system_architecture_by_name tool: ${errorMessage}`);
    }
  }
}

export default GetSystemArchitectureByNameTool;