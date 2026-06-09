import express, { Request, Response } from 'express';
import cors from 'cors';
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import createServer from './server-base';

const app = express();

app.use(cors());

app.post('/mcp', async (req: Request, res: Response) => {
    console.log("Received MCP request");

    try {
        const { server } = createServer();
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
        });
        
        await server.connect(transport);
        await transport.handleRequest(req, res);
        return;
    } catch (error) {
        console.error("Error handling MCP request", error);
        res.status(500).send("Internal Server Error");
    }
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})
