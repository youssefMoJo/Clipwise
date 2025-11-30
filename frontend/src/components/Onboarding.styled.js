import styled, { keyframes } from "styled-components";

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shine = keyframes`
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
`;

export const OnboardingContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  --bg-color-1: ${(props) => props.$bgColor1 || "#667eea"};
  --bg-color-2: ${(props) => props.$bgColor2 || "#764ba2"};
  background: linear-gradient(
    135deg,
    var(--bg-color-1) 0%,
    var(--bg-color-2) 100%
  );
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 9999;
  transition: --bg-color-1 0.8s ease-in-out, --bg-color-2 0.8s ease-in-out;

  @supports (background: linear-gradient(in oklch, red, blue)) {
    background: linear-gradient(
      135deg in oklch,
      var(--bg-color-1) 0%,
      var(--bg-color-2) 100%
    );
  }
`;

export const OnboardingHeader = styled.div`
  padding: 1.5rem 1.5rem 0;
  display: flex;
  justify-content: flex-end;
`;

export const SkipButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
`;

export const SlidesContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

export const SlidesWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  transform: translateX(-${(props) => props.$currentSlide * 100}%);
`;

export const Slide = styled.div`
  min-width: 100%;
  width: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  box-sizing: border-box;
`;

export const SlideIllustration = styled.div`
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const getIllustrationGradient = (illustrationType) => {
  switch (illustrationType) {
    case "video-to-insights":
      return "linear-gradient(135deg, rgba(255, 107, 107, 0.3), rgba(255, 193, 7, 0.3))";
    case "ai-processing":
      return "linear-gradient(135deg, rgba(52, 152, 219, 0.3), rgba(155, 89, 182, 0.3))";
    case "knowledge-library":
      return "linear-gradient(135deg, rgba(46, 213, 115, 0.3), rgba(0, 184, 148, 0.3))";
    default:
      return "rgba(255, 255, 255, 0.15)";
  }
};

export const Illustration = styled.div`
  width: 200px;
  height: 200px;
  background: ${(props) =>
    props.$type
      ? getIllustrationGradient(props.$type)
      : "rgba(255, 255, 255, 0.15)"};
  backdrop-filter: blur(10px);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transform: rotate(45deg);
    animation: ${shine} 3s infinite;
  }

  @media (max-width: 768px) {
    width: 160px;
    height: 160px;
  }

  @media (max-width: 480px) {
    width: 140px;
    height: 140px;
  }
`;

export const IllustrationIcon = styled.span`
  font-size: 5rem;
  z-index: 1;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));

  @media (max-width: 768px) {
    font-size: 4rem;
  }

  @media (max-width: 480px) {
    font-size: 3.5rem;
  }
`;

export const SlideContent = styled.div`
  max-width: 500px;
  animation: ${fadeInUp} 0.6s ease-out 0.2s backwards;
`;

export const SlideTitle = styled.h1`
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem;
  line-height: 1.3;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }

  @media (max-width: 480px) {
    font-size: 1.4rem;
  }
`;

export const SlideDescription = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
  font-weight: 400;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

export const OnboardingFooter = styled.div`
  padding: 2rem 2rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

export const DotsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

export const Dot = styled.div`
  width: ${(props) => (props.$active ? "32px" : "10px")};
  height: 10px;
  border-radius: ${(props) => (props.$active ? "5px" : "50%")};
  background: ${(props) =>
    props.$active ? "white" : "rgba(255, 255, 255, 0.3)"};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

export const NextButton = styled.button`
  background: white;
  color: #667eea;
  border: none;
  padding: 1rem 3rem;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  min-width: 200px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 480px) {
    padding: 0.9rem 2.5rem;
    font-size: 1rem;
    min-width: 180px;
  }
`;
