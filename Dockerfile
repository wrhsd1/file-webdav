# 使用官方的 Node.js 14 镜像
# https://hub.docker.com/_/node
FROM node:14

# 创建并切换到应用目录
WORKDIR /usr/src/app

# 复制应用依赖清单到容器中
COPY package*.json ./

# 安装应用依赖
RUN npm install

# 复制应用源代码到容器中
COPY . .

# 暴露端口，使得应用可以被访问
EXPOSE 3000

# 在容器启动时运行你的应用
CMD [ "npm", "start" ]
