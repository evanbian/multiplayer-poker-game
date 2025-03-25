// server/src/services/socket/index.js
const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger');
const roomService = require('../room');
const gameService = require('../game');

// 连接用户映射
const connectedUsers = new Map();
let io; // 保存io实例

// 初始化Socket.IO服务器
const initSocketServer = (socketIo) => {
  io = socketIo; // 保存引用
  
  io.on('connection', (socket) => {
    logger.info(`New connection: ${socket.id}`);
    
    // 为新连接的用户分配临时ID
    const playerId = uuidv4();
    connectedUsers.set(socket.id, { id: playerId, roomId: null, name: null });
    
    // 发送连接成功事件
    socket.emit('connect_success', { playerId });
    
    // 发送可用房间列表
    socket.emit('room_list', { rooms: roomService.getPublicRooms() });

    // 客户端断开连接
    socket.on('disconnect', () => {
      handleDisconnect(socket);
    });

    // 创建房间
    socket.on('create_room', (data) => {
      handleCreateRoom(socket, data);
    });

    // 加入房间
    socket.on('join_room', (data) => {
      handleJoinRoom(socket, data);
    });

    // 离开房间
    socket.on('leave_room', () => {
      handleLeaveRoom(socket);
    });

    // 入座
    socket.on('sit_down', (data) => {
      handleSitDown(socket, data);
    });

    // 起立
    socket.on('stand_up', () => {
      handleStandUp(socket);
    });

    // 准备状态切换
    socket.on('player_ready', (data) => {
      handlePlayerReady(socket, data);
    });

    // 玩家动作
    socket.on('player_action', (data) => {
      handlePlayerAction(socket, data);
    });

    // 聊天消息
    socket.on('send_message', (data) => {
      handleChatMessage(socket, data);
    });
  });
};

// 处理断开连接
const handleDisconnect = (socket) => {
  const userData = connectedUsers.get(socket.id);
  if (!userData) return;
  
  logger.info(`User disconnected: ${socket.id}`);
  
  // 如果用户在房间中，处理离开房间逻辑
  if (userData.roomId) {
    try {
      // 先检查房间是否仍然存在
      if (roomService.roomExists(userData.roomId)) {
        // 用户离开房间
        roomService.leaveRoom(userData.id, userData.roomId);
        socket.leave(userData.roomId);
        
        // 通知房间其他玩家
        socket.to(userData.roomId).emit('player_left', { playerId: userData.id });
        
        // 只有当房间仍然存在时才发送房间更新
        if (roomService.roomExists(userData.roomId)) {
          socket.to(userData.roomId).emit('room_update', {
            room: roomService.getRoomInfo(userData.roomId),
            players: roomService.getPlayersInRoom(userData.roomId)
          });
        }
        
        // 更新房间列表
        io.emit('room_list', { rooms: roomService.getPublicRooms() });
      } else {
        logger.info(`Room ${userData.roomId} no longer exists when user ${userData.id} disconnected`);
      }
    } catch (error) {
      logger.error(`Error handling disconnect for user ${userData.id}: ${error.message}`);
    }
  }
  
  // 移除用户记录
  connectedUsers.delete(socket.id);
};

// 处理创建房间
const handleCreateRoom = (socket, data) => {
  try {
    const userData = connectedUsers.get(socket.id);
    if (!userData) return;
    
    const { roomName, playerName, maxPlayers, minBet } = data;
    
    // 验证必要的数据
    if (!roomName || !playerName) {
      return socket.emit('error', { 
        code: 'INVALID_DATA', 
        message: '房间名和玩家名是必须的' 
      });
    }
    
    // 创建新房间
    const roomId = roomService.createRoom({
      name: roomName,
      maxPlayers: maxPlayers || 9,
      minBet: minBet || 10,
      createdBy: userData.id
    });
    
    // 更新用户数据
    userData.name = playerName;
    userData.roomId = roomId;
    connectedUsers.set(socket.id, userData);
    
    // 将用户加入房间
    roomService.joinRoom(userData.id, playerName, roomId);
    socket.join(roomId);
    
    // 发送房间信息
    socket.emit('room_joined', {
      room: roomService.getRoomInfo(roomId),
      players: roomService.getPlayersInRoom(roomId),
      seats: roomService.getSeats(roomId)
    });
    
    // 更新房间列表
    io.emit('room_list', { rooms: roomService.getPublicRooms() });
    
    logger.info(`Room created: ${roomId} by ${userData.id}`);
  } catch (error) {
    logger.error('Error creating room:', error);
    socket.emit('error', { code: 'ROOM_CREATION_FAILED', message: error.message });
  }
};

