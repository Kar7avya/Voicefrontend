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
          <span className="brand-icon">🔊</span>
          <span className="brand-name">VoiceAI</span>
        </NavLink>

        {/* Desktop Links */}
        <ul className="nav-links">
          <li><NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/">Home</NavLink></li>
          <li><NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/upload">Upload</NavLink></li>
          <li><NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/dashboard">Dashboard</NavLink></li>
          <li><NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/teleprompter">Teleprompter</NavLink></li>
          <li><NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/tts">TTS</NavLink></li>
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
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default Header;