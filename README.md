# 多人局域网德州扑克游戏

一个基于React和Socket.IO的多人局域网德州扑克游戏，支持2-9名玩家同时在线游戏。

## 项目概述

本项目是一个在局域网环境下运行的多人德州扑克游戏，具有以下特点：

- 支持2-9名玩家同时游戏
- 基于React构建的前端界面
- 使用Socket.IO实现实时通信
- 为Mac M1优化的性能
- 美观直观的游戏界面

## 最新更新

### 2025-03-26 更新
- ✅ 修复了主机创建房间后卡在加载状态的问题
- ✅ 解决了客户端依赖冲突问题
- ✅ 修复了Action按钮无法点击问题
- ✅ 修复了房间加入偶尔失败的问题
- ✅ 添加了便捷的安装脚本与启动命令

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
├── setup.sh               # 安装脚本
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

### 安装方法1（推荐）:
```bash
# 使用安装脚本
chmod +x setup.sh  # 给脚本添加执行权限
./setup.sh
```

### 安装方法2（手动安装）:
```bash
# 克隆仓库
git clone https://github.com/evanbian/multiplayer-poker-game.git
cd multiplayer-poker-game

# 一键安装所有依赖
npm run install-all

# 或者分别安装
# 安装根目录依赖
npm install

# 安装客户端依赖（添加--legacy-peer-deps解决依赖冲突）
cd client
npm install --legacy-peer-deps

# 安装后端依赖
cd ../server
npm install
```

### 运行开发环境
```bash
# 同时启动前后端（在根目录）
npm run dev

# 或分别启动
# 终端1：启动后端服务（在server目录）
npm run dev

# 终端2：启动前端应用（在client目录）
npm start
```

访问 http://localhost:3000 即可打开游戏。

## 游戏规则

本游戏采用标准德州扑克规则，详细规则请参考 [docs/game-rules.md](docs/game-rules.md)。

## 疑难解答

如果您在安装或运行过程中遇到问题，请尝试以下解决方案：

1. **安装依赖失败**:
   ```bash
   # 清除npm缓存
   npm cache clean --force
   
   # 使用--legacy-peer-deps参数安装
   cd client
   npm install --legacy-peer-deps
   ```

2. **启动失败**:
   - 确保端口3000和3001未被占用
   - 检查server目录下是否有.env文件
   - 检查日志目录是否存在（server/logs）

3. **连接问题**:
   - 确保服务器正在运行
   - 检查控制台是否有Socket.IO连接错误
   - 尝试重新启动服务器和客户端

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

### 会话 #4 (修复与优化): 2025-03-25
- 修复了GameTable.js中的代码重复问题
- 创建了项目配置文件和环境变量设置
- 编写了详细的项目启动指南
- 更新了开发文档

### 会话 #5 (Bug修复): 2025-03-26
- 修复了主机创建房间后卡在加载状态的问题
- 解决了客户端依赖冲突问题
- 修复了Action按钮无法点击问题
- 修复了房间加入偶尔失败的问题
- 添加了便捷的安装脚本与启动命令

## 下一步计划

1. 优化玩家动作与状态转换动画
2. 实现游戏历史记录功能
3. 添加声音效果
4. 优化移动设备视图
5. 添加玩家数据统计功能
6. 实现观战模式

## 许可证

本项目采用MIT许可证 - 详见 [LICENSE](LICENSE) 文件。

## 常见问题

### Q: 如何在局域网中与朋友一起玩？
A: 启动服务器后，确保服务器配置允许外部访问（在server/.env中设置），然后让局域网中的朋友通过您的IP地址和端口访问。

### Q: 游戏中可以容纳多少玩家？
A: 本游戏支持2-9名玩家同时参与。

### Q: 如何增加初始筹码数量？
A: 可以在server/src/config/index.js文件中修改默认筹码数量。

## 联系方式

如有问题或建议，请通过GitHub Issues提交。

---

祝您游戏愉快！
