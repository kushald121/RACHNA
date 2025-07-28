import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {pool} from "../../db.js";
import dotenv from "dotenv";
import {verifyToken} from "../middlewares/verify.js";

dotenv.config();

const router = express.Router();

router.post("/admin-login", async(req,res)=> {
    const {email,password} = req.body;

    try{
        const {rows} = await pool.query("SELECT * FROM admin_users WHERE email=$1", [email]);
        if(rows.length === 0) return res.status(401).json({message: 'Invalid email'});

        const admin = rows[0];

        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
        if(!isPasswordValid) return res.status(401).json({message: "Invalid password"});

        const token = jwt.sign({adminId: admin.id, email:admin.email}, process.env.JWT_SECRET, {expiresIn: '1h'});

        res.json({token, message: "Login successful!"});
    
    } catch(error){
        console.error(error);
        res.status(500).json({message: "Something went wrong"});

    }
});


//Verify part
router.get("/verify", verifyToken, (req,res)=> {
    res.status(200).json({message: "Token is valid", admin: req.admin});
});

export default router;
