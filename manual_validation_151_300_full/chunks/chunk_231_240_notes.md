# chunk_231_240 manual validation notes
Scope: full source clones under `tool_extract_github_payload/full_repos_151_300`, repo IDs 231-240. Only source-located MCP server tool registrations/handlers were recorded; README/catalog/client/test-call/tool-use examples, resources, prompts, SDK/framework-only code, and ordinary UI/app code were not extracted as tools.

## Summary
- Repos reviewed: 10
- Repos with source-confirmed MCP tools: 8 (`231`, `232`, `233`, `234`, `235`, `236`, `237`, `239`)
- Total tool records: 409
- Empty tool arrays: 2 (`238`, `240`)

## Repo notes
- `231 reymerekar7__beehiiv-mcp-server`: FastMCP `beehiiv_server.py`; five Beehiiv API tools from `@mcp.tool()` at lines 51, 62, 82, 104, 137. Tool records: 5.
- `232 richardschrammcom__mcp-geocoder-rosetta`: Three concrete demo/server implementations are present and counted: `python-googlemaps/geocoder.py`, `python-urllib/geocoder.py`, and `typescript-googlemaps/geocoder.ts`; client/test caller files ignored. Tool records: 4.
- `233 Rih0z__agentdesk-mcp`: `src/index.ts` creates an `McpServer`; `registerTools(server)` registers `review_output`, `review_dual`, `list_services`, and `execute_service`. Tool records: 4.
- `234 rioriost__homebrew-age-mcp-server`: Low-level Python SDK server; `@server.list_tools()` returns six `types.Tool` literals and `@server.call_tool()` dispatches the same names. Tool records: 6.
- `235 rocnubie__nanobanana-mcp`: `src/server.mjs` registers three read-only Nano Banana lookup tools; resources and prompts ignored. Tool records: 3.
- `236 rohitg00__kubectl-mcp-server`: Retry clone is present. `KubectlMCPServer.setup_tools()` calls registration functions at `kubectl_mcp_tool/mcp_server.py:301-350`; 313 `@mcp.tool` handlers extracted from `kubectl_mcp_tool/tools/*.py`. Tool records: 313.
- `237 RomThpt__mcp-xrpl`: `mcp-server/src/server/server.ts` creates shared server; `mcp-server/src/index.ts` imports transaction modules for registration side effects. Extracted 71 `server.registerTool` handlers from transaction modules. Tool records: 71.
- `238 rt96-hub__prompt-tester`: No clone directory exists; candidate hints report failed:128. Record kept with `tool: []`. Tool records: 0.
- `239 ruliana__mcp-pkm-logseq`: FastMCP `src/mcp_pkm_logseq/server.py`; three Logseq PKM tools from `@mcp.tool()`. The resource handler is ignored. Tool records: 3.
- `240 rust-mcp-stack__rust-mcp-sdk`: Retry directory exists but only `.git` metadata/no working-tree source files; record kept with `tool: []`. Tool records: 0.

## Counts by repo
- `231`: 5
- `232`: 4
- `233`: 4
- `234`: 6
- `235`: 3
- `236`: 313
- `237`: 71
- `238`: 0
- `239`: 3
- `240`: 0
