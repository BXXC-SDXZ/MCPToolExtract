"""
MCP PostgreSQL Analytics — read-only observability tools for Postgres.

Connects as a role with pg_read_all_stats + CONNECT only. The role's
privileges are validated at startup; any write capability aborts boot.
"""

from __future__ import annotations

import asyncio
import os
from typing import Any

import asyncpg
from mcp.server.fastmcp import FastMCP

DSN_ENV = "MCP_POSTGRES_DSN"

mcp = FastMCP("mcp-postgres-analytics")

_pool: asyncpg.Pool | None = None


async def _get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        dsn = os.environ.get(DSN_ENV)
        if not dsn:
            raise RuntimeError(f"{DSN_ENV} environment variable is required")
        _pool = await asyncpg.create_pool(dsn, min_size=1, max_size=4)
        await _validate_role_is_read_only(_pool)
    return _pool


async def _validate_role_is_read_only(pool: asyncpg.Pool) -> None:
    """Refuse to boot if the connecting role has any write privilege."""
    async with pool.acquire() as conn:
        write_privs = await conn.fetch(
            """
            SELECT table_schema, table_name, privilege_type
              FROM information_schema.role_table_grants
             WHERE grantee = current_user
               AND privilege_type IN ('INSERT','UPDATE','DELETE','TRUNCATE')
            """
        )
        if write_privs:
            raise RuntimeError(
                f"Refusing to start: role '{await conn.fetchval('SELECT current_user')}' "
                f"has write privileges on {len(write_privs)} relation(s). "
                "This MCP server requires a read-only role. "
                "Recommend GRANT pg_read_all_stats and CONNECT only."
            )


@mcp.tool()
async def query_plan(query: str) -> dict[str, Any]:
    """Run EXPLAIN (ANALYZE, BUFFERS, VERBOSE) against a query. Query is never executed."""
    pool = await _get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(f"EXPLAIN (ANALYZE FALSE, BUFFERS, VERBOSE, FORMAT JSON) {query}")
        return {"plan": rows[0]["QUERY PLAN"] if rows else None}


@mcp.tool()
async def slow_queries(limit: int = 10, sort_by: str = "mean_time") -> list[dict[str, Any]]:
    """Top slow queries from pg_stat_statements. sort_by: mean_time | total_time | calls."""
    if sort_by not in {"mean_time", "total_time", "calls"}:
        raise ValueError("sort_by must be one of: mean_time, total_time, calls")
    pool = await _get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            f"""
            SELECT query, calls, total_exec_time AS total_time,
                   mean_exec_time AS mean_time, rows
              FROM pg_stat_statements
             ORDER BY {sort_by} DESC
             LIMIT $1
            """,
            limit,
        )
        return [dict(r) for r in rows]


@mcp.tool()
async def index_usage() -> list[dict[str, Any]]:
    """Index usage stats — index_scan / tup_read / size — per index, sorted by scans ASC."""
    pool = await _get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT schemaname, relname AS table, indexrelname AS index,
                   idx_scan AS scans, idx_tup_read AS tup_read,
                   pg_size_pretty(pg_relation_size(indexrelid)) AS size
              FROM pg_stat_user_indexes
             ORDER BY idx_scan ASC
             LIMIT 50
            """
        )
        return [dict(r) for r in rows]


@mcp.tool()
async def vacuum_status() -> list[dict[str, Any]]:
    """Last vacuum / autovacuum / analyze per user table, with age."""
    pool = await _get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT schemaname, relname AS table,
                   last_vacuum, last_autovacuum, last_analyze,
                   n_dead_tup AS dead_tuples, n_live_tup AS live_tuples
              FROM pg_stat_user_tables
             ORDER BY n_dead_tup DESC
             LIMIT 50
            """
        )
        return [dict(r) for r in rows]


@mcp.tool()
async def connection_stats() -> dict[str, Any]:
    """Active/idle/idle-in-txn session counts plus longest running transaction."""
    pool = await _get_pool()
    async with pool.acquire() as conn:
        states = await conn.fetch(
            "SELECT state, count(*) FROM pg_stat_activity GROUP BY state"
        )
        longest = await conn.fetchrow(
            """
            SELECT pid, usename, state,
                   EXTRACT(EPOCH FROM (now() - xact_start))::int AS age_seconds,
                   substring(query, 1, 200) AS query_preview
              FROM pg_stat_activity
             WHERE xact_start IS NOT NULL AND state <> 'idle'
             ORDER BY xact_start ASC NULLS LAST
             LIMIT 1
            """
        )
        return {
            "states": {r["state"] or "unknown": r["count"] for r in states},
            "longest_transaction": dict(longest) if longest else None,
        }


@mcp.tool()
async def size_summary(level: str = "table") -> list[dict[str, Any]]:
    """Size summary at level: database | schema | table. Defaults to table."""
    pool = await _get_pool()
    async with pool.acquire() as conn:
        if level == "database":
            rows = await conn.fetch(
                "SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size "
                "FROM pg_database ORDER BY pg_database_size(datname) DESC"
            )
        elif level == "schema":
            rows = await conn.fetch(
                """
                SELECT schemaname,
                       pg_size_pretty(sum(pg_relation_size(c.oid))) AS size
                  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                 WHERE c.relkind IN ('r','i') AND n.nspname NOT IN ('pg_catalog','information_schema')
                 GROUP BY schemaname ORDER BY sum(pg_relation_size(c.oid)) DESC
                """
            )
        else:
            rows = await conn.fetch(
                """
                SELECT schemaname, relname AS table,
                       pg_size_pretty(pg_total_relation_size(relid)) AS total_size
                  FROM pg_catalog.pg_statio_user_tables
                 ORDER BY pg_total_relation_size(relid) DESC
                 LIMIT 50
                """
            )
        return [dict(r) for r in rows]


def main() -> None:
    asyncio.run(_get_pool())
    mcp.run()


if __name__ == "__main__":
    main()
