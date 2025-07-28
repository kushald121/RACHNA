import React, { useState, useEffect, useRef } from "react";
import { NavBar, Footer } from "../../components";
import { FaStar, FaHeart } from "react-icons/fa";
import { FiFilter, FiX, FiHeart, FiEye, FiShoppingCart } from "react-icons/fi";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { addToCart, addToFavorites, removeFromFavorites, isInFavorites } from "../../utils/cartUtils";
import axios from "axios";


// --- MAIN PRODUCTS PAGE COMPONENT ---
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    maxPrice: 2000,
    sortBy: "relevance",
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getCurrentSessionId, getSessionType, getAuthHeaders } = useAuth();

  // Fetch products from PostgreSQL
  useEffect(() => {
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
            currentPrice: currentPrice, // Add this for filtering
            originalPrice: discountValue > 0 ?
              currentPrice / (1 - discountValue / 100) :
              null, // Calculate what the original price was before discount
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

        // Remove duplicates (same product with multiple images - keep first one)
        const uniqueProducts = transformedProducts.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        );

        setProducts(uniqueProducts);
        setFilteredProducts(uniqueProducts);
      } catch (error) {
        setError(`Failed to load products: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    if (products.length === 0) return;

    let filtered = [...products];

    // Filter by categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.category) return false;
        return filters.categories.some(selectedCategory =>
          product.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          selectedCategory.toLowerCase().includes(product.category.toLowerCase())
        );
      });
    }

    // Filter by price
    filtered = filtered.filter(product => product.currentPrice <= filters.maxPrice);

    // Sort products
    switch (filters.sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case "price-high":
        filtered.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // relevance
        // Keep original order
        break;
    }

    setFilteredProducts(filtered);
  }, [products, filters]);

  const toggleWishlist = async (productId) => {
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
      <NavBar />
      <main className="container mx-auto py-10 md:py-16 px-4 sm:px-8">
        <HeroBanner />
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <FiltersSidebar
            isOpen={isFilterOpen}
            onClose={() => setFilterOpen(false)}
            filters={filters}
            setFilters={setFilters}
            uniqueCategories={uniqueCategories}
          />
          <section className="w-full">
            <PageHeader
              productCount={filteredProducts.length}
              filters={filters}
              setFilters={setFilters}
            />
            <ActiveFilters filters={filters} onRemove={removeFilter} />
            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm text-base font-medium text-blue-700 hover:bg-blue-100 transition-all duration-200 w-full mb-7"
            >
              <FiFilter size={18} /> Show Filters
            </button>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  custom={index}
                  variants={{
                    hidden: { opacity: 0, y: 50, scale: 0.9 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        delay: index * 0.1,
                        duration: 0.6,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }
                    }
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  <ProductCard
                    product={product}
                    isWishlisted={wishlistedIds.has(product.id)}
                    onToggleWishlist={() => toggleWishlist(product.id)}
                    authContext={{ getCurrentSessionId, getSessionType, getAuthHeaders }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// --- HERO BANNER (unchanged) ---
function HeroBanner() {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
        All Products
      </h1>
      <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
        Discover our complete collection of premium products
      </p>
    </div>
  );
}

// --- MODIFIED FILTERS SIDEBAR ---
function FiltersSidebar({ isOpen, onClose, filters, setFilters, uniqueCategories }) {
  const handleFilterChange = (type, value) =>
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((i) => i !== value)
        : [...prev[type], value],
    }));

  const clearFilters = () =>
    setFilters({
      categories: [],
      maxPrice: 2000,
      sortBy: "relevance",
    });

  const FilterSection = ({ title, items, selectedItems, onChange }) => (
    <div className="py-5 border-b border-gray-200">
      <h4 className="font-semibold text-gray-700 mb-4 tracking-wide uppercase text-xs">{title}</h4>
      <div className="space-y-3">
        {items.map((item) => (
          <label key={item} className="flex items-center cursor-pointer group hover:bg-gray-50 p-2 rounded transition-colors">
            <input
              type="checkbox"
              onChange={() => onChange(item)}
              checked={selectedItems.includes(item)}
              className="h-4 w-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500 accent-blue-500"
            />
            <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="p-7 h-full overflow-y-auto bg-white">
      <div className="flex justify-between items-center pb-4 mb-2 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Filters</h3>
        <button
          onClick={onClose}
          className="lg:hidden text-gray-500 hover:text-gray-800 transition-colors"
        >
          <FiX size={24} />
        </button>
      </div>
      <div className="space-y-1 divide-y divide-gray-200">
        <FilterSection
          title="Category"
          items={uniqueCategories}
          selectedItems={filters.categories}
          onChange={(v) => handleFilterChange("categories", v)}
        />
        <div className="py-5">
          <label htmlFor="price" className="font-semibold text-gray-800 mb-4 block">
            Max Price
          </label>
          <input
            type="range"
            id="price"
            min="0"
            max="2000"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((p) => ({ ...p, maxPrice: Number(e.target.value) }))
            }
            className="w-full mt-4 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="text-center text-gray-600 mt-2 text-sm">
            Up to ₹{filters.maxPrice.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="pt-6">
          <button
            onClick={clearFilters}
            className="w-full text-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-rose-500 via-indigo-500 to-zinc-900 hover:from-zinc-900 hover:to-rose-500 transition-colors shadow-lg"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
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
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ ease: "easeInOut", duration: 0.4 }}
              className="fixed top-0 left-0 w-80 h-full bg-white z-40 lg:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <aside className="hidden lg:block w-72 xl:w-80 rounded-3xl lg:sticky top-28 h-max border border-zinc-200/90 bg-white shadow-xl shadow-zinc-300/25">
        {sidebarContent}
      </aside>
    </>
  );
}

// --- PRODUCT CARD (unchanged) ---
// Enhanced animation variants for product cards
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.9,
    rotateX: -15,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    rotateY: 2,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const imageVariants = {
  hover: {
    scale: 1.1,
    rotate: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const overlayVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    y: -2,
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

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
        // Show success message or update cart count
        // Item added successfully
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
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover="hover"
      layout
      className="bg-white rounded-3xl flex flex-col overflow-hidden group relative border border-zinc-200/80 shadow-lg shadow-zinc-200/40 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-200/40"
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
    >
      {/* Wishlist Button */}
      <motion.button
        aria-label="Toggle Wishlist"
        onClick={() => onToggleWishlist(product.id)}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.9 }}
        className={`absolute top-80 right-6 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-xl border-2 border-zinc-200
                   transform -translate-y-1/2 transition-all duration-300 ease-in-out
                   group-hover:scale-110 group-hover:-translate-y-[60%] hover:shadow-2xl
                   ${isWishlisted ? "text-rose-500 border-rose-200 bg-rose-50" : "text-zinc-500 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50"}`}
      >
        <motion.div
          animate={isWishlisted ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isWishlisted ? <FaHeart size={22} /> : <FiHeart size={22} />}
        </motion.div>
      </motion.button>

      {/* Image Area */}
      <motion.div
        className="relative w-full h-80 overflow-hidden bg-zinc-100 cursor-pointer"
        onClick={() => navigate(`/luna-demo/product/${product.id}`)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          variants={imageVariants}
          whileHover="hover"
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
        
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 via-indigo-500 to-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            {discount}% OFF
          </span>
        )}

        <motion.div
          className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          variants={overlayVariants}
          initial="hidden"
          whileHover="visible"
        >
          <motion.button
            onClick={() => navigate(`/luna-demo/product/${product.id}`)}
            className="flex items-center gap-2 text-white font-semibold py-2 px-4 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FiEye size={18} />
            <span className="text-sm">View Product</span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Details & Call-to-Action Area */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
            {product.gender} {/* Changed from brand to gender */}
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
            {discount > 0 && (
              <span className="ml-2 text-[11px] font-bold tracking-wide text-white bg-gradient-to-r from-rose-500 via-indigo-500 to-zinc-900 px-2.5 py-1 rounded-full">
                Best Price
              </span>
            )}
          </div>
        </div>
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={handleAddToCart}
          className="w-full mt-7 py-3 rounded-xl font-bold text-base bg-gradient-to-r from-rose-500 via-indigo-500 to-zinc-900 text-white hover:from-zinc-900 hover:to-rose-500 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/25 flex items-center justify-center gap-2 relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-zinc-900 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ x: "-100%" }}
            whileHover={{ x: "0%" }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="relative z-10 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <FiShoppingCart size={18} />
            Add to Cart
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  );
}

// --- PAGE HEADER (unchanged) ---
function PageHeader({ productCount, filters, setFilters }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            All Products
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing {productCount} product{productCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            value={filters.sortBy}
            className="w-full md:w-52 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base text-gray-700 bg-white shadow-sm transition-colors"
          >
            <option value="relevance">Relevance</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// --- ACTIVE FILTERS (unchanged) ---
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
          <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-gradient-to-r from-rose-100 via-indigo-100 to-zinc-100 text-zinc-800 border border-zinc-200">
            {value}
            <button
              onClick={() => onRemove(type, value)}
              className="group -mr-1 h-3.5 w-3.5 rounded-full hover:bg-zinc-800/20"
            >
              <FiX className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-800" />
            </button>
          </span>
        </motion.div>
      ))}
      </div>
    </div>
  );
}

export default ProductsPage;
