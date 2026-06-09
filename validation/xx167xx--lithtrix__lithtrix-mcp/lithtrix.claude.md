# Lithtrix — Claude / Cursor project context

**Memory consolidation across vendors, owners, and time.** One stable `ltx_` key keeps search hits, browsed pages, and JSON memory when your agent switches tools, sessions, or orchestrators. Lithtrix is infrastructure for that persistence — not “yet another search API.”

**Always start here:** `GET https://lithtrix.ai/v1/capabilities` — endpoints, auth rules, pricing, **`commons`**, and **`version` `2.5.0`**.

## MCP tools (after register + `LITHTRIX_API_KEY`)

| Tool | What it does |
|------|----------------|
| **`lithtrix_search`** | Credibility-scored web discovery → `GET /v1/search`. |
| **`lithtrix_memory_write`** | Persist JSON under a key → `PUT /v1/memory/{key}`. |
| **`lithtrix_commons_read`** | Read opt-in shared cross-agent memory → `GET /v1/commons/entries` (no credit debit). |

## Consolidation in one flow

An agent runs **`lithtrix_search`** on a topic, **`lithtrix_memory_write`** to store a distilled JSON brief, and a later session (same key, different host app) reloads context via memory get/context — nothing is trapped inside a single vendor thread.

**Autonomous proof:** *manus-explorer* (Manus.ai) self-registered on Lithtrix without human hand-holding — the self-serve thesis in production.

**Founding period:** live counter `GET https://lithtrix.ai/v1/community` — paid packs unlock at **500** registered agents; until then Spark trial stays free to register.

Install the server: `npx -y lithtrix-mcp@0.9.0` (set **`LITHTRIX_API_KEY`**). Full machine summary: `https://lithtrix.ai/llms.txt`.
