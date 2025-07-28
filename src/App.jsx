import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from "react-helmet"; //browser tab and icon customization
import { AuthProvider } from './contexts/AuthContext';
import Payment from "./pages/home/payment"
import PaymentPage from "./pages/payment/PaymentPage.js";
import AddressPage from "./pages/checkout/AddressPage.js";
import OrderSummaryPage from "./pages/checkout/OrderSummaryPage.js";
import OrdersPage from "./pages/orders/OrdersPage.js";
import User1 from "./pages/user/User1.js";
import UserLogin from './pages/user/UserLogin.js';
import AdminLogin from './pages/admin/AdminLogin.js';
import Fav from '../src/pages/favorites/Fav.js';
import AdminProductPages from './pages/product/AdminProductPages.js';
import ProductOverview from './pages/product/ProductOverview.js';
import DynamicProductOverview from './pages/product/DynamicProductOverview.js';
import AdminControl from "./pages/admin/adminControl.js";
import ProtectedRoutes from "./pages/utils/ProtectedRoutes.js";
import AddProduct from "./pages/admin/Addproduct.jsx";
import DeleteProduct from "./pages/admin/DeleteProduct.js";
import UpdateProduct from "./pages/admin/UpdateProduct.js";
import ViewOrder from "./pages/admin/ViewOrder.jsx";
import SplashCursor from './components/cursor/SplashCursor.jsx'
import AllProductsPage from './pages/product/AllProductsPage.jsx';

// Core Function
import { Home, Error,  NewArrivals } from './pages';

// Men Clothing
import { Men, MenClothing, MenAccesories, MenBrands,
         Tops, Bottoms, Innerwear, Outerwear, Activewear,
         Hats, Sunglasses, Belts, Wallets, BagsBackpacks } from './pages';

import { Nike1, Nike2, Nike3, Nike4, Nike5,
         Zara1, Zara2, Zara3, Zara4, Zara5,
         TommyJohn1, TommyJohn2, TommyJohn3, TommyJohn4, TommyJohn5,
         NorthFace1, NorthFace2, NorthFace3, NorthFace4, NorthFace5,
         GymShark1, GymShark2, GymShark3, GymShark4, GymShark5,
         Adidas1, Adidas2, Adidas3, Adidas4, Adidas5, } from './pages';

// Women Clothing

