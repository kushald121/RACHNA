import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// ENTER TEXT DESCRIPTIONS HERE
const callouts = [
  {
    name: 'Anime Collection',
    description: 'For anime fans, with popular characters and designs.',
    imageSrc: 'https://thalasiknitfab.com/cdn/shop/files/ANIMEOVERSIZEDTSHIRT_6e28c0e6-b2a8-4932-a59b-4cc93ec85245_490x.progressive.png.jpg?v=1734612522',
    imageAlt: 'trending collection #1',
    to: '/Rachna/new-arrivals/',
  },
  {
    name: 'Plain Basics',
    description: 'Clean, simple, plain-colored t-shirts for daily wear',
    imageSrc: 'https://triprindia.com/cdn/shop/files/TGYRNOS-PLAIND1651.jpg?v=1741861583',
    imageAlt: 'trending collection #2',
    to: '/Rachna/summer-sale/',
  },
  {
    name: 'Oversized Streetwear',
    description: 'Trendy oversized fits with street-style vibes.',
    imageSrc: 'https://tenshi-streetwear.com/cdn/shop/products/Tatsuo-Oversized-T-Shirt-tenshi-streetwear_1600x.jpg?v=1647030301',
    imageAlt: 'trending collection #3',
    to: '/luna-demo/activewear/',
  },
  {
    name: 'Graphic Prints',
    description: 'Bold designs, quotes, cartoons, and fun graphics.',
    imageSrc: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRfVdIvSJietmqzxSOCZfuVVYLDElb8kgStk7ECGtDsva8gAsD61Pzu-BcTcLVofdyQU__QgWE2JH_HZQ7DB0W8e1t4JoOBt7qxWlhmro49KXzyd5SIAxd5',
    imageAlt: 'trending collection #3',
    to: '/luna-demo/accessories/',
  },
  {
    name: 'Minimal Aesthetic ',
    description: 'Subtle logos, neutral tones, and classy minimal designs.',
    imageSrc: 'https://i.pinimg.com/736x/1d/85/a1/1d85a13d1e24ee2d8b0244118309a910.jpg',
    imageAlt: 'trending collection #3',
    to: '/Rachna/accessories/',
  },
  {
    name: 'Customizable T-Shirts',
    description: 'Personalize your desired tshirt.',
    imageSrc: 'https://www.yourprint.in/wp-content/uploads/2023/10/mens-t-shirt.jpg',
    imageAlt: 'trending collection #3',
    to: '/Rachna/accessories/',
  },
  {
    name: 'Customized Hoodies',
    description: 'Personalize your desired tshirt.',
    imageSrc: ' https://www.yourprint.in/wp-content/uploads/2023/10/mens-hoodie.jpg',
    imageAlt: 'trending collection #3',
    to: '/Rachna/accessories/',
  },
]

const Previews = () => {
  // stagger motion animation
  const containerMotion = {
    visible: { transition: { staggerChildren: 0.1 } },
  };

  // animation parameters for TEXT
  const textMotion = {
    // movement = FADE-IN + UPWARDS movement
    hidden: { opacity: 0, y: -50 }, // INITIAL STAGE
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' }}, // ANIMATION STAGE
  };

  // animation parameters for IMAGE
  const imageMotion = {
    // movement = FADE-IN + SLIDE DOWN
    hidden: { opacity: 0 }, // INITIAL STAGE
    visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeInOut' } }, // ANIMATION STAGE
  };

  return (
    <div className="bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div className="mx-auto max-w-2xl py-14 lg:max-w-none lg:py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{once: true, amount: 0.2}}
          variants={containerMotion}
          >
          {/* SECTION TEXT */}
          <div className='flex'>
            <motion.h2 className="text-2xl font-bold text-gray-900 mr-1.5" variants={textMotion}>
              Explore
            </motion.h2>
            <motion.h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-blue-500 to-purple-500 mr-1.5" variants={textMotion}>
              Trending
              </motion.h2>
            <motion.h2 className="text-2xl font-bold text-gray-900" variants={textMotion}>
              Collections
            </motion.h2>
          </div>

          {/* REUSABLE TEMPlATE FORMAT */}
          <div className="mt-6 space-y-12 lg:grid sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6 lg:space-y-0">
            {callouts.map((callout) => (
              <div key={callout.name} className="group relative">
                
                {/* Collection Image */}
                <motion.div className="relative h-80 w-full overflow-hidden rounded-lg bg-white sm:aspect-h-1 sm:aspect-w-2 lg:aspect-h-1 lg:aspect-w-1 shadow-xl transition-transform duration-300 transform group-hover:scale-95 sm:h-64" variants={imageMotion}>
                  <Link to={callout.to}>
                    <img
                      src={callout.imageSrc}
                      alt={callout.imageAlt}
                      className="h-full w-full object-cover object-center group-hover:opacity-80"
                    />
                  </Link>
                </motion.div>

                {/* TEXT SECTION */}
                <motion.span variants={textMotion}>
                  {/* Collection Title */}
                  <h3 className="mt-6 text-1xl font-none text-indigo-600">
                    <a href={callout.href}>
                      {callout.name}
                    </a>
                  </h3>

                  {/* Collection Description */}
                  <p className="text-base font-semibold text-gray-900">{callout.description}</p>
                  
                </motion.span>

              </div>
            ))}
          </div>

        </motion.div>
      </div>
    </div>
  )
}

export default Previews