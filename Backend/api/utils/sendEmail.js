// sendEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendOtpEmail = async (to, user, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; width: 100%; margin: auto; border: 1px solid #eee; padding: 20px; box-sizing: border-box;">
      <h1 style="color: #E50010; font-family: 'Amperserif', Arial, sans-serif; font-size: 32px; font-weight: bold; margin: 0 0 10px 0; line-height: 1.2;">RACHNA</h1>
      <hr style="border: none; border-top: 1px solid #eee; margin: 10px 0;" />
      <p style="font-size: 16px; margin: 10px 0; line-height: 1.4;">Hello ${user},</p>
      <p style="font-size: 16px; margin: 10px 0; line-height: 1.4;">Here is your one-time password (OTP):</p>
      <div style="font-size: 32px; font-weight: bold; color: black; margin: 20px 0; background-color: #F1F1F1; text-align: center; padding: 12px; border-radius: 6px; line-height: 1.2;">${otp}</div>
      <p style="font-size: 14px; color: #777; margin: 10px 0; line-height: 1.3;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
      <p style="font-size: 16px; margin: 10px 0; line-height: 1.4;">Thank you!</p>
    </div>
  `;


    //Order Confirmation
  

  //Order Cancelled 


  


    

  try {
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to,
      subject: "Your OTP for RACHNA Signup",
      html,
    });
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
};
