import crypto from 'crypto';
import { redisClient } from './redis.js';
import { sendEmail } from './sendEmail.js';

class OTPService {
  // Test Redis connection
  async testRedisConnection() {
    try {
      await redisClient.set('test', 'connection');
      const result = await redisClient.get('test');
      await redisClient.del('test');
      console.log('Redis connection test successful:', result);
      return true;
    } catch (error) {
      console.error('Redis connection test failed:', error);
      return false;
    }
  }

  // Generate 6-digit OTP
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Store OTP in Redis with 15-minute expiry
  async storeOTP(identifier, otp) {
    const key = `otp:${identifier}`;
    console.log(`Storing OTP: ${otp} for identifier: ${identifier} with key: ${key}`);

    // Test Redis connection first
    const connectionTest = await this.testRedisConnection();
    if (!connectionTest) {
      throw new Error('Redis connection failed');
    }

    try {
      const expirySeconds = 15 * 60; // 15 minutes = 900 seconds
      const result = await redisClient.setex(key, expirySeconds, otp.toString());
      console.log(`Redis setex result: ${result}`);

      // Verify the OTP was stored immediately
      const verification = await redisClient.get(key);
      console.log(`Verification - stored OTP: ${verification}`);

      // Check TTL
      const ttl = await redisClient.ttl(key);
      console.log(`OTP TTL: ${ttl} seconds (${Math.floor(ttl/60)} minutes)`);

      return true;
    } catch (error) {
      console.error('Error storing OTP:', error);
      throw error;
    }
  }

  // Note: User data storage removed - we now pass user data directly in verification request
  // This eliminates JSON serialization issues with Redis

  // Note: getUserData method removed - user data now passed directly in verification request

  // Note: clearUserData method removed - no longer storing user data in Redis

  // Clear OTP after successful registration
  async clearOTP(identifier) {
    const key = `otp:${identifier}`;
    await redisClient.del(key);
    console.log(`OTP cleared for ${identifier}`);
    return true;
  }

  // Verify OTP
  async verifyOTP(identifier, providedOTP) {
    const key = `otp:${identifier}`;
    console.log(`Attempting to verify OTP with key: ${key}`);

    try {
      const storedOTP = await redisClient.get(key);
      console.log(`Verifying OTP for ${identifier}: provided='${providedOTP}', stored='${storedOTP}'`);

      if (!storedOTP) {
        console.log(`No OTP found in Redis for key: ${key}`);

        // Check if key exists with different pattern
        const allKeys = await redisClient.keys('otp:*');
        console.log(`All OTP keys in Redis: ${JSON.stringify(allKeys)}`);

        return { success: false, message: 'OTP expired or not found' };
      }

      // Ensure both are strings and trim any whitespace
      const cleanStoredOTP = storedOTP.toString().trim();
      const cleanProvidedOTP = providedOTP.toString().trim();

      console.log(`Comparing: stored='${cleanStoredOTP}' vs provided='${cleanProvidedOTP}'`);

      if (cleanStoredOTP !== cleanProvidedOTP) {
        console.log(`OTP mismatch: stored='${cleanStoredOTP}' vs provided='${cleanProvidedOTP}'`);
        return { success: false, message: 'Invalid OTP' };
      }

      // Don't delete OTP here - let it expire naturally or delete after successful user creation
      console.log(`OTP verified successfully for ${identifier}`);
      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Error verifying OTP' };
    }
  }

  // Send OTP via email
  async sendOTPEmail(email, otp, name) {
    const subject = 'Your RACHNA Verification Code';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #E50010, #ff4757); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px solid #E50010; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #E50010; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">RACHNA</div>
            <h2>Verification Code</h2>
          </div>
          <div class="content">
            <h3>Hello ${name}!</h3>
            <p>Welcome to RACHNA! To complete your registration, please use the verification code below:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #666;">This code will expire in 15 minutes</p>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This code is valid for 15 minutes only</li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this code, please ignore this email</li>
            </ul>
            
            <p>Thank you for choosing RACHNA!</p>
          </div>
          <div class="footer">
            <p>© 2024 RACHNA. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendEmail(email, subject, html);
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return { success: false, message: 'Failed to send OTP email' };
    }
  }

  // Send OTP via SMS (placeholder - you can integrate with SMS service)
  async sendOTPSMS(phone, otp) {
    // Placeholder for SMS integration
    // You can integrate with services like Twilio, AWS SNS, etc.
    console.log(`SMS OTP for ${phone}: ${otp}`);
    return { success: true, message: 'OTP sent via SMS' };
  }

  // Send OTP to both email and phone
  async sendOTP(email, phone, otp, name) {
    const emailResult = await this.sendOTPEmail(email, otp, name);
    const smsResult = await this.sendOTPSMS(phone, otp);

    if (emailResult.success) {
      return { success: true, message: 'OTP sent to email and phone' };
    } else {
      return { success: false, message: 'Failed to send OTP' };
    }
  }

  // Check if OTP exists for identifier
  async otpExists(identifier) {
    const key = `otp:${identifier}`;
    const exists = await redisClient.exists(key);
    return exists === 1;
  }

  // Get remaining time for OTP
  async getOTPTTL(identifier) {
    const key = `otp:${identifier}`;
    const ttl = await redisClient.ttl(key);
    return ttl;
  }
}

export default new OTPService();
