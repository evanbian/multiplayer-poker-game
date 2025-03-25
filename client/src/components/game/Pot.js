// src/components/game/Pot.js
import React from 'react';
import styled from 'styled-components';
import { useSpring, animated } from 'react-spring';

const PotContainer = styled(animated.div)`
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
`;

const ChipIcon = styled.span`
  margin-right: 6px;
  font-size: 18px;
`;

const Pot = ({ amount }) => {
  // 底池金额变化动画
  const props = useSpring({
    from: { opacity: 0, transform: 'scale(0.8)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 300, friction: 20 },
    reset: true,
    key: amount
  });

  return (
    <PotContainer style={props}>
      <ChipIcon>🪙</ChipIcon>
      底池: {amount}
    </PotContainer>
  );
};

export default Pot;
