/**
 * MCP Geocoder Tool using TypeScript and Google Maps SDK
 * 
 * This implementation demonstrates creating an MCP tool for geocoding
 * addresses using TypeScript and the Google Maps JavaScript client.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Client } from "@googlemaps/google-maps-services-js";
import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config();

// Create an MCP server
const server = new McpServer({
  name: "GeocoderNode",
  version: "1.0.0"
});

// Create a Google Maps client
const client = new Client({});

// Get API key from environment variables
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
if (!apiKey) {
  console.error("Error: GOOGLE_MAPS_API_KEY environment variable not set");
  process.exit(1);
}

// Geocode Tool using Google Maps API
server.tool(
    "geocode", 
    { address: z.string() },
    async ({ address }) => {
        try {
            // Call the Google Maps Geocoding API
            const response = await client.geocode({ 
                params: { 
                    address, 
                    key: apiKey
                }
            });
            
            // Check if we got results
            if (response.data.results && response.data.results.length > 0) {
                const location = response.data.results[0].geometry.location;
                
                // Return the geocoding result
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify({
                            address: address,
                            latitude: location.lat,
                            longitude: location.lng
                        })
                    }]
                };
            } else {
                // No results found
                return {
                    content: [{ 
                        type: "text", 
                        text: "No results found."
                    }]
                };
            }
        } catch (error) {
            // Handle errors
            return {
                content: [{ 
                    type: "text", 
                    text: `Geocoding failed: ${error}`
                }]
            };
        }
    }
);

// Connect the server to standard I/O
const transport = new StdioServerTransport();
await server.connect(transport);
