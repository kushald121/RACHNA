// pages/utils/ProtectedRoutes.js
import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem("adminToken");

      if (token) {
        try {
          // Check if token is valid (not expired)
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;

          if (tokenData.exp && tokenData.exp > currentTime) {
            setIsAuthenticated(true);
          } else {
            // Token expired, remove it
            localStorage.removeItem("adminToken");
            setIsAuthenticated(false);
          }
        } catch (error) {
          // Invalid token format, remove it
          localStorage.removeItem("adminToken");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkAuthentication();
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Redirect to admin login if not authenticated
  if (!isAuthenticated) {
    // Store the attempted URL for redirect after login
    const currentPath = window.location.pathname;
    localStorage.setItem("adminRedirectPath", currentPath);

    return <Navigate to="/Rachna/admin-login/" replace />;
  }

  // Render protected content if authenticated
  return <Outlet />;
};

export default ProtectedRoutes;
