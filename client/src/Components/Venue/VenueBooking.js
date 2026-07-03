import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../Dashboard/Header';
import './Venue.css';

const VenueBooking = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isAvailable, setIsAvailable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    event: state?.event?.name || '',
    date: '',
    time: '',
    people: '',
    message: '',
  });
  const [errors, setErrors] = useState({
    people: '',
    date: '',
    general: ''
  });

  useEffect(() => {
    const userId = localStorage.getItem('user');
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`https://festpro-yvwm.onrender.com/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setFormData(prev => ({
            ...prev,
            name: data.name || '',
            email: data.email || '',
            mobile: data.mobile || '',
            address: data.address || '',
          }));
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUser();
  }, [navigate]);

  // Check availability when date changes
  useEffect(() => {
    if (formData.date && state?.event?.id) {
      checkAvailability();
    }
  }, [formData.date, state?.event?.id]);

  const checkAvailability = async () => {
    try {
      setLoading(true);
      setErrors(prev => ({ ...prev, date: '' }));

      const res = await fetch(
        `https://festpro-yvwm.onrender.com/api/venues/${state.event.id}/availability?date=${formData.date}`
      );

      if (res.ok) {
        const data = await res.json();
        setIsAvailable(data.available);
        if (!data.available) {
          setErrors(prev => ({ ...prev, date: 'This date is not available' }));
        }
      } else {
        setIsAvailable(null);
        setErrors(prev => ({ ...prev, date: 'Error checking availability' }));
      }
    } catch (err) {
      console.error('Error checking availability:', err);
      setIsAvailable(null);
      setErrors(prev => ({ ...prev, date: 'Network error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special validation for people field
    if (name === 'people') {
      const peopleNum = parseInt(value) || 0;
      const capacity = state?.event?.capacity || Infinity;

      if (peopleNum > capacity) {
        setErrors(prev => ({
          ...prev,
          people: `Exceeds venue capacity (${capacity})`
        }));
      } else if (peopleNum < 1) {
        setErrors(prev => ({
          ...prev,
          people: 'Must be at least 1 person'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          people: ''
        }));
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Check date availability
    if (!formData.date) {
      newErrors.date = 'Date is required';
      isValid = false;
    } else if (isAvailable === false) {
      newErrors.date = 'Selected date is not available';
      isValid = false;
    }

    // Check people count
    const peopleNum = parseInt(formData.people) || 0;
    const capacity = state?.event?.capacity || Infinity;
    if (peopleNum < 1) {
      newErrors.people = 'Must be at least 1 person';
      isValid = false;
    } else if (peopleNum > capacity) {
      newErrors.people = `Exceeds venue capacity (${capacity})`;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // In VenueBooking.js
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const bookingData = {
        user_id: localStorage.getItem('user'),
        venue_id: state.event.id,
        booking_date: formData.date,
        booking_time: formData.time,
        people: formData.people,
        message: formData.message,
      };

      const response = await fetch('https://festpro-yvwm.onrender.com/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        const data = await response.json();
        navigate('/payment', {
          state: {
            booking: {
              ...formData,
              amount: state.event.rate // Pass the venue rate as amount
            },
            bookingId: data.bookingId,
            event: state.event
          }
        });
      } else {
        const errorData = await response.json();
        setErrors(prev => ({
          ...prev,
          general: errorData.error || 'Booking failed. Please try again.'
        }));
      }
    } catch (err) {
      console.error('Booking error:', err);
      setErrors(prev => ({
        ...prev,
        general: 'Failed to create booking. Please try again.'
      }));
    }
  };
  return (
    <div className="venue-booking-page">
      <Header />
      <div className="booking-form-container">
        <h2>Book Your Spot for: <strong>{state?.event?.name || 'Event'}</strong></h2>

        {errors.general && (
          <div className="error-message general-error">{errors.general}</div>
        )}

        <form className="booking-form" onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
            />
          </label>

          <label>
            Email:
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              required
              type="email"
            />
          </label>

          <label>
            Mobile:
            <input
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Mobile Number"
              required
              pattern="[0-9]{10}"
              title="10 digit mobile number"
            />
          </label>

          <label>
            Address:
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              required
            />
          </label>

          <label>
            Event Date:
            <input
              name="date"
              value={formData.date}
              onChange={handleChange}
              type="date"
              min={new Date().toISOString().split('T')[0]}
              required
            />
            {formData.date && (
              <div className="availability-status">
                {loading ? (
                  <span>Checking availability...</span>
                ) : isAvailable === true ? (
                  <span className="available">Available!</span>
                ) : (
                  <span className="not-available">{errors.date}</span>
                )}
              </div>
            )}
          </label>

          <label>
            Time:
            <input
              name="time"
              value={formData.time}
              onChange={handleChange}
              type="time"
              required
            />
          </label>

          <label>
            No. of People:
            <input
              name="people"
              value={formData.people}
              onChange={handleChange}
              type="number"
              min="1"
              max={state?.event?.capacity || ''}
              placeholder="No. of People"
              required
            />
            {errors.people && (
              <div className="error-message">{errors.people}</div>
            )}
            {state?.event?.capacity && (
              <div className="capacity-info">
                Venue capacity: {state.event.capacity} people
              </div>
            )}
          </label>

          <label>
            Message:
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Any message (optional)"
            />
          </label>

          <button
            type="submit"
            className="modern-book-button"
            disabled={loading || !isAvailable}
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VenueBooking;