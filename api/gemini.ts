import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = 'gemini-3.1-flash-lite';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { contents } = req.body;
    
    const responseStream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of responseStream) {
      if (chunk.text) {
        // Send each chunk as an SSE message
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }
    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to communicate with Gemini.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Generation failed.' })}\n\n`);
      res.end();
    }
  }
}
