# MCP Geocoder - Python with Google Maps SDK

This implementation uses the official Google Maps Python client library to create an MCP geocoder tool.

## Features

- Uses the official Google Maps Python SDK
- Enhanced error handling
- Object-oriented approach with clean separation of concerns

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

# If you need to install specific versions or for development
uv pip install googlemaps>=4.10.0 mcp[cli]>=1.6.0
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

This implementation leverages the official Google Maps Python client library, which provides several advantages:

1. Simplified API interaction with built-in error handling
2. Enhanced response parsing with proper type handling
3. Automatic validation of requests

The implementation:
1. Creates a Google Maps client with your API key
2. Uses the client's geocode method to look up the address
3. Extracts location data from the response
4. Returns a standardized result format

## Error Handling

The implementation includes:
- Exception handling for geocoding failures
- Validation of response data
- Proper error messages for common failure scenarios
