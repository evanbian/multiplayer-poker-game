// src/components/game/GameInfo.js
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: #2c3e50;
  color: white;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #3498db;
  border-bottom: 1px solid #3498db;
  padding-bottom: 5px;
`;

const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PlayerItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
`;

const PlayerAvatar = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${({ isActive }) => (isActive ? '#2ecc71' : '#e74c3c')};
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-right: 10px;
  font-size: 12px;
`;

const PlayerInfo = styled.div`
  flex: 1;
`;

const PlayerName = styled.div`
  font-weight: bold;
  font-size: 14px;
`;

const PlayerStatus = styled.div`
  font-size: 12px;
  color: ${({ color }) => color || '#bdc3c7'};
`;

const ChipsInfo = styled.div`
  font-weight: bold;
  font-size: 14px;
  color: #f1c40f;
`;

const GameStateInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const StatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px dotted rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatusLabel = styled.span`
  font-size: 14px;
  color: #bdc3c7;
`;

const StatusValue = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: white;
`;

const NoGameInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  text-align: center;
  opacity: 0.7;
  height: 100%;
`;

const GameInfo = () => {
  const players = useSelector((state) => state.game.players);
  const gameState = useSelector((state) => state.game.gameState);
  const currentPlayerId = useSelector((state) => state.auth.playerId);
  
  // 获取玩家状态信息
  const getPlayerStatus = (player) => {
    if (player.isFolded) return { text: '已弃牌', color: '#e74c3c' };
    if (player.isAllIn) return { text: '全押', color: '#f39c12' };
    if (!player.isActive && player.isReady) return { text: '已准备', color: '#2ecc71' };
    if (!player.isActive && !player.isReady) return { text: '未准备', color: '#95a5a6' };
    
    return { text: '游戏中', color: '#3498db' };
  };
  
  // 获取游戏状态显示
  const getGameStatusDisplay = (status) => {
    switch (status) {
      case 'waiting':
        return '等待玩家';
      case 'starting':
        return '游戏开始中';
      case 'preflop':
        return '发牌阶段';
      case 'flop':
        return '翻牌阶段';
      case 'turn':
        return '转牌阶段';
      case 'river':
        return '河牌阶段';
      case 'showdown':
        return '摊牌阶段';
      case 'finished':
        return '游戏结束';
      default:
        return status;
    }
  };
  
  // 获取当前回合玩家名称
  const getCurrentTurnPlayerName = () => {
    if (!gameState.currentTurn) return '-';
    
    const currentTurnPlayer = players.find(p => p.id === gameState.currentTurn);
    return currentTurnPlayer ? currentTurnPlayer.name : '-';
  };

  return (
    <Container>
      <Section>
        <SectionTitle>玩家列表</SectionTitle>
        <PlayerList>
          {players.map((player) => {
            const status = getPlayerStatus(player);
            return (
              <PlayerItem key={player.id}>
                <PlayerAvatar isActive={player.isActive}>
                  {player.name.charAt(0).toUpperCase()}
                </PlayerAvatar>
                <PlayerInfo>
                  <PlayerName>
                    {player.name}
                    {player.id === currentPlayerId && ' (您)'}
                  </PlayerName>
                  <PlayerStatus color={status.color}>
                    {status.text}
                    {player.seatPosition !== -1 && ` | 座位 ${player.seatPosition + 1}`}
                  </PlayerStatus>
                </PlayerInfo>
                <ChipsInfo>{player.chips}</ChipsInfo>
              </PlayerItem>
            );
          })}
        </PlayerList>
      </Section>
      
      {gameState.status !== 'waiting' ? (
        <Section>
          <SectionTitle>游戏状态</SectionTitle>
          <GameStateInfo>
            <StatusItem>
              <StatusLabel>状态</StatusLabel>
              <StatusValue>{getGameStatusDisplay(gameState.status)}</StatusValue>
            </StatusItem>
            <StatusItem>
              <StatusLabel>底池</StatusLabel>
              <StatusValue>{gameState.pot}</StatusValue>
            </StatusItem>
            <StatusItem>
              <StatusLabel>当前下注</StatusLabel>
              <StatusValue>{gameState.currentBet}</StatusValue>
            </StatusItem>
            <StatusItem>
              <StatusLabel>当前回合</StatusLabel>
              <StatusValue>{getCurrentTurnPlayerName()}</StatusValue>
            </StatusItem>
            <StatusItem>
              <StatusLabel>庄家</StatusLabel>
              <StatusValue>
                {gameState.dealerPosition !== -1 
                  ? `座位 ${gameState.dealerPosition + 1}` 
                  : '-'}
              </StatusValue>
            </StatusItem>
            <StatusItem>
              <StatusLabel>小盲注</StatusLabel>
              <StatusValue>
                {gameState.smallBlindPosition !== -1 
                  ? `座位 ${gameState.smallBlindPosition + 1}` 
                  : '-'}
              </StatusValue>
            </StatusItem>
            <StatusItem>
              <StatusLabel>大盲注</StatusLabel>
              <StatusValue>
                {gameState.bigBlindPosition !== -1 
                  ? `座位 ${gameState.bigBlindPosition + 1}` 
                  : '-'}
              </StatusValue>
            </StatusItem>
          </GameStateInfo>
        </Section>
      ) : (
        <NoGameInfo>
          游戏尚未开始<br />
          请等待所有玩家准备...
        </NoGameInfo>
      )}
    </Container>
  );
};

export default GameInfo;
