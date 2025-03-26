// 游戏核心逻辑服务
const { Hand } = require('pokersolver');
const logger = require('../../utils/logger');
const roomService = require('../room');
const { shuffleDeck, createDeck } = require('../../utils/cardUtils');

// 游戏状态存储
const gameStates = new Map();

// 初始化新游戏
const initGame = (roomId) => {
  // 检查房间是否存在
  if (!roomService.roomExists(roomId)) {
    throw new Error('Room not found');
  }
  
  // 获取房间信息
  const room = roomService.getRoom(roomId);
  
  // 检查是否有足够的玩家
  const seatedPlayers = roomService.getSeatedPlayers(roomId);
  if (seatedPlayers.length < 2) {
    throw new Error('Not enough players to start the game');
  }
  
  // 创建新的游戏状态
  const gameState = {
    status: 'starting',
    deck: shuffleDeck(createDeck()),
    communityCards: [],
    pot: 0,
    sidePots: [],
    currentBet: 0,
    minBet: room.minBet,
    dealerPosition: findNextDealerPosition(roomId),
    smallBlindPosition: -1,
    bigBlindPosition: -1,
    currentTurn: -1,
    lastRaisePosition: -1,
    round: 'preflop',
    activePlayers: [],
    actedPlayers: new Set()
  };
  
  // 设置房间状态为playing
  roomService.setRoomStatus(roomId, 'playing');
  
  // 初始化玩家状态
  initPlayers(roomId, gameState);
  
  // 发放手牌
  dealHoleCards(roomId, gameState);
  
  // 收取盲注
  collectBlinds(roomId, gameState);
  
  // 设置当前回合玩家
  setCurrentTurn(roomId, gameState);
  
  // 保存游戏状态
  gameStates.set(roomId, gameState);
  
  // 设置房间游戏状态
  roomService.setGameState(roomId, gameState);
  
  logger.info(`Game initialized in room ${roomId}`);
  
  return getPublicGameState(roomId);
};

// 初始化玩家状态
const initPlayers = (roomId, gameState) => {
  // 获取所有入座玩家
  const seatedPlayers = roomService.getSeatedPlayers(roomId);
  
  // 按座位顺序排序
  seatedPlayers.sort((a, b) => a.seatPosition - b.seatPosition);
  
  // 设置所有玩家为活跃状态
  seatedPlayers.forEach(player => {
    roomService.updatePlayer(player.id, roomId, {
      isActive: true,
      isFolded: false,
      isAllIn: false,
      currentBet: 0,
      totalBet: 0,
      holeCards: []
    });
    
    // 添加到活跃玩家列表
    gameState.activePlayers.push(player.id);
  });
  
  // 设置小盲注和大盲注位置
  gameState.smallBlindPosition = findNextPlayerPosition(roomId, gameState.dealerPosition);
  gameState.bigBlindPosition = findNextPlayerPosition(roomId, gameState.smallBlindPosition);
  
  logger.info(`Players initialized in room ${roomId}`);
};

// 发放手牌
const dealHoleCards = (roomId, gameState) => {
  // 获取所有活跃玩家
  const activePlayers = gameState.activePlayers.map(playerId => 
    roomService.getPlayer(playerId, roomId)
  );
  
  // 每个玩家发两张牌
  for (let i = 0; i < 2; i++) {
    for (const player of activePlayers) {
      // 从牌堆抽一张牌
      const card = gameState.deck.pop();
      
      // 获取玩家当前手牌
      const holeCards = roomService.getPlayerCards(player.id, roomId);
      
      // 添加新牌
      holeCards.push(card);
      
      // 更新玩家手牌
      roomService.setPlayerCards(player.id, roomId, holeCards);
    }
  }
  
  logger.info(`Hole cards dealt in room ${roomId}`);
};

