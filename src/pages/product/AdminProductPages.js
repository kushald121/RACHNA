import React, { useState } from 'react';
import { PencilSquareIcon, TrashIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import { NavBar, Footer } from '../../components';

const initialProducts = [
  {
    id: 1,
    name: "Shoes",
    price: 99,
    stock: 10,
    image: "https://assets.ajio.com/medias/sys_master/root/20231201/MBI3/6569efd5ddf7791519ab0315/-473Wx593H-469505265-sblue-MODEL.jpg"
  },
  {
    id: 2,
    name: "T-shirt",
    price: 25,
    stock: 20,
    image: "https://chriscross.in/cdn/shop/files/ChrisCrossRoyalblueCottontshirtmen.jpg?v=1740994595"
  },
];

const initialOrders = [
  { id: 1, product: "Shoes", quantity: 1, user: "John" },
  { id: 2, product: "T-shirt", quantity: 2, user: "Alice" },
];

function AdminProductPages() {
  const [products, setProducts] = useState(initialProducts);
  const [orders] = useState(initialOrders);
  const [form, setForm] = useState({ id: null, name: '', price: '', stock: '', image: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Handle input changes
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add Product
  const handleAdd = e => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock || !form.image) return;
    setProducts([
      ...products,
      {
        id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        image: form.image
      },
    ]);
    setForm({ id: null, name: '', price: '', stock: '', image: '' });
  };

  // Edit Product
  const handleEdit = product => {
    setIsEditing(true);
    setForm(product);
  };

  // Update Product
  const handleUpdate = e => {
    e.preventDefault();
    setProducts(products.map(p =>
      p.id === form.id
        ? { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) }
        : p
    ));
    setIsEditing(false);
    setForm({ id: null, name: '', price: '', stock: '', image: '' });
  };

  // Delete Product
  const handleDelete = id => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen px-4 py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-indigo-700 tracking-tight mb-1">Admin Product Panel</h1>
              <p className="text-gray-500">Manage your store products and orders with ease.</p>
            </div>
          </div>

          {/* Product Form Card */}
          <div className="bg-white shadow-xl rounded-2xl p-6 mb-8 border border-slate-100">
            <form
              className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end"
              onSubmit={isEditing ? handleUpdate : handleAdd}
            >
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-gray-800 shadow-sm focus:ring ring-indigo-100 focus:border-indigo-400 outline-none"
                  type="text"
                  name="name"
                  placeholder="Product Name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Price ($)</label>
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-gray-800 shadow-sm focus:ring ring-indigo-100 focus:border-indigo-400 outline-none"
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={form.price}
                  min={0}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-gray-800 shadow-sm focus:ring ring-indigo-100 focus:border-indigo-400 outline-none"
                  type="number"
                  name="stock"
                  placeholder="Stock"
                  value={form.stock}
                  min={0}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-gray-800 shadow-sm focus:ring ring-indigo-100 focus:border-indigo-400 outline-none"
                  type="text"
                  name="image"
                  placeholder="Image URL"
                  value={form.image}
                  onChange={handleChange}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition ${isEditing ? "bg-yellow-500 hover:bg-yellow-600" : "bg-indigo-600 hover:bg-indigo-700"} shadow`}
                >
                  <PlusCircleIcon className="w-5 h-5" />
                  {isEditing ? "Update" : "Add"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white font-semibold transition shadow"
                    onClick={() => {
                      setIsEditing(false);
                      setForm({ id: null, name: '', price: '', stock: '', image: '' });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Products Card */}
          <div className="bg-white shadow-xl rounded-2xl p-6 mb-8 border border-slate-100">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">Products</h2>
            <div className="w-full overflow-x-auto">
              <table className="min-w-full bg-white font-medium">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-slate-600 font-semibold">Image</th>
                    <th className="px-4 py-3 text-left text-slate-600 font-semibold">ID</th>
                    <th className="px-4 py-3 text-left text-slate-600 font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-slate-600 font-semibold">Price</th>
                    <th className="px-4 py-3 text-left text-slate-600 font-semibold">Stock</th>
                    <th className="px-4 py-3 text-left text-slate-600 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-5 text-gray-400">No products</td>
                    </tr>
                  ) : products.map((p) => (
                    <tr key={p.id} className="hover:bg-indigo-50 transition">
                      {/* IMAGE: LARGER, RESPONSIVE, ROUNDED, SHADOW, HOVER ZOOM */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-xl object-cover border-2 border-slate-200 shadow-lg transition-transform duration-200 hover:scale-105 bg-gray-100"
                            loading="lazy"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">{p.id}</td>
                      <td className="px-4 py-3">{p.name}</td>
                      <td className="px-4 py-3">${p.price}</td>
                      <td className="px-4 py-3">{p.stock}</td>
                      <td className="px-4 py-3">
                        <button
                          title="Edit"
                          className="inline-flex items-center justify-center p-2 bg-indigo-100 hover:bg-indigo-300 text-indigo-700 rounded-full mr-2 transition"
                          onClick={() => handleEdit(p)}
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          title="Delete"
                          className="inline-flex items-center justify-center p-2 bg-red-100 hover:bg-red-300 text-red-600 rounded-full transition"
                          onClick={() => handleDelete(p.id)}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white shadow-xl rounded-2xl p-6 border border-slate-100">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">Orders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white font-medium">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-slate-600 font-semibold">Order ID</th>
                    <th className="px-4 py-3 text-left text-slate-600 font-semibold">Product</th>
                    <th className="px-4 py-3 text-left text-slate-600 font-semibold">Quantity</th>
                    <th className="px-4 py-3 text-left text-slate-600 font-semibold">User</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-5 text-gray-400">No orders</td>
                    </tr>
                  ) : orders.map((order) => (
                    <tr key={order.id} className="hover:bg-indigo-50 transition">
                      <td className="px-4 py-3">{order.id}</td>
                      <td className="px-4 py-3">{order.product}</td>
                      <td className="px-4 py-3">{order.quantity}</td>
                      <td className="px-4 py-3">{order.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminProductPages;
