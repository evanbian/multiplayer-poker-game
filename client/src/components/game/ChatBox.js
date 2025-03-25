// src/components/game/ChatBox.js
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { sendChatMessage } from '../../services/socket/socketService';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #2c3e50;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MessageItem = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 100%;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
`;

const PlayerName = styled.span`
  font-weight: bold;
  font-size: 13px;
  color: ${({ isCurrentPlayer }) => (isCurrentPlayer ? '#3498db' : '#bdc3c7')};
`;

const MessageTime = styled.span`
  font-size: 11px;
  color: #7f8c8d;
`;

const MessageContent = styled.div`
  background-color: ${({ isCurrentPlayer }) => (isCurrentPlayer ? '#3498db' : '#34495e')};
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  align-self: flex-start;
  max-width: 90%;
  word-break: break-word;
`;

const InputArea = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-top: 1px solid #34495e;
`;

const MessageInput = styled.input`
  flex: 1;
  background-color: #34495e;
  border: none;
  border-radius: 20px;
  padding: 8px 15px;
  color: white;
  outline: none;
  
  &::placeholder {
    color: #95a5a6;
  }
  
  &:focus {
    background-color: #2c3e50;
  }
`;

const SendButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  margin-left: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyMessages = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  text-align: center;
  opacity: 0.7;
  height: 100%;
  color: #bdc3c7;
`;

const ChatBox = () => {
  const currentPlayerId = useSelector((state) => state.auth.playerId);
  const messages = useSelector((state) => state.chat.messages);
  
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // 自动滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // 处理消息发送
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    sendChatMessage(message);
    setMessage('');
  };
  
  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <Container>
      <MessagesContainer>
        {messages.length === 0 ? (
          <EmptyMessages>
            聊天室暂无消息<br />
            发送一条消息开始聊天吧！
          </EmptyMessages>
        ) : (
          messages.map((msg, index) => {
            const isCurrentPlayer = msg.playerId === currentPlayerId;
            return (
              <MessageItem key={index} isCurrentPlayer={isCurrentPlayer}>
                <MessageHeader>
                  <PlayerName isCurrentPlayer={isCurrentPlayer}>
                    {isCurrentPlayer ? '我' : msg.playerName}
                  </PlayerName>
                  <MessageTime>{formatTime(msg.timestamp)}</MessageTime>
                </MessageHeader>
                <MessageContent isCurrentPlayer={isCurrentPlayer}>
                  {msg.message}
                </MessageContent>
              </MessageItem>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputArea>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', width: '100%' }}>
          <MessageInput
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="输入消息..."
          />
          <SendButton type="submit" disabled={!message.trim()}>
            <span style={{ fontSize: '18px', marginTop: '-2px' }}>↑</span>
          </SendButton>
        </form>
      </InputArea>
    </Container>
  );
};

export default ChatBox;
