# Claude Users Guide

This guide is for users who want to use MCP servers built with this template with Claude for Desktop.

## Overview

MCP (Model Context Protocol) allows Claude to access external tools and data sources. This template provides a standardized way to build MCP servers that can be used with Claude for Desktop.

## Setting Up Claude for Desktop

1. Download and install [Claude for Desktop](https://claude.ai/download) for your platform.
2. Make sure you have the latest version installed.

## Configuring Claude for Desktop

To use an MCP server built with this template:

1. Open Claude for Desktop.
2. Click on the Claude menu in the top menu bar.
3. Select "Settings...".
4. Click on "Developer" in the left sidebar.
5. Click on "Edit Config".

This will open the configuration file in your default text editor. Add your MCP server configuration:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": [
        "/absolute/path/to/my-mcp-server/build/index.js"
      ]
    }
  }
}
```

Replace `/absolute/path/to/my-mcp-server` with the actual path to your MCP server.

Save the file and restart Claude for Desktop.

## Using the Server with Claude

Once configured, you'll see a hammer icon <img src="https://mintlify.s3.us-west-1.amazonaws.com/mcp/images/claude-desktop-mcp-hammer-icon.svg" style="display: inline; margin: 0; height: 1.3em" /> in the bottom right corner of the input box. Clicking on it will show the available tools.

### Calculator Tool

The template includes a calculator tool that can perform basic arithmetic operations. You can ask Claude to use it with queries like:

- "What is 1234 * 5678?"
- "Can you calculate 987 divided by 3?"
- "I need to add 42 and 58, can you help?"

Claude will recognize when to use the calculator tool and will ask for your permission before executing it.

### Example Resource

The template includes an example resource that provides information about the server. You can ask Claude to access it with queries like:

- "What information do you have about this server?"
- "Can you show me the server details?"
- "What features does this MCP server support?"

## Troubleshooting

### Server Not Showing Up

If the server doesn't appear in Claude:

1. Check the configuration file for syntax errors.
2. Make sure the path to the server is correct and absolute.
3. Restart Claude for Desktop completely.
4. Check Claude's logs for errors:
   - macOS: `~/Library/Logs/Claude/mcp*.log`
   - Windows: `%APPDATA%\Claude\logs\mcp*.log`

### Tool Calls Failing

If Claude attempts to use the tools but they fail:

1. Make sure the server is properly built: `npm run build`
2. Check Claude's logs for errors
3. Try restarting Claude for Desktop

## Extending the Server

This template is designed to be extended with additional tools and resources. If you're a developer, you can add new capabilities to the server by following the [Server Developers Guide](server-developers.md).

## Security Considerations

MCP servers run with the same permissions as your user account. Only use MCP servers from trusted sources, and review the code before running them.

Claude will always ask for your permission before executing any tool, giving you control over what actions are performed.

## Best Practices

1. **Be Specific**: When asking Claude to use tools, be clear about what you want to accomplish.
2. **Review Tool Calls**: Always review the tool calls that Claude proposes before approving them.
3. **Check Results**: Verify the results of tool calls to ensure they're correct.
4. **Report Issues**: If you encounter problems, report them to the server developer.

## Example Conversations

### Using the Calculator

**You**: What's 123 + 456?

**Claude**: I can calculate that for you using the calculator tool.

[Claude requests permission to use the calculator tool with arguments: operation="add", a=123, b=456]

**You**: [Approve]

**Claude**: 123 + 456 = 579

### Accessing Server Information

**You**: What information do you have about this server?

**Claude**: I can access information about this server for you.

[Claude requests permission to access the "Example Resource"]

**You**: [Approve]

**Claude**: This server is called "MCP Server Template" and is designed as a template for building MCP servers. It's currently on version 1.0.0 and supports features like resource handling, tool execution, error handling, and configuration management.

## Further Reading

- [MCP Documentation](https://modelcontextprotocol.io)
- [Claude Documentation](https://docs.anthropic.com)
