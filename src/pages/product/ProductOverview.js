import React from "react";
import { NavBar, Footer } from "../../components";

const product = {
  name: "Nike Pegasus 41 shoes",
  tagline: "Run Strong. Run Beyond.",
  category: "Sports",
  price: 189,
  offerPrice: 159,
  rating: 4,
  images: [
    "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImage.png",
    "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImage2.png",
    "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImage3.png",
    "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImage4.png",
  ],
  description: [
    "High-quality engineered mesh for maximum breathability.",
    "Lightweight ReactX foam for ultimate cushioning and energy return.",
    "Flywire cables ensure a secure fit for every stride.",
    "Available in multiple sizes and striking colors.",
    "Perfect for daily runs, intense workouts, and urban adventures.",
  ],
  features: [
    {
      title: "Advanced Cushioning",
      desc: "ReactX foam midsole ensures a plush, responsive ride.",
      icon: (
        <svg width="26" height="26" fill="none" className="text-indigo-500"><circle cx="13" cy="13" r="12" stroke="currentColor" strokeWidth="2" /><path d="M8 13l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ),
    },
    {
      title: "Breathable Mesh",
      desc: "Keeps feet cool and comfortable during every activity.",
      icon: (
        <svg width="26" height="26" fill="none" className="text-indigo-500"><circle cx="13" cy="13" r="12" stroke="currentColor" strokeWidth="2" /><path d="M9 13a2 2 0 104 0 2 2 0 00-4 0zm7 0a2 2 0 104 0 2 2 0 00-4 0z" stroke="currentColor" strokeWidth="2" /></svg>
      ),
    },
    {
      title: "Secure Fit",
      desc: "Flywire technology locks your foot in for every run.",
      icon: (
        <svg width="26" height="26" fill="none" className="text-indigo-500"><circle cx="13" cy="13" r="12" stroke="currentColor" strokeWidth="2" /><path d="M13 9v8m0-8l4 3m-4-3l-4 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ),
    },
  ],
};




const ProductOverview = () => {
  const [thumbnail, setThumbnail] = React.useState(product.images[0]);

  // Responsive image aspect ratio
  const aspectWidth = 1;
  const aspectHeight = 1;

  return (
    <>
      <NavBar />
      <div className="bg-gradient-to-br from-blue-50/90 to-gray-50/95 min-h-screen flex flex-col">
        <section
          className="relative flex flex-col justify-center min-h-[32vh] md:min-h-[45vh] w-full overflow-hidden bg-gray-900"
          style={{
            background: `linear-gradient(rgba(30, 41, 59, 0.7),rgba(49, 46, 129, 0.6)), url(https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=cover&w=900&q=70) center center/cover no-repeat`
          }}
        >
          <div className="container max-w-7xl mx-auto px-6 pt-14 pb-16 sm:py-20 flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="w-full md:w-4/6 text-white flex flex-col gap-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest uppercase text-indigo-200 bg-indigo-900/30 px-3 py-1 rounded shadow">
                  {product.category}
                </span>
              </div>
              <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-snug drop-shadow-lg">
                {product.name}
              </h1>
              <p className="text-lg lg:text-2xl font-medium tracking-wide text-indigo-100/90 mb-4">
                {product.tagline}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {[...Array(5)].map((_, i) =>
                  product.rating > i ? (
                    <svg key={i} width="22" height="22" viewBox="0 0 18 17" fill="currentColor" className="text-yellow-400">
                      <path d="M8.049.927c.3-.921 1.603-.921 1.902 0l1.294 3.983a1 1 0 0 0 .951.69h4.188c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 0 0-.364 1.118l1.295 3.983c.299.921-.756 1.688-1.54 1.118L9.589 13.63a1 1 0 0 0-1.176 0l-3.389 2.46c-.783.57-1.838-.197-1.539-1.118L4.78 10.99a1 1 0 0 0-.363-1.118L1.028 7.41c-.783-.57-.38-1.81.588-1.81h4.188a1 1 0 0 0 .95-.69z" />
                    </svg>
                  ) : (
                    <svg key={i} width="22" height="22" viewBox="0 0 18 17" fill="currentColor" className="text-indigo-200">
                      <path d="M8.04894 0.927049C8.3483 0.00573802 9.6517 0.00574017 9.95106 0.927051L11.2451 4.90983C11.379 5.32185 11.763 5.60081 12.1962 5.60081H16.3839C17.3527 5.60081 17.7554 6.84043 16.9717 7.40983L13.5838 9.87132C13.2333 10.126 13.0866 10.5773 13.2205 10.9894L14.5146 14.9721C14.8139 15.8934 13.7595 16.6596 12.9757 16.0902L9.58778 13.6287C9.2373 13.374 8.7627 13.374 8.41221 13.6287L5.02426 16.0902C4.24054 16.6596 3.18607 15.8934 3.48542 14.9721L4.7795 10.9894C4.91338 10.5773 4.76672 10.126 4.41623 9.87132L1.02827 7.40983C0.244561 6.84043 0.647338 5.60081 1.61606 5.60081H5.8038C6.23703 5.60081 6.62099 5.32185 6.75486 4.90983L8.04894 0.927049Z" />
                    </svg>
                  )
                )}
                <span className="ml-2 text-base font-semibold">{product.rating}/5</span>
              </div>
              {/* Primary Hero CTA */}
              <div className="flex flex-wrap gap-4 mt-8">
                <button className="bg-indigo-600 hover:bg-indigo-700 transition shadow-xl py-3 px-7 rounded-lg font-bold text-lg text-white">
                  Buy Now
                </button>
                <button className="bg-white bg-opacity-90 hover:bg-opacity-95 border border-indigo-200 text-indigo-700 font-medium py-3 px-7 rounded-lg text-lg">
                  Add to Cart
                </button>
              </div>
            </div>
            
            <div className="hidden md:flex flex-col items-center w-2/6 gap-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-indigo-200 bg-white/70 flex items-center justify-center transition-transform duration-300 hover:scale-105" style={{ width: 420, height: 420 }}>
                <img
                  src={thumbnail}
                  alt="Main showcase product visual"
                  className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                  style={{ aspectRatio: `${aspectWidth} / ${aspectHeight}` }}
                />
                <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full shadow-lg font-semibold tracking-wider">Featured</span>
              </div>
              
              <div className="flex gap-4 mt-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setThumbnail(img)}
                    className={`rounded-2xl border-2 group transition duration-150 bg-white relative shadow-md hover:shadow-xl
                    ${thumbnail === img ? "border-indigo-600 ring-2 ring-indigo-300" : "border-gray-200 hover:border-indigo-400"}
                    focus:outline-none`}
                    style={{ width: 80, height: 80, overflow: "hidden" }}
                    aria-label={`Show alternate product image ${idx + 1}`}
                    type="button"
                  >
                    <img
                      src={img}
                      alt={`Product thumbnail ${idx + 1}`}
                      className="object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-200"
                    />
                    {thumbnail === img && (
                      <span className="absolute top-2 right-2 rounded bg-white text-indigo-600 text-xs px-2 font-bold shadow">View</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        
        <nav
          className="container mx-auto max-w-7xl px-6 mt-7 mb-2 text-sm text-gray-500"
          aria-label="Breadcrumb"
        >
          <ol className="flex items-center space-x-2">
            <li><a href="/" className="hover:text-indigo-600 font-medium">Home</a></li>
            <li>/</li>
            <li><a href="/" className="hover:text-indigo-600 font-medium">Products</a></li>
            <li>/</li>
            <li className="capitalize">{product.category}</li>
            <li>/</li>
            <li className="text-indigo-700 font-semibold">{product.name}</li>
          </ol>
        </nav>

        

        <main className="container mx-auto max-w-7xl w-full px-4 md:px-6 py-10 flex-1">
          <div className="flex flex-col lg:flex-row gap-14">
            
            <aside className="w-full lg:max-w-md mb-8 lg:mb-0">
              
              <div className="rounded-2xl overflow-hidden border-2 border-indigo-200 bg-white shadow-2xl flex items-center justify-center mb-4 min-h-[340px] group transition-all duration-300 hover:shadow-indigo-300/60 hover:scale-105">
                <img
                  src={thumbnail}
                  alt="Main product"
                  className="object-contain w-full h-full max-h-[400px] transition-transform duration-300 group-hover:scale-105 drop-shadow-lg"
                  style={{ aspectRatio: "1/1" }}
                  loading="lazy"
                />
              </div>
              
              <div className="flex gap-3 justify-center lg:justify-start flex-wrap">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setThumbnail(img)}
                    className={`bg-gradient-to-br from-indigo-50 to-white border-2 transition rounded-xl p-1 shadow-md hover:shadow-lg
              ${thumbnail === img ? "border-indigo-600 ring-2 ring-indigo-300 scale-105" : "border-gray-200 hover:border-indigo-400"}
            `}
                    style={{ width: 72, height: 72 }}
                    aria-label={`Show alternate image ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Product thumbnail ${idx + 1}`}
                      className="object-contain w-full h-full rounded-lg"
                    />
                  </button>
                ))}
              </div>
              
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-white border border-emerald-200 rounded-lg px-4 py-2 text-emerald-700 font-semibold text-sm shadow-sm">
                  <span className="text-lg">🚚</span> <span>Free Shipping & Returns</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-white border border-indigo-200 rounded-lg px-4 py-2 text-indigo-700 font-semibold text-sm shadow-sm">
                  <span className="text-lg">✅</span> <span>100% Authentic Product</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-white border border-orange-200 rounded-lg px-4 py-2 text-orange-700 font-semibold text-sm shadow-sm">
                  <span className="text-lg">⏱</span> <span>Ships in 24 hours</span>
                </div>
              </div>
            </aside>
            
            <section className="flex-1 w-full max-w-xl px-0 sm:px-4">
              
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                {product.name}
                <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded shadow-sm ml-2 animate-pulse">New</span>
              </h2>
              <p className="uppercase text-xs tracking-widest text-indigo-400 font-bold mb-2">{product.category}</p>
              
              <div className="flex items-center gap-2 mb-3">
                
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      width="20"
                      height="20"
                      fill="currentColor"
                      className={i < product.rating ? "text-yellow-400 animate-bounce-slow" : "text-gray-300"}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 2l2.39 4.84L18 7.24l-3.8 3.7L15.3 17 10 14l-5.3 3 1.1-6.06L2 7.24l5.61-.4z" />
                    </svg>
                  ))}
                </div>
                <span className="text-base text-gray-700 font-semibold">{product.rating}/5</span>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 ml-3 rounded-md text-xs font-medium shadow">In Stock</span>
              </div>
              
              <div className="block lg:hidden mt-4 mb-5">
                <img
                  src={thumbnail}
                  alt="Product"
                  className="w-full max-w-xs mx-auto rounded-2xl border-2 border-indigo-200 bg-white object-cover shadow-lg"
                  style={{ aspectRatio: "1/1" }}
                  loading="lazy"
                />
              </div>
              
              <div className="mt-3 mb-3 flex items-center gap-4 text-2xl font-bold">
                <span className="text-indigo-700 drop-shadow">${product.offerPrice}</span>
                <span className="text-gray-400/70 text-lg line-through font-medium">${product.price}</span>
                <span className="text-emerald-600 ml-2 text-sm font-semibold bg-emerald-50 px-2 py-0.5 rounded shadow-sm">
                  {Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF
                </span>
              </div>

              <div className="mb-6">
                <span className="inline-flex items-center px-2 py-0.5 bg-indigo-100 text-xs font-medium text-indigo-700 rounded shadow-sm">
                  <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M10.29 3.86l1.42-2.36 1.42 2.36C15.37 4.71 17 7.03 17 9.76c0 2.15-1.16 4.14-3 5.25C7.16 13.9 6 11.91 6 9.76c0-2.73 1.63-5.05 4.29-5.9z" strokeLinejoin="round" />
                  </svg>
                  24h Dispatch. Easy Returns.
                </span>
              </div>
              
              <section className="my-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full"></span> Key Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                  {product.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white/80 rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition">
                      <div aria-hidden="true" className="bg-indigo-50 rounded-full p-2 flex items-center justify-center shadow">
                        {feat.icon}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{feat.title}</p>
                        <p className="text-gray-600 text-sm">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              
              <section className="mb-8">
                <h4 className="text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full"></span> About Product
                </h4>
                <ul className="list-disc ml-6 text-gray-700 space-y-1 text-base">
                  {product.description.map((desc, index) => (
                    <li key={index} className="pl-1">{desc}</li>
                  ))}
                </ul>
              </section>
              
              <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2 shadow-sm">
                  <span className="bg-indigo-100 text-indigo-600 rounded-full p-1 text-base">🔒</span>
                  Secure checkout
                </div>
                <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2 shadow-sm">
                  <span className="bg-emerald-100 text-emerald-700 rounded-full p-1 text-base">💵</span>
                  30-day money-back guarantee
                </div>
                <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2 shadow-sm">
                  <span className="bg-orange-100 text-orange-700 rounded-full p-1 text-base">📦</span>
                  Free doorstep delivery
                </div>
                <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2 shadow-sm">
                  <span className="bg-green-100 text-green-700 rounded-full p-1 text-base">🌱</span>
                  Sustainable materials
                </div>
              </div>
              
              <div className="flex gap-4 mt-6 font-semibold">
                <button className="flex-1 py-3 rounded-lg bg-gradient-to-r from-indigo-200 to-indigo-500 hover:from-indigo-400 hover:to-indigo-700 hover:text-white text-indigo-900 border border-indigo-100 shadow-lg transition flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4" /><circle cx="7" cy="21" r="1" /><circle cx="20" cy="21" r="1" /></svg>
                  Add to Cart
                </button>
                <button className="flex-1 py-3 rounded-lg bg-gradient-to-r from-emerald-400 to-indigo-600 text-white hover:from-emerald-500 hover:to-indigo-700 shadow-xl transition flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
                  Buy Now
                </button>
              </div>
            </section>
          </div>
        </main>


      </div>
      <Footer />
    </>
  );
};

export default ProductOverview;
