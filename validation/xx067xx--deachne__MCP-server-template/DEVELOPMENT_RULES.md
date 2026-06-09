# MCP Server Development Rules

This document outlines the best practices and rules for developing MCP servers using this template. Following these guidelines will ensure your server is robust, maintainable, and compatible with the MCP ecosystem.

## Module System

### Rules
- Use ES Modules (`"type": "module"` in package.json)
- Use explicit file extensions in imports (e.g., `import { Server } from './server.js'`)
- Avoid CommonJS syntax (`require`, `module.exports`)
- Use named exports over default exports when possible

### Example
```typescript
// Good
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { makeRequest } from './utils/http.js';

// Bad
const Server = require('@modelcontextprotocol/sdk/server');
import Transport from '@modelcontextprotocol/sdk/server/stdio';
import makeRequest from './utils/http';
```

## TypeScript Best Practices

### Rules
- Use strict type checking (`"strict": true` in tsconfig.json)
- Define interfaces for all data structures
- Use type annotations for function parameters and return types
- Avoid `any` type when possible
- Use union types for variables that can have multiple types
- Use optional properties (`?`) instead of nullable types when appropriate

### Example
```typescript
// Good
interface ToolParams {
  operation: string;
  values: number[];
}

function executeOperation(params: ToolParams): number {
  // Implementation
}

// Bad
function executeOperation(params) {
  // Implementation
}
```

## Error Handling

### Rules
- Use the `McpError` class for all MCP-related errors
- Use appropriate error codes from the MCP specification
- Include descriptive error messages
- Handle errors at the appropriate level
- Log errors with relevant context
- Propagate errors to clients when appropriate

### Example
```typescript
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

try {
  // Operation that might fail
} catch (error) {
  if (error instanceof McpError) {
    // Re-throw MCP errors
    throw error;
  } else {
    // Convert other errors to MCP errors
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to execute operation: ${error.message}`
    );
  }
}
```

## Tool Implementation

### Rules
- Each tool should have a clear, single responsibility
- Use descriptive names for tools
- Provide detailed descriptions for tools and parameters
- Use JSON Schema for parameter validation
- Implement proper error handling
- Return structured results
- Document expected input and output formats

### Example
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "calculate_sum",
        description: "Add two numbers together",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number", description: "First number" },
            b: { type: "number", description: "Second number" }
          },
          required: ["a", "b"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "calculate_sum") {
    const { a, b } = request.params.arguments;
    
    // Validate input
    if (typeof a !== 'number' || typeof b !== 'number') {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: "Both parameters must be numbers"
          }
        ]
      };
    }
    
    // Execute operation
    return {
      content: [
        {
          type: "text",
          text: String(a + b)
        }
      ]
    };
  }
  
  throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
});
```

## Resource Implementation

### Rules
- Use clear, descriptive URIs
- Follow URI template specification (RFC 6570)
- Provide descriptive names and descriptions
- Set appropriate MIME types
- Implement proper error handling
- Cache resource contents when appropriate
- Validate URIs before processing

### Example
```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "file:///logs/app.log",
        name: "Application Logs",
        description: "Recent application logs",
        mimeType: "text/plain"
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  
  // Validate URI
  if (!uri.startsWith("file:///logs/")) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      `Invalid URI: ${uri}`
    );
  }
  
  try {
    const logContents = await readLogFile(uri);
    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: logContents
        }
      ]
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to read resource: ${error.message}`
    );
  }
});
```

## Testing Requirements

### Rules
- Write unit tests for all tools and resources
- Test both success and error cases
- Mock external dependencies
- Test with different input variations
- Verify error handling
- Test resource URI validation
- Include integration tests with MCP clients
- Maintain high test coverage

### Example
```typescript
// Unit test for calculate_sum tool
test('calculate_sum should add two numbers', async () => {
  const result = await callTool('calculate_sum', { a: 2, b: 3 });
  expect(result.content[0].text).toBe('5');
});

test('calculate_sum should return error for non-number inputs', async () => {
  const result = await callTool('calculate_sum', { a: 'two', b: 3 });
  expect(result.isError).toBe(true);
});
```

## Security Guidelines

### Rules
- Validate all input parameters
- Sanitize file paths to prevent directory traversal
- Implement appropriate access controls
- Use environment variables for sensitive configuration
- Never hardcode credentials
- Limit resource access to authorized paths
- Implement rate limiting for resource-intensive operations
- Log security-relevant events
- Use HTTPS for remote connections
- Validate URI schemes

### Example
```typescript
// Environment variables for configuration
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error('API_KEY environment variable is required');
}

// Path validation
function validatePath(path: string): boolean {
  const normalizedPath = path.normalize();
  const allowedPaths = ['/data', '/public'];
  
  return allowedPaths.some(allowedPath => 
    normalizedPath.startsWith(allowedPath)
  );
}

// Rate limiting
const requestCounts = new Map<string, number>();
function checkRateLimit(clientId: string): boolean {
  const count = requestCounts.get(clientId) || 0;
  if (count > 100) {
    return false;
  }
  requestCounts.set(clientId, count + 1);
  return true;
}
```

## Logging

### Rules
- Use structured logging
- Include timestamps
- Use appropriate log levels
- Include relevant context
- Don't log sensitive information
- Implement log rotation for file-based logs
- Use the MCP logging capability when available

### Example
```typescript
// Server-side logging
console.error(`[${new Date().toISOString()}] [ERROR] Failed to process request: ${error.message}`);

// MCP logging notification
server.sendLoggingMessage({
  level: "info",
  logger: "tool-executor",
  data: "Tool executed successfully"
});
```

## Configuration Management

### Rules
- Use environment variables for configuration
- Provide sensible defaults
- Validate configuration at startup
- Document all configuration options
- Use a .env file for local development
- Add .env to .gitignore
- Use a configuration schema for validation

### Example
```typescript
import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Configuration schema
const ConfigSchema = z.object({
  PORT: z.string().transform(Number).default('3000'),
  API_KEY: z.string().min(1),
  DEBUG: z.string().transform(s => s === 'true').default('false'),
  ALLOWED_ORIGINS: z.string().transform(s => s.split(',')).default('*'),
});

// Validate configuration
const config = ConfigSchema.parse(process.env);

// Use configuration
const server = new Server({
  port: config.PORT,
  debug: config.DEBUG,
  apiKey: config.API_KEY,
  allowedOrigins: config.ALLOWED_ORIGINS,
});
```

## Performance Considerations

### Rules
- Cache expensive operations
- Implement timeouts for external requests
- Use async/await for asynchronous operations
- Optimize resource usage
- Monitor memory usage
- Implement pagination for large datasets
- Use streaming for large responses
- Implement proper cleanup for resources

### Example
```typescript
// Caching
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

async function getCachedData(key: string, fetcher: () => Promise<any>): Promise<any> {
  const now = Date.now();
  const cached = cache.get(key);
  
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, { data, timestamp: now });
  return data;
}

// Timeouts
async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}
```

By following these guidelines, you'll create MCP servers that are robust, maintainable, and secure.
