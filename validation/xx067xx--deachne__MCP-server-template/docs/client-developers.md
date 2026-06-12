# Client Developers Guide

This guide is for developers who want to build clients that connect to MCP servers built with this template.

## Overview

MCP (Model Context Protocol) is a standardized protocol for communication between AI models and external tools or data sources. This template implements an MCP server that provides:

- **Tools**: Functions that can be executed by clients
- **Resources**: Data that can be accessed by clients
- **Prompts**: Templates for generating text

## Connecting to the Server

MCP servers built with this template support the following transport methods:

### Standard Input/Output (stdio)

For local process-based communication:

```typescript
// TypeScript example
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "./path/to/server",
  args: ["--option", "value"]
});

const client = new Client({
  name: "example-client",
  version: "1.0.0"
}, {
  capabilities: {}
});

await client.connect(transport);
```

```python
# Python example
from mcp.client import ClientSession
from mcp.client.stdio import stdio_client

params = StdioServerParameters(
    command="./path/to/server",
    args=["--option", "value"]
)

async with stdio_client(params) as streams:
    async with ClientSession(streams[0], streams[1]) as session:
        await session.initialize()
```

### Server-Sent Events (SSE)

For HTTP-based communication:

```typescript
// TypeScript example
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const transport = new SSEClientTransport(
  new URL("http://localhost:3000/sse")
);

const client = new Client({
  name: "example-client",
  version: "1.0.0"
}, {
  capabilities: {}
});

await client.connect(transport);
```

```python
# Python example
from mcp.client import ClientSession
from mcp.client.sse import sse_client

async with sse_client("http://localhost:3000/sse") as streams:
    async with ClientSession(streams[0], streams[1]) as session:
        await session.initialize()
```

## Using Tools

This template includes a calculator tool that can perform basic arithmetic operations:

```typescript
// TypeScript example
const result = await client.callTool("calculator", {
  operation: "add",
  a: 5,
  b: 3
});

console.log(result.content[0].text); // "8"
```

```python
# Python example
result = await session.call_tool("calculator", {
  "operation": "add",
  "a": 5,
  "b": 3
})

print(result.content[0].text) # "8"
```

### Available Operations

- `add`: Add two numbers
- `subtract`: Subtract the second number from the first
- `multiply`: Multiply two numbers
- `divide`: Divide the first number by the second

## Accessing Resources

This template includes an example resource that provides information about the server:

```typescript
// TypeScript example
const resources = await client.listResources();
console.log(resources); // List of available resources

const resource = await client.readResource("example://info");
console.log(JSON.parse(resource.contents[0].text));
```

```python
# Python example
resources = await session.list_resources()
print(resources) # List of available resources

resource = await session.read_resource("example://info")
print(json.loads(resource.contents[0].text))
```

## Error Handling

The server returns standardized error responses:

```typescript
// TypeScript example
try {
  const result = await client.callTool("calculator", {
    operation: "divide",
    a: 10,
    b: 0
  });
  
  if (result.isError) {
    console.error("Tool execution failed:", result.content[0].text);
  } else {
    console.log("Result:", result.content[0].text);
  }
} catch (error) {
  console.error("Request failed:", error);
}
```

```python
# Python example
try:
    result = await session.call_tool("calculator", {
        "operation": "divide",
        "a": 10,
        "b": 0
    })
    
    if result.is_error:
        print(f"Tool execution failed: {result.content[0].text}")
    else:
        print(f"Result: {result.content[0].text}")
except Exception as e:
    print(f"Request failed: {e}")
```

## Integration with LLMs

To integrate this server with an LLM like Claude:

1. Connect to the server and list available tools
2. Format the tools in a way the LLM can understand
3. Send the user's query and tool descriptions to the LLM
4. Parse the LLM's response to identify tool calls
5. Execute the tools and return results to the LLM
6. Present the final response to the user

See the [MCP documentation](https://modelcontextprotocol.io) for more details on integrating with specific LLMs.

## Best Practices

1. **Error Handling**: Always handle errors gracefully
2. **Timeouts**: Implement timeouts for tool calls
3. **Validation**: Validate inputs before sending to the server
4. **Resource Management**: Close connections when done
5. **Security**: Validate server responses
6. **Logging**: Log requests and responses for debugging
