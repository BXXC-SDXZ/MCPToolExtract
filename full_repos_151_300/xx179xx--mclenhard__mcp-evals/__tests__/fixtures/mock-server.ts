#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

interface MockData {
  location: string;
  value: string;
  status: string;
}

// Mock data for different test scenarios
const mockData: Record<string, MockData> = {
  "success": { location: "Test Location", value: "Success Response", status: "ok" },
  "partial": { location: "Partial Location", value: "Incomplete Response", status: "partial" },
  "error": { location: "Error Location", value: "Error Response", status: "error" },
  "timeout": { location: "Timeout Location", value: "Timeout Response", status: "timeout" },
};

// Create server instance
const server = new Server(
  {
    name: "mock-test-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "test_tool",
        description: "A test tool for evaluation testing",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The test query to process",
            },
            scenario: {
              type: "string",
              description: "Test scenario (success, partial, error, timeout)",
              enum: ["success", "partial", "error", "timeout"],
              default: "success",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "math_tool",
        description: "A simple math tool for testing",
        inputSchema: {
          type: "object",
          properties: {
            operation: {
              type: "string",
              description: "Math operation (add, multiply)",
            },
            a: {
              type: "number",
              description: "First number",
            },
            b: {
              type: "number",
              description: "Second number",
            },
          },
          required: ["operation", "a", "b"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "test_tool": {
      const query = args?.query?.toString();
      const scenario = args?.scenario?.toString() || "success";
      
      if (!query) {
        throw new Error("Query is required");
      }

      // Simulate timeout scenario
      if (scenario === "timeout") {
        await new Promise(resolve => setTimeout(resolve, 6000)); // 6 second delay
      }

      // Simulate error scenario
      if (scenario === "error") {
        throw new Error("Simulated error for testing");
      }

      const data = mockData[scenario] || mockData["success"];
      
      return {
        content: [
          {
            type: "text",
            text: `Test tool response for query: "${query}"\nLocation: ${data.location}\nValue: ${data.value}\nStatus: ${data.status}`,
          },
        ],
      };
    }

    case "math_tool": {
      const operation = args?.operation?.toString();
      const a = Number(args?.a);
      const b = Number(args?.b);
      
      if (!operation || isNaN(a) || isNaN(b)) {
        throw new Error("Valid operation and numbers are required");
      }

      let result: number;
      switch (operation) {
        case "add":
          result = a + b;
          break;
        case "multiply":
          result = a * b;
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      return {
        content: [
          {
            type: "text",
            text: `Math result: ${a} ${operation} ${b} = ${result}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Mock Test MCP Server running on stdio");
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}

export { server, main };