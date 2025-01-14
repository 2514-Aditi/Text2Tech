import React from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Import logo image

function Navbar() {
  return (
    <div className="navbar-container">
      <div className="logo">
        <img src={logo} alt="Text2Tech Logo" />
      </div>
      <nav className="nav">
        <ul className="menu">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/csnap">CSnap</Link>
          </li>
          <li>
            <Link to="/editor">Editor</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;
