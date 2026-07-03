import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import './Report.css'; // You'll need to create this CSS file

const Report = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const vendorId = localStorage.getItem('vendorId');

  useEffect(() => {
    if (vendorId) {
      fetchBookings();
    }
  }, [vendorId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://https://festpro-yvwm.onrender.com/api/vendors/${vendorId}/bookings-details`
      );
      setBookings(response.data.bookings);
      setFilteredBookings(response.data.bookings);
      calculateTotal(response.data.bookings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  const calculateTotal = (bookings) => {
    const total = bookings.reduce((sum, booking) => {
      return sum + (booking.payment_status === 'completed' ? Number(booking.venue_rate) : 0);
    }, 0);
    setTotalAmount(total);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterBookings(term, dateRange.from, dateRange.to);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
    filterBookings(searchTerm, name === 'from' ? value : dateRange.from, name === 'to' ? value : dateRange.to);
  };

  const filterBookings = (term = '', from = '', to = '') => {
    let filtered = [...bookings];

    // Apply search term filter
    if (term) {
      filtered = filtered.filter(booking =>
        booking.venue_name.toLowerCase().includes(term) ||
        booking.user_name.toLowerCase().includes(term)
      );
    }

    // Apply date range filter
    if (from) {
      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0); // Set to start of day
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.booking_date);
        bookingDate.setHours(0, 0, 0, 0); // Set to start of day
        return bookingDate >= fromDate;
      });
    }

    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999); // Set to end of day
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.booking_date);
        bookingDate.setHours(0, 0, 0, 0); // Set to start of day
        return bookingDate <= toDate;
      });
    }

    setFilteredBookings(filtered);
    calculateTotal(filtered);
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount).replace('₹', 'Rs');
  };

  const handleLogout = () => {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorId");
    window.location.href = "/vendorlogin";
  };

  return (
    <div className="vendor-dashboard">
      <Sidebar />
      <main className="main-content">
        <div className="report-container">

          <header className="header">
            <h1 className="page-title">Report</h1>
            <div className="user-menu">
              <div className="user-avatar">V</div>
              <button className="btn btn-sm btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>
          {/* Filters Section */}
          <div className="filters-section">
            <div className="search-filter">
              <input
                type="text"
                placeholder="Search by venue or customer name..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>

            <div className="date-filters">
              <div className="date-filter">
                <label htmlFor="from">From:</label>
                <input
                  type="date"
                  id="from"
                  name="from"
                  value={dateRange.from}
                  onChange={handleDateChange}
                  className="date-input"
                />
              </div>

              <div className="date-filter">
                <label htmlFor="to">To:</label>
                <input
                  type="date"
                  id="to"
                  name="to"
                  value={dateRange.to}
                  onChange={handleDateChange}
                  className="date-input"
                />
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Total Bookings</h3>
              <p>{filteredBookings.length}</p>
            </div>
            <div className="summary-card">
              <h3>Completed Payments</h3>
              <p>{filteredBookings.filter(b => b.payment_status === 'completed').length}</p>
            </div>
            <div className="summary-card">
              <h3>Pending Payments</h3>
              <p>{filteredBookings.filter(b => b.payment_status !== 'completed').length}</p>
            </div>
            <div className="summary-card highlight">
              <h3>Total Revenue</h3>
              <p>{formatCurrency(totalAmount)}</p>
            </div>
          </div>

          {/* Bookings Table */}
          {loading ? (
            <div className="loading">Loading bookings...</div>
          ) : (
            <div className="bookings-table">
              <table>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Venue Name</th>
                    <th>Customer Name</th>
                    <th>Booking Date</th>
                    <th>Payment Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map(booking => (
                      <tr key={booking.id}>
                        <td>{booking.id}</td>
                        <td>{booking.venue_name}</td>
                        <td>{booking.user_name}</td>
                        <td>{formatDate(booking.booking_date)}</td>
                        <td>
                          <span className={`status-badge ${booking.payment_status === 'completed' ? 'completed' : 'pending'}`}>
                            {booking.payment_status === 'completed' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td>{formatCurrency(booking.venue_rate)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">No bookings found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Report;