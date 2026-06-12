#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const DRY_URL_QA_BASE = "https://dry.ai/api/dryqa";
const DRY_URL_CREATE_BASE = "https://dry.ai/api/drycreate";
const DRY_AI_GET_TOOLS_URL = "https://dry.ai/api/gettools"; // Define the URL as a constant

const USER_AGENT = "dry-app/1.0";

// Helper function for making NWS API requests
async function makeDryRequest<RequestType, ResponseType>(url: string, data: RequestType): Promise<ResponseType | null> {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as ResponseType;
  } catch (error) {
    console.error("Error making Dry request:", error);
    return null;
  }
}

interface DryResponse {
  dryContext?: string;
  success?: boolean;
}

interface DryRequest {
  smartspace?: string;
  user?: string;
  query?: string;
  type?: string;
}

// Create server instance
const server = new McpServer({
  name: "dryai",
  version: "1.0.0",
});

async function loadToolsFromJson(authToken: string) {
  try {
    // Make the API request to fetch tools
   const response = await fetch(DRY_AI_GET_TOOLS_URL, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json",
      }
    });

    // Check if the response is successful
    if (!response.ok) {
      console.error(`Failed to fetch tools: ${response.status} ${response.statusText}`);
      return;
    }

    const dryTools = JSON.parse(JSON.stringify(await response.json()));

    if (dryTools.smartspaces && dryTools.smartspaces.length > 0) {
      dryTools.smartspaces.forEach((tool: any) => {

        server.tool(
            tool.name,
            tool.description,
            {
              query: z.string().describe(tool.schemaDescription),
            },
            async ({ query }) => {
              const dryUrl = tool.type ? DRY_URL_CREATE_BASE : DRY_URL_QA_BASE;
              const dryData: DryRequest = {
                user: dryTools.user,
                smartspace: tool.smartspace,
                query: query,
                type: tool.type
              };
              const dryResponse = await makeDryRequest<DryRequest, DryResponse>(dryUrl, dryData);

              if (!dryResponse) {
                return {
                  content: [
                    {
                      type: "text",
                      text: `Failed to get information for the query: ${query}.`
                    }
                  ]
                };
              }

              return {
                content: [
                  {
                    type: "text",
                    text: dryResponse.dryContext || `No context found for the query: ${query}.`
                  }
                ]
              };
            }
        );
      });
    }

  } catch (error) {
    console.error("Error loading tools from JSON:", error);
  }
}


// Start the server
async function main() {

  const authToken = process.env.MCP_TOKEN;
  // Get the auth token if "--auth" is present
  if (authToken) {
    await loadToolsFromJson(authToken);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Dry.AI MCP Server running on stdio");
  } else {
    console.error('Auth token not provided.');
  }


}



main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});