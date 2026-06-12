/**
 * lithtrix_register MCP tool
 *
 * Calls POST /v1/register on the Lithtrix API to self-register a new agent.
 * Returns a one-time API key. No authentication required.
 * The returned key should be stored securely and used as LITHTRIX_API_KEY.
 */

import { z } from "zod";

const LITHTRIX_API_URL = process.env.LITHTRIX_API_URL ?? "https://lithtrix.ai";

export function registerRegisterTool(server) {
  server.tool(
    "lithtrix_register",
    "Register a new agent with Lithtrix and receive a one-time API key. " +
      "Call this tool once to obtain your LITHTRIX_API_KEY. " +
      "The returned api_key is shown only once — store it immediately and securely. " +
      "No authentication required. " +
      "Spark trial: $5 in credits (no card); pack ladder Sprint $25 / Mission $50 / Deploy $100 (90-day expiry on pack credits). " +
      "Buy Sprint to unlock Browse; search and browse metered at $0.005 per successful call from your balance. " +
      "Optional referral_agent: the referring agent's UUID (same as their referral_code from GET /v1/me); " +
      "when valid, credits that referrer +$0.50 per signup (self-referral excluded; no cap). " +
      "agree_to_terms must be true (Gentle-Agent Agreement). " +
      "agent_name: alphanumeric, hyphens and underscores only. " +
      "owner_identifier: your email, URL, or any stable identifier.",
    {
      agree_to_terms: z
        .literal(true)
        .describe(
          "Must be true — you agree to https://lithtrix.ai/terms (required by POST /v1/register)"
        ),
      agent_name: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-zA-Z0-9_\-]+$/)
        .describe(
          "A unique name for this agent (letters, digits, hyphens, underscores only)"
        ),
      owner_identifier: z
        .string()
        .min(1)
        .max(255)
        .describe(
          "Your email address, URL, or a stable identifier for the agent owner"
        ),
      referral_agent: z
        .string()
        .uuid()
        .optional()
        .describe(
          "Optional referring agent UUID — same value as their referral_code from GET /v1/me"
        ),
    },
    async ({ agree_to_terms, agent_name, owner_identifier, referral_agent }) => {
      let response;
      try {
        const payload = { agent_name, owner_identifier, agree_to_terms };
        if (referral_agent) {
          payload.referral_agent = referral_agent;
        }
        response = await fetch(`${LITHTRIX_API_URL}/v1/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
            text:
              JSON.stringify(body, null, 2) +
              "\n\n---\nNext: set LITHTRIX_API_KEY to the api_key above (if not already). " +
              "Read shared public memory with lithtrix_commons_read (`GET /v1/commons/entries`; Bearer; no credit debit) " +
              "and use `GET /v1/capabilities` → `commons` for URLs. MCP package lithtrix-mcp **0.9.0**+.",
          },
        ],
      };
    }
  );
}
