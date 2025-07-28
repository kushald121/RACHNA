import { useState, useRef } from 'react';
import { NavBar, Footer } from "../../components";
import axios from 'axios';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    gender: '',
    sizes: [],
    discount: '',
    category: ''
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  
  const fileInputRef = useRef(null);
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      
      return {
        ...prev,
        sizes: newSizes
      };
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    const newPreviews = files.map(file => {
      return { 
        url: URL.createObjectURL(file), 
        file,
        type: file.type.startsWith('image/') ? 'image' : 'video'
      };
    });

    setPreviewUrls(prev => [...prev, ...newPreviews]);
    setMediaFiles(prev => [...prev, ...files]);
    
    // Set the first uploaded file as active preview if none was selected before
    if (previewUrls.length === 0 && newPreviews.length > 0) {
      setActivePreviewIndex(0);
    }
  };

  const removeMedia = (index) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index].url);
    
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    
    // Adjust active preview index if needed
    if (activePreviewIndex >= index) {
      setActivePreviewIndex(prev => Math.max(0, prev - 1));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const formDataToSend = new FormData();
      
      // Append product data
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(item => formDataToSend.append(key, item));
        } else if (value) {
          formDataToSend.append(key, value);
        }
      });

      // Append media files
      mediaFiles.forEach(file => {
        formDataToSend.append('media', file);
      });

      const response = await axios.post('http://localhost:5000/api/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSubmitMessage({ type: 'success', text: 'Product added successfully!' });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        gender: '',
        sizes: [],
        discount: '',
        category: ''
      });
      setMediaFiles([]);
      setPreviewUrls([]);
      setActivePreviewIndex(0);
      
      // Revoke all object URLs
      previewUrls.forEach(preview => URL.revokeObjectURL(preview.url));
    } catch (error) {
      console.error('Error adding product:', error);
      setSubmitMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to add product' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <NavBar/>
      <div className="container mx-auto px-4 max-w-7xl my-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Product</h2>
          
          <form onSubmit={handleSubmit}>
            {/* General Information */}
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4 text-gray-700 border-b pb-2">General Information</h3>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Name Product</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Puffer Jacket With Pocket Detail"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Description Product</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  rows="4"
                  placeholder="Chopped puffer jacket made of technical fabric. High neck and long sleeves..."
                  required
                />
              </div>
            </div>
            
            <hr className="my-6 border-gray-200" />
            
            {/* Upload Images */}
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4 text-gray-700 border-b pb-2">Upload Media</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeToggle(size)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          formData.sizes.includes(size)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Pick Available Gender</option>
                    <option value="Men">Men</option>
                    <option value="Woman">Woman</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-gray-700 mb-2 font-medium">Upload Images/Videos</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  accept="image/*,video/*"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                >
                  Choose Files
                </button>
                
                {/* Media Preview Section */}
                {previewUrls.length > 0 && (
                  <div className="mt-6">
                    <div className="relative mb-4 bg-gray-100 rounded-lg p-4 w-full" style={{ minHeight: '600px' }}>
                      {previewUrls[activePreviewIndex]?.type === 'image' ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <img 
                            src={previewUrls[activePreviewIndex].url} 
                            alt={`Preview ${activePreviewIndex}`} 
                            className="max-h-full max-w-full object-contain rounded-lg"
                          />
                        </div>
                      ) : (
                        <video 
                          src={previewUrls[activePreviewIndex].url} 
                          className="w-full rounded-lg"
                          controls
                          preload="metadata"
                          style={{ 
                            height: '520px',
                            maxHeight: '520px'
                          }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(activePreviewIndex)}
                        style={{ 
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          fontWeight: 'bold',
                          border: 'none',
                          cursor: 'pointer',
                          zIndex: 1000,
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                        title="Remove this media"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex overflow-x-auto pb-2 gap-2">
                      {previewUrls.map((item, index) => (
                        <div 
                          key={index} 
                          className={`relative flex-shrink-0 w-16 h-16 rounded-md cursor-pointer border-2 transition-all ${
                            index === activePreviewIndex 
                              ? 'border-blue-500' 
                              : 'border-transparent hover:border-gray-300'
                          }`}
                          onClick={() => setActivePreviewIndex(index)}
                        >
                          {item.type === 'image' ? (
                            <img 
                              src={item.url} 
                              alt={`Thumbnail ${index}`} 
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMedia(index);
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600 transition-colors z-50"
                            title="Remove this media"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <hr className="my-6 border-gray-200" />
            
            {/* Pricing And Stock */}
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4 text-gray-700 border-b pb-2">Pricing And Stock</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Base Pricing (INR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="47.55"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Discount</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      className="w-full pr-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="10"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-3 text-gray-500">%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="77"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-gray-700 mb-2 font-medium">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Product Category</option>
                  <option value="Jacket">Jacket</option>
                  <option value="Tshirt">Tshirt</option>
                  <option value="Hoodie">Hoodie</option>
                </select>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-lg text-white font-medium ${
                  isSubmitting 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 shadow-md'
                } transition-colors`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Add Product'}
              </button>
            </div>
            
            {/* Submission Message */}
            {submitMessage.text && (
              <div className={`mt-4 p-3 rounded-lg ${
                submitMessage.type === 'success' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {submitMessage.text}
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default AddProduct;
