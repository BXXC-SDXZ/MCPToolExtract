import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Check for API key
const PAT = process.env.GITHUB_PERSONAL_ACCESS_TOKEN!;
if (!PAT) {
  console.error(
    "Error: GITHUB_PERSONAL_ACCESS_TOKEN environment variable is required"
  );
  process.exit(1);
}

interface GraphqlRequestArgs {
  query: string;
}

// Create server instance
const server = new Server(
  {
    name: "github-cli-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "graphql_request",
        description: "Make a GraphQL request to GitHub API",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(
  CallToolRequestSchema,
  async (request: CallToolRequest) => {
    if (request.params.name === "graphql_request") {
      const args = request.params.arguments as unknown as GraphqlRequestArgs;
      const parsedQuery = args.query
        .replace(/\\"/g, '"')
        .replace(/\s+/g, " ")
        .trim();
      const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAT}`,
          "Content-Type": "application/json",
          Accept: "application/json", // GraphQLのレスポンスはJSONで受け取りたいため追加
          "User-Agent": "github-graphql-cli", // GitHubのAPIはUser-Agentヘッダーを要求
        },
        body: JSON.stringify({
          query: parsedQuery, // Escape double quotes in GraphQL query
        }),
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`);
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(await response.json()),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
  }
);
const transport = new StdioServerTransport();
await server.connect(transport);
console.log("github-cli-mcp-server running on stdio");
