// src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  playerId: localStorage.getItem('playerId') || null,
  playerName: localStorage.getItem('playerName') || '',
  isAuthenticated: !!localStorage.getItem('playerId')
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPlayerInfo: (state, action) => {
      state.playerId = action.payload.playerId;
      state.playerName = action.payload.playerName;
      state.isAuthenticated = true;
      
      localStorage.setItem('playerId', action.payload.playerId);
      localStorage.setItem('playerName', action.payload.playerName);
    },
    clearPlayerInfo: (state) => {
      state.playerId = null;
      state.playerName = '';
      state.isAuthenticated = false;
      
      localStorage.removeItem('playerId');
      localStorage.removeItem('playerName');
    },
    updatePlayerName: (state, action) => {
      state.playerName = action.payload;
      localStorage.setItem('playerName', action.payload);
    }
  }
});

export const { setPlayerInfo, clearPlayerInfo, updatePlayerName } = authSlice.actions;

export default authSlice.reducer;
