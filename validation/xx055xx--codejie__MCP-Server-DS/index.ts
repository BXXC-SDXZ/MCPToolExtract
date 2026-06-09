import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
// import dotenv from "dotenv";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { ToolDefines } from "./tools.js";

// dotenv.config();

const server: McpServer = new McpServer({
  name: "mcp-server-ds",
  version: "0.1.0"
})

// const axiosInstance: AxiosInstance = axios.create({
//   baseURL: 'https://api.deepseek.com',
//   headers: {
//     'Authorization': `Bearer ${process.env.TOKEN}`,
//     'Content-Type': 'application/json'
//   }
// })

for (const tool of ToolDefines) {
  server.tool(tool.name, tool.description, tool.paramSchema, tool.cb)
}

const transport: StdioServerTransport = new StdioServerTransport();
await server.connect(transport);