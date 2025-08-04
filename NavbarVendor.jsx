import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './navbarVendor.css';

const NavbarVendor = () => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const vendorId = localStorage.getItem('vendorId');
        const userId = localStorage.getItem('userId');
    
        if (!userId && !vendorId) return;
    
        const response = await fetch(`${process.env.REACT_APP_API_URL}/getName`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, vendorId }),
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const result = await response.json();
    
        console.log('API Response:', result);
    
        if (result.status === 'ok' && result.data && result.data.fname) {
          setUserName(result.data.fname);
        } else {
          console.error('Error in API response:', result.message || 'No name found');
        }
      } catch (error) {
        console.error('Error fetching name:', error);
      }
    };

    fetchUserName();
  }, []);

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        {/* Left Section - Brand/Logo */}
        <div className="navbar-brand-section">
          <Link to="/" className="navbar-brand">
            <img src="/logo.png" alt="Global Sources" className="brand-logo" />
          </Link>
        </div>

        {/* Center Section - Navigation Menu */}
        <div className="navbar-nav-section">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/home" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/help" className="nav-link">
                <i className="fas fa-question-circle"></i>
                Help Center
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/instant-service" className="nav-link">
                <i className="fas fa-headset"></i>
                Instant Service
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/feedback" className="nav-link">
                <i className="fas fa-comment"></i>
                Your Feedback
              </Link>
            </li>
          </ul>
        </div>

        {/* Right Section - User Controls */}
        <div className="navbar-right-section">
          <div className="d-flex align-items-center">
            {/* Notifications */}
            <div className="nav-item notification-section">
              <Link to="/notifications" className="nav-link position-relative">
                <i className="fas fa-bell"></i>
                <span className="notification-badge">1</span>
                Notifications
              </Link>
            </div>

            {/* Language Selector */}
            <div className="nav-item language-section">
              <div className="dropdown">
                <button className="btn nav-link dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  <i className="fas fa-globe"></i>
                  English
                </button>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#">English</a></li>
                  <li><a className="dropdown-item" href="#">中文</a></li>
                  <li><a className="dropdown-item" href="#">Español</a></li>
                </ul>
              </div>
            </div>

            {/* Upgrade Plan */}
            <div className="nav-item upgrade-section">
              <Link to='/vendor/select-plan' className='upgrade-btn'>
                Upgrade Plan
              </Link>
            </div>

            {/* User Profile */}
            <div className="nav-item user-section">
              {userName ? (
                <div className="dropdown user-dropdown">
                  <button className="btn nav-link dropdown-toggle user-profile" type="button" data-bs-toggle="dropdown">
                    <div className="user-avatar">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="user-name">{userName}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><a className="dropdown-item" href="/profile">Profile</a></li>
                    <li><a className="dropdown-item" href="/settings">Settings</a></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><a className="dropdown-item" href="/logout">Logout</a></li>
                  </ul>
                </div>
              ) : (
                <Link to="/signup" className="nav-link login-link">
                  <i className='far fa-user-circle user-icon'></i>
                  Login/Signup
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarVendor;