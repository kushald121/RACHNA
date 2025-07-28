import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NavBar, Footer } from '../../components';
import axios from 'axios';
// Using clear online images for UPI apps
const gpayLogo = "https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Pay_Logo.png";
const phonepeLogo = "https://upload.wikimedia.org/wikipedia/commons/0/09/PhonePe_logo.png";
const paytmLogo = "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg";
const bhimLogo = "https://upload.wikimedia.org/wikipedia/commons/6/6b/BHIM_logo.png";

const PaymentPage = () => {
  const [orderData, setOrderData] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentStep, setPaymentStep] = useState('payment'); // payment, verification, success
  const [verificationData, setVerificationData] = useState({
    transactionId: '',
    referenceNumber: '',
    screenshot: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const upiId = "kushaldubey121-1@okaxis";
  const merchantName = "Luna Store";

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/Rachna/user-login/');
      return;
    }

    // Get address and order data from location state
    if (location.state?.selectedAddress) {
      setSelectedAddress(location.state.selectedAddress);
    } else {
      // Redirect back to order summary page if no address selected
      navigate('/Rachna/order-summary');
      return;
    }

    // Get order data from location state or redirect to order summary
    if (location.state?.orderData) {
      console.log('Payment page received order data:', location.state.orderData);
      setOrderData(location.state.orderData);
    } else {
      console.log('No order data found, redirecting to order summary');
      // Redirect to order summary if no order data
      navigate('/Rachna/order-summary');
      return;
    }
  }, [user, location.state]);

  const createOrderFromCart = async () => {
    try {
      setLoading(true);

      // Format shipping address
      const shippingAddress = selectedAddress ?
        `${selectedAddress.name}, ${selectedAddress.phone}\n${selectedAddress.address_line_1}${selectedAddress.address_line_2 ? ', ' + selectedAddress.address_line_2 : ''}\n${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.postal_code}` :
        'Address to be provided';

      const response = await axios.post('http://localhost:5000/api/orders/create-from-cart', {
        shippingAddress
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setOrderData(response.data.order);
      } else {
        setError('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const generateUPILink = () => {
    if (!orderData) return '';
    const amount = orderData.summary?.total || orderData.totalAmount;
    const orderNumber = orderData.orderNumber || `ORDER-${Date.now()}`;

    console.log('Generating UPI link with:', {
      orderData,
      amount,
      orderNumber,
      summary: orderData.summary,
      totalAmount: orderData.totalAmount
    });

    return `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR&tn=${orderNumber}`;
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(upiId)
      .then(() => alert("UPI ID Copied ✅"))
      .catch(() => alert("Failed to Copy ❌"));
  };

  const handleUPIPayment = () => {
    const upiLink = generateUPILink();

    // For mobile devices, try to open UPI app directly
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      // Try to open UPI app
      window.location.href = upiLink;

      // After a short delay, show verification form
      setTimeout(() => {
        setPaymentStep('verification');
      }, 3000);
    } else {
      // For desktop, show QR code and verification form
      setPaymentStep('verification');
    }
  };



  const submitPaymentVerification = async () => {
    try {
      setLoading(true);

      // First create order from cart if not already created
      let orderId = orderData.id;
      if (!orderId) {
        const orderResponse = await createOrderFromOrderData();
        if (!orderResponse) {
          setError('Failed to create order');
          return;
        }
        orderId = orderResponse.id;
      }

      const response = await axios.post('http://localhost:5000/api/payment/verify', {
        orderId: orderId,
        transactionId: verificationData.transactionId,
        amountPaid: orderData.summary?.total || orderData.totalAmount
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setPaymentStep('success');
      } else {
        setError('Failed to submit payment verification');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      setError(error.response?.data?.message || 'Failed to submit verification');
    } finally {
      setLoading(false);
    }
  };

  const createOrderFromOrderData = async () => {
    try {
      // Format shipping address
      const shippingAddress = selectedAddress ?
        `${selectedAddress.name}, ${selectedAddress.phone}\n${selectedAddress.address_line_1}${selectedAddress.address_line_2 ? ', ' + selectedAddress.address_line_2 : ''}\n${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.postal_code || selectedAddress.pincode}` :
        'Address to be provided';

      const response = await axios.post('http://localhost:5000/api/orders/create-from-cart', {
        shippingAddress,
        totalAmount: orderData.summary?.total
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setOrderData(prev => ({ ...prev, ...response.data.order }));
        return response.data.order;
      }
      return null;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  };

  if (loading && !orderData) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Creating your order...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">{error}</div>
            <button
              onClick={() => navigate('/Rachna/')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Go Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!orderData) {
    return null;
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Order Number:</span>
                <span className="font-medium">{orderData.orderNumber || `ORDER-${Date.now()}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Items:</span>
                <span>{orderData.items?.length || 'Multiple'} items</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{orderData.summary?.subtotal || orderData.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{(orderData.summary?.shipping || orderData.shippingAmount) === 0 ? 'Free' : `₹${orderData.summary?.shipping || orderData.shippingAmount}`}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total Amount:</span>
                <span>₹{orderData.summary?.total || orderData.totalAmount}</span>
              </div>
            </div>

            {/* Delivery Address */}
            {selectedAddress && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold mb-2">Delivery Address:</h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{selectedAddress.name}</p>
                  <p>{selectedAddress.phone}</p>
                  <p>
                    {selectedAddress.address_line_1}
                    {selectedAddress.address_line_2 && `, ${selectedAddress.address_line_2}`}
                    <br />
                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code || selectedAddress.pincode}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Steps */}
          {paymentStep === 'payment' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Pay ₹{orderData.summary?.total || orderData.totalAmount} via UPI</h2>

              <div className="flex flex-col items-center gap-8">
                {/* Mobile-first UPI Button */}
                <div className="w-full max-w-md">
                  <button
                    onClick={handleUPIPayment}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-green-700 font-bold text-lg shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Pay ₹{orderData.summary?.total || orderData.totalAmount} via UPI App
                  </button>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Tap to open your UPI app directly
                  </p>
                </div>

                {/* QR Code for Desktop Users */}
                <div className="hidden md:block">
                  <div className="text-center mb-4">
                    <p className="text-gray-600 mb-2">Or scan QR code with your UPI app</p>
                    <QRCodeSVG value={generateUPILink()} size={200} className="mx-auto border-2 border-gray-200 rounded-lg p-2" />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-lg mb-3">UPI ID: <span className="font-semibold text-blue-600">{upiId}</span></p>
                  <button
                    onClick={copyUPI}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Copy UPI ID
                  </button>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                  <img src={gpayLogo} alt="GPay" className="w-12 h-12 object-contain" />
                  <img src={phonepeLogo} alt="PhonePe" className="w-12 h-12 object-contain" />
                  <img src={paytmLogo} alt="Paytm" className="w-12 h-12 object-contain" />
                  <img src={bhimLogo} alt="BHIM" className="w-12 h-12 object-contain" />
                </div>

                <p className="text-sm text-gray-600 text-center max-w-md">
                  Works with GPay, PhonePe, Paytm, BHIM & all UPI apps. Click the button above to pay directly from your mobile device.
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/Rachna/order-summary')}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-medium"
                  >
                    Back to Order Summary
                  </button>
                  <button
                    onClick={() => setPaymentStep('verification')}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    I have completed the payment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Verification */}
          {paymentStep === 'verification' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="text-green-600 text-4xl mb-2">💳</div>
                <h2 className="text-2xl font-bold text-gray-800">Verify Your Payment</h2>
                <p className="text-gray-600 mt-2">Enter your UPI transaction ID to complete the order</p>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    UPI Transaction ID *
                  </label>
                  <input
                    type="text"
                    value={verificationData.transactionId}
                    onChange={(e) => setVerificationData({...verificationData, transactionId: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                    placeholder="e.g., 123456789012"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    You can find this in your UPI app's transaction history
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">How to find your Transaction ID:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Open your UPI app (GPay, PhonePe, Paytm, etc.)</li>
                    <li>• Go to Transaction History</li>
                    <li>• Find the payment to {upiId}</li>
                    <li>• Copy the Transaction ID</li>
                  </ul>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setPaymentStep('payment')}
                    className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 font-medium"
                  >
                    Back to Payment
                  </button>
                  <button
                    onClick={submitPaymentVerification}
                    disabled={!verificationData.transactionId || loading}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? 'Verifying...' : 'Verify Payment'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success */}
          {paymentStep === 'success' && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-green-600 text-7xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Order Confirmed!</h2>
              <p className="text-gray-600 mb-6 text-lg">
                Your payment has been verified successfully. Your order has been placed and will be processed shortly.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-green-800 font-medium">
                  Order Number: <span className="font-bold">{orderData.orderNumber}</span>
                </p>
                <p className="text-sm text-green-700 mt-1">
                  You will receive order updates via email and SMS
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/Rachna/orders')}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium"
                >
                  View My Orders
                </button>
                <button
                  onClick={() => navigate('/Rachna/')}
                  className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentPage;
