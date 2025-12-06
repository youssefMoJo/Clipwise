import React from "react";
import Navbar from "./Navbar";
import PageTransition from "./PageTransition";
import styled from "styled-components";

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
`;

function Layout({ children }) {
  return (
    <LayoutContainer>
      <Navbar />
      <MainContent>
        <PageTransition>{children}</PageTransition>
      </MainContent>
    </LayoutContainer>
  );
}

export default Layout;
