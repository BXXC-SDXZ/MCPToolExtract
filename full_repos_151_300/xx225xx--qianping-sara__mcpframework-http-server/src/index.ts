import dotenv from 'dotenv';
// Load environment variables specifically from .env.local
dotenv.config({ path: '.env.local' }); 

import { MCPServer } from "mcp-framework";
// Remove the WeatherTool import if it's not used elsewhere
// import WeatherTool from "./tools/WeatherTool.js"; 

// Read port from environment variable, fallback to 8080
const port = parseInt(process.env.PORT || "8080", 10);

const server = new MCPServer({
  transport: {
    type: "http-stream",
    options: {
      port: port,                // Use dynamic port
      endpoint: "/mcp",          // HTTP endpoint path (default: "/mcp")
      responseMode: "batch",     // Response mode: "batch" or "stream" (default: "batch")
      maxMessageSize: "4mb",     // Maximum message size (default: "4mb")
      batchTimeout: 30000,       // Timeout for batch responses in ms (default: 30000)
      headers: {                 // Custom headers for responses
        "X-Custom-Header": "value"
      },
      cors: {                    // CORS configuration
        allowOrigin: "*",
        allowMethods: "GET, POST, DELETE, OPTIONS",
        allowHeaders: "Content-Type, Accept, Authorization, x-api-key, Mcp-Session-Id, Last-Event-ID",
        exposeHeaders: "Content-Type, Authorization, x-api-key, Mcp-Session-Id",
        maxAge: "86400"
      },
      session: {                 // Session configuration
        enabled: true,           // Enable session management (default: true)
        headerName: "Mcp-Session-Id", // Session header name (default: "Mcp-Session-Id")
        allowClientTermination: true  // Allow clients to terminate sessions (default: true)
      },
      resumability: {            // Stream resumability configuration
        enabled: false,          // Enable stream resumability (default: false)
        historyDuration: 300000  // How long to keep message history in ms (default: 300000 - 5 minutes)
      }
    }
  }
});

await server.start();