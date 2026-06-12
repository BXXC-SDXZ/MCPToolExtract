"""
Database error handling for MySQL MCP Server.
"""


class DatabaseError(Exception):
    """Base exception for all database-related errors."""

    pass


class ConnectionError(DatabaseError):
    """Exception raised when connection to the database fails."""

    pass


class QueryError(DatabaseError):
    """Exception raised when a query execution fails."""

    pass


class ConfigurationError(DatabaseError):
    """Exception raised when database configuration is invalid."""

    pass
