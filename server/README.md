# 德州扑克游戏 - 后端服务器

这是多人德州扑克游戏的后端服务器，使用Node.js和Socket.IO实现。

## 目录结构

```
server/
├── src/
│   ├── config/             # 配置文件
│   ├── models/             # 数据模型
│   ├── services/           # 业务逻辑服务
│   │   ├── game/           # 游戏逻辑
│   │   ├── room/           # 房间管理
│   │   └── socket/         # Socket通信
│   ├── utils/              # 工具函数
│   └── app.js              # 应用入口
├── test/                   # 测试文件
├── .env                    # 环境变量
├── .eslintrc               # ESLint配置
├── .gitignore              # Git忽略文件
├── package.json            # 项目依赖
└── README.md               # 项目说明
```

## 安装

```bash
# 安装依赖
npm install
```

## 运行

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 开发规范

- 使用ES6+语法
- 使用async/await处理异步
- 统一错误处理
- 代码格式化使用ESLint
