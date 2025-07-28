import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition, Menu } from "@headlessui/react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
  HeartIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ShoppingCart from "../shopping-cart/ShoppingCart";
import { useAuth } from "../../contexts/AuthContext";
import { getCart, getFavorites } from "../../utils/cartUtils";

// Navigation configuration
const navigation = {
  pages: [
    { name: "COLLECTIONS", href: "/Rachna/allproducts/" },
    { name: "ABOUT US", href: "/Rachna/error/" },
    { name: "ADMIN", href: "/Rachna/admin-login/" },
  ],
};



const NavBar = () => {
  // State management
  const [open, setOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  // Auth context
  const { user, logout, getCurrentSessionId, getSessionType, getAuthHeaders } = useAuth();

  // Animation variants
  const textMotion = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
  };

  const containerMotion1 = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, ease: "easeInOut", staggerChildren: 0.1 },
    },
  };

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const authContext = { getCurrentSessionId, getSessionType, getAuthHeaders };
      const result = await getCart(authContext);

      if (result.success && result.cart.items) {
        const totalQuantity = result.cart.items.reduce((total, item) => {
          return total + (item.quantity || 0);
        }, 0);
        setCartCount(totalQuantity);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };

  // Fetch favorites count
  const fetchFavoritesCount = async () => {
    try {
      const authContext = { getCurrentSessionId, getSessionType, getAuthHeaders };
      const result = await getFavorites(authContext);

      if (result.success && result.favorites) {
        setFavoritesCount(result.favorites.length);
      }
    } catch (error) {
      console.error('Error fetching favorites count:', error);
    }
  };

  // Effects
  useEffect(() => {
    fetchCartCount();
    fetchFavoritesCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCartCount();
      fetchFavoritesCount();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Cart click handler
  const handleCartClick = () => {
    setIsCartOpen(!isCartOpen);
    fetchCartCount();
  };

  // Refresh function for global access
  const refreshCounts = () => {
    fetchCartCount();
    fetchFavoritesCount();
  };

  useEffect(() => {
    window.refreshNavbarCounts = refreshCounts;
    return () => {
      delete window.refreshNavbarCounts;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white">
      {/* MOBILE MENU */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl">
                <div className="flex items-center justify-between px-4 pb-2 pt-5">
                  <Link to="/Rachna/" onClick={() => setOpen(false)}>
                    <h1 className="h-8 w-auto font-bold font-amperserif text-[#E50010] text-xl">RACHNA</h1>
                  </Link>
                  <button
                    type="button"
                    className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
                    onClick={() => setOpen(false)}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Mobile Search Bar */}
                <div className="border-t border-gray-200 px-4 py-6">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for products, collections and more"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                  {navigation.pages.map((page) => (
                    <div key={page.name} className="flow-root">
                      <Link
                        to={page.href}
                        className="-m-2 block p-2 font-bold text-gray-900 hover:text-indigo-600 uppercase tracking-wide"
                        onClick={() => setOpen(false)}
                      >
                        {page.name}
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Mobile User Section */}
                <div className="border-t border-gray-200 px-4 py-6">
                  {/* Mobile Cart and Wishlist */}
                  <div className="flex items-center justify-around mb-6 pb-6 border-b border-gray-200">
                    <button
                      onClick={() => {
                        setOpen(false);
                        setIsCartOpen(true);
                      }}
                      className="flex flex-col items-center text-gray-700 hover:text-indigo-600 relative"
                    >
                      <ShoppingBagIcon className="h-6 w-6" />
                      <span className="text-xs font-bold uppercase mt-1">BAG</span>
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px]">
                          {cartCount > 99 ? '99+' : cartCount}
                        </span>
                      )}
                    </button>
                    <Link
                      to="/Rachna/favorites/"
                      onClick={() => setOpen(false)}
                      className="flex flex-col items-center text-gray-700 hover:text-indigo-600 relative"
                    >
                      <HeartIcon className="h-6 w-6" />
                      <span className="text-xs font-bold uppercase mt-1">WISHLIST</span>
                      {favoritesCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px]">
                          {favoritesCount > 99 ? '99+' : favoritesCount}
                        </span>
                      )}
                    </Link>
                  </div>

                  {user ? (
                    <div className="space-y-6">
                      <Link
                        to="/Rachna/orders"
                        className="-m-2 block p-2 font-medium text-gray-900 hover:text-indigo-600"
                        onClick={() => setOpen(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/Rachna/profile"
                        className="-m-2 block p-2 font-medium text-gray-900 hover:text-indigo-600"
                        onClick={() => setOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setOpen(false);
                        }}
                        className="-m-2 block p-2 font-medium text-gray-900 hover:text-indigo-600 text-left w-full"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <Link
                        to="/Rachna/user-login/"
                        className="-m-2 block p-2 font-medium text-gray-900 hover:text-indigo-600"
                        onClick={() => setOpen(false)}
                      >
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* DESKTOP MENU - MYNTRA STYLE */}
      <header className="relative bg-white shadow-sm">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="border-b border-gray-200"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerMotion1}
          >
            <div className="flex h-16 lg:h-20 items-center justify-between">
              {/* LEFT SECTION: Mobile Menu + Logo + Navigation */}
              <div className="flex items-center">
                {/* Mobile Menu Button */}
                <motion.button
                  variants={textMotion}
                  type="button"
                  className="rounded-md bg-white p-2 text-gray-400 hover:text-indigo-600 lg:hidden mr-2"
                  onClick={() => setOpen(true)}
                >
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                </motion.button>

                {/* Logo */}
                <motion.div className="flex" variants={textMotion}>
                  <Link to="/Rachna/">
                    <h1 className="h-8 w-auto font-bold font-amperserif text-[#E50010] text-2xl lg:text-3xl">RACHNA</h1>
                  </Link>
                </motion.div>

                {/* Desktop Navigation Links */}
                <div className="hidden lg:flex lg:ml-12 lg:space-x-8">
                  {navigation.pages.map((page) => (
                    <motion.div key={page.name} variants={textMotion}>
                      <Link
                        to={page.href}
                        className="text-sm font-bold text-gray-700 hover:text-indigo-600 transition-colors duration-200 uppercase tracking-wide"
                      >
                        {page.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CENTER SECTION: Search Bar */}
              <div className="flex-1 max-w-lg mx-4 lg:mx-8">
                <motion.div className="hidden lg:flex relative w-full" variants={textMotion}>
                  <div className="relative w-full">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for products, collections and more"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                </motion.div>
              </div>

              {/* RIGHT SECTION: India Flag + Profile + Wishlist + Bag */}
              <div className="flex items-center space-x-6">
                {/* India Flag */}
                <motion.div className="hidden lg:flex items-center" variants={textMotion}>
                  <span className="text-lg">🇮🇳</span>
                </motion.div>

                {/* Profile */}
                <motion.div className="flex flex-col items-center group cursor-pointer" variants={textMotion}>
                  {user ? (
                    <Menu as="div" className="relative">
                      {({ open }) => (
                        <>
                          <Menu.Button className="flex flex-col items-center text-gray-700 hover:text-indigo-600 transition-colors">
                            <UserIcon className="h-6 w-6" />
                            <span className="text-xs font-bold uppercase mt-1 hidden lg:block">PROFILE</span>
                          </Menu.Button>
                          <Transition
                            as={Fragment}
                            show={open}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to="/Rachna/orders"
                                    className={`${
                                      active ? 'bg-gray-100' : ''
                                    } block px-4 py-2 text-sm text-gray-700`}
                                  >
                                    My Orders
                                  </Link>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to="/Rachna/profile"
                                    className={`${
                                      active ? 'bg-gray-100' : ''
                                    } block px-4 py-2 text-sm text-gray-700`}
                                  >
                                    Profile Settings
                                  </Link>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={logout}
                                    className={`${
                                      active ? 'bg-gray-100' : ''
                                    } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                                  >
                                    Sign Out
                                  </button>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Transition>
                        </>
                      )}
                    </Menu>
                  ) : (
                    <Link to="/Rachna/user-login/" className="flex flex-col items-center text-gray-700 hover:text-indigo-600 transition-colors">
                      <UserIcon className="h-6 w-6" />
                      <span className="text-xs font-bold uppercase mt-1 hidden lg:block">PROFILE</span>
                    </Link>
                  )}
                </motion.div>

                {/* Wishlist */}
                <motion.div className="flex flex-col items-center cursor-pointer" variants={textMotion}>
                  <Link
                    to="/Rachna/favorites/"
                    className="flex flex-col items-center text-gray-700 hover:text-indigo-600 transition-colors relative"
                  >
                    <HeartIcon className="h-6 w-6" />
                    <span className="text-xs font-bold uppercase mt-1 hidden lg:block">WISHLIST</span>
                    {favoritesCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] z-10">
                        {favoritesCount > 99 ? '99+' : favoritesCount}
                      </span>
                    )}
                  </Link>
                </motion.div>

                {/* Bag */}
                <motion.div className="flex flex-col items-center cursor-pointer" variants={textMotion}>
                  <div
                    onClick={handleCartClick}
                    className="flex flex-col items-center text-gray-700 hover:text-indigo-600 transition-colors relative"
                  >
                    <ShoppingBagIcon className="h-6 w-6" />
                    <span className="text-xs font-bold uppercase mt-1 hidden lg:block">BAG</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] z-10">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </div>
                  <ShoppingCart open={isCartOpen} setOpen={setIsCartOpen} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </nav>
      </header>
    </div>
  );
};

export default NavBar;
