import React, { useState, useEffect } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiShield } from 'react-icons/fi';
import { Footer, NavBar } from '../../components';
import { motion, AnimatePresence } from 'framer-motion';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';

const UserLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: form, 2: otp verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  // Timer effect for OTP
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!isLogin && !formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!isLogin && !formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!isLogin && !/^[6-9]\d{9}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return false;
    }
    if (isLogin && !formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login flow
        const sessionId = localStorage.getItem('guestSessionId');
        const response = await axios.post('http://localhost:5000/api/user/login', {
          email: formData.email,
          password: formData.password,
          sessionId
        });

        if (response.data.success) {
          // Store auth data with 15-day expiry
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 15);

          localStorage.setItem('userToken', response.data.token);
          localStorage.setItem('userData', JSON.stringify(response.data.user));
          localStorage.setItem('authExpiry', expiryDate.toISOString());

          // Update user context directly
          updateUser(response.data.user);
          navigate('/Rachna/');
        }
      } else {
        // Signup flow - validate passwords first
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }

        // Send OTP for signup
        const response = await axios.post('http://localhost:5000/api/user/send-otp', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });

        if (response.data.success) {
          setStep(2);
          setOtpTimer(30); // 30 seconds
        } else {
          setError(response.data.message || 'Failed to send OTP');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);

      // Handle specific case where user doesn't exist during login
      if (error.response?.data?.action === 'signup') {
        setError(error.response.data.message);
        // Auto-redirect to signup after 3 seconds
        setTimeout(() => {
          setIsLogin(false);
          setError('');
          setFormData({ name: '', email: formData.email, password: '', confirmPassword: '', phone: '' });
        }, 3000);
      } else {
        setError(error.response?.data?.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (event) => {
    event.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const sessionId = localStorage.getItem('guestSessionId');
      console.log('Verifying OTP:', { email: formData.email, phone: formData.phone, otp: otp.trim() });

      const response = await axios.post('http://localhost:5000/api/user/verify-otp', {
        email: formData.email,
        phone: formData.phone,
        otp: otp.trim(), // Ensure no whitespace
        name: formData.name,
        password: formData.password,
        sessionId
      });

      if (response.data.success) {
        // Store auth data with 15-day expiry
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 15);
        
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        localStorage.setItem('authExpiry', expiryDate.toISOString());

        updateUser(response.data.user);
        navigate('/Rachna/');
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/user/send-otp', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });

      if (response.data.success) {
        setOtpTimer(30); // Reset timer to 30 seconds
        setOtp('');
      } else {
        setError(response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, delay: 0.2 }
    }
  };

  const benefitsVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, delay: 0.4 }
    }
  };

  return (
    <>
      <NavBar />
      <motion.div
        className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 flex items-center justify-center py-12 px-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="w-full max-w-md">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-100"
            variants={containerVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-8 py-6">
              <motion.h1
                className="text-2xl font-bold text-white text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {step === 1 ? (isLogin ? 'LOGIN' : 'SIGN UP') : 'VERIFY OTP'}
              </motion.h1>
              <motion.p
                className="text-indigo-100 text-sm mt-2 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {step === 1
                  ? (isLogin ? 'Welcome back to RACHNA' : 'Join RACHNA family today')
                  : 'Enter the OTP sent to your email and phone'
                }
              </motion.p>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="form"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={formVariants}
                  className="p-8"
                >
                  {/* Toggle Login/Signup */}
                  <div className="flex justify-center mb-8">
                    <div className="bg-gray-100 rounded-full p-1 flex">
                      <motion.button
                        type="button"
                        onClick={() => setIsLogin(true)}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          isLogin
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-gray-600 hover:text-indigo-600'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Login
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          !isLogin
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-gray-600 hover:text-indigo-600'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Sign Up
                      </motion.button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name field - only for signup */}
                    {!isLogin && (
                      <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiUser className="h-5 w-5 text-indigo-400" />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required={!isLogin}
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full py-4 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 bg-gray-50 hover:bg-white"
                          placeholder="Full Name"
                        />
                      </motion.div>
                    )}

                    {/* Email field */}
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-indigo-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full py-4 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 bg-gray-50 hover:bg-white"
                        placeholder="Email address"
                      />
                    </motion.div>

                    {/* Phone field - only for signup */}
                    {!isLogin && (
                      <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiPhone className="h-5 w-5 text-indigo-400" />
                        </div>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          required={!isLogin}
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full py-4 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 bg-gray-50 hover:bg-white"
                          placeholder="Phone Number"
                        />
                        <p className="text-xs text-indigo-600 mt-2 ml-1">Required for delivery updates</p>
                      </motion.div>
                    )}

                    {/* Password field - for both login and signup */}
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: isLogin ? 0.3 : 0.4 }}
                    >
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-indigo-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full py-4 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 bg-gray-50 hover:bg-white"
                        placeholder="Password"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-indigo-400 hover:text-indigo-600 focus:outline-none"
                        >
                          {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                        </button>
                      </div>
                    </motion.div>

                    {/* Confirm Password field - only for signup */}
                    {!isLogin && (
                      <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiLock className="h-5 w-5 text-indigo-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          required={!isLogin}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full py-4 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 bg-gray-50 hover:bg-white"
                          placeholder="Confirm Password"
                        />
                      </motion.div>
                    )}



                    {/* Error message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center"
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Terms and conditions */}
                    {!isLogin && (
                      <motion.p
                        className="text-xs text-gray-600 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        By continuing, you agree to our{' '}
                        <span className="text-indigo-600 cursor-pointer hover:underline">Terms of Use</span> and{' '}
                        <span className="text-indigo-600 cursor-pointer hover:underline">Privacy Policy</span>.
                      </motion.p>
                    )}

                    {/* Submit button */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? 'Please wait...' : (isLogin ? 'LOGIN' : 'SEND OTP')}
                    </motion.button>

                  </form>
                </motion.div>

              ) : (
                /* OTP Verification Step */
                <motion.div
                  key="otp"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={formVariants}
                  className="p-8"
                >
                  <div className="text-center mb-8">
                    <motion.div
                      className="mx-auto w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-6"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <FiShield className="w-10 h-10 text-white" />
                    </motion.div>
                    <motion.h3
                      className="text-xl font-semibold text-gray-700 mb-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Verify Your Account
                    </motion.h3>
                    <motion.p
                      className="text-sm text-gray-600"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      We've sent a verification code to<br />
                      <span className="font-medium text-indigo-600">{formData.email}</span> and <span className="font-medium text-indigo-600">{formData.phone}</span>
                    </motion.p>
                  </div>

                  <form onSubmit={handleOtpVerification} className="space-y-6">
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full py-4 px-4 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 bg-gray-50 hover:bg-white"
                        placeholder="Enter OTP"
                        maxLength="6"
                      />
                    </motion.div>

                    {/* Timer */}
                    <div className="text-center">
                      {otpTimer > 0 ? (
                        <motion.p
                          className="text-sm text-gray-600"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          Resend OTP in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                        </motion.p>
                      ) : (
                        <motion.button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={loading}
                          className="text-indigo-600 hover:text-purple-600 font-medium text-sm transition duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Resend OTP
                        </motion.button>
                      )}
                    </div>

                    {/* Error message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center"
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Verify button */}
                    <motion.button
                      type="submit"
                      disabled={loading || !otp.trim()}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? 'Verifying...' : 'VERIFY & LOGIN'}
                    </motion.button>

                    {/* Back button */}
                    <motion.button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setOtp('');
                        setError('');
                        setOtpTimer(0);
                      }}
                      className="w-full text-gray-600 hover:text-indigo-600 font-medium transition duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ← Back to form
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default UserLogin;
