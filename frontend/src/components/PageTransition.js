import React from "react";
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const TransitionWrapper = styled.div`
  animation: ${fadeIn} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity;
`;

function PageTransition({ children }) {
  return <TransitionWrapper>{children}</TransitionWrapper>;
}

export default PageTransition;
