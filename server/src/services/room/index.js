// 房间管理服务
const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger');

// 房间数据存储
const rooms = new Map();

// 创建新房间
const createRoom = ({ name, maxPlayers = 9, minBet = 10, createdBy }) => {
  // 验证参数
  if (!name) throw new Error('Room name is required');
  if (maxPlayers < 2 || maxPlayers > 9) throw new Error('Max players must be between 2 and 9');
  if (minBet <= 0) throw new Error('Minimum bet must be greater than 0');
  
  // 生成房间ID
  const roomId = uuidv4();
  
  // 创建座位数组
  const seats = Array(maxPlayers)
    .fill(null)
    .map((_, index) => ({
      position: index,
      playerId: null,
      isOccupied: false
    }));
  
  // 创建房间对象
  const room = {
    id: roomId,
    name,
    maxPlayers,
    minBet,
    createdBy,
    createdAt: Date.now(),
    status: 'waiting', // waiting, playing
    players: new Map(), // 所有在房间中的玩家
    seats,
    gameState: null
  };
  
  // 存储房间
  rooms.set(roomId, room);
  
  logger.info(`Room created: ${roomId}`);
  return roomId;
};

// 玩家加入房间
const joinRoom = (playerId, playerName, roomId) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) throw new Error('Room not found');
  
  const room = rooms.get(roomId);
  
  // 检查房间是否已满
  if (room.players.size >= room.maxPlayers) throw new Error('Room is full');
  
  // 检查玩家是否已在房间中
  if (room.players.has(playerId)) return;
  
  // 创建玩家对象
  const player = {
    id: playerId,
    name: playerName,
    chips: 1000, // 初始筹码
    isReady: false,
    isActive: false,
    isFolded: false,
    isAllIn: false,
    currentBet: 0,
    totalBet: 0,
    seatPosition: -1, // -1表示未入座
    holeCards: []
  };
  
  // 添加玩家到房间
  room.players.set(playerId, player);
  
  logger.info(`Player ${playerId} joined room ${roomId}`);
};

// 玩家离开房间
const leaveRoom = (playerId, roomId) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) return;
  
  const room = rooms.get(roomId);
  
  // 检查玩家是否在房间中
  if (!room.players.has(playerId)) return;
  
  // 如果玩家已入座，处理起立逻辑
  const player = room.players.get(playerId);
  if (player.seatPosition !== -1) {
    standUp(playerId, roomId);
  }
  
  // 从房间移除玩家
  room.players.delete(playerId);
  
  // 如果房间空了，删除房间
  if (room.players.size === 0) {
    rooms.delete(roomId);
    logger.info(`Room ${roomId} deleted (empty)`);
  }
  
  logger.info(`Player ${playerId} left room ${roomId}`);
};

// 玩家入座
const sitDown = (playerId, roomId, seatPosition) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) throw new Error('Room not found');
  
  const room = rooms.get(roomId);
  
  // 检查玩家是否在房间中
  if (!room.players.has(playerId)) throw new Error('Player not in room');
  
  // 检查座位是否有效
  if (seatPosition < 0 || seatPosition >= room.seats.length) {
    throw new Error('Invalid seat position');
  }
  
  // 检查座位是否可用
  if (room.seats[seatPosition].isOccupied) {
    throw new Error('Seat is already occupied');
  }
  
  // 检查游戏是否正在进行
  if (room.status === 'playing') throw new Error('Cannot sit while game is in progress');
  
  // 检查玩家是否已经在其他座位
  const player = room.players.get(playerId);
  if (player.seatPosition !== -1) {
    // 先从之前的座位起立
    standUp(playerId, roomId);
  }
  
  // 更新座位
  room.seats[seatPosition] = {
    position: seatPosition,
    playerId,
    isOccupied: true
  };
  
  // 更新玩家状态
  player.seatPosition = seatPosition;
  
  logger.info(`Player ${playerId} sat at position ${seatPosition} in room ${roomId}`);
};

