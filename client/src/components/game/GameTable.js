// src/components/game/GameTable.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import PlayerSeat from './PlayerSeat';
import CommunityCards from './CommunityCards';
import ActionControls from './ActionControls';
import Pot from './Pot';
import DealerButton from './DealerButton';
import { sitDown } from '../../services/socket/socketService';
import { setNotification } from '../../store/slices/uiSlice';

const TableContainer = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  background-color: #277714;
  border-radius: 150px;
  border: 15px solid #5d3a1a;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const TableFelt = styled.div`
  position: relative;
  width: 95%;
  height: 90%;
  background-color: #277714;
  border-radius: 140px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TableCenter = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 300px;
  height: 200px;
  z-index: 10;
`;

const SeatsContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const SeatPosition = styled.div`
  position: absolute;
  width: 120px;
  height: 150px;
  pointer-events: auto;
  ${({ position, totalSeats }) => getSeatPositionStyle(position, totalSeats)}
`;

// 根据座位索引和总座位数计算座位位置
const getSeatPositionStyle = (position, totalSeats) => {
  // 计算每个座位的角度
  const angleStep = 360 / totalSeats;
  // 设置第一个座位的开始角度（通常是底部中间）
  const startAngle = 270;
  // 椭圆的半径
  const radiusX = 44; // 横向半径（%）
  const radiusY = 40; // 纵向半径（%）

  // 计算当前座位的角度
  const angle = ((startAngle + position * angleStep) * Math.PI) / 180;
  
  // 计算座位的位置
  const left = 50 + radiusX * Math.cos(angle);
  const top = 50 + radiusY * Math.sin(angle);

  return `
    left: ${left}%;
    top: ${top}%;
    transform: translate(-50%, -50%);
  `;
};

const GameTable = () => {
  const dispatch = useDispatch();
  const seats = useSelector((state) => state.game.seats);
  const players = useSelector((state) => state.game.players);
  const gameState = useSelector((state) => state.game.gameState);
  const roomInfo = useSelector((state) => state.game.roomInfo);
  const currentPlayerId = useSelector((state) => state.auth.playerId);
  const playerCards = useSelector((state) => state.game.playerCards);
  const currentTurnData = useSelector((state) => state.game.currentTurnData);
  const playerActions = useSelector((state) => state.game.playerActions);  
  const [showEmptySeats, setShowEmptySeats] = useState(false);
  
  // 确定当前玩家是否已入座
  const currentPlayerSeated = players.some(
    (player) => player.id === currentPlayerId && player.seatPosition !== -1
  );
  
  // 根据座位ID获取对应的玩家
  const getPlayerBySeat = (seatPosition) => {
    const player = players.find((player) => player.seatPosition === seatPosition);
     // 返回添加了 lastAction 的玩家信息
  if (player) {
    return {
      ...player,
      lastAction: playerActions[player.id] || null
    };
  }
  
  return null;
};
  
  // 处理入座点击
  const handleSitClick = (seatPosition) => {
    sitDown(seatPosition);
  };
  
  // 计算当前玩家是否是当前回合玩家
  const isCurrentPlayerTurn = () => {
    if (!currentTurnData) return false;
    return currentTurnData.playerId === currentPlayerId;
  };
  
  // 切换显示/隐藏空座位
  const toggleEmptySeats = () => {
    setShowEmptySeats(!showEmptySeats);
  };
  
  useEffect(() => {
    // 当前回合玩家变化时通知
    if (currentTurnData && currentTurnData.playerId === currentPlayerId) {
      dispatch(setNotification({
        message: '轮到你行动了',
        type: 'warning'
      }));
    }
  }, [currentTurnData, currentPlayerId, dispatch]);

  return (
    <TableContainer>
      <TableFelt>
        <TableCenter>
          <CommunityCards cards={gameState.communityCards} />
          <Pot amount={gameState.pot} />
        </TableCenter>
        
        <SeatsContainer>
          {seats.map((seat, index) => (
            <SeatPosition
              key={index}
              position={seat.position}
              totalSeats={seats.length}
            >
            <PlayerSeat
            seat={seat}
            player={getPlayerBySeat(seat.position)}
            isCurrentTurn={currentTurnData && currentTurnData.playerId === (seat.playerId || null)}
            dealerPosition={gameState.dealerPosition}
            smallBlindPosition={gameState.smallBlindPosition}
            bigBlindPosition={gameState.bigBlindPosition}
            onSitClick={() => handleSitClick(seat.position)}
            showEmpty={showEmptySeats || seat.isOccupied}
            playerCards={seat.playerId === currentPlayerId ? playerCards : []}
            currentBet={gameState.currentBet}
            lastAction={seat.playerId && playerActions[seat.playerId] ? playerActions[seat.playerId] : null}
            />
            </SeatPosition>
          ))}
        </SeatsContainer>
        
        {gameState.dealerPosition !== -1 && (
          <DealerButton position={gameState.dealerPosition} seats={seats} />
        )}
        
        {isCurrentPlayerTurn() && currentPlayerSeated && (
          <ActionControls
            gameState={gameState}
            currentPlayer={players.find(p => p.id === currentPlayerId)}
          />
        )}
        
        {!currentPlayerSeated && (
          <button 
            className="toggle-seats-btn"
            onClick={toggleEmptySeats}
            style={{
              position: 'absolute',
              bottom: '10px',
              zIndex: 100,
              padding: '8px 15px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showEmptySeats ? '隐藏空座位' : '显示空座位'}
          </button>
        )}
      </TableFelt>
    </TableContainer>
  );
};

export default GameTable;
