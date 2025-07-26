// routes/authRoutes.js
import express from "express";
import { sendOtpEmail } from "../utils/sendEmail.js"; // adjust path as needed

const router = express.Router();

router.post("/send-otp", async (req, res) => {
  const { email, phone } = req.body;

  if (!email || !phone) {
    return res.status(400).json({ message: "Email and phone are required." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  const user = email.split("@")[0]; // use first part of email as name

  try {
    await sendOtpEmail(email, user, otp);

    // Optional: store OTP temporarily in-memory, DB, or Redis
    // For now: send OTP back for frontend testing
    res.status(200).json({ message: "OTP sent successfully", otp }); // Remove `otp` in prod
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

export default router;
