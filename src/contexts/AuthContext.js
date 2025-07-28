import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestSessionId, setGuestSessionId] = useState(null);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const userData = localStorage.getItem('userData');
        const authExpiry = localStorage.getItem('authExpiry');

        if (token && userData && authExpiry) {
          const expiryDate = new Date(authExpiry);
          const now = new Date();

          if (now < expiryDate) {
            // Token is still valid, verify with server
            try {
              const response = await axios.get('http://localhost:5000/api/user/verify', {
                headers: { Authorization: `Bearer ${token}` }
              });

              if (response.status === 200) {
                setUser(JSON.parse(userData));
              } else {
                throw new Error('Token verification failed');
              }
            } catch (verifyError) {
              // Server verification failed, clear auth data
              localStorage.removeItem('userToken');
              localStorage.removeItem('userData');
              localStorage.removeItem('authExpiry');
              await initGuestSession();
            }
          } else {
            // Token has expired, clear auth data
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            localStorage.removeItem('authExpiry');
            await initGuestSession();
          }
        } else {
          // No valid auth data, initialize guest session
          await initGuestSession();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid tokens
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('authExpiry');
        await initGuestSession();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Initialize guest session
  const initGuestSession = async () => {
    try {
      let sessionId = localStorage.getItem('guestSessionId');

      if (!sessionId) {
        try {
          const response = await axios.post('http://localhost:5000/api/guest-cart/session');
          sessionId = response.data.sessionId;
          localStorage.setItem('guestSessionId', sessionId);
        } catch (apiError) {
          console.error('API guest session creation failed:', apiError);
          // Generate a stable fallback session ID based on browser fingerprint
          const browserFingerprint = navigator.userAgent + navigator.language + window.screen.width + window.screen.height;
          const hash = btoa(browserFingerprint).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
          sessionId = 'guest_' + hash;
          localStorage.setItem('guestSessionId', sessionId);
        }
      }

      setGuestSessionId(sessionId);
    } catch (error) {
      console.error('Guest session initialization error:', error);
      // Last resort: use a very simple stable ID
      const simpleId = 'guest_browser_' + Date.now().toString().slice(-8);
      localStorage.setItem('guestSessionId', simpleId);
      setGuestSessionId(simpleId);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const sessionId = localStorage.getItem('guestSessionId');
      const response = await axios.post('http://localhost:5000/api/user/login', {
        email,
        password,
        sessionId
      });

      if (response.data.token) {
        // Calculate expiry date (15 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 15);

        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        localStorage.setItem('authExpiry', expiryDate.toISOString());
        localStorage.removeItem('guestSessionId'); // Clear guest session
        setUser(response.data.user);
        setGuestSessionId(null);

        return { success: true, data: response.data };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/user/register', userData);

      if (response.data.token) {
        // Calculate expiry date (15 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 15);

        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        localStorage.setItem('authExpiry', expiryDate.toISOString());
        localStorage.removeItem('guestSessionId'); // Clear guest session
        setUser(response.data.user);
        setGuestSessionId(null);

        return { success: true, data: response.data };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('authExpiry');
    setUser(null);

    // Reinitialize guest session
    initGuestSession();
  };

  // Get auth headers for API calls
  const getAuthHeaders = () => {
    const token = localStorage.getItem('userToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Get current session ID (user ID if logged in, guest session ID if not)
  const getCurrentSessionId = () => {
    return user ? user.id : guestSessionId;
  };

  // Get session type
  const getSessionType = () => {
    return user ? 'user' : 'guest';
  };

  // Direct user update function for external login flows
  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    guestSessionId,
    login,
    register,
    logout,
    updateUser,
    getAuthHeaders,
    isAuthenticated,
    getCurrentSessionId,
    getSessionType,
    initGuestSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
