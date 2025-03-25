// src/components/modals/PlayerNameModal.js
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { closeModal } from '../../store/slices/uiSlice';
import { updatePlayerName } from '../../store/slices/authSlice';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 350px;
  max-width: 90%;
  padding: 20px;
`;

const ModalHeader = styled.div`
  margin-bottom: 20px;
  text-align: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 15px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background-color: #3498db;
  color: white;
  width: 100%;
  
  &:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
`;

const PlayerNameModal = () => {
  const dispatch = useDispatch();
  const modalData = useSelector((state) => state.ui.modalData) || {};
  const playerName = useSelector((state) => state.auth.playerName);
  
  const [name, setName] = useState(playerName || '');
  const [error, setError] = useState(null);
  
  // 处理名称变化
  const handleNameChange = (e) => {
    setName(e.target.value);
    if (error) setError(null);
  };
  
  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('请输入您的昵称');
      return;
    }
    
    // 更新玩家名称
    dispatch(updatePlayerName(name));
    
    // 关闭模态框
    dispatch(closeModal());
    
    // 如果有完成回调，执行它
    if (modalData.onComplete) {
      modalData.onComplete();
    }
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>输入您的昵称</ModalTitle>
        </ModalHeader>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="playerName">昵称</Label>
            <Input
              type="text"
              id="playerName"
              value={name}
              onChange={handleNameChange}
              placeholder="请输入您的昵称"
              autoFocus
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </FormGroup>
          
          <ButtonGroup>
            <Button type="submit">
              确认
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default PlayerNameModal;
