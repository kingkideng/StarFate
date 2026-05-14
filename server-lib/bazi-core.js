import lunarPkg from 'lunar-javascript';

const { Solar } = lunarPkg;

const STANDARD_MERIDIAN = 120;
const WU_XING = ['金', '木', '水', '火', '土'];

function pad(num) {
  return String(num).padStart(2, '0');
}

function getDayOfYear(year, month, day) {
  const start = Date.UTC(year, 0, 0);
  const current = Date.UTC(year, month - 1, day);
  return Math.floor((current - start) / 86400000);
}

function getEquationOfTimeMinutes(year, month, day) {
  const dayOfYear = getDayOfYear(year, month, day);
  const b = (2 * Math.PI * (dayOfYear - 81)) / 364;
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

function shiftBirthTime(input, offsetMinutes) {
  const timestamp = Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute);
  const shifted = new Date(timestamp + Math.round(offsetMinutes) * 60000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: 0,
    text: `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())} ${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`,
  };
}

function pillarSummary(name, pillar, eightChar) {
  return {
    name,
    ganZhi: eightChar[`get${pillar}`](),
    gan: eightChar[`get${pillar}Gan`](),
    zhi: eightChar[`get${pillar}Zhi`](),
    hiddenGan: eightChar[`get${pillar}HideGan`](),
    wuXing: eightChar[`get${pillar}WuXing`](),
    naYin: eightChar[`get${pillar}NaYin`](),
    tenGodStem: eightChar[`get${pillar}ShiShenGan`](),
    tenGodBranches: eightChar[`get${pillar}ShiShenZhi`](),
    diShi: eightChar[`get${pillar}DiShi`](),
    xunKong: eightChar[`get${pillar}XunKong`](),
  };
}

function countWuXing(pillars) {
  const counts = Object.fromEntries(WU_XING.map((name) => [name, 0]));
  for (const pillar of pillars) {
    for (const char of pillar.wuXing) {
      if (char in counts) counts[char] += 1;
    }
    for (const hidden of pillar.hiddenGan || []) {
      const element = lunarPkg.LunarUtil.WU_XING_GAN[hidden];
      if (element in counts) counts[element] += 0.5;
    }
  }
  return counts;
}

function formatSolar(solar) {
  return solar?.toYmdHms?.() || '';
}

function buildDaYun(eightChar, gender) {
  const yun = eightChar.getYun(gender === '男' ? 1 : 0);
  const daYun = yun.getDaYun().slice(0, 9).map((item) => ({
    ganZhi: item.getGanZhi() || '童限',
    startAge: item.getStartAge(),
    endAge: item.getEndAge(),
    startYear: item.getStartYear(),
    endYear: item.getEndYear(),
  }));

  return {
    direction: daYun[1]?.ganZhi === nextPillar(eightChar.getMonth()) ? '顺行' : '逆行',
    start: {
      years: yun.getStartYear(),
      months: yun.getStartMonth(),
      days: yun.getStartDay(),
      solarDate: formatSolar(yun.getStartSolar()),
    },
    daYun,
  };
}

function nextPillar(ganZhi) {
  const gan = '甲乙丙丁戊己庚辛壬癸';
  const zhi = '子丑寅卯辰巳午未申酉戌亥';
  const nextGan = gan[(gan.indexOf(ganZhi[0]) + 1) % gan.length];
  const nextZhi = zhi[(zhi.indexOf(ganZhi[1]) + 1) % zhi.length];
  return `${nextGan}${nextZhi}`;
}

