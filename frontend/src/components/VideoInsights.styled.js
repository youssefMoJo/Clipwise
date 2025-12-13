import styled from "styled-components";

export const InsightsContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2.5rem 2rem;
  margin-top: -70px;
  padding-top: calc(2.5rem + 70px);

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    padding-top: calc(1.5rem + 70px);
  }
`;

export const Content = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

export const Header = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

export const BackButton = styled.button`
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 2px solid #667eea;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;

  &:hover {
    background: #667eea;
    color: white;
    transform: translateX(-4px);
  }
`;

export const WatchButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  margin-top: 1rem;
  align-self: flex-start;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const VideoTitle = styled.h1`
  color: #333;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const MetaInfo = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

export const CategoryBadge = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
`;

export const EmotionalTone = styled.span`
  background: rgba(255, 193, 7, 0.2);
  color: #f57c00;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 2px solid rgba(255, 193, 7, 0.4);
`;

export const TagsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const Tag = styled.span`
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 0.3rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

export const Section = styled.div`
  margin-bottom: 2rem;
`;

export const SectionTitle = styled.h2`
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const SectionIcon = styled.span`
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

export const LessonCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

export const LessonHeader = styled.div`
  margin-bottom: 1rem;
`;

export const LessonTitle = styled.h3`
  color: #333;
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

export const LessonSummary = styled.p`
  color: #555;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  line-height: 1.6;
  font-style: italic;
`;

export const DetailedExplanation = styled.p`
  color: #666;
  font-size: 1rem;
  line-height: 1.7;
  margin: 0 0 1.5rem 0;
`;

export const SubSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f0f0f0;
`;

export const SubTitle = styled.h4`
  color: #667eea;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
`;

export const ActionStepsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const ActionStep = styled.li`
  color: #555;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
  position: relative;

  &::before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #4caf50;
    font-weight: 700;
    font-size: 1.1rem;
  }
`;

export const ExamplesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const ExampleItem = styled.li`
  color: #555;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
  position: relative;

  &::before {
    content: "•";
    position: absolute;
    left: 0;
    color: #667eea;
    font-weight: 700;
    font-size: 1.5rem;
    line-height: 1;
  }
`;

export const QuoteCard = styled.div`
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  border-left: 4px solid #667eea;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  margin-bottom: 1rem;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

export const QuoteIcon = styled.span`
  position: absolute;
  top: -10px;
  left: 10px;
  font-size: 4rem;
  color: #667eea;
  opacity: 0.2;
  font-family: Georgia, serif;
`;

export const QuoteText = styled.p`
  color: #ffffffff;
  font-size: 1.1rem;
  font-style: italic;
  line-height: 1.7;
  margin: 0;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const ReflectionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #e3f2fd;
`;

export const ReflectionQuestion = styled.p`
  color: #333;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
`;

export const WarningCard = styled.div`
  background: #fff3e0;
  border-left: 4px solid #ff9800;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

export const WarningText = styled.p`
  color: #e65100;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
`;

export const MindsetCard = styled.div`
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #81c784;
`;

export const MindsetText = styled.p`
  color: #2e7d32;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  font-weight: 600;
`;

export const EmptyMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: white;
  font-size: 1.2rem;
  font-weight: 500;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
`;

export const LoadingText = styled.p`
  color: white;
  font-size: 1.2rem;
  font-weight: 500;
`;
