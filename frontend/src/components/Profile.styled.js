import styled from "styled-components";

export const ProfileContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  margin-top: -70px;
  padding-top: calc(2rem + 70px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

export const ProfileCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 700px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 1rem;
  }
`;

export const Section = styled.div`
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

export const SectionTitle = styled.h2`
  color: #333;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const InfoRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const Label = styled.span`
  font-weight: 600;
  color: #666;
`;

export const Value = styled.span`
  color: #333;
  font-size: 1rem;
`;

export const Badge = styled.span`
  background: linear-gradient(135deg, #ffd89b 0%, #ff9a76 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

export const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
    cursor: not-allowed;
    transform: none;
  }
`;

export const DangerButton = styled(Button)`
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  margin-bottom: 20px;
  &:hover {
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5);
  }
`;

export const DeleteSection = styled(Section)`
  border: 2px solid #ffebee;
  border-radius: 12px;
  padding: 1.5rem;
  background: #fff5f5;
`;

export const WarningText = styled.p`
  color: #d32f2f;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  line-height: 1.5;
`;

export const ConfirmBox = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid #ffcdd2;

  p {
    margin-bottom: 1rem;
    color: #333;
    font-weight: 500;
  }

  strong {
    color: #d32f2f;
    font-weight: 700;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    margin-bottom: 1rem;
    font-family: monospace;

    &:focus {
      outline: none;
      border-color: #ff6b6b;
    }
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  button {
    flex: 1;
    min-width: 120px;
  }
`;
