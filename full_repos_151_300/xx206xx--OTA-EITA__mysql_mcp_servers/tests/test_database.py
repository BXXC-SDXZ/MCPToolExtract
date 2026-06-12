from unittest.mock import MagicMock, patch

import pytest
from mysql.connector import Error as MySQLError

from src.mysql_mcp_server.database.connection import ResultSet, execute_query, get_connection
from src.mysql_mcp_server.database.errors import ConnectionError, QueryError


def test_result_set_to_csv():
    """Test converting ResultSet to CSV."""
    result = ResultSet(
        columns=["id", "name", "value"],
        rows=[(1, "test1", 100), (2, "test2", 200)],
        affected_rows=2,
        query_type="SELECT",
    )

    csv = result.to_csv()
    assert csv == "id,name,value\n1,test1,100\n2,test2,200"


def test_result_set_to_dict_list():
    """Test converting ResultSet to dictionary list."""
    result = ResultSet(
        columns=["id", "name", "value"],
        rows=[(1, "test1", 100), (2, "test2", 200)],
        affected_rows=2,
        query_type="SELECT",
    )

    dict_list = result.to_dict_list()
    assert dict_list == [{"id": 1, "name": "test1", "value": 100}, {"id": 2, "name": "test2", "value": 200}]


def test_result_set_properties():
    """Test ResultSet properties."""
    select_result = ResultSet(columns=["id"], rows=[(1,), (2,)], affected_rows=2, query_type="SELECT")

    update_result = ResultSet(columns=[], rows=[], affected_rows=2, query_type="UPDATE")

    empty_result = ResultSet(columns=["id"], rows=[], affected_rows=0, query_type="SELECT")

    assert select_result.is_select is True
    assert update_result.is_select is False

    assert select_result.is_empty is False
    assert update_result.is_empty is True
    assert empty_result.is_empty is True


@patch("src.mysql_mcp_server.database.connection.connect")
def test_get_connection_success(mock_connect, test_db_config):
    """Test successful database connection."""
    mock_conn = MagicMock()
    mock_connect.return_value = mock_conn

    with get_connection(test_db_config) as conn:
        assert conn == mock_conn

    mock_connect.assert_called_once_with(**test_db_config.to_dict())
    mock_conn.close.assert_called_once()


@patch("src.mysql_mcp_server.database.connection.connect")
def test_get_connection_error(mock_connect, test_db_config):
    """Test database connection error."""
    mock_connect.side_effect = MySQLError("Connection failed")

    with pytest.raises(ConnectionError, match="Failed to connect to database"):
        with get_connection(test_db_config):
            pass

    mock_connect.assert_called_once_with(**test_db_config.to_dict())


@patch("src.mysql_mcp_server.database.connection.get_connection")
def test_execute_query_select(mock_get_connection, test_db_config):
    """Test executing a SELECT query."""
    # Setup mock connection and cursor
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.__enter__.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.__enter__.return_value = mock_cursor
    mock_cursor.description = [("id",), ("name",), ("value",)]
    mock_cursor.fetchall.return_value = [(1, "test1", 100), (2, "test2", 200)]

    mock_get_connection.return_value = mock_conn

    # Execute query
    result = execute_query(test_db_config, "SELECT * FROM test_table")

    # Verify results
    assert isinstance(result, ResultSet)
    assert result.columns == ["id", "name", "value"]
    assert result.rows == [(1, "test1", 100), (2, "test2", 200)]
    assert result.affected_rows == 2
    assert result.query_type == "SELECT"

    mock_cursor.execute.assert_called_once_with("SELECT * FROM test_table")
    mock_cursor.fetchall.assert_called_once()
    mock_conn.commit.assert_not_called()


@patch("src.mysql_mcp_server.database.connection.get_connection")
def test_execute_query_update(mock_get_connection, test_db_config):
    """Test executing an UPDATE query."""
    # Setup mock connection and cursor
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.__enter__.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.__enter__.return_value = mock_cursor
    mock_cursor.rowcount = 2

    mock_get_connection.return_value = mock_conn

    # Execute query
    result = execute_query(test_db_config, "UPDATE test_table SET value = 300")

    # Verify results
    assert isinstance(result, ResultSet)
    assert result.columns == []
    assert result.rows == []
    assert result.affected_rows == 2
    assert result.query_type == "UPDATE"

    mock_cursor.execute.assert_called_once_with("UPDATE test_table SET value = 300")
    mock_cursor.fetchall.assert_not_called()
    mock_conn.commit.assert_called_once()


@patch("src.mysql_mcp_server.database.connection.get_connection")
def test_execute_query_error(mock_get_connection, test_db_config):
    """Test query execution error."""
    # Setup mock connection and cursor
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.__enter__.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.__enter__.return_value = mock_cursor
    mock_cursor.execute.side_effect = MySQLError("Query failed")

    mock_get_connection.return_value = mock_conn

    # Execute query
    with pytest.raises(QueryError, match="Error executing query"):
        execute_query(test_db_config, "INVALID QUERY")

    mock_cursor.execute.assert_called_once_with("INVALID QUERY")
