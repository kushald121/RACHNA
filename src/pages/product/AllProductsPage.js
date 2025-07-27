import React, { useState, useEffect } from "react";
import { NavBar, Footer } from "../../components";
import { FaStar, FaHeart } from "react-icons/fa";
import { FiFilter, FiX, FiHeart, FiEye, FiShoppingCart } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";

const INR_CONVERSION_RATE = 83.5;

// --- MAIN PRODUCTS PAGE COMPONENT ---
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    brands: [], // Note: You might want to replace 'brands' with 'gender' from your DB
    maxPrice: 150,
    sortBy: "relevance",
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from PostgreSQL
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:5000/api/products");
        // Transform the data to match your frontend structure
        const transformedProducts = response.data.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          originalPrice: product.discount ? 
            product.price / (1 - product.discount / 100) : 
            null,
          category: product.category,
          gender: product.gender, // Using gender instead of brand
          image: product.media_url || 'https://via.placeholder.com/300', // Default image if none
          rating: 4.5, // You might want to add ratings to your DB
          stock: product.stock
        }));
        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
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
    
    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }
    
    // Gender filter (replacing brand filter)
    if (filters.brands.length > 0) {
      filtered = filtered.filter(p => filters.brands.includes(p.gender));
    }
    
    // Price filter
    filtered = filtered.filter(p => p.price <= filters.maxPrice);
    
    // Sorting
    switch (filters.sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating-desc":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Default sorting (by ID or whatever you prefer)
        filtered.sort((a, b) => a.id - b.id);
        break;
    }
    
    setFilteredProducts(filtered);
  }, [filters, products]);

  const toggleWishlist = (productId) => {
    setWishlistedIds((prevIds) => {
      const newIds = new Set(prevIds);
      if (newIds.has(productId)) newIds.delete(productId);
      else newIds.add(productId);
      return newIds;
    });
  };

  const removeFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value),
    }));
  };

  // Get unique categories from products
  const uniqueCategories = [...new Set(products.map(p => p.category))];
  // Using gender as "brands" for filtering
  const uniqueGenders = [...new Set(products.map(p => p.gender))];

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
            uniqueBrands={uniqueGenders} // Passing genders as "brands"
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
};

// --- HERO BANNER (unchanged) ---
function HeroBanner() {
  return (
    <section className="relative w-full h-[550px] mb-14 rounded-3xl overflow-hidden border border-zinc-200/80 shadow-2xl">
      {/* ... existing hero banner code ... */}
    </section>
  );
}

// --- MODIFIED FILTERS SIDEBAR ---
function FiltersSidebar({ isOpen, onClose, filters, setFilters, uniqueCategories, uniqueBrands }) {
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
      <h4 className="font-semibold text-zinc-800 mb-4 tracking-wide uppercase text-xs text-zinc-500">{title}</h4>
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
        <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">Filters</h3>
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
          title="Gender"
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

// --- PRODUCT CARD (unchanged) ---
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
      {/* Wishlist Button */}
      <button
        aria-label="Toggle Wishlist"
        onClick={() => onToggleWishlist(product.id)}
        className={`absolute top-80 right-6 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-xl border-2 border-zinc-200 
                   transform -translate-y-1/2 transition-all duration-300 ease-in-out
                   group-hover:scale-110 group-hover:-translate-y-[60%]
                   ${isWishlisted ? "text-rose-500" : "text-zinc-500 hover:text-rose-500"}`}
      >
        {isWishlisted ? <FaHeart size={22} /> : <FiHeart size={22} />}
      </button>

      {/* Image Area */}
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

// --- PAGE HEADER (unchanged) ---
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

// --- ACTIVE FILTERS (unchanged) ---
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

export default ProductsPage;