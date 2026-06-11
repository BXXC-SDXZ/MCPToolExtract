from mcp.server import FastMCP
import logging
import os

# 配置日志
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("simple-mcp-server")

# 设置端口
port = int(os.getenv("MCP_PORT", "8823"))
host = os.getenv("MCP_HOST", "127.0.0.1")

# 创建 MCP 服务器
mcp = FastMCP("Simple MCP", host=host, port=port)

@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers"""
    logger.info(f"Adding {a} + {b}")
    return a + b

@mcp.tool()
def hello(name: str) -> str:
    """Say hello to someone"""
    logger.info(f"Saying hello to {name}")
    return f"Hello, {name}!"

@mcp.resource("greeting://{name}")
def get_greeting(name: str) -> str:
    """Get a personalized greeting"""
    logger.info(f"Getting greeting for {name}")
    return f"Hello, {name}!"

if __name__ == "__main__":
    logger.info(f"Starting simple MCP server on {host}:{port}")
    mcp.run() 