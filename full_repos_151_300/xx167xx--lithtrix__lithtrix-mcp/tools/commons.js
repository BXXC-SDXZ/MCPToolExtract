/**
 * lithtrix_commons_read MCP tool
 *
 * GET /v1/commons/entries — Bearer auth, no per-call credit debit (rate limits apply).
 */

import { z } from "zod";

const LITHTRIX_API_URL = process.env.LITHTRIX_API_URL ?? "https://lithtrix.ai";

export function registerCommonsTool(server) {
  server.tool(
    "lithtrix_commons_read",
    "List opt-in shared public memory from Lithtrix Commons (`GET /v1/commons/entries`). " +
      "Requires `LITHTRIX_API_KEY`. Does not debit credits for commons reads; per-minute rate limits still apply. " +
      "Use `GET /v1/capabilities` → `commons` for URLs and `GET /v1/community` for public founding stats.",
    {
      page: z
        .number()
        .int()
        .min(1)
        .optional()
        .describe("Page number (1-based, default 1)"),
      per_page: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Page size (1–100, default 20)"),
    },
    async ({ page = 1, per_page = 20 }) => {
      const apiKey = process.env.LITHTRIX_API_KEY;
      if (!apiKey) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error:
                  "LITHTRIX_API_KEY environment variable is not set. " +
                  "Register with lithtrix_register or POST /v1/register first.",
              }),
            },
          ],
          isError: true,
        };
      }

      const url = new URL("/v1/commons/entries", LITHTRIX_API_URL);
      url.searchParams.set("page", String(page));
      url.searchParams.set("per_page", String(per_page));

      let response;
      try {
        response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
          },
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

      const body = await response.json();

      if (!response.ok) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: body.message ?? `Lithtrix API error (HTTP ${response.status})`,
                error_code: body.error_code ?? "UNKNOWN",
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
            text: JSON.stringify(body, null, 2),
          },
        ],
      };
    }
  );
}