const App = () => {
  return (
    <AuthProvider>
      <Router> {/* Move the Router component here */}
        <div className="App">
        {/*Website TAB Description*/}
        <Helmet>
          <meta charSet="utf-8" />
          <title>Rachna - Modern Collection for Men's & Women's Clothing</title>
          <link rel="canonical" href="https://www.google.com/" />
          <meta name="description" content="© 2023 Rachna Inc. All Rights Reserved." />
        </Helmet>
         {/* //<SplashCursor/> */}

        <Routes>
          <Route exact path="/Rachna/" element={<Home />} />
          {/* Payment */}
          <Route path ="/Rachna/payment"  element={<PaymentPage/>}/>
          <Route path ="/Rachna/old-payment"  element={<Payment/>}/>
          <Route path ="/Rachna/address"  element={<AddressPage/>}/>
          <Route path ="/Rachna/order-summary"  element={<OrderSummaryPage/>}/>
          <Route path ="/Rachna/checkout"  element={<PaymentPage/>}/>
          <Route path ="/Rachna/orders"  element={<OrdersPage/>}/>
          


          {/* User Authentication */}
          <Route path="/Rachna/user-login/" element={<UserLogin />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoutes/>}>
            <Route element={<AdminControl/>} path="/Rachna/admincontrol" />
            <Route element={<AddProduct/>} path="/Rachna/addproduct"/>
            <Route element={<DeleteProduct/>} path="/Rachna/deleteproduct"/>
            <Route element={<UpdateProduct/>} path="/Rachna/updateproduct"/>
            <Route element={<ViewOrder/>} path="/Rachna/vieworders"/>
          </Route>
       

          {/* Admin */}
       
          <Route path="/Rachna/error/" element={<Error />} />

          <Route path="/Rachna/new-arrivals/" element={<NewArrivals />} />
          <Route path="/Rachna/admin-login/" element={<AdminLogin />} />
          <Route path="/Rachna/favorites/" element={<Fav />} />
          <Route path="/Rachna/productpages/" element={<AdminProductPages />} />
          <Route path="/Rachna/productoverview/" element={<ProductOverview />} />
          <Route path="/Rachna/product/:productId" element={<DynamicProductOverview />} />
          <Route path="/Rachna/allproducts/" element={<AllProductsPage/>} />
          <Route path = "/Rachna/deleteproduct/" element={<DeleteProduct/>}/>
          <Route path = "/Rachna/updateproduct/" element={<UpdateProduct/>}/>
          


          {/* Men Clothing */}
          <Route path="/Rachna/men/" element={<Men />} />
          <Route path="/Rachna/men/clothing/" element={<MenClothing />} />
          <Route path="/Rachna/men/accessories/" element={<MenAccesories />} />
          <Route path="/Rachna/men/brands/" element={<MenBrands />} />

          <Route path="/Rachna/men/clothing/tops/" element={<Tops />} />
          <Route path="/Rachna/men/clothing/bottoms/" element={<Bottoms />} />
          <Route path="/Rachna/men/clothing/innerwear/" element={<Innerwear />} />
          <Route path="/Rachna/men/clothing/outerwear/" element={<Outerwear />} />
          <Route path="/Rachna/men/clothing/activewear/" element={<Activewear />} />

          <Route path="/Rachna/men/accessories/hats" element={<Hats />} />
          <Route path="/Rachna/men/accessories/sunglasses" element={<Sunglasses />} />
          <Route path="/Rachna/men/accessories/belts" element={<Belts />} />
          <Route path="/Rachna/men/accessories/wallets" element={<Wallets />} />
          <Route path="/Rachna/men/accessories/bagsbackpacks" element={<BagsBackpacks />} />

          <Route path="/Rachna/men/clothing/tops/nike1" element={<Nike1 />} />
          <Route path="/Rachna/men/clothing/tops/nike2" element={<Nike2 />} />
          <Route path="/Rachna/men/clothing/tops/nike3" element={<Nike3 />} />
          <Route path="/Rachna/men/clothing/tops/nike4" element={<Nike4 />} />
          <Route path="/Rachna/men/clothing/tops/nike5" element={<Nike5 />} />

          <Route path="/Rachna/men/clothing/bottoms/zara1" element={<Zara1 />} />
          <Route path="/Rachna/men/clothing/bottoms/zara2" element={<Zara2 />} />
          <Route path="/Rachna/men/clothing/bottoms/zara3" element={<Zara3 />} />
          <Route path="/Rachna/men/clothing/bottoms/zara4" element={<Zara4 />} />
          <Route path="/Rachna/men/clothing/bottoms/zara5" element={<Zara5 />} />

          <Route path="/Rachna/men/clothing/innerwear/tommyjohn1" element={<TommyJohn1 />} />
          <Route path="/Rachna/men/clothing/innerwear/tommyjohn2" element={<TommyJohn2 />} />
          <Route path="/Rachna/men/clothing/innerwear/tommyjohn3" element={<TommyJohn3 />} />
          <Route path="/Rachna/men/clothing/innerwear/tommyjohn4" element={<TommyJohn4 />} />
          <Route path="/Rachna/men/clothing/innerwear/tommyjohn5" element={<TommyJohn5 />} />

          <Route path="/Rachna/men/clothing/outerwear/northface1" element={<NorthFace1 />} />
          <Route path="/Rachna/men/clothing/outerwear/northface2" element={<NorthFace2 />} />
          <Route path="/Rachna/men/clothing/outerwear/northface3" element={<NorthFace3 />} />
          <Route path="/Rachna/men/clothing/outerwear/northface4" element={<NorthFace4 />} />
          <Route path="/Rachna/men/clothing/outerwear/northface5" element={<NorthFace5 />} />

          <Route path="/Rachna/men/clothing/activewear/gymshark1" element={<GymShark1 />} />
          <Route path="/Rachna/men/clothing/activewear/gymshark2" element={<GymShark2 />} />
          <Route path="/Rachna/men/clothing/activewear/gymshark3" element={<GymShark3 />} />
          <Route path="/Rachna/men/clothing/activewear/gymshark4" element={<GymShark4 />} />
          <Route path="/Rachna/men/clothing/activewear/gymshark5" element={<GymShark5 />} />

          <Route path="/Rachna/men/accessories/hats/adidas1" element={<Adidas1 />} />
          <Route path="/Rachna/men/accessories/hats/adidas2" element={<Adidas2 />} />
          <Route path="/Rachna/men/accessories/hats/adidas3" element={<Adidas3 />} />
          <Route path="/Rachna/men/accessories/hats/adidas4" element={<Adidas4 />} />
          <Route path="/Rachna/men/accessories/hats/adidas5" element={<Adidas5 />} />

          {/* Women Clothing */}

           <Route path="/Rachna/user1" element={<User1/>}/>

        </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
