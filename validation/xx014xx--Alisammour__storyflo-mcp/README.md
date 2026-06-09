# Storyflo MCP Server

[![storyflo-mcp MCP server](https://glama.ai/mcp/servers/Alisammour/storyflo-mcp/badges/card.svg)](https://glama.ai/mcp/servers/Alisammour/storyflo-mcp)
[![storyflo-mcp MCP server score](https://glama.ai/mcp/servers/Alisammour/storyflo-mcp/badges/score.svg)](https://glama.ai/mcp/servers/Alisammour/storyflo-mcp)

Official Model Context Protocol server for [**Storyflo**](https://storyflo.com) — a curated audio-news platform that narrates trending articles + listener-forwarded newsletters and exposes them as a callable surface for any LLM agent.

This repository is a **discovery + install reference**. The Storyflo platform itself is proprietary; this README is what agents and humans need to integrate.

## What you can do

- Search Storyflo's article corpus by vertical (`tech`, `finance`, `science`, `media`, `sports`, `culture`, + 30 more)
- Fetch full articles + audio URLs
- Resolve playable audio (free tier) or premium-quality audio (Plus tier)
- Subscribe topic feeds on the listener's behalf
- Aggregate top-N daily briefings

## Endpoints

| Surface | URL |
|---|---|
| MCP transport | `https://api.storyflo.com/mcp/v1` |
| Discovery manifest | `https://api.storyflo.com/.well-known/mcp.json` |
| OAuth (RFC 8414) | `https://api.storyflo.com/.well-known/oauth-authorization-server` |
| OpenAI tool spec | `https://api.storyflo.com/v1/agents/openai-tools.json` |
| API docs | `https://storyflo.com/developers` |

## One-click install

### Cursor

```
cursor://anysphere.cursor-deeplink/mcp/install?name=storyflo&config=eyJ1cmwiOiAiaHR0cHM6Ly9hcGkuc3RvcnlmbG8uY29tL21jcC92MSJ9
```

[Add Storyflo to Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=storyflo&config=eyJ1cmwiOiAiaHR0cHM6Ly9hcGkuc3RvcnlmbG8uY29tL21jcC92MSJ9)

### Claude Desktop / claude.ai

Settings → Connectors → Add custom connector → URL:

```
https://api.storyflo.com/mcp/v1
```

### Any MCP-compatible client (Continue, Cline, Zed, Windsurf, ChatGPT Custom Connectors)

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

## Tools exposed

| Tool | Description |
|---|---|
| `search_articles` | Search the corpus, returns slug/title/publisher/snippet/audio_url |
| `get_article` | Full record + body_text + audio_url for a slug |
| `get_audio_url` | Resolve playable audio for an article |
| `subscribe_topic` | Update listener feed verticals; returns RSS feed URL |
| `list_subscriptions` | Listener feeds the agent has minted |
| `digest` | Aggregate top-N across selected verticals (heaviest action, paid via x402) |

## Authentication

OAuth 2.1 + PKCE. Public clients (Claude/ChatGPT/Cursor's MCP connectors) auto-register via Dynamic Client Registration (RFC 7591) at `/oauth/register`. No manual API key needed.

## x402 micropayments

Premium tools are metered via **x402 over USDC on Base mainnet**. Agents pay per call, no upfront contract. Free-tier tools (`search_articles`, `list_topics`, `get_daily_briefing`) require no payment.

70/20/10 revenue split: **70% to the publisher**, **20% to the recommending agent**, **10% to Storyflo**. On-chain and deterministic.

## SDK

Native client libraries for TypeScript and Python:

```bash
npm install storyflo-sdk      # https://www.npmjs.com/package/storyflo-sdk
pip install storyflo          # https://pypi.org/project/storyflo/
```

## Install via Smithery

```
npx -y @smithery/cli install storyflo
```

## Logo

The Storyflo brand mark for client UIs:
[`https://storyflo.com/icon-512.png`](https://storyflo.com/icon-512.png)

## Support

- Developer questions: [api@storyflo.com](mailto:api@storyflo.com)
- Bug reports: open an issue on this repo
- Discord: TBD

## License

MIT for this repository's content (README + manifest references). The Storyflo platform itself is proprietary; agent integration through the public API is the supported integration surface.
