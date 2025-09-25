import "../navigators/Header.css";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";   // ⬅ added useNavigate
import { toast } from "react-toastify";                   // ⬅ added toast
import supabase from "../pages/supabaseClient";                 // ⬅ make sure path is correct
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import image from "../pages/image.png";

const Header = () => {
  const [scrolled] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    console.log("🔒 Logging out...");
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("❌ Logout error:", error);
      toast.error("Logout failed!");
    } else {
      // Clear local storage tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_email");

      toast.success("You have been logged out!");
      navigate("/login");
    }
  }

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-dark bg-dark static-top ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="container">
        {/* Brand / Logo */}
        <NavLink className="navbar-brand" to="/">
          <img src={image} alt="Logo" height="36" />
        </NavLink>

        {/* Toggle Button (Mobile) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarResponsive"
          aria-controls="navbarResponsive"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="navbarResponsive">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                to="/"
              >
                Home
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                to="/upload"
              >
                Upload
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                to="/dashboard"
              >
                Dashboard
              </NavLink>
            </li>



            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                to="/voicestudio"
              >
                Voice Studio
              </NavLink>
            </li>

            {/* Logout Button */}
            <li className="nav-item">
              <button className="btn btn-danger ms-2" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
