import express from "express";
import dotenv from "dotenv";
import cors from "cors";
// import authRoutes from "./api/routes/authRoutes.js"; // REMOVED - Legacy duplicate OTP system
import adminAuth from "./api/routes/adminAuth.js";
import userAuth from "./api/routes/userAuth.js";
import fetchProducts from "./api/routes/fetchProduct.js";
import addProduct from "./api/routes/addProduct.js";
import fetchCart from "./api/routes/fetchCart.js";
import addCart from "./api/routes/addCart.js";
import guestCart from "./api/routes/guestCart.js";
import guestFavorites from "./api/routes/guestFavorites.js";
import userFavorites from "./api/routes/userFavorites.js";
import orders from "./api/routes/orders.js";
import payment from "./api/routes/payment.js";
import userAddresses from "./api/routes/userAddresses.js";
import path from "path";
import {fileURLToPath} from "url";
dotenv.config();

const app = express();
const port = 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Static files with CORS headers
app.use("/public", (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/admin", adminAuth);
app.use("/api/user", userAuth);
app.use("/api/payment", payment);

// Regular routes
app.use("/api/fetch", fetchProducts);
app.use("/api/products", addProduct);
app.use("/api/cart", fetchCart);
app.use("/api/cart", addCart);
app.use("/api/guest-cart", guestCart);
app.use("/api/guest-favorites", guestFavorites);
app.use("/api/user/favorites", userFavorites);
app.use("/api/orders", orders);
app.use("/api/user/addresses", userAddresses);




app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})