// 处理加入房间
const handleJoinRoom = (socket, data) => {
  try {
    const userData = connectedUsers.get(socket.id);
    if (!userData) {
      logger.error('User data not found for socket:', socket.id);
      return socket.emit('error', { 
        code: 'USER_NOT_FOUND',
        message: '用户数据不存在，请刷新页面重试'
      });
    }
    
    const { roomId, playerName } = data;
    
    // 验证必要的数据
    if (!roomId || !playerName) {
      return socket.emit('error', { 
        code: 'INVALID_DATA', 
        message: '房间ID和玩家名是必须的' 
      });
    }
    
    // 检查房间是否存在
    if (!roomService.roomExists(roomId)) {
      logger.error(`Room not found: ${roomId}`);
      return socket.emit('error', { 
        code: 'ROOM_NOT_FOUND', 
        message: '房间不存在或已关闭' 
      });
    }
    
    // 检查房间是否已满
    if (roomService.isRoomFull(roomId)) {
      logger.error(`Room is full: ${roomId}`);
      return socket.emit('error', { 
        code: 'ROOM_FULL', 
        message: '房间已满' 
      });
    }
    
    // 如果用户已经在其他房间，先离开
    if (userData.roomId && userData.roomId !== roomId) {
      handleLeaveRoom(socket);
    }
    
    // 更新用户数据
    userData.name = playerName;
    userData.roomId = roomId;
    connectedUsers.set(socket.id, userData);
    
    // 将用户加入房间
    roomService.joinRoom(userData.id, playerName, roomId);
    socket.join(roomId);
    
    // 发送房间信息给新加入的玩家
    socket.emit('room_joined', {
      room: roomService.getRoomInfo(roomId),
      players: roomService.getPlayersInRoom(roomId),
      seats: roomService.getSeats(roomId)
    });
    
    // 通知房间其他玩家
    socket.to(roomId).emit('player_joined', {
      player: roomService.getPlayer(userData.id, roomId)
    });
    
    socket.to(roomId).emit('room_update', {
      room: roomService.getRoomInfo(roomId),
      players: roomService.getPlayersInRoom(roomId),
      seats: roomService.getSeats(roomId)
    });
    
    // 更新房间列表
    io.emit('room_list', { rooms: roomService.getPublicRooms() });
    
    logger.info(`Player ${userData.id} joined room ${roomId}`);
  } catch (error) {
    logger.error('Error joining room:', error);
    socket.emit('error', { code: 'JOIN_ROOM_FAILED', message: error.message });
  }
};

// 处理离开房间
const handleLeaveRoom = (socket) => {
  try {
    const userData = connectedUsers.get(socket.id);
    if (!userData || !userData.roomId) return;
    
    const roomId = userData.roomId;
    
    // 检查房间是否存在
    if (!roomService.roomExists(roomId)) {
      logger.info(`Room ${roomId} no longer exists when user ${userData.id} tried to leave`);
      // 仍然更新用户数据
      userData.roomId = null;
      connectedUsers.set(socket.id, userData);
      socket.leave(roomId);
      return;
    }
    
    // 从房间移除用户
    roomService.leaveRoom(userData.id, roomId);
    socket.leave(roomId);
    
    // 更新用户数据
    userData.roomId = null;
    connectedUsers.set(socket.id, userData);
    
    // 通知房间其他玩家
    socket.to(roomId).emit('player_left', { playerId: userData.id });
    socket.to(roomId).emit('room_update', {
      room: roomService.getRoomInfo(roomId),
      players: roomService.getPlayersInRoom(roomId),
      seats: roomService.getSeats(roomId)
    });
    
    // 更新房间列表
    io.emit('room_list', { rooms: roomService.getPublicRooms() });
    
    logger.info(`Player ${userData.id} left room ${roomId}`);
  } catch (error) {
    logger.error('Error leaving room:', error);
    socket.emit('error', { code: 'LEAVE_ROOM_FAILED', message: error.message });
  }
};

// 处理入座
const handleSitDown = (socket, data) => {
  try {
    const userData = connectedUsers.get(socket.id);
    if (!userData || !userData.roomId) {
      return socket.emit('error', { 
        code: 'NOT_IN_ROOM', 
        message: '您不在房间中，无法入座' 
      });
    }
    
    const { seatPosition } = data;
    const roomId = userData.roomId;
    
    // 检查座位是否可用
    if (!roomService.isSeatAvailable(roomId, seatPosition)) {
      return socket.emit('error', { 
        code: 'SEAT_OCCUPIED', 
        message: '座位已被占用' 
      });
    }
    
    // 玩家入座
    roomService.sitDown(userData.id, roomId, seatPosition);
    
    // 更新房间信息
    io.to(roomId).emit('seat_update', {
      seats: roomService.getSeats(roomId)
    });
    
    io.to(roomId).emit('player_update', {
      player: roomService.getPlayer(userData.id, roomId)
    });
    
    logger.info(`Player ${userData.id} sat down at position ${seatPosition} in room ${roomId}`);
  } catch (error) {
    logger.error('Error sitting down:', error);
    socket.emit('error', { code: 'SIT_DOWN_FAILED', message: error.message });
  }
};

