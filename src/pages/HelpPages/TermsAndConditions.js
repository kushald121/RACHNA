import React, { useState } from "react";
import { FileText, ChevronDown, Mail, Phone, MapPin } from "lucide-react";
import { NavBar, Footer } from "../../components"; // Adjust path as needed

// A reusable Accordion Item component for our terms
const AccordionItem = ({
  id,
  title,
  icon: Icon,
  children,
  isOpen,
  onToggle,
}) => {
  return (
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
            <span className="text-lg font-semibold leading-7">{title}</span>
          </div>
          <span className="ml-6 flex h-7 items-center">
            <ChevronDown
              className={`h-6 w-6 transform text-gray-500 transition-transform duration-300 ${
                isOpen ? "-rotate-180" : "rotate-0"
              }`}
              aria-hidden="true"
            />
          </span>
        </button>
      </dt>
      <dd
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-[2000px] pb-6" : "max-h-0"
        }`}
      >
        <div className="prose prose-slate max-w-none text-gray-600 prose-strong:text-gray-800 prose-a:text-cyan-600 hover:prose-a:text-cyan-700">
          {children}
        </div>
      </dd>
    </div>
  );
};

const TermsAndConditions = () => {
  const [openId, setOpenId] = useState("overview"); // Keep the overview open by default

  const handleToggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  // Storing all the text in a data structure keeps the main component clean
  const termsSections = [
    {
      id: "overview",
      title: "Overview",
      content: (
        <>
          <p>
            This website is operated by Rachna Collective. Throughout the site,
            the terms “we”, “us” and “our” refer to Rachna Collective. We offer
            this website, including all information, tools and Services
            available from this site to you, the user, conditioned upon your
            acceptance of all terms, conditions, policies and notices stated
            here.
          </p>
          <p>
            By visiting our site and/or purchasing something from us, you engage
            in our “Service” and agree to be bound by the following terms and
            conditions (“Terms of Service”, “Terms”).
          </p>
          <p>
            You can review the most current version of the Terms of Service at
            any time on this page. We reserve the right to update, change or
            replace any part of these Terms of Service. Our store is hosted on
            Shopify Inc.
          </p>
        </>
      ),
    },
    {
      id: "section1",
      title: "Section 1: Online Store Terms",
      content: (
        <p>
          By agreeing to these Terms of Service, you represent that you are at
          least the age of majority in your state or province of residence. You
          may not use our products for any illegal or unauthorized purpose. A
          breach or violation of any of the Terms will result in an immediate
          termination of your Services.
        </p>
      ),
    },
    {
      id: "section2",
      title: "Section 2: General Conditions",
      content: (
        <p>
          We reserve the right to refuse Service to anyone for any reason at any
          time. You understand that your content (not including credit card
          information), may be transferred unencrypted. Credit card information
          is always encrypted. You agree not to reproduce, duplicate, copy,
          sell, or exploit any portion of the Service without express written
          permission by us.
        </p>
      ),
    },
    {
      id: "section3",
      title: "Section 3: Accuracy of Information",
      content: (
        <p>
          We are not responsible if information made available on this site is
          not accurate, complete or current. The material on this site is
          provided for general information only. This site may contain certain
          historical information. We reserve the right to modify the contents of
          this site at any time, but we have no obligation to update any
          information.
        </p>
      ),
    },
    {
      id: "section4",
      title: "Section 4: Modifications to Service and Prices",
      content: (
        <p>
          Prices for our products are subject to change without notice. We
          reserve the right at any time to modify or discontinue the Service
          without notice at any time. We shall not be liable to you or to any
          third-party for any modification, price change, suspension or
          discontinuance of the Service.
        </p>
      ),
    },
    {
      id: "section5",
      title: "Section 5: Products or Services",
      content: (
        <>
          <p>
            Certain products or Services may be available exclusively online.
            These products or Services may have limited quantities and are
            subject to return or exchange only according to our{" "}
            <a href="/refund-policy">Refund Policy</a>.
          </p>
          <p>
            We reserve the right to limit the sales of our products or Services
            to any person or jurisdiction. All descriptions of products or
            product pricing are subject to change at anytime without notice.
          </p>
        </>
      ),
    },
    {
      id: "section6",
      title: "Section 6: Accuracy of Billing Information",
      content: (
        <>
          <p>
            We reserve the right to refuse any order you place with us. We may,
            in our sole discretion, limit or cancel quantities purchased per
            person, per household or per order. You agree to provide current,
            complete and accurate purchase and account information for all
            purchases made at our store.
          </p>
          <p>
            For more details, please review our{" "}
            <a href="/refund-policy">Refund Policy</a>.
          </p>
        </>
      ),
    },
    {
      id: "section7",
      title: "Section 7: Optional Tools",
      content: (
        <p>
          We may provide you with access to third-party tools over which we
          neither monitor nor have any control. You acknowledge and agree that
          we provide access to such tools ”as is” and “as available” without any
          warranties. We shall have no liability whatsoever arising from or
          relating to your use of optional third-party tools.
        </p>
      ),
    },
    {
      id: "section8",
      title: "Section 8: Third-Party Links",
      content: (
        <p>
          Third-party links on this site may direct you to third-party websites
          that are not affiliated with us. We are not responsible for examining
          or evaluating the content or accuracy and we do not warrant and will
          not have any liability for any third-party materials or websites.
        </p>
      ),
    },
    {
      id: "section9",
      title: "Section 9: User Comments and Feedback",
      content: (
        <p>
          If you send creative ideas, suggestions, or other materials
          ('comments'), you agree that we may, at any time, without restriction,
          edit, copy, publish, and distribute them. We are under no obligation
          to maintain comments in confidence, pay for comments, or respond to
          comments. You agree that your comments will not violate any right of
          any third-party, including copyright, trademark, and privacy.
        </p>
      ),
    },
    {
      id: "section10",
      title: "Section 10: Personal Information",
      content: (
        <p>
          Your submission of personal information through the store is governed
          by our <a href="/privacy-policy">Privacy Policy</a>.
        </p>
      ),
    },
    {
      id: "section11",
      title: "Section 11: Errors and Omissions",
      content: (
        <p>
          Occasionally there may be information on our site that contains
          typographical errors, inaccuracies or omissions. We reserve the right
          to correct any errors, and to change or update information or cancel
          orders if any information in the Service is inaccurate at any time
          without prior notice.
        </p>
      ),
    },
    {
      id: "section12",
      title: "Section 12: Prohibited Uses",
      content: (
        <p>
          You are prohibited from using the site for any unlawful purpose, to
          infringe upon our intellectual property rights, to harass, abuse, or
          discriminate, to submit false information, to upload viruses, to
          collect personal information of others, to spam, or to interfere with
          security features.
        </p>
      ),
    },
    {
      id: "section13",
      title: "Section 13: Disclaimer & Limitation of Liability",
      content: (
        <p>
          We do not guarantee that your use of our Service will be uninterrupted
          or error-free. Your use of the Service is at your sole risk. In no
          case shall Ajeeb Collective, our directors, officers, or employees be
          liable for any injury, loss, claim, or any direct, indirect,
          incidental, or consequential damages of any kind.
        </p>
      ),
    },
    {
      id: "section14",
      title: "Section 14: Indemnification",
      content: (
        <p>
          You agree to indemnify, defend and hold harmless Ajeeb Collective and
          our parent, subsidiaries, affiliates, partners, and employees from any
          claim or demand, including reasonable attorneys’ fees, made by any
          third-party due to or arising out of your breach of these Terms of
          Service.
        </p>
      ),
    },
    {
      id: "section15",
      title: "Section 15: Severability",
      content: (
        <p>
          In the event that any provision of these Terms of Service is
          determined to be unlawful or unenforceable, such provision shall be
          deemed to be severed from these Terms, and the determination shall not
          affect the validity and enforceability of any other remaining
          provisions.
        </p>
      ),
    },
    {
      id: "section16",
      title: "Section 16: Termination",
      content: (
        <p>
          These Terms of Service are effective unless and until terminated by
          either you or us. If we suspect that you have failed to comply with
          any term, we may terminate this agreement at any time without notice.
        </p>
      ),
    },
    {
      id: "section17",
      title: "Section 17: Entire Agreement",
      content: (
        <p>
          The failure of us to exercise or enforce any right or provision of
          these Terms of Service shall not constitute a waiver of such right or
          provision. These Terms of Service constitute the entire agreement and
          understanding between you and us.
        </p>
      ),
    },
    {
      id: "section18",
      title: "Section 18: Governing Law",
      content: (
        <p>
          These Terms of Service shall be governed by and construed in
          accordance with the laws of Pakistan.
        </p>
      ),
    },
    {
      id: "section19",
      title: "Section 19: Changes to Terms",
      content: (
        <p>
          We reserve the right to update, change or replace any part of these
          Terms of Service by posting updates to our website. It is your
          responsibility to check this page periodically for changes.
        </p>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavBar />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative isolate overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Terms of Conditions
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Welcome to Rachna Collective. Here are the rules of the road for
              using our services. Please read them carefully.
            </p>
          </div>
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

        {/* Accordion Terms Section */}
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <dl className="space-y-2">
            {termsSections.map((section) => (
              <AccordionItem
                key={section.id}
                id={section.id}
                title={section.title}
                icon={FileText} // Using a consistent icon for all terms
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
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 text-center">
              Have Questions?
            </h2>
            <p className="mt-2 text-center text-gray-600">
              If you’d like to exercise your rights or have questions about our
              privacy practices, please contact us.
            </p>
            <div className="mt-8 space-y-5 text-gray-700">
              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-cyan-600 flex-shrink-0" />
                <span>+91 315 2439846</span>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-cyan-600 flex-shrink-0" />
                <span>rachnacollective@gmail.com</span>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-cyan-600 flex-shrink-0 mt-1" />
                <span>1234 Fashion St, Style City, SC 12345</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;
