# evm-mcp

An MCP (Model Context Protocol) server that exposes EVM blockchain tools to AI assistants. Built with [viem](https://viem.sh/) and the [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk), it lets any MCP-compatible client (Claude Desktop, etc.) read balances and send ETH on local EVM chains.

## Tools
  
| Tool | Description | Parameters |
|------|-------------|------------|
| `get-eth-balance` | Fetch the ETH balance of any address | `address` — the wallet address |
| `send-eth` | Send ETH from the configured wallet to another address | `toAddress`, `amount` (in ETH) |

## Supported Chains

Currently supports local development chains via viem:
  
- `anvil` (chain ID `31337`)
- `localhost` (chain ID `1337`)

The active chain is selected at startup via the `CHAIN_ID` environment variable.

## Prerequisites

- Node.js 18+
- A running local EVM node (e.g. [Anvil](https://book.getfoundry.sh/anvil/) from Foundry)

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Build**

```bash
npm run build
```

**3. Set environment variables**

```bash
export CHAIN_ID=31337        # Chain ID of your local node
export PRIVATE_KEY=0x...     # Private key of the signing wallet
```

## Usage

Run the server directly:

```bash
node build/index.js
```

The server communicates over stdio using the MCP protocol.

### Claude Desktop integration

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "evm": {
      "command": "node",
      "args": ["/path/to/evm-mcp/build/index.js"],
      "env": {
        "CHAIN_ID": "31337",
        "PRIVATE_KEY": "0x<your-private-key>"
      }
    }
  }
}
```

## Development

```bash
# Compile TypeScript in watch mode
npx tsc --watch
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@modelcontextprotocol/sdk` | MCP server framework |
| `viem` | EVM client (balance queries, transaction sending) |
| `zod` | Tool parameter validation |
