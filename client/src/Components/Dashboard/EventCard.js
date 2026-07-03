import React from 'react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event, isTrending = false }) => {
  const navigate = useNavigate();

  const imageUrl = isTrending
    ? event.image
    : `http://https://festpro-yvwm.onrender.com/uploads/${event.photo}`;

  const handleViewDetails = () => {
    navigate(`/venue/${event.id}`, { state: { event } });
  };

  return (
    <div className="event-card">
      <div className="event-image-container">
        <img src={imageUrl} alt={event.title || event.name} className="event-image" />
        <div className="event-overlay"></div>
        <div className="event-price">{isTrending ? event.price : `Rs ${event.rate}`}</div>
      </div>
      <div className="event-details">
        <h3 className="event-title">{event.title || event.name}</h3>
        <div className="event-date-time">
          <span>{event.date}</span>
          <span>{event.time}</span>
        </div>
        <div className="event-venue">{event.venue || event.location}</div>
        <button className="view-details-button" onClick={handleViewDetails}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default EventCard;
