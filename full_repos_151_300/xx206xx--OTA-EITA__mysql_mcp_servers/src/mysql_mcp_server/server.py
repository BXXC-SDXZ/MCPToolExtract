"""
Main server implementation for MySQL MCP Server.
"""

import asyncio
import logging
from typing import Any, Dict, List

# ローカルインポートを使用
from config import get_db_config
from database import DatabaseError, execute_query
from mcp.server import Server
from mcp.types import Resource, TextContent, Tool
from pydantic import AnyUrl
from tools import execute_sql_tool, get_tool_definitions

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("mysql_mcp_server")

# Initialize server
app = Server("mysql_mcp_server")


@app.list_resources()
async def list_resources() -> List[Resource]:
    """
    List MySQL tables as resources.

    Returns:
        List[Resource]: List of available database table resources.
    """
    try:
        config = get_db_config()
        logger.info(f"Listing MySQL resources from {config.get_display_info()}")

        result = execute_query(config, "SHOW TABLES")
        resources = []

        for row in result.rows:
            table_name = row[0]
            resources.append(
                Resource(
                    uri=f"mysql://{table_name}/data",
                    name=f"Table: {table_name}",
                    mimeType="text/plain",
                    description=f"Data in table: {table_name}",
                )
            )

        logger.info(f"Found {len(resources)} table resources")
        return resources

    except DatabaseError as e:
        logger.error(f"Failed to list resources: {str(e)}")
        return []


@app.read_resource()
async def read_resource(uri: AnyUrl) -> str:
    """
    Read table contents as a resource.

    Args:
        uri: Resource URI.

    Returns:
        str: Resource content.

    Raises:
        ValueError: If URI scheme is invalid.
        RuntimeError: If database query fails.
    """
    uri_str = str(uri)
    logger.info(f"Reading resource: {uri_str}")

    if not uri_str.startswith("mysql://"):
        raise ValueError(f"Invalid URI scheme: {uri_str}")

    parts = uri_str[8:].split("/")
    table = parts[0]

    try:
        config = get_db_config()
        result = execute_query(config, f"SELECT * FROM {table} LIMIT 100")
        return result.to_csv()

    except DatabaseError as e:
        logger.error(f"Database error reading resource {uri}: {str(e)}")
        raise RuntimeError(f"Database error: {str(e)}")


@app.list_tools()
async def list_tools() -> List[Tool]:
    """
    List available MySQL tools.

    Returns:
        List[Tool]: List of available tools.
    """
    logger.info("Listing MySQL MCP server tools...")
    return get_tool_definitions()


@app.call_tool()
async def call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
    """
    Execute a tool.

    Args:
        name: Tool name.
        arguments: Tool arguments.

    Returns:
        List[TextContent]: Result of the tool execution.

    Raises:
        ValueError: If tool name is unknown.
    """
    logger.info(f"Calling tool: {name} with arguments: {arguments}")

    if name != "execute_sql":
        raise ValueError(f"Unknown tool: {name}")

    config = get_db_config()
    return execute_sql_tool(config, arguments)


async def main():
    """
    Main entry point to run the MCP server.
    """
    from mcp.server.stdio import stdio_server

    logger.info("Starting MySQL MCP server...")

    try:
        config = get_db_config()
        logger.info(f"Database configuration: {config.get_display_info()}")

        async with stdio_server() as (read_stream, write_stream):
            await app.run(read_stream, write_stream, app.create_initialization_options())
    except Exception as e:
        logger.error(f"Server error: {str(e)}", exc_info=True)
        raise


if __name__ == "__main__":
    asyncio.run(main())
