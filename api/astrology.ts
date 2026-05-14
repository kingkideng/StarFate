import {
  buildAstrologyMessages,
  calculateNatalChart,
  geocodeWithAmap,
  parseBirthInput,
  requestDashScopeStream,
} from '../server-lib/astrology-core.js';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.DASHSCOPE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '请在后端配置 DASHSCOPE_API_KEY 环境变量（阿里云百炼）' });
  }
  if (!process.env.AMAP_API_KEY) {
    return res.status(500).json({ error: '请在后端配置 AMAP_API_KEY 环境变量（高德 Web 服务 API Key）' });
  }

  try {
    const input = parseBirthInput(req.body);
    const geo = await geocodeWithAmap(input.location, process.env.AMAP_API_KEY);
    const chart = calculateNatalChart(input, geo);
    const messages = buildAstrologyMessages(input, geo, chart);
    const response = await requestDashScopeStream(messages, apiKey);

    if (!response.ok) {
      const errStr = await response.text();
      return res.status(response.status).json({ error: `调用大模型失败: ${response.status} ${errStr}` });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
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
    console.error('Astrology API Error:', error);
    if (!res.headersSent) {
      res.status(400).json({ error: error?.message || '星盘计算失败，请检查出生信息。' });
    } else {
      res.end();
    }
  }
}
