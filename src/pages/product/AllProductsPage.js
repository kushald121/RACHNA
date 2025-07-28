import React, { useState, useEffect } from "react";
import { NavBar, Footer } from "../../components"; // Assuming these are styled separately
import { FaStar, FaHeart } from "react-icons/fa";
import { FiFilter, FiX, FiHeart, FiEye, FiShoppingCart } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// --- 1. MOCK DATA (Cleaned) ---
const mockProducts = [
  {
    id: 1,
    name: "Classic Cotton T-Shirt",
    price: 19.99,
    originalPrice: 24.99,
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80",
    category: "Apparel",
    brand: "UrbanThreads",
  },
  {
    id: 2,
    name: "Slim-Fit Blue Jeans",
    price: 39.99,
    originalPrice: 59.99,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
    category: "Apparel",
    brand: "DenimCo",
  },
  {
    id: 3,
    name: "AirMax Running Sneakers",
    price: 59.99,
    originalPrice: 89.99,
    rating: 4.1,
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80",
    category: "Footwear",
    brand: "Nike",
  },
  {
    id: 4,
    name: "Vintage Leather Jacket",
    price: 99.99,
    originalPrice: 149.99,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1600180758890-6c4ce59ffe20?auto=format&fit=crop&w=400&q=80",
    category: "Apparel",
    brand: "RetroWear",
  },
  {
    id: 5,
    name: "Suede Casual Loafers",
    price: 45.5,
    rating: 4.2,
    image:
      "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
    category: "Footwear",
    brand: "UrbanThreads",
  },
  {
    id: 6,
    name: "Tech Fleece Hoodie",
    price: 35.0,
    originalPrice: 49.99,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1556157053-2d6bde0a133c?auto=format&fit=crop&w=400&q=80",
    category: "Apparel",
    brand: "Nike",
  },
  {
    id: 7,
    name: "High-Top Dunks",
    price: 85.0,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcdda9?auto=format&fit=crop&w=400&q=80",
    category: "Footwear",
    brand: "Nike",
  },
  {
    id: 8,
    name: "Classic Denim Shorts",
    price: 25.99,
    originalPrice: 35.99,
    rating: 4.0,
    image:
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=400&q=80",
    category: "Apparel",
    brand: "DenimCo",
  },
  {
    id: 9,
    name: "Graphic Print Tee",
    price: 22.99,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    category: "Apparel",
    brand: "UrbanThreads",
  },
  {
    id: 10,
    name: "Leather Chelsea Boots",
    price: 75.0,
    originalPrice: 99.99,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    category: "Footwear",
    brand: "RetroWear",
  },
  {
    id: 11,
    name: "Oversized Sweatshirt",
    price: 29.99,
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80",
    category: "Apparel",
    brand: "Nike",
  },
  {
    id: 12,
    name: "Canvas Sneakers",
    price: 49.99,
    originalPrice: 69.99,
    rating: 4.2,
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    category: "Footwear",
    brand: "DenimCo",
  },
  {
    id: 13,
    name: "Striped Polo Shirt",
    price: 27.99,
    rating: 4.1,
    image:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
    category: "Apparel",
    brand: "UrbanThreads",
  },
  {
    id: 14,
    name: "Chunky White Sneakers",
    price: 65.0,
    originalPrice: 79.99,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
    category: "Footwear",
    brand: "Nike",
  },
  {
    id: 15,
    name: "Distressed Denim Jacket",
    price: 89.99,
    originalPrice: 129.99,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
    category: "Apparel",
    brand: "DenimCo",
  },
  {
    id: 16,
    name: "Slip-On Sandals",
    price: 19.99,
    rating: 4.0,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    category: "Footwear",
    brand: "RetroWear",
  },
  {
    id: 17,
    name: "Basic Black Tee",
    price: 15.99,
    rating: 4.2,
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    category: "Apparel",
    brand: "UrbanThreads",
  },
  {
    id: 18,
    name: "Running Shorts",
    price: 18.99,
    rating: 4.1,
    image:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
    category: "Apparel",
    brand: "Nike",
  },
  {
    id: 19,
    name: "Retro Sneakers",
    price: 55.0,
    originalPrice: 69.99,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    category: "Footwear",
    brand: "RetroWear",
  },
  {
    id: 20,
    name: "Faded Blue Jeans",
    price: 42.99,
    originalPrice: 59.99,
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1600181953606-3110b0f2a26e?auto=format&fit=crop&w=400&q=80",
    category: "Apparel",
    brand: "DenimCo",
  },
  {
    id: 21,
    name: "Logo Hoodie",
    price: 32.99,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1556157053-2d6bde0a133c?auto=format&fit=crop&w=400&q=80",
    category: "Apparel",
    brand: "Nike",
  },
  {
    id: 22,
    name: "Minimalist Trainers",
    price: 59.99,
    originalPrice: 79.99,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    category: "Footwear",
    brand: "DenimCo",
  },
  {
    id: 23,
    name: "Printed Summer Shirt",
    price: 24.99,
    rating: 4.2,
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80",
    category: "Apparel",
    brand: "RetroWear",
  },
  {
    id: 24,
    name: "Classic White Sneakers",
    price: 49.99,
    originalPrice: 69.99,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80",
    category: "Footwear",
    brand: "Nike",
  },
  {
    id: 25,
    name: "Relaxed Fit Joggers",
    price: 29.99,
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
    category: "Apparel",
    brand: "DenimCo",
  },
];
const uniqueCategories = [...new Set(mockProducts.map((p) => p.category))];
const uniqueBrands = [...new Set(mockProducts.map((p) => p.brand))];
const INR_CONVERSION_RATE = 83.5;

