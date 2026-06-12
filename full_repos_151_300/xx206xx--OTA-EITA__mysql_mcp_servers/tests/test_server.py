from unittest.mock import MagicMock, patch

import pytest
from pydantic import AnyUrl

from src.mysql_mcp_server.config.settings import DatabaseConfig
from src.mysql_mcp_server.database.connection import ResultSet
from src.mysql_mcp_server.database.errors import DatabaseError
from src.mysql_mcp_server.server import app, call_tool, list_resources, list_tools, read_resource


def test_server_initialization():
    """Test that the server initializes correctly."""
    assert app.name == "mysql_mcp_server"


@pytest.mark.asyncio
async def test_list_tools():
    """Test that list_tools returns expected tools."""
    tools = await list_tools()
    assert len(tools) == 1
    assert tools[0].name == "execute_sql"
    assert "query" in tools[0].inputSchema["properties"]
    assert tools[0].inputSchema["required"] == ["query"]


@pytest.mark.asyncio
async def test_call_tool_invalid_name():
    """Test calling a tool with an invalid name."""
    with pytest.raises(ValueError, match="Unknown tool"):
        await call_tool("invalid_tool", {})


@pytest.mark.asyncio
@patch("src.mysql_mcp_server.server.get_db_config")
@patch("src.mysql_mcp_server.server.execute_sql_tool")
async def test_call_tool_execute_sql(mock_execute_sql_tool, mock_get_db_config):
    """Test calling execute_sql tool."""
    # Setup mocks
    mock_config = MagicMock(spec=DatabaseConfig)
    mock_get_db_config.return_value = mock_config
    mock_execute_sql_tool.return_value = [{"type": "text", "text": "Query executed successfully"}]

    # Call the function
    result = await call_tool("execute_sql", {"query": "SELECT 1"})

    # Verify results
    mock_get_db_config.assert_called_once()
    mock_execute_sql_tool.assert_called_once_with(mock_config, {"query": "SELECT 1"})
    assert result == [{"type": "text", "text": "Query executed successfully"}]


@pytest.mark.asyncio
@patch("src.mysql_mcp_server.server.get_db_config")
@patch("src.mysql_mcp_server.server.execute_query")
async def test_list_resources_success(mock_execute_query, mock_get_db_config, test_db_config):
    """Test listing resources successfully."""
    # Setup mocks
    mock_get_db_config.return_value = test_db_config
    mock_result = ResultSet(
        columns=["Tables_in_testdb"], rows=[("test_table",), ("users",)], affected_rows=2, query_type="SHOW"
    )
    mock_execute_query.return_value = mock_result

    # Call the function
    resources = await list_resources()

    # Verify results
    assert len(resources) == 2
    assert str(resources[0].uri) == "mysql://test_table/data"
    assert resources[0].name == "Table: test_table"
    assert str(resources[1].uri) == "mysql://users/data"
    assert resources[1].name == "Table: users"
    mock_execute_query.assert_called_once_with(test_db_config, "SHOW TABLES")


@pytest.mark.asyncio
@patch("src.mysql_mcp_server.server.get_db_config")
@patch("src.mysql_mcp_server.server.execute_query")
async def test_list_resources_database_error(mock_execute_query, mock_get_db_config, test_db_config):
    """Test listing resources with database error."""
    # Setup mocks
    mock_get_db_config.return_value = test_db_config
    mock_execute_query.side_effect = DatabaseError("Test database error")

    # Call the function
    resources = await list_resources()

    # Verify results
    assert resources == []
    mock_execute_query.assert_called_once_with(test_db_config, "SHOW TABLES")


@pytest.mark.asyncio
@patch("src.mysql_mcp_server.server.get_db_config")
@patch("src.mysql_mcp_server.server.execute_query")
async def test_read_resource_success(mock_execute_query, mock_get_db_config, test_db_config):
    """Test reading resource successfully."""
    # Setup mocks
    mock_get_db_config.return_value = test_db_config
    mock_result = ResultSet(
        columns=["id", "name", "value"],
        rows=[(1, "test1", 100), (2, "test2", 200)],
        affected_rows=2,
        query_type="SELECT",
    )
    mock_execute_query.return_value = mock_result

    # Call the function
    uri = AnyUrl.build(scheme="mysql", host="test_table", path="/data")
    content = await read_resource(uri)

    # Verify results
    assert content == "id,name,value\n1,test1,100\n2,test2,200"
    mock_execute_query.assert_called_once_with(test_db_config, "SELECT * FROM test_table LIMIT 100")


@pytest.mark.asyncio
async def test_read_resource_invalid_uri():
    """Test reading resource with invalid URI."""
    uri = AnyUrl.build(scheme="http", host="example.com")
    with pytest.raises(ValueError, match="Invalid URI scheme"):
        await read_resource(uri)


@pytest.mark.asyncio
@patch("src.mysql_mcp_server.server.get_db_config")
@patch("src.mysql_mcp_server.server.execute_query")
async def test_read_resource_database_error(mock_execute_query, mock_get_db_config, test_db_config):
    """Test reading resource with database error."""
    # Setup mocks
    mock_get_db_config.return_value = test_db_config
    mock_execute_query.side_effect = DatabaseError("Test database error")

    # Call the function
    uri = AnyUrl.build(scheme="mysql", host="test_table", path="/data")
    with pytest.raises(RuntimeError, match="Database error"):
        await read_resource(uri)

    mock_execute_query.assert_called_once_with(test_db_config, "SELECT * FROM test_table LIMIT 100")
