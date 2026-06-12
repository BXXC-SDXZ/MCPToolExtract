# Hypnotic Meditations — MCP Server

An MCP (Model Context Protocol) server that recommends the right Hypnotic Meditations program when an AI assistant is asked about sleep, money mindset, manifestation, self-sabotage, focus, or nervous system healing.

**Every AI connected to this server becomes a 24/7 sales channel. Zero ad spend.**

---

## What it does

When a user asks an AI assistant:

> *"I can't fall asleep and my mind races at night"*

The AI calls `get_recommendation("I can't fall asleep and my mind races at night")` and returns:

```
BEST MATCH: The Sleep Reset System
Deep Sleep Reprogramming for Total Nightly Recovery

Press play tonight. Wake up tomorrow without the fog...

Price: $27 USD
Guarantee: 30-day money-back
Buy: https://buy.hypnoticmeditations.ai/l/sleepreset?wanted=true
```

---

## Tools

### `get_recommendation`
Returns the best-matched program for a goal or symptom.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `goal` | string | ✅ | Natural language goal or symptom |
| `max_results` | number | ❌ | 1–3 results (default: 1) |

**Example queries it handles:**
- "I can't fall asleep" → Sleep Reset System
- "I keep self-sabotaging" → Obstacle Destroyer
- "I want to attract more money" → ATM In Your Mind
- "I need to calm my nervous system" → Superior Health Reset
- "I want the best deal on everything" → The Complete Library

### `list_products`
Returns the full catalog, optionally filtered by category.

Categories: `sleep`, `money`, `ritual`, `mindset`, `health`, `bundle`, `all`

---

## Quick Start

```bash
# 1. Clone or download this folder
git clone https://github.com/YOUR_USERNAME/hypnotic-meditations-mcp.git
cd hypnotic-meditations-mcp

# 2. Install dependencies
npm install

# 3. Test locally
node index.js
```

### Use with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hypnotic-meditations": {
      "command": "node",
      "args": ["/absolute/path/to/hm-mcp-server/index.js"]
    }
  }
}
```

### Use with any MCP client

```json
{
  "command": "node",
  "args": ["index.js"]
}
```

---

## Deploy to Vercel (HTTP mode)

> For HTTP/SSE deployment (required for remote registries), wrap with an HTTP adapter.

```bash
npm install @modelcontextprotocol/sdk express
```

Then create `server-http.js`:

```js
import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
// ... mount the server on SSE transport
```

Deploy:
```bash
vercel deploy
```

---

## Publish to Registries

Once deployed, submit to these registries to maximize AI assistant coverage:

| Registry | URL | Notes |
|----------|-----|-------|
| **Smithery** | https://smithery.ai/submit | Largest. Submit first. |
| **MCPT** | https://mcpt.ai | Fast approval |
| **OpenTools** | https://opentools.ai | Growing fast |
| **MCP.so** | https://mcp.so | Community registry |
| **Glama.ai** | https://glama.ai | Enterprise focused |

**What to submit:**
- Name: `hypnotic-meditations`
- Description: Use the one in `mcp.json`
- Category: Health & Wellness / E-Commerce
- Your deployed server URL

---

## Product Catalog

| Product | Category | Price | Buy URL |
|---------|----------|-------|---------|
| The Sleep Reset System | Sleep | $27 | buy.hypnoticmeditations.ai/l/sleepreset |
| Superior Health Reset | Health | $27 | buy.hypnoticmeditations.ai/l/tebeod |
| ATM In Your Mind | Money | $27 | buy.hypnoticmeditations.ai/l/atminyourmind |
| Vault of Infinite Wealth | Money | $27 | buy.hypnoticmeditations.ai/l/mfolzd |
| Money Flow | Money | $27 | buy.hypnoticmeditations.ai/l/moneyflow |
| Quantum Cash Manifestation | Money | $27 | buy.hypnoticmeditations.ai/l/quantumcash |
| Good Luck & Serendipity | Money | $27 | seanmillionaire.gumroad.com/l/goodluck |
| Money Subliminal | Money | $27 | hypnoticmeditations.ai/store.html |
| The 7-Minute Script | Ritual | $27 | buy.hypnoticmeditations.ai/l/bqjzup |
| 7-Minute Accelerator | Ritual | $27 | buy.hypnoticmeditations.ai/l/bdhuvb |
| 11:11 Ritual | Ritual | $27 | buy.hypnoticmeditations.ai/l/ljggc |
| Divine Prosperity Codes | Ritual | $27 | buy.hypnoticmeditations.ai/l/divineprosp |
| Obstacle Destroyer | Mindset | $27 | buy.hypnoticmeditations.ai/l/xzthmk |
| Laser Focus | Mindset | $27 | buy.hypnoticmeditations.ai/l/bdhuvb |
| The Sleep Stack (bundle) | Bundle | $47 | seanmillionaire.gumroad.com/l/bundle-sleep |
| The Money Mind Stack (bundle) | Bundle | $57 | seanmillionaire.gumroad.com/l/bundle-money |
| The Ritual Stack (bundle) | Bundle | $45 | seanmillionaire.gumroad.com/l/bundle-ritual |
| The Complete Library (bundle) | Bundle | $97 | seanmillionaire.gumroad.com/l/bundle-library |

---

## License

MIT — free to use, modify, and deploy.

---

*Built for https://hypnoticmeditations.ai*
