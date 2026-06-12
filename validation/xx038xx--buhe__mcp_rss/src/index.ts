#!/usr/bin/env node

import 'reflect-metadata';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { initDatabase } from './config/database';
import { OpmlService } from './services/OpmlService';
import { RssService } from './services/RssService';
import { McpService } from './services/McpService';

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ArticleStatus } from './entities/Article';

const server = new Server(
  {
    name: "rss_mcp",
    version: "1.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);


// 加载环境变量
dotenv.config();

// 获取环境变量
const opmlFilePath = process.env.OPML_FILE_PATH || './feeds.opml';
const updateInterval = process.env.RSS_UPDATE_INTERVAL || '1';

// 初始化服务
const opmlService = new OpmlService();
const rssService = new RssService();
const mcpService = new McpService();
    

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_content",
        description: "Get articles by subscribing to RSS, status has only two values: normal, favorite, source is empty to indicate all sources, Sort by article time, with the latest at the front.",
        inputSchema: {
          type: "object",
          properties: {
            status: { type: "string" },
            source: { type: "string" },
            limit: { type: "number" }
          },
        },
      },
      {
        name: "get_sources",
        description: "All sources of the article, the result is in array form. If you want to use the source parameter of get_content, which values ​​should be used, call it first",
        inputSchema: {
          type: "object",
          properties: {
          },
        },
      },
      {
        name: "set_tag",
        description: "Set article tag, status has only two values: normal, favorite, articleId is article id",
        inputSchema: {
          type: "object",
          properties: {
            status: { type: "string" },
            articleId: { type: "number" }
          }
        }
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_content") {
    const status = request.params.arguments?.status as string;
    const source = request.params.arguments?.source as string;
    const limit = request.params.arguments?.limit as number;
    const result = await mcpService.get_content(status as ArticleStatus, limit, source);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      isError: false,
    };
  }
  if (request.params.name === "get_sources") {
    const result = await mcpService.get_sources();
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      isError: false,
    };
  }
  if (request.params.name === "set_tag") {
    const status = request.params.arguments?.status as string;
    const articleId = request.params.arguments?.articleId as number;
    const result = await mcpService.set_tag(articleId, status as ArticleStatus);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      isError: false,
    };
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});
// console.log('MCP 启动成功')



  async function runServer() {
      await initDatabase();
      // 设置定时任务，定期获取RSS更新
      const cronExpression = `*/${updateInterval} * * * *`; // 每X分钟执行一次
      // console.log(`设置定时任务: ${cronExpression}`);
      
      cron.schedule(cronExpression, async () => {
        // console.log(`定时任务执行: ${new Date().toISOString()}`);
        // 初始化数据库
        
      // console.error('Fetch...');
      
      // 解析OPML文件并保存订阅源
        await opmlService.parseAndSaveFeeds(opmlFilePath);
        await rssService.fetchAllFeeds();
      });
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
  
  runServer().catch(console.error);