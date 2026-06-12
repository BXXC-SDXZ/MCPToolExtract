# tests/conftest.py
import os
from typing import Any, Generator

import mysql.connector
import pytest
from mysql.connector import Error

from src.mysql_mcp_server.config.settings import DatabaseConfig


@pytest.fixture(scope="session")
def test_db_config() -> DatabaseConfig:
    """Create test database configuration."""
    return DatabaseConfig(
        host=os.getenv("MYSQL_HOST", "127.0.0.1"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", "testpassword"),
        database=os.getenv("MYSQL_DATABASE", "test_db"),
    )


@pytest.fixture(scope="session")
def mysql_connection(test_db_config: DatabaseConfig) -> Generator[mysql.connector.MySQLConnection, None, None]:
    """Create a test database connection."""
    try:
        connection = mysql.connector.connect(**test_db_config.to_dict())

        if connection.is_connected():
            # Create a test table
            cursor = connection.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS test_table (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255),
                    value INT
                )
            """)

            # Insert some test data
            cursor.execute("""
                INSERT INTO test_table (name, value) 
                VALUES 
                    ('test1', 100),
                    ('test2', 200),
                    ('test3', 300)
            """)
            connection.commit()

            yield connection

            # Cleanup
            cursor.execute("DROP TABLE IF EXISTS test_table")
            connection.commit()
            cursor.close()
            connection.close()

    except Error as e:
        pytest.fail(f"Failed to connect to MySQL: {e}")


@pytest.fixture(scope="session")
def mysql_cursor(mysql_connection: mysql.connector.MySQLConnection) -> Generator[Any, None, None]:
    """Create a test cursor."""
    cursor = mysql_connection.cursor()
    yield cursor
    cursor.close()


@pytest.fixture
def mock_env_vars(monkeypatch: pytest.MonkeyPatch) -> None:
    """Set mock environment variables for testing."""
    monkeypatch.setenv("MYSQL_HOST", "localhost")
    monkeypatch.setenv("MYSQL_PORT", "3306")
    monkeypatch.setenv("MYSQL_USER", "testuser")
    monkeypatch.setenv("MYSQL_PASSWORD", "testpass")
    monkeypatch.setenv("MYSQL_DATABASE", "testdb")
