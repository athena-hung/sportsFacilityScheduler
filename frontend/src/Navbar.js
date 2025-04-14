// src/components/Navbar.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/Navbar.css";
import pickleballIcon from "./pics/icon.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    // Clear all auth-related data from localStorage
    localStorage.clear();
    
    // Reset any sensitive state if needed
    setIsMenuOpen(false);
    
    // Redirect to login page
    navigate("/", { replace: true });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <Link to="/court-booking" className="navbar-brand">
          <img src={pickleballIcon} alt="logo" className="navbar-logo" />
          <span className="navbar-title">ParkPlay</span>
        </Link>
      </div>
      <button className="mobile-menu-btn" onClick={toggleMenu}>
        ☰
      </button>
      <div className={`navbar-center ${isMenuOpen ? 'active' : ''}`}>
        <Link to="/court-booking" onClick={() => setIsMenuOpen(false)}>Find Court</Link>
        <Link to="/confirmed-bookings" onClick={() => setIsMenuOpen(false)}>My Bookings</Link>
        <Link to="/cart" onClick={() => setIsMenuOpen(false)}>Cart</Link>
        <Link to="/help" onClick={() => setIsMenuOpen(false)}>Help</Link>
        <Link to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link>
      </div>
      <div className="navbar-right">
        <button onClick={handleLogout} className="signout-btn">Sign Out</button>
      </div>
    </div>
  );
};

export default Navbar;
