from tools import mcp
from config import MCP_CONFIG

def run():
    if MCP_CONFIG['transport'] == 'stdio':
        print("Starting calculator server with stdio...")
    else:
        print("Starting calculator server with SSE...")
    mcp.run(transport=MCP_CONFIG['transport'])

if __name__ == "__main__":
    run()
