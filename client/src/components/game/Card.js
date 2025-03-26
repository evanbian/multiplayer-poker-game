// src/components/game/Card.js
import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  position: relative;
  width: ${({ small }) => (small ? '35px' : '70px')};
  height: ${({ small }) => (small ? '50px' : '100px')};
  border-radius: 5px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: ${({ small }) => (small ? '14px' : '24px')};
  color: ${({ isRed }) => (isRed ? 'red' : 'black')};
  overflow: hidden;
  user-select: none;
  transition: transform 0.2s ease;
  transform-style: preserve-3d;
  transform: ${({ isHidden }) => (isHidden ? 'rotateY(180deg)' : 'rotateY(0)')};
  
  &:hover {
    transform: ${({ isHidden }) => 
      isHidden ? 'rotateY(180deg)' : 'rotateY(0) translateY(-5px)'};
  }
`;

const CardBack = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #1e88e5;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(0, 0, 0, 0.1) 10px,
    rgba(0, 0, 0, 0.1) 20px
  );
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  backface-visibility: hidden;
  transform: rotateY(180deg);
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${({ small }) => (small ? '2px' : '5px')};
  backface-visibility: hidden;
`;

const CardCorner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ isBottom }) => (isBottom ? 'flex-end' : 'flex-start')};
  transform: ${({ isBottom }) => (isBottom ? 'rotate(180deg)' : 'none')};
  font-size: ${({ small }) => (small ? '10px' : '14px')};
`;

const SuitSymbol = styled.div`
  font-size: ${({ small }) => (small ? '8px' : '12px')};
`;

const CardCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: ${({ small }) => (small ? '16px' : '32px')};
`;

// 修改 client/src/components/game/Card.js 文件中的 Card 组件:

const Card = ({ card, small = false }) => {
  // 如果卡牌不存在或者被隐藏，显示卡背
  if (!card || card.hidden) {
    return (
      <CardContainer small={small} isHidden={true}>
        <CardBack />
      </CardContainer>
    );
  }

  // 根据花色确定颜色和符号
  const suitSymbols = {
    hearts: { symbol: '♥', isRed: true },
    diamonds: { symbol: '♦', isRed: true },
    clubs: { symbol: '♣', isRed: false },
    spades: { symbol: '♠', isRed: false }
  };

  const { symbol, isRed } = suitSymbols[card.suit];
  
  // 处理特殊牌值显示
  let displayRank = card.rank;
  
  // 确保正确显示10和字母牌
  if (card.rank === '10') displayRank = '10';
  else if (card.rank === 'A') displayRank = 'A';
  else if (card.rank === 'K') displayRank = 'K';
  else if (card.rank === 'Q') displayRank = 'Q';
  else if (card.rank === 'J') displayRank = 'J';

  return (
    <CardContainer small={small} isRed={isRed}>
      <CardFace small={small}>
        <CardCorner small={small}>
          {displayRank}
          <SuitSymbol small={small}>{symbol}</SuitSymbol>
        </CardCorner>
        
        <CardCenter small={small}>{symbol}</CardCenter>
        
        <CardCorner small={small} isBottom>
          {displayRank}
          <SuitSymbol small={small}>{symbol}</SuitSymbol>
        </CardCorner>
      </CardFace>
    </CardContainer>
  );
};
export default Card;
