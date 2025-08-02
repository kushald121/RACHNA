import React, { useState, useEffect, useRef } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiShield } from 'react-icons/fi';
import { Footer, NavBar } from '../../components';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  // Refs for GSAP animations
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const imageRef = useRef(null);
  const logoRef = useRef(null);

  // Fashion images array
  const fashionImages = [
    'https://i.pinimg.com/736x/95/f7/9a/95f79ac631b7bbe21f57d8835d871eb9.jpg',
    'https://cdn.shopify.com/s/files/1/0293/9277/files/11-15-24_S7_39_ZAPP0909_Black_CZ_DJ_10-37-37_40663_PXF.jpg?v=1731969291&width=461&height=691&crop=center',
    'https://www.theunstitchd.com/wp-content/uploads/2025/03/Sweatshirt-With-Baggy-Jeans.jpg',
    'https://i.pinimg.com/736x/1b/21/65/1b216585640d1f7ddb8d56ec392b2092.jpg'
  ];

  // Timer effect for OTP
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Image rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % fashionImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [fashionImages.length]);

  // GSAP animations on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial setup
      gsap.set([formRef.current, imageRef.current], { opacity: 0 });

      // Logo animation
      gsap.fromTo(logoRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 1, ease: "back.out(1.7)" }
      );

      // Container entrance
      gsap.fromTo(containerRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.3 }
      );

      // Form slide in from left
      gsap.fromTo(formRef.current,
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.6 }
      );

      // Image slide in from right
      gsap.fromTo(imageRef.current,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.8 }
      );

      // Floating animation for the container
      gsap.to(containerRef.current, {
        y: -10,
        duration: 2,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1
      });

      // Animate form inputs on focus
      const inputs = formRef.current?.querySelectorAll('input');
      inputs?.forEach((input, index) => {
        input.addEventListener('focus', () => {
          gsap.to(input, {
            scale: 1.02,
            duration: 0.2,
            ease: "power2.out"
          });
        });

        input.addEventListener('blur', () => {
          gsap.to(input, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
          });
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Image change animation
  useEffect(() => {
    if (imageRef.current) {
      gsap.fromTo(imageRef.current,
        { scale: 1.1, opacity: 0.7 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [currentImageIndex]);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
        <div
          ref={containerRef}
          className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{ minHeight: '600px' }}
        >
          <div className="flex h-full">
            {/* Left Side - Form */}
            <div ref={formRef} className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">


              {step === 1 ? (
                <div>
                  {/* Welcome Message */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-black mb-2">
                      {isLogin ? 'WELCOME BACK!' : 'JOIN RACHNA!'}
                    </h2>
                    <p className="text-gray-600">
                      {isLogin
                        ? 'Access your personal account by logging in.'
                        : 'Create your account and start your fashion journey.'
                      }
                    </p>
                  </div>

                  {/* Toggle Login/Signup */}
                  <div className="flex justify-center mb-8">
                    <div className="bg-gray-100 rounded-full p-1 flex">
                      <button
                        type="button"
                        onClick={() => setIsLogin(true)}
                        className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                          isLogin
                            ? 'bg-black text-white shadow-md'
                            : 'text-gray-600 hover:text-black'
                        }`}
                      >
                        Log In
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                          !isLogin
                            ? 'bg-black text-white shadow-md'
                            : 'text-gray-600 hover:text-black'
                        }`}
                      >
                        Sign up
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name field - only for signup */}
                    {!isLogin && (
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required={!isLogin}
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full py-4 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition duration-300 bg-white"
                          placeholder="Enter your full name"
                        />
                      </div>
                    )}

                    {/* Email field */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address or Username
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full py-4 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition duration-300 bg-white"
                        placeholder="Enter your email"
                      />
                    </div>

                    {/* Phone field - only for signup */}
                    {!isLogin && (
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          required={!isLogin}
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full py-4 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition duration-300 bg-white"
                          placeholder="Enter your phone number"
                        />
                        <p className="text-xs text-gray-600 mt-2">Required for delivery updates</p>
                      </div>
                    )}

                    {/* Password field - for both login and signup */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full py-4 px-4 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition duration-300 bg-white"
                          placeholder="Enter your password"
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      {isLogin && (
                        <div className="text-right mt-2">
                          <button type="button" className="text-sm text-gray-600 hover:text-black transition duration-300">
                            Forgot Password
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password field - only for signup */}
                    {!isLogin && (
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          required={!isLogin}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full py-4 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition duration-300 bg-white"
                          placeholder="Confirm your password"
                        />
                      </div>
                    )}

                    {/* Remember me checkbox for login */}
                    {isLogin && (
                      <div className="flex items-center">
                        <input
                          id="remember"
                          name="remember"
                          type="checkbox"
                          className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                        />
                        <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                          Remember me
                        </label>
                      </div>
                    )}

                    {/* Error message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center">
                        {error}
                      </div>
                    )}

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {loading ? 'Please wait...' : (isLogin ? 'Log In' : 'Send OTP')}
                    </button>



                    {/* Terms and conditions */}
                    {!isLogin && (
                      <p className="text-xs text-gray-600 text-center">
                        By continuing, you agree to our{' '}
                        <span className="text-black cursor-pointer hover:underline">Terms of Use</span> and{' '}
                        <span className="text-black cursor-pointer hover:underline">Privacy Policy</span>.
                      </p>
                    )}

                    {/* Switch between login/signup */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                          type="button"
                          onClick={() => setIsLogin(!isLogin)}
                          className="text-black font-semibold hover:underline"
                        >
                          {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                      </p>
                    </div>

                  </form>
                </div>

              ) : (
                /* OTP Verification Step */
                <div>
                  <div className="text-center mb-8">
                    <div className="mx-auto w-20 h-20 bg-black rounded-full flex items-center justify-center mb-6">
                      <FiShield className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-3">
                      Verify Your Account
                    </h3>
                    <p className="text-sm text-gray-600">
                      We've sent a verification code to<br />
                      <span className="font-medium text-black">{formData.email}</span> and <span className="font-medium text-black">{formData.phone}</span>
                    </p>
                  </div>

                  <form onSubmit={handleOtpVerification} className="space-y-6">
                    <div className="relative">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full py-4 px-4 text-center text-2xl font-bold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition duration-300 bg-white"
                        placeholder="Enter OTP"
                        maxLength="6"
                      />
                    </div>

                    {/* Timer */}
                    <div className="text-center">
                      {otpTimer > 0 ? (
                        <p className="text-sm text-gray-600">
                          Resend OTP in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={loading}
                          className="text-black hover:text-gray-600 font-medium text-sm transition duration-300"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>

                    {/* Error message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center">
                        {error}
                      </div>
                    )}

                    {/* Verify button */}
                    <button
                      type="submit"
                      disabled={loading || !otp.trim()}
                      className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {loading ? 'Verifying...' : 'VERIFY & LOGIN'}
                    </button>

                    {/* Back button */}
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setOtp('');
                        setError('');
                        setOtpTimer(0);
                      }}
                      className="w-full text-gray-600 hover:text-black font-medium transition duration-300"
                    >
                      ← Back to form
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Right Side - Fashion Images */}
            <div ref={imageRef} className="hidden lg:block lg:w-1/2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent z-10"></div>
              <img
                src={fashionImages[currentImageIndex]}
                alt="Fashion"
                className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
                style={{ minHeight: '600px' }}
              />

              {/* Image indicators */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                {fashionImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? 'bg-white scale-125'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>

              {/* Fashion text overlay */}
              <div className="absolute top-8 right-8 text-white z-20">
                <h3 className="text-2xl font-bold mb-2">RACHNA</h3>
                <p className="text-sm opacity-90">Fashion Forward</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserLogin;
