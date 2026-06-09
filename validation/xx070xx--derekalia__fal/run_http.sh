#!/bin/bash
# Run the fal.ai MCP server with Streamable HTTP transport

# Set the transport mode to HTTP (uses streamable-http in main.py)
export MCP_TRANSPORT=http

# Set the port (default 6274)
export PORT=${PORT:-6274}

# Load .env file if it exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set the FAL API key if provided as argument (overrides .env)
if [ -n "$1" ]; then
    export FAL_KEY="$1"
fi

echo "Starting fal.ai MCP server..."
echo ""
echo "Server endpoint: http://127.0.0.1:$PORT/mcp/"
echo ""
echo "To connect from your LLM IDE, add this to your MCP settings:"
echo '  "Fal": {'
echo '    "url": "http://127.0.0.1:'$PORT'/mcp/"'
echo '  }'
echo ""
echo "Note: This is an MCP API endpoint, not a web page. Connect via your IDE."
echo ""

# Run the server
uv run python main.py