// src/pages/Game.js
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import GameTable from '../components/game/GameTable';
import ChatBox from '../components/game/ChatBox';
import GameInfo from '../components/game/GameInfo';
import Showdown from '../components/game/Showdown';
import { leaveRoom, toggleReady } from '../services/socket/socketService';
import { setNotification } from '../store/slices/uiSlice';
import { setActiveModal } from '../store/slices/uiSlice';
import ActionLog from '../components/game/ActionLog';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1a1a1a;
  color: white;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #2c3e50;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const RoomInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const RoomName = styled.h2`
  margin: 0;
  font-size: 18px;
`;

const RoomDetails = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 8px 15px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ReadyButton = styled(Button)`
  background-color: ${({ isReady }) => (isReady ? '#e74c3c' : '#2ecc71')};
  color: white;
  
  &:hover {
    background-color: ${({ isReady }) => (isReady ? '#c0392b' : '#27ae60')};
  }
`;

const LeaveButton = styled(Button)`
  background-color: #7f8c8d;
  color: white;
  
  &:hover {
    background-color: #95a5a6;
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const MainArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Sidebar = styled.div`
  width: 300px;
  border-left: 1px solid #333;
  display: flex;
  flex-direction: column;
`;

const PlayerNameButton = styled.span`
  cursor: pointer;
  margin-left: 5px;
  font-size: 12px;
  color: #3498db;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Game = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const roomInfo = useSelector((state) => state.game.roomInfo);
  const currentPlayer = useSelector((state) => {
    const playerId = state.auth.playerId;
    return state.game.players.find(player => player.id === playerId);
  });
  const gameState = useSelector((state) => state.game.gameState);
  const winners = useSelector((state) => state.game.winners);
  const playerName = useSelector((state) => state.auth.playerName); // 获取玩家昵称

  const [showGameInfo, setShowGameInfo] = useState(true);
  const [showShowdown, setShowShowdown] = useState(false);
  
  // 如果没有房间信息，重定向到大厅页面
  useEffect(() => {
    if (!roomInfo) {
      navigate('/');
    }
  }, [roomInfo, navigate]);
  
  // 监听游戏结束，显示比牌结果
  useEffect(() => {
    if (gameState.status === 'finished' && winners && winners.length > 0) {
      setShowShowdown(true);
    }
  }, [gameState.status, winners]);
  
  // 处理准备/取消准备
  const handleReadyToggle = () => {
    if (!currentPlayer) return;
    
    toggleReady(!currentPlayer.isReady);
    
    dispatch(setNotification({
      message: currentPlayer.isReady ? '取消准备' : '已准备',
      type: 'info'
    }));
  };
  
  // 处理离开房间
  const handleLeaveRoom = () => {
    leaveRoom();
    navigate('/');
  };
  
  // 处理下一局游戏
  const handleNextRound = () => {
    setShowShowdown(false);
    // 如果玩家已入座但未准备，自动准备
    if (currentPlayer && currentPlayer.seatPosition !== -1 && !currentPlayer.isReady) {
      toggleReady(true);
      dispatch(setNotification({
        message: '已自动准备开始下一局',
        type: 'info'
      }));
    }
  };
   // 添加处理修改昵称的函数
  const handleEditNickname = () => {
    dispatch(setActiveModal({ modalType: 'editNickname' }));
  };
 
  // 切换游戏信息/聊天
  const toggleSidebar = () => {
    setShowGameInfo(!showGameInfo);
  };
  
  // 检查玩家是否可以准备
  const canPlayerReady = () => {
    if (!currentPlayer) return false;
    return currentPlayer.seatPosition !== -1 && !gameState.status.includes('playing');
  };
  
  if (!roomInfo || !currentPlayer) {
    return <div>加载中...</div>;
  }
  return (
    <GameContainer>
      <Header>
        <RoomInfo>
          <RoomName>{roomInfo.name}</RoomName>
          <RoomDetails>
            最小下注: {roomInfo.minBet} | 玩家: {roomInfo.playerCount}/{roomInfo.maxPlayers}
            {/* 添加玩家名称和修改按钮 */}
            | 您: {playerName} 
            <PlayerNameButton onClick={handleEditNickname}>
              修改
            </PlayerNameButton>
          </RoomDetails>
        </RoomInfo>
        
        <Controls>
          {canPlayerReady() && (
            <ReadyButton
              isReady={currentPlayer.isReady}
              onClick={handleReadyToggle}
              disabled={gameState.status !== 'waiting'}
            >
              {currentPlayer.isReady ? '取消准备' : '准备'}
            </ReadyButton>
          )}
          
          <LeaveButton onClick={handleLeaveRoom} disabled={gameState.status.includes('playing') && currentPlayer.isActive}>
            离开房间
          </LeaveButton>
        </Controls>
      </Header>
      
      <Content>
        <MainArea>
          <GameTable />

          {/* 添加动作日志组件 */}
          <ActionLog />

          {/* 摊牌组件 */}
          {showShowdown && (
            <Showdown 
              winners={winners} 
              onNextRound={handleNextRound} 
            />
          )}
        </MainArea>
        
        <Sidebar>
          <div style={{ 
            display: 'flex', 
            backgroundColor: '#2c3e50',
            borderBottom: '1px solid #333'
          }}>
            <button 
              onClick={() => setShowGameInfo(true)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: showGameInfo ? '#3498db' : 'transparent',
                border: 'none',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              游戏信息
            </button>
            <button 
              onClick={() => setShowGameInfo(false)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: !showGameInfo ? '#3498db' : 'transparent',
                border: 'none',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              聊天室
            </button>
          </div>
          
          {showGameInfo ? (
            <GameInfo />
          ) : (
            <ChatBox />
          )}
        </Sidebar>
      </Content>
    </GameContainer>
  );
};

export default Game;
