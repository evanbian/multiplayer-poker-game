// src/components/game/DealerButton.js
import React from 'react';
import styled from 'styled-components';

const Button = styled.div`
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  z-index: 5;
  transition: transform 0.3s ease;
  
  ${({ position, totalSeats }) => getDealerButtonPosition(position, totalSeats)}
  
  &:hover {
    transform: scale(1.1);
  }
`;

// 计算庄家按钮位置
const getDealerButtonPosition = (position, totalSeats) => {
  // 计算每个座位的角度
  const angleStep = 360 / totalSeats;
  // 设置第一个座位的开始角度
  const startAngle = 270;
  // 椭圆的半径
  const radiusX = 37; // 横向半径（%）
  const radiusY = 33; // 纵向半径（%）

  // 计算当前座位的角度
  const angle = ((startAngle + position * angleStep) * Math.PI) / 180;
  
  // 计算按钮的位置
  const left = 50 + radiusX * Math.cos(angle);
  const top = 50 + radiusY * Math.sin(angle);

  return `
    left: ${left}%;
    top: ${top}%;
  `;
};

const DealerButton = ({ position, seats = [] }) => {
  if (position === -1) return null;
  
  return (
    <Button position={position} totalSeats={seats.length}>
      D
    </Button>
  );
};

export default DealerButton;
