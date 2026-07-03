import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Venue.css';
import Header from '../Dashboard/Header';

const VenueDetails = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [venueDetails, setVenueDetails] = useState(null);
  const [vendorName, setVendorName] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [additionalPhotos, setAdditionalPhotos] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // State for selected image

  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        setLoading(true);

        // Fetch venue details
        const venueResponse = await axios.get(`http://https://festpro-yvwm.onrender.com/api/venues/${id}`);
        const venueData = venueResponse.data;
        setVenueDetails(venueData);

        // Fetch additional photos
        const photosResponse = await axios.get(`http://https://festpro-yvwm.onrender.com/venue/${id}/additional-photos`);
        setAdditionalPhotos(photosResponse.data);

        // Fetch vendor name if vendor_id exists
        if (venueData.vendor_id) {
          const vendorResponse = await axios.get(`http://https://festpro-yvwm.onrender.com/api/vendors/${venueData.vendor_id}`);
          setVendorName(vendorResponse.data.name);
        }

        // Fetch all categories
        const categoriesResponse = await axios.get('http://https://festpro-yvwm.onrender.com/categories');
        setCategories(categoriesResponse.data);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (state?.event) {
      // Use state if available
      setVenueDetails(state.event);
      if (state.event.vendor_id) {
        axios.get(`http://https://festpro-yvwm.onrender.com/api/vendors/${state.event.vendor_id}`)
          .then(res => setVendorName(res.data.name))
          .catch(err => console.error("Error fetching vendor:", err));
      }
      axios.get('http://https://festpro-yvwm.onrender.com/categories')
        .then(res => setCategories(res.data))
        .catch(err => console.error("Error fetching categories:", err));

      // Fetch additional photos even when using state
      axios.get(`http://https://festpro-yvwm.onrender.com/venue/${id}/additional-photos`)
        .then(res => setAdditionalPhotos(res.data))
        .catch(err => console.error("Error fetching additional photos:", err));

      setLoading(false);
    } else {
      fetchVenueData();
    }
  }, [id, state]);

  const getVenueCategories = () => {
    if (!venueDetails?.categories || !categories.length) return 'N/A';

    const categoryIds = typeof venueDetails.categories === 'string'
      ? venueDetails.categories.split(',').map(Number)
      : venueDetails.categories;

    return categories
      .filter(cat => categoryIds.includes(cat.id))
      .map(cat => cat.name)
      .join(', ');
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const event = venueDetails || state?.event || {
    name: 'Venue Not Available',
    location: 'Location Not Specified',
    rate: '0',
    info: 'No description available for this venue.',
    photo: 'default-venue.jpg',
    capacity: 'N/A',
    category: 'N/A'
  };

  const mainImageUrl = event.image || `http://https://festpro-yvwm.onrender.com/uploads/${event.photo}`;
  const price = `Rs ${event.rate || '0'}`;
  const title = event.title || event.name;
  const location = event.venue || event.location;
  const description = event.info || 'No description available.';
  const venueCategories = getVenueCategories();

  const handleBookNow = () => {
    navigate('/book-venue', {
      state: {
        event: {
          ...event,
          organizer: vendorName,
          capacity: event.capacity,
          rate: event.rate,
          additionalPhotos: additionalPhotos
        }
      }
    });
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="modern-venue-page">
      <Header />
      <div className="venue-detail-container">
        <div className="venue-detail-grid">

          {/* Image Section */}
          <div className="venue-image-section">
            <div className="venue-image-container">
              <img
                src={mainImageUrl}
                alt={title}
                className="venue-detail-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/600x400?text=Venue+Image';
                }}
                onClick={() => handleImageClick({ image_path: event.photo })}
              />
              <div className="venue-price-badge">{price}</div>
            </div>

            {/* Gallery Section */}
            {additionalPhotos.length > 0 && (
              <div className="venue-gallery-section">
                <h3 className="gallery-title">Gallery</h3>
                <div className="venue-gallery-grid">
                  {additionalPhotos.map((photo, index) => (
                    <div
                      key={index}
                      className="gallery-item"
                      onClick={() => handleImageClick(photo)}
                    >
                      <img
                        src={`http://https://festpro-yvwm.onrender.com/uploads/${photo.image_path}`}
                        alt={`Venue photo ${index + 1}`}
                        className="gallery-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=Photo+Not+Available';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>


          {/* Details Section */}
          <div className="venue-details-section">
            <div className="venue-header">
              <h1 className="venue-title">{title}</h1>
              <div className="venue-meta">
                <div className="meta-item">
                  <span className="meta-icon">📍</span>
                  <span>{location}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">👥</span>
                  <span>Capacity: {event.capacity}</span>
                </div>
              </div>
            </div>

            <div className="venue-description">
              <h3>About the Venue</h3>
              <p>{description}</p>
            </div>

            <div className="venue-actions">
              <button className="modern-book-button" onClick={handleBookNow}>
                Book Now
              </button>
              <button className="modern-back-button" onClick={() => navigate(-1)}>
                Back to Venues
              </button>
            </div>

            {/* Additional Info Section */}
            <div className="venue-additional-info">
              <h3>Venue Details</h3>
              <div className="info-grid">
                <div className="modern-info-card">
                  <div className="info-icon">💰</div>
                  <div>
                    <div className="info-label">Price</div>
                    <div className="info-value">{price}</div>
                  </div>
                </div>
                <div className="modern-info-card">
                  <div className="info-icon">👥</div>
                  <div>
                    <div className="info-label">Capacity</div>
                    <div className="info-value">{event.capacity || 'N/A'}</div>
                  </div>
                </div>
                <div className="modern-info-card">
                  <div className="info-icon">🎵</div>
                  <div>
                    <div className="info-label">Categories</div>
                    <div className="info-value">{venueCategories}</div>
                  </div>
                </div>
                <div className="modern-info-card">
                  <div className="info-icon">🏢</div>
                  <div>
                    <div className="info-label">Vendor</div>
                    <div className="info-value">{vendorName || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={closeModal}>
          <div className="modal-contents" onClick={e => e.stopPropagation()}>
            <span className="close-button" onClick={closeModal}>&times;</span>
            <img
              src={`http://https://festpro-yvwm.onrender.com/uploads/${selectedImage.image_path}`}
              alt="Selected venue"
              className="modal-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueDetails;