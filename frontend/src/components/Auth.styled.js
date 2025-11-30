import styled, { keyframes } from "styled-components";

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-8px);
  }
  75% {
    transform: translateX(8px);
  }
`;

export const AuthContainer = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  flex-shrink: 0;

  @media (max-width: 640px) {
    padding: 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

export const AuthCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${slideUp} 0.5s ease-out;
  box-sizing: border-box;
  flex-shrink: 0;

  @media (max-width: 640px) {
    border-radius: 20px;
    padding: 2rem 1.5rem;
  }

  @media (max-width: 480px) {
    border-radius: 16px;
    padding: 1.5rem 1rem;
    padding-top: 2rem;
    padding-bottom: 2rem;
  }

  @media (max-width: 360px) {
    border-radius: 12px;
    padding: 1.25rem 0.875rem;
  }
`;

export const AuthHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  @media (max-width: 640px) {
    margin-bottom: 1.5rem;
  }

  @media (max-width: 480px) {
    margin-bottom: 1.25rem;
  }
`;

export const AuthLogo = styled.img`
  width: 150px;
  height: auto;
  margin: 0 auto 0.5rem;
  display: block;

  @media (max-width: 640px) {
    width: 180px;
  }

  @media (max-width: 480px) {
    width: 160px;
  }

  @media (max-width: 360px) {
    width: 140px;
  }
`;

export const AuthSubtitle = styled.p`
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;

  @media (max-width: 640px) {
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }

  @media (max-width: 360px) {
    font-size: 0.8rem;
  }
`;

export const AuthToggle = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 0.25rem;
  margin-bottom: 2rem;
  gap: 0.25rem;

  @media (max-width: 640px) {
    margin-bottom: 1.5rem;
  }

  @media (max-width: 480px) {
    margin-bottom: 1.25rem;
    border-radius: 10px;
  }
`;

export const ToggleBtn = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 10px;
  background: ${(props) => (props.$active ? "white" : "transparent")};
  color: ${(props) => (props.$active ? "#667eea" : "#6b7280")};
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.$active ? "0 2px 8px rgba(0, 0, 0, 0.1)" : "none"};

  &:hover:not(:disabled) {
    color: ${(props) => (props.$active ? "#667eea" : "#4b5563")};
  }

  @media (max-width: 640px) {
    padding: 0.65rem;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    padding: 0.6rem;
    font-size: 0.875rem;
    border-radius: 8px;
  }

  @media (max-width: 360px) {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
`;

export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @media (max-width: 640px) {
    gap: 1.1rem;
  }

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (max-width: 480px) {
    gap: 0.4rem;
  }
`;

export const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;

  @media (max-width: 640px) {
    font-size: 0.875rem;
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }

  @media (max-width: 360px) {
    font-size: 0.825rem;
  }
`;

export const Input = styled.input`
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #9ca3af;
  }

  @media (max-width: 640px) {
    padding: 0.8rem 0.95rem;
    font-size: 0.975rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 0.875rem;
    font-size: 0.95rem;
    border-radius: 8px;
  }

  @media (max-width: 360px) {
    padding: 0.7rem 0.8rem;
    font-size: 0.9rem;
  }
`;

export const ErrorMessage = styled.div`
  padding: 0.875rem 1rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 0.9rem;
  font-weight: 500;
  animation: ${shake} 0.4s ease;

  @media (max-width: 480px) {
    padding: 0.75rem 0.875rem;
    font-size: 0.875rem;
    border-radius: 8px;
  }

  @media (max-width: 360px) {
    padding: 0.7rem 0.8rem;
    font-size: 0.85rem;
  }
`;

export const AuthSubmitBtn = styled.button`
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    padding: 0.9rem;
    font-size: 0.975rem;
    margin-top: 0.4rem;
  }

  @media (max-width: 480px) {
    padding: 0.85rem;
    font-size: 0.95rem;
    border-radius: 10px;
    margin-top: 0.3rem;
  }

  @media (max-width: 360px) {
    padding: 0.8rem;
    font-size: 0.9rem;
  }
`;

export const AuthFooter = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;

  p {
    color: #6b7280;
    font-size: 0.9rem;
    margin: 0;
  }

  @media (max-width: 640px) {
    margin-top: 1.25rem;
    padding-top: 1.25rem;

    p {
      font-size: 0.875rem;
    }
  }

  @media (max-width: 480px) {
    margin-top: 1rem;
    padding-top: 1rem;

    p {
      font-size: 0.85rem;
    }
  }

  @media (max-width: 360px) {
    p {
      font-size: 0.825rem;
    }
  }
`;

export const LinkBtn = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
  transition: color 0.2s ease;

  &:hover:not(:disabled) {
    color: #764ba2;
    text-decoration: underline;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    font-size: 0.875rem;
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }

  @media (max-width: 360px) {
    font-size: 0.825rem;
  }
`;

export const GuestSection = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;

  @media (max-width: 640px) {
    margin-top: 1.25rem;
    padding-top: 1.25rem;
  }

  @media (max-width: 480px) {
    margin-top: 1rem;
    padding-top: 1rem;
  }
`;

export const GuestBtn = styled.button`
  width: 100%;
  padding: 1rem;
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: rgba(102, 126, 234, 0.05);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    padding: 0.9rem;
    font-size: 0.975rem;
  }

  @media (max-width: 480px) {
    padding: 0.85rem;
    font-size: 0.95rem;
    border-radius: 10px;
  }

  @media (max-width: 360px) {
    padding: 0.8rem;
    font-size: 0.9rem;
  }
`;
