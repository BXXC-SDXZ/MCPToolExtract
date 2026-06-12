# chunk_291_300 manual validation notes
Scope: full source clones under `tool_extract_github_payload/full_repos_151_300`, repo IDs 291-300. Only source-located MCP server tool registrations/handlers were recorded; README/catalog/client/UI/tool-call examples, tests, resources, prompts, SDK/framework examples, and ordinary application code were not extracted as tools.

## Summary
- Repos reviewed: 10
- Repos with source-confirmed MCP tools: 7 (`291`, `292`, `293`, `294`, `295`, `296`, `297`)
- Total tool records: 467
- Empty tool arrays: 3 (`298`, `299`, `300`)

## Repo notes
- `291 yeonupark__mcp-soccer-data`: `src/server.py` defines FastMCP and one `@mcp.tool`, `get_livescores`. Tool records: 1.
- `292 yoda-digital__mcp-gitlab-server`: `src/index.ts` declares `ALL_TOOLS` and registers low-level `ListToolsRequestSchema` / `CallToolRequestSchema` handlers. Tool records: 88.
- `293 yoko19191__bocha-ai-mcp-server`: `src/index.ts` registers `bocha_web_search` with `server.tool`. Tool records: 1.
- `294 YUZongmin__sqlite-literature-management-fastmcp-mcp-server`: `sqlite_lit_server/app.py` wires admin/source/entity `register_tools` modules; 15 FastMCP-decorated functions recorded. Resources ignored. Tool records: 15.
- `295 ZebraRoy__read-docs-mcp`: `src/index.ts` contains real `server.tool` registrations, many driven by local docs config. Recorded source-level dynamic registrations/templates only; did not invent concrete final names from README or hypothetical configs. Tool records: 11.
- `296 zelentsov-dev__asc-mcp`: Swift server uses `WorkerManager.registerWorkers` to expose worker `Tool` definitions through MCP `ListTools`/`CallTool`; all `*ToolDefinitions.swift` source tools recorded. Tool records: 347.
- `297 zeplin__mcp-server`: `src/index.ts` registers four Zeplin tools with `server.tool`. Tool records: 4.
- `298 ZH1754629545__dida365-mcp-servers`: no full clone/worktree under `full_repos_151_300`; status `NO_SOURCE_AVAILABLE`. Tool records: 0.
- `299 zhangpanda__gomcp`: no full clone/worktree under `full_repos_151_300`; status `NO_SOURCE_AVAILABLE`. Tool records: 0.
- `300 zilliztech__mcp-server-milvus`: no full clone/worktree under `full_repos_151_300`; status `NO_SOURCE_AVAILABLE`. Tool records: 0.

## Counts by repo
- `291`: 1
- `292`: 88
- `293`: 1
- `294`: 15
- `295`: 11
- `296`: 347
- `297`: 4
- `298`: 0
- `299`: 0
- `300`: 0
