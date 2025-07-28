import React, { useEffect, useState, useRef } from 'react';
import { NavBar, Footer } from '../../components';
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";

const AdminControl = () => {
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const dashboardRef = useRef(null);

    useEffect(() => {
        const verifyAdmin = async () => {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                navigate("/Rachna/admin-login/");
                return;
            }

            try {
                const response = await axios.get("http://localhost:5000/api/admin/verify", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    setAuthorized(true);
                } else {
                    navigate("/Rachna/admin-login/");
                }
            } catch (error) {
                console.error("Unauthorized:", error?.response?.data?.message);
                navigate("/Rachna/admin-login/");
            } finally {
                setLoading(false);
            }
        };

        verifyAdmin();
    }, [navigate]);

    useEffect(() => {
        if (authorized) {
            gsap.from(dashboardRef.current, { opacity: 0, y: 50, duration: 1 });
        }
    }, [authorized]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-2xl font-bold">Loading...</div>;
    }

    if (!authorized) return null;

    return (
        <div className="bg-gray-100 min-h-screen">
            <NavBar />
            <div ref={dashboardRef} className="max-w-7xl mx-auto p-6">
                <h1 className="text-4xl font-bold text-center mb-10">Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link to="/Rachna/addproduct" className="bg-white rounded-xl shadow-md p-6 hover:scale-105 transform transition duration-300 cursor-pointer">
                        <h2 className="text-2xl font-semibold text-center mb-4">Add Product</h2>
                        <p className="text-center text-gray-600">Add new t-shirts to your store.</p>
                    </Link>

                    <Link to="/Rachna/updateproduct" className="bg-white rounded-xl shadow-md p-6 hover:scale-105 transform transition duration-300 cursor-pointer">
                        <h2 className="text-2xl font-semibold text-center mb-4">Update Product</h2>
                        <p className="text-center text-gray-600">Update product details and pricing.</p>
                    </Link>

                    <Link to="/Rachna/deleteproduct" className="bg-white rounded-xl shadow-md p-6 hover:scale-105 transform transition duration-300 cursor-pointer">
                        <h2 className="text-2xl font-semibold text-center mb-4">Delete Product</h2>
                        <p className="text-center text-gray-600">Remove products from your catalog.</p>
                    </Link>

                    <Link to="/Rachna/vieworders" className="bg-white rounded-xl shadow-md p-6 hover:scale-105 transform transition duration-300 cursor-pointer">
                        <h2 className="text-2xl font-semibold text-center mb-4">View Orders</h2>
                        <p className="text-center text-gray-600">See all received orders and status.</p>
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AdminControl;
