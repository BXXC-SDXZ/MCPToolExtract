# ICICI Direct MCP Server

A simple HTTP-wrapped MCP server for accessing ICICI Direct Breeze API.

## Quick Start

1. Set your API key in an environment variable:
export ICICI_API_KEY=your_api_key_here



2. Install dependencies:
pip install -r requirements.txt



3. Run the server:
python server.py



The server will be available at http://localhost:8080.

## API Endpoints

- `GET /info` - Get information about available tools
- `POST /tools/call` - Call a tool with parameters
- `POST /tools/{tool_name}` - Direct endpoint for each tool

## Docker Usage

Build and run with Docker:

docker build -t icici-direct-mcp-server . docker run -p 8080:8080 -e ICICI_API_KEY=your_api_key_here icici-direct-mcp-server



## Cloud Run Deployment

gcloud builds submit --tag gcr.io/YOUR-PROJECT/icici-direct-mcp-server gcloud run deploy icici-direct-mcp-server
--image gcr.io/YOUR-PROJECT/icici-direct-mcp-server
--platform managed
--set-env-vars="ICICI_API_KEY=your_api_key_here"



