import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { addToCart, addToFavorites, removeFromFavorites } from '../../../utils/cartUtils';
import { useAuth } from '../../../contexts/AuthContext';
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());
  
  const { user, getCurrentSessionId, getSessionType, getAuthHeaders } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/fetch/');
      
      if (response.data.success) {
        // Get first 8 products for featured section
        const featuredProducts = response.data.products.slice(0, 8).map(product => {
          const currentPrice = parseFloat(product.price);
          const discountValue = parseFloat(product.discount) || 0;
          
          return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: currentPrice,
            currentPrice: currentPrice,
            originalPrice: discountValue > 0 ? 
              currentPrice / (1 - discountValue / 100) : 
              null,
            category: product.category,
            image: product.image ? 
              (product.image.startsWith('http') ? 
                product.image : 
                `http://localhost:5000/public${product.image}`) : 
              'https://via.placeholder.com/300',
            rating: 4.5,
            stock: product.stock,
            sizes: product.sizes
          };
        });
        
        setProducts(featuredProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const authContext = { getCurrentSessionId, getSessionType, getAuthHeaders };
      const result = await addToCart(productId, 1, authContext);
      
      if (result.success) {
        // Refresh navbar counts
        if (window.refreshNavbarCounts) {
          window.refreshNavbarCounts();
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleToggleFavorite = async (productId) => {
    try {
      const authContext = { getCurrentSessionId, getSessionType, getAuthHeaders };
      const isCurrentlyFavorite = wishlistedIds.has(productId);

      if (isCurrentlyFavorite) {
        const result = await removeFromFavorites(productId, authContext);
        if (result.success) {
          setWishlistedIds((prevIds) => {
            const newIds = new Set(prevIds);
            newIds.delete(productId);
            return newIds;
          });
          // Refresh navbar counts
          if (window.refreshNavbarCounts) {
            window.refreshNavbarCounts();
          }
        }
      } else {
        const result = await addToFavorites(productId, authContext);
        if (result.success) {
          setWishlistedIds((prevIds) => {
            const newIds = new Set(prevIds);
            newIds.add(productId);
            return newIds;
          });
          // Refresh navbar counts
          if (window.refreshNavbarCounts) {
            window.refreshNavbarCounts();
          }
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading featured products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Featured Products
          </motion.h2>
          <motion.p 
            className="mt-4 text-lg text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Discover our handpicked selection of premium clothing
          </motion.p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Product Image */}
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleFavorite(product.id)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    >
                      {wishlistedIds.has(product.id) ? (
                        <HeartIconSolid className="w-5 h-5 text-red-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    >
                      <ShoppingCartIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                    <Link to={`/luna-demo/product/${product.id}`}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </Link>
                  </h3>
                </div>
                
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toFixed(0)}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <svg
                          key={rating}
                          className={`h-4 w-4 ${
                            product.rating > rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1 text-xs text-gray-500">({product.rating})</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Products Button */}
        <div className="text-center mt-12">
          <Link
            to="/luna-demo/all-products/"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
          >
            View All Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