// 收取盲注
const collectBlinds = (roomId, gameState) => {
  const smallBlindPlayer = getPlayerByPosition(roomId, gameState.smallBlindPosition);
  const bigBlindPlayer = getPlayerByPosition(roomId, gameState.bigBlindPosition);
  
  // 小盲注
  const smallBlindAmount = Math.floor(gameState.minBet / 2);
  placeBlind(roomId, smallBlindPlayer.id, smallBlindAmount, gameState);
  
  // 大盲注
  placeBlind(roomId, bigBlindPlayer.id, gameState.minBet, gameState);
  
  // 设置当前最高下注
  gameState.currentBet = gameState.minBet;
  
  logger.info(`Blinds collected in room ${roomId}`);
};

// 下盲注
const placeBlind = (roomId, playerId, amount, gameState) => {
  const player = roomService.getPlayer(playerId, roomId);
  
  // 计算实际下注金额(考虑筹码不足的情况)
  const actualAmount = Math.min(amount, player.chips);
  
  // 更新玩家筹码和下注额
  roomService.updatePlayer(playerId, roomId, {
    chips: player.chips - actualAmount,
    currentBet: actualAmount,
    totalBet: actualAmount,
    isAllIn: actualAmount === player.chips
  });
  
  // 增加底池
  gameState.pot += actualAmount;
  
  logger.info(`Player ${playerId} placed blind ${actualAmount} in room ${roomId}`);
};

// 设置当前回合玩家
const setCurrentTurn = (roomId, gameState) => {
  // 在preflop轮，从大盲注下一位开始
  if (gameState.round === 'preflop') {
    gameState.currentTurn = findNextPlayerPosition(roomId, gameState.bigBlindPosition);
  } else {
    // 其他轮次从小盲注开始
    gameState.currentTurn = gameState.smallBlindPosition;
  }
  
  logger.info(`Current turn set to player at position ${gameState.currentTurn} in room ${roomId}`);
};

// 处理玩家动作
const handlePlayerAction = (playerId, roomId, actionData) => {
  // 检查游戏是否存在
  if (!gameStates.has(roomId)) {
    throw new Error('Game not found');
  }
  
  const gameState = gameStates.get(roomId);
  
  // 检查是否是玩家的回合
  const currentTurnPlayer = getPlayerByPosition(roomId, gameState.currentTurn);
  if (currentTurnPlayer.id !== playerId) {
    throw new Error('Not your turn');
  }
  
  // 处理不同类型的动作
  const { action, amount } = actionData;
  let result = {
    action: { type: action, playerId, amount: 0, timestamp: Date.now() },
    potUpdated: false,
    nextPlayer: null,
    roundEnded: false
  };
  
  switch (action) {
    case 'fold':
      handleFold(playerId, roomId, gameState);
      break;
    case 'check':
      handleCheck(playerId, roomId, gameState);
      break;
    case 'call':
      result.potUpdated = handleCall(playerId, roomId, gameState);
      break;
    case 'bet':
      result.potUpdated = handleBet(playerId, roomId, amount, gameState);
      result.action.amount = amount;
      break;
    case 'raise':
      result.potUpdated = handleRaise(playerId, roomId, amount, gameState);
      result.action.amount = amount;
      break;
    case 'all-in':
      result.potUpdated = handleAllIn(playerId, roomId, gameState);
      const player = roomService.getPlayer(playerId, roomId);
      result.action.amount = player.currentBet;
      break;
    default:
      throw new Error(`Invalid action: ${action}`);
  }
  
  // 如果只剩一名活跃玩家，则不需要继续处理
  if (gameState.activePlayers.length <= 1) {
    return result;
  }
  
  // 将玩家添加到已行动列表
  gameState.actedPlayers.add(playerId);
  
  // 检查回合是否结束
  result.roundEnded = checkRoundEnd(roomId, gameState);
  if (!result.roundEnded) {
    // 设置下一个玩家
    const nextPosition = findNextActivePosition(roomId, gameState.currentTurn);
    gameState.currentTurn = nextPosition;
    result.nextPlayer = getPlayerByPosition(roomId, nextPosition).id;
  }
  
  // 保存游戏状态
  gameStates.set(roomId, gameState);
  
  // 更新房间游戏状态
  roomService.setGameState(roomId, gameState);
  
  logger.info(`Player ${playerId} action ${action} processed in room ${roomId}`);
  
  return result;
};

