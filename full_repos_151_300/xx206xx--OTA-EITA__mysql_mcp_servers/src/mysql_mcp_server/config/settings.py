"""
Settings and configuration module for MySQL MCP server.
"""

import logging
import os
from dataclasses import dataclass
from typing import Any, Dict

# Configure logger
logger = logging.getLogger("mysql_mcp_server.config")


@dataclass
class DatabaseConfig:
    """
    Database configuration dataclass.
    """

    host: str
    port: int
    user: str
    password: str
    database: str

    @classmethod
    def from_env(cls) -> "DatabaseConfig":
        """
        Create a database configuration from environment variables.

        Returns:
            DatabaseConfig: Database configuration object.

        Raises:
            ValueError: If required configuration values are missing.
        """
        host = os.getenv("MYSQL_HOST", "localhost")
        port = int(os.getenv("MYSQL_PORT", "13306"))
        user = os.getenv("MYSQL_USER", "root")
        password = os.getenv("MYSQL_PASSWORD", "test")
        database = os.getenv("MYSQL_DATABASE", "master_data")

        if not all([user, password, database]):
            logger.error("Missing required database configuration. Please check environment variables:")
            logger.error("MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE are required")
            raise ValueError("Missing required database configuration")

        return cls(host=host, port=port, user=user, password=password, database=database)

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert config to dictionary usable with MySQL connector.

        Returns:
            Dict[str, Any]: Dictionary with database connection parameters.
        """
        return {
            "host": self.host,
            "port": self.port,
            "user": self.user,
            "password": self.password,
            "database": self.database,
        }

    def get_display_info(self) -> Dict[str, Any]:
        """
        Get a safe dictionary for displaying configuration (without password).

        Returns:
            Dict[str, Any]: Dictionary with database connection parameters (without password).
        """
        result = self.to_dict()
        result["password"] = "********"  # Mask password
        return result


def get_db_config() -> DatabaseConfig:
    """
    Get database configuration from environment variables.

    Returns:
        DatabaseConfig: Database configuration object.

    Raises:
        ValueError: If required configuration values are missing.
    """
    return DatabaseConfig.from_env()
