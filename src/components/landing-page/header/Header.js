import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import img1 from "../../../assets/hero/heroimg1.jpg"
import img2 from "../../../assets/hero/heroimg2.jpg"
import img3 from "../../../assets/hero/heroimg3.jpg"
import img4 from "../../../assets/hero/heroimg4.jpg"
import img5 from "../../../assets/hero/heroimg5.jpg"
import img6 from "../../../assets/hero/heroimg6.jpg"
import img7 from "../../../assets/hero/heroimg7.jpg"


const Header = () => {
  // stagger motion animation
  const containerMotion = {
    visible: { transition: { staggerChildren: 0.2 } },
  };

  // animation parameters for TEXT
  const textMotion = {
    // movement = FADE-IN + UPWARDS movement
    hidden: { opacity: 0, x: -50 }, // INITIAL STAGE
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeInOut' }}, // ANIMATION STAGE
  };

  // animation parameters for IMAGE
  const colMotion_UP = {
    // movement = FADE-IN + SLIDE UP
    hidden: { opacity: 0, y: 100 }, // INITIAL STAGE
    visible: { opacity: 1, y: 0, transition: { duration: 1.25, ease: 'easeInOut' } }, // ANIMATION STAGE
  };
  
  // animation parameters for IMAGE
  const colMotion_DOWN = {
    // movement = FADE-IN + SLIDE DOWN
    hidden: { opacity: 0, y: -100 }, // INITIAL STAGE
    visible: { opacity: 1, y: 0, transition: { duration: 1.25, ease: 'easeInOut' } }, // ANIMATION STAGE
  };

  return (
    <div className="relative overflow-hidden bg-white">
      {/* INITIAL PAGE SETUPS -> TAILWINDCSS */}
      <div className="pb-80 pt-12 sm:pb-40 sm:pt-24 lg:pb-48 lg:pt-40">
        <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
          
          {/* HEADING TEXT */}
          <motion.div className="sm:max-w-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{once: true, amount: 0.2}}
            variants={containerMotion}>
            <motion.h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl" variants={textMotion}>
              Indulge in the
            </motion.h1>
            <motion.h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-l from-blue-500 to-purple-500 sm:text-6xl" variants={textMotion}>
              extraordinary
            </motion.h1>
            <motion.h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mt-2" variants={textMotion}>
              A New Dimension to Style.
            </motion.h1>
            {/* SUBHEADING TEXT */}
            <motion.p className="mt-4 text-xm text-gray-500" variants={textMotion}>
            Inspired by the cosmic wonders, we curated a collection that blends elegance, innovation, and a touch of magic. Here, its one small step for RACHNA, one celestial leap for fashion.
            </motion.p>
          </motion.div>

          <motion.div className="mt-10"
            initial="hidden"
            whileInView="visible"
            viewport={{once: true, amount: 0.2}}
            variants={containerMotion}
            >
            {/* HEADER IMAGES */}
            <div
              aria-hidden="true"
              className="pointer-events-none lg:absolute lg:inset-y-0 lg:mx-auto lg:w-full lg:max-w-7xl"
            >
              <div className="absolute transform sm:left-1/2 sm:top-0 sm:translate-x-8 lg:left-1/2 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-8">
                <div className="flex items-center space-x-6 lg:space-x-8">
                  {/* IMAGE COLUMN #1 */}
                  <motion.div className="grid flex-shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8" variants={colMotion_DOWN}>
                    <div className="h-64 w-44 overflow-hidden rounded-lg sm:opacity-0 lg:opacity-100 shadow-xl">
                        <img
                          src= {img1}
                          alt="model-1-F"
                          className="h-full w-full object-cover object-center"
                        />
                    </div>
                    <div className="h-64 w-44 overflow-hidden rounded-lg shadow-xl">
                      <img
                        src= {img6}
                        alt="model-2-M"
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                  </motion.div>

                  {/* IMAGE COLUMN #2 */}
                  <motion.div className="grid flex-shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8" variants={colMotion_UP}>
                    <div className="h-64 w-44 overflow-hidden rounded-lg shadow-xl">
                      <img
                        src= {img5}
                        alt="model-3-F"
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="h-64 w-44 overflow-hidden rounded-lg shadow-xl">
                      <img
                        src= {img7}            alt="model-4-M"
                        className="h-full w-full object-cover object-center shadow-xl"
                      />
                    </div>
                    <div className="h-64 w-44 overflow-hidden rounded-lg shadow-xl">
                      <img
                        src= {img3}
                        alt="model-5-F"
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                  </motion.div>

                  {/* IMAGE COLUMN #3 */}
                  <motion.div className="grid flex-shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8" variants={colMotion_DOWN}>
                    <div className="h-64 w-44 overflow-hidden rounded-lg shadow-xl">
                      <img
                        src= {img4}
                        alt="model-6-F"
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="h-64 w-44 overflow-hidden rounded-lg shadow-xl">
                      <img
                        src= {img2}
                        alt="model-7-M"
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>

            </div>

            {/* HEADER BUTTON */}
            <motion.span variants={textMotion}>
              <Link to="/Rachna/allproducts/" className="inline-block rounded-full border border-transparent bg-indigo-600 px-4 lg:px-8 py-2 lg:py-3 text-center font-medium text-white transition-transform duration-300 transform hover:scale-95 hover:bg-gradient-to-l from-blue-500 to-purple-500 shadow-lg">
                Explore Collection
              </Link>
            </motion.span>
            
          </motion.div>

        </div>
      </div>
    </div>
  )
}

export default Header