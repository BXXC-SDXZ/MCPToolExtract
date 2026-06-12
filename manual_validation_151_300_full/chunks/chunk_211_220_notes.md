# chunk_211_220 manual validation notes
Scope: full source clones under `tool_extract_github_payload/full_repos_151_300`, repo IDs 211-220. Candidate hints were used only for navigation; extracted tools are from located MCP server registration/handler source, not README/client/UI/catalog/template-only code.

## Summary
- Repos reviewed: 10
- Repos with source-confirmed MCP tools: 8 (`213`, `214`, `215`, `216`, `217`, `218`, `219`, `220`)
- Total tool records: 56
- Empty tool arrays: 2 (`211`, `212`)

## Repo notes
- `211 petercort__act-mcp-server`: working tree has README/license only; no server source or tool registration.
- `212 phoityne__pty-mcp-server`: Haskell entry point references external/local PMS packages; no concrete tool definitions in this clone.
- `213 pierrebrunelle__mcp-server-openai`: `src/mcp_server_openai/server.py` uses `@server.list_tools()` and `@server.call_tool()`; recorded `ask-openai`.
- `214 portel-dev__ncp`: `src/server/mcp-server.ts` registers SDK request handlers and defines NCP core tools. `find` is always exposed; `run` and `code` are mode-dependent but both have concrete definitions and call-handler branches. Test/mock MCP servers ignored.
- `215 PortgasXDXMajd__mcp-servers`: two FastMCP demo servers, calculator and local filesystem helpers; recorded all `@mcp.tool()` handlers.
- `216 portone-io__mcp-server`: `src/index.ts` registers 13 `src/tools/*.ts` exports via `mcp.registerTool`; Zod schemas kept as source refs/raw.
- `217 Prashanth684__skopeo-mcp-server`: Go mcp-go server adds four Skopeo tools from `pkg/mcp/skopeo.go`.
- `218 Pratyay__mac-monitor-mcp`: `src/mac_monitor/monitor.py` FastMCP server registers three macOS monitoring tools.
- `219 prithvidbox__darwinbox-mcp`: `src/index.ts` tools/list exposes eight tools and tools/call dispatches them. Extra call-handler branches not listed in tools/list were not extracted.
- `220 projectsaturnstudios__laravel-vibes`: Laravel/Superconductor server registers 15 tools in `routes/tools.php`, lists them in `VibesServer::$tools`, and implements handler classes with `#[ToolCall]` attributes.
