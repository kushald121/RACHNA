import React, { useState, useEffect, Fragment } from 'react';
import { Footer, NavBar } from '../../components';
import { LocateFixed, Plus, Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddressPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // New address form state
  const [newAddress, setNewAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    pincode: '',
    address_type: 'HOME'
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

  const addressVariants = {
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
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const token = localStorage.getItem('userToken');

      console.log('Fetching addresses with token:', token ? 'Present' : 'Missing');

      const response = await axios.get('http://localhost:5000/api/user/addresses', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Fetch addresses response:', response.data);

      if (response.data.success) {
        setAddresses(response.data.addresses);
        if (response.data.addresses.length > 0 && !selectedAddress) {
          setSelectedAddress(response.data.addresses[0].id);
        }
      } else {
        setError(response.data.message || 'Failed to load addresses');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      console.error('Error response:', error.response?.data);

      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(error.response?.data?.message || 'Failed to load addresses');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by browser");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      const nominatimURL = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

      try {
        const response = await fetch(nominatimURL, {
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();

          // Parse the address components
          const addressParts = data.address || {};
          setNewAddress(prev => ({
            ...prev,
            address_line_1: `${addressParts.house_number || ''} ${addressParts.road || ''}`.trim(),
            address_line_2: `${addressParts.suburb || ''} ${addressParts.neighbourhood || ''}`.trim(),
            city: addressParts.city || addressParts.town || addressParts.village || '',
            state: addressParts.state || '',
            pincode: addressParts.postcode || ''
          }));
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        alert("Failed to get address from location");
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Geolocation error:", error);
      alert("Failed to get current location");
      setLoading(false);
    });
  };

  const handleInputChange = (e) => {
    setNewAddress({
      ...newAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveAddress = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate required fields
      if (!newAddress.name || !newAddress.phone || !newAddress.address_line_1 ||
          !newAddress.city || !newAddress.state || !newAddress.pincode) {
        setError('Please fill all required fields');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('userToken');

      // Prepare address data with proper field mapping
      const addressData = {
        ...newAddress,
        postal_code: newAddress.pincode, // Map pincode to postal_code for backend compatibility
        type: newAddress.address_type,   // Map address_type to type for backend compatibility
        country: 'India'                 // Set default country
      };

      console.log('Sending address data:', addressData);
      console.log('Token:', token ? 'Present' : 'Missing');

      const response = await axios.post('http://localhost:5000/api/user/addresses', addressData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Address save response:', response.data);

      if (response.data.success) {
        await fetchAddresses();
        setShowNewAddress(false);
        setNewAddress({
          name: user?.name || '',
          phone: user?.phone || '',
          address_line_1: '',
          address_line_2: '',
          city: '',
          state: '',
          pincode: '',
          address_type: 'HOME'
        });
        setError(''); // Clear any previous errors
      } else {
        setError(response.data.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      console.error('Error response:', error.response?.data);

      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 400) {
        setError(error.response.data.message || 'Invalid address data');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(error.response?.data?.message || 'Failed to save address');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      const response = await axios.delete(`http://localhost:5000/api/user/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        await fetchAddresses();
        if (selectedAddress === addressId) {
          setSelectedAddress(addresses.length > 1 ? addresses.find(a => a.id !== addressId)?.id : null);
        }
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      setError('Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToOrderSummary = () => {
    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }

    // Store selected address in localStorage for order summary page
    const address = addresses.find(a => a.id === selectedAddress);
    localStorage.setItem('selectedAddress', JSON.stringify(address));

    // Navigate to order summary page
    navigate('/Rachna/order-summary');
  };

  // Redirect to login if not authenticated
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
              <p className="text-gray-600 mb-6">You need to be logged in to manage delivery addresses.</p>
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
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            variants={containerVariants}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#E50010] to-red-600 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">DELIVERY ADDRESS</h1>
              <p className="text-red-100 text-sm mt-1">Choose or add a delivery address</p>
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

              {/* Add New Address Button */}
              <div className="mb-6">
                <button
                  onClick={() => setShowNewAddress(!showNewAddress)}
                  className="flex items-center space-x-2 text-[#E50010] hover:text-red-600 font-medium transition duration-300"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* New Address Form */}
              <AnimatePresence>
                {showNewAddress && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border rounded-lg p-6 mb-6 bg-gray-50"
                  >
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Add New Address</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={newAddress.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E50010] focus:border-transparent"
                          placeholder="Enter full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={newAddress.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E50010] focus:border-transparent"
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                        <input
                          type="text"
                          name="address_line_1"
                          value={newAddress.address_line_1}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E50010] focus:border-transparent"
                          placeholder="House/Flat/Office No, Building Name"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                        <input
                          type="text"
                          name="address_line_2"
                          value={newAddress.address_line_2}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E50010] focus:border-transparent"
                          placeholder="Area, Landmark"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={newAddress.city}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E50010] focus:border-transparent"
                          placeholder="Enter city"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                        <input
                          type="text"
                          name="state"
                          value={newAddress.state}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E50010] focus:border-transparent"
                          placeholder="Enter state"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                        <input
                          type="text"
                          name="pincode"
                          value={newAddress.pincode}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E50010] focus:border-transparent"
                          placeholder="Enter pincode"
                          maxLength="6"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                        <select
                          name="address_type"
                          value={newAddress.address_type}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E50010] focus:border-transparent"
                        >
                          <option value="HOME">Home</option>
                          <option value="OFFICE">Office</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Use Current Location Button */}
                    <div className="mt-4">
                      <button
                        onClick={handleUseCurrentLocation}
                        disabled={loading}
                        className="flex items-center space-x-2 text-[#E50010] hover:text-red-600 font-medium transition duration-300 disabled:opacity-50"
                      >
                        <LocateFixed className="w-5 h-5" />
                        <span>{loading ? 'Getting location...' : 'Use Current Location'}</span>
                      </button>
                    </div>

                    {/* Form Actions */}
                    <div className="flex space-x-4 mt-6">
                      <button
                        onClick={handleSaveAddress}
                        disabled={loading}
                        className="bg-[#E50010] text-white px-6 py-2 rounded-md font-semibold hover:bg-red-600 transition duration-300 disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Address'}
                      </button>
                      <button
                        onClick={() => setShowNewAddress(false)}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-semibold hover:bg-gray-400 transition duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Existing Addresses */}
              <div className="space-y-4">
                <AnimatePresence>
                  {addresses.map((address) => (
                    <motion.div
                      key={address.id}
                      variants={addressVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <label className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddress === address.id}
                          onChange={() => setSelectedAddress(address.id)}
                          className="mt-1 accent-[#E50010]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-700">
                                {address.name}
                                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded ml-2">
                                  {address.type || address.address_type || 'HOME'}
                                </span>
                              </p>
                              <p className="text-sm text-gray-700">{address.phone}</p>
                              <p className="text-sm text-gray-600">
                                {address.address_line_1}
                                {address.address_line_2 && `, ${address.address_line_2}`}
                                <br />
                                {address.city}, {address.state} - <b>{address.postal_code || address.pincode}</b>
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDeleteAddress(address.id)}
                                className="text-red-500 hover:text-red-700 transition duration-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </label>

                      {selectedAddress === address.id && (
                        <motion.button
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={handleProceedToOrderSummary}
                          className="bg-[#E50010] text-white px-6 py-2 rounded font-semibold hover:bg-red-600 transition duration-300"
                        >
                          CONTINUE TO ORDER SUMMARY
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {addresses.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No addresses found. Please add a new address.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default AddressPage;
