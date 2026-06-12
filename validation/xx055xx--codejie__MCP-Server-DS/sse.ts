import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { ToolDefines } from './tools.js';
import express from 'express'
 
const server: McpServer = new McpServer({
  name: "mcp-server-ds",
  version: "0.1.0"
})

for (const tool of ToolDefines) {
  server.tool(tool.name, tool.description, tool.paramSchema, tool.cb)
}

const app = express();
app.use(express.json());

const transports: Record<string, any> = {};

app.get('/sse', async (req, res) => {
  console.log('get mcp request');
  try {
    const transport = new SSEServerTransport('/messages', res);
    const sessionId = transport.sessionId;
    transports[sessionId] = transport;
    transport.onclose = () => {
      console.log('sse transport closed - ' + sessionId);
      delete transports[sessionId];
    }

    await server.connect(transport);
  } catch (e) {
    console.log(e);
  }
})

app.post('/messages', async (req, res) => {
  console.log('recevied message');

  const sessionId = req.query?.sessionId as string;
  if (!sessionId) {
    res.status(400).send('no session id');
    return;
  }

  const transport = transports[sessionId];
  try {
    await transport.handlePostMessage(req, res, req.body);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
})
 
app.listen(3123, () => {
  console.log('listening on http://0.0.0.0:3123');
});

process.on('SIGINT', async () => {
  console.log('received SIGINT');
  for (const sessionId in transports) { 
    await transports[sessionId].close();
    delete transports[sessionId];
  }
  process.exit(0);
})