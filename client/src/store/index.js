// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import roomsReducer from './slices/roomsSlice';
import chatReducer from './slices/chatSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    rooms: roomsReducer,
    chat: chatReducer,
    ui: uiReducer,
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略日期等非可序列化值的检查
        ignoredActions: ['game/updateGameState'],
        ignoredPaths: ['game.gameState.startTime']
      }
    })
});

export default store;
