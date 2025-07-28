import React, { useState, useEffect } from 'react';
import { Footer, NavBar } from '../../components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit3, Plus, Minus, MapPin, User, Phone } from 'lucide-react';
import axios from 'axios';

const OrderSummaryPage = () => {
  const { user, getAuthHeaders, getCurrentSessionId, getSessionType } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    total: 0
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.2 }
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/Rachna/user-login');
      return;
    }

    // Get selected address from localStorage
    const storedAddress = localStorage.getItem('selectedAddress');
    if (storedAddress) {
      setSelectedAddress(JSON.parse(storedAddress));
    } else {
      navigate('/Rachna/address');
      return;
    }

    fetchCartItems();
  }, [user, navigate]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors

      // Check if auth functions are available
      if (!getCurrentSessionId || !getSessionType) {
        console.error('Auth functions not available');
        setError('Authentication not initialized');
        return;
      }

      const sessionId = getCurrentSessionId();
      const sessionType = getSessionType();

      console.log('Fetching cart for session:', sessionId, 'type:', sessionType);

      let response;
      if (sessionType === 'user') {
        // Fetch from user cart
        response = await axios.get(`http://localhost:5000/api/cart/${sessionId}`, {
          headers: getAuthHeaders()
        });
      } else {
        // Fetch from guest cart
        response = await axios.get(`http://localhost:5000/api/guest-cart/${sessionId}`);
      }

      console.log('Cart response:', response.data);

      if (response.data.success) {
        const items = response.data.cart.items || [];
        setCartItems(items);
        calculateOrderSummary(items);
        console.log('Cart items loaded:', items);
      } else {
        setError(response.data.message || 'Failed to load cart items');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const calculateOrderSummary = (items) => {
    console.log('Calculating order summary for items:', items);

    const subtotal = items.reduce((sum, item) => sum + (item.itemTotal || item.price * item.quantity), 0);
    const shipping = 0; // Free shipping for all orders
    const total = subtotal + shipping;

    const summary = {
      subtotal: Math.round(subtotal * 100) / 100,
      shipping,
      total: Math.round(total * 100) / 100
    };

    console.log('Calculated order summary:', summary);
    setOrderSummary(summary);
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    try {
      const sessionId = getCurrentSessionId();
      const sessionType = getSessionType();

      if (sessionType === 'user') {
        // Update user cart
        await axios.put('http://localhost:5000/api/cart', {
          userId: sessionId,
          productId,
          quantity: newQuantity
        }, {
          headers: getAuthHeaders()
        });
      } else {
        // Update guest cart
        await axios.put('http://localhost:5000/api/guest-cart/update', {
          sessionId,
          productId,
          quantity: newQuantity
        });
      }

      fetchCartItems(); // Refresh cart

      // Refresh navbar counts
      if (window.refreshNavbarCounts) {
        window.refreshNavbarCounts();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError(error.response?.data?.message || 'Failed to update quantity');
    }
  };

  const removeItem = async (productId) => {
    try {
      const sessionId = getCurrentSessionId();
      const sessionType = getSessionType();

      if (sessionType === 'user') {
        // Remove from user cart
        await axios.delete(`http://localhost:5000/api/cart/${productId}`, {
          data: { userId: sessionId },
          headers: getAuthHeaders()
        });
      } else {
        // Remove from guest cart
        await axios.delete('http://localhost:5000/api/guest-cart/remove', {
          data: { sessionId, productId }
        });
      }

      fetchCartItems(); // Refresh cart

      // Refresh navbar counts
      if (window.refreshNavbarCounts) {
        window.refreshNavbarCounts();
      }
    } catch (error) {
      console.error('Error removing item:', error);
      setError(error.response?.data?.message || 'Failed to remove item');
    }
  };

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    const orderDataToPass = {
      items: cartItems,
      summary: orderSummary
    };

    console.log('Proceeding to payment with order data:', orderDataToPass);
    console.log('Order summary being passed:', orderSummary);

    // Navigate to payment with order data
    navigate('/Rachna/payment', {
      state: {
        selectedAddress,
        orderData: orderDataToPass
      }
    });
  };

  const handleChangeAddress = () => {
    navigate('/Rachna/address');
  };

  if (!user) {
    return (
      <>
        <NavBar />
        <motion.div
          className="min-h-screen bg-gray-50 py-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
              <p className="text-gray-600 mb-6">You need to be logged in to view your order summary.</p>
              <button
                onClick={() => navigate('/Rachna/user-login')}
                className="bg-[#E50010] text-white px-6 py-3 rounded-md font-semibold hover:bg-red-600 transition duration-300"
              >
                Login / Sign Up
              </button>
            </div>
          </div>
        </motion.div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <motion.div
        className="min-h-screen bg-gray-50 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            variants={containerVariants}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#E50010] to-red-600 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">ORDER SUMMARY</h1>
              <p className="text-red-100 text-sm mt-1">Review your order before payment</p>
            </div>

            <div className="p-6">
              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Items */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Order Items ({cartItems.length})
                    </h2>
                    <button
                      onClick={() => navigate('/Rachna/allproducts')}
                      className="text-[#E50010] hover:text-red-600 font-medium text-sm"
                    >
                      Continue Shopping
                    </button>
                  </div>

                  <div className="space-y-4">
                    <AnimatePresence>
                      {cartItems.map((item) => (
                        <motion.div
                          key={item.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="border rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex items-start space-x-4">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-md"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{item.category}</p>
                              {item.originalPrice && (
                                <p className="text-xs text-gray-500 line-through">₹{item.originalPrice}</p>
                              )}
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="font-medium">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">₹{item.itemTotal || (item.price * item.quantity)}</p>
                                  <p className="text-sm text-gray-500">₹{item.price} each</p>
                                </div>
                                <button
                                  onClick={() => removeItem(item.productId)}
                                  className="text-red-500 hover:text-red-700 transition-colors ml-4"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {cartItems.length === 0 && !loading && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Your cart is empty.</p>
                        <button
                          onClick={() => navigate('/Rachna/allproducts')}
                          className="mt-4 bg-[#E50010] text-white px-6 py-2 rounded-md font-semibold hover:bg-red-600 transition duration-300"
                        >
                          Start Shopping
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="space-y-6">
                  {/* Delivery Address */}
                  {selectedAddress && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Delivery Address
                        </h3>
                        <button
                          onClick={handleChangeAddress}
                          className="text-[#E50010] hover:text-red-600 text-sm font-medium"
                        >
                          Change
                        </button>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {selectedAddress.name}
                        </p>
                        <p className="flex items-center mt-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {selectedAddress.phone}
                        </p>
                        <p className="mt-2">
                          {selectedAddress.address_line_1}
                          {selectedAddress.address_line_2 && `, ${selectedAddress.address_line_2}`}
                          <br />
                          {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code || selectedAddress.pincode}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Price Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal ({cartItems.length} items)</span>
                        <span>₹{orderSummary.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className={orderSummary.shipping === 0 ? 'text-green-600' : ''}>
                          {orderSummary.shipping === 0 ? 'FREE' : `₹${orderSummary.shipping}`}
                        </span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>₹{orderSummary.total}</span>
                      </div>
                    </div>

                    {orderSummary.subtotal < 500 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-xs text-yellow-800">
                          Add ₹{500 - orderSummary.subtotal} more to get FREE shipping!
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleProceedToPayment}
                      disabled={cartItems.length === 0 || loading}
                      className="w-full mt-6 bg-[#E50010] text-white py-3 rounded-md font-semibold hover:bg-red-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default OrderSummaryPage;
