# Server Developers Guide

This guide is for developers who want to extend or customize MCP servers built with this template.

## Getting Started

### Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/mcp-server-template.git my-mcp-server

# Navigate to the project directory
cd my-mcp-server

# Install dependencies
npm install

# Copy the example environment file
cp .env.example .env

# Build the project
npm run build

# Run the server
npm start
```

## Project Structure

```
mcp-server-template/
├── src/
│   ├── index.ts           # Main server implementation
│   ├── tools/             # Tool implementations
│   │   └── example-tool.ts
│   ├── resources/         # Resource implementations
│   │   └── example-resource.ts
│   └── utils/             # Helper utilities
│       ├── config.ts      # Configuration management
│       └── error-handling.ts
├── tests/                 # Test files
│   └── example-tool.test.ts
└── docs/                  # Documentation
    ├── client-developers.md
    └── server-developers.md
```

## Configuration

The server uses environment variables for configuration. You can set these in a `.env` file or directly in your environment.

### Basic Configuration

```
# Server Information
SERVER_NAME=mcp-server-template
SERVER_VERSION=1.0.0

# Feature Flags
ENABLE_RESOURCES=true
ENABLE_TOOLS=true
ENABLE_PROMPTS=false

# Logging
LOG_LEVEL=info
```

### Custom Configuration

You can add your own configuration variables in the `config.ts` file:

```typescript
// src/utils/config.ts
const ConfigSchema = z.object({
  // ... existing configuration
  
  // Add your custom configuration
  MY_API_KEY: z.string().optional(),
  MY_API_URL: z.string().default('https://api.example.com'),
});
```

## Adding New Tools

To add a new tool, create a new file in the `src/tools` directory:

```typescript
// src/tools/my-tool.ts
import { createToolError } from "../utils/error-handling.js";

export const myTool = {
  // Tool definition
  definition: {
    name: "my-tool",
    description: "Description of my tool",
    inputSchema: {
      type: "object",
      properties: {
        param1: {
          type: "string",
          description: "First parameter",
        },
        param2: {
          type: "number",
          description: "Second parameter",
        },
      },
      required: ["param1"],
    },
  },

  // Tool handler
  handler: (args: any) => {
    const { param1, param2 = 0 } = args;
    
    // Validate input
    if (typeof param1 !== "string") {
      return createToolError("param1 must be a string");
    }
    
    // Implement tool logic
    const result = `Processed ${param1} with value ${param2}`;
    
    // Return result
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  },
};
```

Then register the tool in `src/index.ts`:

```typescript
// Import your tool
import { myTool } from "./tools/my-tool.js";

// In the ListToolsRequestSchema handler
this.server.setRequestHandler(ListToolsRequestSchema, async () => {
  try {
    return {
      tools: [
        exampleTool.definition,
        myTool.definition, // Add your tool here
      ],
    };
  } catch (error) {
    return handleError(error, "Failed to list tools");
  }
});

// In the CallToolRequestSchema handler
this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    // Handle example tool
    if (name === exampleTool.definition.name) {
      return exampleTool.handler(args);
    }
    
    // Handle your tool
    if (name === myTool.definition.name) {
      return myTool.handler(args);
    }

    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${name}`
    );
  } catch (error) {
    return handleError(error, "Failed to execute tool");
  }
});
```

## Adding New Resources

To add a new resource, create a new file in the `src/resources` directory:

```typescript
// src/resources/my-resource.ts
export const myResource = {
  // Resource definition
  resource: {
    uri: "my-resource://data",
    name: "My Resource",
    description: "Description of my resource",
    mimeType: "application/json",
  },

  // Resource handler
  handler: () => {
    // Implement resource logic
    const content = {
      name: "My Resource",
      data: [1, 2, 3, 4, 5],
      timestamp: new Date().toISOString(),
    };

    // Return resource content
    return {
      contents: [
        {
          uri: "my-resource://data",
          mimeType: "application/json",
          text: JSON.stringify(content, null, 2),
        },
      ],
    };
  },
};
```

Then register the resource in `src/index.ts`:

```typescript
// Import your resource
import { myResource } from "./resources/my-resource.js";

// In the ListResourcesRequestSchema handler
this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
  try {
    return {
      resources: [
        exampleResource.resource,
        myResource.resource, // Add your resource here
      ],
    };
  } catch (error) {
    return handleError(error, "Failed to list resources");
  }
});

// In the ReadResourceRequestSchema handler
this.server.setRequestHandler(
  ReadResourceRequestSchema,
  async (request) => {
    try {
      const uri = request.params.uri;
      
      // Handle example resource
      if (uri === exampleResource.resource.uri) {
        return exampleResource.handler();
      }
      
      // Handle your resource
      if (uri === myResource.resource.uri) {
        return myResource.handler();
      }
      
      // ... rest of the handler
    } catch (error) {
      return handleError(error, "Failed to read resource");
    }
  }
);
```

## Error Handling

The template includes utilities for consistent error handling:

```typescript
import { handleError, createToolError } from "../utils/error-handling.js";

// For protocol-level errors
try {
  // Operation that might fail
} catch (error) {
  return handleError(error, "Failed to perform operation");
}

// For tool-specific errors
if (invalidInput) {
  return createToolError("Invalid input: ...");
}
```

## Testing

The template uses Jest for testing. To add tests for your tools and resources:

```typescript
// tests/my-tool.test.ts
import { myTool } from '../src/tools/my-tool.js';

describe('My Tool', () => {
  test('should process valid input correctly', () => {
    const result = myTool.handler({
      param1: 'test',
      param2: 42,
    });
    
    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toContain('Processed test with value 42');
  });

  test('should return error for invalid input', () => {
    const result = myTool.handler({
      param1: 123, // Should be a string
      param2: 42,
    });
    
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toContain('must be a string');
  });
});
```

Run tests with:

```bash
npm test
```

## Deployment

### As a Local Process

MCP servers can be run as local processes and connected to clients using stdio:

```bash
# Build the server
npm run build

# Run the server
node build/index.js
```

### As an HTTP Server

To deploy as an HTTP server with SSE transport, you'll need to add an HTTP server implementation:

```typescript
// src/http-server.ts
import express from 'express';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { config } from "./utils/config.js";

const app = express();
const port = process.env.PORT || 3000;

// Create MCP server
const server = new Server(
  {
    name: config.SERVER_NAME,
    version: config.SERVER_VERSION,
  },
  {
    capabilities: {
      resources: config.ENABLE_RESOURCES,
      tools: config.ENABLE_TOOLS,
      prompts: config.ENABLE_PROMPTS,
    },
  }
);

// Set up SSE transport
let transport: SSEServerTransport | null = null;

app.get("/sse", (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  server.connect(transport);
});

app.post("/messages", (req, res) => {
  if (transport) {
    transport.handlePostMessage(req, res);
  }
});

// Start HTTP server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
```

## Best Practices

Follow these best practices when developing MCP servers:

1. **Modular Design**: Keep tools and resources in separate files
2. **Error Handling**: Use the provided error handling utilities
3. **Validation**: Validate all inputs
4. **Testing**: Write tests for all tools and resources
5. **Documentation**: Document your tools and resources
6. **Configuration**: Use environment variables for configuration
7. **Security**: Sanitize inputs and validate URIs
8. **Logging**: Use structured logging
9. **Performance**: Implement caching for expensive operations
10. **Cleanup**: Properly clean up resources

For more detailed guidelines, see the [DEVELOPMENT_RULES.md](../DEVELOPMENT_RULES.md) file.
