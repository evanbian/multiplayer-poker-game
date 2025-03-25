// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import ModalManager from './components/modals/ModalManager';
import { clearNotification, clearError } from './store/slices/uiSlice';

const AppContainer = styled.div`
  height: 100vh;
  position: relative;
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 300px;
`;

const Notification = styled.div`
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  margin-bottom: 10px;
  animation: slideIn 0.3s ease forwards;
  background-color: ${({ type }) => {
    switch (type) {
      case 'success':
        return '#2ecc71';
      case 'error':
        return '#e74c3c';
      case 'warning':
        return '#f39c12';
      default:
        return '#3498db';
    }
  }};
  color: white;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const ErrorContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ErrorBox = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
`;

const ErrorHeader = styled.div`
  color: #e74c3c;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
`;

const ErrorMessage = styled.div`
  margin-bottom: 20px;
  color: #333;
`;

const ErrorButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  float: right;
`;

const App = () => {
  const dispatch = useDispatch();
  const notification = useSelector((state) => state.ui.notification);
  const error = useSelector((state) => state.ui.error);
  const roomInfo = useSelector((state) => state.game.roomInfo);
  
  // 自动清除通知
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        dispatch(clearNotification());
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification, dispatch]);
  
  // 处理错误关闭
  const handleErrorClose = () => {
    dispatch(clearError());
  };

  return (
    <Router>
      <AppContainer>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route 
            path="/game" 
            element={roomInfo ? <Game /> : <Navigate to="/" />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        {/* 模态框管理器 */}
        <ModalManager />
        
        {/* 通知 */}
        {notification && (
          <NotificationContainer>
            <Notification type={notification.type}>
              {notification.message}
            </Notification>
          </NotificationContainer>
        )}
        
        {/* 错误弹窗 */}
        {error && (
          <ErrorContainer>
            <ErrorBox>
              <ErrorHeader>出错了</ErrorHeader>
              <ErrorMessage>{error.message}</ErrorMessage>
              <ErrorButton onClick={handleErrorClose}>确定</ErrorButton>
            </ErrorBox>
          </ErrorContainer>
        )}
      </AppContainer>
    </Router>
  );
};

export default App;
