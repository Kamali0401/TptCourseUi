import React, { useState } from "react";
import { FaBars, FaPhoneAlt, FaPowerOff } from "react-icons/fa";
import "./Header.css"; // styles in separate CSS
import Sidebar from "../../components/navigation/navigation";
export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
    <header className="header-block">
       <nav className="navbar desktop-header">
        <div className="nav-left">
          <FaBars
            className="menu-icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        <div className="brand-info">
          <h2>THIAGARAJAR POLYTECHNIC COLLEGE, SALEM-636005</h2>
          <h3>CONTINUING EDUCATION CENTRE</h3>
        </div>

        <div className="nav-right">
          <div className="support">
            <FaPhoneAlt className="icon" />
            <span className="text">Call For Support</span>
            <span className="number">(0427) 2446219, 4099303</span>
          </div>

          <span
            className="power-button"
            onClick={() => console.log("Power off clicked")}
          >
            <FaPowerOff className="icon" />
            <span className="text">Logout</span>
          </span>
        </div>
      </nav>
       {/* Mobile Header */}
      <nav className="navbar mobile-header">
        <div className="nav-left">
          <FaBars
            className="menu-icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        <div className="brand-info">
          <h2>THIAGARAJAR POLYTECHNIC COLLEGE, SALEM-636005</h2>
          <h3>CONTINUING EDUCATION CENTRE</h3>
        </div>

        <div className="nav-right">
          <span
            className="power-button"
            onClick={() => console.log("Power off clicked")}
          >
            <FaPowerOff className="icon" />
            <span className="text">Logout</span>
          </span>
        </div>
      </nav>
    </header>
    
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </>
  );
}
