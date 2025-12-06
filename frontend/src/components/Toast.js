import React, { useEffect } from "react";
import styled, { keyframes } from "styled-components";

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <ToastContainer $type={type}>
      <ToastIcon>{type === "success" ? "✅" : "❌"}</ToastIcon>
      <ToastMessage>{message}</ToastMessage>
      <CloseButton onClick={onClose}>×</CloseButton>
    </ToastContainer>
  );
};

const slideInRight = keyframes`
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 100px;
  right: 20px;
  background: ${(props) =>
    props.$type === "success"
      ? "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)"
      : "linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)"};
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1001;
  animation: ${slideInRight} 0.3s ease-out;
  min-width: 300px;
  max-width: 400px;

  @media (max-width: 768px) {
    right: 10px;
    left: 10px;
    min-width: auto;
  }
`;

const ToastIcon = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const ToastMessage = styled.div`
  flex: 1;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export default Toast;