// 玩家起立
const standUp = (playerId, roomId) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) throw new Error('Room not found');
  
  const room = rooms.get(roomId);
  
  // 检查玩家是否在房间中
  if (!room.players.has(playerId)) throw new Error('Player not in room');
  
  const player = room.players.get(playerId);
  
  // 检查玩家是否已入座
  if (player.seatPosition === -1) return;
  
  // 检查游戏是否正在进行
  if (room.status === 'playing' && player.isActive) {
    throw new Error('Cannot stand up during active game');
  }
  
  // 更新座位
  const seatPosition = player.seatPosition;
  room.seats[seatPosition] = {
    position: seatPosition,
    playerId: null,
    isOccupied: false
  };
  
  // 更新玩家状态
  player.seatPosition = -1;
  player.isReady = false;
  
  logger.info(`Player ${playerId} stood up in room ${roomId}`);
};

// 更新玩家准备状态
const updatePlayerReady = (playerId, roomId, isReady) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) throw new Error('Room not found');
  
  const room = rooms.get(roomId);
  
  // 检查玩家是否在房间中
  if (!room.players.has(playerId)) throw new Error('Player not in room');
  
  const player = room.players.get(playerId);
  
  // 检查玩家是否已入座
  if (player.seatPosition === -1) throw new Error('Player must sit before ready');
  
  // 更新玩家状态
  player.isReady = isReady;
  
  logger.info(`Player ${playerId} is ${isReady ? 'ready' : 'not ready'} in room ${roomId}`);
  
  return isReady;
};

// 检查所有入座玩家是否都已准备
const areAllSeatedPlayersReady = (roomId) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) return false;
  
  const room = rooms.get(roomId);
  
  // 获取所有入座玩家
  const seatedPlayers = Array.from(room.players.values())
    .filter(player => player.seatPosition !== -1);
  
  // 如果没有入座玩家或只有一名玩家，返回false
  if (seatedPlayers.length <= 1) return false;
  
  // 检查所有入座玩家是否都已准备
  return seatedPlayers.every(player => player.isReady);
};

// 设置房间状态
const setRoomStatus = (roomId, status) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) throw new Error('Room not found');
  
  const room = rooms.get(roomId);
  
  // 更新房间状态
  room.status = status;
  
  logger.info(`Room ${roomId} status updated to ${status}`);
  
  return status;
};

// 设置游戏状态
const setGameState = (roomId, gameState) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) throw new Error('Room not found');
  
  const room = rooms.get(roomId);
  
  // 更新游戏状态
  room.gameState = gameState;
  
  logger.info(`Game state updated in room ${roomId}`);
  
  return gameState;
};

// 检查座位是否可用
const isSeatAvailable = (roomId, seatPosition) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) return false;
  
  const room = rooms.get(roomId);
  
  // 检查座位是否有效
  if (seatPosition < 0 || seatPosition >= room.seats.length) return false;
  
  // 检查座位是否被占用
  return !room.seats[seatPosition].isOccupied;
};

// 更新玩家信息
const updatePlayer = (playerId, roomId, updates) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) throw new Error('Room not found');
  
  const room = rooms.get(roomId);
  
  // 检查玩家是否在房间中
  if (!room.players.has(playerId)) throw new Error('Player not in room');
  
  const player = room.players.get(playerId);
  
  // 更新玩家信息
  Object.assign(player, updates);
  
  logger.info(`Player ${playerId} updated in room ${roomId}`);
  
  return player;
};

// 获取房间信息
const getRoomInfo = (roomId) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) throw new Error('Room not found');
  
  const room = rooms.get(roomId);
  
  // 返回不包含玩家详细信息的房间信息
  return {
    id: room.id,
    name: room.name,
    maxPlayers: room.maxPlayers,
    minBet: room.minBet,
    createdAt: room.createdAt,
    status: room.status,
    playerCount: room.players.size
  };
};

