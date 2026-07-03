// Components/ProtectedVendorRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const VendorProtectedRoute = () => {
  const isVendorLoggedIn = localStorage.getItem('vendorToken');
  return isVendorLoggedIn ? <Outlet /> : <Navigate to="/vendorlogin" />;
};

export default VendorProtectedRoute;
