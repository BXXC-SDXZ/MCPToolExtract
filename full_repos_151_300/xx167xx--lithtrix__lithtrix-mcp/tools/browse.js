/**
 * lithtrix_browse MCP tool
 *
 * POST /v1/browse — server-side public web access (static or dynamic).
 * Requires LITHTRIX_API_KEY environment variable.
 */

import { z } from "zod";

const LITHTRIX_API_URL = process.env.LITHTRIX_API_URL ?? "https://lithtrix.ai";

export function registerBrowseTool(server) {
  server.tool(
    "lithtrix_browse",
    "Pay to be fully autonomous: server-side public web access for agents. " +
      "POST /v1/browse with url and optional mode (static | dynamic). " +
      "Robots.txt is enforced. Returns browse_id, final_url, text extract, and _lithtrix (browse_url, usage on free tier). " +
      "Requires LITHTRIX_API_KEY.",
    {
      url: z
        .string()
        .min(1)
        .max(8192)
        .describe("Public http(s) URL to fetch"),
      mode: z
        .enum(["static", "dynamic"])
        .optional()
        .default("static")
        .describe('Fetch mode: "static" (HTTP GET) or "dynamic" (rendered HTML)'),
    },
    async ({ url, mode = "static" }) => {
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

      const reqUrl = new URL("/v1/browse", LITHTRIX_API_URL);
      let response;
      try {
        response = await fetch(reqUrl.toString(), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url, mode }),
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
