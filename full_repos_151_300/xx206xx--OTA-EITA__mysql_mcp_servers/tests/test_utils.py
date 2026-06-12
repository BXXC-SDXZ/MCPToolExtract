"""
Test utilities for MySQL MCP Server tests.
"""

from typing import Any, List, Tuple

from mysql.connector.connection import MySQLConnection


def populate_test_data(cursor: Any, connection: MySQLConnection) -> None:
    """
    Populate test data for testing.

    Args:
        cursor: Database cursor.
        connection: Database connection.
    """
    # Clear existing data
    cursor.execute("DELETE FROM test_table")

    # Insert test data
    insert_query = """
        INSERT INTO test_table (name, value) VALUES (%s, %s)
    """
    test_data = [
        ("test_item_1", 100),
        ("test_item_2", 200),
        ("test_item_3", 300),
        ("test_item_4", 400),
        ("test_item_5", 500),
    ]

    cursor.executemany(insert_query, test_data)
    connection.commit()


def verify_table_exists(cursor: Any, table_name: str) -> bool:
    """
    Verify if a table exists in the database.

    Args:
        cursor: Database cursor.
        table_name: Name of the table to check.

    Returns:
        bool: True if the table exists, False otherwise.
    """
    cursor.execute(
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = %s",
        (table_name,),
    )
    result = cursor.fetchone()
    return result[0] > 0


def get_table_data(cursor: Any, table_name: str) -> Tuple[List[str], List[Tuple]]:
    """
    Get all data from a table.

    Args:
        cursor: Database cursor.
        table_name: Name of the table.

    Returns:
        Tuple[List[str], List[Tuple]]: Tuple of column names and rows.
    """
    cursor.execute(f"SELECT * FROM {table_name}")
    columns = [desc[0] for desc in cursor.description]
    rows = cursor.fetchall()
    return columns, rows


def assert_table_row_count(cursor: Any, table_name: str, expected_count: int) -> None:
    """
    Assert that a table has the expected number of rows.

    Args:
        cursor: Database cursor.
        table_name: Name of the table.
        expected_count: Expected number of rows.
    """
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    count = cursor.fetchone()[0]
    assert count == expected_count, f"Expected {expected_count} rows in {table_name}, got {count}"
