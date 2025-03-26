// src/components/game/PlayerSeat.js
import React from 'react';
import styled from 'styled-components';
import Card from './Card';
import { useSelector } from 'react-redux';
import { useSpring, animated } from 'react-spring';

const ActionBubble = styled(animated.div)`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
  z-index: 10;
`;

const SeatContainer = styled.div`
  position: relative;
  width: 120px;
  height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  opacity: ${({ showEmpty }) => (showEmpty ? 1 : 0)};
  transition: opacity 0.3s ease;
`;

const EmptySeat = styled.div`
  width: 100px;
  height: 100px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  border: 2px solid #888;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  font-weight: bold;
  
  &:hover {
    background-color: rgba(30, 30, 30, 0.5);
    border-color: #aaa;
  }
`;

const PlayerInfo = styled.div`
  position: relative;
  width: 100px;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  border: 2px solid ${({ isCurrentTurn }) => (isCurrentTurn ? '#ffcc00' : '#444')};
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  
  ${({ isCurrentTurn }) => isCurrentTurn && `
    box-shadow: 0 0 10px 3px rgba(255, 204, 0, 0.7);
    animation: pulse 1.5s infinite;
  `}
  
  @keyframes pulse {
    0% { box-shadow: 0 0 10px 3px rgba(255, 204, 0, 0.7); }
    50% { box-shadow: 0 0 15px 5px rgba(255, 204, 0, 1); }
    100% { box-shadow: 0 0 10px 3px rgba(255, 204, 0, 0.7); }
  }
`;

const PlayerName = styled.div`
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
`;

const ChipsAmount = styled.div`
  font-size: 12px;
  margin-bottom: 4px;
`;

const PlayerStatus = styled.div`
  font-size: 11px;
  font-style: italic;
  color: ${({ color }) => color || '#aaa'};
`;

const CardsContainer = styled.div`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
`;

const BetContainer = styled.div`
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 3px 6px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
`;

const PositionIndicator = styled.div`
  position: absolute;
  top: -15px;
  right: -15px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
  background-color: ${({ type }) => {
    switch (type) {
      case 'dealer':
        return '#3498db';
      case 'smallBlind':
        return '#e74c3c';
      case 'bigBlind':
        return '#2ecc71';
      default:
        return '#888';
    }
  }};
`;

const ReadyIndicator = styled.div`
  position: absolute;
  top: -18px;
  right: -12px;
  background-color: #27ae60;
  color: white;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
`;

const PlayerSeat = ({
  seat,
  player,
  isCurrentTurn,
  dealerPosition,
  smallBlindPosition,
  bigBlindPosition,
  onSitClick,
  showEmpty,
  playerCards,
  currentBet,
  lastAction
}) => {
  const currentPlayerId = useSelector(state => state.auth.playerId);
  const isCurrentPlayerSeat = player && player.id === currentPlayerId;
  // 添加动作动画
  const actionAnimation = useSpring({
    from: { opacity: 0, transform: 'translate(-50%, 10px)' },
    to: { opacity: lastAction ? 1 : 0, transform: 'translate(-50%, 0px)' },
    config: { duration: 300 },
    reset: true
  });
  // 获取玩家动作显示文本
  const getActionText = () => {
    if (!lastAction) return '';
    
    switch (lastAction.type) {
      case 'fold': return '弃牌';
      case 'check': return '过牌';
      case 'call': return `跟注 ${lastAction.amount}`;
      case 'bet': return `下注 ${lastAction.amount}`;
      case 'raise': return `加注至 ${lastAction.amount}`;
      case 'all-in': return `全押 ${lastAction.amount}`;
      default: return '';
    }
  };

  // 获取玩家状态显示信息
  const getPlayerStatus = () => {
    if (!player) return { text: '', color: '' };
    
    if (player.isFolded) return { text: '已弃牌', color: '#e74c3c' };
    if (player.isAllIn) return { text: '全押', color: '#f39c12' };
    if (!player.isActive && player.isReady) return { text: '已准备', color: '#2ecc71' };
    if (!player.isActive && !player.isReady) return { text: '未准备', color: '#95a5a6' };
    
    return { text: '游戏中', color: '#3498db' };
  };
  
  // 获取位置指示器类型
  const getPositionIndicator = () => {
    if (seat.position === dealerPosition) return 'dealer';
    if (seat.position === smallBlindPosition) return 'smallBlind';
    if (seat.position === bigBlindPosition) return 'bigBlind';
    return null;
  };
  
  // 获取位置指示器文本
  const getPositionIndicatorText = (type) => {
    switch (type) {
      case 'dealer':
        return 'D';
      case 'smallBlind':
        return 'SB';
      case 'bigBlind':
        return 'BB';
      default:
        return '';
    }
  };
  
  const playerStatus = getPlayerStatus();
  const positionIndicator = getPositionIndicator();

  return (
    <SeatContainer showEmpty={showEmpty}>
      {seat.isOccupied && player ? (
        <>
          <PlayerInfo isCurrentTurn={isCurrentTurn}>
            <PlayerName>{player.name}</PlayerName>
            <ChipsAmount>{player.chips} 筹码</ChipsAmount>
            <PlayerStatus color={playerStatus.color}>
              {playerStatus.text}
            </PlayerStatus>
            
            {positionIndicator && (
              <PositionIndicator type={positionIndicator}>
                {getPositionIndicatorText(positionIndicator)}
              </PositionIndicator>
            )}
            
            {player.isReady && !player.isActive && (
              <ReadyIndicator>准备</ReadyIndicator>
            )}
          </PlayerInfo>
          
          {isCurrentPlayerSeat && playerCards.length > 0 && (
            <CardsContainer>
              {playerCards.map((card, index) => (
                <Card key={index} card={card} small />
              ))}
            </CardsContainer>
          )}
          
          {player.currentBet > 0 && (
            <BetContainer>
              {player.currentBet}
              {player.currentBet === currentBet && '✓'}
            </BetContainer>
          )}
           {/* 添加动作显示 */}
          {lastAction && (
            <ActionBubble style={actionAnimation}>
              {getActionText()}
            </ActionBubble>
          )}
        </>
      ) : (
        <EmptySeat onClick={onSitClick}>入座</EmptySeat>
      )}
    </SeatContainer>
  );
};

export default PlayerSeat;
