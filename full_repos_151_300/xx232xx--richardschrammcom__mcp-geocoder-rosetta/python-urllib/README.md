# MCP Geocoder - Python with urllib

This implementation uses Python's standard library (`urllib`) to create an MCP geocoder tool with minimal dependencies.

## Features

- Uses standard Python library for HTTP requests
- Direct REST API calls to Google Maps Geocoding API
- Minimal dependencies
- Simple error handling

## Setup

1. **Create a virtual environment**:

```bash
# Using uv (recommended)
uv venv -p 3.13 .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Or using standard venv
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. **Install dependencies**:

```bash
# Using pyproject.toml with uv
uv pip install -e .

# Or using pyproject.toml with pip
pip install -e .
```

3. **Configure your Google Maps API key**:

```bash
# Set environment variable
export GOOGLE_MAPS_API_KEY="your-api-key-here"

# Or create a .env file and use python-dotenv to load it
echo "GOOGLE_MAPS_API_KEY=your-api-key-here" > .env
# Then in your code: from dotenv import load_dotenv; load_dotenv()
```

## Usage

Run the MCP server:

```bash
# Using uv
uv run mcp serve geocoder.py

# Or using standard python
python -m mcp serve geocoder.py
```

## How It Works

This implementation makes direct HTTP requests to the Google Maps Geocoding API using Python's standard library. The benefits include:

1. Minimal dependencies, making it lightweight and easy to deploy
2. Straightforward implementation, easy to understand and modify
3. Full control over the API interaction

The implementation:
1. Constructs the geocoding API URL with the address and API key
2. Sends an HTTP GET request to the Google Maps API
3. Parses the JSON response and extracts latitude and longitude
4. Returns the result in a standardized format

## Error Handling

The implementation includes:
- Try/except blocks to catch any errors during the request
- Status code checking from the Google Maps API response
- Standardized error reporting format
