import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface GetSystemProductinfoByNameInput {
  systemName: string;
}

class GetSystemProductinfoByNameTool extends MCPTool<GetSystemProductinfoByNameInput> {
  name = "get_system_productinfo_by_name";
  description = "Gets product information (overview, user persona, architecture) for a specific system by its name.";

  schema = {
    systemName: {
      type: z.string(),
      description: "The name of the system (e.g., QARE, RBS)",
    },
  };

  async execute({ systemName }: GetSystemProductinfoByNameInput) {
    const apiBaseUrl = process.env.LOCAL_API_BASE_URL || "http://localhost:3000";
    const apiUrl = new URL(`${apiBaseUrl}/api/mcp/systems/product-info`);
    apiUrl.searchParams.append('name', systemName);

    const authToken = process.env.LOCAL_API_TOKEN;

    if (!authToken) {
      console.error("Error: LOCAL_API_TOKEN environment variable is not set.");
      throw new Error("Authentication token is missing. Please set LOCAL_API_TOKEN.");
    }

    console.log(`Fetching product info for system: ${systemName} from ${apiUrl.toString()} with authentication`);
    try {
      const response = await this.fetch(apiUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });

      console.log(`Raw response from fetch for ${systemName}:`, response);

      const resultData = response as any;

      const productInfo = resultData?.productInfo ?? resultData;

      if (!productInfo || (typeof productInfo !== 'object') || Object.keys(productInfo).length === 0) {
         console.error(`Unexpected or empty data format received for system ${systemName}:`, response);
         throw new Error(`Unexpected or empty data format received from API for system ${systemName}.`);
      }
      
      if (!productInfo.overview && !productInfo.userPersona && !productInfo.architecture) {
          console.warn(`Product info for system ${systemName} might be incomplete:`, productInfo);
      }

      console.log(`Successfully fetched product info for ${systemName}:`, productInfo);
      return {
        content: [{ type: 'text', text: JSON.stringify(productInfo, null, 2) }]
      };

    } catch (error: any) {
      console.error(`Error caught in GetSystemProductinfoByNameTool execute for ${systemName}:`, error);
      let errorMessage = error instanceof Error ? error.message : String(error);
      const status = error?.response?.status || error?.status;
      if (status) {
         errorMessage += ` (Status: ${status})`;
      }
      if (status === 404 || errorMessage.includes("404")) {
         errorMessage = `System named '${systemName}' not found or has no product info.`;
      } else if (status === 401 || errorMessage.includes("401")) {
         errorMessage = `Authentication failed when fetching info for system '${systemName}'. Check token.`;
      }
      throw new Error(`Failed to execute get_system_productinfo_by_name tool: ${errorMessage}`);
    }
  }
}

export default GetSystemProductinfoByNameTool;