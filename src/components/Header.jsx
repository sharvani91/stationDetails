import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/Rail_logo.png';
import profileIcon from '../assets/user.png';
import './Header.css';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/"); 
    setShowDropdown(false);
  };

  return (
    <header className="header">
      <img src={logo} alt="Railway Logo" className="railway-logo" />
      <div className="header-title" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
  <h1>पूर्व तट रेलवे</h1>
  <h2>EAST COAST RAILWAY</h2>
</div>


      {isLoggedIn ? (
        <div style={{ position: 'relative', marginRight: '10px' }}>
          <img
            src={profileIcon}
            alt="User Icon"
            title="Click for options"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              cursor: 'pointer',
            }}
            onClick={() => setShowDropdown(prev => !prev)}
          />
          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '40px',
                right: 0,
                backgroundColor: 'white',
                color: 'black',
                border: '1px solid #ccc',
                borderRadius: '6px',
                boxShadow: '0px 2px 8px rgba(0,0,0,0.2)',
                padding: '6px 12px',
                cursor: 'pointer',
                zIndex: 10
              }}
              onClick={handleLogout}
            >
              Logout
            </div>
          )}
        </div>
      ) : (
        location.pathname === '/' && (
          <Link to="/login" className="login-button">Login</Link>
        )
      )}
    </header>
  );
}

export default Header;
