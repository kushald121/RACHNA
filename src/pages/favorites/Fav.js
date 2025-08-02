import React, { useState, useEffect } from 'react';
import { Footer, NavBar } from '../../components';
import { motion } from 'framer-motion';
import { HeartIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { getFavorites, removeFromFavorites, addToCart } from '../../utils/cartUtils';
import { Link } from 'react-router-dom';

function Fav() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { getCurrentSessionId, getSessionType, getAuthHeaders } = useAuth();

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const authContext = { getCurrentSessionId, getSessionType, getAuthHeaders };
            const result = await getFavorites(authContext);

            if (result.success) {
                setFavorites(result.favorites);
            } else {
                setError('Failed to load favorites');
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
            setError('Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRemoveFromFavorites = async (productId) => {
        try {
            const authContext = { getCurrentSessionId, getSessionType, getAuthHeaders };
            const result = await removeFromFavorites(productId, authContext);

            if (result.success) {
                setFavorites(favorites.filter(item => item.productId !== productId));
            }
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            const authContext = { getCurrentSessionId, getSessionType, getAuthHeaders };
            const result = await addToCart(productId, 1, authContext);

            if (result.success) {
                // Show success message or update UI
                console.log('Added to cart successfully');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <HeartIconSolid className="h-8 w-8 text-rose-500" />
                            <h1 className="text-3xl font-bold text-gray-900">
                                My Wishlist ({favorites.length})
                            </h1>
                        </div>
                        <p className="text-gray-600">
                            Items you've saved for later
                        </p>
                    </motion.div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-500 text-lg">{error}</p>
                        </div>
                    ) : favorites.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="text-center py-20"
                        >
                            <HeartIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                                Your wishlist is empty
                            </h3>
                            <p className="text-gray-600 mb-8">
                                Start adding items you love to your wishlist
                            </p>
                            <Link
                                to="/Rachna/allproducts"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-rose-500 via-indigo-500 to-zinc-900 hover:from-zinc-900 hover:to-rose-500 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Continue Shopping
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            {favorites.map((item) => (
                                <motion.div
                                    key={item.productId}
                                    variants={itemVariants}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
                                >
                                    <div className="flex items-center gap-6">
                                        {/* Product Image */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-24 w-24 object-cover rounded-xl border border-gray-200"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                to={`/Rachna/product/${item.productId}`}
                                                className="block"
                                            >
                                                <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
                                                    {item.name}
                                                </h3>
                                            </Link>

                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {formatCurrency(item.price)}
                                                </span>
                                                {item.originalPrice && (
                                                    <>
                                                        <span className="text-lg text-gray-500 line-through">
                                                            {formatCurrency(item.originalPrice)}
                                                        </span>
                                                        <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                                            {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {item.stock > 0 ? (
                                                <span className="inline-flex items-center text-sm text-green-600 mt-1">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                    In Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-sm text-red-600 mt-1">
                                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                                    Out of Stock
                                                </span>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleAddToCart(item.productId)}
                                                disabled={item.stock === 0}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                                                    item.stock === 0
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-rose-500 via-indigo-500 to-zinc-900 text-white hover:from-zinc-900 hover:to-rose-500 shadow-lg hover:shadow-xl'
                                                }`}
                                            >
                                                <ShoppingBagIcon className="h-4 w-4" />
                                                Add to Cart
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleRemoveFromFavorites(item.productId)}
                                                className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors duration-200"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Fav;