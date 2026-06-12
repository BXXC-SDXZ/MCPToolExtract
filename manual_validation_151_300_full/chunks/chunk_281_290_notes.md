# chunk_281_290 manual validation notes
Scope: full source clones under `tool_extract_github_payload/full_repos_151_300`, repo IDs 281-290. Only source-located MCP server tool registrations/handlers were recorded; README/catalog/client/test-call/tool-use examples, SDK/framework-only code, and ordinary app code were not extracted as tools.

## Summary
- Repos reviewed: 10
- Repos with source-confirmed MCP tools: 8 (`282`, `283`, `284`, `285`, `286`, `288`, `289`, `290`)
- Total tool records: 32
- Empty tool arrays: 2 (`281`, `287`)

## Repo notes
- `281 vibheksoni__stealth-browser-mcp`: Clone manifest reports `timeout`; working directory contains only partial `.git` metadata and `.git/shallow.lock`. Record kept with `tool: []`.
- `282 vinsidious__whodis-mcp-server`: TypeScript `src/tools/domain-availability.tool.ts` registers `check-domain-availability` with `server.tool(...)`; schema is in `src/tools/domain-availability.types.ts`; handler is `handleCheckDomainAvailability`. Tool records: 1.
- `283 voronkovm__openai-mcp-server`: Low-level TypeScript SDK server in `src/index.ts`; `ListToolsRequestSchema` returns one `chat` tool and `CallToolRequestSchema` dispatches the same name. Tool records: 1.
- `284 webdevtodayjason__A2AMCP`: Python low-level SDK server in `mcp-server-redis.py`; `@self.server.list_tools()` returns 17 `Tool` literals and `@self.server.call_tool()` dispatches them with `if/elif` branches. SDK/client examples and tests ignored. Tool records: 17.
- `285 weidafeng__StepFunMCP`: FastMCP `stepfun_mcp/server.py`; four StepFun API tools from `@mcp.tool(...)`, run via `mcp.run()`. Tool records: 4.
- `286 WojciechMatuszewski__mcp-server-learning`: TypeScript `server/main.ts` registers `echo`, `list-files`, and `create-file` via `server.tool(...)`; prompt ignored. Tool records: 3.
- `287 xhd730__mcpServerStudy`: Clone contains only `README.md` plus `.git` metadata; no source-located server tool registration. Record kept with `tool: []`.
- `288 xiaoshi7915__universal-db-mcp-server`: FastMCP `fast_db_server.py`; three database tools from `@fast_mcp_server.tool(...)`, run with SSE transport. Tool records: 3.
- `289 xpfyg__12306-mcp-service`: Go `main.go` creates `query_train_tickets` with `mcp.NewTool(...)` and registers `handlers.(*TicketHandler).QueryTickets` via `s.AddTool(...)`. Tool records: 1.
- `290 yash-a11y__mcp_Server`: Spring Boot/Spring AI MCP server dependency is present; `McpFeatureApplication` exposes `ToolCallbacks.from(courseService)`, and `courseService` defines two `@Tool` methods. Tool records: 2.

## Counts by repo
- `281`: 0
- `282`: 1
- `283`: 1
- `284`: 17
- `285`: 4
- `286`: 3
- `287`: 0
- `288`: 3
- `289`: 1
- `290`: 2
