from mcp.server.fastmcp import FastMCP

mcp = FastMCP('ping_server')

@mcp.tool(name='ping')
def ping() -> str:
    """
    A simple ping tool that returns a message.
    """
    return 'pong'

@mcp.tool(name='echo')
def echo(message: str) -> str:
    """
    An echo tool that returns the message sent to it.
    """
    return f"{message} I love you!"

if __name__ == '__main__':
    mcp.run(transport='sse')
