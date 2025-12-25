import React from "react";
import { Navigate } from "react-router-dom";

// This component acts as a security guard for routes.
// It checks if a user is logged in, and optionally if they are an admin.
export default function ProtectedRoute({ children, adminOnly = false }) {
  // 1. Get user data from local storage
  const userString = localStorage.getItem("flyem_user");
  const user = userString ? JSON.parse(userString) : null;

  // 2. If not logged in, kick them to Login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If route requires Admin but user is NOT admin, kick them to Home
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 4. If all checks pass, show the page
  return children;
}