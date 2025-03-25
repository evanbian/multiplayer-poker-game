#!/bin/bash
# 多人德州扑克游戏 - 安装脚本

echo "===== 开始安装多人德州扑克游戏 ====="

# 检查Node.js是否已安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js (v14+)"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "错误: Node.js版本过低，需要v14或更高版本"
    echo "当前版本: $(node -v)"
    exit 1
fi

echo "Node.js版本: $(node -v)"
echo "npm版本: $(npm -v)"

# 安装根目录依赖
echo "安装根目录依赖..."
npm install

# 安装客户端依赖
echo "安装客户端依赖..."
cd client
npm install --legacy-peer-deps
cd ..

# 安装服务端依赖
echo "安装服务端依赖..."
cd server
npm install
cd ..

# 创建.env文件（如果不存在）
if [ ! -f "./server/.env" ]; then
    echo "创建服务端.env文件..."
    cp ./server/.env.example ./server/.env
fi

# 创建日志目录
mkdir -p ./server/logs

echo "===== 安装完成! ====="
echo "使用以下命令启动项目:"
echo "npm run dev"
