# Manual validation notes: repos 171-180

Scope: full source clones under `tool_extract_github_payload/full_repos_151_300`. I used `rg` only to navigate, then checked the actual registration and handler code before recording tools.

## Summary

- Repos reviewed: 10
- Repos with concrete MCP server tools recorded: 7 (`171`, `173`, `174`, `177`, `178`, `179`, `180`)
- Repos with no concrete source-level tools recorded: 3 (`172`, `175`, `176`)
- Total tools recorded: 49

## Repo notes

### 171 MABAAM/Maibaamcrawler

`src/mcp_research/server.py` creates `FastMCP("mcp-research")` and registers eight tools with `@server.tool(...)`:

- `web_search`
- `fetch_url`
- `research`
- `youtube_essence`
- `deep_ingest`
- `academic_lookup`
- `twitter_extract`
- `vault_status`

I recorded schemas from function signatures and docstrings, plus the read-only/local-read annotations.

### 172 Maf38/mcp-server

Reviewed `src/index.ts`, `src/index.js`, `src/routes/capabilities.ts`, and utility files. This repo implements an Express HTTP/SSE JSON-RPC context service with `/context`, `/capabilities`, and `/sse` routes. I did not find `tools/list`, `tools/call`, SDK `ListToolsRequestSchema`, `CallToolRequestSchema`, `server.tool`, or equivalent concrete tool registration. Recorded `tool: []`.

### 173 maoxiaoke/create-mcp-server

The outer server in `src/index.ts` uses the MCP TypeScript SDK and registers one real tool via `ListToolsRequestSchema` and `CallToolRequestSchema`: `create_mcp_server`.

Important exclusion: the file also contains a large `exampleProjectStructure` string with a template MCP server and a `create_note` tool. That is scaffold text returned by `create_mcp_server`, not a live tool registered by this repo, so it was not recorded.

### 174 marekkucak/sqlite-anet-mcp

`src/main.rs` builds an `anet_mcp_server` and registers six concrete SQLite tools with `.add_tool(...)`. Each tool implements the `Tool` trait and defines `name()`, `description()`, `input_schema()`, and `call()`:

- `read_query`
- `write_query`
- `create_table`
- `list_tables`
- `describe_table`
- `append_insight`

Schemas are literal JSON returned by each Rust `input_schema()` method.

### 175 markvp/mcp-lambda-layer

`src/lambdas/mcp/sse.ts` creates an MCP server and dynamically registers tools/resources/prompts from DynamoDB registration records. For tools, the concrete name, schema, and Lambda ARN come from `registration.name`, `registration.parameters`, and `registration.lambdaArn`. Because the repo source contains no concrete tool definitions or names, I recorded `tool: []`.

### 176 markvp/mcp-lambda-sam

Same dynamic-registration Lambda MCP implementation and conclusion as repo 175. No concrete source-level tools to record.

### 177 mattlemmone/expo-mcp

`src/index.ts` creates a FastMCP server and registers five concrete tools with `server.addTool`/`addTool`:

- `readFile`
- `writeFile`
- `listFiles`
- `tailFile`
- `listTools`

The first four delegate to `src/file.ts`; `listTools` is implemented inline in `src/index.ts`.

### 178 mbrummerstedt/powerbi-analyst-mcp

`powerbi_mcp/app.py` creates the FastMCP app and calls `register_tools(...)`. `powerbi_mcp/tools.py` registers twelve concrete tools with `@mcp.tool()`:

- `authenticate`
- `logout`
- `list_apps`
- `list_datasets`
- `get_dataset_info`
- `list_tables`
- `list_measures`
- `list_columns`
- `execute_dax`
- `read_query_result`
- `search_query_history`
- `delete_query_log_entry`

Schemas are derived from typed/Annotated Python signatures and docstrings.

### 179 mclenhard/mcp-evals

The main package is an MCP evaluation/metrics library. `src/metrics.ts` monkey-patches `McpServer.prototype.tool` for instrumentation and does not itself define concrete tools.

The `example-server/index.ts` demo is a real MCP server started over stdio and registers one concrete tool, `add`, with `server.tool("add", { a: z.number(), b: z.number() }, ...)`, so I recorded that demo tool.

### 180 MCPPhalanx/binaryninja-mcp

`src/binaryninja_mcp/server.py` defines `create_mcp_server(...)`, creates a FastMCP server, and registers sixteen concrete tools with `@mcp.tool()`. Resource handlers in the same file were not counted as tools.

Recorded tools:

- `list_filename`
- `get_triage_summary`
- `get_imports`
- `get_exports`
- `get_segments`
- `get_sections`
- `get_strings`
- `get_functions`
- `get_data_variables`
- `rename_symbol`
- `pseudo_c`
- `pseudo_rust`
- `high_level_il`
- `medium_level_il`
- `disassembly`
- `update_analysis_and_wait`