// 处理弃牌
const handleFold = (playerId, roomId, gameState) => {
  // 更新玩家状态
  roomService.updatePlayer(playerId, roomId, {
    isFolded: true,
    isActive: false
  });
  
  // 从活跃玩家列表中移除
  const playerIndex = gameState.activePlayers.indexOf(playerId);
  if (playerIndex !== -1) {
    gameState.activePlayers.splice(playerIndex, 1);
  }
  
  logger.info(`Player ${playerId} folded in room ${roomId}`);
  
  // 检查是否只剩一名活跃玩家
  if (gameState.activePlayers.length === 1) {
    // 直接结束游戏
    handleLastPlayerStanding(roomId, gameState);
  }
  
  return false; // 底池未更新
};

// 处理过牌
const handleCheck = (playerId, roomId, gameState) => {
  // 确保当前回合允许过牌
  if (gameState.currentBet > 0) {
    const player = roomService.getPlayer(playerId, roomId);
    if (player.currentBet < gameState.currentBet) {
      throw new Error('Cannot check when there is an active bet');
    }
  }
  
  logger.info(`Player ${playerId} checked in room ${roomId}`);
  
  return false; // 底池未更新
};

// 处理跟注
const handleCall = (playerId, roomId, gameState) => {
  const player = roomService.getPlayer(playerId, roomId);
  
  // 计算需要跟注的金额
  const callAmount = gameState.currentBet - player.currentBet;
  
  // 如果没有需要跟注的金额，相当于过牌
  if (callAmount <= 0) {
    return handleCheck(playerId, roomId, gameState);
  }
  
  // 检查玩家筹码是否足够
  if (player.chips < callAmount) {
    // 玩家筹码不足，改为全押
    return handleAllIn(playerId, roomId, gameState);
  }
  
  // 更新玩家筹码和下注额
  const newChips = player.chips - callAmount;
  const newCurrentBet = player.currentBet + callAmount;
  const newTotalBet = player.totalBet + callAmount;
  
  roomService.updatePlayer(playerId, roomId, {
    chips: newChips,
    currentBet: newCurrentBet,
    totalBet: newTotalBet
  });
  
  // 增加底池
  gameState.pot += callAmount;
  
  logger.info(`Player ${playerId} called ${callAmount} in room ${roomId}`);
  
  return true; // 底池已更新
};

// 处理下注
const handleBet = (playerId, roomId, amount, gameState) => {
  // 确保当前没有活跃下注
  if (gameState.currentBet > 0) {
    throw new Error('Cannot bet when there is an active bet');
  }
  
  // 验证下注金额
  if (amount < gameState.minBet) {
    throw new Error(`Bet must be at least ${gameState.minBet}`);
  }
  
  const player = roomService.getPlayer(playerId, roomId);
  
  // 检查玩家筹码是否足够
  if (player.chips < amount) {
    throw new Error('Insufficient chips');
  }
  
  // 更新玩家筹码和下注额
  roomService.updatePlayer(playerId, roomId, {
    chips: player.chips - amount,
    currentBet: amount,
    totalBet: player.totalBet + amount
  });
  
  // 更新游戏状态
  gameState.currentBet = amount;
  gameState.pot += amount;
  gameState.lastRaisePosition = player.seatPosition;
  
  // 清空已行动玩家列表
  gameState.actedPlayers = new Set([playerId]);
  
  logger.info(`Player ${playerId} bet ${amount} in room ${roomId}`);
  
  return true; // 底池已更新
};

