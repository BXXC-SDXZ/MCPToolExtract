# chunk_271_280 manual validation notes
Scope: full source clones under `tool_extract_github_payload/full_repos_151_300`, repo IDs 271-280. Only source-located MCP server tool registrations/handlers were recorded; README/catalog/client/test-call/tool-use examples, resources, prompts, SDK/framework-only code, and ordinary bridge/UI/app code were not extracted as tools.

## Summary
- Repos reviewed: 10
- Repos with source-confirmed MCP tools: 8 (`271`, `272`, `274`, `275`, `276`, `277`, `279`, `280`)
- Total tool records: 92
- Empty tool arrays: 2 (`273`, `278`)

## Repo notes
- `271 Tetsuya-Minase__mcp-server-sample`: TypeScript `src/index.ts` registers `get-tminasen-info` and `get-tminasen-skills` with `server.tool`. Tool records: 2.
- `272 TheDigitalNinja__mcp-fitbit`: `src/index.ts` wires Fitbit feature registration functions; extracted 13 concrete Fitbit tools from source files. Tool records: 13.
- `273 ThinkInAIXYZ__mcp-servers`: Curated/readme-style MCP server list and screenshots only; no concrete local MCP server tool registration. Tool records: 0.
- `274 thinking-bzf__mongo-mcp-go`: Go `mcp-go` server uses `app.AddTools`; extracted 10 `mcp.NewTool` registrations and paired handlers from `app/tools/*.go`. Tool records: 10.
- `275 Tiberriver256__azure-devops-mcp`: Low-level TypeScript SDK server combines feature `ToolDefinition[]` arrays in `ListToolsRequestSchema` and routes calls in `CallToolRequestSchema`; extracted 44 routed Azure DevOps tools. Tool records: 44.
- `276 tiluckdave__hound-mcp`: `src/server.ts` registers 12 Hound package-security tools from `src/tools/*.ts`; prompts ignored. Tool records: 12.
- `277 toolstem__toolstem-mcp-server`: `src/index.ts` registers three active financial tools with `server.registerTool`; disabled `screen_stocks` source ignored. Tool records: 3.
- `278 TypingMind__typingmind-mcp`: HTTP bridge/runner that creates MCP clients for external servers; no concrete server-side tool definitions in this repo. Tool records: 0.
- `279 UniFuncs__ufn-mcp-server`: `index.ts` registers seven UniFuncs API tools with `server.tool` and supports stdio/SSE. Tool records: 7.
- `280 UnitaryLabs__dryai-mcp-server`: Runtime dynamic registration from Dry.AI `gettools` response; recorded the real `server.tool` registration loop as one dynamic raw entry because concrete tool names/schemas are not statically present. Tool records: 1.

## Counts by repo
- `271`: 2
- `272`: 13
- `273`: 0
- `274`: 10
- `275`: 44
- `276`: 12
- `277`: 3
- `278`: 0
- `279`: 7
- `280`: 1
