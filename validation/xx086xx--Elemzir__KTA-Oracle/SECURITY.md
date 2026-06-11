# Security Policy

## Scope

This policy covers the `kta-oracle` Cloudflare Worker and all code in this repository.

---

## Reporting a Vulnerability

Do not open a public GitHub issue for security vulnerabilities.

Contact privately:
- **X:** [@elemzir](https://x.com/elemzir) — mention "KTA-Oracle Security"
- **Response time:** within 48 hours
- **Fix target:** critical within 7 days, high severity within 14 days

Include a clear description, reproduction steps, potential impact, and your preferred follow-up contact. Responsible disclosure is appreciated — allow time to fix before any public disclosure.

---

## Architecture

### Secrets

All secrets (`KEETA_SEED`, `INTERNAL_SECRET`) are stored as encrypted Cloudflare Worker secrets set via `wrangler secret put`. They are never present in source code, `wrangler.toml`, logs, or any endpoint response.

### Oracle Wallet

The oracle wallet address is public by design — it receives KTA payments from subscribers. The `KEETA_SEED` (passphrase) that controls it is a Cloudflare secret and is never exposed.

### Internal Endpoints

`/fx/quote`, `/payment/send`, and `/verify-payment` require an `X-Internal-Secret` header. Requests without a valid secret receive a `401` immediately before any processing.

### API Quotas

All tier-gated endpoints enforce per-wallet call quotas tracked in Cloudflare KV: Starter 60 total calls over 30 days, Social 150 calls/month, Pro 300 calls/month, Business unlimited. Quota is checked and incremented atomically before any on-chain or SDK operation. Exceeded quotas return HTTP 429.

### Input Validation

All wallet addresses are validated against the `keeta_[a-z0-9]+` pattern before any on-chain or KV operation. Query parameters are type-checked and bounded before use.

### Transport

All traffic is served over HTTPS via Cloudflare's edge. No plain HTTP connections are accepted.

### Data Privacy

No personal data is stored. Wallet addresses are pseudonymous blockchain identifiers. No cookies, tracking, or analytics are used.

### Infrastructure

Deployed on Cloudflare Workers (serverless). The `workers_dev` subdomain is disabled — the worker is only accessible via service binding from KTA Social and scheduled cron triggers.

---

## Supported Versions

Only the current deployed version is actively maintained.
