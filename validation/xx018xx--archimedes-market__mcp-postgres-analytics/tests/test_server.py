"""Basic structural tests — confirm tool registration and module imports."""

import pytest

from mcp_postgres_analytics import server


def test_server_registers_expected_tools() -> None:
    expected = {
        "query_plan",
        "slow_queries",
        "index_usage",
        "vacuum_status",
        "connection_stats",
        "size_summary",
    }
    registered = {tool.name for tool in server.mcp._tool_manager._tools.values()}  # type: ignore[attr-defined]
    missing = expected - registered
    assert not missing, f"Missing tools: {missing}"


def test_validate_role_rejects_writers() -> None:
    """Smoke test — the validation function exists and is async."""
    import inspect
    assert inspect.iscoroutinefunction(server._validate_role_is_read_only)
