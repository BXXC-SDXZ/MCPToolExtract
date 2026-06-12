#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Buffer } from "node:buffer"

const server = new McpServer({
  name: "Example MCP server with image blocks",
  version: "1.0.0"
});

const RANDOM_IMAGE_URL = "https://picsum.photos/500"

const downloadImageAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  return base64
}

server.tool("get_random_image",
    "Get a random image using the Lorem Picsum API",
  {},
  async () => {
    const imageBase64 = await downloadImageAsBase64(RANDOM_IMAGE_URL);

    return {
      content: [{
        type: "image",
        data: imageBase64,
        mimeType: "image/jpeg",
      }]
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);