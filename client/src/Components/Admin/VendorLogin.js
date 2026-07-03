import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../User/Auth.css';

const VendorLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('http://https://festpro-yvwm.onrender.com/vendor/login', form);
      const { token, message, vendorId } = res.data;

      localStorage.setItem('vendorToken', token);
      localStorage.setItem('vendorId', vendorId);

      alert(message);
      navigate('/vendorDashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Vendor Login</h2>
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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
            />
          </div>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <a href="/vendorRegister">Register</a>
        </div>
        <button
          onClick={() => navigate('/')}
          className="back-button"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default VendorLogin;
