// client/src/services/socket/socketService.js
import { io } from 'socket.io-client';
import { store } from '../../store';
import {
  setRoomInfo,
  updatePlayers,
  updateSeats,
  updateGameState,
  updatePlayerCards,
  updateCommunityCards,
  updatePot,
  setCurrentTurn,
  playerActionDone,
  gameStarted,
  gameEnded,
  roundEnded,
  setWinners  // 添加这一行导入setWinners动作创建器
} from '../../store/slices/gameSlice';
import { addMessage } from '../../store/slices/chatSlice';
import { setError, setNotification } from '../../store/slices/uiSlice';
import { setPlayerInfo } from '../../store/slices/authSlice';

let socket = null;

// 初始化Socket连接
export const initSocket = (serverUrl = 'http://localhost:3001') => {
  if (socket) return socket;

  socket = io(serverUrl, {
    reconnectionAttempts: 5,
    timeout: 10000,
  });

  setupSocketListeners();
  return socket;
};

// 设置Socket事件监听
const setupSocketListeners = () => {
  // 连接成功
  socket.on('connect_success', (data) => {
    console.log('连接到服务器，玩家ID:', data.playerId);
    localStorage.setItem('playerId', data.playerId);
    
    // 更新玩家ID
    store.dispatch(setPlayerInfo({
      playerId: data.playerId,
      playerName: localStorage.getItem('playerName') || ''
    }));
  });

  // 房间列表更新
  socket.on('room_list', (data) => {
    store.dispatch({ type: 'rooms/setRooms', payload: data.rooms });
  });

  // 成功加入房间
  socket.on('room_joined', (data) => {
    console.log('成功加入房间:', data);
    store.dispatch(setRoomInfo(data.room));
    store.dispatch(updatePlayers(data.players));
    store.dispatch(updateSeats(data.seats || [])); // 确保seats数据存在
    store.dispatch(setNotification({
      message: `成功加入房间: ${data.room.name}`,
      type: 'success'
    }));
  });

  // 房间信息更新
  socket.on('room_update', (data) => {
    console.log('房间信息更新:', data);
    store.dispatch(setRoomInfo(data.room));
    store.dispatch(updatePlayers(data.players));
    if (data.seats) {
      store.dispatch(updateSeats(data.seats));
    }
  });

  // 玩家加入
  socket.on('player_joined', (data) => {
    store.dispatch({ type: 'game/playerJoined', payload: data.player });
    store.dispatch(setNotification({
      message: `玩家 ${data.player.name} 加入了房间`,
      type: 'info'
    }));
  });

  // 玩家离开
  socket.on('player_left', (data) => {
    store.dispatch({ type: 'game/playerLeft', payload: data.playerId });
    store.dispatch(setNotification({
      message: `一位玩家离开了房间`,
      type: 'info'
    }));
  });

  // 座位状态更新
  socket.on('seat_update', (data) => {
    console.log('座位状态更新:', data);
    store.dispatch(updateSeats(data.seats));
  });

  // 玩家信息更新
  socket.on('player_update', (data) => {
    store.dispatch({ type: 'game/updatePlayer', payload: data.player });
  });

  // 游戏状态更新
  socket.on('game_state', (data) => {
    store.dispatch(updateGameState(data.state));
  });

  // 游戏开始
  socket.on('game_started', (data) => {
    store.dispatch(gameStarted(data.tableState));
    store.dispatch(setNotification({
      message: '游戏开始!',
      type: 'success'
    }));
  });

  // 发放手牌
  socket.on('deal_hole_cards', (data) => {
    store.dispatch(updatePlayerCards(data.cards));
  });

  //发放公共牌
  socket.on('deal_community_cards', (data) => {
  // 记录发牌动作到日志
  store.dispatch({
    type: 'game/dealCommunityCards',
    payload: {
      cards: data.cards,
      round: data.round
    }
  });
  
  // 更新公共牌
  store.dispatch(updateCommunityCards(data.cards));
  store.dispatch(setNotification({
    message: `${getRoundName(data.round)}`,
    type: 'info'
  }));
});

  // 轮到玩家行动
  socket.on('turn_changed', (data) => {
    store.dispatch(setCurrentTurn(data));
  });

  // 玩家完成动作
  socket.on('player_action_done', (data) => {
    store.dispatch(playerActionDone(data));
    const action = data.action.type;
    const playerId = data.playerId;
    const players = store.getState().game.players;
    const player = players.find(p => p.id === playerId);
    const playerName = player ? player.name : '玩家';
    
    let message = '';
    switch (action) {
      case 'fold':
        message = `${playerName} 弃牌`;
        break;
      case 'check':
        message = `${playerName} 过牌`;
        break;
      case 'call':
        message = `${playerName} 跟注`;
        break;
      case 'bet':
        message = `${playerName} 下注 ${data.action.amount}`;
        break;
      case 'raise':
        message = `${playerName} 加注至 ${data.action.amount}`;
        break;
      case 'all-in':
        message = `${playerName} 全押!`;
        break;
      default:
        message = `${playerName} 采取了行动: ${action}`;
    }
    
    store.dispatch(setNotification({
      message,
      type: 'info'
    }));
  });

  // 底池更新
  socket.on('pot_update', (data) => {
    store.dispatch(updatePot({
      pot: data.pot,
      sidePots: data.sidePots || []
    }));
  });
  // 游戏结束
  socket.on('round_ended', (data) => {
  // 记录获胜者
  if (data.winners && data.winners.length > 0) {
    store.dispatch(setWinners(data.winners));
  }
  
  // 原有处理逻辑
  store.dispatch(roundEnded(data));
  store.dispatch(setNotification({
    message: '回合结束，结算中...',
    type: 'info'
  }));
});

  // 游戏结束
  socket.on('game_ended', () => {
    store.dispatch(gameEnded());
    store.dispatch(setNotification({
      message: '游戏结束',
      type: 'info'
    }));
  });

  // 聊天消息
  socket.on('receive_message', (data) => {
    store.dispatch(addMessage(data));
  });

  // 错误处理
  socket.on('error', (data) => {
    console.error('Socket错误:', data);
    store.dispatch(setError({
      code: data.code,
      message: data.message
    }));
  });

  // 通知消息
  socket.on('notification', (data) => {
    store.dispatch(setNotification({
      message: data.message,
      type: data.type || 'info'
    }));
  });

  // 连接错误
  socket.on('connect_error', (error) => {
    console.error('连接错误:', error);
    store.dispatch(setError({
      code: 'CONNECTION_ERROR',
      message: '连接服务器失败，请检查网络连接'
    }));
  });

  // 断开连接
  socket.on('disconnect', (reason) => {
    console.log('断开连接:', reason);
    store.dispatch(setNotification({
      message: '与服务器断开连接',
      type: 'error'
    }));
  });
};

