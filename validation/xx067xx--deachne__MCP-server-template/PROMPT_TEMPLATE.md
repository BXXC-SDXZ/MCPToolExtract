# MCP Server Development Prompt

## Context
I'm building a Model Context Protocol (MCP) server based on the template at [github.com/your-org/mcp-server-template]. I need help with [specific task or customization].

## Server Details
- **Server Purpose**: [Describe what your server will do]
- **Data Sources**: [List any APIs, databases, or other data sources]
- **Tools Needed**: [Describe the tools you want to implement]
- **Resources Needed**: [Describe the resources you want to expose]
- **Authentication**: [Describe any authentication requirements]

## Current Implementation
I've cloned the template repository which includes:
- TypeScript/Node.js implementation with ES Modules
- Standard MCP server structure
- Error handling utilities
- Testing framework

## Help Needed
Please help me with:
1. [Specific request 1]
2. [Specific request 2]
3. [Specific request 3]

## Additional Context
[Any other relevant information about your project or requirements]

## MCP Concepts Reference

### Tools
Tools are server-side functions that clients can discover and execute. Each tool has:
- A unique name
- A description
- An input schema (JSON Schema)
- An implementation that processes requests

### Resources
Resources represent data that can be accessed through URI templates. Each resource has:
- A URI or URI template
- A name
- Optional description and MIME type
- An implementation that retrieves the resource content

### Prompts
Prompts are templates for generating text. Each prompt has:
- A name
- A description
- Optional arguments
- An implementation that generates messages

### Server Capabilities
MCP servers can declare capabilities including:
- Tools support
- Resources support
- Prompts support
- Logging support

### Error Handling
MCP errors should:
- Use appropriate error codes
- Provide clear error messages
- Include relevant context
- Be properly propagated to clients
