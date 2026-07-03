import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";


const VenueForm = ({
  editingId,
  currentVenue,
  isFormVisible,
  setIsFormVisible,
  categories,
  setEditingId,
  fetchVenues,
  setCurrentVenue
}) => {
  const vendorId = localStorage.getItem("vendorId");
  const [form, setForm] = useState({
    name: "",
    info: "",
    rate: "",
    capacity: "",
    location: "",
    photo: null,
    additionalPhotos: []
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [existingAdditionalPhotos, setExistingAdditionalPhotos] = useState([]);
  const [photosToDelete, setPhotosToDelete] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentVenue) {
      setForm({
        name: currentVenue.name,
        info: currentVenue.info,
        rate: currentVenue.rate,
        capacity: currentVenue.capacity,
        location: currentVenue.location,
        photo: null,
        additionalPhotos: []
      });
      setSelectedCategories(currentVenue.categories || []);

      // Fetch existing additional photos
      if (currentVenue.id) {
        fetchAdditionalPhotos(currentVenue.id);
      }
    }
  }, [currentVenue]);

  const fetchAdditionalPhotos = async (venueId) => {
    try {
      const response = await axios.get(
        `http://https://festpro-yvwm.onrender.com/venue/${venueId}/additional-photos`
      );
      setExistingAdditionalPhotos(response.data);
    } catch (err) {
      console.error("Error fetching additional photos:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "photo" ? (files ? files[0] : null) : value,
    }));
  };

  const handleAdditionalPhotosChange = (e) => {
    const files = Array.from(e.target.files);
    setForm(prev => ({
      ...prev,
      additionalPhotos: files,
    }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    const categoryId = parseInt(value);
    setSelectedCategories((prev) =>
      checked ? [...prev, categoryId] : prev.filter((id) => id !== categoryId)
    );
  };

  const handleDeleteAdditionalPhoto = (photoId) => {
    setPhotosToDelete(prev => [...prev, photoId]);
    setExistingAdditionalPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const showSuccessAlert = (message) => {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      confirmButtonColor: '#4b2e83',
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#dc3545',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("vendor_id", vendorId);
    formData.append("name", form.name);
    formData.append("info", form.info);
    formData.append("rate", form.rate);
    formData.append("capacity", form.capacity);
    formData.append("location", form.location);

    if (form.photo) {
      formData.append("photo", form.photo);
    }

    selectedCategories.forEach(categoryId => {
      formData.append("categories[]", categoryId);
    });

    try {
      let venueId;

      if (editingId) {
        // Update existing venue
        venueId = editingId;
        await axios.put(
          `http://https://festpro-yvwm.onrender.com/vendor/venue/${editingId}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        // Create new venue
        const response = await axios.post(
          "http://https://festpro-yvwm.onrender.com/vendor/venue",
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        venueId = response.data.id;
      }

      // Handle additional photos only if we have a valid venueId
      if (venueId) {
        // Delete photos marked for removal
        if (photosToDelete.length > 0) {
          await Promise.all(
            photosToDelete.map(photoId =>
              axios.delete(`http://https://festpro-yvwm.onrender.com/venue/additional-photo/${photoId}`, {
                data: { vendor_id: vendorId }
              })
            )
          );
        }

        // Upload new additional photos if any
        if (form.additionalPhotos.length > 0) {
          const additionalPhotosData = new FormData();
          form.additionalPhotos.forEach(photo => {
            additionalPhotosData.append("additionalPhotos", photo);
          });
          additionalPhotosData.append("vendor_id", vendorId);

          await axios.post(
            `http://https://festpro-yvwm.onrender.com/venue/${venueId}/additional-photos`,
            additionalPhotosData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
        }
      }

      showSuccessAlert(editingId ? "Venue updated successfully!" : "Venue added successfully!");

      // Reset form
      setForm({
        name: "",
        info: "",
        rate: "",
        capacity: "",
        location: "",
        photo: null,
        additionalPhotos: []
      });
      setSelectedCategories([]);
      setExistingAdditionalPhotos([]);
      setPhotosToDelete([]);
      setEditingId(null);
      setCurrentVenue(null);
      setIsFormVisible(false);
      fetchVenues();
    } catch (err) {
      console.error("Submission Error:", err);
      const errorMessage = err.response?.data?.error ||
        err.message ||
        "Something went wrong while submitting the venue.";
      showErrorAlert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: "",
      info: "",
      rate: "",
      capacity: "",
      location: "",
      photo: null,
      additionalPhotos: []
    });
    setSelectedCategories([]);
    setExistingAdditionalPhotos([]);
    setPhotosToDelete([]);
    setEditingId(null);
    setCurrentVenue(null);
  };

  return (
    <div className="card mb-4 compact-form">
      <div className="card-header">
        <h2 className="card-title">{editingId ? "Edit Venue" : "Add New Venue"}</h2>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          {isFormVisible ? "▲ Hide Form" : "▼ Show Form"}
        </button>
      </div>

      {isFormVisible && (
        <div className="card-body">
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="compact-form">
            <div className="form-row">
              <div className="form-group compact-group">
                <label htmlFor="name" className="form-label">Venue Name *</label>
                <input
                  id="name"
                  name="name"
                  className="form-control compact-input"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group compact-group">
                <label htmlFor="rate" className="form-label">Rate (₹) *</label>
                <input
                  id="rate"
                  type="number"
                  name="rate"
                  className="form-control compact-input"
                  value={form.rate}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group compact-group">
                <label htmlFor="location" className="form-label">Location *</label>
                <input
                  id="location"
                  name="location"
                  className="form-control compact-input"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group compact-group">
                <label htmlFor="capacity" className="form-label">Capacity *</label>
                <input
                  id="capacity"
                  type="number"
                  name="capacity"
                  className="form-control compact-input"
                  value={form.capacity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-group compact-group">
              <label htmlFor="info" className="form-label">Description</label>
              <textarea
                id="info"
                name="info"
                className="form-control compact-textarea"
                value={form.info}
                onChange={handleChange}
                rows="3"
              />
            </div>

            {/* Main photo upload */}
            <div className="form-group compact-group">
              <label htmlFor="photo" className="form-label">
                {editingId ? "Update Main Photo" : "Main Venue Photo *"}
              </label>
              <input
                id="photo"
                type="file"
                name="photo"
                className="form-control file-input compact-file"
                accept="image/*"
                onChange={handleChange}
                required={!editingId}
              />
              {currentVenue?.photo && !form.photo && (
                <div className="current-photo-preview mt-2">
                  <p>Current Main Photo:</p>
                  <img
                    src={`http://https://festpro-yvwm.onrender.com/uploads/${currentVenue.photo}`}
                    alt="Current venue"
                    className="img-thumbnail current-photo"
                  />
                </div>
              )}
              {form.photo && (
                <div className="new-photo-preview mt-2">
                  <p>New Photo Preview:</p>
                  <img
                    src={URL.createObjectURL(form.photo)}
                    alt="New venue preview"
                    className="img-thumbnail new-photo-preview-img"
                  />
                </div>
              )}
            </div>

            {/* Additional photos upload */}
            <div className="form-group compact-group">
              <label htmlFor="additionalPhotos" className="form-label">
                Additional Venue Photos
              </label>
              <input
                id="additionalPhotos"
                type="file"
                name="additionalPhotos"
                className="form-control file-input compact-file"
                accept="image/*"
                onChange={handleAdditionalPhotosChange}
                multiple
              />
              <small className="form-text text-muted">
                You can select multiple images (max 10)
              </small>

              {/* Preview of new additional photos */}
              {form.additionalPhotos.length > 0 && (
                <div className="new-additional-photos mt-3">
                  <p>New Additional Photos to Upload:</p>
                  <div className="photo-preview-grid">
                    {form.additionalPhotos.map((photo, index) => (
                      <div key={index} className="photo-preview-item">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index + 1}`}
                          className="img-thumbnail photo-preview-img"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing additional photos */}
              {existingAdditionalPhotos.length > 0 && (
                <div className="existing-additional-photos mt-3">
                  <p>Current Additional Photos:</p>
                  <div className="photo-preview-grid">
                    {existingAdditionalPhotos.map((photo) => (
                      <div key={photo.id} className="photo-preview-item">
                        <img
                          src={`http://https://festpro-yvwm.onrender.com/uploads/${photo.image_path}`}
                          alt="Venue"
                          className="img-thumbnail photo-preview-img"
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm delete-photo-btn"
                          onClick={() => handleDeleteAdditionalPhoto(photo.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="form-group compact-group">
              <label className="form-label">Categories *</label>
              <div className="categories-grid">
                {categories.map((cat) => (
                  <div key={cat.id} className="category-checkbox">
                    <input
                      type="checkbox"
                      id={`category-${cat.id}`}
                      value={cat.id}
                      checked={selectedCategories.includes(cat.id)}
                      onChange={handleCategoryChange}
                    />
                    <label htmlFor={`category-${cat.id}`}>{cat.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : editingId ? (
                  "Update Venue"
                ) : (
                  "Add Venue"
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm ms-2"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default VenueForm;