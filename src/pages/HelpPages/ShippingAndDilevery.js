import React, { useState } from "react";
import {
  Package,
  Truck,
  Globe,
  BadgeCheck,
  DollarSign,
  MapPin,
  Mail,
  AlertTriangle,
  Clock,
  Shield,
  ChevronDown,
  Phone,
} from "lucide-react";
import { NavBar, Footer } from "../../components"; // Adjust path if needed

// Accordion component for policy sections
const AccordionItem = ({
  id,
  title,
  icon: Icon,
  children,
  isOpen,
  onToggle,
}) => (
  <div className="border-b border-gray-200">
    <dt>
      <button
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between py-6 text-left text-gray-900"
      >
        <div className="flex items-center gap-x-4">
          <Icon
            className="h-7 w-7 text-cyan-600 flex-shrink-0"
            aria-hidden="true"
          />
          <span className="text-lg font-semibold">{title}</span>
        </div>
        <span className="ml-6 flex h-7 items-center">
          <ChevronDown
            className={`h-6 w-6 text-gray-500 transform transition-transform duration-300 ${
              isOpen ? "-rotate-180" : "rotate-0"
            }`}
            aria-hidden="true"
          />
        </span>
      </button>
    </dt>
    <dd
      className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isOpen ? "max-h-[800px] pb-6" : "max-h-0"
      }`}
    >
      <div className="prose prose-slate max-w-none text-gray-600 prose-strong:text-gray-800 prose-a:text-cyan-600 hover:prose-a:text-cyan-700">
        {children}
      </div>
    </dd>
  </div>
);

const shippingSections = [
  {
    id: "processing",
    title: "Processing Time",
    icon: Clock,
    content: (
      <ul>
        <li>
          All orders are processed within <strong>3-5 business days.</strong>
        </li>
        <li>Orders are not shipped or delivered on weekends or holidays.</li>
      </ul>
    ),
  },
  {
    id: "rates",
    title: "Shipping Rates & Methods",
    icon: Truck,
    content: (
      <>
        <p>
          Shipping charges for your order will be calculated and displayed at
          checkout. We offer standard and expedited shipping options.
        </p>
        <ul>
          <li>
            <strong>Free shipping</strong> may be available for orders over{" "}
            <strong>Rs. 7000</strong>.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "domestic",
    title: "Domestic Shipping (Pakistan)",
    icon: MapPin,
    content: (
      <ul>
        <li>Shipping is offered within Pakistan.</li>
        <li>
          <strong>Standard shipping:</strong> 3-5 business days.
        </li>
        <li>
          <strong>Expedited shipping:</strong> Available at checkout for faster
          delivery.
        </li>
      </ul>
    ),
  },
  {
    id: "international",
    title: "International Shipping",
    icon: Globe,
    content: (
      <p>
        <strong>We currently do not offer international shipping.</strong>
      </p>
    ),
  },
  {
    id: "confirmation",
    title: "Shipment Confirmation & Tracking",
    icon: BadgeCheck,
    content: (
      <ul>
        <li>
          You will receive a shipment confirmation email once your order has
          shipped, including tracking number(s).
        </li>
      </ul>
    ),
  },
  {
    id: "taxes",
    title: "Customs, Duties & Taxes",
    icon: DollarSign,
    content: (
      <ul>
        <li>
          Ajeeb Collective is not responsible for any customs and taxes applied
          to your order.
        </li>
        <li>
          All fees imposed during or after shipping (tariffs, taxes, etc.) are
          the customer’s responsibility.
        </li>
      </ul>
    ),
  },
  {
    id: "damages",
    title: "Damages",
    icon: Shield,
    content: (
      <ul>
        <li>
          Ajeeb Collective is not liable for products damaged or lost during
          shipping.
        </li>
        <li>
          If you received your order damaged, please contact the shipment
          carrier or our support for assistance.
        </li>
      </ul>
    ),
  },
  {
    id: "returns",
    title: "Returns & Refunds",
    icon: Package,
    content: (
      <p>
        Please review our <a href="/refund-policy">Return Policy</a> for
        complete information on returns and refunds.
      </p>
    ),
  },
  {
    id: "lost",
    title: "Lost Packages",
    icon: AlertTriangle,
    content: (
      <ul>
        <li>
          If your order is marked as delivered but not received, check with your
          local postal service and neighbors.
        </li>
        <li>
          Still missing? <strong>Contact us within 3 days</strong> of the marked
          delivery date.
        </li>
      </ul>
    ),
  },
  {
    id: "address",
    title: "Address Accuracy",
    icon: MapPin,
    content: (
      <p>
        Please ensure your shipping address is accurate and complete. We are not
        responsible for orders shipped to incorrect addresses.
      </p>
    ),
  },
  {
    id: "delays",
    title: "Delivery Delays",
    icon: Truck,
    content: (
      <p>
        We are not responsible for delivery delays caused by unforeseen
        circumstances, natural disasters, or events beyond our control.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact Information",
    icon: Mail,
    content: (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-cyan-600" />
          <a href="mailto:rachnacollective@gmail.com">
            rachnacollective@gmail.com
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-cyan-600" />
          <a href="tel:03152439846">0315 2439846</a>
        </div>
      </div>
    ),
  },
];

const ShippingAndDilevery = () => {
  const [openId, setOpenId] = useState("processing");

  const handleToggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavBar />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative isolate overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Shipping & Delivery Policy
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about shipping, delivery times, and
              what to expect with your Ajeeb Collective order.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Effective as of 11/23/2023 · Subject to change without notice
            </p>
          </div>
          {/* Subtle decorative background gradient */}
          <div className="absolute inset-x-0 top-0 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl">
            <div
              className="aspect-[1500/1036] w-[90rem] flex-none bg-gradient-to-r from-[#00c4ff] to-[#34d399] opacity-25"
              style={{
                clipPath:
                  "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 1.3% 63.9%, 12.9% 24.9%, 27.2% 38.6%, 73.6% 51.7%)",
              }}
            />
          </div>
        </div>

        {/* Accordion Section */}
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <dl className="space-y-2">
            {shippingSections.map((section) => (
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
      </main>

      <Footer />
    </div>
  );
};

export default ShippingAndDilevery;
