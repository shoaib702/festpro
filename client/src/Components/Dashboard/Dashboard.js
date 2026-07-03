// Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Categories from './Categories';
import EventSection from './EventSection';

import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);



  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/venues');
        const data = await response.json();
        setUpcomingEvents(data);
      } catch (error) {
        console.error('Error fetching venues:', error);
      }
    };

    fetchVenues();
  }, []);



  return (
    <div className="dashboard-container">
      <Header/>
      <Categories  />
      <EventSection  />
    
    </div>
  );
};

export default Dashboard;
