// src/components/modals/CreateRoomModal.js
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { createRoom } from '../../services/socket/socketService';
import { closeModal, setActiveModal, setLoading } from '../../store/slices/uiSlice';

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
  width: 400px;
  max-width: 90%;
  padding: 20px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #7f8c8d;
  
  &:hover {
    color: #2c3e50;
  }
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

const Select = styled.select`
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
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 15px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled(Button)`
  background-color: #e74c3c;
  color: white;
  
  &:hover {
    background-color: #c0392b;
  }
`;

const CreateButton = styled(Button)`
  background-color: #2ecc71;
  color: white;
  
  &:hover {
    background-color: #27ae60;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
`;

const LoadingIndicator = styled.div`
  color: #3498db;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
`;

const CreateRoomModal = () => {
  const dispatch = useDispatch();
  const playerName = useSelector((state) => state.auth.playerName);
  const isLoading = useSelector((state) => state.ui.loading);
  
  const [formData, setFormData] = useState({
    roomName: '',
    playerName: playerName || '',
    maxPlayers: 9,
    minBet: 10
  });
  
  const [errors, setErrors] = useState({});
  
  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // 清除错误
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };
  
  // 验证表单
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.roomName.trim()) {
      newErrors.roomName = '请输入房间名称';
    }
    
    if (!formData.playerName.trim()) {
      newErrors.playerName = '请输入玩家名称';
    }
    
    if (formData.maxPlayers < 2 || formData.maxPlayers > 9) {
      newErrors.maxPlayers = '玩家数量必须在2-9之间';
    }
    
    if (formData.minBet < 1) {
      newErrors.minBet = '最小下注额必须大于0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm() || isLoading) {
      return;
    }
    
    // 设置加载状态
    dispatch(setLoading(true));
    
    // 创建房间
    createRoom(
      formData.roomName,
      formData.playerName,
      parseInt(formData.maxPlayers, 10),
      parseInt(formData.minBet, 10)
    );
    
    // 延迟关闭模态框以等待服务器响应
    setTimeout(() => {
      dispatch(closeModal());
      dispatch(setLoading(false));
    }, 1000);
  };
  
  // 处理关闭模态框
  const handleClose = () => {
    if (isLoading) return; // 加载中不允许关闭
    dispatch(closeModal());
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>创建新房间</ModalTitle>
          <CloseButton onClick={handleClose} disabled={isLoading}>&times;</CloseButton>
        </ModalHeader>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="roomName">房间名称</Label>
            <Input
              type="text"
              id="roomName"
              name="roomName"
              value={formData.roomName}
              onChange={handleInputChange}
              placeholder="输入房间名称"
              disabled={isLoading}
            />
            {errors.roomName && <ErrorMessage>{errors.roomName}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="playerName">您的昵称</Label>
            <Input
              type="text"
              id="playerName"
              name="playerName"
              value={formData.playerName}
              onChange={handleInputChange}
              placeholder="输入您的昵称"
              disabled={isLoading}
            />
            {errors.playerName && <ErrorMessage>{errors.playerName}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="maxPlayers">最大玩家数</Label>
            <Select
              id="maxPlayers"
              name="maxPlayers"
              value={formData.maxPlayers}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              {[2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <option key={num} value={num}>
                  {num} 人
                </option>
              ))}
            </Select>
            {errors.maxPlayers && <ErrorMessage>{errors.maxPlayers}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="minBet">最小下注额</Label>
            <Input
              type="number"
              id="minBet"
              name="minBet"
              value={formData.minBet}
              onChange={handleInputChange}
              min="1"
              disabled={isLoading}
            />
            {errors.minBet && <ErrorMessage>{errors.minBet}</ErrorMessage>}
          </FormGroup>
          
          {isLoading && <LoadingIndicator>创建房间中，请稍候...</LoadingIndicator>}
          
          <ButtonGroup>
            <CancelButton type="button" onClick={handleClose} disabled={isLoading}>
              取消
            </CancelButton>
            <CreateButton type="submit" disabled={isLoading}>
              创建房间
            </CreateButton>
          </ButtonGroup>
        </Form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default CreateRoomModal;
