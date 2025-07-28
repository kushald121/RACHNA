import React from "react";
import { ShieldCheck, Eye, Keyboard, MessageSquare } from "lucide-react";
import { NavBar, Footer } from "../../components"; 

const Accessibility = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />

      {/* Main Content Area */}
      <main className="flex-grow bg-white">
        
        {/* Hero Section */}
        <div className="relative isolate overflow-hidden pt-16 sm:pt-24 lg:pt-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <div className="mx-auto max-w-4xl">
              <p className="text-lg font-semibold leading-8 text-cyan-600">
                Inclusivity First
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                Accessibility for Everyone
              </h1>
              <p className="mt-6 text-xl leading-8 text-gray-600">
                We're dedicated to ensuring our digital storefront is welcoming
                and usable for all our customers.
              </p>
            </div>
          </div>
          {/* Background decorative gradient */}
          <div className="absolute inset-x-0 top-0 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl">
            <div
              className="aspect-[1500/1036] w-[90rem] flex-none bg-gradient-to-r from-[#80ff8d] to-[#00c4ff] opacity-20"
              style={{
                clipPath:
                  "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 1.3% 63.9%, 12.9% 24.9%, 27.2% 38.6%, 73.6% 51.7%)",
              }}
            />
          </div>
        </div>

        {/* Commitment Section */}
        <div className="mx-auto mt-24 max-w-7xl px-6 sm:mt-32 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
              <div className="text-base leading-7 text-gray-700 lg:pt-2">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Our Commitment
                </h2>
                <p className="mt-6 text-lg leading-8">
                  We believe the web should be available and accessible to
                  anyone, regardless of circumstance and ability. To fulfill
                  this, we aim to adhere as strictly as possible to the World
                  Wide Web Consortium’s (W3C) Web Content Accessibility
                  Guidelines 2.1 (WCAG 2.1) at the AA level.
                </p>
                <p className="mt-8 text-lg leading-8">
                  These guidelines explain how to make web content more
                  accessible for people with a wide array of disabilities.
                  Complying with these standards helps us provide a site that is
                  accessible to everyone, from the blind to the motor-impaired.
                </p>
              </div>
              <div className="mt-12 sm:mt-16 lg:mt-0">
                <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-xl">
                  <img
                    className="w-full h-96 object-cover"
                    src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                    alt="Customer making a seamless payment at a modern checkout counter"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mx-auto mt-24 max-w-7xl px-6 sm:mt-32 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How We Improve Your Experience
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-gray-600">
              We've built several key features into our platform to ensure a
              smooth journey.
            </p>
          </div>
          <div className="mt-16 grid max-w-2xl mx-auto grid-cols-1 gap-8 md:max-w-none md:grid-cols-3">
            {[
              {
                name: "Full Keyboard Navigation",
                description:
                  'Our entire website can be navigated using a keyboard, including "skip to main content" links to bypass repetitive sections.',
                icon: Keyboard,
              },
              {
                name: "Screen Reader & Visuals",
                description:
                  "We use descriptive alt-text for images, semantic headings, and maintain high color contrast with resizable fonts for clarity.",
                icon: Eye,
              },
              {
                name: "Understandable & Robust Content",
                description:
                  "Our site has a logical structure and responsive design. Forms are clearly labeled and video content includes captions.",
                icon: ShieldCheck,
              },
            ].map((feature) => (
              <div
                key={feature.name}
                className="flex flex-col p-8 bg-slate-50/70 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-cyan-100/70 text-cyan-600">
                  <feature.icon size={28} aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-xl font-semibold leading-7 text-gray-900">
                  {feature.name}
                </h3>
                <p className="mt-2 flex-auto text-base leading-7 text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback CTA Section */}
        <div className="relative mt-24 sm:mt-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl rounded-2xl sm:px-16">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Help us do even better.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
                Your feedback is invaluable. If you encountered any issue or
                have a suggestion, please don't hesitate to reach out.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  href="mailto:accessibility@yourcompany.com"
                  className="inline-flex items-center justify-center rounded-md bg-cyan-500 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-cyan-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors duration-300"
                >
                  <MessageSquare
                    className="-ml-0.5 mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  Contact Support
                </a>
              </div>
              {/* Background decorative gradient */}
              <svg
                viewBox="0 0 1024 1024"
                className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
                aria-hidden="true"
              >
                <circle
                  cx={512}
                  cy={512}
                  r={512}
                  fill="url(#8d958450-c69f-4251-94bc-4e091a323369)"
                  fillOpacity="0.7"
                />
                <defs>
                  <radialGradient id="8d958450-c69f-4251-94bc-4e091a323369">
                    <stop stopColor="#00c4ff" />
                    <stop offset={1} stopColor="#34d399" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </main>

      {/* Spacer div to push footer down, only visible if content is short */}
      <div className="py-12 bg-white"></div>
      <Footer />
    </div>
  );
};

export default Accessibility;
