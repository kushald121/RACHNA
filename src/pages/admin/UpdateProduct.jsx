import React, { useState, useEffect } from 'react';
import { NavBar, Footer } from '../../components';
import { PencilSquareIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UpdateProduct = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <NavBar />
      <div className="container mx-auto px-4 max-w-7xl my-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Update Products</h2>
          
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search products to update..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 hover:shadow-md">
                <img
                  src={product.media_url || 'https://via.placeholder.com/200'}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded mb-3"
                />
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2">₹{product.price}</p>
                <Link
                  to={`/Rachna/admin/update-product/${product.id}`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 w-fit"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  Update
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UpdateProduct;
