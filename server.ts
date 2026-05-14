import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

const DASHSCOPE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const chatHandler = async (req: express.Request, res: express.Response) => {
    const apiKey = process.env.DASHSCOPE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: '请配置 DASHSCOPE_API_KEY 环境变量' });
    }

    try {
      const { messages } = req.body;
      
      const response = await fetch(DASHSCOPE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.DASHSCOPE_MODEL_NAME || 'qwen3.6-flash-2026-04-16',
          messages: messages,
          stream: true,
          enable_thinking: false,
        }),
      });

      if (!response.ok) {
        const errStr = await response.text();
        return res.status(response.status).json({ error: `大模型通信失败: ${errStr}` });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      if (response.body) {
        for await (const chunk of response.body as any) {
          res.write(chunk);
        }
      }
      res.end();
    } catch (error: any) {
      console.error('DashScope API Error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: '请求大模型异常。' });
      } else {
        res.end();
      }
    }
  };

  // API route for AI streaming. /api/gemini remains as a temporary compatibility alias.
  app.post("/api/chat", chatHandler);
  app.post("/api/gemini", chatHandler);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
