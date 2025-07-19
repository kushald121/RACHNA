import React, { useState } from 'react'
import { Footer, NavBar } from '../../components'

const User1 = () => {
  const [step, setStep] = useState(1)
  const [loginDone, setLoginDone] = useState(false)
  const [showNewAddress, setShowNewAddress] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <NavBar />

      <main className="flex-grow flex justify-center items-start p-4 md:p-8">
        <div className="w-full max-w-5xl bg-white rounded shadow-md">

          {/* LOGIN ALWAYS VISIBLE */}
          <div className="flex flex-col md:flex-row border-b p-6">
            <div className="w-full md:w-2/3 border-r pr-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-700">1) LOGIN OR SIGNUP</h2>
                {loginDone && (
                  <span className="text-green-600 font-bold text-lg">✔️</span>
                )}
              </div>
              
              {!loginDone ? (
                <>
                  <input
                    type="text"
                    placeholder="Enter Email/Mobile number"
                    className="w-full p-3 border rounded mb-4 outline-blue-500"
                  />
                  <p className="text-xs text-gray-600 mb-4">
                    By continuing, you agree to our{' '}
                    <span className="text-blue-600 cursor-pointer">Terms of Use</span> and{' '}
                    <span className="text-blue-600 cursor-pointer">Privacy Policy</span>.
                  </p>
                  <button
                    className="w-full bg-[#E50010] text-white py-3 rounded font-semibold hover:bg-orange-600 transition"
                    onClick={() => {
                      setLoginDone(true);
                      setStep(2);
                    }}
                  >
                    CONTINUE
                  </button>
                </>
              ) : (
                <p className="text-gray-700 text-sm">Logged in as <b>example@gmail.com</b></p>
              )}
            </div>

            <div className="w-full md:w-1/3 flex flex-col justify-center bg-gray-50 text-sm text-gray-600 space-y-4 pl-6 mt-6 md:mt-0">
              <p className="font-semibold text-gray-700">Advantages of our secure login</p>
              <div className="flex items-center space-x-2"><span>🚚</span> <p>Easily Track Orders, Hassle free Returns</p></div>
              <div className="flex items-center space-x-2"><span>🔔</span> <p>Get Relevant Alerts and Recommendations</p></div>
              <div className="flex items-center space-x-2"><span>⭐</span> <p>Wishlist, Reviews, Ratings and more.</p></div>
            </div>
          </div>

          {/* DELIVERY ADDRESS */}
          {step >= 2 && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-700">2) DELIVERY ADDRESS</h2>
                <button className="text-blue-600 text-sm font-semibold hover:underline">EDIT</button>
              </div>

              <div className="space-y-4">
                {/* Address 1 */}
                <div className="border rounded p-4 space-y-3">
                  <label className="flex items-start space-x-3">
                    <input type="radio" name="address" className="mt-1 accent-blue-600" defaultChecked />
                    <div>
                      <p className="font-semibold text-gray-700">Kushal Dubey <span className="text-xs bg-gray-200 px-2 py-0.5 rounded ml-2">HOME</span></p>
                      <p className="text-sm text-gray-700">9082342037</p>
                      <p className="text-sm text-gray-600">305, C Wing, Shree Samarth Apt, Tamboli Nagar, Kalyan(E), Maharashtra - <b>421301</b></p>
                    </div>
                  </label>
                  <button className="w-fit bg-[#E50010] text-white px-6 py-2 rounded font-semibold hover:bg-orange-600">DELIVER HERE</button>
                </div>

                {/* Address 2 */}
                <div className="border rounded p-4 space-x-3 flex items-start">
                  <input type="radio" name="address" className="mt-1 accent-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-700">Kushal Dubey <span className="text-xs bg-gray-200 px-2 py-0.5 rounded ml-2">HOME</span></p>
                    <p className="text-sm text-gray-700">9082342037</p>
                    <p className="text-sm text-gray-600">305, Shree Samarth Apt, Golivali, Kalyan(E), Maharashtra - <b>421301</b></p>
                  </div>
                </div>

                {/* Add new address */}
                <button
                  className="text-blue-600 text-sm font-semibold hover:underline"
                  onClick={() => setShowNewAddress(!showNewAddress)}
                >
                  + Add a new address
                </button>

                {showNewAddress && (
                  <div className="border rounded p-4 space-y-3">
                    <input type="text" placeholder="Full Name" className="w-full p-3 border rounded outline-blue-500" />
                    <input type="text" placeholder="10-digit mobile number" className="w-full p-3 border rounded outline-blue-500" />
                    <textarea placeholder="Address (Area and Street)" className="w-full p-3 border rounded outline-blue-500" rows="3"></textarea>
                    <input type="text" placeholder="Pincode" className="w-full p-3 border rounded outline-blue-500" />
                    <button className="w-fit bg-[#E50010] text-white px-6 py-2 rounded font-semibold hover:bg-orange-600">SAVE ADDRESS</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remaining steps */}
          <div className="p-6 border-t space-y-4 text-gray-700 font-medium">
            <div className="py-3 border rounded px-4">3 ORDER SUMMARY</div>
            <div className="py-3 border rounded px-4">4 PAYMENT OPTIONS</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default User1
