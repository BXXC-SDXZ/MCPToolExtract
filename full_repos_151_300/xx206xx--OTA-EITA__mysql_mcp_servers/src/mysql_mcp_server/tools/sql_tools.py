"""
SQL tool implementations for MySQL MCP Server.
"""

import logging
from typing import Any, Dict, List

from config import DatabaseConfig
from database import DatabaseError, execute_query
from mcp.types import TextContent, Tool

# Configure logger
logger = logging.getLogger("mysql_mcp_server.tools")


def get_tool_definitions() -> List[Tool]:
    """
    Get the list of available SQL tools.

    Returns:
        List[Tool]: List of tool definitions.
    """
    return [
        Tool(
            name="execute_sql",
            description="Execute an SQL query on the MySQL server",
            inputSchema={
                "type": "object",
                "properties": {"query": {"type": "string", "description": "The SQL query to execute"}},
                "required": ["query"],
            },
        )
    ]


def execute_sql_tool(config: DatabaseConfig, arguments: Dict[str, Any]) -> List[TextContent]:
    """
    Execute SQL query tool.

    Args:
        config: Database configuration.
        arguments: Tool arguments.

    Returns:
        List[TextContent]: Result of the tool execution.
    """
    query = arguments.get("query")
    if not query:
        error_msg = "Query is required for execute_sql tool"
        logger.error(error_msg)
        return [TextContent(type="text", text=error_msg)]

    try:
        # Execute the query
        logger.info(f"Executing SQL query: {query}")
        result = execute_query(config, query)

        # Format the result based on the query type
        if result.query_type.upper() in ("SELECT", "SHOW", "DESCRIBE"):
            return [TextContent(type="text", text=result.to_csv())]
        else:
            return [
                TextContent(type="text", text=f"Query executed successfully. Rows affected: {result.affected_rows}")
            ]

    except DatabaseError as e:
        error_msg = f"Error executing query: {str(e)}"
        logger.error(error_msg)
        return [TextContent(type="text", text=error_msg)]
