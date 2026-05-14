import horoscopePkg from 'circular-natal-horoscope-js';

export const DASHSCOPE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

const { Origin, Horoscope } = horoscopePkg;

const SIGN_LABELS = {
  aries: '白羊座',
  taurus: '金牛座',
  gemini: '双子座',
  cancer: '巨蟹座',
  leo: '狮子座',
  virgo: '处女座',
  libra: '天秤座',
  scorpio: '天蝎座',
  sagittarius: '射手座',
  capricorn: '摩羯座',
  aquarius: '水瓶座',
  pisces: '双鱼座',
};

const BODY_LABELS = {
  sun: '太阳',
  moon: '月亮',
  mercury: '水星',
  venus: '金星',
  mars: '火星',
  jupiter: '木星',
  saturn: '土星',
  uranus: '天王星',
  neptune: '海王星',
  pluto: '冥王星',
  chiron: '凯龙星',
  sirius: '天狼星',
};

const ANGLE_LABELS = {
  ascendant: '上升点',
  midheaven: '天顶',
};

function requireString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`请填写${label}`);
  }
  return value.trim();
}

export function parseBirthInput(body) {
  const gender = requireString(body?.gender, '性别');
  const date = requireString(body?.date, '出生日期');
  const time = requireString(body?.time, '出生时间');
  const location = requireString(body?.location, '出生地点');

  const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = time.match(/^(\d{2}):(\d{2})$/);
  if (!dateMatch) {
    throw new Error('出生日期格式不正确，请使用 YYYY-MM-DD');
  }
  if (!timeMatch) {
    throw new Error('出生时间格式不正确，请使用 HH:mm');
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    throw new Error('出生日期或时间超出有效范围');
  }

  const dateCheck = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (
    dateCheck.getUTCFullYear() !== year ||
    dateCheck.getUTCMonth() !== month - 1 ||
    dateCheck.getUTCDate() !== day ||
    dateCheck.getUTCHours() !== hour ||
    dateCheck.getUTCMinutes() !== minute
  ) {
    throw new Error('出生日期不存在，请检查年月日');
  }

  return { gender, date, time, location, year, month, day, hour, minute };
}

export async function geocodeWithAmap(location, amapKey) {
  if (!amapKey) {
    throw new Error('请在后端配置 AMAP_API_KEY 环境变量（高德 Web 服务 API Key）');
  }

  const params = new URLSearchParams({
    key: amapKey,
    address: location,
  });

  const response = await fetch(`https://restapi.amap.com/v3/geocode/geo?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`高德地理编码请求失败: ${response.status}`);
  }

  const data = await response.json();
  if (data.status !== '1') {
    throw new Error(data.info ? `高德地理编码失败: ${data.info}` : '高德地理编码失败');
  }

  const geocode = data.geocodes?.[0];
  if (!geocode?.location) {
    throw new Error('未能解析出生地点，请尝试输入更完整的省市区地址');
  }

  const [longitude, latitude] = geocode.location.split(',').map(Number);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('高德返回的经纬度无效，请换用更明确的出生地点');
  }

  return {
    input: location,
    formattedAddress: geocode.formatted_address || location,
    province: geocode.province || '',
    city: Array.isArray(geocode.city) ? '' : geocode.city || '',
    district: Array.isArray(geocode.district) ? '' : geocode.district || '',
    level: geocode.level || '',
    latitude,
    longitude,
  };
}

function signLabel(point) {
  const key = point?.Sign?.key;
  return SIGN_LABELS[key] || point?.Sign?.label || key || '未知星座';
}

function degreeLabel(point) {
  return point?.ChartPosition?.Ecliptic?.ArcDegreesFormatted30 || '未知度数';
}

function bodySummary(key, body) {
  return {
    key,
    label: BODY_LABELS[key] || body?.label || key,
    sign: signLabel(body),
    degree: degreeLabel(body),
    eclipticDegrees: body?.ChartPosition?.Ecliptic?.DecimalDegrees ?? null,
  };
}

function angleSummary(key, angle) {
  return {
    key,
    label: ANGLE_LABELS[key] || angle?.label || key,
    sign: signLabel(angle),
    degree: degreeLabel(angle),
    eclipticDegrees: angle?.ChartPosition?.Ecliptic?.DecimalDegrees ?? null,
  };
}

export function calculateNatalChart(input, geo) {
  const origin = new Origin({
    year: input.year,
    month: input.month - 1,
    date: input.day,
    hour: input.hour,
    minute: input.minute,
    latitude: geo.latitude,
    longitude: geo.longitude,
  });

  const horoscope = new Horoscope({
    origin,
    houseSystem: 'placidus',
    zodiac: 'tropical',
    aspectPoints: ['bodies', 'angles'],
    aspectWithPoints: ['bodies', 'angles'],
    aspectTypes: ['major'],
    customOrbs: {},
    language: 'en',
  });

  const bodies = horoscope.CelestialBodies || {};
  const houses = (horoscope.Houses || []).map((house, index) => ({
    house: index + 1,
    sign: signLabel(house),
    degree: degreeLabel(house),
  }));

  return {
    system: {
      zodiac: 'tropical',
      houseSystem: 'placidus',
      timezone: origin.timezone?.name || origin.timezone || '按出生地经纬度推算',
    },
    core: {
      sun: bodySummary('sun', bodies.sun),
      moon: bodySummary('moon', bodies.moon),
      ascendant: angleSummary('ascendant', horoscope.Ascendant),
      midheaven: angleSummary('midheaven', horoscope.Midheaven),
    },
    bodies: Object.entries(bodies).map(([key, body]) => bodySummary(key, body)),
    houses,
    aspects: horoscope.Aspects || [],
  };
}

export function buildAstrologyMessages(input, geo, chart) {
  const chartJson = JSON.stringify({ birth: input, geocode: geo, chart }, null, 2);

  const systemPrompt = `你是一位看透世事、极具同理心与神秘色彩的顶级占星师。你的名字是"StarFate Oracle"。
你必须基于服务端已经计算好的结构化星盘数据进行解读，不得自行猜测、改写或重新推算太阳、月亮、上升、天顶、宫位与相位。
请使用优美且结构清晰的 Markdown 格式输出，不要使用一级标题，尽量使用二级/三级标题、加粗、引用、列表等增强排版。
报告开头必须先列出“系统计算结果”，包含出生地解析地址、经纬度、采用的黄道体系、宫位制、太阳星座、月亮星座、上升星座和天顶星座。
“系统计算结果”必须使用普通 Markdown 无序列表，每行一个条目，禁止使用 Markdown 表格或竖线表格。
后续解读可以有诗意和神秘感，但所有关键配置必须与结构化星盘数据保持一致。`;

  const userPrompt = `来访者提供了以下出生信息：
- 性别：${input.gender}
- 出生日期：${input.date}
- 出生时间：${input.time}
- 出生地点：${input.location}

服务端已完成高德地理编码与本命盘计算，结果如下：

\`\`\`json
${chartJson}
\`\`\`

请根据这些确定的星盘数据输出一份完整的占星解读报告。重点解释太阳、月亮、上升之间的张力，以及它们如何影响性格、情感需求、关系模式与人生方向。`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}

export async function requestDashScopeStream(messages, apiKey) {
  const response = await fetch(DASHSCOPE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.DASHSCOPE_MODEL_NAME || 'qwen3.6-flash-2026-04-16',
      messages,
      stream: true,
      enable_thinking: false,
    }),
  });

  return response;
}
