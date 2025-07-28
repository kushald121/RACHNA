import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from "react-helmet"; //browser tab and icon customization
import Payment from "./pages/home/payment"
import User1 from "./pages/sign-in/User1";
import AdminLogin from './pages/admin/AdminLogin.js';
import Fav from '../src/pages/favorites/Fav.js';
import AdminProductPages from './pages/product/AdminProductPages.js';
import ProductOverview from './pages/product/ProductOverview.js';
import AllProductsPage from './pages/product/AllProductsPage.js';
import Accessibility from './pages/HelpPages/Accessibility.js';
import ContactUs from './pages/HelpPages/ContactUs.js';
import PrivacyPolicy from './pages/HelpPages/PrivacyPolicy.js';
import TermsAndConditions from './pages/HelpPages/TermsAndConditions.js';
import RefundPolicy from './pages/HelpPages/RefundPolicy.js';
import ShippingAndDilevery from './pages/HelpPages/ShippingAndDilevery.js';

// Core Function
import { Home, Error, SignIn, NewArrivals } from './pages';

// Men Clothing
import {
  Men, MenClothing, MenAccesories, MenBrands,
  Tops, Bottoms, Innerwear, Outerwear, Activewear,
  Hats, Sunglasses, Belts, Wallets, BagsBackpacks
} from './pages';

import {
  Nike1, Nike2, Nike3, Nike4, Nike5,
  Zara1, Zara2, Zara3, Zara4, Zara5,
  TommyJohn1, TommyJohn2, TommyJohn3, TommyJohn4, TommyJohn5,
  NorthFace1, NorthFace2, NorthFace3, NorthFace4, NorthFace5,
  GymShark1, GymShark2, GymShark3, GymShark4, GymShark5,
  Adidas1, Adidas2, Adidas3, Adidas4, Adidas5,
} from './pages';


// Women Clothing

