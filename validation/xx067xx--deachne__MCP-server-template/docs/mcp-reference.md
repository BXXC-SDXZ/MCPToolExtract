# MCP Reference

This document provides a reference for the Model Context Protocol (MCP) concepts and APIs used in this template.

## Core Concepts

### Protocol Overview

MCP (Model Context Protocol) is a standardized protocol for communication between AI models and external tools or data sources. It defines:

- **Message format**: How messages are structured and exchanged
- **Capabilities**: What features are supported by clients and servers
- **Lifecycle**: How connections are established, maintained, and terminated

### Transport Layer

MCP supports multiple transport mechanisms:

- **stdio**: Standard input/output for local process-based communication
- **SSE**: Server-Sent Events for HTTP-based communication

### Capabilities

MCP servers can declare support for various capabilities:

- **Resources**: Data that can be accessed by clients
- **Tools**: Functions that can be executed by clients
- **Prompts**: Templates for generating text
- **Logging**: Structured logging messages

## API Reference

### Server Initialization

```typescript
const server = new Server(
  {
    name: string,       // Server name
    version: string,    // Server version
  },
  {
    capabilities: {     // Server capabilities
      resources?: boolean | { listChanged?: boolean },
      tools?: boolean | { listChanged?: boolean },
      prompts?: boolean | { listChanged?: boolean },
    },
  }
);
```

### Tools API

#### Tool Definition

```typescript
{
  name: string,           // Unique tool identifier
  description?: string,   // Human-readable description
  inputSchema: {          // JSON Schema for parameters
    type: "object",
    properties: {
      [key: string]: {
        type: string,     // Parameter type
        description?: string,  // Parameter description
        // Other JSON Schema properties
      }
    },
    required?: string[]   // Required parameters
  }
}
```

#### Tool Result

```typescript
{
  isError?: boolean,      // Whether the tool execution failed
  content: [              // Result content
    {
      type: "text",       // Content type
      text: string,       // Text content
    }
    // Can also include other content types like "image"
  ]
}
```

#### Registering Tools

```typescript
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Tool definitions
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  // Tool implementation
  
  return {
    content: [
      {
        type: "text",
        text: "Result",
      },
    ],
  };
});
```

### Resources API

#### Resource Definition

```typescript
{
  uri: string,            // Resource URI
  name: string,           // Human-readable name
  description?: string,   // Resource description
  mimeType?: string,      // MIME type
}
```

#### Resource Template

```typescript
{
  uriTemplate: string,    // URI template (RFC 6570)
  name: string,           // Human-readable name
  description?: string,   // Template description
  mimeType?: string,      // MIME type for all matching resources
}
```

#### Resource Content

```typescript
{
  contents: [
    {
      uri: string,        // Resource URI
      mimeType?: string,  // MIME type
      text?: string,      // Text content
      blob?: string,      // Binary content (base64 encoded)
    }
  ]
}
```

#### Registering Resources

```typescript
// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      // Resource definitions
    ],
  };
});

// List resource templates
server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
  return {
    resourceTemplates: [
      // Resource template definitions
    ],
  };
});

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  
  // Resource implementation
  
  return {
    contents: [
      {
        uri,
        mimeType: "text/plain",
        text: "Resource content",
      },
    ],
  };
});
```

### Prompts API

#### Prompt Definition

```typescript
{
  name: string,           // Unique prompt identifier
  description?: string,   // Human-readable description
  arguments?: [           // Optional arguments
    {
      name: string,       // Argument name
      description?: string, // Argument description
      required?: boolean, // Whether argument is required
    }
  ]
}
```

#### Prompt Result

```typescript
{
  description?: string,   // Optional description
  messages: [             // Messages to send to the LLM
    {
      role: "user" | "assistant", // Message role
      content: {
        type: "text",     // Content type
        text: string,     // Text content
      }
    }
  ]
}
```

#### Registering Prompts

```typescript
// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      // Prompt definitions
    ],
  };
});

// Handle prompt execution
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  // Prompt implementation
  
  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "Generated prompt",
        },
      },
    ],
  };
});
```

### Error Handling

MCP defines standard error codes:

```typescript
enum ErrorCode {
  // Standard JSON-RPC error codes
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
}
```

Throwing errors:

```typescript
throw new McpError(
  ErrorCode.InvalidRequest,
  "Invalid resource URI"
);
```

### Logging

Sending log messages:

```typescript
server.sendLoggingMessage({
  level: "info",          // Log level
  logger?: "custom",      // Optional logger name
  data: "Log message",    // Log message or data
});
```

## JSON-RPC Message Format

MCP uses JSON-RPC 2.0 for message exchange:

### Requests

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "method_name",
  "params": {
    // Method-specific parameters
  }
}
```

### Responses

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    // Method-specific result
  }
}
```

### Error Responses

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": {
      // Additional error information
    }
  }
}
```

### Notifications

```json
{
  "jsonrpc": "2.0",
  "method": "notification_name",
  "params": {
    // Notification-specific parameters
  }
}
```

## Further Reading

For more detailed information, see the official MCP documentation:

- [MCP Website](https://modelcontextprotocol.io)
- [MCP Specification](https://spec.modelcontextprotocol.io)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Python SDK](https://github.com/modelcontextprotocol/python-sdk)
