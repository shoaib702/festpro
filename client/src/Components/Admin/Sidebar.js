import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">E</div>
        <div className="brand-text">Event Ease</div>
      </div>
      <nav className="nav-menu">
        <NavLink 
          to="/vendorDashboard" 
          end
          className={({ isActive }) => 
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </NavLink>
        <NavLink 
          to="/allvenues" 
          className={({ isActive }) => 
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          Venues
        </NavLink>
        <NavLink 
          to="/booking" 
          className={({ isActive }) => 
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Customers
        </NavLink>
        <NavLink 
          to="/report" 
          className={({ isActive }) => 
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Report
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;