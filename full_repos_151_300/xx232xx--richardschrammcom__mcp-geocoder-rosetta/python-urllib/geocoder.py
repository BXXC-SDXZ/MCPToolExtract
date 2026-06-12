"""
MCP Geocoder Tool using Python's standard library (urllib)

This implementation demonstrates creating an MCP tool for geocoding
addresses using only the Python standard library without additional
dependencies beyond the MCP SDK.
"""

import sys
import os
import json
from urllib.parse import urlencode
from urllib.request import urlopen

# Debug output to stderr so it doesn't interfere with MCP protocol
print("[SERVER DEBUG] Starting geocoder.py server script", file=sys.stderr)

try:
    print("[SERVER DEBUG] Importing MCP libraries", file=sys.stderr)
    from mcp.server.fastmcp import FastMCP
    print("[SERVER DEBUG] MCP libraries imported successfully", file=sys.stderr)
except ImportError as e:
    print(f"[SERVER DEBUG] Error importing MCP libraries: {e}", file=sys.stderr)
    raise
    
# Create MCP server
print("[SERVER DEBUG] Creating FastMCP server instance", file=sys.stderr)
mcp = FastMCP("GeocoderREST")
print("[SERVER DEBUG] FastMCP server instance created successfully", file=sys.stderr)

# Add a debug function that can be called directly for testing
@mcp.tool()
def debug_info() -> dict:
    '''
    Returns debug information about the server for testing connectivity.
    '''
    print("[SERVER DEBUG] Debug info tool called", file=sys.stderr)
    return {
        "server_name": "GeocoderREST",
        "python_version": sys.version,
        "working_directory": os.getcwd(),
        "env_vars": {k: v for k, v in os.environ.items() if k in [
            "GOOGLE_MAPS_API_KEY", "PYTHONPATH", "PYTHONUNBUFFERED"
        ]},
        "timestamp": __import__("datetime").datetime.now().isoformat()
    }

@mcp.tool()
def geocode(address: str) -> dict | str:
    '''
    Take a mailing address as a string, geocode it (look up the latitude and longitude of the address) 
    with google maps API and return  a location object containing the latitude and longitude:
    {location['lat']}, Longitude: {location['lng']} or the string No results found.
    '''
    print(f"[SERVER DEBUG] Geocode tool called with address: {address}", file=sys.stderr)
    
    # Get API key from environment variables
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if not api_key:
        print("[SERVER DEBUG] GOOGLE_MAPS_API_KEY environment variable not set", file=sys.stderr)
        return "Error: GOOGLE_MAPS_API_KEY environment variable not set"
    else:
        print(f"[SERVER DEBUG] Using API key: {api_key[:4]}...{api_key[-4:] if len(api_key) > 8 else ''}", file=sys.stderr)
    
    # Construct the Google Maps Geocoding API URL
    params = urlencode({"address": address, "key": api_key})
    url = f"https://maps.googleapis.com/maps/api/geocode/json?{params}"
    
    # Log the URL to stderr (for debugging)
    print(f"[SERVER DEBUG] ➡️ Request URL: {url}", file=sys.stderr)

    try:
        # Make the HTTP request to the Google Maps API
        print("[SERVER DEBUG] Making HTTP request to Google Maps API", file=sys.stderr)
        with urlopen(url) as response:
            print(f"[SERVER DEBUG] Got response with status: {response.status}", file=sys.stderr)
            data = json.load(response)
            print(f"[SERVER DEBUG] Parsed JSON response, status: {data.get('status')}", file=sys.stderr)
    except Exception as e:
        print(f"[SERVER DEBUG] Error making request: {e}", file=sys.stderr)
        return f"Geocoding failed: {e}"

    # Parse the response and extract location data
    if data.get("status") == "OK":
        location = data["results"][0]["geometry"]["location"]
        result = {
            "address": address,
            "latitude": location["lat"],
            "longitude": location["lng"]
        }
        print(f"[SERVER DEBUG] Returning successful result: {result}", file=sys.stderr)
        return result
    else:
        error_msg = f"No results: {data.get('status')}"
        print(f"[SERVER DEBUG] Returning error: {error_msg}", file=sys.stderr)
        return error_msg