// 处理起立
const handleStandUp = (socket) => {
  try {
    const userData = connectedUsers.get(socket.id);
    if (!userData || !userData.roomId) {
      return socket.emit('error', { 
        code: 'NOT_IN_ROOM', 
        message: '您不在房间中，无法起立' 
      });
    }
    
    const roomId = userData.roomId;
    
    // 玩家起立
    roomService.standUp(userData.id, roomId);
    
    // 更新房间信息
    io.to(roomId).emit('seat_update', {
      seats: roomService.getSeats(roomId)
    });
    
    io.to(roomId).emit('player_update', {
      player: roomService.getPlayer(userData.id, roomId)
    });
    
    logger.info(`Player ${userData.id} stood up in room ${roomId}`);
  } catch (error) {
    logger.error('Error standing up:', error);
    socket.emit('error', { code: 'STAND_UP_FAILED', message: error.message });
  }
};

// 处理玩家准备状态
const handlePlayerReady = (socket, data) => {
  try {
    const userData = connectedUsers.get(socket.id);
    if (!userData || !userData.roomId) {
      return socket.emit('error', { 
        code: 'NOT_IN_ROOM', 
        message: '您不在房间中，无法准备' 
      });
    }
    
    const { ready } = data;
    const roomId = userData.roomId;
    
    // 更新玩家准备状态
    roomService.updatePlayerReady(userData.id, roomId, ready);
    
    // 通知房间所有玩家
    io.to(roomId).emit('player_update', {
      player: roomService.getPlayer(userData.id, roomId)
    });
    
    // 检查是否所有入座玩家都已准备，开始游戏
    if (roomService.areAllSeatedPlayersReady(roomId)) {
      startGame(roomId);
    }
    
    logger.info(`Player ${userData.id} ${ready ? 'ready' : 'not ready'} in room ${roomId}`);
  } catch (error) {
    logger.error('Error updating ready status:', error);
    socket.emit('error', { code: 'READY_UPDATE_FAILED', message: error.message });
  }
};

// 处理玩家动作
const handlePlayerAction = (socket, data) => {
  try {
    const userData = connectedUsers.get(socket.id);
    if (!userData || !userData.roomId) {
      return socket.emit('error', { 
        code: 'NOT_IN_ROOM', 
        message: '您不在房间中，无法执行动作' 
      });
    }
    
    const roomId = userData.roomId;
    
    // 确保游戏正在进行
    if (!gameService.isGameInProgress(roomId)) {
      return socket.emit('error', { 
        code: 'GAME_NOT_IN_PROGRESS', 
        message: '游戏未开始，无法执行动作' 
      });
    }
    
    // 确保是玩家的回合
    if (!gameService.isPlayerTurn(userData.id, roomId)) {
      return socket.emit('error', { 
        code: 'NOT_YOUR_TURN', 
        message: '不是您的回合，无法执行动作' 
      });
    }
    
    // 处理玩家动作
    const result = gameService.handlePlayerAction(userData.id, roomId, data);
    
    // 广播动作结果
    io.to(roomId).emit('player_action_done', {
      playerId: userData.id,
      action: result.action
    });
    
    // 更新游戏状态
    io.to(roomId).emit('game_state', {
      state: gameService.getGameState(roomId)
    });
    
    // 更新玩家信息
    io.to(roomId).emit('player_update', {
      player: roomService.getPlayer(userData.id, roomId)
    });
    
    // 如果有底池更新
    if (result.potUpdated) {
      io.to(roomId).emit('pot_update', {
        pot: gameService.getPot(roomId),
        sidePots: gameService.getSidePots(roomId)
      });
    }
    
    // 检查是否轮到下一个玩家
    if (result.nextPlayer) {
      const nextPlayer = result.nextPlayer;
      io.to(roomId).emit('turn_changed', {
        playerId: nextPlayer,
        timeLeft: 30 // 30秒决策时间
      });
    }
    
    // 检查回合是否结束
    if (result.roundEnded) {
      handleRoundEnd(roomId);
    }
    
    logger.info(`Player ${userData.id} action: ${data.action} in room ${roomId}`);
  } catch (error) {
    logger.error('Error handling player action:', error);
    socket.emit('error', { code: 'ACTION_FAILED', message: error.message });
  }
};

