# ---- 编译阶段 (Builder) ----
FROM node:20-alpine AS builder

WORKDIR /app

# 1. 复制依赖描述文件并安装所有依赖
COPY package*.json ./
RUN npm ci

# 2. 复制所有源代码到容器内
COPY . .

# 3. 接收构建参数并在构建时暴露出环境变量（给前端打包使用）
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# 4. 打包前端静态文件（生成到 dist 目录）
RUN npm run build

# ---- 运行阶段 (Runner) ----
FROM node:20-alpine AS runner

WORKDIR /app

# 1. 安装小巧的静态文件服务器工具
RUN npm install -g serve

# 2. 从上一个阶段（编译阶段）把打包好的静态文件复制过来
COPY --from=builder /app/dist ./dist

# 3. 声明应用运行在 3000 端口
EXPOSE 3000

# 4. 启动服务，将流量导向打包好的静态页面
CMD ["serve", "-s", "dist", "-l", "3000"]
