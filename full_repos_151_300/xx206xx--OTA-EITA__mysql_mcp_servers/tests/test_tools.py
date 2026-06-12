from unittest.mock import patch

from src.mysql_mcp_server.database.connection import ResultSet
from src.mysql_mcp_server.database.errors import DatabaseError
from src.mysql_mcp_server.tools.sql_tools import execute_sql_tool, get_tool_definitions


def test_get_tool_definitions():
    """Test getting SQL tool definitions."""
    tools = get_tool_definitions()

    assert len(tools) == 1
    assert tools[0].name == "execute_sql"
    assert "query" in tools[0].inputSchema["properties"]
    assert tools[0].inputSchema["required"] == ["query"]


@patch("src.mysql_mcp_server.tools.sql_tools.execute_query")
def test_execute_sql_tool_select(mock_execute_query, test_db_config):
    """Test executing a SELECT query with the SQL tool."""
    # Setup mock
    mock_execute_query.return_value = ResultSet(
        columns=["id", "name", "value"],
        rows=[(1, "test1", 100), (2, "test2", 200)],
        affected_rows=2,
        query_type="SELECT",
    )

    # Execute tool
    result = execute_sql_tool(test_db_config, {"query": "SELECT * FROM test_table"})

    # Verify results
    assert len(result) == 1
    assert result[0].type == "text"
    assert result[0].text == "id,name,value\n1,test1,100\n2,test2,200"
    mock_execute_query.assert_called_once_with(test_db_config, "SELECT * FROM test_table")


@patch("src.mysql_mcp_server.tools.sql_tools.execute_query")
def test_execute_sql_tool_update(mock_execute_query, test_db_config):
    """Test executing an UPDATE query with the SQL tool."""
    # Setup mock
    mock_execute_query.return_value = ResultSet(columns=[], rows=[], affected_rows=2, query_type="UPDATE")

    # Execute tool
    result = execute_sql_tool(test_db_config, {"query": "UPDATE test_table SET value = 300"})

    # Verify results
    assert len(result) == 1
    assert result[0].type == "text"
    assert result[0].text == "Query executed successfully. Rows affected: 2"
    mock_execute_query.assert_called_once_with(test_db_config, "UPDATE test_table SET value = 300")


@patch("src.mysql_mcp_server.tools.sql_tools.execute_query")
def test_execute_sql_tool_error(mock_execute_query, test_db_config):
    """Test SQL tool with database error."""
    # Setup mock
    mock_execute_query.side_effect = DatabaseError("Test database error")

    # Execute tool
    result = execute_sql_tool(test_db_config, {"query": "INVALID QUERY"})

    # Verify results
    assert len(result) == 1
    assert result[0].type == "text"
    assert result[0].text == "Error executing query: Test database error"
    mock_execute_query.assert_called_once_with(test_db_config, "INVALID QUERY")


def test_execute_sql_tool_missing_query(test_db_config):
    """Test SQL tool with missing query."""
    # Execute tool
    result = execute_sql_tool(test_db_config, {})

    # Verify results
    assert len(result) == 1
    assert result[0].type == "text"
    assert result[0].text == "Query is required for execute_sql tool"
