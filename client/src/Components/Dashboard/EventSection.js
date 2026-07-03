// src/components/EventsSection.jsx
import React, { useEffect, useState } from 'react';
import EventCard from './EventCard';

const EventSection = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/venues');
        const data = await res.json();
        setUpcomingEvents(data);
      } catch (err) {
        console.error('Error fetching venues:', err);
      }
    };
    fetchVenues();
  }, []);
  
  

  const trendingEvents = [
    {
      id: 1,
      title: "Food Festival",
      date: "Jul 5, 2023",
      time: "11:00 AM",
      venue: "Downtown Square, Chicago",
      price: "$29.99",
      image: "https://source.unsplash.com/random/600x400/?food"
    },
    {
      id: 2,
      title: "Art Exhibition",
      date: "Jun 18, 2023",
      time: "10:00 AM",
      venue: "Modern Art Museum, Paris",
      price: "$39.99",
      image: "https://source.unsplash.com/random/600x400/?art"
    }
  ];

  return (
    <>
    {/* <input
  type="text"
  id="eventSearch"
  placeholder="Search events..."
  className="search-input"
/> */}

      {/* Upcoming Events */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Events Venue</h2>
          <button className="see-all">See all</button>
        </div>
        <div className="events-scroll">
          {upcomingEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>

     
    </>
  );
};

export default EventSection;
