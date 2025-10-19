import { createServer } from "node:http";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  ReadResourceRequestSchema,
  type Resource
} from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs";
import path from "node:path";

// 配置
const PORT = process.env.PORT || 8000;
const ASSETS_PATH = path.join(process.cwd(), '../assets');
const TODO_HTML_PATH = path.join(ASSETS_PATH, 'todo.html');

// 定义Todo资源
const todoResource: Resource = {
  uri: "ui://widget/todo.html",
  name: "Todo App",
  description: "Todo List application widget",
  mimeType: "text/html+skybridge",
  _meta: {
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true
  }
};

// 创建MCP服务器
function createTodoServer(): Server {
  const server = new Server(
    {
      name: "todo-mcp-server",
      version: "1.0.0"
    },
    {
      capabilities: {
        resources: {}
      }
    }
  );

  // 处理资源读取请求
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri === todoResource.uri) {
      if (!fs.existsSync(TODO_HTML_PATH)) {
        throw new Error("Todo HTML file not found");
      }

      const html = fs.readFileSync(TODO_HTML_PATH, 'utf-8');
      return {
        contents: [{
          ...todoResource,
          text: html
        }]
      };
    }
    throw new Error("Unknown resource");
  });

  return server;
}

// HTTP服务器处理
const sessions = new Map();

async function handleSseRequest(res) {
  const server = createTodoServer();
  const transport = new SSEServerTransport('/mcp/messages', res);
  const sessionId = transport.sessionId;

  sessions.set(sessionId, { server, transport });

  transport.onclose = async () => {
    sessions.delete(sessionId);
    await server.close();
  };

  try {
    await server.connect(transport);
  } catch (error) {
    sessions.delete(sessionId);
    console.error("SSE connection failed:", error);
    if (!res.headersSent) {
      res.writeHead(500).end();
    }
  }
}

const httpServer = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type");

  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }

  if (req.method === "GET" && req.url === "/mcp") {
    await handleSseRequest(res);
    return;
  }

  res.writeHead(404).end("Not Found");
});

httpServer.listen(PORT, () => {
  console.log(`Todo MCP Server running on http://localhost:${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/mcp`);
});