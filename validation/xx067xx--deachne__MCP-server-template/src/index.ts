#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { config } from "./utils/config.js";
import { handleError } from "./utils/error-handling.js";
import { exampleTool } from "./tools/example-tool.js";
import { exampleResource } from "./resources/example-resource.js";

/**
 * Main MCP server class
 */
class McpServerTemplate {
  private server: Server;

  constructor() {
    // Initialize the server with name and version
    this.server = new Server(
      {
        name: config.SERVER_NAME,
        version: config.SERVER_VERSION,
      },
      {
        capabilities: {
          // Enable capabilities based on configuration
          resources: config.ENABLE_RESOURCES,
          tools: config.ENABLE_TOOLS,
          prompts: config.ENABLE_PROMPTS,
        },
      }
    );

    // Set up request handlers
    this.setupResourceHandlers();
    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    
    // Handle process termination
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Set up resource handlers
   */
  private setupResourceHandlers() {
    if (!config.ENABLE_RESOURCES) return;

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      try {
        return {
          resources: [
            exampleResource.resource
          ],
        };
      } catch (error) {
        return handleError(error, "Failed to list resources");
      }
    });

    // List resource templates
    this.server.setRequestHandler(
      ListResourceTemplatesRequestSchema,
      async () => {
        try {
          return {
            resourceTemplates: [
              {
                uriTemplate: "example://{id}",
                name: "Example Resource Template",
                description: "Template for accessing example resources by ID",
              },
            ],
          };
        } catch (error) {
          return handleError(error, "Failed to list resource templates");
        }
      }
    );

    // Read resource content
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        try {
          const uri = request.params.uri;
          
          // Handle example resource
          if (uri === exampleResource.resource.uri) {
            return exampleResource.handler();
          }
          
          // Handle resource templates
          if (uri.startsWith("example://")) {
            const id = uri.replace("example://", "");
            return {
              contents: [
                {
                  uri,
                  mimeType: "text/plain",
                  text: `Example resource content for ID: ${id}`,
                },
              ],
            };
          }

          throw new McpError(
            ErrorCode.InvalidRequest,
            `Unknown resource URI: ${uri}`
          );
        } catch (error) {
          return handleError(error, "Failed to read resource");
        }
      }
    );
  }

  /**
   * Set up tool handlers
   */
  private setupToolHandlers() {
    if (!config.ENABLE_TOOLS) return;

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      try {
        return {
          tools: [
            exampleTool.definition
          ],
        };
      } catch (error) {
        return handleError(error, "Failed to list tools");
      }
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        // Handle example tool
        if (name === exampleTool.definition.name) {
          return exampleTool.handler(args);
        }

        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
      } catch (error) {
        return handleError(error, "Failed to execute tool");
      }
    });
  }

  /**
   * Run the server
   */
  async run() {
    try {
      console.error(`Starting ${config.SERVER_NAME} v${config.SERVER_VERSION}...`);
      
      // Create transport
      const transport = new StdioServerTransport();
      
      // Connect server to transport
      await this.server.connect(transport);
      
      console.error(`${config.SERVER_NAME} running on stdio`);
      
      // Send logging message
      this.server.sendLoggingMessage({
        level: "info",
        data: `${config.SERVER_NAME} started successfully`,
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  }
}

// Create and run server
const server = new McpServerTemplate();
server.run().catch(console.error);
