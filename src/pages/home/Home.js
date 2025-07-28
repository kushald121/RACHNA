import React, { useState } from 'react';
import { Banner, Brands, Footer, Header, NavBar, Previews, ProductsContent } from '../../components';

const Home = () => {
  // Toggle between banner states
  const[toggleBanner, setToggleBanner] = useState(true);

  return (
    <div className='landing-page'>
        {/*Universal skeleton layout for the entire webpage*/}
        <Banner trigger={toggleBanner} setTrigger={setToggleBanner}/>
        <NavBar />
        <Header />
        <Previews />
        <ProductsContent />
        <Brands />
        <Footer />
    </div>
  )
}

export default Home