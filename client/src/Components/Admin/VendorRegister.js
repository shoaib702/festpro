import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../User/Auth.css";

const VendorRegister = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    mobile: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "http://https://festpro-yvwm.onrender.com/vendor/register",
        form
      );
      alert(res.data.message);
      navigate("/vendorlogin");
    } catch (err) {
      setError(err.response?.data?.message || "Error registering vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Vendor Register</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className='loginLabel'>Name</label>
            <input
              name="name"
              type="text"
              placeholder="Enter your Full Name"
              onChange={handleChange}
              value={form.name}
              required
            />
          </div>
          <div className="form-group">
            <label className='loginLabel'>Email</label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              onChange={handleChange}
              value={form.email}
              required
            />
          </div>
          <div className="form-group">
            <label className='loginLabel'>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              onChange={handleChange}
              value={form.password}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label className='loginLabel'>Address</label>
            <input
              name="address"
              type="text"
              placeholder="Enter your address"
              onChange={handleChange}
              value={form.address}
              required
            />
          </div>
          <div className="form-group">
            <label className='loginLabel' >Mobile</label>
            <input
              name="mobile"
              type="tel"
              placeholder="Enter your mobile no."
              pattern="[0-9]{10}"
              onChange={handleChange}
              value={form.mobile}
              required
            />
          </div>
          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="auth-footer">
          Already registered? <a href="/vendorlogin">Login</a>
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;
