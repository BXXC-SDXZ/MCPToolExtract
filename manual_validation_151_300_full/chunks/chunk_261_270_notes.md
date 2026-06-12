# chunk_261_270 manual validation notes
Scope: full source clones under `tool_extract_github_payload/full_repos_151_300`, repo IDs 261-270. Only source-located MCP server tool registrations/handlers were recorded; README/catalog/client/UI/framework-only code, resources, prompts, and ordinary application code were not extracted as tools.

## Summary
- Repos reviewed: 10
- Repos with source-confirmed MCP tools: 7 (`261`, `263`, `265`, `266`, `267`, `268`, `269`)
- Total tool records: 83
- Empty tool arrays: 3 (`262`, `264`, `270`)

## Repo notes
- `261 StuMason__coolify-mcp`: `src/lib/mcp-server.ts` defines `CoolifyMcpServer extends McpServer`; `registerTools()` registers 42 concrete `this.tool` handlers. Tool records: 42.
- `262 styada__local-rag-omscs`: Full clone reviewed as Python/FastAPI/local RAG app; no MCP server tool registration or low-level tools/list handler found. Tool records: 0.
- `263 stytchauth__mcp-stytch-consumer-todo-list`: `api/TodoMCP.ts` creates an `McpServer`; resource template ignored; three TODO tools recorded. Tool records: 3.
- `264 Sujith-Srinivas__test-repo-from-custom-mcp`: Clone contains only README. Tool records: 0.
- `265 swaroopkasaraneni__math-mcp-server`: `src/mcp_server_math/server.py` uses low-level Python SDK `Server`; `@server.list_tools()` returns `add` and `multiply`, with `@server.call_tool()` dispatching those names. Prompts ignored. Tool records: 2.
- `266 takayamaekawa__mcp`: `src/MyMcp.ts` uses Cloudflare `McpAgent` with `McpServer`; four `this.server.tool` handlers recorded. Tool records: 4.
- `267 tamago-labs__sui-mcp-client`: Retry/full clone is present. `src/index.ts` registers every entry from `SuiMcpTools`; 26 `McpTool` definitions under `src/mcp/**` recorded. Tool records: 26.
- `268 tavily-ai__tavily-mcp`: Retry/full clone is present. `src/index.ts` low-level `Server` returns five `Tool` literals from `ListToolsRequestSchema` and dispatches them via `CallToolRequestSchema`. Tool records: 5.
- `269 terciodejesus__products-info-mcp-server`: `src/index.ts` registers one Shopify product information tool with `server.tool`. Tool records: 1.
- `270 terraform-check-001__hello-world-test-4`: Clone contains only README. Tool records: 0.

## Counts by repo
- `261`: 42
- `262`: 0
- `263`: 3
- `264`: 0
- `265`: 2
- `266`: 4
- `267`: 26
- `268`: 5
- `269`: 1
- `270`: 0
