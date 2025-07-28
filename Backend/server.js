import express from "express";
import dotenv from "dotenv";
import productRoutes  from "./api/routes/productRoutes.js";
import cors from "cors";
import authRoutes from "./api/routes/authRoutes.js"; // adjust path
import adminAuth from "./api/routes/adminAuth.js";
import fetchProducts from "./api/routes/fetchProduct.js";
import addProduct from "./api/routes/addProduct.js";
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

app.use("/api/auth", authRoutes);


app.use("/api/admin",adminAuth);


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})


