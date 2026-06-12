import pytest

from src.mysql_mcp_server.config.settings import DatabaseConfig, get_db_config


def test_database_config_from_env(mock_env_vars):
    """Test creating DatabaseConfig from environment variables."""
    config = DatabaseConfig.from_env()

    assert config.host == "localhost"
    assert config.port == 3306
    assert config.user == "testuser"
    assert config.password == "testpass"
    assert config.database == "testdb"


def test_database_config_to_dict(test_db_config):
    """Test converting DatabaseConfig to dictionary."""
    config_dict = test_db_config.to_dict()

    assert config_dict["host"] == test_db_config.host
    assert config_dict["port"] == test_db_config.port
    assert config_dict["user"] == test_db_config.user
    assert config_dict["password"] == test_db_config.password
    assert config_dict["database"] == test_db_config.database


def test_database_config_get_display_info(test_db_config):
    """Test getting display info without sensitive data."""
    display_info = test_db_config.get_display_info()

    assert display_info["host"] == test_db_config.host
    assert display_info["port"] == test_db_config.port
    assert display_info["user"] == test_db_config.user
    assert display_info["password"] == "********"  # Password should be masked
    assert display_info["database"] == test_db_config.database


def test_get_db_config(mock_env_vars):
    """Test getting database configuration."""
    config = get_db_config()

    assert isinstance(config, DatabaseConfig)
    assert config.host == "localhost"
    assert config.port == 3306
    assert config.user == "testuser"
    assert config.password == "testpass"
    assert config.database == "testdb"


def test_database_config_missing_values(monkeypatch):
    """Test error when required configuration is missing."""
    # Clear environment variables
    monkeypatch.delenv("MYSQL_USER", raising=False)
    monkeypatch.delenv("MYSQL_PASSWORD", raising=False)
    monkeypatch.delenv("MYSQL_DATABASE", raising=False)

    # Set empty values
    monkeypatch.setenv("MYSQL_USER", "")

    with pytest.raises(ValueError, match="Missing required database configuration"):
        DatabaseConfig.from_env()
