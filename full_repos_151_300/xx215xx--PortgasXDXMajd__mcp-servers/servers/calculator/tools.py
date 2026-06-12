from mcp.server.fastmcp import FastMCP
from config import MCP_CONFIG

mcp = FastMCP(
    name=MCP_CONFIG['name'],
    host=MCP_CONFIG['host'],
    port=MCP_CONFIG['port']
)

@mcp.tool()
def add(a: int, b: int) -> int:
    return a + b

@mcp.tool()
def subtract(a: int, b: int) -> int:
    return a - b

@mcp.tool()
def multiply(a: int, b: int) -> int:
    return a * b

@mcp.tool()
def divide(a: int, b: int) -> float:
    if b == 0:
        raise ValueError("Cannot divide by zero.")
    return a / b
