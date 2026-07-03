import React from "react";
import axios from "axios";
import Swal from "sweetalert2";

const VenuesList = ({ venues, handleEdit, fetchVenues }) => {
  const vendorId = localStorage.getItem("vendorId");

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4b2e83',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://festpro-yvwm.onrender.com/vendor/venue/${id}`, {
            data: { vendor_id: vendorId },
          });
          fetchVenues();
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: "Venue has been deleted.",
            confirmButtonColor: '#4b2e83',
          });
        } catch (err) {
          console.error("Delete Error:", err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: "Failed to delete venue.",
            confirmButtonColor: '#dc3545',
          });
        }
      }
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Your Venues ({venues.length})</h2>
      </div>
      <div className="card-body">
        {venues.length === 0 ? (
          <p className="text-muted">No venues added yet. Click "Show Form" to add a new venue.</p>
        ) : (
          <div className="venues-grid">
            {venues.map((venue) => (
              <div key={venue.id} className="venue-card">
                {venue.photo && (
                  <div className="venue-image">
                    <img
                      src={`https://festpro-yvwm.onrender.com/uploads/${venue.photo}`}
                      alt={venue.name}
                    />
                  </div>
                )}
                <div className="venue-body">
                  <h3 className="venue-title">{venue.name}</h3>
                  <p className="venue-price">₹{venue.rate}</p>
                  <p className="venue-location">{venue.location}</p>
                  <div className="venue-categories">
                    {venue.categoryNames?.map(cat => (
                      <span key={cat.id} className="category-badge">{cat.name}</span>
                    ))}
                  </div>
                  <p className="venue-capacity">Capacity: {venue.capacity} people</p>
                  <p className="venue-description">{venue.info}</p>
                  <div className="venue-actions">
                    <button
                      onClick={() => handleEdit(venue)}
                      className="btn btn-sm btn-primary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(venue.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VenuesList;