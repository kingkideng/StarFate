# ---- 编译阶段 (Builder) ----
FROM node:20-alpine AS builder

WORKDIR /app

# 1. 复制依赖描述文件并安装所有依赖
COPY package*.json ./
RUN npm install

# 2. 复制所有源代码到容器内
COPY . .

# 3. 打包前端静态文件（生成到 dist 目录）
RUN npm run build

# ---- 运行阶段 (Runner) ----
FROM node:20-alpine AS runner

WORKDIR /app

# 1. 安装生产依赖
COPY package*.json ./
RUN npm install --omit=dev

# 2. 从上一个阶段（编译阶段）把打包好的静态文件和生产服务复制过来
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.mjs ./server.mjs

# 3. 声明应用运行在 3000 端口
EXPOSE 3000

# 4. 启动服务，将 API 和静态页面统一交给 Express
CMD ["node", "server.mjs"]
