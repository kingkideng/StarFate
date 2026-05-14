# StarFate ✨

在星空与阴影中揭示宿命。StarFate 融合了古老的神秘学传统与现代 AI。无需多言，一切早已在命运中书写。

## 🔮 核心功能 (Features)

目前应用包含三大核心模块，所有解读均由 DashScope 大模型结合专业命理与神秘学知识自动生成，兼具专业性与极高审美：

### 1. 🎴 塔罗指引 (Tarot Deck)
*   **经典牌阵**：采用经典的韦特塔罗牌阵（过去、现在、未来 3 张牌）。
*   **专属问题**：用户可以默念特定的问题，或留空寻求命运的整体指引。
*   **沉浸体验**：自动抽取并渲染高清塔罗牌面。AI 将融合神秘学符号学与心理学，给出直指内心的深度解读。

### 2. 🌌 占星星盘 (Astrology Chart)
*   **精准定制**：需要输入用户的具体性别、出生日期、时间与地点，用于严谨的星盘校验。用户信息将在占星与八字模块之间自动互通，避免重复填写。
*   **核心配置**：服务端先通过高德地理编码解析出生地经纬度，再用本命盘计算库提取“太阳”（核心意志）、“月亮”（潜意识与情感）和“上升”（人格面具）三大星座，AI 只负责基于确定数据解读。
*   **灵魂洞察**：分析三大维度之间的隐秘张力、能量互动，书写一份探讨灵魂进化方向的详实占星报告。

### 3. ☯ 中国八字 (Chinese Bazi)
*   **传统推演**：输入性别、阳历出生日期、时间与地点，服务端先通过高德解析出生地，再用历法库按节气排出四柱八字。用户信息在跨模块切换时自动保存与同步计算。
*   **阴阳流转**：程序计算乾造/坤造对应的大运顺逆、起运时间、五行、十神、纳音、藏干，并同时给出真太阳时参考盘，避免完全依赖大模型推算。
*   **东方美学**：AI 只基于已计算出的结构化命盘进行解读，使用五行（金木水火土）与天干地支的美学意象，输出具有东方禅意的命运解析、喜忌用神判断及人生转机提示。

### 4. 🕯️ 命运解惑 (Clarification)
*   **持续指引**：在生成塔罗、星盘或八字报告后，支持至多 3 轮的对话解惑。AI 将基于上下文报告进行追问分析，在避免 Token 消耗过多的同时确保恰到好处的解答。

---

## 🛠️ 技术栈 (Tech Stack)

*   **核心框架：** React 18 / Vite / TypeScript
*   **样式与视觉：** Tailwind CSS 搭配深色暗黑基调，中文字体优先采用本地/自托管 `霞鹜文楷 Lite`，并提供系统中文字体兜底，营造神秘学宿命感与高级感。
*   **动画加载：** 采用 `motion/react` 打造如梦似幻的丝滑动画表现。
*   **大语言模型：** 阿里云百炼 DashScope OpenAI-compatible API，默认模型为 `qwen3.6-flash-2026-04-16`，通过服务端代理进行流式输出，确保 API Key 不暴露到浏览器。
*   **星盘计算：** 高德地图 Web 服务地理编码 + `circular-natal-horoscope-js`，在服务端完成经纬度解析、本命盘计算与结构化星盘注入，避免大模型猜测太阳、月亮和上升。
*   **八字排盘：** 高德地图 Web 服务地理编码 + `lunar-javascript`，在服务端完成节气四柱、五行、十神、藏干、大运和真太阳时参考盘计算，AI 只负责命理解读。
*   **静态资源：** 塔罗牌面使用项目内置 WebP 资源，避免依赖外部图床；字体运行时不再依赖 Google Fonts 或 jsDelivr。
*   **API 代理：** 前端通过 `/api/chat` 请求通用流式接口，占星模块通过 `/api/astrology` 完成“地理编码 -> 星盘计算 -> AI 解读”的闭环，兼容旧的 `/api/gemini` 路径。

---

## 🚀 部署指南 (Deployment)

本项目原生支持标准的 Docker 部署，并配置了 **GitHub Actions** workflows，方便一键构建并推送到 GitHub Container Registry (ghcr.io)。

### 环境变量
使用前需确保有有效的阿里云百炼 DashScope API Key。占星模块还需要高德开放平台 Web 服务 API Key，用于出生地地理编码：

\`\`\`env
DASHSCOPE_API_KEY=your_dashscope_api_key_here
DASHSCOPE_MODEL_NAME=qwen3.6-flash-2026-04-16
AMAP_API_KEY=your_amap_web_service_key_here
\`\`\`

`AMAP_API_KEY` 只在服务端使用，不会暴露到浏览器。部署到 Vercel 时，请在项目的 Environment Variables 中同时配置 `DASHSCOPE_API_KEY`、`DASHSCOPE_MODEL_NAME` 和 `AMAP_API_KEY`，Preview 与 Production 环境都需要按需勾选。

### 字体
霞鹜文楷 Lite 已通过 `public/fonts/LXGWWenKaiLite-Regular.ttf` 自托管。项目会优先使用该字体，并在字体不可用时回退到系统中文字体。

### 依赖 GitHub Actions 自动构建 (推荐)
1. Fork 本仓库。
2. 在你仓库的 **Settings -> Secrets and variables -> Actions** 中，添加一个新的 Secret，命名为 \`DASHSCOPE_API_KEY\`。
3. 推送代码到 \`main\` 或 \`master\` 分支，GitHub Actions 将会自动打包构建 Docker 镜像，并推送到你账户下的 \`ghcr.io\`。
4. 你的服务器只需登录 GitHub 镜像服务，随后通过 \`docker pull\` 拉取运行即可对外提供服务。

### 通过 Docker 本地构建
\`\`\`bash
# 构建镜像
docker build -t starfate-app .

# 运行容器并映射 3000 端口
docker run -d -p 3000:3000 \
  -e DASHSCOPE_API_KEY=你的百炼密钥 \
  -e AMAP_API_KEY=你的高德Web服务密钥 \
  starfate-app
\`\`\`
服务启动后，访问 \`http://localhost:3000\` 即可探索属于你的宿命轨迹。

也可以在普通 Node 环境中运行：

\`\`\`bash
npm ci
npm run build
DASHSCOPE_API_KEY=你的百炼密钥 AMAP_API_KEY=你的高德Web服务密钥 npm start
\`\`\`
