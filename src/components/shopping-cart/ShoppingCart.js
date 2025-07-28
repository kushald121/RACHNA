import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ShoppingCart = ({ open, setOpen }) => {
  const [cartData, setCartData] = useState({ items: [], summary: {} });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, loading: authLoading, getCurrentSessionId, getSessionType, getAuthHeaders } = useAuth();

  // Debug logging (can be removed in production)
  useEffect(() => {
    if (!authLoading) {
      console.log('Cart - Session ID:', getCurrentSessionId(), 'Type:', getSessionType());
    }
  }, [user, authLoading, getCurrentSessionId, getSessionType]);

  // Fetch cart when component opens and auth is ready
  useEffect(() => {
    if (open && !authLoading) {
      fetchCart();
    }
  }, [open, authLoading]);

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Wait for auth to initialize
      if (authLoading) {
        console.log('Auth still loading, skipping cart fetch');
        setIsLoading(false);
        return;
      }

      // Check if auth functions are available
      if (!getCurrentSessionId || !getSessionType) {
        console.error('Auth functions not available');
        setError('Authentication not initialized');
        return;
      }

      const sessionId = getCurrentSessionId();
      const sessionType = getSessionType();

      if (!sessionId) {
        console.error('No session ID available');
        setError('No session available');
        return;
      }

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

      if (response.data.success) {
        console.log('=== CART FETCH RESPONSE ===');
        console.log('Cart items received:', response.data.cart.items.map(item => ({
          id: item.productId || item.product_id,
          name: item.name,
          quantity: item.quantity
        })));

        // Use functional update to ensure we get the latest state
        setCartData(prevData => {
          console.log('Previous cart data:', prevData);
          console.log('New cart data:', response.data.cart);
          return response.data.cart;
        });
      } else {
        setError(response.data.message || 'Failed to load cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError(error.response?.data?.message || 'Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    // Prevent multiple simultaneous updates
    if (isLoading) {
      console.log('Update already in progress, skipping...');
      return;
    }

    try {
      setIsLoading(true);
      console.log('=== UPDATING QUANTITY ===');
      console.log('Product ID:', productId);
      console.log('New Quantity:', newQuantity);
      console.log('Current cart items:', cartData.items.map(item => ({
        id: item.productId || item.product_id,
        name: item.name,
        quantity: item.quantity
      })));

      const sessionId = getCurrentSessionId();
      const sessionType = getSessionType();

      console.log('Session ID:', sessionId);
      console.log('Session Type:', sessionType);

      let response;
      if (sessionType === 'user') {
        // Update user cart
        response = await axios.put('http://localhost:5000/api/cart', {
          userId: sessionId,
          productId: parseInt(productId), // Ensure productId is a number
          quantity: newQuantity
        }, {
          headers: getAuthHeaders()
        });
        console.log('User cart update response:', response.data);
      } else {
        // Update guest cart
        response = await axios.put('http://localhost:5000/api/guest-cart/update', {
          sessionId,
          productId: parseInt(productId), // Ensure productId is a number
          quantity: newQuantity
        });
        console.log('Guest cart update response:', response.data);
      }

      // Only refresh if the backend update was successful
      if (response.data.success) {
        console.log('Backend update successful, refreshing cart...');
        await fetchCart();
      } else {
        console.error('Backend update failed:', response.data.message);
        setError(response.data.message || 'Failed to update quantity');
      }

      console.log('=== QUANTITY UPDATE COMPLETE ===');
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Failed to update quantity');
      await fetchCart(); // Refresh on error
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
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

      fetchCart(); // Refresh cart

      // Refresh navbar counts
      if (window.refreshNavbarCounts) {
        window.refreshNavbarCounts();
      }

      // Refresh navbar counts
      if (window.refreshNavbarCounts) {
        window.refreshNavbarCounts();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Fetch cart when component opens
  useEffect(() => {
    if (open) {
      fetchCart();
    }
  }, [open]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCheckout = async () => {
    const sessionType = getSessionType();

    if (sessionType === 'guest') {
      // Redirect to login page for guest users
      alert('Please login to proceed with checkout');
      // You can redirect to login page here
      window.location.href = '/Rachna/user-login/';
    } else {
      // Proceed to address selection for authenticated users
      console.log('Proceeding to address selection...');
      // Navigate to address page first
      window.location.href = '/Rachna/address/';
    }
  };

  const textMotion = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25, ease: 'easeInOut' }},
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Shopping Cart
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setOpen(false)}
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </div>
                      </div>

                      {/* Cart Items */}
                      <motion.div
                        className="mt-8"
                        variants={textMotion}
                        initial="hidden"
                        animate="visible"
                      >
                        {isLoading ? (
                          <div className="text-center py-8">Loading...</div>
                        ) : error ? (
                          <div className="text-center py-8 text-red-500">{error}</div>
                        ) : cartData.items.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            Your cart is empty
                          </div>
                        ) : (
                          <ul className="-my-6 divide-y divide-gray-200">
                            {cartData.items.map((item, index) => (
                              <li key={`${item.cartItemId || item.productId || item.product_id}-${index}`} className="flex py-6">
                                {/* Product Image */}
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover object-center"
                                  />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>{item.name}</h3>
                                      <p className="ml-4">{formatCurrency(item.itemTotal)}</p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                                    <div className="flex items-center mt-1">
                                      <span className="text-sm font-medium">{formatCurrency(item.price)}</span>
                                      {item.originalPrice && (
                                        <span className="ml-2 text-sm text-gray-400 line-through">
                                          {formatCurrency(item.originalPrice)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <div className="flex items-center">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const productId = item.productId || item.product_id;
                                          const currentQuantity = item.quantity;
                                          const newQuantity = currentQuantity - 1;
                                          console.log('=== DECREASE BUTTON CLICKED ===');
                                          console.log('Item:', item);
                                          console.log('Product ID:', productId);
                                          console.log('Current quantity:', currentQuantity);
                                          console.log('New quantity will be:', newQuantity);
                                          updateQuantity(productId, newQuantity);
                                        }}
                                        className="px-2 py-1 border rounded-l-md hover:bg-gray-100"
                                        disabled={item.quantity <= 1}
                                      >
                                        -
                                      </button>
                                      <span className="px-3 py-1 border-t border-b bg-gray-50">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const productId = item.productId || item.product_id;
                                          const currentQuantity = item.quantity;
                                          const newQuantity = currentQuantity + 1;
                                          console.log('=== INCREASE BUTTON CLICKED ===');
                                          console.log('Item:', item);
                                          console.log('Product ID:', productId);
                                          console.log('Current quantity:', currentQuantity);
                                          console.log('New quantity will be:', newQuantity);
                                          updateQuantity(productId, newQuantity);
                                        }}
                                        className="px-2 py-1 border rounded-r-md hover:bg-gray-100"
                                        disabled={item.quantity >= item.stock}
                                      >
                                        +
                                      </button>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => removeItem(item.productId || item.product_id)}
                                      className="font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </motion.div>
                    </div>

                    {/* Cart Summary */}
                    {cartData.items.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatCurrency(cartData.summary.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{cartData.summary.shipping === 0 ? 'Free' : formatCurrency(cartData.summary.shipping)}</span>
                          </div>
                          <div className="flex justify-between text-base font-medium text-gray-900 border-t pt-2">
                            <span>Total</span>
                            <span>{formatCurrency(cartData.summary.total)}</span>
                          </div>
                        </div>

                        <p className="mt-0.5 text-sm text-gray-500">
                          Shipping and taxes calculated at checkout.
                        </p>

                        <div className="mt-6">
                          <button
                            onClick={handleCheckout}
                            className="w-full flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                          >
                            Checkout
                          </button>
                        </div>
                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                          <p>
                            or{' '}
                            <button
                              type="button"
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                              onClick={() => setOpen(false)}
                            >
                              Continue Shopping
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ShoppingCart;
