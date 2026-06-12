# chunk_191_200 manual validation notes
Scope: full source clones under `tool_extract_github_payload/full_repos_151_300`, repo IDs 191-200. `rg`/small scripts were used only for navigation and line-number checks; extracted tools are from located MCP registration/handler source, not README lists or hosted catalogs.
## Summary
- Repos reviewed: 10
- Repos with source-confirmed MCP tools: 5 (`192`, `194`, `196`, `199`, `200`)
- Total tool records: 54
- Empty tool arrays: 5 (`191`, `193`, `195`, `197`, `198`)

## Repo notes
- `191 nanbingxyz__mcpsvr`: Next.js catalog UI; `app/page.tsx` reads `public/servers.json`, no local MCP tool server.
- `192 nandishnagaraj__zephyr-mcp-server`: `zephyr/zephyr.py:35` has `@mcp.tool()` for `get_test_cases`; handler calls Zephyr Scale API.
- `193 naotama2002__mcp-remote-go`: Go MCP remote proxy; forwards stdio to remote MCP transports. Test mock tool strings ignored.
- `194 neondatabase-labs__mcp-server-neon`: full clone contains real server in `landing/mcp-src`. `server/index.ts:95-108` loops over `availableTools` and calls `server.tool(...)`; tools defined in `tools/definitions.ts`; handlers in `tools/tools.ts` `NEON_HANDLERS`. Recorded 31 tools with Zod schema refs rather than expanding uncertain Zod shapes.
- `195 nicodishanthj__icici-direct-mcp-server`: README only; no source registration.
- `196 Nightfallsh4__evm-mcp`: `src/index.ts` registers `get-eth-balance` and `send-eth` with `server.tool(...)`.
- `197 nihal1294__openapi-to-mcp`: generator/template project. `openapi_to_mcp/templates/src/server.ts.j2` contains MCP template code, but there is no concrete generated tool surface in this repo to extract.
- `198 nkapila6__mcp-meme-sticky`: clone has only `.git` metadata/shallow lock; no working tree source.
- `199 Nolas-Shadow__agent1st-ads-mcp`: `src/index.ts:202` defines `TOOLS`; `src/index.ts:659` serves them via `ListToolsRequestSchema`; `src/index.ts:660` dispatches to `handleTool` switch. Recorded 15 tools.
- `200 nowucca__quack-mcp-server`: `quack/server.py` FastMCP factory registers five `@mcp.tool()` functions; `quack.py:36` creates the server and runs stdio/SSE.
