import express from "express";
import dotenv from "dotenv";
import productRoutes  from "./api/routes/productRoutes.js";
import cors from "cors";
import authRoutes from "./api/routes/authRoutes.js"; // adjust path
import adminAuth from "./api/routes/adminAuth.js";


dotenv.config();


const app = express();
const port = 5000;


app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);

app.use("/api",productRoutes);

app.use("/api/admin",adminAuth);


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})


