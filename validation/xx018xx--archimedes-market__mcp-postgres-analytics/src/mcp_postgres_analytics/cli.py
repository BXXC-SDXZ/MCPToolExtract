"""Command-line entry point for mcp-postgres-analytics."""

from __future__ import annotations

import sys

import typer
from rich.console import Console

from .server import mcp

app = typer.Typer(add_completion=False, help="MCP PostgreSQL Analytics — read-only observability tools for Postgres.")
console = Console()


@app.command()
def serve() -> None:
    """Run the MCP server over stdio."""
    mcp.run()


@app.command()
def health() -> None:
    """Verify the configured Postgres DSN connects + role is read-only. Exits non-zero on failure."""
    import asyncio
    from .server import _get_pool

    async def _check() -> None:
        try:
            await _get_pool()
            console.print("[green]OK[/green] connection + role validation passed")
        except Exception as exc:
            console.print(f"[red]FAIL[/red] {exc}")
            sys.exit(1)

    asyncio.run(_check())


def main() -> None:
    app()


if __name__ == "__main__":
    main()
