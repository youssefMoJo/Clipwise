import React from "react";
import styled, { keyframes } from "styled-components";

const DeleteConfirmModal = ({ isOpen, onConfirm, onCancel, videoTitle, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={isDeleting ? undefined : onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <IconContainer>
          <WarningIcon>⚠️</WarningIcon>
        </IconContainer>
        <ModalTitle>Delete Video?</ModalTitle>
        <ModalMessage>
          Are you sure you want to delete{" "}
          <VideoTitle>"{videoTitle}" ? </VideoTitle>This action cannot be
          undone.
        </ModalMessage>
        <ButtonGroup>
          <CancelButton onClick={onCancel} disabled={isDeleting}>Cancel</CancelButton>
          <DeleteButton onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Spinner /> Deleting...
              </>
            ) : (
              "Delete"
            )}
          </DeleteButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${slideUp} 0.3s ease-out;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const IconContainer = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const WarningIcon = styled.div`
  font-size: 4rem;
  animation: ${pulse} 2s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(255, 152, 0, 0.3));
`;

const ModalTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 1rem 0;
  text-align: center;
`;

const ModalMessage = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0 0 2rem 0;
  text-align: center;
`;

const VideoTitle = styled.span`
  font-weight: 600;
  color: #333;
  display: block;
  margin-top: 0.5rem;
  word-break: break-word;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  background: #f0f0f0;
  color: #333;
  border: none;
  padding: 0.85rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #e0e0e0;
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%);
  color: white;
  border: none;
  padding: 0.85rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #ee5a6f 0%, #ff7b8f 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 71, 87, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export default DeleteConfirmModal;
