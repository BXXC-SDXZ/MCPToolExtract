#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { http, createWalletClient, createPublicClient, PublicClient, Chain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as viemChains from 'viem/chains';

import "dotenv/config";

import { getMcpToolsList, handleCustomToolCall } from "./evm-tools.js";

if (!process.env.WALLET_PRIVATE_KEY) {
    console.error("Error: WALLET_PRIVATE_KEY environment variable is required");
    process.exit(1);
}

if (!process.env.RPC_PROVIDER_URL) {
    console.error("Error: RPC_PROVIDER_URL environment variable is required");
    process.exit(1);
}

/**
 * Sets up and returns Viem clients (wallet, public), the associated account, and the MCP server instance.
 * Dynamically detects the chain based on the RPC provider URL.
 * @returns An object containing the initialized clients, account, and server.
 * @throws If the chain ID cannot be detected or is not supported in viem/chains.
 */
async function initializeServerAndClients() {
    const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);
    const transport = http(process.env.RPC_PROVIDER_URL);

    // Dynamically detect chain
    const tempPublicClient = createPublicClient({ transport });
    const chainId = await tempPublicClient.getChainId();

    // Treat the values as unknown first, then filter and find
    const allExports = Object.values(viemChains) as unknown[]; // Assert as unknown[]

    const detectedChain = allExports.find((maybeChain): maybeChain is Chain => {
        if (typeof maybeChain !== 'object' || maybeChain === null) return false;
        const potentialChain = maybeChain as Record<string, unknown>; // Assert as Record for property checks
        return (
            typeof potentialChain.id === 'number' &&
            typeof potentialChain.name === 'string' &&
            typeof potentialChain.nativeCurrency === 'object' && // Check nativeCurrency is an object
            potentialChain.id === chainId
        );
    });

    if (!detectedChain) {
        throw new Error(`Chain with ID ${chainId} provided by RPC_PROVIDER_URL (${process.env.RPC_PROVIDER_URL}) was not found in supported viem/chains.`);
    }
    // Type assertion should now be safer after the find with checks
    const finalDetectedChain = detectedChain as Chain;

    const walletClient = createWalletClient({
        account: account,
        transport: transport,
        chain: finalDetectedChain, // Use asserted chain
    });
    const publicClient: PublicClient = createPublicClient({
        transport: transport,
        chain: finalDetectedChain, // Use asserted chain
    });

    const server = new Server(
        {
            name: "evm-mcp-server",
            version: "0.0.1",
        },
        {
            capabilities: {
                tools: {},
            },
        },
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return { tools: getMcpToolsList() };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        try {
            // Pass the dynamically created clients and account
            const result = await handleCustomToolCall(
                { walletClient, publicClient, account },
                request.params.name,
                request.params.arguments
            );
            // Wrap the result in the standard text content block structure
            return { content: [{ type: "text", text: JSON.stringify(result) }] };
        } catch (error: any) {
            console.error(`Error processing tool call ${request.params.name}:`, error);
            throw new Error(`Tool ${request.params.name} failed processing: ${error.message}`);
        }
    });

    return { walletClient, publicClient, account, server };
}

/**
 * Main entry point for the MCP server.
 * Calls initialization logic and then connects the stdio transport.
 */
async function main() {
    // Initialize first
    const { server } = await initializeServerAndClients();

    // Then connect transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
