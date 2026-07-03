import React, { useEffect, useState } from "react";
import axios from "axios";
import "./VendorDash.css";
import Sidebar from "./Sidebar";
import VenueForm from "./VenueForm";
import VenuesList from "./VenuesList";


const VendorDashboard = () => {
  const [venues, setVenues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentVenue, setCurrentVenue] = useState(null);

  const vendorId = localStorage.getItem("vendorId");

  useEffect(() => {
    if (vendorId) {
      fetchVenues();
      fetchCategories();
      fetchBookings();
    }
  }, [vendorId]);

  const fetchVenues = async () => {
    try {
      const [venuesRes, categoriesRes] = await Promise.all([
        axios.get(`http://localhost:5000/vendor/venues/${vendorId}`),
        axios.get('http://localhost:5000/categories')
      ]);
      
      const categoryMap = {};
      categoriesRes.data.forEach(cat => {
        categoryMap[cat.id] = cat.name;
      });

      const venuesWithCategoryNames = venuesRes.data.map(venue => {
        const categoryNames = venue.categories
          ? venue.categories.map(id => ({
              id: id,
              name: categoryMap[id] || 'Unknown'
            }))
          : [];
        
        return {
          ...venue,
          categoryNames
        };
      });

      setVenues(venuesWithCategoryNames);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/vendors/${vendorId}/bookings`);
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const handleEdit = (venue) => {
    setEditingId(venue.id);
    setCurrentVenue(venue);
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <h1 className="page-title">Venue Management</h1>
          <div className="user-menu">
            <div className="user-avatar">V</div>
            <button className="btn btn-sm btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <VenueForm 
          editingId={editingId}
          currentVenue={currentVenue}
          isFormVisible={isFormVisible}
          setIsFormVisible={setIsFormVisible}
          categories={categories}
          setEditingId={setEditingId}
          fetchVenues={fetchVenues}
          setCurrentVenue={setCurrentVenue}
        />

        <VenuesList 
          venues={venues}
          handleEdit={handleEdit}
          fetchVenues={fetchVenues}
        />


      </main>
    </div>
  );
};

export default VendorDashboard;