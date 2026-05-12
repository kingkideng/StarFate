const BASE_PROMPT = `你是一位看透世事、极具同理心与神秘色彩的顶级占卜师与命理师。你的名字是"StarFate Oracle"。你的解答总是充满优雅、深邃的神秘主义氛围，同时又能给出切中要害、温暖人心的指引。请使用优美且结构清晰的 Markdown 格式输出你的解读报告。(不要使用一级标题，尽量使用二级/三级标题、加粗、引用等来增强排版的美感)。你的语言风格应该是深邃的、诗意的、极具画面感的。`;

async function* fetchGeminiStream(contents: any) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contents }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
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
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          if (dataStr === '[DONE]') {
            return;
          }
          try {
            const data = JSON.parse(dataStr);
            if (data.error) {
              throw new Error(data.error);
            }
            if (data.text) {
              yield data.text;
            }
          } catch (e) {
            console.error('Error parsing SSE data', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function* askQuestionStream(context: string, history: {role: 'user' | 'model', text: string}[], question: string) {
  const systemPrompt = `${BASE_PROMPT}\n\n以下是之前的占卜/命理分析报告内容：\n\n${context}\n\n现在来访者针对报告提出了新的疑问。请你继续保持神秘深邃的语调，为来访者解答疑惑。回答要精炼、切中要害，尽量在一段指引内完成。`;

  const contents: any[] = [
    {
      role: 'user',
      parts: [{ text: systemPrompt }]
    },
    {
      role: 'model',
      parts: [{ text: "我已了然。请说出你的疑惑。" }]
    }
  ];

  for (const msg of history) {
    contents.push({
      role: msg.role,
      parts: [{ text: msg.text }]
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: question }]
  });

  yield* fetchGeminiStream(contents);
}

export async function* interpretTarotStream(past: string, present: string, future: string, question: string | undefined) {
  const prompt = `
${BASE_PROMPT}

来访者抽取了三张塔罗牌（经典韦特大阿卡纳），使用的是"过去-现在-未来"牌阵。
过去：${past}
现在：${present}
未来：${future}
${question ? `来访者心中的疑问是："${question}"` : '来访者正在寻求整体的生命指引。'}

请你深度解读这三张牌的象征意义，以及它们之间神秘的能量流转，给出一份充满启示的塔罗牌阵解读报告。
`;

  yield* fetchGeminiStream([{ role: 'user', parts: [{ text: prompt }] }]);
}

export async function* interpretAstrologyStream(gender: string, date: string, time: string, location: string) {
  const prompt = `
${BASE_PROMPT}

来访者提供了他们的出生信息以进行严谨的星盘解读：
性别：${gender}
出生日期：${date}
出生时间：${time}
出生地点：${location}

作为顶级的占星师，在此次解读中，你需要：
1. 精准推算出（或分析出最可能的）【太阳星座】、【月亮星座】和【上升星座】，并在报告开头明确指出这三个核心配置。
2. 结合这三个核心配置，为来访者书写一份深入灵魂的解读报告。阐述他们在性格上的隐秘张力、情感深处的渴求，以及灵魂进化的最终方向。

请以 Markdown 格式排版直接输出你的报告内容。
`;

  yield* fetchGeminiStream([{ role: 'user', parts: [{ text: prompt }] }]);
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

  yield* fetchGeminiStream([{ role: 'user', parts: [{ text: prompt }] }]);
}
