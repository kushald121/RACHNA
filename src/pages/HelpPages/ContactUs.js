import React from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { NavBar, Footer } from "../../components"; // Adjust path as needed

const ContactUs = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavBar />

      <main className="flex-grow flex items-center justify-center bg-gray-50 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Contact RACHNA Collective
          </h1>

          <div className="space-y-5 text-gray-700">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-cyan-600" />
              <span>0315 2439846</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-cyan-600" />
              <span>rachnacollective@gmail.com</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-cyan-600" />
              <span>
                1234 Fashion St, Style City, SC 12345
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-cyan-600" />
              <span>Operational Hours: 12pm — 9pm</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;