// 处理聊天消息
const handleChatMessage = (socket, data) => {
  try {
    const userData = connectedUsers.get(socket.id);
    if (!userData || !userData.roomId) {
      return socket.emit('error', { 
        code: 'NOT_IN_ROOM', 
        message: '您不在房间中，无法发送消息' 
      });
    }
    
    const { message } = data;
    
    // 验证消息内容
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return socket.emit('error', { 
        code: 'INVALID_MESSAGE', 
        message: '消息内容不能为空' 
      });
    }
    
    const roomId = userData.roomId;
    
    // 向房间内所有玩家广播消息
    io.to(roomId).emit('receive_message', {
      playerId: userData.id,
      playerName: userData.name,
      message,
      timestamp: Date.now()
    });
    
    logger.info(`Chat message from ${userData.id} in room ${roomId}`);
  } catch (error) {
    logger.error('Error sending chat message:', error);
    socket.emit('error', { code: 'CHAT_FAILED', message: error.message });
  }
};

// 处理回合结束
const handleRoundEnd = (roomId) => {
  try {
    // 获取下一个回合状态
    const nextRound = gameService.moveToNextRound(roomId);
    
    // 发送游戏状态更新
    io.to(roomId).emit('game_state', {
      state: gameService.getGameState(roomId)
    });
    
    // 如果有新的公共牌
    if (nextRound.communityCards) {
      io.to(roomId).emit('deal_community_cards', {
        cards: nextRound.communityCards,
        round: nextRound.round
      });
    }
    
    // 如果游戏结束
    if (nextRound.gameEnded) {
      handleGameEnd(roomId, nextRound.winners);
      return;
    }
    
    // 通知当前回合玩家
    const currentPlayer = gameService.getCurrentTurnPlayer(roomId);
    if (currentPlayer) {
      io.to(roomId).emit('turn_changed', {
        playerId: currentPlayer,
        timeLeft: 30 // 30秒决策时间
      });
    }
    
    logger.info(`Round ${nextRound.round} started in room ${roomId}`);
  } catch (error) {
    logger.error('Error handling round end:', error);
    io.to(roomId).emit('error', { 
      code: 'ROUND_END_ERROR', 
      message: '回合结束处理出错' 
    });
  }
};

// 处理游戏结束
const handleGameEnd = (roomId, winners) => {
  try {
    // 通知所有玩家游戏结果
    io.to(roomId).emit('round_ended', {
      winners,
      pot: gameService.getPot(roomId)
    });
    
    // 重置游戏状态
    gameService.resetGame(roomId);
    
    // 更新玩家信息
    const players = roomService.getPlayersInRoom(roomId);
    players.forEach(player => {
      io.to(roomId).emit('player_update', {
        player: roomService.getPlayer(player.id, roomId)
      });
    });
    
    // 通知游戏结束
    io.to(roomId).emit('game_ended');
    
    logger.info(`Game ended in room ${roomId}`);
  } catch (error) {
    logger.error('Error handling game end:', error);
    io.to(roomId).emit('error', { 
      code: 'GAME_END_ERROR', 
      message: '游戏结束处理出错' 
    });
  }
};

// 根据玩家ID获取Socket
const getSocketByPlayerId = (playerId) => {
  for (const [socketId, userData] of connectedUsers.entries()) {
    if (userData.id === playerId) {
      return io.sockets.sockets.get(socketId);
    }
  }
  return null;
};

// 开始游戏
const startGame = (roomId) => {
  try {
    // 初始化游戏
    const gameState = gameService.initGame(roomId);
    
    // 通知所有玩家游戏开始
    io.to(roomId).emit('game_started', {
      tableState: gameState
    });
    
    // 发放手牌给各玩家
    const players = roomService.getSeatedPlayers(roomId);
    players.forEach(player => {
      // 获取玩家对应的socket
      const playerSocket = getSocketByPlayerId(player.id);
      if (playerSocket) {
        playerSocket.emit('deal_hole_cards', {
          cards: gameService.getPlayerCards(player.id, roomId)
        });
      }
    });
    
    // 通知当前回合玩家
    const currentPlayer = gameService.getCurrentTurnPlayer(roomId);
    if (currentPlayer) {
      io.to(roomId).emit('turn_changed', {
        playerId: currentPlayer,
        timeLeft: 30 // 30秒决策时间
      });
    }
    
    logger.info(`Game started in room ${roomId}`);
  } catch (error) {
    logger.error(`Error starting game in room ${roomId}:`, error);
    io.to(roomId).emit('error', {
      code: 'GAME_START_FAILED',
      message: '游戏启动失败，请重试'
    });
  }
};

module.exports = {
  initSocketServer
};
