"""
Database connection and query execution for MySQL MCP Server.
"""

import logging
from contextlib import contextmanager
from dataclasses import dataclass
from typing import Any, Dict, List, Tuple

from config import DatabaseConfig
from mysql.connector import Error as MySQLError
from mysql.connector import connect
from mysql.connector.connection import MySQLConnection

from .errors import ConnectionError, QueryError

# Configure logger
logger = logging.getLogger("mysql_mcp_server.database")


@dataclass
class ResultSet:
    """
    Data class to hold the result of a query execution.
    """

    columns: List[str]
    rows: List[Tuple]
    affected_rows: int
    query_type: str  # 'SELECT', 'CREATE', 'INSERT', 'UPDATE', 'DELETE', 'SHOW', etc.

    def to_csv(self) -> str:
        """
        Convert the result set to CSV format.

        Returns:
            str: CSV representation of the result set.
        """
        if not self.rows and not self.columns:
            return ""

        result = [",".join(self.columns)]
        result.extend([",".join(map(str, row)) for row in self.rows])
        return "\n".join(result)

    def to_dict_list(self) -> List[Dict[str, Any]]:
        """
        Convert the result set to a list of dictionaries.

        Returns:
            List[Dict[str, Any]]: List of dictionaries, each representing a row.
        """
        return [dict(zip(self.columns, row)) for row in self.rows]

    @property
    def is_select(self) -> bool:
        """
        Check if the query was a SELECT statement.

        Returns:
            bool: True if it was a SELECT statement, False otherwise.
        """
        return self.query_type.upper() == "SELECT"

    @property
    def is_empty(self) -> bool:
        """
        Check if the result set is empty.

        Returns:
            bool: True if the result set has no rows, False otherwise.
        """
        return len(self.rows) == 0


@contextmanager
def get_connection(config: DatabaseConfig) -> MySQLConnection:
    """
    Get a MySQL database connection.

    Args:
        config: Database configuration.

    Yields:
        MySQLConnection: Database connection.

    Raises:
        ConnectionError: If connection to the database fails.
    """
    conn = None
    try:
        conn = connect(**config.to_dict())
        yield conn
    except MySQLError as e:
        logger.error(f"Failed to connect to database: {str(e)}")
        raise ConnectionError(f"Failed to connect to database: {str(e)}") from e
    finally:
        if conn is not None and conn.is_connected():
            conn.close()


def execute_query(config: DatabaseConfig, query: str) -> ResultSet:
    """
    Execute a SQL query and return the result.

    Args:
        config: Database configuration.
        query: SQL query to execute.

    Returns:
        ResultSet: Result of the query execution.

    Raises:
        QueryError: If query execution fails.
    """
    query = query.strip()

    # Determine query type
    query_type = query.split(" ")[0].upper()
    if not query_type:
        raise QueryError("Invalid query: empty query")

    try:
        with get_connection(config) as conn:
            with conn.cursor() as cursor:
                cursor.execute(query)

                if query_type in ("SELECT", "SHOW", "DESCRIBE"):
                    columns = [desc[0] for desc in cursor.description] if cursor.description else []
                    rows = cursor.fetchall()
                    affected_rows = len(rows)
                else:
                    # For non-SELECT queries
                    conn.commit()
                    columns = []
                    rows = []
                    affected_rows = cursor.rowcount

                return ResultSet(columns=columns, rows=rows, affected_rows=affected_rows, query_type=query_type)

    except MySQLError as e:
        logger.error(f"Error executing query '{query}': {str(e)}")
        raise QueryError(f"Error executing query: {str(e)}") from e
