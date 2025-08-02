import React, { useState } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { Footer, NavBar } from '../../components';
import axios from "axios";
import {useNavigate} from "react-router-dom";

const AdminLogin = () => {

  const [email,setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
        const response = await axios.post("http://localhost:5000/api/admin/admin-login/", {
            email, password
        });

        console.log("Login Response:", response.data);

        if (response.data.token) {
            console.log(response.data.token);
            localStorage.setItem("adminToken", response.data.token);

            // Check if there's a redirect path stored (from protected route attempt)
            const redirectPath = localStorage.getItem("adminRedirectPath");
            if (redirectPath && redirectPath !== "/Rachna/admin-login/") {
                localStorage.removeItem("adminRedirectPath");
                navigate(redirectPath);
            } else {
                // Default redirect to admin control panel
                navigate("/Rachna/admincontrol");
            }
        } else {
            alert("Token not received from server");
        }
    } catch (error) {
        console.error(error.response?.data?.message || error.message);
        alert(error.response?.data?.message || "Login failed");
    }
};

  return (
    <>
    <NavBar/>
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg m-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
          <p className="mt-2 text-sm text-gray-500">Access your dashboard</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="relative">
            <FiMail className="absolute w-5 h-5 text-gray-400 top-3.5 left-4" />
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e)=> setEmail(e.target.value)}
              className="w-full py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300 ease-in-out"
              placeholder="Email address"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <FiLock className="absolute w-5 h-5 text-gray-400 top-3.5 left-4" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value= {password}
              onChange = {(e)=> setPassword(e.target.value)}
              className="w-full py-3 pl-12 pr-12 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300 ease-in-out"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600 hover:text-indigo-500"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>
          </div>
          
          {/* Sign In Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              Login In
            </button>
          </div>
        </form>
        

      </div>
    </div>
    <Footer />
    </>
  );
};

export default AdminLogin;
