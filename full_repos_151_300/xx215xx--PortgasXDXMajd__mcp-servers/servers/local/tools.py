from mcp.server.fastmcp import FastMCP
from config import MCP_CONFIG
import os

mcp = FastMCP(
    name=MCP_CONFIG['name'],
    host=MCP_CONFIG['host'],
    port=MCP_CONFIG['port']
)

@mcp.tool()
def get_current_dir() -> str:
    """
    Returns the current working directory.
    """
    return os.getcwd()


@mcp.tool()
def read_file(file_path: str) -> str:
    """
    Reads the contents of a file at the given path.
    """
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()
    

@mcp.tool()
def write_file(file_path: str, content: str) -> str:
    """
    Writes content to a file at the given path.
    """
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    return f"Successfully wrote to {file_path}"


@mcp.tool()
def list_dir(path: str = '.') -> list:
    """
    Lists files and directories in the specified path.
    """
    if not os.path.isdir(path):
        raise NotADirectoryError(f"Not a directory: {path}")
    return os.listdir(path)


@mcp.tool()
def append_to_file(file_path: str, content: str) -> str:
    """
    Appends content to a file at the given path.
    """
    with open(file_path, 'a', encoding='utf-8') as f:
        f.write(content)
    return f"Successfully appended to {file_path}"

