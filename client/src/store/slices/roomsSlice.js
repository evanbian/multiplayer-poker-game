// src/store/slices/roomsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  availableRooms: [],
  loading: false,
  error: null
};

export const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setRooms: (state, action) => {
      state.availableRooms = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearRooms: (state) => {
      state.availableRooms = [];
    }
  }
});

export const { setRooms, setLoading, setError, clearRooms } = roomsSlice.actions;

export default roomsSlice.reducer;
