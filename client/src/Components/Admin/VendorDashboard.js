import React, { useEffect, useState } from "react";
import axios from "axios";
import "./VendorDash.css";
import Sidebar from "./Sidebar";
import VenueForm from "./VenueForm";
import VenuesList from "./VenuesList";


const defaultCategories = [
  { id: "1", name: "Wedding" },
  { id: "2", name: "Birthday" },
  { id: "3", name: "Conference" },
  { id: "4", name: "Corporate" },
  { id: "5", name: "Cultural" },
  { id: "6", name: "Outdoor" },
];

const VendorDashboard = () => {
  const [venues, setVenues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
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
        axios.get(`https://festpro-yvwm.onrender.com/vendor/venues/${vendorId}`),
        axios.get('https://festpro-yvwm.onrender.com/categories')
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
      setCategoriesLoading(true);
      setCategoriesError(null);
      const res = await axios.get('https://festpro-yvwm.onrender.com/categories');
      const fetchedCategories = Array.isArray(res.data) ? res.data : [];
      setCategories(fetchedCategories.length ? fetchedCategories : defaultCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesError('Unable to load categories right now. Default categories are being used.');
      setCategories(defaultCategories);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`https://festpro-yvwm.onrender.com/api/vendors/${vendorId}/bookings`);
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
          categoriesLoading={categoriesLoading}
          categoriesError={categoriesError}
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