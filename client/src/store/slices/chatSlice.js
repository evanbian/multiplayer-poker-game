// src/store/slices/chatSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  unreadCount: 0
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      state.unreadCount += 1;
    },
    clearUnread: (state) => {
      state.unreadCount = 0;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.unreadCount = 0;
    }
  }
});

export const { addMessage, clearUnread, clearMessages } = chatSlice.actions;

export default chatSlice.reducer;
