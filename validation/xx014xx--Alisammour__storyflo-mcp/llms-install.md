# Storyflo MCP — Agent Install Guide

This file is read by AI agents (Cline, Claude, Cursor) when configuring the Storyflo MCP server. No build step or environment setup required — Storyflo runs as a hosted service.

## One-step install

Add to your MCP client's config:

```json
{
  "mcpServers": {
    "storyflo": {
      "url": "https://api.storyflo.com/mcp/v1",
      "transport": "streamable-http"
    }
  }
}
```

The first time the user invokes a Storyflo tool, the client will prompt for OAuth consent. Authentication happens via the user's browser at `https://storyflo.com/oauth/authorize` — no API keys or shared secrets to manage.

## Free vs paid tools

Free tools are immediately available after consent:
- `search_articles`
- `list_topics`
- `get_daily_briefing`
- `get_article`

Paid tools (metered via x402 over USDC on Base mainnet):
- `get_premium_briefing` — $0.005/min for stitched on-demand briefings
- `digest` — $0.001/article aggregation

Agents that don't have a wallet wired can still call free tools without paying. Paid calls return a 402 with the on-chain price; the agent's x402 client handles settlement.

## No environment variables required

Everything works out of the box. Storyflo is a hosted MCP server — there's no Docker, no API key file, no local state.
