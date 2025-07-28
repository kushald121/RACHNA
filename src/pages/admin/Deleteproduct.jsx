import React, { useState, useEffect } from 'react';
import { NavBar, Footer } from '../../components';
import { TrashIcon, EyeIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

const DeleteProduct = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteMessage, setDeleteMessage] = useState({ type: '', text: '' });

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${productId}`);
        setProducts(products.filter(p => p.id !== productId));
        setDeleteMessage({ type: 'success', text: 'Product deleted successfully!' });
      } catch (error) {
        setDeleteMessage({ type: 'error', text: 'Failed to delete product' });
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <NavBar />
      <div className="container mx-auto px-4 max-w-7xl my-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Delete Products</h2>
          
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Image</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Category</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Price</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Stock</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img
                        src={product.media_url || 'https://via.placeholder.com/60'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3">₹{product.price}</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {deleteMessage.text && (
            <div className={`mt-4 p-3 rounded-lg ${
              deleteMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {deleteMessage.text}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DeleteProduct;
