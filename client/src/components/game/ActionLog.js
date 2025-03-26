// client/src/components/game/ActionLog.js
import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  right: 20px;
  top: 20px;
  width: 250px;
  max-height: 200px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 8px;
  padding: 10px;
  overflow-y: auto;
  z-index: 20;
  font-size: 12px;
`;

const Title = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const LogEntry = styled.div`
  margin-bottom: 5px;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const ActionTime = styled.span`
  color: #bdc3c7;
  font-size: 10px;
  margin-right: 5px;
`;

const PlayerName = styled.span`
  color: ${({ color }) => color || '#3498db'};
  font-weight: bold;
`;

const ActionText = styled.span`
  color: #ecf0f1;
`;

const ActionLog = () => {
  const actionLogs = useSelector((state) => state.game.actionLogs || []);
  const logEndRef = useRef(null);
  
  // 自动滚动到底部
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [actionLogs]);
  
  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };
  
  // 获取动作颜色
  const getActionColor = (action) => {
    switch (action) {
      case 'fold': return '#e74c3c';
      case 'check': return '#2ecc71';
      case 'call': return '#3498db';
      case 'bet': return '#f39c12';
      case 'raise': return '#e67e22';
      case 'all-in': return '#9b59b6';
      case 'deal': return '#1abc9c';
      case 'win': return '#f1c40f';
      case 'round_end': return '#95a5a6';
      case 'game_start': return '#16a085';
      case 'small_blind': return '#3498db';
      case 'big_blind': return '#2980b9';
      default: return '#bdc3c7';
    }
  };
  
  // 获取动作文本
  const getActionText = (action) => {
    switch (action.type) {
      case 'fold': return '弃牌';
      case 'check': return '过牌';
      case 'call': return `跟注 ${action.amount || ''}`;
      case 'bet': return `下注 ${action.amount || ''}`;
      case 'raise': return `加注至 ${action.amount || ''}`;
      case 'all-in': return `全押 ${action.amount || ''}`;
      case 'deal': return `发出${action.round === 'flop' ? '翻牌' : action.round === 'turn' ? '转牌' : '河牌'}`;
      case 'win': return `赢得 ${action.amount} 筹码，牌型: ${translateHandType(action.handType)}`;
      case 'round_end': return '回合结束';
      case 'game_start': return '新一局游戏开始';
      case 'small_blind': return `下小盲注 ${action.amount}`;
      case 'big_blind': return `下大盲注 ${action.amount}`;
      default: return action.type;
    }
  };

  // 添加牌型翻译函数
  const translateHandType = (handType) => {
    const handTypes = {
      'Royal Flush': '皇家同花顺',
      'Straight Flush': '同花顺',
      'Four of a Kind': '四条',
      'Full House': '葫芦',
      'Flush': '同花',
      'Straight': '顺子',
      'Three of a Kind': '三条',
      'Two Pair': '两对',
      'One Pair': '一对',
      'High Card': '高牌',
      'Last player standing': '最后一名玩家'
    };
    
    return handTypes[handType] || handType;
  };
  
  if (actionLogs.length === 0) {
    return null;
  }

  return (
    <Container>
      <Title>游戏动作记录</Title>
      {actionLogs.map((log, index) => (
        <LogEntry key={index}>
          <ActionTime>{formatTime(log.timestamp)}</ActionTime>
          <PlayerName color={getActionColor(log.action.type)}>
            {log.playerName}
          </PlayerName>
          {' '}
          <ActionText>{getActionText(log.action)}</ActionText>
        </LogEntry>
      ))}
      <div ref={logEndRef} />
    </Container>
  );
};

export default ActionLog;
