import React, { useState, useEffect, useRef } from "react";
import { FaStar, FaHeart } from "react-icons/fa";
import { FiFilter, FiX, FiHeart, FiEye, FiShoppingCart } from "react-icons/fi";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { addToCart, addToFavorites, removeFromFavorites, isInFavorites } from "../../utils/cartUtils";
import axios from "axios";

const ProductsContent = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    categories: [],
    maxPrice: 5000,
  });
  const [wishlistedIds, setWishlistedIds] = useState(new Set());
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const { user, getCurrentSessionId, getSessionType, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user) {
      fetchWishlistedProducts();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);

      const response = await axios.get("http://localhost:5000/api/fetch/");

      if (!response.data.success || !response.data.products || response.data.products.length === 0) {
        setProducts([]);
        setFilteredProducts([]);
        return;
      }
      
      // Transform the data
      const transformedProducts = response.data.products.map(product => {
        const discountValue = parseFloat(product.discount);
        const currentPrice = parseFloat(product.price);
        
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: currentPrice, // This is the actual selling price (already discounted)
          currentPrice: currentPrice,
          originalPrice: discountValue > 0 ? 
            currentPrice / (1 - discountValue / 100) : 
            null,
          category: product.category,
          gender: product.gender,
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

      setProducts(transformedProducts);
      setFilteredProducts(transformedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWishlistedProducts = async () => {
    try {
      const authContext = { getCurrentSessionId, getSessionType, getAuthHeaders };
      const result = await isInFavorites(null, authContext);
      
      if (result.success && result.favorites) {
        const wishlistedSet = new Set(result.favorites.map(fav => fav.productId || fav.product_id));
        setWishlistedIds(wishlistedSet);
      }
    } catch (error) {
      console.error('Error fetching wishlisted products:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Filter by categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        filters.categories.some(category =>
          product.category?.toLowerCase().includes(category.toLowerCase())
        )
      );
    }

    // Filter by price
    filtered = filtered.filter(product => product.price <= filters.maxPrice);

    setFilteredProducts(filtered);
  };

  const toggleCategory = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      maxPrice: 5000,
    });
  };

  const toggleWishlist = async (productId) => {
    try {
      const authContext = { getCurrentSessionId, getSessionType, getAuthHeaders };
      const isCurrentlyWishlisted = wishlistedIds.has(productId);

      if (isCurrentlyWishlisted) {
        const result = await removeFromFavorites(productId, authContext);
        if (result.success) {
          setWishlistedIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
          // Refresh navbar counts
          if (window.refreshNavbarCounts) {
            window.refreshNavbarCounts();
          }
        }
      } else {
        const result = await addToFavorites(productId, authContext);
        if (result.success) {
          setWishlistedIds(prev => {
            const newSet = new Set(prev);
            newSet.add(productId);
            return newSet;
          });
          // Refresh navbar counts
          if (window.refreshNavbarCounts) {
            window.refreshNavbarCounts();
          }
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const removeFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value),
    }));
  };

  // Get all unique categories from products
  const allCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

  // Define preferred categories, but also include any other categories found
  const preferredCategories = ['T-shirt', 'Jacket', 'Hoodies'];
  const uniqueCategories = [
    ...preferredCategories.filter(cat =>
      allCategories.some(prodCat => prodCat.toLowerCase().includes(cat.toLowerCase()))
    ),
    ...allCategories.filter(cat =>
      !preferredCategories.some(prefCat => cat.toLowerCase().includes(prefCat.toLowerCase()))
    )
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-zinc-50 via-white to-indigo-50 min-h-screen font-['Inter',_sans-serif]">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              uniqueCategories={uniqueCategories}
              toggleCategory={toggleCategory}
              clearFilters={clearFilters}
            />
          </aside>

          {/* Products Section */}
          <section className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <FiFilter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                {(filters.categories.length > 0) && (
                  <span className="bg-indigo-500 text-white text-xs rounded-full px-2 py-0.5">
                    {filters.categories.length}
                  </span>
                )}
              </button>
            </div>

            {/* Active Filters */}
            <ActiveFilters filters={filters} onRemove={removeFilter} />

            {/* Products Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlistedIds.has(product.id)}
                  onToggleWishlist={toggleWishlist}
                  authContext={{ getCurrentSessionId, getSessionType, getAuthHeaders }}
                />
              ))}
            </motion.div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Mobile Filter Modal */}
      <MobileFilterModal
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        uniqueCategories={uniqueCategories}
        toggleCategory={toggleCategory}
        clearFilters={clearFilters}
      />
    </div>
  );
};

// Hero Banner Component
function HeroBanner() {
  return (
    <section className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-4"
        >
          Discover Your Style
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl mb-8 opacity-90"
        >
          Premium clothing for every occasion
        </motion.p>
      </div>
    </section>
  );
}

// Filter Sidebar Component
function FilterSidebar({ filters, setFilters, uniqueCategories, toggleCategory, clearFilters }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters</h3>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
        <div className="space-y-2">
          {uniqueCategories.map(category => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-600">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Max Price</h4>
        <input
          type="range"
          min="100"
          max="5000"
          step="100"
          value={filters.maxPrice}
          onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
          className="w-full"
        />
        <div className="text-center text-gray-600 mt-2 text-sm">
          Up to ₹{filters.maxPrice.toLocaleString("en-IN")}
        </div>
      </div>

      <button
        onClick={clearFilters}
        className="w-full py-2 px-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
}

// Mobile Filter Modal Component
function MobileFilterModal({ isOpen, onClose, filters, setFilters, uniqueCategories, toggleCategory, clearFilters }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-white z-40 lg:hidden overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                uniqueCategories={uniqueCategories}
                toggleCategory={toggleCategory}
                clearFilters={clearFilters}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Active Filters Component
function ActiveFilters({ filters, onRemove }) {
  const activeFilters = [
    ...filters.categories.map((c) => ({ type: "categories", value: c })),
  ];
  if (activeFilters.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700 mr-2">Active Filters:</span>
        {activeFilters.map(({ type, value }) => (
          <motion.div
            key={value}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
              {value}
              <button
                onClick={() => onRemove(type, value)}
                className="group -mr-1 h-3.5 w-3.5 rounded-full hover:bg-indigo-200"
              >
                <FiX className="h-3.5 w-3.5 text-indigo-600 group-hover:text-indigo-800" />
              </button>
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product, isWishlisted, onToggleWishlist, authContext }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, {
    once: true,
    margin: "-100px 0px -100px 0px"
  });

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddToCart = async () => {
    try {
      const result = await addToCart(product.id, 1, authContext);
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

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {discount}% OFF
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onToggleWishlist(product.id)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            {isWishlisted ? (
              <FaHeart className="w-4 h-4 text-red-500" />
            ) : (
              <FiHeart className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => navigate(`/luna-demo/product/${product.id}`)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            <FiEye className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Quick Add to Cart */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <FiShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Details & Call-to-Action Area */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
            {product.gender}
          </p>
          <h3 className="font-semibold text-zinc-800 text-lg leading-tight mb-3">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-2xl font-bold text-zinc-900">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-zinc-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-4">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(product.rating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-sm text-gray-500 ml-1">({product.rating})</span>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductsContent;
