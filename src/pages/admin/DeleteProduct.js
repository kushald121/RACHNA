import React, { useState, useEffect } from 'react';
import { NavBar, Footer } from '../../components';
import axios from 'axios';

const DeleteProduct = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/fetch/');
      
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch products' });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ type: 'error', text: 'Failed to fetch products' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(product => product.id));
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one product to delete' });
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedProducts.length} product(s)? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);
      
      const response = await axios.delete('http://localhost:5000/api/products/bulk-delete', {
        data: { productIds: selectedProducts },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: `Successfully deleted ${selectedProducts.length} product(s)` 
        });
        
        // Remove deleted products from the list
        setProducts(prev => prev.filter(product => !selectedProducts.includes(product.id)));
        setSelectedProducts([]);
        setSelectAll(false);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to delete products' });
      }
    } catch (error) {
      console.error('Error deleting products:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete products' 
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mx-auto px-4 max-w-7xl my-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Delete Products</h2>
            <div className="flex gap-4">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {selectAll ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedProducts.length === 0 || deleting}
                className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                  selectedProducts.length === 0 || deleting
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {deleting ? 'Deleting...' : `Delete Selected (${selectedProducts.length})`}
              </button>
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Image</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Name</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Category</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Price</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Stock</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Discount</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr 
                      key={product.id} 
                      className={`hover:bg-gray-50 ${
                        selectedProducts.includes(product.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="border border-gray-300 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <img
                          src={product.image || 'https://via.placeholder.com/60'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-3 font-medium">
                        {product.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {product.category || 'N/A'}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        ₹{product.price}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {product.stock}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {product.discount ? `${product.discount}%` : '0%'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          {products.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Total Products: <span className="font-semibold">{products.length}</span> | 
                Selected: <span className="font-semibold text-indigo-600">{selectedProducts.length}</span>
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DeleteProduct;