const App = () => {
  return (
    <Router> {/* Move the Router component here */}
      <div className="App">
        {/*Website TAB Description*/}
        <Helmet>
          <meta charSet="utf-8" />
          <title>Luna - Voyage On | Modern Collection for Men's & Women's Clothing</title>
          <link rel="canonical" href="https://www.google.com/" />
          <meta name="description" content="© 2023 Luna Inc. All Rights Reserved." />
        </Helmet>

        <Routes>
          <Route exact path="/luna-demo/" element={<Home />} />
          {/* Payment */}
          <Route path="/luna-demo/payment" element={<Payment />} />



          {/* Userlog */}


          {/* Other */}
          <Route path="/luna-demo/error/" element={<Error />} />
          <Route path="/luna-demo/sign-in/" element={<SignIn />} />
          <Route path="/luna-demo/new-arrivals/" element={<NewArrivals />} />
          <Route path="/luna-demo/admin-login/" element={<AdminLogin />} />
          <Route path="/luna-demo/favorites/" element={<Fav />} />
          <Route path="/luna-demo/productpages/" element={<AdminProductPages />} />
          <Route path="/luna-demo/productoverview/" element={<ProductOverview />} />
          <Route path="/luna-demo/allproducts/" element={<AllProductsPage />} />
          <Route path="/luna-demo/accessibility/" element={<Accessibility />} />
          <Route path="/luna-demo/contactus/" element={<ContactUs />} />
          <Route path="/luna-demo/privacypolicy/" element={<PrivacyPolicy />} />
          <Route path="/luna-demo/termsandconditions/" element={<TermsAndConditions />} />
          <Route path="/luna-demo/refundpolicy/" element={<RefundPolicy />} />
          <Route path="/luna-demo/shippinganddelivery/" element={<ShippingAndDilevery />} />

            {/* Men Clothing */}
          <Route path="/luna-demo/men/" element={<Men />} />
          <Route path="/luna-demo/men/clothing/" element={<MenClothing />} />
          <Route path="/luna-demo/men/accessories/" element={<MenAccesories />} />
          <Route path="/luna-demo/men/brands/" element={<MenBrands />} />

          <Route path="/luna-demo/men/clothing/tops/" element={<Tops />} />
          <Route path="/luna-demo/men/clothing/bottoms/" element={<Bottoms />} />
          <Route path="/luna-demo/men/clothing/innerwear/" element={<Innerwear />} />
          <Route path="/luna-demo/men/clothing/outerwear/" element={<Outerwear />} />
          <Route path="/luna-demo/men/clothing/activewear/" element={<Activewear />} />

          <Route path="/luna-demo/men/accessories/hats" element={<Hats />} />
          <Route path="/luna-demo/men/accessories/sunglasses" element={<Sunglasses />} />
          <Route path="/luna-demo/men/accessories/belts" element={<Belts />} />
          <Route path="/luna-demo/men/accessories/wallets" element={<Wallets />} />
          <Route path="/luna-demo/men/accessories/bagsbackpacks" element={<BagsBackpacks />} />

          <Route path="/luna-demo/men/clothing/tops/nike1" element={<Nike1 />} />
          <Route path="/luna-demo/men/clothing/tops/nike2" element={<Nike2 />} />
          <Route path="/luna-demo/men/clothing/tops/nike3" element={<Nike3 />} />
          <Route path="/luna-demo/men/clothing/tops/nike4" element={<Nike4 />} />
          <Route path="/luna-demo/men/clothing/tops/nike5" element={<Nike5 />} />

          <Route path="/luna-demo/men/clothing/bottoms/zara1" element={<Zara1 />} />
          <Route path="/luna-demo/men/clothing/bottoms/zara2" element={<Zara2 />} />
          <Route path="/luna-demo/men/clothing/bottoms/zara3" element={<Zara3 />} />
          <Route path="/luna-demo/men/clothing/bottoms/zara4" element={<Zara4 />} />
          <Route path="/luna-demo/men/clothing/bottoms/zara5" element={<Zara5 />} />

          <Route path="/luna-demo/men/clothing/innerwear/tommyjohn1" element={<TommyJohn1 />} />
          <Route path="/luna-demo/men/clothing/innerwear/tommyjohn2" element={<TommyJohn2 />} />
          <Route path="/luna-demo/men/clothing/innerwear/tommyjohn3" element={<TommyJohn3 />} />
          <Route path="/luna-demo/men/clothing/innerwear/tommyjohn4" element={<TommyJohn4 />} />
          <Route path="/luna-demo/men/clothing/innerwear/tommyjohn5" element={<TommyJohn5 />} />

          <Route path="/luna-demo/men/clothing/outerwear/northface1" element={<NorthFace1 />} />
          <Route path="/luna-demo/men/clothing/outerwear/northface2" element={<NorthFace2 />} />
          <Route path="/luna-demo/men/clothing/outerwear/northface3" element={<NorthFace3 />} />
          <Route path="/luna-demo/men/clothing/outerwear/northface4" element={<NorthFace4 />} />
          <Route path="/luna-demo/men/clothing/outerwear/northface5" element={<NorthFace5 />} />

          <Route path="/luna-demo/men/clothing/activewear/gymshark1" element={<GymShark1 />} />
          <Route path="/luna-demo/men/clothing/activewear/gymshark2" element={<GymShark2 />} />
          <Route path="/luna-demo/men/clothing/activewear/gymshark3" element={<GymShark3 />} />
          <Route path="/luna-demo/men/clothing/activewear/gymshark4" element={<GymShark4 />} />
          <Route path="/luna-demo/men/clothing/activewear/gymshark5" element={<GymShark5 />} />

          <Route path="/luna-demo/men/accessories/hats/adidas1" element={<Adidas1 />} />
          <Route path="/luna-demo/men/accessories/hats/adidas2" element={<Adidas2 />} />
          <Route path="/luna-demo/men/accessories/hats/adidas3" element={<Adidas3 />} />
          <Route path="/luna-demo/men/accessories/hats/adidas4" element={<Adidas4 />} />
          <Route path="/luna-demo/men/accessories/hats/adidas5" element={<Adidas5 />} />

          {/* Women Clothing */}

          <Route path="/luna-demo/user1" element={<User1 />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
