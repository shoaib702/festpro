import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";
import Header from "./Header";

const MyProfile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    address: "",
    mobile: ""
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('user');
      const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      setError("Failed to fetch user data. Please try again.");
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('user');
      await axios.put(`http://localhost:5000/api/users/${userId}`, user);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      fetchUserData();
    } catch (error) {
      setError("Failed to update profile. Please try again.");
      console.error("Error updating user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    try {
      setIsLoading(true);
      const userId = localStorage.getItem('user');
      await axios.put(`http://localhost:5000/api/users/${userId}/password`, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess("Password changed successfully!");
      setIsChangingPassword(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      setError(error.response?.data?.error || "Failed to change password");
      console.error("Error changing password:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setError(null);
    setSuccess(null);
  };

  if (isLoading && !isEditing && !isChangingPassword) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
    <Header/>
    <div className="profile-container">
      
      <div className="profile-card">
        <h2 className="profile-title">My Profile</h2>

        {isChangingPassword ? (
          <form className="profile-form" onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="oldPassword">Current Password</label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength="6"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength="6"
              />
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsChangingPassword(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-btn"
                disabled={isLoading}
              >
                {isLoading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        ) : isEditing ? (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={user.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={user.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={user.address}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="mobile">Mobile</label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={user.mobile}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-btn"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{user.name || "Not provided"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user.email || "Not provided"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{user.address || "Not provided"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Mobile:</span>
              <span className="detail-value">{user.mobile || "Not provided"}</span>
            </div>
            <div className="profile-buttons">
              <button
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
              <button
                className="password-btn"
                onClick={() => setIsChangingPassword(true)}
              >
                Change Password
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification messages */}
      {error && (
        <div className="notification error">
          <span>{error}</span>
          <button onClick={handleCloseNotification}>&times;</button>
        </div>
      )}
      {success && (
        <div className="notification success">
          <span>{success}</span>
          <button onClick={handleCloseNotification}>&times;</button>
        </div>
      )}
    </div>
    </div>
  );
};

export default MyProfile;