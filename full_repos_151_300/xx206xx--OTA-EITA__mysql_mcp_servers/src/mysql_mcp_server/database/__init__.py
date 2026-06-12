"""
Database module for MySQL MCP Server.
"""

from .connection import ResultSet, execute_query, get_connection
from .errors import DatabaseError

__all__ = ["get_connection", "execute_query", "ResultSet", "DatabaseError"]
