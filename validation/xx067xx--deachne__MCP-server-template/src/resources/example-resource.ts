/**
 * Example resource implementation
 */
export const exampleResource = {
  // Resource definition that will be exposed to clients
  resource: {
    uri: "example://info",
    name: "Example Resource",
    description: "An example resource that provides information about this server",
    mimeType: "application/json",
  },

  /**
   * Resource handler implementation
   * @returns Resource content
   */
  handler: () => {
    // Create resource content
    const content = {
      name: "MCP Server Template",
      description: "A template for building MCP servers",
      version: "1.0.0",
      features: [
        "Resource handling",
        "Tool execution",
        "Error handling",
        "Configuration management",
      ],
      documentation: "https://github.com/your-org/mcp-server-template",
    };

    // Return the resource content
    return {
      contents: [
        {
          uri: "example://info",
          mimeType: "application/json",
          text: JSON.stringify(content, null, 2),
        },
      ],
    };
  },
};
