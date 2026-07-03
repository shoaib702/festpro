import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import BookingsTable from "./BookingsTable";
import "./VendorDash.css";

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const vendorId = localStorage.getItem("vendorId");

  useEffect(() => {
    if (vendorId) {
      fetchBookings();
    }
  }, [vendorId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://festpro-yvwm.onrender.com/api/vendors/${vendorId}/bookings-details`
      );
      
      // Format booking data with payment info
      const formattedBookings = res.data.bookings.map(booking => ({
        ...booking,
        payment_status: booking.payment_status || 'pending',
        payment_method: booking.payment_method || 'Not paid'
      }));
      
      setBookings(formattedBookings);
      setTotalIncome(Number(res.data.totalIncome) || 0);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setLoading(false);
    }
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
        <header className="header">
          <h1 className="page-title">Customer</h1>
          <div className="user-menu">
            <div className="user-avatar">V</div>
            <button className="btn btn-sm btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className="summary-card">
          <p>Total Income: Rs{totalIncome.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          })}</p>
          <h3>
            {bookings.length} total bookings | 
            Paid: {bookings.filter(b => b.payment_status === 'completed').length} | 
            Pending: {bookings.filter(b => b.payment_status !== 'completed').length}
          </h3>
        </div>

        {loading ? (
          <p>Loading bookings...</p>
        ) : (
          <BookingsTable bookings={bookings} refreshBookings={fetchBookings} />
        )}
      </main>
    </div>
  );
};

export default AllBookings;