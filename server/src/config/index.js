// 服务器配置文件
require('dotenv').config();

// 环境变量配置
const config = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
  },
  
  // 客户端配置
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:3000',
  },
  
  // 游戏配置
  game: {
    defaultChips: 1000,      // 默认初始筹码
    defaultMinBet: 10,       // 默认最小下注
    turnTimeLimit: 30,       // 玩家行动时间限制(秒)
    maxPlayers: 9,           // 最大玩家数
    minPlayers: 2,           // 最小玩家数
  },
  
  // 日志配置
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  }
};

module.exports = config;
