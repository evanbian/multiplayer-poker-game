# 多人局域网德州扑克游戏

一个基于React和Socket.IO的多人局域网德州扑克游戏，支持2-9名玩家同时在线游戏。

## 项目概述

本项目是一个在局域网环境下运行的多人德州扑克游戏，具有以下特点：

- 支持2-9名玩家同时游戏
- 基于React构建的前端界面
- 使用Socket.IO实现实时通信
- 为Mac M1优化的性能
- 美观直观的游戏界面

## 项目结构

```
multiplayer-poker-game/
├── docs/                  # 项目文档
│   ├── architecture.md    # 架构设计文档
│   ├── api.md             # API设计文档
│   └── game-rules.md      # 游戏规则文档
├── client/                # 前端React应用
│   ├── public/            # 静态资源
│   └── src/               # 源代码
│       ├── components/    # React组件
│       ├── pages/         # 页面组件
│       ├── services/      # 服务 
│       ├── store/         # Redux状态管理
│       └── styles/        # 样式文件
├── server/                # 后端Node.js服务
│   └── src/               # 源代码
│       ├── config/        # 配置文件
│       ├── models/        # 数据模型
│       ├── services/      # 业务逻辑服务
│       └── utils/         # 工具函数
└── README.md              # 项目说明文档
```

## 技术栈

### 前端
- React 18
- Redux Toolkit (状态管理)
- Socket.IO Client (实时通信)
- Styled Components (样式)
- React Router (路由管理)
- React Spring (动画效果)

### 后端
- Node.js
- Express
- Socket.IO (WebSocket通信)
- Pokersolver (扑克牌规则判定)

## 开发路线图

1. [x] 项目初始化与仓库设置
2. [x] 基础架构设计与文档
3. [x] 后端服务器开发
   - [x] 游戏逻辑
   - [x] 通信层
4. [x] 前端框架搭建
   - [x] Redux store设计
   - [x] Socket.IO客户端服务
   - [x] 路由与页面结构
5. [ ] 前端UI组件开发
   - [x] 游戏桌面组件
   - [x] 玩家座位组件
   - [x] 扑克牌组件
   - [x] 动作控制组件
   - [ ] 动画与过渡效果
6. [ ] 游戏功能实现
   - [x] 房间管理
   - [x] 聊天功能
   - [ ] 游戏记录与历史
   - [ ] 玩家统计
7. [ ] 系统集成测试
8. [ ] 性能优化
9. [ ] 部署支持

## 安装与运行

### 前置条件
- Node.js (v14+)
- npm 或 yarn

### 安装步骤
```bash
# 克隆仓库
git clone https://github.com/yourusername/multiplayer-poker-game.git
cd multiplayer-poker-game

# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 运行开发环境
```bash
# 终端1：启动后端服务
cd server
npm run dev

# 终端2：启动前端应用
cd client
npm start
```

## 如何贡献

1. Fork本仓库
2. 创建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的修改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个Pull Request

## 开发会话记录

为了帮助在不同会话之间保持上下文，我们将在此记录开发过程中的关键决策和进展。

### 会话 #1 (初始化): 2025-03-25
- 创建了项目仓库
- 设置了基本项目结构
- 初始化了README和文档框架
- 设计了基础架构

### 会话 #2 (后端开发): 2025-03-25
- 实现了服务器端核心游戏逻辑
- 开发了房间管理服务
- 实现了Socket.IO通信层
- 完成了玩家动作处理逻辑

### 会话 #3 (前端框架): 2025-03-25
- 设计并实现了Redux状态管理
- 开发了Socket.IO客户端服务
- 创建了主要组件结构
- 实现了基本UI布局和样式

## 下一步计划

1. 优化玩家动作与状态转换动画
2. 实现游戏历史记录功能
3. 添加声音效果
4. 优化移动设备视图
5. 添加玩家数据统计功能
6. 实现观战模式

## 许可证

本项目采用MIT许可证 - 详见 [LICENSE](LICENSE) 文件。
