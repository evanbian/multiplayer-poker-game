// 多人德州扑克游戏后端入口文件
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { initSocketServer } = require('./services/socket');
const logger = require('./utils/logger');

// 配置
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// 创建Express应用
const app = express();

// 中间件
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST']
}));
app.use(express.json());

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: 'Poker Game Server is running' });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 创建HTTP服务器
const server = http.createServer(app);

// 创建Socket.IO服务器
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

// 初始化Socket服务
initSocketServer(io);

// 启动服务器
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`WebSocket server initialized`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 导出server用于测试
module.exports = server;