// 处理加注
const handleRaise = (playerId, roomId, amount, gameState) => {
  // 确保当前有活跃下注
  if (gameState.currentBet <= 0) {
    throw new Error('Cannot raise when there is no active bet');
  }
  
  const player = roomService.getPlayer(playerId, roomId);
  
  // 计算实际加注金额
  const raiseAmount = amount - player.currentBet;
  
  // 验证加注金额
  if (raiseAmount < gameState.minBet) {
    throw new Error(`Raise must be at least ${gameState.minBet}`);
  }
  
  // 检查玩家筹码是否足够
  if (player.chips < raiseAmount) {
    throw new Error('Insufficient chips');
  }
  
  // 更新玩家筹码和下注额
  roomService.updatePlayer(playerId, roomId, {
    chips: player.chips - raiseAmount,
    currentBet: amount,
    totalBet: player.totalBet + raiseAmount
  });
  
  // 更新游戏状态
  gameState.currentBet = amount;
  gameState.pot += raiseAmount;
  gameState.lastRaisePosition = player.seatPosition;
  
  // 清空已行动玩家列表，只保留当前玩家
  gameState.actedPlayers = new Set([playerId]);
  
  logger.info(`Player ${playerId} raised to ${amount} in room ${roomId}`);
  
  return true; // 底池已更新
};

// 处理全押
const handleAllIn = (playerId, roomId, gameState) => {
  const player = roomService.getPlayer(playerId, roomId);
  
  // 玩家没有筹码则不能全押
  if (player.chips <= 0) {
    throw new Error('No chips to go all-in');
  }
  
  // 计算全押金额
  const allInAmount = player.chips;
  const totalBet = player.currentBet + allInAmount;
  
  // 更新玩家状态
  roomService.updatePlayer(playerId, roomId, {
    chips: 0,
    currentBet: totalBet,
    totalBet: player.totalBet + allInAmount,
    isAllIn: true
  });
  
  // 增加底池
  gameState.pot += allInAmount;
  
  // 如果全押金额大于当前下注，更新当前下注和最后加注位置
  if (totalBet > gameState.currentBet) {
    gameState.currentBet = totalBet;
    gameState.lastRaisePosition = player.seatPosition;
    
    // 清空已行动玩家列表，只保留当前玩家
    gameState.actedPlayers = new Set([playerId]);
  } else {
    // 否则只是添加到已行动列表
    gameState.actedPlayers.add(playerId);
  }
  
  logger.info(`Player ${playerId} went all-in with ${allInAmount} in room ${roomId}`);
  
  return true; // 底池已更新
};

// 处理最后一名玩家
const handleLastPlayerStanding = (roomId, gameState) => {
  // 获取最后一名活跃玩家
  const lastPlayerId = gameState.activePlayers[0];
  
  // 创建获胜者对象
  const winner = {
    playerId: lastPlayerId,
    handType: 'Last player standing',
    hand: [],
    winAmount: gameState.pot
  };
  
  // 更新玩家筹码
  const player = roomService.getPlayer(lastPlayerId, roomId);
  roomService.updatePlayer(lastPlayerId, roomId, {
    chips: player.chips + gameState.pot
  });
  
  // 设置游戏状态为结束
  gameState.status = 'finished';
  gameState.pot = 0;
  
  logger.info(`Player ${lastPlayerId} wins as last player standing in room ${roomId}`);
  
  return [winner];
};

// 检查回合是否结束
const checkRoundEnd = (roomId, gameState) => {
  // 如果只有一名玩家，回合结束
  if (gameState.activePlayers.length <= 1) {
    return true;
  }
  
  // 获取所有活跃玩家
  const activePlayers = gameState.activePlayers.map(playerId => 
    roomService.getPlayer(playerId, roomId)
  );
  
  // 检查是否所有活跃玩家都已经行动
  const allActed = activePlayers.every(player => 
    gameState.actedPlayers.has(player.id) || player.isAllIn
  );
  
  if (!allActed) {
    return false;
  }
  
  // 检查是否所有非全押玩家下注金额相等
  const bets = new Set();
  activePlayers.forEach(player => {
    if (!player.isAllIn) {
      bets.add(player.currentBet);
    }
  });
  
  // 如果所有非全押玩家下注金额相等，回合结束
  return bets.size <= 1;
};

