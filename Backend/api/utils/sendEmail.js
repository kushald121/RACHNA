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

// Generic email sending function
export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
};

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

  try {
    await sendEmail(to, "Your OTP for RACHNA Signup", html);
  } catch (err) {
    console.error("Failed to send OTP email:", err);
    throw err;
  }
};

// Order Confirmation Email for User
const sendOrderConfirmationEmail = async (to, orderData) => {
  const {
    userName,
    orderNumber,
    orderDateTime,
    products,
    subtotal,
    shippingCharge = 0,
    totalDiscount = 0,
    grandTotal
  } = orderData;

  // Generate order items HTML
  const orderItems = products.map(product => `
    <tr>
      <td style="padding: 10px; border: 1px solid #eee;">
        <div style="display: flex; align-items: center;">
          <img src="${product.image || 'https://via.placeholder.com/50'}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 4px;">
          <div>
            <div style="font-weight: bold;">${product.name}</div>
            <div style="color: #666; font-size: 12px;">Size: ${product.size || 'N/A'}</div>
          </div>
        </div>
      </td>
      <td style="padding: 10px; border: 1px solid #eee; text-align: center;">${product.quantity}</td>
      <td style="padding: 10px; border: 1px solid #eee; text-align: right;">₹${(product.price * product.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; background-color: #fff;">
      <h1 style="color: #E50010; font-size: 32px; font-weight: bold; margin: 0; text-align: center;">RACHNA</h1>
      <hr style="border: none; border-top: 2px solid #E50010; margin: 20px 0;" />

      <p style="font-size: 16px; margin: 20px 0;">Hi <strong>${userName}</strong>,</p>

      <p style="font-size: 16px; line-height: 1.6;">Thank you for placing your order with <strong>Rachna Exclusive Store</strong>.</p>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="font-size: 16px; margin: 0; color: #28a745;">✅ Your order has been confirmed and is being processed!</p>
      </div>

      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
        <p style="font-size: 16px; margin: 0;"><strong>Order Number:</strong> <span style="color:#E50010; font-weight:bold;">#${orderNumber}</span></p>
        <p style="font-size: 14px; color: #666; margin: 5px 0 0 0;">Placed on ${orderDateTime}</p>
      </div>

      <h3 style="margin-top: 30px; color: #333; border-bottom: 2px solid #E50010; padding-bottom: 5px;">Shipping Method</h3>
      <p style="font-size: 14px; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">Standard Delivery (5-7 business days)</p>

      <h3 style="margin-top: 30px; color: #333; border-bottom: 2px solid #E50010; padding-bottom: 5px;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 15px 0;">
        <thead>
          <tr style="background-color: #E50010; color: white;">
            <th style="padding: 12px; text-align: left;">Item</th>
            <th style="padding: 12px; text-align: center;">Qty</th>
            <th style="padding: 12px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${orderItems}
        </tbody>
      </table>

      <h3 style="margin-top: 30px; color: #333; border-bottom: 2px solid #E50010; padding-bottom: 5px;">Price Summary</h3>
      <table style="width: 100%; font-size: 14px; background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
        <tr>
          <td style="padding: 5px 0;">Subtotal:</td>
          <td style="text-align:right; padding: 5px 0;">₹${subtotal.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">Shipping & Handling:</td>
          <td style="text-align:right; padding: 5px 0;">₹${shippingCharge.toLocaleString()}</td>
        </tr>
        ${totalDiscount > 0 ? `
        <tr>
          <td style="padding: 5px 0;">Total Discount:</td>
          <td style="text-align:right; color:green; padding: 5px 0;">- ₹${totalDiscount.toLocaleString()}</td>
        </tr>
        ` : ''}
        <tr style="border-top: 2px solid #E50010;">
          <td style="font-weight:bold; font-size: 16px; padding: 10px 0 5px 0;">Grand Total:</td>
          <td style="font-weight:bold; text-align:right; font-size: 16px; color: #E50010; padding: 10px 0 5px 0;">₹${grandTotal.toLocaleString()}</td>
        </tr>
      </table>

      <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 30px 0;">
        <p style="font-size: 16px; margin: 0; color: #155724;">
          <strong>📦 Order Processing:</strong> Your order will be processed as soon as possible and delivered to you.
        </p>
      </div>

      <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="font-size: 16px; margin: 0; color: #0c5460;">
          <strong>📞 Need Help?</strong> For any queries regarding your order, contact us at:
          <a href="tel:8928096047" style="color: #E50010; text-decoration: none; font-weight: bold;">8928096047</a>
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 18px; color: #E50010; font-weight: bold;">Thank you for shopping with RACHNA!</p>
        <p style="font-size: 14px; color: #666;">We appreciate your business and look forward to serving you again.</p>
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">
        This is an automated email. Please do not reply to this email address.
      </p>
    </div>
  `;

  try {
    await sendEmail(to, `Order Confirmation - #${orderNumber} | RACHNA`, html);
  } catch (err) {
    console.error("Failed to send order confirmation email:", err);
    throw err;
  }
};

// Order Confirmation Email for Admin
const sendAdminOrderNotificationEmail = async (adminEmail, orderData) => {
  const {
    userName,
    userEmail,
    userPhone,
    orderNumber,
    orderDateTime,
    shippingAddress,
    products,
    subtotal,
    shippingCharge = 0,
    totalDiscount = 0,
    grandTotal,
    paymentStatus,
    orderStatus
  } = orderData;

  // Generate order items HTML
  const orderItems = products.map(product => `
    <tr>
      <td style="padding: 10px; border: 1px solid #eee;">
        <div style="display: flex; align-items: center;">
          <img src="${product.image || 'https://via.placeholder.com/50'}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 4px;">
          <div>
            <div style="font-weight: bold;">${product.name}</div>
            <div style="color: #666; font-size: 12px;">Size: ${product.size || 'N/A'}</div>
          </div>
        </div>
      </td>
      <td style="padding: 10px; border: 1px solid #eee; text-align: center;">${product.quantity}</td>
      <td style="padding: 10px; border: 1px solid #eee; text-align: right;">₹${(product.price * product.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #eee; padding: 20px; background-color: #fff;">
      <div style="background-color: #E50010; color: white; padding: 20px; text-align: center; border-radius: 8px;">
        <h1 style="margin: 0; font-size: 28px;">🔔 NEW ORDER RECEIVED</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">RACHNA Admin Panel</p>
      </div>

      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
        <p style="font-size: 18px; margin: 0; font-weight: bold;">Order #${orderNumber}</p>
        <p style="font-size: 14px; color: #666; margin: 5px 0 0 0;">Received on ${orderDateTime}</p>
      </div>

      <h3 style="color: #333; border-bottom: 2px solid #E50010; padding-bottom: 5px;">Customer Information</h3>
      <table style="width: 100%; font-size: 14px; background-color: #f8f9fa; border-radius: 8px;">
        <tr>
          <td style="padding: 10px; font-weight: bold; width: 30%;">Name:</td>
          <td style="padding: 10px;">${userName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Email:</td>
          <td style="padding: 10px;"><a href="mailto:${userEmail}" style="color: #E50010;">${userEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Phone:</td>
          <td style="padding: 10px;"><a href="tel:${userPhone}" style="color: #E50010;">${userPhone}</a></td>
        </tr>
      </table>

      <h3 style="margin-top: 30px; color: #333; border-bottom: 2px solid #E50010; padding-bottom: 5px;">Shipping Address</h3>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6;">
        ${shippingAddress.replace(/\n/g, '<br>')}
      </div>

      <h3 style="margin-top: 30px; color: #333; border-bottom: 2px solid #E50010; padding-bottom: 5px;">Order Status</h3>
      <div style="display: flex; gap: 20px; margin: 15px 0;">
        <div style="background-color: ${paymentStatus === 'Paid' ? '#d4edda' : '#f8d7da'}; padding: 10px; border-radius: 8px; flex: 1;">
          <strong>Payment Status:</strong>
          <span style="color: ${paymentStatus === 'Paid' ? '#155724' : '#721c24'};">${paymentStatus}</span>
        </div>
        <div style="background-color: ${orderStatus === 'Confirmed' ? '#d4edda' : '#fff3cd'}; padding: 10px; border-radius: 8px; flex: 1;">
          <strong>Order Status:</strong>
          <span style="color: ${orderStatus === 'Confirmed' ? '#155724' : '#856404'};">${orderStatus}</span>
        </div>
      </div>

      <h3 style="margin-top: 30px; color: #333; border-bottom: 2px solid #E50010; padding-bottom: 5px;">Order Items</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 15px 0;">
        <thead>
          <tr style="background-color: #E50010; color: white;">
            <th style="padding: 12px; text-align: left;">Item</th>
            <th style="padding: 12px; text-align: center;">Qty</th>
            <th style="padding: 12px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${orderItems}
        </tbody>
      </table>

      <h3 style="margin-top: 30px; color: #333; border-bottom: 2px solid #E50010; padding-bottom: 5px;">Order Total</h3>
      <table style="width: 100%; font-size: 14px; background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
        <tr>
          <td style="padding: 5px 0;">Subtotal:</td>
          <td style="text-align:right; padding: 5px 0;">₹${subtotal.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">Shipping & Handling:</td>
          <td style="text-align:right; padding: 5px 0;">₹${shippingCharge.toLocaleString()}</td>
        </tr>
        ${totalDiscount > 0 ? `
        <tr>
          <td style="padding: 5px 0;">Total Discount:</td>
          <td style="text-align:right; color:green; padding: 5px 0;">- ₹${totalDiscount.toLocaleString()}</td>
        </tr>
        ` : ''}
        <tr style="border-top: 2px solid #E50010;">
          <td style="font-weight:bold; font-size: 16px; padding: 10px 0 5px 0;">Grand Total:</td>
          <td style="font-weight:bold; text-align:right; font-size: 16px; color: #E50010; padding: 10px 0 5px 0;">₹${grandTotal.toLocaleString()}</td>
        </tr>
      </table>

      <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 30px 0; text-align: center;">
        <p style="font-size: 16px; margin: 0; color: #0c5460;">
          <strong>⚡ Action Required:</strong> Please process this order and update the status in the admin panel.
        </p>
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">
        RACHNA Admin Notification System - ${new Date().toLocaleString()}
      </p>
    </div>
  `;

  try {
    await sendEmail(adminEmail, `🔔 New Order Received - #${orderNumber} | RACHNA Admin`, html);
  } catch (err) {
    console.error("Failed to send admin order notification email:", err);
    throw err;
  }
};

// Export the new functions
export { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail };
