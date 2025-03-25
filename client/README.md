# 德州扑克游戏 - 前端应用

这是多人德州扑克游戏的前端应用，使用React和Socket.IO实现。

## 目录结构

```
client/
├── public/                 # 静态资源
│   ├── assets/             # 图片和资源文件
│   │   ├── cards/          # 扑克牌图片
│   │   ├── chips/          # 筹码图片
│   │   ├── sounds/         # 音效文件
│   │   └── backgrounds/    # 背景图片
│   ├── favicon.ico         # 网站图标
│   └── index.html          # HTML模板
├── src/
│   ├── components/         # React组件
│   │   ├── common/         # 通用组件
│   │   ├── game/           # 游戏相关组件
│   │   ├── layout/         # 布局组件
│   │   └── ui/             # UI组件
│   ├── hooks/              # 自定义钩子
│   ├── pages/              # 页面组件
│   ├── services/           # 服务
│   │   └── socket/         # Socket.IO服务
│   ├── store/              # Redux状态管理
│   │   ├── actions/        # Action创建器
│   │   ├── reducers/       # Reducer
│   │   └── slices/         # Redux Toolkit切片
│   ├── styles/             # 样式文件
│   ├── utils/              # 工具函数
│   ├── App.js              # 应用组件
│   ├── index.js            # 应用入口
│   └── Routes.js           # 路由配置
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
npm start

# 构建生产版本
npm run build
```

## 设计与开发规范

- 使用函数组件和React Hooks
- 使用Redux Toolkit管理状态
- 使用Styled Components进行样式管理
- 组件应遵循单一职责原则
- 使用自定义钩子抽象逻辑