// 辅助函数 - 获取回合名称
const getRoundName = (round) => {
  switch (round) {
    case 'preflop':
      return '发牌阶段';
    case 'flop':
      return '翻牌阶段';
    case 'turn':
      return '转牌阶段';
    case 'river':
      return '河牌阶段';
    case 'showdown':
      return '摊牌阶段';
    default:
      return round;
  }
};

// 发送操作到服务器
export const sendAction = (action, amount = 0) => {
  if (!socket) return false;
  
  socket.emit('player_action', { action, amount });
  return true;
};

// 创建房间
export const createRoom = (roomName, playerName, maxPlayers = 9, minBet = 10) => {
  if (!socket) return false;
  
  // 保存玩家名称到本地存储
  localStorage.setItem('playerName', playerName);
  
  console.log('创建房间:', { roomName, playerName, maxPlayers, minBet });
  socket.emit('create_room', { roomName, playerName, maxPlayers, minBet });
  return true;
};

// 加入房间
export const joinRoom = (roomId, playerName) => {
  if (!socket) return false;
  
  // 保存玩家名称到本地存储
  localStorage.setItem('playerName', playerName);
  
  console.log('加入房间:', { roomId, playerName });
  socket.emit('join_room', { roomId, playerName });
  return true;
};

// 离开房间
export const leaveRoom = () => {
  if (!socket) return false;
  
  console.log('离开房间');
  socket.emit('leave_room');
  return true;
};

// 入座
export const sitDown = (seatPosition) => {
  if (!socket) return false;
  
  console.log('入座位置:', seatPosition);
  socket.emit('sit_down', { seatPosition });
  return true;
};

// 起立
export const standUp = () => {
  if (!socket) return false;
  
  console.log('起立');
  socket.emit('stand_up');
  return true;
};

// 准备状态切换
export const toggleReady = (ready) => {
  if (!socket) return false;
  
  console.log('准备状态:', ready);
  socket.emit('player_ready', { ready });
  return true;
};

// 发送聊天消息
export const sendChatMessage = (message) => {
  if (!socket) return false;
  
  socket.emit('send_message', { message });
  return true;
};

// 断开连接
export const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
export const updateNickname = (newName) => {
  if (!socket) return false;
  
  // 保存玩家名称到本地存储
  localStorage.setItem('playerName', newName);
  
  // 发送更新事件到服务器
  socket.emit('update_nickname', { name: newName });
  return true;
};

export default {
  initSocket,
  sendAction,
  createRoom,
  joinRoom,
  leaveRoom,
  sitDown,
  standUp,
  toggleReady,
  sendChatMessage,
  updateNickname, // 添加新函数
  disconnect
};
