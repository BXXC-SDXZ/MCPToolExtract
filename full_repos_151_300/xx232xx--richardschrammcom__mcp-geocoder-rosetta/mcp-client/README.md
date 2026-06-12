# MCP Client

This directory contains an MCP client implementation that can connect to the geocoder servers in this repository.

## Prerequisites

- Python 3.13+
- `uv` package manager
- Google Maps API key (for geocoder servers)

## Setup

Before running the client, you need to set up your environment:

1. Create a `.env` file in this directory with your API keys:
   ```
   ANTHROPIC_API_KEY=your-anthropic-api-key
   ```

2. Create a `.env` file in each server directory with your Google Maps API key:
   ```
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

3. Run the setup script for the implementation you want to use:
   ```bash
   # For the Python + urllib implementation
   python setup_env.py --server urllib
   
   # For the Python + Google Maps SDK implementation
   python setup_env.py --server googlemaps
   
   # For the TypeScript implementation
   python setup_env.py --server typescript
   ```

## Running the Client

Use the wrapper script to run the client with the correct environment:

```bash
# For Python implementations
python run_client.py ../python-urllib/geocoder.py
# OR
python run_client.py ../python-googlemaps/geocoder.py

# For TypeScript (requires starting the server separately)
cd ../typescript-googlemaps && npm start
# In another terminal
cd ../mcp-client && python run_client.py ../typescript-googlemaps/geocoder.ts
```

## Troubleshooting

If you encounter an error like `ModuleNotFoundError: No module named 'googlemaps'`:

1. Make sure you've run the setup script for the correct implementation
2. Install the missing module manually:
   ```bash
   uv pip install googlemaps
   ```

If the client can't connect to the server, check:
1. The server script is running and accessible
2. The `.env` files are properly configured
3. The path to the server script is correct

## How It Works

The client:
1. Connects to an MCP server specified by the server script path
2. Lists available tools from the server
3. Processes user queries using Claude 3.5 Sonnet
4. Executes tool calls as needed using the MCP server
5. Returns the results to the user

## Environment Variables

- `ANTHROPIC_API_KEY`: Required for the client to use Claude API
- `GOOGLE_MAPS_API_KEY`: Required for geocoder servers to use Google Maps API