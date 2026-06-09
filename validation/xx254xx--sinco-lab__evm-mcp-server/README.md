[中文文档](README.zh.md)

# @sinco-lab/evm-mcp-server

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen)
![Viem](https://img.shields.io/badge/Viem-2.x-green)
![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.x-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)

An EVM interaction service gateway based on Model Context Protocol (MCP) and Viem, enabling AI agents or services to securely interact with a configured EVM-compatible blockchain.

## 📋 Contents

- [Overview](#-overview)
- [Features](#-features)
- [Prerequisites](#️-prerequisites)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Usage](#-usage)
- [Connecting from Clients (Cursor, Claude)](#-connecting-from-clients-cursor-claude)
- [Available Tools](#-available-tools)
- [Security Considerations](#-security-considerations)
- [Project Structure](#-project-structure)
- [Development Scripts](#️-development-scripts)
- [License](#-license)

## 🔭 Overview

This project provides a Model Context Protocol (MCP) server designed to act as a gateway for interacting with an EVM-compatible blockchain. It leverages the powerful [Viem](https://viem.sh/) library for blockchain interactions and the [MCP SDK](https://github.com/modelcontextprotocol/sdk) to expose these capabilities as tools consumable by AI agents or other MCP clients.

The server connects to a specific EVM chain configured via environment variables and allows clients to perform various read and write operations through a standardized MCP interface.

## ✨ Features

- **MCP Integration**: Exposes EVM functionalities as standard MCP tools.
- **Viem Powered**: Utilizes the modern and efficient Viem library for reliable EVM interactions.
- **Configurable Endpoint**: Connects to any EVM-compatible chain via an RPC URL defined in the environment setup.
- **Core EVM Operations**: Provides tools for common tasks like checking balances, transferring native tokens and ERC20 tokens, signing messages, and interacting with contracts (reading allowance, approving, etc.).
- **Type Safe**: Developed entirely in TypeScript for better maintainability and developer experience.

## 🛠️ Prerequisites

- [Node.js](https://nodejs.org/) version 18.0.0 or higher.
- [pnpm](https://pnpm.io/installation) package manager.

## 📦 Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/sinco-lab/evm-mcp-server.git
    cd evm-mcp-server
    ```
2.  Install dependencies using pnpm:
    ```bash
    pnpm install
    ```

## ⚙️ Configuration

Configuration is primarily handled via environment variables. The server requires:

*   `WALLET_PRIVATE_KEY`: The private key (starting with `0x`) of the wallet the server will use. **Keep this secure!**
*   `RPC_PROVIDER_URL`: The JSON-RPC endpoint URL for the target EVM network.

These can be provided either through a `.env` file (for testing client and debugging) or directly within the client's MCP server configuration (see below).

## 🚀 Usage

### Build the Project

Compile the TypeScript source code into JavaScript:

```bash
pnpm run build
```
This command generates the `build` directory containing `build/evm.js`.

### Start the MCP Server Manually (Stdio Mode)

If using a `.env` file for configuration:
1.  Copy `.env.example` to `.env`.
2.  Fill in `WALLET_PRIVATE_KEY` and `RPC_PROVIDER_URL` in `.env`.
3.  Run the server:
    ```bash
    # Loads .env automatically if available in current or parent dirs
    node build/evm.js
    ```
    *(Note: `node` itself doesn't source `.env`, but the `dotenv` package used in `src/evm.ts` does)*

### Run the Example Test Client

This project includes a simple test client (`test/client.ts`) that uses `StdioClientTransport` to automatically start the server process (`node build/evm.js`) based on its configuration.

**Prerequisites:**
1.  Build the project: `pnpm run build`
2.  Create and configure your `.env` file (the client script sources this).

Run the client:
```bash
pnpm run test
```
This command uses `tsx` (via `package.json`) to execute `test/client.ts`. The client script will read `.env`, start the server process, connect to it via stdio, list available tools, and call the `getChain` tool.

### Debugging with MCP Inspector

Requires a configured `.env` file and built project.

```bash
pnpm run debug
```
This script sources the `.env` file and launches the inspector connected to the server script (`build/evm.js`), passing necessary environment variables.

## 🔌 Connecting from Clients (Cursor, Claude)

You can configure clients like Cursor or the Claude Desktop app to automatically start and connect to this MCP server.

**Prerequisites:**

1.  Install dependencies: `pnpm install`
2.  Build the project: `pnpm run build`

**Security Warning:**
The following configurations involve placing your `WALLET_PRIVATE_KEY` and `RPC_PROVIDER_URL` directly into configuration files (`.cursor/mcp.json` or `claude_desktop_config.json`). These files might be stored in less secure ways than a `.env` file and could potentially be synced or backed up unintentionally. **Understand the risks before placing sensitive information directly in these configuration files.** For higher security needs, explore alternative key management strategies not covered here.

#### Common `mcpServers` Configuration Structure

The following is the basic JSON structure needed to configure the MCP server, usable for both Cursor and Claude Desktop:

```json
// Common mcpServers structure
{
  "mcpServers": {
    // Option 1: Run locally built server
    "local-evm-mcp-dev": {
      "command": "node", // Use node directly
      "args": [
        "/path/to/your/project/build/evm.js" // Use absolute path
      ],
      "env": {
        // WARNING: Security risk! Use a new key (see Security Considerations).
        "WALLET_PRIVATE_KEY": "0xYOUR_PRIVATE_KEY_HERE",
        "RPC_PROVIDER_URL": "YOUR_RPC_PROVIDER_URL_HERE"
      },
    },
    // Option 2: Run published package via npx (if applicable)
    "npx-evm-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@sinco-lab/evm-mcp-server" // Use your published package name
      ],
      "env": {
        // WARNING: Security risk! Use a new key (see Security Considerations).
        "WALLET_PRIVATE_KEY": "0xYOUR_PRIVATE_KEY_HERE",
        "RPC_PROVIDER_URL": "YOUR_RPC_PROVIDER_URL_HERE"
      }
    }
  }
}
```
***IMPORTANT:*** *Standard JSON files do not allow comments. Please remove all lines starting with `//` before using this configuration.*

### Connecting from Cursor (Recommended Method)

The recommended way to configure Cursor is using a `.cursor/mcp.json` file within your project.

1.  Create a directory named `.cursor` in your project root if it doesn't exist.
2.  Create a file named `mcp.json` inside the `.cursor` directory.
3.  Copy the **Common `mcpServers` Configuration Structure** above into the `mcp.json` file. **Replace the placeholder values** with your actual private key and RPC URL, and ensure all comments are removed.
4.  Restart Cursor or reload the project. Enable the desired server (`local-evm-mcp-dev` or `npx-evm-mcp`) in Cursor's MCP settings.

*(Manual setup via Cursor Settings UI is possible but less recommended for project-specific configurations.)*

### Connecting from Claude Desktop App

If the Claude Desktop app supports a configuration file (check its documentation for the exact path and format, often similar to the example below):

1.  Locate or create the Claude Desktop configuration file (e.g., `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\\Claude\\claude_desktop_config.json` on Windows).
2.  Merge the `"mcpServers"` key and its content from the **Common `mcpServers` Configuration Structure** above into the Claude main configuration file. **Replace placeholders** with your actual private key and RPC URL, ensuring comments are removed. If the file already exists, merge the JSON objects carefully to avoid breaking existing Claude settings.

    *Note: As mentioned in the common structure's comments, ensure the `command`, `args` settings are correct for the environment where the Claude Desktop app runs.* 

3.  Restart the Claude Desktop app.

**Recommendation:** Prefer using the configuration file methods (Cursor's `mcp.json` or Claude Desktop's config file) with the `env` field, while being aware of the inherent risks of storing secrets in configuration files.

## 🛠️ Available Tools

The server currently exposes the following tools via the Model Context Protocol:

| Tool Name             | Description                                                                     |
| :-------------------- | :------------------------------------------------------------------------------ |
| `getAddress`          | Get the connected wallet address configured on the server.                      |
| `getChain`            | Get the chain ID and name the server is connected to.                           |
| `getBalance`          | Get the native token balance for a given address (or the server's wallet).      |
| `signMessage`         | Sign a message using the server's configured wallet.                            |
| `sendNativeToken`     | Send native tokens (e.g., ETH) from the server's wallet to a recipient.         |
| `getTokenBalance`     | Get the ERC20 token balance for a specified owner address.                      |
| `transferToken`       | Send a specified amount of an ERC20 token from the server's wallet.             |
| `getTokenTotalSupply` | Get the total supply of an ERC20 token.                                         |
| `getTokenAllowance`   | Get the allowance an owner has granted to a spender for an ERC20 token.         |
| `approveToken`        | Approve a spender to withdraw an ERC20 token from the server's wallet.        |
| `revokeApproval`      | Revoke (set to 0) a spender's allowance for an ERC20 token.                     |
| `transferTokenFrom`   | Transfer ERC20 tokens from one address to another (requires prior approval).    |
| `convertToBaseUnit`   | Convert a decimal token amount to its base unit representation (e.g., wei).     |
| `convertFromBaseUnit` | Convert a token amount from its base unit representation to a decimal string.   |

*(Refer to `src/evm-tools.ts` for detailed parameter and return value schemas)*

## 🔒 Security Considerations

- **Private Key Management**: Directly embedding `WALLET_PRIVATE_KEY` in configuration files (`.cursor/mcp.json`, `claude_desktop_config.json`) or using a `.env` file carries security risks. **Never commit files containing private keys to version control.** For production or high-value scenarios, use dedicated secret management solutions.
  **To mitigate risks, it is strongly recommended to create a new, dedicated wallet private key for development and testing purposes. Do not use your main wallet key holding significant funds here.**
- **RPC Endpoint Security**: Ensure your `RPC_PROVIDER_URL` points to a trusted node.
- **Access Control**: The server running in stdio mode lacks built-in access control. Secure the environment where the server process runs.

## 📁 Project Structure

```
evm-mcp-server/
├── src/                # Core source code for the server and tools
│   ├── evm.ts          # Main server entry point logic
│   └── evm-tools.ts    # Definitions and logic for all MCP tools
├── test/               # Test client code
│   └── client.ts       # Example MCP client for testing the server
├── build/              # Compiled JavaScript output (generated by `pnpm run build`)
├── .env.example        # Example environment file template
├── .env                # Environment variables (Gitignored, needs creation)
├── .gitignore
├── package.json        # Project manifest and dependencies
├── pnpm-lock.yaml      # Lockfile for pnpm
├── tsconfig.json       # TypeScript compiler configuration
└── README.md           # This file
└── README.zh.md        # Chinese version of README
```

## 💻 Development Scripts

Key scripts defined in `package.json`:

-   `pnpm run build`: Compiles TypeScript code in `src/` to JavaScript in `build/`.
-   `pnpm run test`: Runs the example test client (`test/client.ts`) using `tsx`. The client starts the server process itself (requires `.env`).
-   `pnpm run clean`: Removes the `build/` directory.
-   `pnpm run debug`: Starts the server with the MCP Inspector attached for debugging (requires `.env`).
-   `pnpm run prepublishOnly`: Automatically cleans and builds the project before publishing to npm.

## 📄 License

This project is licensed under the terms of the [MIT License](LICENSE). 