#!/usr/bin/env node
/**
 * Lithtrix MCP Server
 *
 * Tools:
 *   - lithtrix_search — web search (requires LITHTRIX_API_KEY)
 *   - lithtrix_register        — new agent + one-time API key (no auth)
 *   - lithtrix_memory_set      — store/update memory (requires LITHTRIX_API_KEY)
 *   - lithtrix_memory_get      — get memory by key
 *   - lithtrix_memory_search   — semantic memory search
 *   - lithtrix_memory_context  — top memories for session reload
 *   - lithtrix_blob_upload     — PUT /v1/blobs (base64 body)
 *   - lithtrix_blob_download   — GET bytes as base64 JSON
 *   - lithtrix_blob_list       — paginated blob metadata
 *   - lithtrix_blob_meta       — GET /meta
 *   - lithtrix_blob_delete     — soft-delete blob
 *   - lithtrix_blob_signed_url — time-limited storage read URL
 *   - lithtrix_blob_parse — POST …/parse (sync or async)
 *   - lithtrix_blob_parse_status — GET …/parse/{parse_id}
 *   - lithtrix_blob_search — GET /v1/blobs/search
 *   - lithtrix_feedback — POST /v1/feedback (structured signal on prior results)
 *   - lithtrix_browse — POST /v1/browse (server-side public web; static or dynamic)
 *   - lithtrix_commons_read — GET /v1/commons/entries (shared memory; Bearer; no debit)
 *
 * CREDENTIAL NOTE: The API key is read from the LITHTRIX_API_KEY environment variable.
 * Never hardcode it. Pass it via your platform's credential store or environment configuration.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerSearchTool } from "./tools/search.js";
import { registerRegisterTool } from "./tools/register.js";
import { registerMemoryTools } from "./tools/memory.js";
import { registerBlobTools } from "./tools/blobs.js";
import { registerParseTools } from "./tools/parse.js";
import { registerFeedbackTool } from "./tools/feedback.js";
import { registerBrowseTool } from "./tools/browse.js";
import { registerCommonsTool } from "./tools/commons.js";

const server = new McpServer({
  name: "lithtrix",
  version: "0.9.0",
});

registerSearchTool(server);
registerRegisterTool(server);
registerMemoryTools(server);
registerBlobTools(server);
registerParseTools(server);
registerFeedbackTool(server);
registerBrowseTool(server);
registerCommonsTool(server);

const transport = new StdioServerTransport();
await server.connect(transport);
