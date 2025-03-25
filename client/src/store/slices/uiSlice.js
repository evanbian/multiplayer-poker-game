// src/store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notification: null,
  error: null,
  loading: false,
  activeModal: null,
  modalData: null
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setNotification: (state, action) => {
      state.notification = {
        id: Date.now(),
        ...action.payload
      };
    },
    clearNotification: (state) => {
      state.notification = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setActiveModal: (state, action) => {
      state.activeModal = action.payload.modalType;
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    }
  }
});

export const {
  setNotification,
  clearNotification,
  setError,
  clearError,
  setLoading,
  setActiveModal,
  closeModal
} = uiSlice.actions;

export default uiSlice.reducer;
