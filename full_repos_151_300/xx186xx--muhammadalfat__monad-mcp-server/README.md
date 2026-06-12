# Monad MCP Tutorial

This project demonstrates how to create a MCP server that interacts with the Monad testnet. The MCP server provides a tool for checking MON token balances on the Monad testnet.

## What is MCP?

The Model Context Protocol (MCP) is a standard that allows AI models to interact with external tools and services. 

In this tutorial, we're creating an MCP server that allows MCP Client (Claude Desktop) to query Monad testnet to check MON balance of an account.

## How to Run?

</> npm i
</> run server: npx tsx src/server.ts
</> run client:  npx tsx src/client.ts