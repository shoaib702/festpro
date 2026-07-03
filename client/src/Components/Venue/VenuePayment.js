import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../Dashboard/Header';
import axios from 'axios';
import './Payment.css';

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { booking, bookingId, event } = state || {};

  const [paymentDetails, setPaymentDetails] = useState({
    name: '',
    method: 'card',
    cardNumber: '',
    expiry: '',
    cvv: '',
    upiId: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('user');
    if (!userId) {
      navigate('/login');
      return;
    }
  }, [navigate]); // ✅ fixed missing bracket here

  useEffect(() => {
    if (!booking || !bookingId || !event) {
      navigate('/');
    }
  }, [booking, bookingId, event, navigate]);

  // const venueRate = booking?.amount || event?.rate || 0;
  // const grandTotal = venueRate;
  const venueRate = Number(booking?.amount || event?.rate || 0);
  const grandTotal = Number(venueRate);
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }
    if (name === 'expiry') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    }

    setPaymentDetails({ ...paymentDetails, [name]: value });
  };

  const validatePayment = () => {
    const { name, method, cardNumber, expiry, cvv, upiId } = paymentDetails;

    if (!name) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter your name as it appears on your payment method.',
      });
      return false;
    }

    if (method === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Card Number',
          text: 'Please enter a valid 16-digit card number.',
        });
        return false;
      }
      if (!expiry || expiry.length !== 5) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Expiry Date',
          text: 'Please enter a valid expiry date (MM/YY).',
        });
        return false;
      }
      if (!cvv || cvv.length !== 3) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid CVV',
          text: 'Please enter a valid 3-digit CVV.',
        });
        return false;
      }
    }

    if (method === 'upi' && !upiId) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing UPI ID',
        text: 'Please enter your UPI ID to proceed.',
      });
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;

    setIsProcessing(true);

    try {
      const userId = localStorage.getItem('user'); // ✅ use localStorage properly

      if (!userId) {
        throw new Error('User not authenticated.');
      }

      console.log('Sending payment request:', {
        bookingId,
        amount: grandTotal,
        paymentDetails,
        userId,
      });

      const res = await axios.post('https://festpro-yvwm.onrender.com/api/payments', {
        bookingId,
        amount: grandTotal,
        paymentDetails,
        userId,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const paymentDate = new Date();
      const formattedPaymentDate = paymentDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });


      console.log('Payment response:', res.data);

      Swal.fire({
        title: 'Payment Successful!',
        html: `
          <div class="payment-success">
            <div class="success-icon">✓</div>
            <h3>Booking Confirmed</h3>
             <p><strong>Payment Date:</strong> ${formattedPaymentDate}</p>
            <div class="receipt-details">
              <p><strong>Event:</strong> ${event.name}</p>
              <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${booking.time}</p>
              <p><strong>Guests:</strong> ${booking.people}</p>
              <hr />
              <div class="price-details">
                <p><strong>Venue Rate:</strong> ₹${venueRate.toFixed(2)}</p>
                <p><strong>Total:</strong> ₹${grandTotal.toFixed(2)}</p>           
              </div>
              <p class="transaction-id">Transaction ID: ${res.data.transactionId}</p>
            </div>
          </div>
        `,
        confirmButtonText: 'View Bookings',
        customClass: {
          popup: 'success-popup'
        }
      }).then(() => {
        navigate('/mybooking');
      });

    } catch (err) {
      console.error('Full payment error:', err);
      console.error('Response data:', err.response?.data);

      let errorMessage = 'Payment could not be processed. Please try again.';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        if (err.response.data.details) {
          errorMessage += ` (Details: ${JSON.stringify(err.response.data.details)})`;
        }
      }

      Swal.fire({
        title: 'Payment Failed',
        html: `
          <div>
            <p>${errorMessage}</p>
            ${err.response?.data?.sqlError ?
            `<p class="error-detail">Technical details: ${err.response.data.sqlError}</p>` : ''}
          </div>
        `,
        icon: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-page">
      <Header />
      <div className="payment-container">
        <div className="booking-summary">
          <h2>Booking Summary</h2>

          <div className="event-details">
            <h3>{event?.name}</h3>
            <div className="detail-item">
              <span className="detail-label">Booking ID</span>
              <span className="detail-value">{bookingId}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date</span>
              <span className="detail-value">{new Date(booking?.date).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Time</span>
              <span className="detail-value">{booking?.time}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Guests</span>
              <span className="detail-value">{booking?.people} people</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Venue Rate</span>
              <span className="detail-value">₹{venueRate.toFixed(2)}</span>
            </div>
          </div>

          <div className="price-breakdown">
            <div className="price-item total">
              <span>Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="payment-details">
          <h2>Payment Information</h2>

          <div className="payment-form">
            <div className="form-group">
              <label>Name on Card/UPI</label>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={paymentDetails.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <div className="method-options">
                <button
                  type="button"
                  className={`method-option ${paymentDetails.method === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentDetails({ ...paymentDetails, method: 'card' })}
                >
                  Credit/Debit Card
                </button>
                <button
                  type="button"
                  className={`method-option ${paymentDetails.method === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentDetails({ ...paymentDetails, method: 'upi' })}
                >
                  UPI Payment
                </button>
              </div>
            </div>

            {paymentDetails.method === 'card' && (
              <>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentDetails.cardNumber}
                    onChange={handleChange}
                    maxLength="19"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      value={paymentDetails.expiry}
                      onChange={handleChange}
                      maxLength="5"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      placeholder="123"
                      value={paymentDetails.cvv}
                      onChange={handleChange}
                      maxLength="3"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {paymentDetails.method === 'upi' && (
              <div className="form-group">
                <label>UPI ID</label>
                <input
                  type="text"
                  name="upiId"
                  placeholder="yourname@upi"
                  value={paymentDetails.upiId}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <button
              className="pay-button"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Pay ₹${grandTotal.toFixed(2)}`}
            </button>

            <div className="security-note">
              <span className="lock-icon">🔒</span>
              <span>Your payment is secure and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
