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
├── server/                # 后端Node.js服务
└── README.md              # 项目说明文档
```

## 技术栈

### 前端
- React
- Redux (状态管理)
- Socket.IO Client (实时通信)
- Styled Components (样式)

### 后端
- Node.js
- Express
- Socket.IO (WebSocket通信)

## 开发路线图

1. [x] 项目初始化与仓库设置
2. [ ] 基础架构设计与文档
3. [ ] 后端服务器开发
   - [ ] 游戏逻辑
   - [ ] 通信层
4. [ ] 前端开发
   - [ ] UI组件
   - [ ] 游戏界面
   - [ ] 通信集成
5. [ ] 系统集成测试
6. [ ] 性能优化

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

## 版本控制惯例

为了保持项目的有序发展，我们采用以下版本控制惯例：

- `main`: 生产就绪代码
- `develop`: 开发中的代码
- 功能分支: `feature/功能名称`
- 修复分支: `bugfix/问题描述`

## 开发会话记录

为了帮助在不同会话之间保持上下文，我们将在此记录开发过程中的关键决策和进展。

### 会话 #1 (初始化): 2025-03-25
- 创建了项目仓库
- 设置了基本项目结构
- 初始化了README和文档框架
- 设计了基础架构
