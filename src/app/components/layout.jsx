import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../../app/components/header/header.jsx";
//import Navigation from "../components/SideNavbar/sideNavbar.jsx";
import styled from "styled-components";

export default function RootLayout() {
  const [showLabelledMenu, setShowLabelledMenu] = useState(false);

  return (
    <LayoutContainer>
      <HeaderSection>
        <Header onClickMenuBtn={() => setShowLabelledMenu(!showLabelledMenu)} />
      </HeaderSection>
      {/* <BottomSection> */}
       
        <ContentSection>
          <main className="_main">
            <Outlet /> {/* nested route children will render here */}
          </main>
        </ContentSection>
      {/* </BottomSection> */}
    </LayoutContainer>
  );
}

const LayoutContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const HeaderSection = styled.div`
  width: 100%;
`;

/*const BottomSection = styled.div`
  display: flex;
  flex-grow: 1;
`;*/



const ContentSection = styled.div`
  flex: 4;
  position: relative;
  ._main {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 1rem;
  }
`;
