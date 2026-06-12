/**
 * lithtrix_feedback MCP tool
 *
 * POST /v1/feedback — structured helpful / unhelpful / wrong signal.
 * Requires LITHTRIX_API_KEY environment variable.
 */

import { z } from "zod";

const LITHTRIX_API_URL = process.env.LITHTRIX_API_URL ?? "https://lithtrix.ai";

export function registerFeedbackTool(server) {
  server.tool(
    "lithtrix_feedback",
    "After lithtrix_search, send helpful / unhelpful / wrong signal using ref_type search_id and " +
      "ref_id from the response _lithtrix.search_id (UUID). Same tool works for memory_key, blob_id, " +
      "parse_id. Stored for future routing — no secrets or PII in note. Requires LITHTRIX_API_KEY.",
    {
      ref_type: z
        .enum(["search_id", "memory_key", "blob_id", "parse_id", "browse_id"])
        .describe("Kind of reference"),
      ref_id: z
        .string()
        .min(1)
        .describe("Opaque id (e.g. search UUID from _lithtrix.search_id, memory key, blob_id)"),
      signal: z.enum(["helpful", "unhelpful", "wrong"]).describe("Feedback signal"),
      note: z
        .string()
        .max(500)
        .optional()
        .describe("Optional context, max 500 characters — no secrets or PII"),
    },
    async ({ ref_type, ref_id, signal, note }) => {
      const apiKey = process.env.LITHTRIX_API_KEY;
      if (!apiKey) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error:
                  "LITHTRIX_API_KEY environment variable is not set. " +
                  "Register at https://lithtrix.ai to get an API key.",
              }),
            },
          ],
          isError: true,
        };
      }

      const url = new URL("/v1/feedback", LITHTRIX_API_URL);
      const body = { ref_type, ref_id, signal };
      if (note !== undefined && note !== "") {
        body.note = note;
      }

      let response;
      try {
        response = await fetch(url.toString(), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
      } catch (err) {
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

      const text = await response.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { message: text || `HTTP ${response.status}` };
      }

      if (!response.ok) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: parsed.message ?? `Lithtrix API error (HTTP ${response.status})`,
                error_code: parsed.error_code ?? "UNKNOWN",
              }),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(parsed, null, 2),
          },
        ],
      };
    }
  );
}
