// src/components/game/CommunityCards.js
import React from 'react';
import styled from 'styled-components';
import Card from './Card';
import { useSpring, animated } from 'react-spring';

const Container = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const CardSlot = styled(animated.div)`
  width: 70px;
  height: 100px;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px dashed rgba(255, 255, 255, 0.3);
`;

// 单独的CardSlotWithAnimation组件，每个卡槽使用一个独立的Hook
const CardSlotWithAnimation = ({ index, cards }) => {
  const hasCard = index < cards.length;
  const props = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: {
      opacity: hasCard ? 1 : 0.3, 
      transform: hasCard ? 'translateY(0)' : 'translateY(0)'
    },
    delay: hasCard ? index * 200 : 0
  });

  return (
    <CardSlot style={props}>
      {hasCard ? <Card card={cards[index]} /> : null}
    </CardSlot>
  );
};

const CommunityCards = ({ cards = [] }) => {
  return (
    <Container>
      {[0, 1, 2, 3, 4].map((index) => (
        <CardSlotWithAnimation 
          key={index} 
          index={index} 
          cards={cards} 
        />
      ))}
    </Container>
  );
};

export default CommunityCards;
