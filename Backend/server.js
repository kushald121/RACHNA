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
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

app.use("/api/fetch",fetchProducts);

app.use("/api/products",addProduct);

// app.use("/api/auth", authRoutes); // REMOVED - Legacy duplicate OTP system


app.use("/api/admin",adminAuth);

app.use("/api/user", userAuth);

app.use("/api/cart", fetchCart);

app.use("/api/cart", addCart);

app.use("/api/guest-cart", guestCart);

app.use("/api/guest-favorites", guestFavorites);

app.use("/api/user/favorites", userFavorites);

app.use("/api/orders", orders);

app.use("/api/payment", payment);

app.use("/api/user/addresses", userAddresses);


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})