// 移动到下一个回合
const moveToNextRound = (roomId) => {
  // 检查游戏是否存在
  if (!gameStates.has(roomId)) {
    throw new Error('Game not found');
  }
  
  const gameState = gameStates.get(roomId);
  
  // 重置当前回合状态
  resetRoundState(roomId, gameState);
  
  let result = {
    round: gameState.round,
    communityCards: null,
    gameEnded: false,
    winners: null
  };
  
  // 根据当前回合确定下一个回合
  switch (gameState.round) {
    case 'preflop':
      // 进入翻牌圈
      gameState.round = 'flop';
      // 发三张公共牌
      dealCommunityCards(gameState, 3);
      result.communityCards = gameState.communityCards;
      break;
    case 'flop':
      // 进入转牌圈
      gameState.round = 'turn';
      // 发一张公共牌
      dealCommunityCards(gameState, 1);
      result.communityCards = gameState.communityCards;
      break;
    case 'turn':
      // 进入河牌圈
      gameState.round = 'river';
      // 发一张公共牌
      dealCommunityCards(gameState, 1);
      result.communityCards = gameState.communityCards;
      break;
    case 'river':
      // 进入摊牌阶段
      gameState.round = 'showdown';
      // 处理摊牌
      result.winners = handleShowdown(roomId, gameState);
      result.gameEnded = true;
      break;
    default:
      throw new Error(`Invalid round: ${gameState.round}`);
  }
  
  // 更新结果中的回合
  result.round = gameState.round;
  
  // 如果游戏未结束，设置当前回合玩家
  if (!result.gameEnded) {
    setCurrentTurn(roomId, gameState);
  }
  
  // 保存游戏状态
  gameStates.set(roomId, gameState);
  
  // 更新房间游戏状态
  roomService.setGameState(roomId, gameState);
  
  logger.info(`Moved to next round: ${gameState.round} in room ${roomId}`);
  
  return result;
};

// 重置回合状态
const resetRoundState = (roomId, gameState) => {
  // 清空已行动玩家列表
  gameState.actedPlayers = new Set();
  
  // 重置当前下注
  gameState.currentBet = 0;
  
  // 重置玩家的当前下注
  gameState.activePlayers.forEach(playerId => {
    roomService.updatePlayer(playerId, roomId, {
      currentBet: 0
    });
  });
};

// 发放公共牌
const dealCommunityCards = (gameState, count) => {
  for (let i = 0; i < count; i++) {
    const card = gameState.deck.pop();
    gameState.communityCards.push(card);
  }
};

// 处理摊牌
const handleShowdown = (roomId, gameState) => {
  // 获取所有活跃玩家
  const activePlayers = gameState.activePlayers.map(playerId => 
    roomService.getPlayer(playerId, roomId)
  );
  
  // 准备评估手牌
  const playerHands = [];
  
  for (const player of activePlayers) {
    // 获取玩家手牌
    const holeCards = roomService.getPlayerCards(player.id, roomId);
    
    // 组合所有卡牌(手牌 + 公共牌)
    const allCards = [...holeCards, ...gameState.communityCards];
    
    // 转换为pokersolver格式
    const solverCards = allCards.map(card => 
      `${card.rank}${card.suit.charAt(0).toUpperCase()}`
    );
    
    // 评估手牌
    const hand = Hand.solve(solverCards);
    
    playerHands.push({
      playerId: player.id,
      hand,
      holeCards,
      totalBet: player.totalBet
    });
  }
  
  // 确定获胜者
  const winners = determineWinners(playerHands, gameState.pot);
  
  // 分配筹码给获胜者
  for (const winner of winners) {
    const player = roomService.getPlayer(winner.playerId, roomId);
    roomService.updatePlayer(winner.playerId, roomId, {
      chips: player.chips + winner.winAmount
    });
  }
  
  // 设置游戏状态为结束
  gameState.status = 'finished';
  gameState.pot = 0;
  
  logger.info(`Showdown completed in room ${roomId}`);
  
  return winners;
};

// 确定获胜者并分配底池
  // 在 server/src/services/game/index.js 中找到 determineWinners 函数并修改为:

// 确定获胜者并分配底池
const determineWinners = (playerHands, pot) => {
  // 使用pokersolver库判断获胜手牌
  const winners = Hand.winners(playerHands.map(p => p.hand));
  
  // 获取所有获胜玩家的信息
  const winningPlayers = playerHands.filter(player => 
    winners.some(winner => 
      winner.cardPool.toString() === player.hand.cardPool.toString()
    )
  );
  
  // 调试信息
  logger.info('Winning players found: ' + winningPlayers.length);
  
  // 记录所有玩家手牌信息，便于调试
  playerHands.forEach(player => {
    logger.info(`Player ${player.playerId}: Hand: ${player.hand.name}, Cards: ${player.hand.cardPool}`);
  });
  
  // 记录获胜玩家信息，便于调试
  winningPlayers.forEach(player => {
    logger.info(`Winner ${player.playerId}: ${player.hand.name}, Cards: ${player.hand.cardPool}`);
  });
  
  // 平均分配底池
  const winAmount = Math.floor(pot / winningPlayers.length);
  const remainder = pot % winningPlayers.length;
  
  // 创建获胜者列表
  return winningPlayers.map((winner, index) => ({
    playerId: winner.playerId,
    handType: winner.hand.name,
    hand: winner.holeCards,
    winAmount: winAmount + (index < remainder ? 1 : 0) // 处理无法平均分配的筹码
  }));
};
// 查找下一个玩家位置
const findNextPlayerPosition = (roomId, currentPosition) => {
  const room = roomService.getRoom(roomId);
  
  // 遍历座位，查找下一个有玩家的位置
  for (let i = 1; i <= room.seats.length; i++) {
    const nextPosition = (currentPosition + i) % room.seats.length;
    if (room.seats[nextPosition].isOccupied) {
      return nextPosition;
    }
  }
  
  // 如果没有找到，返回当前位置
  return currentPosition;
};

// 查找下一个活跃玩家位置
const findNextActivePosition = (roomId, currentPosition) => {
  const room = roomService.getRoom(roomId);
  const gameState = gameStates.get(roomId);
  
  // 遍历座位，查找下一个活跃玩家
  for (let i = 1; i <= room.seats.length; i++) {
    const nextPosition = (currentPosition + i) % room.seats.length;
    const seat = room.seats[nextPosition];
    
    if (seat.isOccupied && gameState.activePlayers.includes(seat.playerId)) {
      return nextPosition;
    }
  }
  
  // 如果没有找到，返回当前位置
  return currentPosition;
};

// 查找下一个庄家位置
const findNextDealerPosition = (roomId) => {
  const room = roomService.getRoom(roomId);
  
  // 如果是第一轮游戏，随机选择一个座位
  if (!room.gameState || !room.gameState.dealerPosition) {
    const seatedPlayers = roomService.getSeatedPlayers(roomId);
    if (seatedPlayers.length > 0) {
      // 随机选择一个座位
      const randomIndex = Math.floor(Math.random() * seatedPlayers.length);
      return seatedPlayers[randomIndex].seatPosition;
    }
    return 0;
  }
  
  // 否则，选择下一个有玩家的座位
  return findNextPlayerPosition(roomId, room.gameState.dealerPosition);
};

// 根据座位位置获取玩家
const getPlayerByPosition = (roomId, position) => {
  const room = roomService.getRoom(roomId);
  
  // 检查座位是否存在并被占用
  if (position < 0 || position >= room.seats.length || !room.seats[position].isOccupied) {
    throw new Error(`No player at position ${position}`);
  }
  
  const playerId = room.seats[position].playerId;
  return roomService.getPlayer(playerId, roomId);
};

// 获取公开游戏状态
const getPublicGameState = (roomId) => {
  // 检查游戏是否存在
  if (!gameStates.has(roomId)) {
    return null;
  }
  
  const gameState = gameStates.get(roomId);
  
  // 返回不包含敏感信息的游戏状态
  return {
    status: gameState.status,
    communityCards: gameState.communityCards,
    pot: gameState.pot,
    currentBet: gameState.currentBet,
    minBet: gameState.minBet,
    dealerPosition: gameState.dealerPosition,
    smallBlindPosition: gameState.smallBlindPosition,
    bigBlindPosition: gameState.bigBlindPosition,
    currentTurn: gameState.currentTurn,
    round: gameState.round
  };
};

// 检查游戏是否正在进行
const isGameInProgress = (roomId) => {
  // 检查游戏是否存在
  if (!gameStates.has(roomId)) {
    return false;
  }
  
  const gameState = gameStates.get(roomId);
  
  // 检查游戏状态
  return gameState.status !== 'finished';
};

// 检查是否是玩家的回合
// 接续前一部分
// 检查是否是玩家的回合
const isPlayerTurn = (playerId, roomId) => {
  // 检查游戏是否存在
  if (!gameStates.has(roomId)) {
    return false;
  }
  
  const gameState = gameStates.get(roomId);
  
  // 获取当前回合玩家
  const currentTurnPlayer = getPlayerByPosition(roomId, gameState.currentTurn);
  
  // 检查是否是玩家的回合
  return currentTurnPlayer && currentTurnPlayer.id === playerId;
};

// 获取当前回合玩家ID
const getCurrentTurnPlayer = (roomId) => {
  // 检查游戏是否存在
  if (!gameStates.has(roomId)) {
    return null;
  }
  
  const gameState = gameStates.get(roomId);
  
  // 获取当前回合玩家
  try {
    const currentTurnPlayer = getPlayerByPosition(roomId, gameState.currentTurn);
    return currentTurnPlayer.id;
  } catch (error) {
    logger.error(`Error getting current turn player: ${error.message}`);
    return null;
  }
};

// 获取游戏状态
const getGameState = (roomId) => {
  return getPublicGameState(roomId);
};

// 获取底池
const getPot = (roomId) => {
  // 检查游戏是否存在
  if (!gameStates.has(roomId)) {
    return 0;
  }
  
  const gameState = gameStates.get(roomId);
  return gameState.pot;
};

// 获取边池
const getSidePots = (roomId) => {
  // 检查游戏是否存在
  if (!gameStates.has(roomId)) {
    return [];
  }
  
  const gameState = gameStates.get(roomId);
  return gameState.sidePots || [];
};

// 重置游戏
const resetGame = (roomId) => {
  // 检查游戏是否存在
  if (!gameStates.has(roomId)) {
    return;
  }
  
  // 删除游戏状态
  gameStates.delete(roomId);
  
  // 设置房间状态为waiting
  roomService.setRoomStatus(roomId, 'waiting');
  
  // 重置玩家状态
  const players = roomService.getPlayersInRoom(roomId);
  for (const player of players) {
    if (player.seatPosition !== -1) {
      roomService.updatePlayer(player.id, roomId, {
        isActive: false,
        isFolded: false,
        isAllIn: false,
        isReady: false,
        currentBet: 0,
        totalBet: 0,
        holeCards: []
      });
    }
  }
  
  logger.info(`Game reset in room ${roomId}`);
};

// 导出模块中的函数
module.exports = {
  initGame,
  handlePlayerAction,
  moveToNextRound,
  isGameInProgress,
  isPlayerTurn,
  getCurrentTurnPlayer,
  getGameState,
  getPot,
  getSidePots,
  getPlayerCards: roomService.getPlayerCards,
  resetGame
};
