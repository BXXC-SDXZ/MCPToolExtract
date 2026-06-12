import { OpenAI } from 'openai';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';

import dotenv from 'dotenv';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createInterface } from 'readline/promises';

dotenv.config();

class MCPClient {
    private mcp: Client;
    private llm: OpenAI;
    private transport: StreamableHTTPClientTransport | null = null;
    private tools: any[] = [];

    constructor() {
        this.llm = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.mcp = new Client({ name: 'chatbot-mcp', version: '1.0.0' });
    }
    
    async connectToServer() {
        this.transport = new StreamableHTTPClientTransport(
            new URL('http://localhost:3000/mcp')
        );

        await this.mcp.connect(this.transport);

        const toolsResult = await this.mcp.listTools();
        console.log({toolsResult: toolsResult.tools});
        this.tools = toolsResult.tools.map((tool) => {
        return {
            type: "function",
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema, // normalmente isso é um JSON Schema
            },
        };
        });

        console.log(
        "Connected to server with tools:",
        this.tools.map(({ name }) => name)
        );
    }
    // Process the query

    async processQuery(query: string) {
        try {
        console.log('Processing query:', query);
        const response = await this.llm.chat.completions.create({
            model: 'gpt-4o-mini',
            max_tokens: 100,
            messages: [
                {
                    role: 'system',
                    content: `Caso você não tenha informações suficientes para responder a pergunta, responda que não tem informações suficientes.
                    Um CPF é um número de 11 dígitos sem pontos ou hífens. Porém podem enviar com pontos ou hífens.
                    Por exemplo: 123.456.789-09 ou 12345678909 são válidos. Mas seria interessante você sempre tratar como 12345678909.`,
                },    
                {
                    role: 'user',
                    content: query,
                }],
            tools: this.tools,
        });
        
        // console.log({response});
        // console.log({response: response.choices[0].message});
        // console.log({response: response.choices[0].message.tool_calls});

        if (response.choices[0].message.tool_calls && response.choices[0].message.tool_calls.length > 0) {
            const toolCall = response.choices[0].message.tool_calls[0];
            const toolName = toolCall.function.name;
            const toolArgs = JSON.parse(toolCall.function.arguments);
            console.log({toolName, toolArgs});
            const result = await this.mcp.callTool({
                name: toolName,
                arguments: toolArgs,
            });
            console.log(JSON.stringify({result}, null, 2));

            return `${(result?.content as {text: string}[])?.[0]?.text as string}`;
        }
        return response.choices[0].message.content;
        } catch (error) {
            return `${(error as any).message}`;
        }
    }

    async chatLoop() {
        const rl = createInterface({
          input: process.stdin,
          output: process.stdout,
        });
    
        try {
          console.log("\nMCP Client Started!");
          console.log("Type your queries or 'quit' to exit.");
    
          while (true) {
            const message = await rl.question("\nQuery: ");
            if (message.toLowerCase() === "quit") {
              break;
            }
            const response = await this.processQuery(message);
            console.log("\n" + response);
          }
        } finally {
          rl.close();
        }
      }
}

async function main() {
    const mcpClient = new MCPClient();
    try {
      await mcpClient.connectToServer();
      await mcpClient.chatLoop();
    } catch(e) {
      console.error('Error:', e);
    } finally {
      process.exit(0);
    }
  }

main();