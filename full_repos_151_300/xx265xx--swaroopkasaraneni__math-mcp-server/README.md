# math-mcp-server

[![smithery badge](https://smithery.ai/badge/@swaroopkasaraneni/math-mcp-server)](https://smithery.ai/server/@swaroopkasaraneni/math-mcp-server)

Math MCP is a protocol that exposes mathematical operations for Claude Desktop. This project fulfills the Model Context Protocol (MCP) standard, allowing dynamic integration of large language models with external applications. Once you start the Math MCP, the protocol will listen for calls from an MCP client, and respond with the operations it exposes via MCP.

### Installing via Smithery

To install math-mcp-server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@swaroopkasaraneni/math-mcp-server):

```bash
npx -y @smithery/cli install @swaroopkasaraneni/math-mcp-server --client claude
```

### Manual Installation

1. Clone the repository:
   
```
git clone https://github.com/swaroopkasaraneni/math-mcp-server/
cd math-mcp-server
```

2. Install dependencies and build:

```
npm install
npm run build
```

### Usage

Start the server with:

```
npm start
```

The client will then be able to call methods exposed by this protocol. More details about implementing MCP can be found in the [Model Context Protocol Documentation](https://github.com/model-context/protocol).

### License

This project is licensed under the MIT License.

### Credits
- Developed by Swaroop Kasaraneni

