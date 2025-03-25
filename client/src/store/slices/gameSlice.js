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
  sidePots: []
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
      state.gameState = action.payload;
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
    },
    gameStarted: (state, action) => {
      state.gameState = action.payload;
      state.winners = [];
      state.lastAction = null;
    },
    gameEnded: (state) => {
      state.gameState.status = 'finished';
      state.currentTurnData = null;
    },
    roundEnded: (state, action) => {
      state.winners = action.payload.winners;
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
  resetGame
} = gameSlice.actions;

export default gameSlice.reducer;
