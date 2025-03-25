// src/components/lobby/RoomList.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { joinRoom } from '../../services/socket/socketService';
import { setActiveModal } from '../../store/slices/uiSlice';

const Container = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: #333;
  margin: 0;
`;

const CreateButton = styled.button`
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
  }
`;

const RoomTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
`;

const TableHead = styled.thead`
  background-color: #34495e;
  color: white;
`;

const TableRow = styled.tr`
  background-color: ${({ isEven }) => (isEven ? '#f9f9f9' : 'white')};
  border-bottom: 1px solid #ddd;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f1f1f1;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled.th`
  padding: 15px;
  text-align: left;
`;

const TableCell = styled.td`
  padding: 15px;
  text-align: left;
`;

const JoinButton = styled.button`
  background-color: ${({ disabled }) => (disabled ? '#95a5a6' : '#2ecc71')};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: bold;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ disabled }) => (disabled ? '#95a5a6' : '#27ae60')};
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  background-color: ${({ status }) => {
    switch (status) {
      case 'waiting':
        return '#3498db';
      case 'playing':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  }};
  color: white;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
  color: #bdc3c7;
`;

const EmptyStateText = styled.p`
  font-size: 18px;
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 20px;
`;

const RefreshButton = styled.button`
  background-color: #f39c12;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 10px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #d35400;
  }
`;

const RoomList = () => {
  const dispatch = useDispatch();
  const rooms = useSelector((state) => state.rooms.availableRooms);
  const loading = useSelector((state) => state.rooms.loading);
  const playerName = useSelector((state) => state.auth.playerName);
  
  const [nameInput, setNameInput] = useState(playerName || '');
  
  // 处理加入房间
  const handleJoinRoom = (roomId) => {
    if (!nameInput.trim()) {
      // 如果玩家名称为空，显示输入名称模态框
      dispatch(setActiveModal({ 
        modalType: 'playerName',
        data: { onComplete: () => joinRoom(roomId, nameInput) }
      }));
      return;
    }
    
    joinRoom(roomId, nameInput);
  };
  
  // 处理创建房间
  const handleCreateRoom = () => {
    dispatch(setActiveModal({ modalType: 'createRoom' }));
  };
  
  // 获取状态显示
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'waiting':
        return '等待中';
      case 'playing':
        return '游戏中';
      default:
        return status;
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <Container>
      <Header>
        <Title>可用房间</Title>
        <div>
          <RefreshButton>刷新</RefreshButton>
          <CreateButton onClick={handleCreateRoom}>创建房间</CreateButton>
        </div>
      </Header>
      
      {rooms.length > 0 ? (
        <RoomTable>
          <TableHead>
            <TableRow>
              <TableHeader>房间名称</TableHeader>
              <TableHeader>玩家数</TableHeader>
              <TableHeader>最小下注</TableHeader>
              <TableHeader>状态</TableHeader>
              <TableHeader>操作</TableHeader>
            </TableRow>
          </TableHead>
          <tbody>
            {rooms.map((room, index) => (
              <TableRow key={room.id} isEven={index % 2 === 0}>
                <TableCell>{room.name}</TableCell>
                <TableCell>
                  {room.playerCount}/{room.maxPlayers}
                </TableCell>
                <TableCell>{room.minBet}</TableCell>
                <TableCell>
                  <StatusBadge status={room.status}>
                    {getStatusDisplay(room.status)}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <JoinButton
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={room.status === 'playing' || room.playerCount >= room.maxPlayers}
                  >
                    加入
                  </JoinButton>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </RoomTable>
      ) : (
        <EmptyState>
          <EmptyStateIcon>🎮</EmptyStateIcon>
          <EmptyStateText>
            当前没有可用的游戏房间<br />
            创建一个新房间开始游戏吧！
          </EmptyStateText>
          <CreateButton onClick={handleCreateRoom}>
            创建房间
          </CreateButton>
        </EmptyState>
      )}
    </Container>
  );
};

export default RoomList;
