/**
 * Lithtrix memory MCP tools — PUT/GET /v1/memory, semantic search, context reload.
 * Requires LITHTRIX_API_KEY (and LITHTRIX_API_URL optional override).
 */

import { z } from "zod";

const LITHTRIX_API_URL = process.env.LITHTRIX_API_URL ?? "https://lithtrix.ai";

const memoryKeySchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9\-_.:]+$/)
  .describe(
    "Memory key (1–128 chars: letters, digits, hyphen, underscore, dot, colon)"
  );

const importanceSchema = z
  .enum(["critical", "high", "normal", "low"])
  .optional()
  .describe("Optional importance tier (default normal on API if omitted)");

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

export function registerMemoryTools(server) {
  server.tool(
    "lithtrix_memory_set",
    "Store or update a JSON value for a memory key (PUT /v1/memory/{key}). " +
      "Requires LITHTRIX_API_KEY. Optional ttl (seconds), importance, source, confidence.",
    {
      key: memoryKeySchema,
      value: z
        .any()
        .describe(
          "JSON-serializable value (object, array, string, number, boolean, etc.)"
        ),
      ttl: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Optional positive TTL in seconds"),
      importance: importanceSchema,
      source: z
        .string()
        .max(255)
        .optional()
        .describe("Optional provenance label (e.g. tool name)"),
      confidence: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("Optional confidence 0–1 (default 1.0 on API)"),
    },
    async ({ key, value, ttl, importance, source, confidence }) => {
      const apiKey = process.env.LITHTRIX_API_KEY;
      if (!apiKey) return missingApiKeyResponse();

      const payload = { value };
      if (ttl !== undefined) payload.ttl = ttl;
      if (importance !== undefined) payload.importance = importance;
      if (source !== undefined) payload.source = source;
      if (confidence !== undefined) payload.confidence = confidence;

      const path = `/v1/memory/${encodeURIComponent(key)}`;
      let response;
      try {
        response = await fetch(new URL(path, LITHTRIX_API_URL), {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        return networkErrorResponse(err);
      }
      return apiJsonResponse(response);
    }
  );

  server.tool(
    "lithtrix_memory_get",
    "Retrieve a stored memory by key (GET /v1/memory/{key}). Requires LITHTRIX_API_KEY.",
    {
      key: memoryKeySchema,
    },
    async ({ key }) => {
      const apiKey = process.env.LITHTRIX_API_KEY;
      if (!apiKey) return missingApiKeyResponse();

      const path = `/v1/memory/${encodeURIComponent(key)}`;
      let response;
      try {
        response = await fetch(new URL(path, LITHTRIX_API_URL), {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        return networkErrorResponse(err);
      }
      return apiJsonResponse(response);
    }
  );

  server.tool(
    "lithtrix_memory_search",
    "Semantic search over your memories (GET /v1/memory/search). " +
      "Requires LITHTRIX_API_KEY and server-side vector + embedding configuration. " +
      "Returns ranked results with similarity scores.",
    {
      q: z
        .string()
        .min(1)
        .max(500)
        .describe("Natural-language search query"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(20)
        .optional()
        .describe("Max results (1–20, default 5)"),
      importance: importanceSchema,
      threshold: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("Minimum similarity 0–1 (default 0.7 on API)"),
    },
    async ({ q, limit, importance, threshold }) => {
      const apiKey = process.env.LITHTRIX_API_KEY;
      if (!apiKey) return missingApiKeyResponse();

      const url = new URL("/v1/memory/search", LITHTRIX_API_URL);
      url.searchParams.set("q", q);
      if (limit !== undefined) url.searchParams.set("limit", String(limit));
      if (importance !== undefined) url.searchParams.set("importance", importance);
      if (threshold !== undefined)
        url.searchParams.set("threshold", String(threshold));

      let response;
      try {
        response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        return networkErrorResponse(err);
      }
      return apiJsonResponse(response);
    }
  );

  server.tool(
    "lithtrix_memory_context",
    "Reload top memories for session start (GET /v1/memory/context) — " +
      "ranked by importance then recency. Requires LITHTRIX_API_KEY.",
    {
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .describe("Max memories to return (1–50, default 10)"),
      importance: importanceSchema,
    },
    async ({ limit, importance }) => {
      const apiKey = process.env.LITHTRIX_API_KEY;
      if (!apiKey) return missingApiKeyResponse();

      const url = new URL("/v1/memory/context", LITHTRIX_API_URL);
      if (limit !== undefined) url.searchParams.set("limit", String(limit));
      if (importance !== undefined) url.searchParams.set("importance", importance);

      let response;
      try {
        response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        return networkErrorResponse(err);
      }
      return apiJsonResponse(response);
    }
  );
}
