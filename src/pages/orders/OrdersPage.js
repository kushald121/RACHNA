import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Search, Package, Clock, CheckCircle, XCircle, Star } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);

  const { user, getAuthHeaders } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  useEffect(() => {
    // Filter orders based on search term
    if (searchTerm.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products.some(product => 
          product.productName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/orders/my-orders', {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'processing':
        return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'shipped':
        return 'text-indigo-600 bg-indigo-100 border-indigo-200';
      case 'delivered':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'cancelled':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'refund completed':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'replacement completed':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600">You need to be logged in to view your orders.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Orders</h1>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search your orders here"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="absolute inset-y-0 right-0 px-4 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Search Orders
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'No orders match your search criteria.' : 'You haven\'t placed any orders yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      </div>

                      {/* Order Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {order.products && order.products.length > 0 ? order.products[0].productName : 'Order Items'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {order.products && order.products.length > 1
                            ? `${order.products[0].productName} and ${order.products.length - 1} more item${order.products.length > 2 ? 's' : ''}`
                            : order.products?.[0]?.productName || 'Order details'
                          }
                        </p>
                        <p className="text-lg font-bold text-gray-900">₹{order.totalAmount}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status === 'delivered' ? 'Delivered' : order.status}</span>
                      </span>
                      <p className="text-sm text-gray-500">on {formatDate(order.orderedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="px-6 py-4">
                  {order.status === 'delivered' && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Your item has been delivered
                      </p>
                    </div>
                  )}

                  {order.status === 'cancelled' && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">
                        <XCircle className="w-4 h-4 inline mr-2" />
                        You requested a cancellation because you needed an earlier delivery date.
                      </p>
                    </div>
                  )}

                  {order.status === 'refund completed' && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800 font-medium">Refund Completed</p>
                      <p className="text-sm text-green-700">
                        The money was sent to your UPI linked bank account on {formatDate(order.orderedAt)}.
                        For any questions, please contact your bank with reference number 516400051599.
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        For any questions, please contact your bank with reference number 516400051599.
                      </p>
                    </div>
                  )}

                  {order.status === 'replacement completed' && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800 font-medium">Replacement Completed</p>
                      <p className="text-sm text-blue-700">
                        We have resent this product. Due to shipment-related issues, we could not deliver this product via the original order. Please track the new order from My Orders.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {order.itemCount} item{order.itemCount !== 1 ? 's' : ''} • Payment Status: <span className="font-medium capitalize">{order.paymentStatus}</span>
                    </div>
                    <div className="flex space-x-3">
                      {order.status === 'delivered' && (
                        <button className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
                          <Star className="w-4 h-4 mr-1" />
                          Rate & Review Product
                        </button>
                      )}
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>


              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
