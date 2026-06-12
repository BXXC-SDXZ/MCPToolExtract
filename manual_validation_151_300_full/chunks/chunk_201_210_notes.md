# chunk_201_210 notes

Reviewed full clones under `/Users/syt/Documents/CodexForMe/MCP可选项研究/tool_extract_github_payload/full_repos_151_300` for repo IDs 201-210. Candidate hints were used only as navigation; tool records below are based on source registrations/handlers.

## Summary
- Repos reviewed: 10
- Repos with tools: 9
- Repos without source-confirmed MCP tools: 203
- Total tools recorded: 77

## Per-repo notes
- 201 OctagonAI__octagon-mcp-server: reviewed; tools=4. Confirmed real TypeScript MCP server tool registrations via local registerTool wrappers called from src/tools/index.ts; README/examples ignored.
- 202 Ohanvi__spring-ai-mcp-server: reviewed; tools=1. Confirmed Spring AI MCP tool exposed through ToolCallbackProvider(MethodToolCallbackProvider.toolObjects) and @Tool method.
- 203 openpandacodes__intent-mcp-server: reviewed_no_tools; tools=0. Source is an Express REST service using a ModelContextProtocol client/object; no MCP server tools/list, tools/call, server.tool, @Tool, or equivalent registration found outside dependencies.
- 204 oraichain__ragflow-mcp: reviewed; tools=4. Confirmed FastMCP SSE server with four @mcp.tool decorated functions in main.py.
- 205 oraios__serena: reviewed; tools=51. Confirmed dynamic FastMCP registration: server_lifespan calls _set_mcp_tools, converting Serena Tool classes into MCPTool entries. The exact exposed set depends on config/context/modes, so all concrete source Tool classes with apply() are recorded; tests and hooks ignored.
- 206 OTA-EITA__mysql_mcp_servers: reviewed; tools=1. Confirmed low-level Python MCP Server with @app.list_tools/@app.call_tool; one Tool definition is returned from get_tool_definitions and dispatched by call_tool.
- 207 pab1it0__polymarket-mcp: reviewed; tools=8. Confirmed FastMCP server with eight @mcp.tool decorated functions; @mcp.resource entries are not counted.
- 208 paschmaria__redshift-js-mcp-server: reviewed; tools=3. Confirmed low-level TypeScript MCP Server with ListToolsRequestSchema and CallToolRequestSchema handlers defining three tools.
- 209 pedro2s__mcp-server-demo-py: reviewed; tools=1. Demo repo has a real FastMCP server registration, so the decorated tool is recorded.
- 210 peppemas__mcp_server: reviewed; tools=4. Confirmed custom C++ MCP server overrides tools/list and tools/call, loading PLUGIN_TYPE_TOOLS plugins. Prompt/resource plugins are not counted.

## Important judgment calls
- 203 was treated as no tools: it is an Express REST application using a ModelContextProtocol client/object, with no source-confirmed MCP server tool registration.
- 205 uses dynamic Serena Tool-to-MCP conversion rather than decorators. I recorded concrete source Tool classes with apply() because they are the true handler surface used by SerenaMCPFactory; the runtime exposed set is config/context/mode dependent.
- 207 resources declared with @mcp.resource were excluded.
- 210 prompt/resource plugins were excluded; only PLUGIN_TYPE_TOOLS plugin methods exposed through tools/list/tools/call were recorded.
