const BASE_PROMPT = `你是一位看透世事、极具同理心与神秘色彩的顶级占卜师与命理师。你的名字是"StarFate Oracle"。你的解答总是充满优雅、深邃的神秘主义氛围，同时又能给出切中要害、温暖人心的指引。请使用优美且结构清晰的 Markdown 格式输出你的解读报告。(不要使用一级标题，尽量使用二级/三级标题、加粗、引用等来增强排版的美感)。你的语言风格应该是深邃的、诗意的、极具画面感的。`;

async function* fetchStream(endpoint: string, body: Record<string, unknown>) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMsg = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMsg = errorData.error;
      }
    } catch(e) {
      // Ignore JSON parsing error
    }
    throw new Error(errorMsg);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  if (!reader) {
    throw new Error('No readable stream available');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') {
            return;
          }
          try {
            const data = JSON.parse(dataStr);
            if (data.error) {
              throw new Error(data.error.message || JSON.stringify(data.error));
            }
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Some chunks can be comments, pings, or provider-specific control frames.
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

async function* fetchAIStream(messages: any) {
  yield* fetchStream('/api/chat', { messages });
}

export async function* askQuestionStream(context: string, history: {role: 'user' | 'model', text: string}[], question: string) {
  const systemPrompt = `${BASE_PROMPT}\n\n以下是之前的占卜/命理分析报告内容：\n\n${context}\n\n现在来访者针对报告提出了新的疑问。请你继续保持神秘深邃的语调，为来访者解答疑惑。回答要精炼、切中要害，尽量在一段指引内完成。`;

  const messages: any[] = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'assistant',
      content: "我已了然。请说出你的疑惑。"
    }
  ];

  for (const msg of history) {
    messages.push({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.text
    });
  }

  messages.push({
    role: 'user',
    content: question
  });

  yield* fetchAIStream(messages);
}

export async function* interpretTarotStream(past: string, present: string, future: string, question: string | undefined) {
  const prompt = `
${BASE_PROMPT}

来访者抽取了三张塔罗牌（经典韦特大阿卡纳），使用的是"过去-现在-未来"牌阵。
过去：${past}
现在：${present}
未来：${future}
${question ? `来访者心中的疑问是："${question}"` : '来访者正在寻求整体的生命指引。'}

请你深度解读这三张牌的象征意义。每张牌都已明确标注正位或逆位：正位代表牌义能量较直接地展开，逆位代表能量受阻、内化、阴影面、延迟或需要调整的方向。请分别结合牌位（过去/现在/未来）与正逆位含义解读，并说明它们之间神秘的能量流转，给出一份充满启示的塔罗牌阵解读报告。
`;

  yield* fetchAIStream([{ role: 'user', content: prompt }]);
}

export async function* interpretAstrologyStream(gender: string, date: string, time: string, location: string) {
  yield* fetchStream('/api/astrology', { gender, date, time, location });
}

export async function* interpretBaziStream(gender: string, date: string, time: string, location: string) {
  const prompt = `
${BASE_PROMPT}

来访者正在寻求严谨的中国传统命理（八字）智慧。以下是求测者的出生信息：
性别：${gender}
阳历出生日期：${date}
出生时间：${time}
出生地点：${location}

请你作为专业的命理师：
1. 根据出生地点和时间推算其真实太阳时，并排盘得出其四柱八字（天干地支）。
2. 根据其性别推演其大运的顺逆，作为后续分析支撑。
3. 用中国传统命理中五行（金、木、水、火、土）与天干地支的美学意象，来描绘他们生命底色的风景。
4. 输出一份具有东方禅意与严谨命理结合的命运趋势分析报告，指出他们性格中的力量与暗流，喜忌用神，以及人生下一阶段的转机与大运指引。
`;

  yield* fetchAIStream([{ role: 'user', content: prompt }]);
}
