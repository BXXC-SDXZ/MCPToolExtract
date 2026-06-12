"""
Configuration module for MySQL MCP Server.
"""

from .settings import DatabaseConfig, get_db_config

__all__ = ["get_db_config", "DatabaseConfig"]
