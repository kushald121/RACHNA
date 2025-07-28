import React, { useState } from 'react';
import {
  Undo2,
  ShieldAlert,
  Ban,
  Replace,
  Wallet,
  Globe,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { NavBar, Footer } from '../../components'; // Adjust path as needed

// Reusable Accordion Item component for a consistent look
const AccordionItem = ({ id, title, icon: Icon, children, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200">
      <dt>
        <button
          onClick={() => onToggle(id)}
          className="flex w-full items-center justify-between py-6 text-left text-gray-900"
        >
          <div className="flex items-center gap-x-4">
            <Icon className="h-7 w-7 text-cyan-600 flex-shrink-0" aria-hidden="true" />
            <span className="text-lg font-semibold leading-7">{title}</span>
          </div>
          <span className="ml-6 flex h-7 items-center">
            <ChevronDown
              className={`h-6 w-6 transform text-gray-500 transition-transform duration-300 ${
                isOpen ? '-rotate-180' : 'rotate-0'
              }`}
              aria-hidden="true"
            />
          </span>
        </button>
      </dt>
      <dd
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-[1000px] pb-6' : 'max-h-0'
        }`}
      >
        <div className="prose prose-slate max-w-none text-gray-600 prose-strong:text-gray-800 prose-a:text-cyan-600 hover:prose-a:text-cyan-700">
          {children}
        </div>
      </dd>
    </div>
  );
};

const RefundPolicy = () => {
  const [openId, setOpenId] = useState('how-to-return'); // Keep the most important section open by default

  const handleToggle = (id) => {
    setOpenId(openId === id ? null : id);
  };
  
  // Storing policy sections in a data structure for clean code
  const policySections = [
    {
      id: 'how-to-return',
      title: 'How to Start a Return',
      icon: Undo2,
      content: (
        <>
          <p>
            We have a 14-day return policy, which means you have 14 days after receiving your item to request a return.
          </p>
          <p>
            <strong>Eligibility Requirements:</strong> To be eligible for a return, your item must be in the same condition that you received it—unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.
          </p>
          <p>
            <strong>To start a return,</strong> please contact us at <a href="mailto:ajeebcollective@gmail.com">ajeebcollective@gmail.com</a>. If your return is accepted, we’ll send you a return shipping label and instructions. Returns should be sent to: <strong>Gulshan block 5, house no A-201.</strong>
          </p>
          <p>
            Items sent back to us without first requesting a return will not be accepted.
          </p>
        </>
      ),
    },
    {
      id: 'damages-and-issues',
      title: 'Damages and Issues',
      icon: ShieldAlert,
      content: <p>Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.</p>
    },
    {
      id: 'exceptions',
      title: 'Exceptions / Non-Returnable Items',
      icon: Ban,
      content: (
        <>
          <p>Certain types of items cannot be returned, like perishable goods (such as food, flowers, or plants), custom products (such as special orders or personalized items), and personal care goods (such as beauty products). We also do not accept returns for hazardous materials, flammable liquids, or gases.</p>
          <p>Unfortunately, we cannot accept returns on <strong>sale items</strong> or <strong>gift cards</strong>. Please get in touch if you have questions or concerns about your specific item.</p>
        </>
      ),
    },
    {
      id: 'exchanges',
      title: 'Exchanges',
      icon: Replace,
      content: <p>The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.</p>
    },
    {
      id: 'refunds',
      title: 'Refunds Process',
      icon: Wallet,
      content: (
        <>
          <p>We will notify you once we’ve received and inspected your return, and let you know if the refund was approved. If approved, you’ll be automatically refunded on your original payment method within 10 business days.</p>
          <p>Please remember it can take some time for your bank or credit card company to process and post the refund too. If more than 15 business days have passed since we’ve approved your return, please contact us at <a href="mailto:ajeebcollective@gmail.com">ajeebcollective@gmail.com</a>.</p>
        </>
      ),
    },
    {
      id: 'eu-policy',
      title: 'European Union 14-Day Cooling Off Period',
      icon: Globe,
      content: <p>Notwithstanding the above, if merchandise is being shipped into the European Union, you have the right to cancel or return your order within 14 days, for any reason and without a justification. As above, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.</p>
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavBar />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative isolate overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Refund Policy
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Simple, fair, and transparent. Here’s everything you need to know about our return process.
            </p>
          </div>
          <div className="absolute inset-x-0 top-0 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl">
            <div
              className="aspect-[1500/1036] w-[90rem] flex-none bg-gradient-to-r from-[#00c4ff] to-[#34d399] opacity-25"
              style={{
                clipPath: 'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 1.3% 63.9%, 12.9% 24.9%, 27.2% 38.6%, 73.6% 51.7%)',
              }}
            />
          </div>
        </div>

        {/* Accordion Policy Section */}
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <dl className="space-y-2">
            {policySections.map((section) => (
              <AccordionItem 
                key={section.id}
                id={section.id}
                title={section.title}
                icon={section.icon}
                isOpen={openId === section.id}
                onToggle={handleToggle}
              >
                {section.content}
              </AccordionItem>
            ))}
          </dl>
        </div>

        {/* Contact Section */}
        <div className="mx-auto my-24 max-w-4xl px-6 sm:my-32 lg:px-8">
            <div className="rounded-2xl bg-slate-50 p-8 ring-1 ring-slate-900/10 shadow-xl shadow-cyan-600/10">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 text-center">Need Help with a Return?</h2>
                <p className="mt-2 text-center text-gray-600">
                    Our team is here to assist with any questions you may have.
                </p>
                <div className="mt-8 space-y-5 text-gray-700">
                    <div className="flex items-center gap-4">
                      <Mail className="h-6 w-6 text-cyan-600 flex-shrink-0" />
                      <a href="mailto:rachnacollective@gmail.com" className="hover:underline">rachnacollective@gmail.com</a>
                    </div>
                  </div>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RefundPolicy;
