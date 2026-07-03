import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const Header = () => {
  const [user, setUser] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem('user');
      if (!userId) {
        navigate('/login');
        return;
      }
      try {
        const res = await fetch(`http://https://festpro-yvwm.onrender.com/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          console.error('Failed to fetch user info');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUser();
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className='imageContainer'>
      <div className="top-nav">
        <div className="logo"><a style={{ textDecoration: "none", color: "white" }} href='/explore'>Eventify</a></div>

        <div className="search-bar">
          <input
            type="text"
            id="eventSearch"
            placeholder="Search events..."
            className="search-input"
          />
        </div>

        <div className="icons">
          <div className="profile-icon-container">
            <span
              className="icon profile-icon"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              profile
            </span>

            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-item">
                  <a href="/my_profile">Edit Profile</a>
                </div>
                <div className="dropdown-item"><a href='/mybooking'>MY Booking</a></div>
                <div className="dropdown-item" onClick={handleLogout}>Logout</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="welcome-header">
        <h1>Welcome back, {user ? user.name : 'Guest'}! 👋</h1>
        <p>Discover your next event!</p>
      </div>
    </div>
  );
};

export default Header;
