export const config = {
  runtime: 'edge',
  regions: ['iad1', 'sfo1', 'hnd1', 'sin1', 'cdg1', 'lhr1'],
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = process.env.DASHSCOPE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: '请在后端配置 DASHSCOPE_API_KEY 环境变量 (阿里云百炼)' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { messages } = await req.json();
    
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.DASHSCOPE_MODEL_NAME || 'qwen-plus',
        messages: messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('DashScope API Error:', errText);
      return new Response(JSON.stringify({ error: `调用大模型失败: ${response.status} ${errText}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('DashScope API Proxy Error:', error);
    return new Response(JSON.stringify({ error: '请求大模型异常。' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
