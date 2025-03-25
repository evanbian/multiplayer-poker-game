# 多人局域网德州扑克游戏架构设计

本文档详细描述了多人局域网德州扑克游戏的系统架构设计，作为跨会话开发的参考。

## 系统概览

本系统采用前后端分离架构，分为客户端和服务端两大部分：

- **客户端**：基于React的前端应用，负责游戏界面和用户交互
- **服务端**：基于Node.js的后端服务，负责游戏逻辑和多人通信

## 系统架构图

```
+-------------------+       WebSocket        +-------------------+
|                   |  <------------------>  |                   |
|    客户端(React)   |                        |   服务端(Node.js)  |
|                   |                        |                   |
+-------------------+                        +-------------------+
        |                                             |
        v                                             v
+-------------------+                        +-------------------+
|                   |                        |                   |
|     用户界面UI      |                        |    游戏核心逻辑     |
|                   |                        |                   |
+-------------------+                        +-------------------+
        |                                             |
        v                                             v
+-------------------+                        +-------------------+
|                   |                        |                   |
|   状态管理(Redux)   |                        |   房间/会话管理     |
|                   |                        |                   |
+-------------------+                        +-------------------+
```

## 核心模块设计

### 客户端模块

1. **UI组件系统**
   - 游戏桌面组件
   - 玩家座位组件
   - 扑克牌组件
   - 下注控制组件
   - 游戏状态显示组件
   - 聊天组件

2. **状态管理**
   - 游戏状态
   - 玩家状态
   - UI状态

3. **通信层**
   - Socket.IO客户端连接管理
   - 消息收发处理
   - 重连机制

### 服务端模块

1. **游戏核心引擎**
   - 牌局管理
   - 规则判定
   - 回合控制
   - 下注管理

2. **房间/会话管理**
   - 房间创建与销毁
   - 玩家加入与离开
   - 座位分配

3. **通信服务**
   - Socket.IO服务端
   - 客户端连接管理
   - 消息广播与定向发送

## 数据模型

### 游戏数据模型

```javascript
// 牌桌模型
Table = {
  id: String,               // 牌桌唯一ID
  name: String,             // 牌桌名称
  maxPlayers: Number,       // 最大玩家数 (2-9)
  minBet: Number,           // 最小下注额
  players: [Player],        // 玩家列表
  seats: [Seat],            // 座位情况
  gameState: GameState,     // 当前游戏状态
  communityCards: [Card],   // 公共牌
  pot: Number,              // 当前底池
  currentBet: Number,       // 当前回合最高下注额
  dealerPosition: Number,   // 庄家位置
  currentTurn: Number,      // 当前回合玩家位置
  round: String             // 当前回合 ('preflop', 'flop', 'turn', 'river')
}

// 玩家模型
Player = {
  id: String,               // 玩家唯一ID
  name: String,             // 玩家名称
  chips: Number,            // 玩家筹码
  bet: Number,              // 当前回合已下注额
  holeCards: [Card],        // 手牌
  isActive: Boolean,        // 是否在游戏中
  isFolded: Boolean,        // 是否弃牌
  isAllIn: Boolean,         // 是否全押
  seatPosition: Number      // 座位位置
}

// 座位模型
Seat = {
  position: Number,         // 座位位置
  playerId: String,         // 座位上的玩家ID
  isOccupied: Boolean       // 是否被占用
}

// 游戏状态
GameState = {
  status: String,           // 'waiting', 'starting', 'running', 'finished'
  startTime: Date,          // 游戏开始时间
  winners: [Player],        // 获胜者
  lastAction: Action        // 最后一个动作
}

// 卡牌模型
Card = {
  suit: String,             // 花色 ('hearts', 'diamonds', 'clubs', 'spades')
  rank: String              // 点数 ('2'-'10', 'J', 'Q', 'K', 'A')
}

// 动作模型
Action = {
  type: String,             // 'fold', 'check', 'call', 'bet', 'raise', 'all-in'
  playerId: String,         // 执行动作的玩家
  amount: Number,           // 动作涉及的金额
  timestamp: Date           // 动作发生的时间
}
```

## 通信协议

基于Socket.IO的事件通信协议：

### 客户端到服务端事件

1. `join_room`：玩家加入房间
2. `leave_room`：玩家离开房间
3. `sit_down`：玩家入座
4. `stand_up`：玩家起立
5. `player_action`：玩家行动（下注、加注、弃牌等）
6. `ready`：玩家准备
7. `chat_message`：发送聊天消息

### 服务端到客户端事件

1. `room_update`：房间信息更新
2. `game_state_update`：游戏状态更新
3. `player_update`：玩家信息更新
4. `deal_cards`：发牌
5. `community_cards_update`：公共牌更新
6. `turn_update`：回合更新
7. `pot_update`：底池更新
8. `game_result`：游戏结果
9. `error`：错误消息
10. `chat_broadcast`：聊天消息广播

## 技术选型详情

### 前端技术

- **React 18+**：UI框架
- **Redux Toolkit**：状态管理
- **Styled Components**：CSS样式管理
- **Socket.IO Client**：WebSocket通信
- **React Router**：路由管理
- **React Spring**：动画效果

### 后端技术

- **Node.js**：运行环境
- **Express**：HTTP服务框架
- **Socket.IO**：WebSocket通信
- **Pokersolver**：扑克牌规则判定

## 开发规范

1. **目录结构**：遵循特性优先的组织方式
2. **命名规范**：使用驼峰命名法(camelCase)
3. **异步处理**：使用async/await处理异步逻辑
4. **错误处理**：统一错误处理机制

## 部署与运行

1. **开发环境**：本地开发服务器
2. **构建流程**：使用webpack打包
3. **部署方式**：可独立部署或同时部署

## 扩展性考虑

1. 支持不同的扑克游戏变种（未来）
2. 支持自定义规则（未来）
3. 支持观战模式（未来）
4. 支持游戏回放（未来）

## 性能优化

1. 使用React.memo和useMemo减少不必要的重渲染
2. 使用WebSocket保持低延迟通信
3. 优化游戏逻辑执行效率
4. 优化组件渲染性能

## 安全性考虑

1. 防止客户端作弊（关键逻辑置于服务端）
2. 通信加密
3. 防止离线后资源占用
