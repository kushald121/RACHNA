import React, { useState } from "react";
import { NavBar, Footer } from "../../components";

const AddProduct = () => {
  const [categories, setCategories] = useState(["Jacket", "Tshirt", "Hoodies"]);
  const [newCategory, setNewCategory] = useState("");
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedGender, setSelectedGender] = useState("");


  const handleDeleteImage = (indexToDelete) => {
  const newImages = images.filter((_, idx) => idx !== indexToDelete);
  setImages(newImages);
  if (indexToDelete === selectedImageIndex) {
    setSelectedImageIndex(0);
  } else if (indexToDelete < selectedImageIndex) {
    setSelectedImageIndex(prev => Math.max(prev - 1, 0));
  }
};


  const addCategory = () => {
    if (newCategory.trim() !== "") {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };
  
  const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  const previews = files.map(file => ({ url: URL.createObjectURL(file), file }));
  setImages(prev => [...prev, ...previews]);
  if (images.length === 0) setSelectedImageIndex(0);
};

  
  const toggleSize = (size) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const selectGender = (gender) => {
    setSelectedGender(gender);
  };

  return (
    <>
      <NavBar />
    <div className="bg-[#f9fafb] p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-6 md:p-10 flex flex-col gap-6">

          <h1 className="text-3xl md:text-4xl font-bold">Add New Product</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Name Product</label>
                <input type="text" placeholder="Enter product name" className="border rounded-lg p-3" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Description Product</label>
                <textarea placeholder="Enter product description" className="border rounded-lg p-3 min-h-[120px]" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Size</label>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL"].map(size => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                     className={`border rounded-lg px-4 py-2 transition-all duration-200 
  ${selectedSizes.includes(size) 
    ? 'bg-red-500 text-white' 
    : 'hover:bg-red-500 hover:text-white'}`}

                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Gender</label>
                <div className="flex flex-wrap gap-2">
                  {["Men", "Women", "Unisex"].map(gender => (
                    <button
                      key={gender}
                      onClick={() => selectGender(gender)}
                      className={`border rounded-lg px-4 py-2 transition-all duration-200 
  ${selectedGender === gender 
    ? 'bg-red-500 text-white' 
    : 'hover:bg-red-500 hover:text-white'}`}

                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold">Base Pricing (₹)</label>
                  <input type="number" placeholder="Enter base price" className="border rounded-lg p-3" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold">Stock</label>
                  <input type="number" placeholder="Enter stock quantity" className="border rounded-lg p-3" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold">Discount (%)</label>
                  <input type="number" placeholder="Enter discount %" className="border rounded-lg p-3" />
                </div>
                </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Product Category</label>
                <select className="border rounded-lg p-3">
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
                
                 </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Upload Img</label>
                <input type="file" multiple accept="image/*,video/*" className="border rounded-lg p-3" onChange={handleImageUpload} />
                
                  {/* Image Preview */}
                  {images.length > 0 && (
  <div className="border rounded-xl overflow-hidden p-4 flex flex-col gap-4">
    {/* Big Preview */}
    <div className="w-full aspect-[1/1] rounded-lg overflow-hidden border relative">
      {images[selectedImageIndex].url.endsWith("mp4") ? (
        <video
          src={images[selectedImageIndex].url}
          controls
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <img
          src={images[selectedImageIndex].url}
          alt="Selected Preview"
          className="w-full h-full object-cover rounded-lg"
        />
      )}
    </div>

    {/* Thumbnails with Delete */}
    <div className="flex gap-3 overflow-x-auto">
      {images.map((img, idx) => (
        <div key={idx} className="relative group">
          <div
            onClick={() => setSelectedImageIndex(idx)}
            className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border cursor-pointer 
              ${selectedImageIndex === idx ? 'border-red-500 border-2' : 'border-gray-200'}`}
          >
            {img.url.endsWith("mp4") ? (
              <video src={img.url} muted playsInline autoPlay loop className="w-full h-full object-cover" />

            ) : (
              <img
                src={img.url}
                alt={`preview-${idx}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {/* 🗑️ Delete Button (hover) */}
          <button
            onClick={() => handleDeleteImage(idx)}
            className="absolute -top-2 -right-2 bg-white rounded-full shadow-md p-1 hover:bg-red-500 hover:text-white text-sm opacity-0 group-hover:opacity-100 transition"
            title="Delete"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  </div>
)}


                
                
                    
                    
                    
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
           
            <button className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors duration-200">
  Add Product
</button>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddProduct;
