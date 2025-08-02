# Email Configuration Setup for Rachna E-commerce

## Environment Variables Required

Add these variables to your `.env` file in the Backend directory:

```env
# Email Configuration
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@rachna.com
```

## Gmail Setup Instructions

### 1. Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### 2. Generate App Password
1. In Google Account Security settings
2. Click on "App passwords"
3. Select "Mail" as the app
4. Select "Other" as the device
5. Enter "Rachna E-commerce" as the name
6. Copy the generated 16-character password
7. Use this password as `EMAIL_PASS` in your .env file

### 3. Update Environment Variables
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
ADMIN_EMAIL=admin@rachna.com
```

## Email Templates

### User Confirmation Email Features:
- ✅ Professional RACHNA branding
- ✅ Order confirmation with order number
- ✅ Complete order summary with product images
- ✅ Price breakdown (subtotal, shipping, discounts, total)
- ✅ Contact information (8928096047)
- ✅ Processing and delivery information
- ✅ Responsive HTML design

### Admin Notification Email Features:
- ✅ New order alert with complete details
- ✅ Customer information (name, email, phone)
- ✅ Shipping address
- ✅ Order status and payment status
- ✅ Complete order items with images
- ✅ Action required notification
- ✅ Professional admin panel styling

## Email Triggers

Emails are automatically sent when:
1. User submits payment verification
2. Order status changes to "Confirmed"
3. Payment verification is processed

## Testing Email Functionality

1. Complete an order on the website
2. Submit payment verification
3. Check both user and admin email addresses
4. Verify email formatting and content

## Troubleshooting

### Common Issues:
1. **"Invalid login"** - Check app password is correct
2. **"Authentication failed"** - Ensure 2FA is enabled
3. **Emails not sending** - Check internet connection and Gmail settings
4. **Missing environment variables** - Verify .env file is properly configured

### Debug Steps:
1. Check server logs for email errors
2. Verify environment variables are loaded
3. Test with a simple email first
4. Check Gmail "Less secure app access" (should be disabled, use app password instead)

## Email Content Customization

To modify email templates, edit:
- `Backend/api/utils/emailService.js`
- Update HTML templates in `generateUserOrderConfirmationEmail()` and `generateAdminOrderNotificationEmail()`

## Security Notes

- Never commit email credentials to version control
- Use app passwords instead of regular passwords
- Keep admin email address secure
- Monitor email sending logs for suspicious activity

## Production Recommendations

1. Use a dedicated business email service (SendGrid, AWS SES, etc.)
2. Implement email rate limiting
3. Add email delivery status tracking
4. Set up email bounce handling
5. Use email templates stored in database for easy updates
