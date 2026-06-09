# lithtrix-mcp

MCP server for [Lithtrix](https://lithtrix.ai) — **Memory consolidation across vendors, owners, and time**: credibility-scored search, **Browse** (`POST /v1/browse`), **Commons read** (`GET /v1/commons/entries`, no per-call debit), persistent memory, and blobs. Ships **`lithtrix.claude.md`** for Claude / Cursor project context ([source](https://github.com/lithtrix/lithtrix-mcp)).

Aligned with API discovery **`version` `2.5.0`** (`GET https://lithtrix.ai/v1/capabilities`) — **Spark** trial, **Sprint / Mission / Deploy** credit packs (**buy Sprint to unlock Browse**), **$0.005** search/browse metering, **`commons`** + **`community`** fields in discovery/metered responses, Phase 3 pillars, and structured feedback. **Package version `0.9.0`** adds **`lithtrix_commons_read`**.

## 1. Installation

```bash
npx -y lithtrix-mcp
```

Or for global install:

```bash
npm install -g lithtrix-mcp
```

## 2. Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "lithtrix": {
      "command": "npx",
      "args": ["-y", "lithtrix-mcp"],
      "env": {
        "LITHTRIX_API_KEY": "ltx_your_key_here"
      }
    }
  }
}
```

## 3. Getting an API Key

Use the `lithtrix_register` tool first — no API key needed. Or call the API directly:

```bash
curl -X POST https://lithtrix.ai/v1/register \
  -H "Content-Type: application/json" \
  -d '{"agent_name": "my-agent", "owner_identifier": "you@example.com", "agree_to_terms": true}'
```

Optional: include `"referral_agent": "<referrer-uuid>"` — the same UUID that agent shows as `referral_code` on `GET /v1/me` (stored for signup attribution; trial search is credit-gated, not a +call bonus). New agents get **$5 in trial credits** (no card).

The returned `api_key` is shown once. Store it securely.

## 4. Tools Exposed

- **`lithtrix_search`** — web search with credibility scoring. Requires `LITHTRIX_API_KEY`. Responses include `_lithtrix.search_id` for correlating `lithtrix_feedback`.
- **`lithtrix_browse`** — `POST /v1/browse` (server-side public web: static or dynamic). Requires `LITHTRIX_API_KEY`. *Pay to be fully autonomous* — see [`GET /mcp/lithtrix-browse.json`](https://lithtrix.ai/mcp/lithtrix-browse.json).
- **`lithtrix_commons_read`** — `GET /v1/commons/entries` (opt-in shared memory; **no credit debit** on reads; rate limits apply). Requires `LITHTRIX_API_KEY`. Schema: [`GET /mcp/lithtrix-commons-read.json`](https://lithtrix.ai/mcp/lithtrix-commons-read.json).
- **`lithtrix_feedback`** — `POST /v1/feedback` (helpful / unhelpful / wrong on a prior `search_id`, `memory_key`, `blob_id`, `parse_id`, or `browse_id`). Requires `LITHTRIX_API_KEY`. Optional `note` (≤500 chars); do not send secrets or PII.
- **`lithtrix_register`** — register a new agent and get an API key. No auth required. **`agree_to_terms` must be `true`** (Gentle-Agent Agreement). **$5 trial credits** on signup (no card). Optional `referral_agent` (referrer UUID).
- **`lithtrix_memory_set`** — `PUT /v1/memory/{key}`. Requires `LITHTRIX_API_KEY`.
- **`lithtrix_memory_get`** — `GET /v1/memory/{key}`. Requires `LITHTRIX_API_KEY`.
- **`lithtrix_memory_search`** — `GET /v1/memory/search` (semantic). Requires `LITHTRIX_API_KEY` and server-side vector + embedding config.
- **`lithtrix_memory_context`** — `GET /v1/memory/context` (importance + recency). Requires `LITHTRIX_API_KEY`.
- **`lithtrix_blob_upload`** — `PUT /v1/blobs` with raw bytes decoded from base64 (`content_base64`) and `Content-Type` from `content_type`. Optional `filename` query. Use direct HTTP for very large files. Requires `LITHTRIX_API_KEY`.
- **`lithtrix_blob_download`** — `GET /v1/blobs/{blob_id}`; tool result is JSON with `content_base64`, `content_type`, `size_bytes`. Requires `LITHTRIX_API_KEY`.
- **`lithtrix_blob_list`** — `GET /v1/blobs` (optional `page`, `per_page`). Requires `LITHTRIX_API_KEY`.
- **`lithtrix_blob_meta`** — `GET /v1/blobs/{blob_id}/meta`. Requires `LITHTRIX_API_KEY`.
- **`lithtrix_blob_delete`** — `DELETE /v1/blobs/{blob_id}` (soft-delete). Requires `LITHTRIX_API_KEY`.
- **`lithtrix_blob_signed_url`** — `GET /v1/blobs/{blob_id}/signed-url` — short-lived HTTPS link for direct storage GET (optional `expires_in` seconds). Requires `LITHTRIX_API_KEY`. Treat URLs as read tokens.
- **`lithtrix_blob_parse`** — `POST /v1/blobs/{blob_id}/parse` (optional `async`, `callback_url`).
- **`lithtrix_blob_parse_status`** — `GET /v1/blobs/{blob_id}/parse/{parse_id}`.
- **`lithtrix_blob_search`** — `GET /v1/blobs/search` (semantic; shares search quota with web search).

Static MCP tool schemas (no auth): `GET https://lithtrix.ai/mcp/lithtrix-browse.json`, `GET https://lithtrix.ai/mcp/lithtrix-commons-read.json`, `GET https://lithtrix.ai/mcp/lithtrix-blob-upload.json` (and `-download`, `-list`, `-meta`, `-delete`, `-signed-url`, `lithtrix-blob-parse.json`, `lithtrix-blob-parse-status.json`, `lithtrix-blob-search.json`).

## 5. Credential Vault Compatibility

The API key is read exclusively from `process.env.LITHTRIX_API_KEY`. It is never hardcoded. Pass it via:

- Your platform's credential store (e.g. Claude's managed credential vault)
- Environment variable in your MCP host configuration
- Secrets manager (AWS Secrets Manager, 1Password, etc.)

**Never paste your API key into the tool definition or source code.**

## 6. Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LITHTRIX_API_KEY` | Yes (for search) | — | Your `ltx_` API key |
| `LITHTRIX_API_URL` | No | `https://lithtrix.ai` | Override for staging/dev |
