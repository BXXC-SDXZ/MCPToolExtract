"""
MCP Geocoder Tool using the Google Maps Python SDK

This implementation demonstrates creating an MCP tool for geocoding
addresses using the official Google Maps Python client library.
"""

import os
import googlemaps

# MCP Server
from mcp.server.fastmcp import FastMCP

# Create an MCP server
mcp = FastMCP("Geocoder")

def get_gmaps_client():
    """
    Creates and returns a Google Maps client using the API key
    from environment variables.
    
    Returns:
        googlemaps.Client: Configured Google Maps client
        
    Raises:
        ValueError: If the API key is not set
    """
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_MAPS_API_KEY environment variable not set")
    return googlemaps.Client(key=api_key)


@mcp.tool()
def geocode(address: str) -> dict | str:
    '''
    Take a mailing address as a string, geocode it (look up the latitude and longitude of the address) 
    with google maps API and return a location object containing the latitude and longitude:
    {location['lat']}, Longitude: {location['lng']} or the string No results found.
    
    Args:
        address (str): The address to geocode
        
    Returns:
        dict: A dictionary with address, latitude, and longitude if successful
        str: An error message if geocoding failed
    '''
    try:
        # Get the google maps client
        gmaps = get_gmaps_client()
    except ValueError as e:
        return str(e)

    # Try getting the results of the address given by the AI
    try:
        result = gmaps.geocode(address)
    except Exception as e:
        return f"Geocoding failed: {e}"

    # If we get the lat/long, parse it and return a dict of the address, lat, and long
    if result:
        location = result[0]['geometry']['location']
        return {
            "address": address,
            "latitude": location['lat'],
            "longitude": location['lng']
        }
    else:
        # Otherwise, return no results found
        return "No results found."
