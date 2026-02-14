import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const { isAdmin, user } = useAuth();

  return user && isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;
