import React, { useState } from "react";
import styled from "styled-components";
import { FaTimes } from "react-icons/fa";
import { routePath as RP } from "../../router/routhpath.jsx";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const roleId = localStorage.getItem("roleid");

  const [activeItem, setActiveItem] = useState("Course"); // default active

  const handleNavigation = (item) => {
    let path;
    switch (item) {
      case "Course":
        path =RP.coursetable;
        break;
      case "Batch":
        path = RP.batchtable;
        break;
      case "Form":
        path = RP.applicationtable;
        break;
      default:
        path = "/";
    }

    setActiveItem(item);
    navigate(path); // navigate only when clicked
    onClose();
  };

  return (
    <>
      <SidebarOverlay $isOpen={isOpen} onClick={onClose} />
      <SidebarContainer $isOpen={isOpen}>
        <SidebarHeader>
          <FaTimes onClick={onClose} />
        </SidebarHeader>
        <NavList>
          <li
            className={activeItem === "Course" ? "active" : ""}
            onClick={() => handleNavigation("Course")}
          >
            Course
          </li>
          <li
            className={activeItem === "Batch" ? "active" : ""}
            onClick={() => handleNavigation("Batch")}
          >
            Batch
          </li>
          {roleId !== "4" && roleId !== "5" && (
            <li
              className={activeItem === "Form" ? "active" : ""}
              onClick={() => handleNavigation("Form")}
            >
              Form
            </li>
          )}
        </NavList>
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
  background-color: rgb(9, 8, 8);
  color: white;
  padding: 20px;
  transition: left 0.3s ease-in-out;
  z-index: 999;
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

  li {
    padding: 12px 0;
    border-bottom: 1px solid #333;
    cursor: pointer;

    &:hover {
      color: #d32f2f;
    }

    &.active {
      font-weight: bold;
      color: #d32f2f;
    }
  }
`;