// 获取所有公开房间
const getPublicRooms = () => {
  return Array.from(rooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    maxPlayers: room.maxPlayers,
    minBet: room.minBet,
    playerCount: room.players.size,
    status: room.status
  }));
};

// 获取房间中的所有玩家
const getPlayersInRoom = (roomId) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) return [];
  
  const room = rooms.get(roomId);
  
  // 返回玩家信息，但不包含敏感信息如手牌
  return Array.from(room.players.values()).map(player => ({
    id: player.id,
    name: player.name,
    chips: player.chips,
    isReady: player.isReady,
    isActive: player.isActive,
    isFolded: player.isFolded,
    isAllIn: player.isAllIn,
    currentBet: player.currentBet,
    seatPosition: player.seatPosition
  }));
};

// 获取房间中所有入座的玩家
const getSeatedPlayers = (roomId) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) return [];
  
  const room = rooms.get(roomId);
  
  // 返回所有入座玩家
  return Array.from(room.players.values())
    .filter(player => player.seatPosition !== -1);
};

// 获取单个玩家信息
const getPlayer = (playerId, roomId) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) throw new Error('Room not found');
  
  const room = rooms.get(roomId);
  
  // 检查玩家是否在房间中
  if (!room.players.has(playerId)) throw new Error('Player not in room');
  
  const player = room.players.get(playerId);
  
  // 返回玩家信息，但不包含手牌
  return {
    id: player.id,
    name: player.name,
    chips: player.chips,
    isReady: player.isReady,
    isActive: player.isActive,
    isFolded: player.isFolded,
    isAllIn: player.isAllIn,
    currentBet: player.currentBet,
    seatPosition: player.seatPosition
  };
};

// 获取玩家手牌
const getPlayerCards = (playerId, roomId) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) throw new Error('Room not found');
  
  const room = rooms.get(roomId);
  
  // 检查玩家是否在房间中
  if (!room.players.has(playerId)) throw new Error('Player not in room');
  
  const player = room.players.get(playerId);
  
  return player.holeCards;
};

// 设置玩家手牌
const setPlayerCards = (playerId, roomId, cards) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) throw new Error('Room not found');
  
  const room = rooms.get(roomId);
  
  // 检查玩家是否在房间中
  if (!room.players.has(playerId)) throw new Error('Player not in room');
  
  const player = room.players.get(playerId);
  
  player.holeCards = cards;
  
  logger.info(`Cards dealt to player ${playerId} in room ${roomId}`);
  
  return cards;
};

// 获取房间中的所有座位
const getSeats = (roomId) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) throw new Error('Room not found');
  
  const room = rooms.get(roomId);
  
  return room.seats;
};

// 检查房间是否存在
const roomExists = (roomId) => {
  return rooms.has(roomId);
};

// 检查房间是否已满
const isRoomFull = (roomId) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) return true;
  
  const room = rooms.get(roomId);
  
  return room.players.size >= room.maxPlayers;
};

// 获取房间状态
const getRoomStatus = (roomId) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) throw new Error('Room not found');
  
  const room = rooms.get(roomId);
  
  return room.status;
};

// 获取房间对象 (仅供内部服务使用)
const getRoom = (roomId) => {
  // 检查房间是否存在
  if (!rooms.has(roomId)) return null;
  
  return rooms.get(roomId);
};

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  sitDown,
  standUp,
  updatePlayerReady,
  areAllSeatedPlayersReady,
  setRoomStatus,
  setGameState,
  isSeatAvailable,
  updatePlayer,
  getRoomInfo,
  getPublicRooms,
  getPlayersInRoom,
  getSeatedPlayers,
  getPlayer,
  getPlayerCards,
  setPlayerCards,
  getSeats,
  roomExists,
  isRoomFull,
  getRoomStatus,
  getRoom
};
