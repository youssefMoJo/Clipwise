import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(15px, -25px) rotate(5deg);
  }
  50% {
    transform: translate(-10px, -50px) rotate(-5deg);
  }
  75% {
    transform: translate(10px, -25px) rotate(3deg);
  }
`;

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

export const AddVideoContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #4facfe 75%,
    #667eea 100%
  );
  background-size: 400% 400%;
  animation: ${gradientShift} 15s ease infinite;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin-top: -70px;
  padding-top: calc(2rem + 70px);
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
`;

export const Bubble = styled.div`
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.1) 100%
  );
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px 0 rgba(255, 255, 255, 0.18),
    inset 0 1px 2px rgba(255, 255, 255, 0.5),
    inset 0 -1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: ${float} ${(props) => props.$duration}s ease-in-out infinite;
  animation-delay: ${(props) => props.$delay}s;
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  left: ${(props) => props.$left}%;
  top: ${(props) => props.$top}%;
  pointer-events: none;
  user-select: none;
  will-change: transform;
`;

export const AddVideoCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.5s ease-out;
  box-sizing: border-box;
  position: relative;
  z-index: 10;

  @media (max-width: 640px) {
    padding: 2rem;
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 16px;
  }
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

export const Subtitle = styled.p`
  font-size: 1rem;
  color: #718096;
  margin: 0;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

export const InputContainer = styled.div`
  margin-bottom: 1.5rem;
`;

export const VideoInput = styled.input`
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }

  @media (max-width: 480px) {
    padding: 0.875rem;
    font-size: 0.9rem;
  }
`;

export const GenerateButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 0.875rem;
    font-size: 1rem;
  }
`;

export const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem 0;
`;

export const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const fade = keyframes`
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
`;

export const LoadingQuote = styled.p`
  font-size: 0.875rem;
  font-style: italic;
  text-align: center;
  margin-top: 1rem;
  color: #555;
  animation: ${fade} 3s ease-in-out infinite;
`;

export const LoadingText = styled.p`
  font-size: 1rem;
  color: #718096;
  margin: 0;
`;

export const SupportedPlatforms = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
`;

export const PlatformsTitle = styled.p`
  font-size: 0.875rem;
  color: #718096;
  text-align: center;
  margin: 0 0 1rem 0;
  font-weight: 500;
`;

export const PlatformIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

export const PlatformIcon = styled.div`
  font-size: 1.5rem;
  opacity: 1;
  cursor: default;
`;

export const VideoLengthNote = styled.div`
  font-size: 0.85rem;
  color: #667eea;
  text-align: center;
  margin: 1.25rem 0 0 0;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  font-weight: 500;

  &::before {
    content: "⏱️ ";
    margin-right: 0.25rem;
  }
`;

export const ErrorMessage = styled.div`
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #c33;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-align: center;
`;
