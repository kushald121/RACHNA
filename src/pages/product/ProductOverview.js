import React from "react";
import { NavBar, Footer } from "../../components";

const product = {
  name: "Nike Pegasus 41 shoes",
  category: "Sports",
  price: 189,
  offerPrice: 159,
  rating: 4,
  images: [
    "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImage.png",
    "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImage2.png",
    "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImage3.png",
    "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImage4.png"
  ],
  description: [
    "High-quality material",
    "Comfortable for everyday use",
    "Available in different sizes"
  ]
};

const ProductOverview = () => {
  const [thumbnail, setThumbnail] = React.useState(product.images[0]);
  

  return (
    <>
      <NavBar />
      <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm mb-8 text-gray-500" aria-label="Breadcrumb">
          <ol className="list-reset flex">
            <li>Home</li>
            <li>
              <span className="mx-2">/</span>Products
            </li>
            <li>
              <span className="mx-2">/</span>{product.category}
            </li>
            <li>
              <span className="mx-2">/</span>
              <span className="text-indigo-600 font-semibold">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-start md:items-stretch">
          {/* Images Section */}
          <div className="flex gap-5">
            {/* Thumbnails */}
            <div className="flex flex-col gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setThumbnail(img)}
                  className={`rounded-lg border-2 transition 
                    ${thumbnail === img ? "border-indigo-500 shadow-md" : "border-gray-200 hover:border-indigo-300" }
                    focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                  style={{ width: 84, height: 84, overflow: "hidden", background: "#f3f4f6" }}
                  aria-label={`Show alternate product image ${idx + 1}`}
                  type="button"
                >
                  <img
                    src={img}
                    alt={`Product thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover object-center transition"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div
              className="rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg bg-white flex items-center justify-center"
              style={{ width: 380, height: 380, minWidth: 200, maxWidth: 380 }}
            >
              <img
                src={thumbnail}
                alt="Selected product"
                className="w-full h-full object-cover object-center transition"
                style={{ aspectRatio: "1 / 1" }}
                loading="lazy"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 w-full max-w-xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="uppercase text-xs tracking-wider text-gray-400 font-bold">{product.category}</p>

            {/* Ratings */}
            <div className="flex items-center gap-1 mt-3 mb-6">
              {Array(5)
                .fill('')
                .map((_, i) =>
                  product.rating > i ? (
                    <svg
                      key={i}
                      width="18" height="18" viewBox="0 0 18 17"
                      fill="currentColor"
                      className="text-indigo-500"
                    >
                      <path d="M8.049.927c.3-.921 1.603-.921 1.902 0l1.294 3.983a1 1 0 0 0 .951.69h4.188c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 0 0-.364 1.118l1.295 3.983c.299.921-.756 1.688-1.54 1.118L9.589 13.63a1 1 0 0 0-1.176 0l-3.389 2.46c-.783.57-1.838-.197-1.539-1.118L4.78 10.99a1 1 0 0 0-.363-1.118L1.028 7.41c-.783-.57-.38-1.81.588-1.81h4.188a1 1 0 0 0 .95-.69z" />
                    </svg>
                  ) : (
                    <svg
                      key={i}
                      width="18" height="18" viewBox="0 0 18 17"
                      fill="currentColor"
                      className="text-indigo-200"
                    >
                      <path d="M8.04894 0.927049C8.3483 0.00573802 9.6517 0.00574017 9.95106 0.927051L11.2451 4.90983C11.379 5.32185 11.763 5.60081 12.1962 5.60081H16.3839C17.3527 5.60081 17.7554 6.84043 16.9717 7.40983L13.5838 9.87132C13.2333 10.126 13.0866 10.5773 13.2205 10.9894L14.5146 14.9721C14.8139 15.8934 13.7595 16.6596 12.9757 16.0902L9.58778 13.6287C9.2373 13.374 8.7627 13.374 8.41221 13.6287L5.02426 16.0902C4.24054 16.6596 3.18607 15.8934 3.48542 14.9721L4.7795 10.9894C4.91338 10.5773 4.76672 10.126 4.41623 9.87132L1.02827 7.40983C0.244561 6.84043 0.647338 5.60081 1.61606 5.60081H5.8038C6.23703 5.60081 6.62099 5.32185 6.75486 4.90983L8.04894 0.927049Z" />
                    </svg>
                  )
                )}
              <span className="text-base ml-2 text-gray-700 font-medium">
                {product.rating}/5
              </span>
            </div>

            {/* Pricing */}
            <div className="mt-3 mb-1 flex items-center gap-3 text-2xl">
              <span className="text-indigo-700 font-semibold">${product.offerPrice}</span>
              <span className="text-gray-400/70 text-lg line-through">${product.price}</span>
              <span className="text-emerald-600 ml-2 text-sm font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                {Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF
              </span>
            </div>
            <span className="text-sm text-gray-500 mb-4 block">
              (inclusive of all taxes)
            </span>

            {/* About Product */}
            <p className="text-base font-semibold mt-8 mb-3">About Product</p>
            <ul className="list-disc ml-5 text-gray-600 space-y-1">
              {product.description.map((desc, index) => (
                <li key={index}>{desc}</li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex gap-4 mt-10 text-base">
              <button
                className="w-1/2 py-3 rounded bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 transition"
                type="button"
              >
                Add to Cart
              </button>
              <button
                className="w-1/2 py-3 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                type="button"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductOverview;
