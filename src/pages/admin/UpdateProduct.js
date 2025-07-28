import React, { useState, useEffect } from 'react';
import { NavBar, Footer } from '../../components';
import axios from 'axios';

const UpdateProduct = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectAll, setSelectAll] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  
  const [updateData, setUpdateData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    gender: '',
    sizes: [],
    discount: '',
    category: ''
  });

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/fetch/');
      
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch products' });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ type: 'error', text: 'Failed to fetch products' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(product => product.id));
    }
    setSelectAll(!selectAll);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSizeToggle = (size) => {
    setUpdateData(prev => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      
      return {
        ...prev,
        sizes: newSizes
      };
    });
  };

  const handleShowUpdateForm = () => {
    if (selectedProducts.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one product to update' });
      return;
    }
    setShowUpdateForm(true);
  };

  const handleUpdateProducts = async (e) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one product to update' });
      return;
    }

    try {
      setUpdating(true);

      // Create updates array with only non-empty fields
      const updates = selectedProducts.map(productId => {
        const update = { id: productId };

        // Only include fields that have values
        Object.keys(updateData).forEach(key => {
          if (updateData[key] && updateData[key] !== '') {
            if (key === 'sizes' && Array.isArray(updateData[key]) && updateData[key].length > 0) {
              update[key] = updateData[key];
            } else if (key !== 'sizes') {
              update[key] = updateData[key];
            }
          }
        });

        return update;
      });

      console.log('Sending updates:', updates);
      console.log('Update data:', updateData);
      console.log('Selected products:', selectedProducts);

      const response = await axios.put('http://localhost:5000/api/products/bulk-update', {
        updates
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response:', response.data);

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: `Successfully updated ${selectedProducts.length} product(s)` 
        });
        
        // Refresh products list
        await fetchProducts();
        
        // Reset form
        setUpdateData({
          name: '',
          description: '',
          price: '',
          stock: '',
          gender: '',
          sizes: [],
          discount: '',
          category: ''
        });
        setSelectedProducts([]);
        setSelectAll(false);
        setShowUpdateForm(false);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to update products' });
      }
    } catch (error) {
      console.error('Error updating products:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update products' 
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mx-auto px-4 max-w-7xl my-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Update Products</h2>
            <div className="flex gap-4">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {selectAll ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handleShowUpdateForm}
                disabled={selectedProducts.length === 0}
                className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                  selectedProducts.length === 0
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                Update Selected ({selectedProducts.length})
              </button>
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* Update Form Modal */}
          {showUpdateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4">Update {selectedProducts.length} Product(s)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Leave fields empty to keep current values. Only filled fields will be updated.
                </p>
                
                <form onSubmit={handleUpdateProducts}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Product Name</label>
                      <input
                        type="text"
                        name="name"
                        value={updateData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Leave empty to keep current"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Category</label>
                      <input
                        type="text"
                        name="category"
                        value={updateData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Leave empty to keep current"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Price (₹)</label>
                      <input
                        type="number"
                        name="price"
                        value={updateData.price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Leave empty to keep current"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Stock</label>
                      <input
                        type="number"
                        name="stock"
                        value={updateData.stock}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Leave empty to keep current"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Gender</label>
                      <select
                        name="gender"
                        value={updateData.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Keep current</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Discount (%)</label>
                      <input
                        type="number"
                        name="discount"
                        value={updateData.discount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Leave empty to keep current"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-gray-700 mb-2 font-medium">Description</label>
                    <textarea
                      name="description"
                      value={updateData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Leave empty to keep current"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-gray-700 mb-2 font-medium">Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {sizeOptions.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizeToggle(size)}
                          className={`px-3 py-1 rounded-lg border transition-colors ${
                            updateData.sizes.includes(size)
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Select sizes to update (leave unselected to keep current)</p>
                  </div>
                  
                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowUpdateForm(false)}
                      className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className={`flex-1 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                        updating
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      {updating ? 'Updating...' : 'Update Products'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Image</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Name</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Category</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Price</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Stock</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Discount</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr 
                      key={product.id} 
                      className={`hover:bg-gray-50 ${
                        selectedProducts.includes(product.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="border border-gray-300 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <img
                          src={product.image || 'https://via.placeholder.com/60'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-3 font-medium">
                        {product.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {product.category || 'N/A'}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        ₹{product.price}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {product.stock}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {product.discount ? `${product.discount}%` : '0%'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          {products.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Total Products: <span className="font-semibold">{products.length}</span> | 
                Selected: <span className="font-semibold text-indigo-600">{selectedProducts.length}</span>
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UpdateProduct;
