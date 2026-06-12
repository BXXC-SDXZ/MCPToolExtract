import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "mcp-server-sample",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool("get-tminasen-info", "get tminasen infomation", {}, () => {
  return {
    content: [
      {
        type: "text",
        text: "tminasen is web developer.",
      },
    ],
  };
});

server.tool(
  "get-tminasen-skills",
  "get tminasen's skill infomation",
  {
    genre: z.union([z.literal("FE"), z.literal("BE")]).describe("skill genre"),
  },
  ({ genre }) => {
    const skills =
      genre === "FE"
        ? ["React", "Angular", "Tailwind CSS"]
        : ["Express", "Spring Boot"];
    return {
      content: [
        {
          type: "text",
          text: `tminasen's ${genre} skills are ${skills.join(", ")}.`,
        },
      ],
    };
  }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Weather MCP Server running on stdio");
  }
  
  main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });
  