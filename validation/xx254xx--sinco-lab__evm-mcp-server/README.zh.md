[English Document](README.md)

# @sinco-lab/evm-mcp-server

![许可证: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js 版本](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen)
![Viem](https://img.shields.io/badge/Viem-2.x-green)
![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.x-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)

一个基于模型上下文协议（Model Context Protocol, MCP）和 Viem 的 EVM 交互服务网关，使 AI 代理或服务能够安全地与已配置的 EVM 兼容区块链进行交互。

## 📋 目录

- [概述](#-概述)
- [特性](#-特性)
- [先决条件](#️-先决条件)
- [安装](#-安装)
- [配置](#️-配置)
- [使用方法](#-使用方法)
- [从客户端连接 (Cursor, Claude)](#-从客户端连接-cursor-claude)
- [可用工具](#-可用工具)
- [安全注意事项](#-安全注意事项)
- [项目结构](#-项目结构)
- [开发脚本](#️-开发脚本)
- [许可证](#-许可证)

## 🔭 概述

本项目提供了一个模型上下文协议（MCP）服务器，旨在作为与 EVM 兼容区块链交互的网关。它利用强大的 [Viem](https://viem.sh/) 库进行区块链交互，并通过 [MCP SDK](https://github.com/modelcontextprotocol/sdk) 将这些功能公开为可供 AI 代理或其他 MCP 客户端使用的工具。

该服务器通过环境变量连接到特定的 EVM 链，并允许客户端通过标准化的 MCP 接口执行各种读写操作。

## ✨ 特性

- **MCP 集成**: 将 EVM 功能公开为标准的 MCP 工具。
- **Viem 驱动**: 利用现代化且高效的 Viem 库进行可靠的 EVM 交互。
- **可配置端点**: 通过在环境设置中定义的 RPC URL 连接到任何 EVM 兼容链。
- **核心 EVM 操作**: 提供用于常见任务的工具，例如检查余额、转移原生代币和 ERC20 代币、签署消息以及与合约交互（读取许可额、批准等）。
- **类型安全**: 完全使用 TypeScript 开发，以获得更好的可维护性和开发者体验。

## 🛠️ 先决条件

- [Node.js](https://nodejs.org/) 18.0.0 或更高版本。
- [pnpm](https://pnpm.io/installation) 包管理器。

## 📦 安装

1.  克隆仓库：
    ```bash
    git clone https://github.com/sinco-lab/evm-mcp-server.git
    cd evm-mcp-server
    ```
2.  使用 pnpm 安装依赖项：
    ```bash
    pnpm install
    ```

## ⚙️ 配置

配置主要通过环境变量处理。服务器需要：

*   `WALLET_PRIVATE_KEY`: 服务器将使用的钱包私钥（以 `0x` 开头）。**请确保安全！**
*   `RPC_PROVIDER_URL`: 目标 EVM 网络的 JSON-RPC 端点 URL。

这些可以通过 `.env` 文件（用于测试客户端和调试）提供，也可以直接在客户端的 MCP 服务器配置中提供（见下文）。

## 🚀 使用方法

### 构建项目

将 TypeScript 源代码编译成 JavaScript：

```bash
pnpm run build
```
此命令会生成 `build` 目录，其中包含 `build/evm.js`。

### 手动启动 MCP 服务器（Stdio 模式）

如果使用 `.env` 文件进行配置：
1.  复制 `.env.example` 到 `.env`。
2.  在 `.env` 中填写 `WALLET_PRIVATE_KEY` 和 `RPC_PROVIDER_URL`。
3.  运行服务器：
    ```bash
    # 如果当前目录或父目录中存在 .env 文件，dotenv 会自动加载
    node build/evm.js
    ```
    *（注意：`node` 本身不解析 `.env`，但 `src/evm.ts` 中使用的 `dotenv` 包会）*

### 运行示例测试客户端

本项目包含一个简单的测试客户端 (`test/client.ts`)，它使用 `StdioClientTransport` 根据其配置自动启动服务器进程 (`node build/evm.js`)。

**先决条件：**
1.  构建项目：`pnpm run build`
2.  创建并配置您的 `.env` 文件（客户端脚本会加载此文件）。

运行客户端：
```bash
pnpm run test
```
此命令使用 `tsx`（通过 `package.json`）执行 `test/client.ts`。客户端脚本将读取 `.env` 文件，启动服务器进程，通过 stdio 连接到它，列出可用工具，并调用 `getChain` 工具。

### 使用 MCP Inspector 进行调试

您可以使用 MCP Inspector 工具连接到服务器并与之交互以进行调试。需要一个已配置的 `.env` 文件和已构建的项目。运行以下命令：

```bash
pnpm run debug
```
此脚本会加载 `.env` 文件，并启动连接到服务器脚本（`build/evm.js`）的 Inspector，同时传递必要的环境变量。

## 🔌 从客户端连接 (Cursor, Claude)

您可以配置像 Cursor 或 Claude Desktop 应用这样的客户端来自动启动并连接到此 MCP 服务器。

**先决条件：**

1.  安装依赖项：`pnpm install`
2.  构建项目：`pnpm run build`

**安全警告：**
以下配置涉及将您的 `WALLET_PRIVATE_KEY` 和 `RPC_PROVIDER_URL` 直接放入配置文件（`.cursor/mcp.json` 或 `claude_desktop_config.json`）。这些文件可能以不如 `.env` 文件安全的方式存储，并可能被无意中同步或备份。**在将敏感信息直接放入这些配置文件之前，请了解相关风险。** 对于更高的安全需求，请探索此处未涵盖的其他密钥管理策略。

#### 通用 `mcpServers` 配置结构

以下是配置 MCP 服务器所需的基本 JSON 结构，您可以将其用于 Cursor 或 Claude Desktop：

```json
// 通用 mcpServers 结构
{
  "mcpServers": {
    // 选项 1：运行本地构建的服务器
    "local-evm-mcp-dev": {
      "command": "node", // 直接使用 node
      "args": [
        "/path/to/your/project/build/evm.js"  // 使用绝对路径
      ],
      "env": {
        // 警告：存在安全风险！建议使用新密钥（详见“安全注意事项”）。
        "WALLET_PRIVATE_KEY": "0xYOUR_PRIVATE_KEY_HERE",
        "RPC_PROVIDER_URL": "YOUR_RPC_PROVIDER_URL_HERE"
      }
    },
    // 选项 2：通过 npx 运行已发布的包
    "npx-evm-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@sinco-lab/evm-mcp-server"
      ],
      "env": {
        // 警告：存在安全风险！建议使用新密钥（详见“安全注意事项”）。
        "WALLET_PRIVATE_KEY": "0xYOUR_PRIVATE_KEY_HERE",
        "RPC_PROVIDER_URL": "YOUR_RPC_PROVIDER_URL_HERE"
      }
    }
  }
}
```
***重要提示：*** *标准的 JSON 文件不允许包含注释。请在实际使用此配置前移除所有 `//` 开头的注释行。*

### 从 Cursor 连接 (推荐方法)

推荐使用项目内的 `.cursor/mcp.json` 文件来配置 Cursor。这是一种更具可移植性的配置方式，可以与您的团队共享或在项目中使用：
-   轻松与团队共享 MCP 配置。
-   对您的 MCP 设置进行版本控制。
-   为不同的项目使用不同的服务器配置。

1.  如果项目根目录中不存在 `.cursor` 目录，请创建一个。
2.  在 `.cursor` 目录内创建一个名为 `mcp.json` 的文件。
3.  将上面的 **通用 `mcpServers` 配置结构** 复制到 `mcp.json` 文件中，并**将占位符值替换为** 您实际的私钥和 RPC URL。确保移除所有注释。
4.  Cursor 在处理该项目时将自动检测并使用这些 MCP 服务器配置。在 Cursor 的 MCP 设置中启用所需的服务器（`local-evm-mcp-dev` 或 `npx-evm-mcp`）。

### 从 Claude Desktop 应用连接

如果 Claude Desktop 应用支持配置文件（请查阅其文档以获取确切路径和格式，通常与以下示例类似）：

1.  找到或创建 Claude Desktop 配置文件（例如 macOS 上的 `~/Library/Application Support/Claude/claude_desktop_config.json` 或 Windows 上的 `%APPDATA%\\Claude\\claude_desktop_config.json`）。
2.  将上面的 **通用 `mcpServers` 配置结构** 中的 `"mcpServers"` 键及其内容合并到 Claude 的主配置文件中。**请将占位符值替换为** 您实际的私钥和 RPC URL，并确保移除所有注释。如果配置文件已存在，请确保正确合并 JSON 对象，不要破坏原有的 Claude 配置。

    *注意：确保通用结构中 `command` 和 `args` 中的路径对于运行 Claude Desktop 应用的环境是正确的。*

3.  重新启动 Claude Desktop 应用。

**建议：** 优先使用配置文件方法（Cursor 的 `mcp.json` 或 Claude Desktop 的配置文件）配合 `env` 字段，同时注意在配置文件中存储密钥的固有风险。

## 🛠️ 可用工具

服务器当前通过模型上下文协议公开以下工具：

| 工具名称              | 描述                                                                     |
| :-------------------- | :----------------------------------------------------------------------- |
| `getAddress`          | 获取服务器上配置的已连接钱包地址。                                       |
| `getChain`            | 获取服务器连接到的链 ID 和名称。                                         |
| `getBalance`          | 获取给定地址（或服务器钱包）的原生代币余额。                             |
| `signMessage`         | 使用服务器配置的钱包签署消息。                                           |
| `sendNativeToken`     | 从服务器钱包向接收者发送原生代币（例如 ETH）。                           |
| `getTokenBalance`     | 获取指定所有者地址的 ERC20 代币余额。                                    |
| `transferToken`       | 从服务器钱包发送指定数量的 ERC20 代币。                                  |
| `getTokenTotalSupply` | 获取 ERC20 代币的总供应量。                                              |
| `getTokenAllowance`   | 获取所有者已授予 spender 的 ERC20 代币许可额。                           |
| `approveToken`        | 批准 spender 从服务器钱包中提取 ERC20 代币。                              |
| `revokeApproval`      | 撤销（设置为 0）spender 对 ERC20 代币的许可额。                          |
| `transferTokenFrom`   | 从一个地址向另一个地址转移 ERC20 代币（需要事先批准）。                    |
| `convertToBaseUnit`   | 将十进制代币数量转换为其最小单位表示（例如 wei）。                       |
| `convertFromBaseUnit` | 将代币数量从其最小单位表示转换为十进制字符串。                           |

*（有关详细的参数和返回值模式，请参阅 `src/evm-tools.ts`）*

## 🔒 安全注意事项

- **私钥管理**: 将 `WALLET_PRIVATE_KEY` 直接嵌入配置文件（`.cursor/mcp.json`, `claude_desktop_config.json`）或使用 `.env` 文件都存在安全风险。**切勿将包含私钥的文件提交到版本控制。** 对于生产或高价值场景，请使用专门的密钥管理解决方案。
  **为了降低风险，强烈建议您为开发和测试创建一个全新的、专用的钱包私钥，不要在此处使用存有大量资金的主钱包密钥。**
- **RPC 端点安全**: 确保您的 `RPC_PROVIDER_URL` 指向受信任的节点。
- **访问控制**: 以 stdio 模式运行的服务器缺乏内置的访问控制。请保护服务器进程运行的环境。

## 📁 项目结构

```
evm-mcp-server/
├── src/                # 服务器和工具的核心源代码
│   ├── evm.ts          # 主服务器入口逻辑
│   └── evm-tools.ts    # 所有 MCP 工具的定义和逻辑
├── test/               # 测试客户端代码
│   └── client.ts       # 用于测试服务器的示例 MCP 客户端
├── build/              # 编译后的 JavaScript 输出（由 `pnpm run build` 生成）
├── .env.example        # 示例环境文件模板
├── .env                # 环境变量（已 Gitignore，需要创建）
├── .gitignore
├── package.json        # 项目清单和依赖项
├── pnpm-lock.yaml      # pnpm 的 Lockfile
├── tsconfig.json       # TypeScript 编译器配置
└── README.md           # 英文 README 文件
└── README.zh.md        # 本文件（中文 README）
```

## 💻 开发脚本

`package.json` 中定义的关键脚本：

-   `pnpm run build`: 将 `src/` 中的 TypeScript 代码编译为 `build/` 中的 JavaScript。
-   `pnpm run test`: 使用 `tsx` 运行示例测试客户端（`test/client.ts`）。客户端会自行启动服务器进程（需要 `.env`）。
-   `pnpm run clean`: 删除 `build/` 目录。
-   `pnpm run debug`: 启动附加了 MCP Inspector 的服务器以进行调试（需要 `.env`）。
-   `pnpm run prepublishOnly`: 在发布到 npm 之前自动清理和构建项目。

## 📄 许可证

本项目根据 [MIT 许可证](LICENSE) 的条款授权。
