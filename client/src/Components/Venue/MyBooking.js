import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Bookings.css';
import Header from '../Dashboard/Header';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [sortedBookings, setSortedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('latest'); // 'latest' or 'oldest'
  const userId = localStorage.getItem('user');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      console.error("User ID not found in localStorage");
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/bookings/user/${userId}`);
        setBookings(res.data);
        
        if (res.data.length === 0) {
          Swal.fire({
            title: 'No Bookings Found',
            text: 'You have no bookings yet. Would you like to explore venues?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Explore Venues',
            cancelButtonText: 'Stay Here',
          }).then((result) => {
            if (result.isConfirmed) {
              navigate('/explore');
            }
          });
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load bookings. Please try again later.',
          icon: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId, navigate]);

  useEffect(() => {
    // Sort bookings by booking creation date
    const sorted = [...bookings].sort((a, b) => {
      const dateA = new Date(a.created_at || a.booking_date); // Use created_at if available, fallback to booking_date
      const dateB = new Date(b.created_at || b.booking_date);
      
      return sortOrder === 'latest' ? 
        dateB - dateA : // Newest bookings first
        dateA - dateB;  // Oldest bookings first
    });
    setSortedBookings(sorted);
  }, [bookings, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'latest' ? 'oldest' : 'latest');
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="my-bookings-container">
        <div className="bookings-header">
          <h2 className="my-bookings-title">My Bookings</h2>
          {bookings.length > 0 && (
            <button 
              onClick={toggleSortOrder}
              className="sort-button"
            >
              {sortOrder === 'latest' ? 'Show Oldest First' : 'Show Newest First'}
            </button>
          )}
        </div>
        
        {sortedBookings.length > 0 ? (
          sortedBookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              {booking.venue_photo && (
                <img
                  src={`http://localhost:5000/uploads/${booking.venue_photo}`}
                  alt="Venue"
                  className="booking-image"
                />
              )}
              <div className="booking-details">
                <p><strong>Venue:</strong> {booking.venue_name}</p>
                <p><strong>Event Date:</strong> {new Date(booking.booking_date).toLocaleDateString()}</p>
               
                <p><strong>Booked On:</strong> {formatDate(booking.created_at || booking.booking_date)}</p>
                <p><strong>Time:</strong> {booking.booking_time}</p>
                <p><strong>Location:</strong> {booking.venue_location}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${booking.status || 'confirmed'}`}>
                    {booking.status || 'confirmed'}
                  </span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-bookings">
            <img src="/images/no-bookings.svg" alt="No bookings" />
            <h3>You don't have any bookings yet</h3>
            <button 
              className="explore-btn"
              onClick={() => navigate('/explore')}
            >
              Explore Venues
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MyBookings;