// --- 2. MODERN HERO BANNER ---
function HeroBanner() {
  return (
    <section className="relative w-full h-[550px] mb-14 rounded-3xl overflow-hidden border border-zinc-200/80 shadow-2xl">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"
          alt="Shop Banner"
          className="w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-zinc-900/40" />
      </div>
      {/* Decorative Gradient Circles */}
      <div className="absolute -top-20 -left-32 w-96 h-96 bg-gradient-to-br from-rose-400/40 via-rose-200/20 to-transparent rounded-full blur-3xl z-1 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tr from-indigo-400/40 via-indigo-200/20 to-transparent rounded-full blur-2xl z-1 pointer-events-none" />
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center py-20 px-4">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-2xl tracking-tight"
        >
          Curated Collections for Every Style
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl md:text-2xl text-white/90 mb-10 font-medium max-w-2xl mx-auto drop-shadow-lg"
        >
          Discover trending looks, timeless classics, and exclusive drops. Shop
          the best in fashion, footwear, and accessories—all handpicked for you.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.button
            whileHover={{ scale: 1.09, backgroundColor: "#18181b" }}
            whileTap={{ scale: 0.97 }}
            className="px-12 py-4 rounded-full bg-gradient-to-r from-rose-500 via-indigo-500 to-zinc-900 text-white text-xl font-bold shadow-2xl hover:from-zinc-900 hover:to-rose-500 transition-colors flex items-center gap-3 border-2 border-white/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-rose-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <Link to="/"> Explore Now</Link>
          </motion.button>
        </motion.div>
        {/* Featured badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-5">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 text-zinc-900 font-semibold text-base shadow-lg border border-zinc-200">
            <FaStar className="text-yellow-400" /> Top Rated
          </span>
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 text-zinc-900 font-semibold text-base shadow-lg border border-zinc-200">
            <FiShoppingCart className="text-rose-400" /> Fast Delivery
          </span>
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 text-zinc-900 font-semibold text-base shadow-lg border border-zinc-200">
            <FiHeart className="text-indigo-400" /> Trending Now
          </span>
        </div>
      </div>
    </section>
  );
}

// --- 3. MODERN FILTERS SIDEBAR ---
function FiltersSidebar({ isOpen, onClose, filters, setFilters }) {
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
      brands: [],
      maxPrice: 150,
      sortBy: "relevance",
    });

  const FilterSection = ({ title, items, selectedItems, onChange }) => (
    <div className="py-5 border-b border-zinc-200">
      <h4 className="font-semibold  mb-4 tracking-wide uppercase text-xs text-zinc-500">
        {title}
      </h4>
      <div className="space-y-3">
        {items.map((item) => (
          <label key={item} className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              onChange={() => onChange(item)}
              checked={selectedItems.includes(item)}
              className="h-4 w-4 rounded border-zinc-400 text-zinc-800 focus:ring-zinc-700 accent-indigo-500"
            />
            <span className="ml-3 text-sm text-zinc-600 group-hover:text-zinc-900 transition-colors">
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="p-7 h-full overflow-y-auto">
      <div className="flex justify-between items-center pb-4 mb-2 border-b border-zinc-200">
        <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Filters
        </h3>
        <button
          onClick={onClose}
          className="lg:hidden text-zinc-500 hover:text-zinc-800"
        >
          <FiX size={24} />
        </button>
      </div>
      <div className="space-y-1 divide-y divide-zinc-200">
        <FilterSection
          title="Category"
          items={uniqueCategories}
          selectedItems={filters.categories}
          onChange={(v) => handleFilterChange("categories", v)}
        />
        <FilterSection
          title="Brand"
          items={uniqueBrands}
          selectedItems={filters.brands}
          onChange={(v) => handleFilterChange("brands", v)}
        />
        <div className="py-5">
          <label htmlFor="price" className="font-semibold text-zinc-800">
            Max Price
          </label>
          <input
            type="range"
            id="price"
            min="0"
            max="150"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((p) => ({ ...p, maxPrice: Number(e.target.value) }))
            }
            className="w-full mt-4 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="text-center text-zinc-600 mt-2 text-sm">
            Up to ₹
            {(filters.maxPrice * INR_CONVERSION_RATE).toLocaleString("en-IN")}
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

// --- 4. MODERN PRODUCT CARD ---
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function ProductCard({ product, isWishlisted, onToggleWishlist }) {
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

  return (
    <motion.div
      variants={cardVariants}
      layout
      className="bg-white rounded-3xl flex flex-col overflow-hidden group relative border border-zinc-200/80 shadow-lg shadow-zinc-200/40 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-200/40"
    >
      {/* --- Wishlist Button (MOVED HERE and RESTYLED) --- */}
      <button
        aria-label="Toggle Wishlist"
        onClick={() => onToggleWishlist(product.id)}
        className={`absolute top-80 right-6 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-xl border-2 border-zinc-200 
                           transform -translate-y-1/2 transition-all duration-300 ease-in-out
                           group-hover:scale-110 group-hover:-translate-y-[60%]
                           ${
                             isWishlisted
                               ? "text-rose-500"
                               : "text-zinc-500 hover:text-rose-500"
                           }`}
      >
        {isWishlisted ? <FaHeart size={22} /> : <FiHeart size={22} />}
      </button>

      {/* --- Image Area --- */}
      <div className="relative w-full h-80 overflow-hidden bg-zinc-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 via-indigo-500 to-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            {discount}% OFF
          </span>
        )}

        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="flex items-center gap-2 text-white font-semibold py-2 px-4 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
            <FiEye size={18} />
            <span className="text-sm">Quick View</span>
          </button>
        </div>
      </div>

      {/* --- Details & Call-to-Action Area --- */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
            {product.brand}
          </p>
          <h3 className="font-semibold text-zinc-800 text-lg leading-tight mb-3">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-2xl font-bold text-zinc-900">
              {formatCurrency(product.price * INR_CONVERSION_RATE)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-zinc-400 line-through">
                {formatCurrency(product.originalPrice * INR_CONVERSION_RATE)}
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-7 py-3 rounded-lg font-bold text-base bg-gradient-to-r from-rose-500 via-indigo-500 to-zinc-900 text-white hover:from-zinc-900 hover:to-rose-500 transition-colors duration-200 shadow-lg"
        >
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
}

// --- 5. PAGE HEADER & ACTIVE FILTERS (Modernized) ---
function PageHeader({ productCount, filters, setFilters }) {
  return (
    <div className="mb-10">
      <nav className="text-sm text-zinc-500 mb-4">
        Home / <span className="font-medium text-zinc-800">Shop</span>
      </nav>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-5xl font-extrabold text-zinc-900 tracking-tight">
            All Products
          </h1>
          <p className="text-zinc-600 mt-1">
            <span className="font-semibold text-zinc-800">{productCount}</span>{" "}
            products found
          </p>
        </div>
        <select
          onChange={(e) =>
            setFilters((p) => ({ ...p, sortBy: e.target.value }))
          }
          value={filters.sortBy}
          className="w-full md:w-52 p-3 border border-zinc-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-base text-zinc-700 bg-white shadow-sm"
        >
          <option value="relevance">Relevance</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Highest Rated</option>
        </select>
      </div>
    </div>
  );
}
function ActiveFilters({ filters, onRemove }) {
  const activeFilters = [
    ...filters.categories.map((c) => ({ type: "categories", value: c })),
    ...filters.brands.map((b) => ({ type: "brands", value: b })),
  ];
  if (activeFilters.length === 0) return null;
  return (
    <div className="flex items-center flex-wrap gap-2 mb-7 pb-7 border-b border-zinc-200">
      <span className="text-sm font-medium text-zinc-600">Active:</span>
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
  );
}

// --- 6. MAIN PAGE (State management is unchanged) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

function AllProductsPage() {
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    maxPrice: 150,
    sortBy: "relevance",
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());

  const toggleWishlist = (productId) => {
    setWishlistedIds((prevIds) => {
      const newIds = new Set(prevIds);
      if (newIds.has(productId)) newIds.delete(productId);
      else newIds.add(productId);
      return newIds;
    });
  };

  useEffect(() => {
    let products = [...mockProducts];
    if (filters.categories.length > 0)
      products = products.filter((p) =>
        filters.categories.includes(p.category)
      );
    if (filters.brands.length > 0)
      products = products.filter((p) => filters.brands.includes(p.brand));
    products = products.filter((p) => p.price <= filters.maxPrice);
    switch (filters.sortBy) {
      case "price-asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "rating-desc":
        products.sort((a, b) => b.rating - a.rating);
        break;
      default:
        products.sort((a, b) => a.id - b.id);
        break;
    }
    setFilteredProducts(products);
  }, [filters]);

  const removeFilter = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item !== value),
    }));
  };

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
              className="lg:hidden flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-rose-100 via-indigo-100 to-zinc-100 border border-zinc-300 rounded-lg shadow text-base font-medium text-zinc-700 hover:bg-white transition-colors w-full mb-7"
            >
              <FiFilter size={18} /> Show Filters
            </button>
            <AnimatePresence mode="wait">
              {filteredProducts.length > 0 ? (
                <motion.div
                  key="product-grid"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  layout
                  className="grid gap-8 md:gap-10 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={wishlistedIds.has(product.id)}
                      onToggleWishlist={toggleWishlist}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="no-products"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="flex flex-col items-center justify-center h-96 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200 text-center p-8"
                >
                  <div className="p-5 bg-white rounded-full mb-4 shadow-md">
                    <FiX size={40} className="text-zinc-500" />
                  </div>
                  <p className="text-2xl font-semibold text-zinc-800">
                    No Products Found
                  </p>
                  <p className="text-zinc-500 mt-2 max-w-sm text-base">
                    Your search and filter combination yielded no results. Try
                    clearing some filters!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AllProductsPage;
