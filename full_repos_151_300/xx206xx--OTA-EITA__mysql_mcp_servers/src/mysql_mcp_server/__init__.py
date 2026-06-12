"""
MySQL MCP Server package.

This package provides a Model Context Protocol (MCP) server that enables
secure interaction with MySQL databases.
"""

import asyncio
import logging

# 循環インポートを防ぐために、必要なものだけをインポート
# import config, database, server, tools

# Configure version
__version__ = "0.3.0"

# Setup package-level logging
logger = logging.getLogger(__name__)


def main():
    """
    Main entry point for the package.
    """
    try:
        asyncio.run(server.main())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise


# Expose important items at package level
__all__ = ["main", "server", "config", "database", "tools", "__version__"]
