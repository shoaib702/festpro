import React, { useState } from "react";
import "./BookingsTable.css";

const BookingsTable = ({ bookings }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);

  const openModal = (booking) => {
    setSelectedBooking(booking);
  };

  const closeModal = () => {
    setSelectedBooking(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount).replace('₹', 'Rs');
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const formatDateTime = (dateString) => {
    const options = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('en-IN', options);
  };

  return (
    <div className="bookings-container">
      {/* Booking Cards Flex Container */}
      <div className="cards-flex-container">
        {bookings.length === 0 ? (
          <div className="no-bookings">
            No bookings found
          </div>
        ) : (
          bookings.map((booking) => (
            <div 
              key={booking.id} 
              className="booking-cards"
            >
              <div className="card-header">
                <h3>{booking.venue_name}</h3>
                <span className={`status-badge ${booking.payment_status === 'completed' ? 'completed' : ''}`}>
                  {booking.payment_status === 'completed' ? 'Paid' : 'Pending'}
                </span>
              </div>

              <div className="card-details">
                <div className="detail-row">
                  <svg className="detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>{formatDate(booking.booking_date)}</span>
                </div>
                
                <div className="detail-row">
                  <svg className="detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span>{booking.user_name}</span>
                </div>
                
                <div className="detail-row">
                  <svg className="detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>{formatCurrency(booking.venue_rate)}</span>
                </div>
              </div>

              <button
                onClick={() => openModal(booking)}
                className="view-button small-button"
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button 
                onClick={closeModal}
                className="close-button"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Event Details Section */}
              <div className="section">
                <div className="section-header">
                  <svg className="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="#8e44ad">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z"></path>
                    <path d="M12 13c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"></path>
                  </svg>
                  <h3 className="section-title">Event Details</h3>
                </div>
                
                <div className="detail-flex-container">
                  <div className="detail-flex-item">
                    <p className="detail-label">Venue</p>
                    <p className="detail-value">{selectedBooking.venue_name}</p>
                  </div>
                  <div className="detail-flex-item">
                    <p className="detail-label">Date</p>
                    <p className="detail-value">{formatDate(selectedBooking.booking_date)}</p>
                  </div>
                  <div className="detail-flex-item">
                    <p className="detail-label">Time</p>
                    <p className="detail-value">{selectedBooking.booking_time || 'Not specified'}</p>
                  </div>
                  <div className="detail-flex-item">
                    <p className="detail-label">People</p>
                    <p className="detail-value">{selectedBooking.people || 'Not specified'}</p>
                  </div>
                  <div className="detail-flex-item">
                    <p className="detail-label">Status</p>
                    <p className={`detail-value status-tag ${
                      selectedBooking.status === 'confirmed' ? 'status-confirmed' : 
                      selectedBooking.status === 'cancelled' ? 'status-cancelled' : 'status-pending'
                    }`}>
                      {selectedBooking.status || 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Details Section */}
              <div className="section">
                <div className="section-header">
                  <svg className="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="#8e44ad">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"></path>
                  </svg>
                  <h3 className="section-title">Payment Information</h3>
                </div>
                
                <div className="detail-flex-container">
                  <div className="detail-flex-item">
                    <p className="detail-label">Amount</p>
                    <p className="detail-value">{formatCurrency(selectedBooking.venue_rate)}</p>
                  </div>
                  <div className="detail-flex-item">
                    <p className="detail-label">Payment Status</p>
                    <p className={`detail-value status-tag ${
                      selectedBooking.payment_status === 'completed' ? 'status-confirmed' : 'status-pending'
                    }`}>
                      {selectedBooking.payment_status === 'completed' ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                  <div className="detail-flex-item">
                    <p className="detail-label">Payment Method</p>
                    <p className="detail-value">
                      {selectedBooking.payment_method || 'Not specified'}
                    </p>
                  </div>
                  {selectedBooking.transaction_id && (
                    <div className="detail-flex-item">
                      <p className="detail-label">Transaction ID</p>
                      <p className="detail-value">
                        {selectedBooking.transaction_id}
                      </p>
                    </div>
                  )}
                  {selectedBooking.payment_date && (
                    <div className="detail-flex-item">
                      <p className="detail-label">Payment Date</p>
                      <p className="detail-value">
                        {formatDateTime(selectedBooking.payment_date)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Details Section */}
              <div className="section">
                <div className="section-header">
                  <svg className="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="#8e44ad">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                  </svg>
                  <h3 className="section-title">Customer Information</h3>
                </div>
                
                <div className="detail-flex-container">
                  <div className="detail-flex-item">
                    <p className="detail-label">Name</p>
                    <p className="detail-value">{selectedBooking.user_name}</p>
                  </div>
                  <div className="detail-flex-item">
                    <p className="detail-label">Email</p>
                    <p className="detail-value">{selectedBooking.user_email}</p>
                  </div>
                  <div className="detail-flex-item">
                    <p className="detail-label">Phone</p>
                    <p className="detail-value">
                      {selectedBooking.user_phone || 'Not provided'}
                    </p>
                  </div>
                  <div className="detail-flex-item">
                    <p className="detail-label">Address</p>
                    <p className="detail-value">
                      {selectedBooking.user_address || 'Not provided'}
                    </p>
                  </div>
                  <div className="detail-flex-item full-width">
                    <p className="detail-label">Message</p>
                    <p className="message-box">
                      {selectedBooking.message || 'No message provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={closeModal}
                className="modal-close-button small-button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsTable;