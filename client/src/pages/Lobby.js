// src/pages/Lobby.js
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import RoomList from '../components/lobby/RoomList';
import { initSocket } from '../services/socket/socketService';

const LobbyContainer = styled.div`
  min-height: 100vh;
  background-color: #ecf0f1;
  padding: 20px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ddd;
`;

const Logo = styled.h1`
  margin: 0;
  color: #2c3e50;
  font-size: 28px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-right: 10px;
`;

const UserName = styled.span`
  font-weight: bold;
  color: #2c3e50;
`;

const Content = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Lobby = () => {
  const navigate = useNavigate();
  const roomInfo = useSelector((state) => state.game.roomInfo);
  const playerName = useSelector((state) => state.auth.playerName);
  
  // 初始化Socket连接
  useEffect(() => {
    initSocket();
  }, []);
  
  // 如果有房间信息，跳转到游戏页面
  useEffect(() => {
    if (roomInfo) {
      navigate('/game');
    }
  }, [roomInfo, navigate]);
  
  // 获取用户头像显示
  const getAvatarText = () => {
    if (!playerName) return '?';
    return playerName.charAt(0).toUpperCase();
  };

  return (
    <LobbyContainer>
      <Header>
        <Logo>多人德州扑克</Logo>
        <UserInfo>
          <Avatar>{getAvatarText()}</Avatar>
          <UserName>{playerName || '未登录'}</UserName>
        </UserInfo>
      </Header>
      
      <Content>
        <RoomList />
      </Content>
    </LobbyContainer>
  );
};

export default Lobby;
