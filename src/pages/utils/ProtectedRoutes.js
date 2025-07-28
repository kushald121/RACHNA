// pages/utils/ProtectedRoutes.js
import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoutes = () => {
  const token = localStorage.getItem("adminToken");

  return token ? <Outlet /> : <Navigate to="/Rachna/admin-login/" />;
};

export default ProtectedRoutes;
