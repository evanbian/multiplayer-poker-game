// 修改 server/src/app.js 增加更多日志
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

console.log('正在加载模块...');

try {
  // 试着加载socket服务
  console.log('尝试加载socket服务...');
  const { initSocketServer } = require('./services/socket');
  console.log('Socket服务加载成功');
  
  const logger = require('./utils/logger');

  // 配置
  const PORT = process.env.PORT || 3001;
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

  console.log('创建Express应用...');
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

  console.log('创建HTTP服务器...');
  // 创建HTTP服务器
  const server = http.createServer(app);

  console.log('创建Socket.IO服务器...');
  // 创建Socket.IO服务器
  const io = new Server(server, {
    cors: {
      origin: CLIENT_URL,
      methods: ['GET', 'POST']
    }
  });

  console.log('初始化Socket服务...');
  // 初始化Socket服务
  initSocketServer(io);

  // 启动服务器
  server.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    logger.info(`Server running on port ${PORT}`);
    logger.info(`WebSocket server initialized`);
  });

  // 处理未捕获的异常
  process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    logger.error('Uncaught Exception:', error);
  });

  // 处理未处理的Promise拒绝
  process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // 导出server用于测试
  module.exports = server;

} catch (error) {
  console.error('启动服务器时出错:', error);
}
