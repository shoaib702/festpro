// components/Venues.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Categories from './Categories';

const Venues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const categoryId = location.state?.categoryId;

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        let url = 'http://localhost:5000/api/venues';

        if (categoryId) {
          url += `?category=${categoryId}`;
        }

        const response = await axios.get(url);
        setVenues(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchVenues();
  }, [categoryId]);

  const handleViewDetails = (venue) => {
    navigate(`/venue/${venue.id}`, { state: { event: venue } });
  };

  if (loading) return <div className="loading-spinner">Loading venues...</div>;
  if (error) return <div className="error-message">Error loading venues: {error}</div>;

  return (
    <>  <Header/>
        <Categories/>
    <div className="venues-container section">
      
      <div className="section-header">
        <h2 className="section-title">
          {categoryId ? 'Filtered Venues' : 'All Venues'}
        </h2>
      </div>
      <div className="venues-grid">
        {venues.map((venue) => (
          <div key={venue.id} className="venue-card event-card">
            <div className="event-image-container">
              <img
                src={`http://localhost:5000/uploads/${venue.photo}`}
                alt={venue.name}
                className="event-image"
               
              />
              <div className="event-overlay"></div>
              <div className="event-price">₹{venue.rate}</div>
            </div>
            <div className="event-details">
              <h3 className="event-title">{venue.name}</h3>
              <div className="event-date-time">
                <span>Capacity: {venue.capacity} people</span>
              </div>
              <div className="event-venue">{venue.location}</div>
              <button
                className="view-details-button"
                onClick={() => handleViewDetails(venue)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default Venues;
