# 多人德州扑克游戏 - 部署与运行指南

## 部署步骤

按照以下步骤完成项目的部署和运行：

### 1. 获取代码

```bash
# 克隆仓库
git clone https://github.com/evanbian/multiplayer-poker-game.git

# 进入项目目录
cd multiplayer-poker-game
```

### 2. 设置环境

确保您的系统满足以下要求：
- Node.js (v14+)
- npm 或 yarn

### 3. 安装依赖

使用内置的安装脚本完成所有依赖的安装：

```bash
# 添加脚本执行权限
chmod +x setup.sh

# 运行安装脚本
./setup.sh
```

脚本会自动完成以下操作：
- 安装根目录依赖
- 安装客户端依赖（使用 `--legacy-peer-deps` 解决依赖冲突）
- 安装服务器依赖
- 创建 .env 文件（如果不存在）
- 创建日志目录

### 4. 启动项目

```bash
# 同时启动前端和后端
npm run dev
```

这会通过 concurrently 同时运行前端开发服务器和后端服务器。

### 5. 访问游戏

在浏览器中访问：http://localhost:3000

## 局域网游戏设置
