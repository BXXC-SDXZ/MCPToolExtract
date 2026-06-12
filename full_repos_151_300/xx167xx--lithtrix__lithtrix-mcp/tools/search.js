/**
 * lithtrix_search MCP tool
 *
 * Calls GET /v1/search on the Lithtrix API and returns results as JSON text.
 * Requires LITHTRIX_API_KEY environment variable.
 */

import { z } from "zod";

const LITHTRIX_API_URL = process.env.LITHTRIX_API_URL ?? "https://lithtrix.ai";

export function registerSearchTool(server) {
  server.tool(
    "lithtrix_search",
    "Search the web via Lithtrix and get credibility-scored results. " +
      "Returns structured JSON with title, URL, snippet, source domain, and credibility_score (0–1) " +
      "for each result. Higher credibility_score = more authoritative source (.gov=1.0, .edu=0.9, " +
      "news=0.8, .org=0.7, other=0.5). Requires LITHTRIX_API_KEY environment variable.",
    {
      q: z
        .string()
        .min(1)
        .max(500)
        .describe("The search query (1–500 characters)"),
      num_results: z
        .number()
        .int()
        .min(1)
        .max(20)
        .default(10)
        .optional()
        .describe("Number of results to return (1–20, default 10)"),
    },
    async ({ q, num_results = 10 }) => {
      const apiKey = process.env.LITHTRIX_API_KEY;
      if (!apiKey) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: "LITHTRIX_API_KEY environment variable is not set. " +
                  "Register at https://lithtrix.ai to get an API key.",
              }),
            },
          ],
          isError: true,
        };
      }

      const url = new URL("/v1/search", LITHTRIX_API_URL);
      url.searchParams.set("q", q);
      url.searchParams.set("num_results", String(num_results));

      let response;
      try {
        response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
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

      // Return the full structured response so agents can use results + usage info
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
