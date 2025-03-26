// src/components/game/Showdown.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import Card from './Card';

const ShowdownContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  padding: 20px;
  color: white;
  width: 80%;
  max-width: 600px;
  z-index: 1000;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  color: #f1c40f;
  text-align: center;
  margin-bottom: 20px;
`;

const ResultsList = styled.div`
  width: 100%;
  max-height: 60vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
`;

const PlayerResult = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ isWinner }) => isWinner ? 'rgba(46, 204, 113, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border: ${({ isWinner }) => isWinner ? '2px solid #2ecc71' : '1px solid rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  padding: 15px;
`;

const PlayerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const PlayerName = styled.div`
  font-weight: bold;
  font-size: 18px;
  display: flex;
  align-items: center;
`;

const WinnerBadge = styled.span`
  background-color: #f1c40f;
  color: #000;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  margin-left: 10px;
`;

const WinAmount = styled.div`
  color: #f1c40f;
  font-size: 16px;
  font-weight: bold;
`;

const HandType = styled.div`
  font-size: 14px;
  color: #bdc3c7;
  margin-bottom: 10px;
`;

const CardsContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;

const CardGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
`;

const CardGroupTitle = styled.div`
  font-size: 12px;
  color: #bdc3c7;
  margin-bottom: 5px;
`;

const CardRow = styled.div`
  display: flex;
  gap: 5px;
`;

const ActionButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
  }
`;

const Showdown = ({ winners, onNextRound }) => {
  const players = useSelector((state) => state.game.players);
  const communityCards = useSelector((state) => state.game.gameState.communityCards);
  const [showResults, setShowResults] = useState(false);
  
  useEffect(() => {
    // 稍微延迟显示结果，以创造戏剧性效果
    const timer = setTimeout(() => {
      setShowResults(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // 根据ID获取玩家
  const getPlayerById = (playerId) => {
    return players.find(player => player.id === playerId) || { name: '未知玩家' };
  };
  
  // 获取扑克牌型的中文名称
  const getHandTypeName = (handType) => {
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
  
  if (!winners || winners.length === 0) {
    return null;
  }
  
  return (
    <ShowdownContainer>
      <Title>牌局结果</Title>
      
      {showResults && (
        <ResultsList>
          {winners.map((winner, index) => {
            const player = getPlayerById(winner.playerId);
            
            return (
              <PlayerResult key={index} isWinner={true}>
                <PlayerHeader>
                  <PlayerName>
                    {player.name}
                    <WinnerBadge>获胜</WinnerBadge>
                  </PlayerName>
                  <WinAmount>+{winner.winAmount} 筹码</WinAmount>
                </PlayerHeader>
                
                <HandType>
                  牌型: {getHandTypeName(winner.handType)}
                </HandType>
                
                <CardsContainer>
                  <CardGroup>
                    <CardGroupTitle>手牌</CardGroupTitle>
                    <CardRow>
                      {winner.hand && winner.hand.map((card, idx) => (
                        <Card key={`hand-${idx}`} card={card} small />
                      ))}
                    </CardRow>
                  </CardGroup>
                  
                  <CardGroup>
                    <CardGroupTitle>公共牌</CardGroupTitle>
                    <CardRow>
                      {communityCards.map((card, idx) => (
                        <Card key={`community-${idx}`} card={card} small />
                      ))}
                    </CardRow>
                  </CardGroup>
                </CardsContainer>
              </PlayerResult>
            );
          })}
        </ResultsList>
      )}
      
      <ActionButton onClick={onNextRound}>
        下一局
      </ActionButton>
    </ShowdownContainer>
  );
};

export default Showdown;
