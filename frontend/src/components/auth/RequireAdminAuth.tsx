import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const RequireAdminAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user || user.role !== "admin") {
    // Redirect to admin login page or main login page
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAdminAuth;
