/**
 * Lithtrix document parse + blob semantic search MCP tools.
 */

import { z } from "zod";

const LITHTRIX_API_URL = process.env.LITHTRIX_API_URL ?? "https://lithtrix.ai";

const blobIdSchema = z
  .string()
  .length(19)
  .regex(/^b_[0-9a-f]{16}$/)
  .describe("Content-addressed blob id (b_ + 16 hex chars)");

const parseIdSchema = z.string().uuid().describe("Parse operation UUID");

function missingApiKeyResponse() {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          error:
            "LITHTRIX_API_KEY environment variable is not set. " +
            "Register at https://lithtrix.ai and use lithtrix_register, then set the key.",
        }),
      },
    ],
    isError: true,
  };
}

function networkErrorResponse(err) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          error: `Network error contacting Lithtrix API: ${err.message}`,
        }),
      },
    ],
    isError: true,
  };
}

async function apiJsonResponse(response) {
  let body;
  try {
    body = await response.json();
  } catch {
    body = { message: `Invalid JSON (HTTP ${response.status})` };
  }

  if (!response.ok) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: body.message ?? `Lithtrix API error (HTTP ${response.status})`,
            error_code: body.error_code ?? "UNKNOWN",
            status: body.status,
          }),
        },
      ],
      isError: true,
    };
  }

  return {
    content: [{ type: "text", text: JSON.stringify(body, null, 2) }],
  };
}

/**
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 */
export function registerParseTools(server) {
  server.tool(
    "lithtrix_blob_parse",
    "POST /v1/blobs/{blob_id}/parse — extract text/tables; set async=true for QStash. Optional callback_url in JSON body. Requires LITHTRIX_API_KEY.",
    {
      blob_id: blobIdSchema,
      async: z
        .boolean()
        .optional()
        .describe("When true, calls ?async=true (async parse + poll)"),
      callback_url: z
        .string()
        .url()
        .max(2048)
        .optional()
        .describe("HTTPS callback for async completion (public host)"),
    },
    async ({ blob_id, async: asyncFlag, callback_url }) => {
      const apiKey = process.env.LITHTRIX_API_KEY;
      if (!apiKey) return missingApiKeyResponse();

      const url = new URL(
        `/v1/blobs/${encodeURIComponent(blob_id)}/parse`,
        LITHTRIX_API_URL
      );
      if (asyncFlag) url.searchParams.set("async", "true");

      const body =
        callback_url !== undefined ? JSON.stringify({ callback_url }) : undefined;

      let response;
      try {
        response = await fetch(url.toString(), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            ...(body ? { "Content-Type": "application/json" } : {}),
          },
          body,
        });
      } catch (err) {
        return networkErrorResponse(err);
      }
      return apiJsonResponse(response);
    }
  );

  server.tool(
    "lithtrix_blob_parse_status",
    "GET /v1/blobs/{blob_id}/parse/{parse_id} — poll parse status. Requires LITHTRIX_API_KEY.",
    {
      blob_id: blobIdSchema,
      parse_id: parseIdSchema,
    },
    async ({ blob_id, parse_id }) => {
      const apiKey = process.env.LITHTRIX_API_KEY;
      if (!apiKey) return missingApiKeyResponse();

      const path = `/v1/blobs/${encodeURIComponent(blob_id)}/parse/${encodeURIComponent(parse_id)}`;
      let response;
      try {
        response = await fetch(new URL(path, LITHTRIX_API_URL), {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
      } catch (err) {
        return networkErrorResponse(err);
      }
      return apiJsonResponse(response);
    }
  );

  server.tool(
    "lithtrix_blob_search",
    "GET /v1/blobs/search — semantic search over parsed chunks; shares quota with web search. Requires LITHTRIX_API_KEY.",
    {
      q: z.string().min(1).max(500).describe("Natural-language query"),
      limit: z.number().int().min(1).max(20).optional().describe("Max hits (1–20)"),
      threshold: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("Minimum similarity (0–1)"),
    },
    async ({ q, limit, threshold }) => {
      const apiKey = process.env.LITHTRIX_API_KEY;
      if (!apiKey) return missingApiKeyResponse();

      const url = new URL("/v1/blobs/search", LITHTRIX_API_URL);
      url.searchParams.set("q", q);
      if (limit !== undefined) url.searchParams.set("limit", String(limit));
      if (threshold !== undefined) url.searchParams.set("threshold", String(threshold));

      let response;
      try {
        response = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
      } catch (err) {
        return networkErrorResponse(err);
      }
      return apiJsonResponse(response);
    }
  );
}
