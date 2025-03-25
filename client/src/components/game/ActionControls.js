// src/components/game/ActionControls.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { sendAction } from '../../services/socket/socketService';

const ActionPanel = styled.div`
  position: absolute;
  bottom: 20px;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 280px;
  pointer-events: auto; /* 确保事件可以传递到按钮 */
`;

const ActionTitle = styled.div`
  color: white;
  font-size: 14px;
  margin-bottom: 10px;
  font-weight: bold;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  width: 100%;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 8px 15px;
  border-radius: 5px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return '#3498db';
      case 'success':
        return '#2ecc71';
      case 'warning':
        return '#f39c12';
      case 'danger':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  }};
  color: white;
  border: none;
  outline: none;
  min-width: 80px; /* 确保按钮有最小宽度 */
  
  &:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }
  
  &:active {
    filter: brightness(0.9);
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
    transform: none;
    filter: brightness(0.8);
  }
`;

const BetControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

const BetInput = styled.input`
  width: 80px;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #3498db;
  text-align: center;
  font-weight: bold;
  outline: none;
`;

const BetSlider = styled.input`
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  border-radius: 4px;
  background: #444;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3498db;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3498db;
    cursor: pointer;
  }
`;

const PredefinedBets = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 5px;
  width: 100%;
`;

const PredefinedBetButton = styled.button`
  flex: 1;
  padding: 5px;
  font-size: 12px;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #34495e;
  }
`;

const ActionControls = ({ gameState, currentPlayer }) => {
  const [betAmount, setBetAmount] = useState(gameState?.minBet || 10);
  const [showBetControls, setShowBetControls] = useState(false);
  
  // 确保gameState和currentPlayer存在
  if (!gameState || !currentPlayer) {
    console.warn('ActionControls: gameState or currentPlayer is undefined');
    return null;
  }
  
  // 计算可用的操作
  const canCheck = gameState.currentBet <= (currentPlayer?.currentBet || 0);
  const canCall = gameState.currentBet > (currentPlayer?.currentBet || 0);
  const callAmount = gameState.currentBet - (currentPlayer?.currentBet || 0);
  const minRaise = gameState.currentBet + gameState.minBet;
  const maxBet = currentPlayer?.chips || 0;
  
  // 处理操作按钮点击
  const handleAction = (action, amount = 0) => {
    console.log(`执行动作: ${action}, 金额: ${amount}`);
    sendAction(action, amount);
  };
  
  // 处理下注金额变化
  const handleBetAmountChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setBetAmount(Math.min(value, maxBet));
    }
  };
  
  // 计算预定义下注金额
  const getPredefinedBets = () => {
    const pot = gameState.pot;
    return [
      { label: '底池的1/2', value: Math.floor(pot / 2) },
      { label: '底池的3/4', value: Math.floor(pot * 0.75) },
      { label: '底池', value: pot },
      { label: '全押', value: maxBet }
    ].filter(bet => bet.value <= maxBet && bet.value > 0);
  };

  return (
    <ActionPanel>
      <ActionTitle>
        {showBetControls ? '选择下注金额' : '轮到你行动了'}
      </ActionTitle>
      
      {showBetControls ? (
        <>
          <BetControls>
            <BetInput
              type="number"
              value={betAmount}
              onChange={handleBetAmountChange}
              min={minRaise}
              max={maxBet}
            />
            <BetSlider
              type="range"
              min={minRaise}
              max={maxBet}
              value={betAmount}
              onChange={handleBetAmountChange}
            />
          </BetControls>
          
          <PredefinedBets>
            {getPredefinedBets().map((bet, index) => (
              <PredefinedBetButton
                key={index}
                onClick={() => setBetAmount(bet.value)}
              >
                {bet.label}
              </PredefinedBetButton>
            ))}
          </PredefinedBets>
          
          <ButtonGroup>
            <ActionButton
              variant="danger"
              onClick={() => setShowBetControls(false)}
            >
              取消
            </ActionButton>
            <ActionButton
              variant="success"
              onClick={() => {
                const action = gameState.currentBet > 0 ? 'raise' : 'bet';
                handleAction(action, betAmount);
              }}
            >
              确认
            </ActionButton>
          </ButtonGroup>
        </>
      ) : (
        <>
          <ButtonGroup>
            <ActionButton
              variant="danger"
              onClick={() => handleAction('fold')}
            >
              弃牌
            </ActionButton>
            
            {canCheck ? (
              <ActionButton
                variant="primary"
                onClick={() => handleAction('check')}
              >
                过牌
              </ActionButton>
            ) : (
              <ActionButton
                variant="primary"
                onClick={() => handleAction('call')}
                disabled={maxBet < callAmount}
              >
                跟注 {callAmount}
              </ActionButton>
            )}
          </ButtonGroup>
          
          <ButtonGroup>
            <ActionButton
              variant="success"
              onClick={() => setShowBetControls(true)}
              disabled={maxBet < minRaise}
            >
              {gameState.currentBet > 0 ? '加注' : '下注'}
            </ActionButton>
            
            <ActionButton
              variant="warning"
              onClick={() => handleAction('all-in')}
              disabled={maxBet === 0}
            >
              全押 {maxBet}
            </ActionButton>
          </ButtonGroup>
        </>
      )}
    </ActionPanel>
  );
};

export default ActionControls;