function calculateChartFromTime(time, gender) {
  const solar = Solar.fromYmdHms(time.year, time.month, time.day, time.hour, time.minute, time.second || 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(2);

  const pillars = [
    pillarSummary('年柱', 'Year', eightChar),
    pillarSummary('月柱', 'Month', eightChar),
    pillarSummary('日柱', 'Day', eightChar),
    pillarSummary('时柱', 'Time', eightChar),
  ];

  return {
    solar: solar.toYmdHms(),
    lunar: lunar.toString(),
    lunarFull: lunar.toFullString(),
    jieQi: {
      previousJie: {
        name: lunar.getPrevJie().getName(),
        time: formatSolar(lunar.getPrevJie().getSolar()),
      },
      nextJie: {
        name: lunar.getNextJie().getName(),
        time: formatSolar(lunar.getNextJie().getSolar()),
      },
      previousJieQi: {
        name: lunar.getPrevJieQi().getName(),
        time: formatSolar(lunar.getPrevJieQi().getSolar()),
      },
      nextJieQi: {
        name: lunar.getNextJieQi().getName(),
        time: formatSolar(lunar.getNextJieQi().getSolar()),
      },
    },
    pillars,
    dayMaster: {
      gan: eightChar.getDayGan(),
      wuXing: lunarPkg.LunarUtil.WU_XING_GAN[eightChar.getDayGan()],
    },
    wuXingCounts: countWuXing(pillars),
    extra: {
      taiYuan: eightChar.getTaiYuan(),
      taiYuanNaYin: eightChar.getTaiYuanNaYin(),
      mingGong: eightChar.getMingGong(),
      mingGongNaYin: eightChar.getMingGongNaYin(),
      shenGong: eightChar.getShenGong(),
      shenGongNaYin: eightChar.getShenGongNaYin(),
    },
    yun: buildDaYun(eightChar, gender),
  };
}

function pillarsKey(chart) {
  return chart.pillars.map((pillar) => pillar.ganZhi).join(' ');
}

export function calculateBaziChart(input, geo) {
  const eotMinutes = getEquationOfTimeMinutes(input.year, input.month, input.day);
  const longitudeOffsetMinutes = (geo.longitude - STANDARD_MERIDIAN) * 4;
  const trueSolarOffsetMinutes = longitudeOffsetMinutes + eotMinutes;
  const trueSolarTime = shiftBirthTime(input, trueSolarOffsetMinutes);
  const standardTime = {
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute: input.minute,
    second: 0,
    text: `${input.date} ${input.time}`,
  };

  const standard = calculateChartFromTime(standardTime, input.gender);
  const trueSolar = calculateChartFromTime(trueSolarTime, input.gender);

  return {
    system: {
      calendar: 'solar',
      standardTimeZone: 'Asia/Shanghai',
      baziSect: 'sect 2',
      primaryChart: 'standardBeijingTime',
      trueSolarNote: '真太阳时参考盘按经度修正并加入近似均时差，供流派差异比较。',
    },
    timeCorrection: {
      standardTime: standardTime.text,
      longitude: geo.longitude,
      standardMeridian: STANDARD_MERIDIAN,
      longitudeOffsetMinutes: Number(longitudeOffsetMinutes.toFixed(2)),
      equationOfTimeMinutes: Number(eotMinutes.toFixed(2)),
      trueSolarOffsetMinutes: Number(trueSolarOffsetMinutes.toFixed(2)),
      trueSolarTime: trueSolarTime.text,
    },
    standard,
    trueSolar,
    differsByTrueSolarTime: pillarsKey(standard) !== pillarsKey(trueSolar),
  };
}

function formatPillarLine(pillar) {
  const hidden = pillar.hiddenGan?.length ? `，藏干${pillar.hiddenGan.join('/')}` : '';
  return `${pillar.name}：${pillar.ganZhi}（${pillar.wuXing}，${pillar.tenGodStem}，纳音${pillar.naYin}${hidden}）`;
}

function formatDaYunLine(yun) {
  const first = yun.daYun
    .slice(0, 6)
    .map((item) => `${item.ganZhi} ${item.startAge}-${item.endAge}岁(${item.startYear}-${item.endYear})`)
    .join('；');
  return `${yun.direction}，${yun.start.years}年${yun.start.months}个月${yun.start.days}天起运（约 ${yun.start.solarDate}），大运：${first}`;
}

export function buildBaziSystemMarkdown(input, geo, chart) {
  const standardPillars = chart.standard.pillars.map(formatPillarLine).join('\n- ');
  const trueSolarLines = chart.differsByTrueSolarTime
    ? `\n\n### 真太阳时参考盘\n- 地方真太阳时参考：${chart.timeCorrection.trueSolarTime}（总修正 ${chart.timeCorrection.trueSolarOffsetMinutes} 分钟）\n- ${chart.trueSolar.pillars.map(formatPillarLine).join('\n- ')}\n- 说明：本次解读默认采用北京时间四柱；若你希望按真太阳时断盘，应重点参考这一组时柱差异。`
    : `\n\n### 真太阳时参考\n- 地方真太阳时参考：${chart.timeCorrection.trueSolarTime}（总修正 ${chart.timeCorrection.trueSolarOffsetMinutes} 分钟）\n- 真太阳时参考盘与北京时间四柱一致。`;

  return `## 系统排盘结果
- 出生信息：${input.gender}，${input.date} ${input.time}，${input.location}
- 出生地解析：${geo.formattedAddress}（纬度 ${geo.latitude} N，经度 ${geo.longitude} E）
- 排盘口径：阳历出生信息，按节气定月柱，主盘采用北京时间 Asia/Shanghai
- 日主：${chart.standard.dayMaster.gan}${chart.standard.dayMaster.wuXing}
- ${standardPillars}
- 五行统计参考：${Object.entries(chart.standard.wuXingCounts).map(([key, value]) => `${key}${value}`).join('、')}
- 节气边界：上一节 ${chart.standard.jieQi.previousJie.name} ${chart.standard.jieQi.previousJie.time}；下一节 ${chart.standard.jieQi.nextJie.name} ${chart.standard.jieQi.nextJie.time}
- 胎元/命宫/身宫：胎元 ${chart.standard.extra.taiYuan}（${chart.standard.extra.taiYuanNaYin}），命宫 ${chart.standard.extra.mingGong}（${chart.standard.extra.mingGongNaYin}），身宫 ${chart.standard.extra.shenGong}（${chart.standard.extra.shenGongNaYin}）
- 大运：${formatDaYunLine(chart.standard.yun)}${trueSolarLines}

---`;
}

export function buildBaziMessages(input, geo, chart) {
  const chartJson = JSON.stringify({ birth: input, geocode: geo, chart }, null, 2);

  const systemPrompt = `你是一位严谨的中国传统命理师。服务端已经完成八字排盘，你必须只基于结构化排盘数据解读，不得自行改写四柱、节气、大运、五行、十神或真太阳时结果。
请使用优雅、克制、结构清晰的 Markdown 输出，不要使用一级标题，不要使用 Markdown 表格。
服务端会在回答开头先输出“系统排盘结果”，你不要重复这一段。你只需要从“命局解读”开始，分析日主、月令、五行流通、十神结构、格局倾向、用神取向、大运趋势和给来访者的实际建议。
如果 trueSolar 参考盘与 standard 主盘不同，必须明确说明这是流派口径差异，不要把两套盘混在一起断。`;

  const userPrompt = `来访者提供了以下出生信息：
- 性别：${input.gender}
- 阳历出生日期：${input.date}
- 出生时间：${input.time}
- 出生地点：${input.location}

服务端已完成高德地理编码、节气八字排盘、真太阳时参考盘与大运计算，结果如下：

\`\`\`json
${chartJson}
\`\`\`

请输出“命局解读”部分。`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}

export function createSseContentChunk(content) {
  return `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;
}
