# chunk_181_190 notes

Scope: full-source manual/LLM review of repo IDs 181-190 under `tool_extract_github_payload/full_repos_151_300`. `rg` and scripts were used only for navigation and line extraction; records below are based on source-locatable MCP tool registration/handler code.

## Summary

- Repos reviewed: 10
- Repos with source-locatable MCP tools: 7
- Tool records: 124
- Output JSON: `/Users/syt/Documents/CodexForMe/MCP可选项研究/tool_extract_github_payload/manual_validation_151_300_full/chunks/chunk_181_190.json`

## Repo notes

- 181 `mercurialsolo__counsel-mcp`: Confirmed TypeScript MCP server. `src/index.ts:84-90` registers all objects from `src/tools/debates.ts` and `src/tools/advisor.ts` via `server.tool(...)`. Recorded 18 tools.
- 182 `Mibayy__token-savior`: Confirmed Python MCP server. `TOOLS` is built from `TOOL_SCHEMAS` at `src/token_savior/server.py:149-150`, exposed through `list_tools` at `server.py:474-481`, and `list_tools`/`call_tool` are registered at `server.py:928-929`. Recorded 69 schema-defined tools plus conditional `ts_extended` appended for `TOKEN_SAVIOR_PROFILE=ultra` at `server.py:422-444`. Profile/env filters can hide tools at runtime.
- 183 `molavec__mcp-api-client`: Full clone has real generic MCP source: `src/index.ts:50-53` loads YAML config, `src/lib/tools-builder.ts:22-37` converts API entries to MCP tool metadata, and `src/lib/mcp.ts:35-62` handles list/call. Recorded the 7 default `public/apis.yaml` tools; arbitrary user-provided YAML can add more dynamic tools.
- 184 `MrHZ006__EmailService`: Confirmed Spring AI MCP server. `EmailServiceApplication.java:17-21` registers `EmailService` with `MethodToolCallbackProvider`; `EmailService.java:31` has one `@Tool` method `sendEmail`.
- 185 `msaelices__whatsapp-mcp-server`: Confirmed FastMCP server. `src/whatsapp_mcp/server.py` creates `FastMCP` at lines 36-40 and has 5 `@mcp.tool()` decorated functions.
- 186 `muhammadalfat__monad-mcp-server`: Not extracted. Source is ordinary Express HTTP routes (`/balance`, `/block`) despite package dependency on `@modelcontextprotocol/sdk`; no MCP Server/tool registration found.
- 187 `Munirg2003__Welcome-MCP-Server-Testing`: Not extracted. Clone contains README only, no server source.
- 188 `myownipgit__esignatures-nda-tutorial`: Not extracted. Docs/tutorial only; no local MCP server source or tool registration.
- 189 `Nadeus__toolradar-mcp`: Confirmed TypeScript MCP server with 6 direct `server.tool(...)` registrations in `src/index.ts`.
- 190 `nanahiryu__notion-mcp-server`: Confirmed low-level TypeScript MCP server. `ListToolsRequestSchema` returns 17 static Tool objects and `CallToolRequestSchema` dispatches matching switch cases.

## Boundary decisions

- README tool lists, docs mentions, tutorial snippets, ordinary REST routes, and client/test calls were not extracted.
- For complex Zod/Python/Spring-derived schemas, `inputSchema.raw` records the source location/form as `unknown/raw` or `source/raw`; fields were not invented beyond source-visible names.
- For dynamic-config repo 183, only the default config loaded by source (`public/apis.yaml`) was recorded, with note that other user configs are not statically enumerable.
