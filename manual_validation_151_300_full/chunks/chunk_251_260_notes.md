# chunk_251_260 notes

Reviewed full clones under `/Users/syt/Documents/CodexForMe/MCP可选项研究/tool_extract_github_payload/full_repos_151_300` for repo IDs 251-260. Candidate hints were used only as navigation; records are based on current source registrations/handlers.

## Summary
- Repos reviewed: 10
- Repos with tools: 9
- Repos without source-confirmed MCP tools: 253
- Total tools recorded: 100

## Per-repo notes
- 251 shikano35__kuhi-api-mcp-server: reviewed; tools=7. Confirmed TypeScript McpServer.registerTool registrations via registerAllTools called from createMcpServer; README/tests ignored. Candidate hints undercounted tourism.ts; full source has five tourism tools plus search and geojson.
- 252 shogo-ma__docbase-mcp-server: reviewed; tools=5. Confirmed Go mcp-go server: main.go calls s.AddTools with five ServerTool values; each tool definition is mcp.NewTool and handler is the paired handle*Request function.
- 253 shokjak__travel-deals-mcp: reviewed_no_tools; tools=0. Full clone contains only README.md and git metadata; README describes a remote MCP endpoint but no source-confirmed MCP server tool registration/handler is present.
- 254 sinco-lab__evm-mcp-server: reviewed; tools=14. Current full clone exists. Confirmed low-level TypeScript MCP Server with ListToolsRequestSchema returning getMcpToolsList() and CallToolRequestSchema dispatching handleCustomToolCall over customTools; prior failed hint ignored.
- 255 siva010928__multi-chat-mcp-server: reviewed; tools=21. Current full clone exists. Confirmed provider-loaded Google Chat FastMCP instance; src/providers/google_chat/tools/__init__.py imports tool modules, and custom @tool() decorator wraps mcp_instance.tool() plus registry registration. Commented-out tools and tests/docs ignored.
- 256 smhnkmr__realtime-crypto-mcp-server: reviewed; tools=2. Confirmed TypeScript McpServer.tool registrations in src/index.ts backed by tool objects in src/tools; README ignored.
- 257 Sohaib-2__pdf-mcp-server: reviewed; tools=22. Confirmed FastMCP server with @mcp.tool decorated functions in server.py. README tool count is not used; only source decorators recorded.
- 258 sosacrazy126__greptile-mcp: reviewed; tools=5. Confirmed package CLI imports GreptileMCPServer from src/server.ts; ListToolsRequestSchema returns five tools and CallToolRequestSchema dispatches the same names. src/index.ts and src/smithery.ts contain overlapping platform/export implementations, so they were not double-counted; resources/prompts ignored.
- 259 stefanoamorelli__codemagic-mcp: reviewed; tools=16. Confirmed Python MCP FastMCP server with @mcp.tool decorated functions in codemagic_mcp/server.py; README ignored.
- 260 stilllovee__mssql-mcp-server: reviewed; tools=8. Confirmed low-level JavaScript MCP Server: both stdio and HTTP classes return shared TOOL_DEFINITIONS via ListToolsRequestSchema and dispatch names through CallToolRequestSchema. Shared definitions recorded once; transport duplicate not double-counted.

## Important judgment calls
- 253 was kept as a repo record with no tools because the full clone contains only README/catalog-style remote endpoint information, not source for a server registration/handler.
- 254 and 255 were reviewed from current full clone source despite stale candidate hints saying failed/timeout.
- 255 custom `@tool()` was counted because it wraps `FastMCP.tool()` and provider loading imports the decorated modules; commented-out tools and tests were excluded.
- 258 has multiple overlapping server implementations. I recorded the package CLI implementation in `src/server.ts` and did not double-count equivalent `src/index.ts`/`src/smithery.ts` registrations.
- 260 shares the same tool definitions across stdio and HTTP transports, so shared tools were recorded once.
