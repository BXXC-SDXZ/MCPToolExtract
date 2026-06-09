[![Archimedes Trust Report — VERIFIED 92/100](https://img.shields.io/badge/Archimedes_Trust-VERIFIED_92%2F100-10B981?style=flat-square)](https://archimedes.market/assets/aa632521-f830-4adf-9828-7c6079e06a83)

> Verified asset on [**Archimedes Market**](https://archimedes.market). View the full 4-dimension Trust Report (security · quality · license · complexity) and the curated catalog on the [asset page](https://archimedes.market/assets/aa632521-f830-4adf-9828-7c6079e06a83).

---

# MCP PostgreSQL Analytics

Read-only PostgreSQL analytics agent exposed as an MCP server. Designed to drop into a production database safely — no DDL, no DML, no writes ever.

Eight tools cover the observability surface most teams reach for during incident response and capacity planning:

- `query_plan` — `EXPLAIN (ANALYZE, BUFFERS, VERBOSE)` against a query string, with annotated cost hot spots
- `slow_queries` — top N queries by mean time / total time / call count from `pg_stat_statements`
- `index_usage` — index hit ratio, dead indexes, missing-index hints from `pg_stat_user_indexes`
- `table_bloat` — bloat estimation per table using the pgstattuple-equivalent heuristic
- `vacuum_status` — last vacuum / autovacuum / analyze per table, with wraparound risk flagged
- `connection_stats` — active sessions, idle-in-transaction, longest-running transactions
- `lock_waits` — blocked queries with the blocker chain resolved
- `size_summary` — database/schema/table/index size, sorted

## Safety guarantees

The MCP server connects as a role with `pg_read_all_stats` and `CONNECT` only. The connection string in `MCP_POSTGRES_DSN` is validated at startup to refuse any role that has `CREATE`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `ALTER`, or `DROP` privileges on any schema. Refusal exits with a clear error rather than running with elevated rights.

`query_plan` accepts a query string but executes it inside `EXPLAIN (...)` only — the query itself is never run.

## Quick start

```bash
pip install mcp-postgres-analytics
export MCP_POSTGRES_DSN="postgresql://reader@host:5432/db"
mcp-postgres-analytics serve
```

Claude Desktop config:

```json
{
  "mcpServers": {
    "postgres-analytics": {
      "command": "mcp-postgres-analytics",
      "args": ["serve"],
      "env": {
        "MCP_POSTGRES_DSN": "postgresql://reader@host:5432/db"
      }
    }
  }
}
```

## Typical agent workflow

```
Agent: "Why is our /api/checkout endpoint slow this week?"
↓
1. slow_queries → top 5 queries by mean time
2. query_plan on the worst → spots a sequential scan
3. index_usage → confirms missing index hint
4. size_summary → confirms the table is 14GB
5. Output: "Index on orders(status, created_at) missing. ~150ms saved per call. Run during low-traffic window."
```

## What it does NOT do

- No write operations of any kind
- No connection to non-PostgreSQL databases (use the DuckDB MCP for Parquet/CSV)
- No backup/restore (use pg_dump directly)
- No replication topology management

If you need write access for an agent workflow, use a separate MCP server with explicit gates. Mixing read-only analytics with write operations is exactly the kind of conflated tooling that this server was built to avoid.

## License

MIT.
