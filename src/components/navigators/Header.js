import "./Header.css";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import supabase from "../pages/supabaseClient";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed!");
    } else {
      localStorage.clear();
      toast.success("Logged out!");
      navigate("/login");
    }
  }

  return (
    <div className="navbar-wrapper">
      <nav className="navbar-pill">
        {/* Brand */}
        <NavLink className="navbar-brand" to="/">
          <span className="brand-icon">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="1" width="6" height="10" rx="3" fill="white"/>
    <path d="M5 10a7 7 0 0014 0" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <line x1="12" y1="17" x2="12" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="8" y1="21" x2="16" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="21" x2="7" y2="23" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
</span>
          <span className="brand-name">SpeakMasterAI</span>
        </NavLink>

        {/* Desktop Links */}
        <ul className="nav-links">
          <li><NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/">Home</NavLink></li>
          <li><NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/upload">Upload</NavLink></li>
          <li><NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/dashboard">Dashboard</NavLink></li>
          <li><NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/teleprompter">Teleprompter</NavLink></li>
          <li><NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/tts">TTS</NavLink></li>
          <li><NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/speakwell">SpeakWell</NavLink></li>
        </ul>

        {/* Actions */}
        <div className="nav-actions">
          <button className="btn-outline" onClick={handleLogout}>Logout</button>
          <NavLink className="btn-primary" to="/tts">Try Now</NavLink>
        </div>

        {/* Mobile Toggle */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/upload" onClick={() => setMenuOpen(false)}>Upload</NavLink>
          <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
          <NavLink to="/teleprompter" onClick={() => setMenuOpen(false)}>Teleprompter</NavLink>
          <NavLink to="/tts" onClick={() => setMenuOpen(false)}>TTS</NavLink>
          <NavLink to="/speakwell" onClick={() => setMenuOpen(false)}>SpeakWell</NavLink>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default Header;