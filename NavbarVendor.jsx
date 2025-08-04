import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import './navbarVendor.css';
import logo from '../icons/aristostechlogo.png';

const NavbarVendor = () => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const vendorId = localStorage.getItem('vendorId');
        const userId = localStorage.getItem('userId'); // Fixed: Added userId declaration
    
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
    <nav className="navbar">
      <div className="container1">
        <div className="row align-items-center">
          <div className="col-sm-3">
            <Link to="/" className="navbar-brand">
              <p className='logoname'>
                Kada
                <span className='spanlogo'>Theru</span>
              </p>
            </Link>
          </div>
       
          <div className="col-sm-9">
            <div className='row align-items-center'>
              <div className='col-sm-8 upgradeDetails'>
                <Link to='/Vendor/VendorSelectPlan' className='upgradeBtn'>
                  Upgrade Plan
                </Link>
              </div>
              <div className="nav-item col-sm-4 user-section">
                <i className='far fa-user-circle user-icon'></i>
                {userName ? (
                  <span className="nav-link welcome-text">Welcome, {userName}</span>
                ) : (
                  <Link to="/signup" className="nav-link login-link">
                    Login/Signup
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarVendor;