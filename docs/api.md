# 多人局域网德州扑克游戏API设计

本文档详细描述了前后端通信的API接口设计，作为开发参考。

## 通信概述

本项目采用Socket.IO实现WebSocket通信，支持实时、双向的通信需求。通信主要分为以下几类：

1. 房间管理相关
2. 游戏流程相关
3. 玩家动作相关
4. 系统通知相关
5. 聊天功能相关

## Socket.IO事件详情

### 1. 客户端发送的事件

#### 连接与房间管理

| 事件名 | 参数 | 描述 |
|-------|------|------|
| `connect` | 无 | 客户端连接到服务器 |
| `join_room` | `{ roomId: string, playerName: string }` | 玩家加入房间 |
| `create_room` | `{ roomName: string, playerName: string, maxPlayers: number, minBet: number }` | 创建新房间 |
| `leave_room` | 无 | 玩家离开当前房间 |

#### 座位与准备

| 事件名 | 参数 | 描述 |
|-------|------|------|
| `sit_down` | `{ seatPosition: number }` | 玩家选择座位入座 |
| `stand_up` | 无 | 玩家离开座位 |
| `player_ready` | `{ ready: boolean }` | 玩家准备状态切换 |

#### 游戏动作

| 事件名 | 参数 | 描述 |
|-------|------|------|
| `player_action` | `{ action: string, amount?: number }` | 玩家行动（如下注、加注等） |
| `fold` | 无 | 玩家弃牌 |
| `check` | 无 | 玩家过牌 |
| `call` | 无 | 玩家跟注 |
| `bet` | `{ amount: number }` | 玩家下注 |
| `raise` | `{ amount: number }` | 玩家加注 |
| `all_in` | 无 | 玩家全押 |

#### 聊天功能

| 事件名 | 参数 | 描述 |
|-------|------|------|
| `send_message` | `{ message: string }` | 发送聊天消息 |

### 2. 服务端发送的事件

#### 房间与游戏状态

| 事件名 | 参数 | 描述 |
|-------|------|------|
| `connect_success` | `{ playerId: string }` | 连接成功，返回玩家ID |
| `room_list` | `{ rooms: Room[] }` | 返回可用房间列表 |
| `room_joined` | `{ room: Room, players: Player[] }` | 成功加入房间 |
| `room_update` | `{ room: Room, players: Player[] }` | 房间信息更新 |
| `game_state` | `{ state: GameState }` | 游戏状态更新 |

#### 玩家相关

| 事件名 | 参数 | 描述 |
|-------|------|------|
| `player_joined` | `{ player: Player }` | 新玩家加入 |
| `player_left` | `{ playerId: string }` | 玩家离开 |
| `seat_update` | `{ seats: Seat[] }` | 座位状态更新 |
| `player_update` | `{ player: Player }` | 玩家信息更新 |

#### 游戏流程

| 事件名 | 参数 | 描述 |
|-------|------|------|
| `game_started` | `{ tableState: TableState }` | 游戏开始 |
| `deal_hole_cards` | `{ cards: Card[] }` | 发放手牌 |
| `deal_community_cards` | `{ cards: Card[], round: string }` | 发放公共牌 |
| `turn_changed` | `{ playerId: string, timeLeft: number }` | 当前回合玩家更改 |
| `player_action_done` | `{ playerId: string, action: Action }` | 玩家完成动作 |
| `pot_update` | `{ pot: number, sidePots?: SidePot[] }` | 底池更新 |
| `round_ended` | `{ winners: Winner[], pot: number }` | 单轮游戏结束 |
| `game_ended` | 无 | 整局游戏结束 |

#### 系统通知

| 事件名 | 参数 | 描述 |
|-------|------|------|
| `notification` | `{ message: string, type: string }` | 系统通知消息 |
| `error` | `{ code: string, message: string }` | 错误消息 |

#### 聊天相关

| 事件名 | 参数 | 描述 |
|-------|------|------|
| `receive_message` | `{ playerId: string, playerName: string, message: string, timestamp: number }` | 接收聊天消息 |

## 数据结构详情

### 房间(Room)

```typescript
interface Room {
  id: string;              // 房间唯一ID
  name: string;            // 房间名称
  maxPlayers: number;      // 最大玩家数
  minBet: number;          // 最小下注额
  createdAt: number;       // 创建时间
  status: RoomStatus;      // 房间状态: 'waiting', 'playing'
  playerCount: number;     // 当前玩家数量
}
```

### 玩家(Player)

```typescript
interface Player {
  id: string;              // 玩家唯一ID
  name: string;            // 玩家名称
  chips: number;           // 筹码数量
  isReady: boolean;        // 是否准备
  isActive: boolean;       // 是否在游戏中
  isFolded: boolean;       // 是否弃牌
  isAllIn: boolean;        // 是否全押
  currentBet: number;      // 当前下注额
  seatPosition: number;    // 座位位置，-1表示未入座
  holeCards?: Card[];      // 手牌，仅发送给玩家本人
}
```

### 座位(Seat)

```typescript
interface Seat {
  position: number;        // 座位位置
  playerId: string | null; // 座位上的玩家ID，null表示空座
  isOccupied: boolean;     // 是否被占用
}
```

### 卡牌(Card)

```typescript
interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';  // 花色
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';  // 点数
  hidden?: boolean;        // 是否隐藏（用于发给其他玩家时隐藏手牌）
}
```

### 动作(Action)

```typescript
interface Action {
  type: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';  // 动作类型
  playerId: string;        // 执行动作的玩家ID
  amount?: number;         // 动作涉及的金额
  timestamp: number;       // 动作时间戳
}
```

### 游戏状态(GameState)

```typescript
interface GameState {
  status: 'waiting' | 'starting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished';  // 游戏状态
  dealerPosition: number;  // 庄家位置
  smallBlindPosition: number;  // 小盲位置
  bigBlindPosition: number;    // 大盲位置
  currentTurn: string;     // 当前行动玩家ID
  pot: number;             // 底池
  mainPot: number;         // 主底池
  sidePots: SidePot[];     // 边池
  communityCards: Card[];  // 公共牌
  minBet: number;          // 最小下注额
  currentBet: number;      // 当前最高下注额
  lastRaise: number;       // 最后一次加注额
}
```

### 边池(SidePot)

```typescript
interface SidePot {
  amount: number;          // 边池金额
  eligiblePlayers: string[];  // 有资格赢取该边池的玩家ID列表
}
```

### 获胜者(Winner)

```typescript
interface Winner {
  playerId: string;        // 获胜玩家ID
  handType: string;        // 获胜牌型
  hand: Card[];            // 最佳组合
  winAmount: number;       // 赢取金额
}
```

## 错误代码

| 错误代码 | 描述 |
|---------|------|
| `ROOM_NOT_FOUND` | 房间不存在 |
| `ROOM_FULL` | 房间已满 |
| `GAME_IN_PROGRESS` | 游戏已经开始 |
| `SEAT_OCCUPIED` |
| `INSUFFICIENT_CHIPS` | 筹码不足 |
| `INVALID_ACTION` | 无效动作 |
| `NOT_YOUR_TURN` | 不是你的回合 |
| `MINIMUM_BET_NOT_MET` | 未达到最低下注额 |
| `CONNECTION_ERROR` | 连接错误 |

## 实现注意事项

1. **安全性**：关键游戏逻辑在服务端实现，防止客户端作弊
2. **一致性**：确保所有玩家看到的游戏状态一致
3. **实时性**：保证信息实时传递，减少延迟
4. **错误处理**：完善的错误处理机制，包括重连逻辑
5. **拓展性**：API设计支持未来功能扩展
