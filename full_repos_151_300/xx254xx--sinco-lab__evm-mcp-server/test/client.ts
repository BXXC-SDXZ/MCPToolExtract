import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport, StdioServerParameters } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main function for the example MCP client.
 * This function demonstrates how to:
 * 1. Configure connection parameters for a StdioServer.
 * 2. Establish a connection using StdioClientTransport.
 * 3. Initialize a Client session.
 * 4. List available tools from the server.
 * 5. Call a tool (e.g., getChain, getBalance).
 * 6. Handle potential errors.
 * 7. Clean up the connection.
 */
async function main() {
    // const exitStack = new AsyncExitStack(); // Temporarily commented out
    let session: Client | null = null;
    let stdioTransport: StdioClientTransport | null = null;

    try {
        // --- 1. Configure Server Connection ---
        // Assuming evm.ts compiles to build/evm.js
        const serverScriptPath = path.resolve(__dirname, '../build/evm.js');
        console.log(`Attempting to connect to server script: ${serverScriptPath}`);

        const serverParams: StdioServerParameters = {
            command: "node", // Command to run the server
            args: [serverScriptPath], // Arguments to the command (path to script)
        };
        // --- 2. Establish Connection ---
        console.log("Connecting to server via stdio...");
        stdioTransport = new StdioClientTransport(serverParams);

        // --- 3. Initialize Session ---
        // Initialize Client first with name/version
        session = new Client({ name: "evm-mcp-client", version: "1.0.0" }); // Correct initialization

        // Connect the client to the transport
        await session.connect(stdioTransport); // Correct connection method
        console.log("Session connected.");

        // --- 4. List Tools ---
        console.log("\nListing available tools...");
        const listToolsResponse = await session.listTools();
        const toolNames = listToolsResponse.tools.map((tool: any) => tool.name);
        console.log("Available tools:", toolNames);

        if (toolNames.length === 0) {
            console.warn("Server reported no available tools.");
            return; // Exit if no tools
        }

        // --- 5. Call a Tool (e.g., getChain) ---
        const toolToCall = "getChain"; // Choose a simple tool
        if (toolNames.includes(toolToCall)) {
            console.log(`\nCalling tool: ${toolToCall}...`);
            const callToolResponse = await session.callTool({ name: toolToCall, arguments: {} });
            console.log(`Tool '${toolToCall}' response:`);
            console.log(JSON.stringify(callToolResponse, null, 2));
        } else {
            console.warn(`Tool '${toolToCall}' not found in available tools.`);
        }

        const toolToCall2 = "getBalance"; // Choose a simple tool
        if (toolNames.includes(toolToCall2)) {
            console.log(`\nCalling tool: ${toolToCall2}...`);
            const callToolResponse = await session.callTool({ name: toolToCall2, arguments: { address: "0xBD18392e1648f892A323576f0a6cC70970fb3AcE" } });
            console.log(`Tool '${toolToCall2}' response:`);
            console.log(JSON.stringify(callToolResponse, null, 2));
        } else {
            console.warn(`Tool '${toolToCall2}' not found in available tools.`);
        }
    } catch (error: any) {
        // --- 6. Handle Errors ---
        console.error("\nClient encountered an error:");
        // Check if it's an MCPError for structured details
        if (error.name === 'McpError' || error.constructor?.name === 'McpError') {
             console.error(`  Type: ${error.type}`);
             console.error(`  Message: ${error.message}`);
             if(error.data) console.error(`  Data: ${JSON.stringify(error.data)}`);
        } else {
            // Generic error
            console.error(`  Error: ${error.message}`);
            console.error(error.stack); // Print stack for generic errors
        }
    } finally {
        // --- 7. Cleanup ---
        console.log("\nClosing client connection...");
        // Reinstate manual transport close
        if (stdioTransport && typeof stdioTransport.close === 'function') {
             await stdioTransport.close(); // Uncommented and kept await
        }
        // await exitStack.close(); // Keep commented out
        console.log("Client finished.");
    }
}

main().catch(err => {
    console.error("Unhandled error in main:", err);
    process.exit(1);
}); 