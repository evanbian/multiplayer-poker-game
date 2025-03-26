// src/store/slices/gameSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  roomInfo: null,
  players: [],
  seats: [],
  gameState: {
    status: 'waiting', // waiting, starting, preflop, flop, turn, river, showdown, finished
    communityCards: [],
    pot: 0,
    currentBet: 0,
    minBet: 0,
    dealerPosition: -1,
    smallBlindPosition: -1,
    bigBlindPosition: -1,
    currentTurn: null,
    round: ''
  },
  playerCards: [],
  currentTurnData: null,
  lastAction: null,
  winners: [],
  sidePots: [],
  playerActions: {}, // 记录每个玩家的最后一次动作
  actionLogs: [] // 添加动作日志记录
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setRoomInfo: (state, action) => {
      state.roomInfo = action.payload;
    },
    updatePlayers: (state, action) => {
      state.players = action.payload;
    },
    updateSeats: (state, action) => {
      state.seats = action.payload;
    },
    updateGameState: (state, action) => {
      // 如果游戏刚开始，记录盲注信息
      if (state.gameState.status === 'waiting' && action.payload.status === 'starting') {
        // 记录发牌和盲注信息
        state.actionLogs.push({
          playerId: 'system',
          playerName: '系统',
          action: {
            type: 'game_start'
          },
          timestamp: Date.now()
        });
        
        // 找到小盲注玩家
        if (action.payload.smallBlindPosition !== -1) {
          const smallBlindSeat = state.seats.find(seat => seat.position === action.payload.smallBlindPosition);
          if (smallBlindSeat && smallBlindSeat.playerId) {
            const player = state.players.find(p => p.id === smallBlindSeat.playerId);
            if (player) {
              state.actionLogs.push({
                playerId: player.id,
                playerName: player.name,
                action: {
                  type: 'small_blind',
                  amount: action.payload.minBet / 2
                },
                timestamp: Date.now() + 1
              });
            }
          }
        }
        
        // 找到大盲注玩家
        if (action.payload.bigBlindPosition !== -1) {
          const bigBlindSeat = state.seats.find(seat => seat.position === action.payload.bigBlindPosition);
          if (bigBlindSeat && bigBlindSeat.playerId) {
            const player = state.players.find(p => p.id === bigBlindSeat.playerId);
            if (player) {
              state.actionLogs.push({
                playerId: player.id,
                playerName: player.name,
                action: {
                  type: 'big_blind',
                  amount: action.payload.minBet
                },
                timestamp: Date.now() + 2
              });
            }
          }
        }
        
        // 保持日志不超过20条
        while (state.actionLogs.length > 20) {
          state.actionLogs.shift();
        }
      }
      
      state.gameState = action.payload;
      
      // 如果游戏状态变为waiting，清空获胜者列表
      if (action.payload.status === 'waiting') {
        state.winners = [];
      }
    },
    updatePlayerCards: (state, action) => {
      state.playerCards = action.payload;
    },
    updateCommunityCards: (state, action) => {
      state.gameState.communityCards = action.payload;
    },
    updatePot: (state, action) => {
      state.gameState.pot = action.payload.pot;
      state.sidePots = action.payload.sidePots;
    },
    setCurrentTurn: (state, action) => {
      state.currentTurnData = action.payload;
      state.gameState.currentTurn = action.payload.playerId;
    },
    playerActionDone: (state, action) => {
      state.lastAction = action.payload;
      
      // 记录玩家动作
      const playerId = action.payload.playerId;
      state.playerActions[playerId] = action.payload.action;
      
      // 添加动作日志
      // 查找玩家名称
      const player = state.players.find(p => p.id === playerId);
      if (player) {
        state.actionLogs.push({
          playerId,
          playerName: player.name,
          action: action.payload.action,
          timestamp: action.payload.action.timestamp || Date.now()
        });
        
        // 保持日志不超过20条
        if (state.actionLogs.length > 20) {
          state.actionLogs.shift();
        }
      }
    },
    gameStarted: (state, action) => {
      state.gameState = action.payload;
      state.winners = [];
      state.lastAction = null;
      state.playerActions = {};
      state.actionLogs = []; // 重置动作日志
    },
    gameEnded: (state) => {
      state.gameState.status = 'finished';
      state.currentTurnData = null;
    },
    roundEnded: (state, action) => {
      // 设置获胜者信息
      state.winners = action.payload.winners || [];
      
      // 记录回合结束日志
      state.actionLogs.push({
        playerId: 'system',
        playerName: '系统',
        action: {
          type: 'round_end',
          round: state.gameState.round
        },
        timestamp: Date.now()
      });
      
      // 保持日志不超过20条
      while (state.actionLogs.length > 20) {
        state.actionLogs.shift();
      }
      
      // 清空底池
      if (action.payload.pot !== undefined) {
        state.gameState.pot = 0;
      }
      
      // 清空玩家动作
      state.playerActions = {};
    },
    playerJoined: (state, action) => {
      const existingIndex = state.players.findIndex(p => p.id === action.payload.id);
      if (existingIndex !== -1) {
        state.players[existingIndex] = action.payload;
      } else {
        state.players.push(action.payload);
      }
    },
    playerLeft: (state, action) => {
      state.players = state.players.filter(player => player.id !== action.payload);
    },
    updatePlayer: (state, action) => {
      const index = state.players.findIndex(player => player.id === action.payload.id);
      if (index !== -1) {
        state.players[index] = action.payload;
      }
    },
    resetGame: (state) => {
      return {
        ...initialState,
        roomInfo: state.roomInfo,
        players: state.players,
        seats: state.seats
      };
    },
    setWinners: (state, action) => {
      state.winners = action.payload;
      
      // 记录获胜者日志
      action.payload.forEach(winner => {
        const player = state.players.find(p => p.id === winner.playerId);
        if (player) {
          state.actionLogs.push({
            playerId: winner.playerId,
            playerName: player.name,
            action: {
              type: 'win',
              amount: winner.winAmount,
              handType: winner.handType
            },
            timestamp: Date.now()
          });
        }
      });
      
      // 保持日志不超过20条
      while (state.actionLogs.length > 20) {
        state.actionLogs.shift();
      }
    },
    clearWinners: (state) => {
      state.winners = [];
    },
    // 新增处理社区牌发牌事件
    dealCommunityCards: (state, action) => {
      // 记录发牌动作
      const roundNames = {
        'flop': '翻牌',
        'turn': '转牌',
        'river': '河牌'
      };
      
      if (action.payload.round && roundNames[action.payload.round]) {
        state.actionLogs.push({
          playerId: 'system',
          playerName: '系统',
          action: {
            type: 'deal',
            round: action.payload.round
          },
          timestamp: Date.now()
        });
        
        // 保持日志不超过20条
        if (state.actionLogs.length > 20) {
          state.actionLogs.shift();
        }
      }
    }
  }
});

export const {
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
  playerJoined,
  playerLeft,
  updatePlayer,
  resetGame,
  setWinners,
  clearWinners,
  dealCommunityCards
} = gameSlice.actions;

export default gameSlice.reducer;
