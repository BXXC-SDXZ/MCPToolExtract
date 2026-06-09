# fal MCP Server

A Model Context Protocol (MCP) server for interacting with fal.ai models and services. This project was inspired by [am0y's MCP server](https://github.com/am0y), but updated to use the latest streaming MCP support.

## Features

- List all available fal.ai models
- Search for specific models by keywords
- Get model schemas
- Generate content using any fal.ai model
- Support for both direct and queued model execution
- Queue management (status checking, getting results, cancelling requests)
- File upload to fal.ai CDN
- Full streaming support via HTTP transport

## Requirements

- Python 3.12+
- fastmcp
- httpx
- aiofiles
- A fal.ai API key

## Installation

1. Clone this repository:
```bash
git clone https://github.com/derekalia/fal.git
cd fal
```

2. Install the required packages:
```bash
# Using uv (recommended)
uv sync

# Or using pip
pip install fastmcp httpx aiofiles
```

## Usage

### Running the Server Locally

1. Get your fal.ai API key from [fal.ai](https://fal.ai)

2. Start the MCP server with HTTP transport:
```bash
./run_http.sh YOUR_FAL_API_KEY
```

The server will start and display connection information in your terminal.

3. Connect to it from your LLM IDE (Claude Code or Cursor) by adding to your configuration:

```json
{
  "Fal": {
    "url": "http://127.0.0.1:6274/mcp/"
  }
}
```

### Development Mode (with MCP Inspector)

For testing and debugging, you can run the server in development mode:

```bash
fastmcp dev main.py
```

This will:
- Start the server on a random port
- Launch the MCP Inspector web interface in your browser
- Allow you to test all tools interactively with a web UI

The Inspector URL will be displayed in the terminal (typically `http://localhost:PORT`).

### Environment Variables

The `run_http.sh` script automatically handles all environment variables for you. If you need to customize:

- `PORT`: Server port for HTTP transport (default: 6274)

#### Setting API Key Permanently

If you prefer to set your API key permanently instead of passing it each time:

1. Create a `.env` file in the project root:
```bash
echo 'FAL_KEY="YOUR_FAL_API_KEY_HERE"' > .env
```

2. Then run the server without the API key argument:
```bash
./run_http.sh
```

For manual setup:
- `FAL_KEY`: Your fal.ai API key (required)
- `MCP_TRANSPORT`: Transport mode - `stdio` (default) or `http`

## Available Tools

- `models(page=None, total=None)` - List available models with optional pagination
- `search(keywords)` - Search for models by keywords
- `schema(model_id)` - Get OpenAPI schema for a specific model
- `generate(model, parameters, queue=False)` - Generate content using a model
- `result(url)` - Get result from a queued request
- `status(url)` - Check status of a queued request
- `cancel(url)` - Cancel a queued request
- `upload(path)` - Upload a file to fal.ai CDN

## License

[MIT](LICENSE)