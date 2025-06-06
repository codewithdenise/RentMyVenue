import React from "react";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import VendorDashboard from "@/pages/vendor/VendorDashboard";
import { useAuth } from "@/hooks/useAuth";

const SharedDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const role = user.role.toLowerCase();

  if (role === "admin") {
    return <AdminDashboard />;
  } else if (role === "vendor") {
    return <VendorDashboard />;
  } else {
    return <div>Access Denied: You do not have permission to view this page.</div>;
  }
};

export default SharedDashboard;
