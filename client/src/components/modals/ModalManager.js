// src/components/modals/ModalManager.js
import React from 'react';
import { useSelector } from 'react-redux';
import PlayerNameModal from './PlayerNameModal';
import CreateRoomModal from './CreateRoomModal';
import EditNicknameModal from './EditNicknameModal';

const ModalManager = () => {
  const activeModal = useSelector((state) => state.ui.activeModal);
  
  // 根据当前活动的模态框类型渲染对应的模态框
  const renderModal = () => {
    switch (activeModal) {
      case 'playerName':
        return <PlayerNameModal />;
      case 'createRoom':
        return <CreateRoomModal />;
      case 'editNickname':  // 新增的模态框类型
        return <EditNicknameModal />;
      default:
        return null;
    }
  };

  return <>{renderModal()}</>;
};

export default ModalManager;
