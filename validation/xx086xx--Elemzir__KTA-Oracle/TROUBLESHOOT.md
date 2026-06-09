# KTA Oracle — Troubleshoot

**Every feature requires a minimum 0.1 KTA activated wallet.** Sending KTA alone is not enough — you must trigger activation after sending.

---

## Wallet activation

Activation scans your on-chain payment history and assigns your tier. It is always a manual step after sending KTA.

```
POST /activate   (via KTA Social: POST /activate-oracle)
Body: { "wallet": "keeta_your_wallet" }
```

Check your result:
```
GET /subscription?wallet=keeta_your_wallet
```
Returns: `tier`, `amount`, `socialLifetime`, `expiresAt`, `activatedAt`.

---

## Common issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Wallet shows `unregistered` after sending KTA | Activation not triggered | Call `POST /activate` (via Social `/activate-oracle`) after sending KTA |
| No alerts despite being registered | Trial exhausted or wallet not activated | Check `/subscription?wallet=` — if `tier: unregistered`, activate first |
| Alerts stopped after some time | Oracle 30-day window expired | Social alerts survive if `socialLifetime: true` (50+ KTA sent). Renew Oracle by sending more KTA and re-activating |
| Wrong currency in alerts | FX rate missed a cycle | Re-register with the correct currency. Rates update every cron cycle (~5 min) |
| `GET /rate` returns stale data | KV cold start or missed cron | Cron writes FX data every 5 minutes. Wait one cycle and retry |
| Cron not firing / KV stale | Worker not deployed or cron disabled | Verify `wrangler.toml` cron trigger is `*/5 * * * *` and worker is deployed |
| Activation returns 0 KTA / wrong tier | Oracle wallet has no KTA balance | Oracle wallet needs KTA balance for `getEstimates()` to return non-zero prices |
| `429 API quota exceeded` | Tier call limit reached | Starter: 60 total calls. Social: 150/month. Pro: 300/month. Renew (Starter) or wait for next month. Upgrade at `/checkout` |

---

## Tier reference

| KTA sent | Oracle tier | Social alerts | Duration |
|----------|-------------|---------------|----------|
| 0.1 | Free | Trial (100 total) | 5 days |
| 10 | Starter | Trial (100 cap) | 30 days |
| 50 | Social | **Lifetime** | 30 days |
| 300 | Pro | **Lifetime** | 30 days |
| 600 | Business | **Lifetime** | 30 days |

---

## Why KTA-Oracle?

| Feature | Most MCP servers | KTA-Oracle |
|---------|-----------------|------------|
| Tools available | 1–5 | **19** |
| AI-powered reasoning on every response | ✗ | ✓ |
| Tiered subscriptions + on-chain payments | ✗ | ✓ |
| Agent-specific onboarding (autonomous) | ✗ | ✓ |
| AML + compliance tools | ✗ | ✓ |
| Production SDK code snippets | ✗ | ✓ |
| Rate limiting + abuse protection | ✗ | ✓ |
| Listed on 5+ marketplaces | ✗ | ✓ |

---

## Payment cost comparison

| | SWIFT wire — $50,000 | Keeta Network — $50,000 |
|-|----------------------|------------------------|
| Fee | ~$1,050 | **$75** |
| Speed | 3–5 business days | **0.4 seconds** |

14× cheaper · 1,080,000× faster · same global finality

---

## Contact

[@elemzir on X](https://x.com/elemzir)
