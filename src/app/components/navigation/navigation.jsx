import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaTimes } from "react-icons/fa";
import { routePath as RP } from "../../router/routhpath.jsx";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const roleId = localStorage.getItem("roleid");

  const [activeItem, setActiveItem] = useState(null); 
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Update isMobile on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavigation = (item) => {
    let path;
    switch (item) {
      case "Course":
        path = RP.coursetable;
        break;
      case "Batch":
        path = RP.batchtable;
        break;
      case "Form":
        path = RP.applicationtable;
      break;
      case "Report":   
       path = RP.Reporttable; 
      break;
      default:
        path = "/";
      
    }

    setActiveItem(item);
    navigate(path);

    // Close submenu after navigation-
    setSubmenuOpen(false);

    // Close sidebar only on mobile
    if (isMobile) onClose();
  };

  const handleMasterClick = () => {
    if (!submenuOpen) {
      setSubmenuOpen(true);
      // Default to Course when Master is clicked
      setActiveItem("Course");
      navigate(RP.coursetable);
      
    } else {
      setSubmenuOpen(false);
    }
  };
  const handleOverlayClose = () => {
    setSubmenuOpen(false); 
    onClose();             
  };

  return (
    <>
      <SidebarOverlay $isOpen={isOpen} onClick={handleOverlayClose} />
      <SidebarContainer $isOpen={isOpen}>
        <SidebarHeader>
          <FaTimes onClick={onClose} />
        </SidebarHeader>

        <NavList>
          {/* Parent Item with Submenu */}
          <NavItem onClick={handleMasterClick}>
            Master
          </NavItem>

          {/* Mobile submenu */}
          {submenuOpen && isMobile && (
            <SubNavMobile>
              <SubNavItem
                className={activeItem === "Course" ? "active" : ""}
                onClick={() => handleNavigation("Course")}
              >
                Course
              </SubNavItem>
              <SubNavItem
                className={activeItem === "Batch" ? "active" : ""}
                onClick={() => handleNavigation("Batch")}
              >
                Batch
              </SubNavItem>
            </SubNavMobile>
          )}

          {/* Single Item */}
          {roleId !== "4" && roleId !== "5" && (
            <NavItem
              className={activeItem === "Form" ? "active" : ""}
              onClick={() => handleNavigation("Form")}
            >
              Form
            </NavItem>
          )}
          <NavItem
          className={activeItem === "Report" ? "active" : ""}
          onClick={() => handleNavigation("Report")}>
          Report
          </NavItem>
        </NavList>

        {/* Desktop submenu */}
        {submenuOpen && !isMobile && (
          <FlyoutMenu>
            <SubNavItem
              className={activeItem === "Course" ? "active" : ""}
              onClick={() => handleNavigation("Course")}
            >
              Course
            </SubNavItem>
            <SubNavItem
              className={activeItem === "Batch" ? "active" : ""}
              onClick={() => handleNavigation("Batch")}
            >
              Batch
            </SubNavItem>
          </FlyoutMenu>
        )}
      </SidebarContainer>
    </>
  );
};

export default Sidebar;

// Styled Components
const SidebarOverlay = styled.div`
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 998;
`;

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: ${({ $isOpen }) => ($isOpen ? "0" : "-260px")};
  height: 100vh;
  width: 260px;
  background-color: #090808;
  color: white;
  padding: 20px;
  transition: left 0.3s ease-in-out;
  z-index: 999;
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  font-size: 1.5rem;
  cursor: pointer;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 20px 0;
  margin: 0;
`;

const NavItem = styled.li`
  padding: 12px 10px;
  border-bottom: 1px solid #333;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    color: #d32f2f;
  }

  &.active {
    font-weight: bold;
    color: #d32f2f;
  }
`;

const SubNavMobile = styled.ul`
  list-style: none;
  padding-left: 15px;
  margin: 5px 0 0 0;
`;

const SubNavItem = styled.li`
  padding: 10px 0;
  cursor: pointer;

  &:hover {
    color: #d32f2f;
  }

  &.active {
    font-weight: bold;
    color: #d32f2f;
  }
`;

const FlyoutMenu = styled.div`
  position: fixed;
  top: 60px; 
  left: 260px; 
  background-color: #111;
  color: white;
  padding: 10px;
  border: 1px solid #333;
  min-width: 200px;
  z-index: 1000;
  box-shadow: 0 0 10px rgba(0,0,0,0.5);

  li {
    padding: 10px 15px;
    cursor: pointer;
    border-bottom: 1px solid #333;

    &:hover {
      color: #d32f2f;
    }

    &.active {
      font-weight: bold;
      color: #d32f2f;
    }
  }
`;
