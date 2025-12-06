import styled from "styled-components";

export const Card = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
`;

export const Thumbnail = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: #f0f0f0;
`;

export const ThumbnailPlaceholder = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    font-size: 4rem;
    opacity: 0.8;
  }
`;

export const Content = styled.div`
  padding: 1.25rem;
`;

export const Title = styled.h3`
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MetaInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
`;

export const Duration = styled.span`
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
`;

export const StatusBadge = styled.span`
  background: ${(props) => props.$color}15;
  color: ${(props) => props.$color};
  padding: 0.35rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1.5px solid ${(props) => props.$color}40;
`;

export const ActionButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.65rem 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;
