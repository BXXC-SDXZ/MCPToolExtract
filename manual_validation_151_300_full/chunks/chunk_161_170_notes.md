# Manual validation chunk 161-170

Source root: `tool_extract_github_payload/full_repos_151_300`

Reviewed repo IDs: 161, 162, 163, 164, 165, 166, 167, 168, 169, 170.

Summary: 10 repo records, 7 repos with tools, 47 tools extracted.

## Repo notes

- 161 kumartheashwani__vault-python-mcp-server: full clone present. Hand-written Python/FastAPI JSON-RPC style server; not official SDK and uses `list_tools`/`execute` rather than standard `tools/list`/`tools/call`. A real `calculator` tool is defined in `CalculatorTool`, listed from `TOOLS`, and executed through `tool.execute(...)`; recorded with nonstandard status.
- 162 kun-g__VC-Buddy-MCP: clone failed with GitHub credential prompt; no source directory to inspect. JSON record retained with empty tools.
- 163 Kuon-dev__advanced-reason-mcp: standard TS SDK server. `ListToolsRequestSchema` returns only `GEMINI_DEEPSEEK_SEQUENTIAL_TOOL`; commented-out tools were ignored. Extracted `combined-sequential-thinking`.
- 164 kuzudb__kuzu-mcp-server: standard SDK server. Extracted `query` and `getSchema`; prompt registration `generateKuzuCypher` was deliberately not counted as a tool.
- 165 larryhudson__mcp-server-example-image-block: demo but real stdio MCP server. Extracted `get_random_image`.
- 166 Leee62__pickapicon-mcp: clone failed/incomplete directory; only partial `.git` skeleton exists and no working tree source files were available. JSON record retained with empty tools.
- 167 lithtrix__lithtrix-mcp: standard SDK server. `index.js` registers tool modules; extracted every registered `server.tool(...)` in search/register/memory/blob/parse/feedback/browse/commons modules, 18 tools total.
- 168 Loag__mcp-server-test: custom Go HTTP MCP-like server, not official JSON-RPC. `/v1/discover` returns provider tools and `/v1/call-tool` dispatches to `Provider.CallTool`; extracted filesystem list/read/write/delete.
- 169 LOFT228__Monad-MCP-Server: code is Express REST wallet API despite MCP naming. No SDK import, JSON-RPC tool list/call handler, or tool registration found; no tools extracted.
- 170 louiscklaw__hko-mcp: FastMCP TS server. `src/index.ts` invokes 20 add* functions, each registering a FastMCP tool. Used `src` as source of truth and ignored duplicate compiled `dist`. The unused named duplicate `addFlw` in `makeFlwRequest.ts` was not recorded because `src/index.ts` imports the default export.
