# chunk_221_230 manual validation notes
Scope: full source clones under `tool_extract_github_payload/full_repos_151_300`, repo IDs 221-230. Candidate hints were used only for navigation; extracted tools are from located MCP server registrations/handlers in source, not README/client/UI/catalog-only surfaces.

## Summary
- Repos reviewed: 10
- Repos with source-confirmed MCP tools: 7 (`221`, `223`, `224`, `226`, `227`, `228`, `229`)
- Total tool records: 49
- Empty tool arrays: 3 (`222`, `225`, `230`)

## Repo notes
- `221 PsychArch__minimax-mcp-tools`: `src/index.ts` creates `McpServer` and calls `server.registerTool` for `submit_image_generation`, `submit_speech_generation`, and `task_barrier`; Zod schemas are imported from `src/config/schemas.ts`.
- `222 Publik-Works__civicnet-mcp-tools`: README/LICENSE only; no source MCP server tool registration.
- `223 PV-Bhat__vibe-check-mcp-server`: `src/index.ts` low-level SDK server returns five tools in `ListToolsRequestSchema` and dispatches by name in `CallToolRequestSchema`.
- `224 pvincentbrown-sys__espergrid-construction-monitor`: `server.py` has a minimal `tools/list` branch exposing `monitor_construction_project`; `tools/call` runs an external `sync.py` under the user home.
- `225 qianping-sara__mcpframework-http-server`: starts `mcp-framework` HTTP server but no concrete repo-owned tool classes/imports/registrations are present.
- `226 quazaai__UnityMCPIntegration`: `mcpServer/src/toolDefinitions.ts` registers 15 tools via low-level `ListToolsRequestSchema`; Unity tools dispatch through WebSocket handler and filesystem tools dispatch to `mcpServer/src/filesystemTools.ts`.
- `227 QuincyMillerDev__ilograph-mcp-server`: `src/ilograph_mcp/server.py` creates FastMCP server and invokes register modules containing 11 `@mcp.tool` handlers.
- `228 raw391__coin_daemon_mcp`: `src/mcpServer.ts` registers five crypto daemon tools with `server.tool`; resources/prompts were ignored.
- `229 relayshield__relayshield-mcp`: `src/relayshield_mcp/server.py` uses `@app.list_tools`/`@app.call_tool` for nine RelayShield API tools.
- `230 remoet-labs__remoet-mcp`: local server advertises `data/tools.json` and proxies calls to hosted `REMOET_MCP_URL`; treated as remote catalog/proxy, so tools not extracted.
