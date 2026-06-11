#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import "dotenv/config";
import { TestRailClient, TestRailClientConfig } from "./client/api/index.js";
import { registerAllTools } from "./server/api/index.js";

// Validate TestRail configuration
if (
	!process.env.TESTRAIL_URL ||
	!process.env.TESTRAIL_USERNAME ||
	!process.env.TESTRAIL_API_KEY
) {
	throw new Error(
		"TESTRAIL_URL, TESTRAIL_USERNAME, and TESTRAIL_API_KEY must be set",
	);
}

// Correct URL format: https://example.testrail.com/index.php?/
const url = process.env.TESTRAIL_URL;
const baseURL = url.endsWith("/index.php?/")
	? url
	: url.endsWith("/")
		? `${url}index.php?/`
		: `${url}/index.php?/`;

// TestRail client configuration
const testRailConfig: TestRailClientConfig = {
	baseURL: baseURL,
	auth: {
		username: process.env.TESTRAIL_USERNAME,
		password: process.env.TESTRAIL_API_KEY,
	},
};

// Initialize TestRail client
const testRailClient = new TestRailClient(testRailConfig);

// Create McpServer
const server = new McpServer({
	name: "TestRail MCP Server",
	version: "1.0.0",
});

// Register all API tools
registerAllTools(server, testRailClient);

// Main execution
const main = async () => {
	try {
		console.error("Starting TestRail MCP Server (stdio mode)...");

		// Create and connect transport
		const transport = new StdioServerTransport();
		await server.connect(transport);

		console.error("TestRail MCP Server connected via stdio");
	} catch (error) {
		console.error("Error starting TestRail MCP Server:", error);
		process.exit(1);
	}
};

// Run the server
main();
