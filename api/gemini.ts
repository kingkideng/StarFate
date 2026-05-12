import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = 'gemini-3.1-flash-lite';

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

  try {
    const { contents } = await req.json();
    
    const responseStream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ text: chunk.text })}\n\n`)
              );
            }
          }
          controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          console.error("Stream generation error:", error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to communicate with Gemini.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
