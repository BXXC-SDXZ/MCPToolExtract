# relayshield-mcp

<!-- mcp-name: io.github.nzdsf2-gif/relayshield-mcp -->

`mcp-name: io.github.nzdsf2-gif/relayshield-mcp`

[RelayShield](https://relayshield.net) security intelligence as an MCP server — plug breach detection, SIM swap detection, domain lookalike monitoring, OAuth supply chain watchlist, and URL/file scanning directly into Claude and any MCP-compatible AI agent.

## Tools

| Tool | What it does | PAYG price |
|---|---|---|
| `check_breach` | Email breach lookup — 13 billion+ records via HIBP | $0.10 USDC |
| `check_sim_swap` | SIM swap / eSIM detection via live carrier data | $0.25 USDC |
| `check_domain_lookalikes` | Typosquat and lookalike domain detection with cert transparency | $0.50 USDC |
| `check_oauth_watchlist` | OAuth supply chain breach check — Slack, GitHub, Notion, Zapier, and more | $0.15 USDC |
| `scan_url` | URL malware/phishing scan across 70+ engines (async) | subscription only |
| `scan_file` | Binary malware scan across 70+ AV engines (async) | subscription only |
| `check_scan_result` | Poll for verdict after `scan_url` / `scan_file` | free |

## Access modes

**Subscription** — API key from [RapidAPI](https://rapidapi.com/relayshield/relayshield-security-intelligence). All 7 tools available. Free tier: 100 calls/month. Paid tiers from $29/month.

**Pay-as-you-go** — No API key needed. Pay per check in USDC on Base (x402 protocol). Set `RELAYSHIELD_X_PAYMENT` with your payment proof. 4 tools available ($0.10–$0.50/check). Call a tool with no payment set to receive pricing and payment instructions.

**Discovery** — Set neither key nor payment. Tool calls return payment requirements and a subscription link.

## Install

```bash
pip install relayshield-mcp
```

Or run without installing:

```bash
uvx relayshield-mcp
```

## Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

**Subscription (RapidAPI key):**
```json
{
  "mcpServers": {
    "relayshield": {
      "command": "relayshield-mcp",
      "env": {
        "RELAYSHIELD_API_URL": "https://xhh3tfrhng.execute-api.us-east-1.amazonaws.com/prod",
        "RELAYSHIELD_API_KEY": "your-rapidapi-key-here"
      }
    }
  }
}
```

**Pay-as-you-go (x402 USDC on Base):**
```json
{
  "mcpServers": {
    "relayshield": {
      "command": "relayshield-mcp",
      "env": {
        "RELAYSHIELD_API_URL": "https://xhh3tfrhng.execute-api.us-east-1.amazonaws.com/prod",
        "RELAYSHIELD_X_PAYMENT": "your-x402-payment-proof-here"
      }
    }
  }
}
```

Quit and relaunch Claude Desktop after editing.

## Configure Claude Code (CLI)

```bash
claude mcp add relayshield \
  --command relayshield-mcp \
  --env RELAYSHIELD_API_URL=https://xhh3tfrhng.execute-api.us-east-1.amazonaws.com/prod \
  --env RELAYSHIELD_API_KEY=your-rapidapi-key-here
```

## Usage examples

Once configured, ask Claude:

```
Check whether user@example.com has been breached.
```

```
Has there been a SIM swap on +14155551234?
```

```
Check acme.com for lookalike domains.
```

```
Are any OAuth apps connected to user@example.com in a recent breach?
```

```
Scan this URL for malware: https://suspicious-link.example.com
```

For URL and file scans, Claude automatically polls `check_scan_result` every 5 seconds until the verdict is ready.

## Environment variables

| Variable | Description |
|---|---|
| `RELAYSHIELD_API_URL` | API Gateway base URL (required) |
| `RELAYSHIELD_API_KEY` | RapidAPI subscription key (subscription mode) |
| `RELAYSHIELD_X_PAYMENT` | x402 payment proof — USDC on Base (pay-as-you-go mode) |

Set `RELAYSHIELD_API_KEY` **or** `RELAYSHIELD_X_PAYMENT` — not both. API key takes priority if both are set.

## Links

- [Landing page](https://relayshield.net)
- [RapidAPI listing](https://rapidapi.com/relayshield/relayshield-security-intelligence)
- [GitHub](https://github.com/relayshield/relayshield-mcp)
