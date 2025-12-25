import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  // 👇 FIX: Change 'flyem_user' to 'userInfo'
  const user = JSON.parse(localStorage.getItem("userInfo"));

  // Check if user exists AND has permission
  const isAuthorized = user && (
      user.isAdmin || 
      user.role === 'superadmin' || 
      ['catalog', 'orders', 'marketing', 'content'].includes(user.role)
  );

  return isAuthorized ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;