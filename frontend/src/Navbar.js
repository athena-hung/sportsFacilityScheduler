// src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/Navbar.css";
import pickleballIcon from "./pics/icon.png";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <img src={pickleballIcon} alt="logo" className="navbar-logo" />
        <span className="navbar-title">ParkPlay</span>
      </div>
      <div className="navbar-center">
        <Link to="/court-booking">Find Court</Link>
        <Link to="/confirmed-bookings">My Bookings</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/help">Help</Link>
        <Link to="/profile">Profile</Link>
      </div>
      <div className="navbar-right">
        <button onClick={handleLogout} className="signout-btn">Sign Out</button>
      </div>
    </div>
  );
};

export default Navbar;
