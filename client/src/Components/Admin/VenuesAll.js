import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "./VendorDash.css";

const VenuesAll = () => {
  const [venues, setVenues] = useState([]);
  const [categories, setCategories] = useState([]);
  const vendorId = localStorage.getItem("vendorId");

  useEffect(() => {
    if (vendorId) {
      fetchVenues();
    }
  }, [vendorId]);

  const fetchVenues = async () => {
    try {
      const [venuesRes, categoriesRes] = await Promise.all([
        axios.get(`http://localhost:5000/vendor/venues/${vendorId}`),
        axios.get("http://localhost:5000/categories"),
      ]);

      const categoryMap = {};
      categoriesRes.data.forEach((cat) => {
        categoryMap[cat.id] = cat.name;
      });

      const venuesWithCategoryNames = venuesRes.data.map((venue) => {
        const categoryNames = venue.categories
          ? venue.categories.map((id) => ({
              id: id,
              name: categoryMap[id] || "Unknown",
            }))
          : [];

        return {
          ...venue,
          categoryNames,
        };
      });

      setVenues(venuesWithCategoryNames);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error("Error fetching venues:", err);
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
          <h1 className="page-title">My Venues</h1>
          <div className="user-menu">
            <div className="user-avatar">V</div>
            <button className="btn btn-sm btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Your Venues ({venues.length})</h2>
          </div>
          <div className="card-body">
            {venues.length === 0 ? (
              <p className="text-muted">No venues found.</p>
            ) : (
              <div className="venues-grid">
                {venues.map((venue) => (
                  <div key={venue.id} className="venue-card">
                    {venue.photo && (
                      <div className="venue-image">
                        <img
                          src={`http://localhost:5000/uploads/${venue.photo}`}
                          alt={venue.name}
                        />
                      </div>
                    )}
                    <div className="venue-body">
                      <h3 className="venue-title">{venue.name}</h3>
                      <p className="venue-price">₹{venue.rate}</p>
                      <p className="venue-location">{venue.location}</p>
                      <div className="venue-categories">
                        {venue.categoryNames?.map((cat) => (
                          <span key={cat.id} className="category-badge">
                            {cat.name}
                          </span>
                        ))}
                      </div>
                      <p className="venue-capacity">
                        Capacity: {venue.capacity} people
                      </p>
                      <p className="venue-description">{venue.info}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VenuesAll;
