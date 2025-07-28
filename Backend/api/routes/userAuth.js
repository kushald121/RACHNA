import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../db.js";
import dotenv from "dotenv";
import { verifyUserToken } from "../middlewares/verifyUser.js";
import { guestCartOperations, guestFavoritesOperations, transferGuestDataToPostgreSQL } from "../utils/redis.js";
import otpService from "../utils/otpService.js";

dotenv.config();

const router = express.Router();

// Send OTP for registration
router.post("/send-otp", async (req, res) => {
    const { name, email, phone, password } = req.body;

    try {
        // Validate required fields
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, phone, and password are required'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Validate Indian phone number format
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid 10-digit Indian mobile number'
            });
        }

        // Check if user already exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR phone = $2",
            [email, phone]
        );

        if (existingUser.rows.length > 0) {
            const existingField = existingUser.rows[0].email === email ? 'email' : 'phone';
            return res.status(409).json({
                success: false,
                message: `User already exists with this ${existingField}`
            });
        }

        // Generate and store OTP with user data
        const otp = otpService.generateOTP();
        const identifier = `${email}:${phone}`;
        console.log(`Generated OTP: ${otp} for identifier: ${identifier}`);

        // Store OTP only - we'll pass user data directly in the verification request
        await otpService.storeOTP(identifier, otp);

        // Send OTP via email and SMS
        const sendResult = await otpService.sendOTP(email, phone, otp, name);

        if (sendResult.success) {
            res.json({
                success: true,
                message: 'OTP sent successfully to your email and phone'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP. Please try again.'
            });
        }

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Verify OTP and complete registration
router.post("/verify-otp", async (req, res) => {
    const { email, phone, otp, sessionId, name, password } = req.body;

    try {
        // Validate required fields
        if (!email || !phone || !otp || !name || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email, phone, OTP, name, and password are required'
            });
        }

        // Verify OTP
        const identifier = `${email}:${phone}`;
        console.log(`Verifying OTP for registration: identifier=${identifier}, otp=${otp}`);
        const otpResult = await otpService.verifyOTP(identifier, otp);

        if (!otpResult.success) {
            console.log(`OTP verification failed: ${otpResult.message}`);
            return res.status(400).json({
                success: false,
                message: `Invalid OTP for user registration. ${otpResult.message}`
            });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user account with hashed password
        const result = await pool.query(
            "INSERT INTO users (name, email, phone, password_hash, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING id, name, email, phone, created_at",
            [name, email, phone, hashedPassword]
        );

        // Clear OTP
        await otpService.clearOTP(identifier);

        const newUser = result.rows[0];

        // Generate JWT token with 15-day expiry
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '15d' }
        );

        // Handle cart and favorites migration if sessionId exists
        let migration = { cartItemsMigrated: 0, favoritesMigrated: 0 };

        if (sessionId) {
            try {
                // Migrate guest cart to user cart
                const guestCart = await guestCartOperations.getCart(sessionId);
                if (guestCart.success && guestCart.items && guestCart.items.length > 0) {
                    for (const item of guestCart.items) {
                        await pool.query(
                            "INSERT INTO cart_items (user_id, product_id, quantity, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart_items.quantity + $3, updated_at = CURRENT_TIMESTAMP",
                            [newUser.id, item.productId, item.quantity]
                        );
                        migration.cartItemsMigrated++;
                    }
                    await guestCartOperations.clearCart(sessionId);
                }

                // Migrate guest favorites to user favorites
                const guestFavorites = await guestFavoritesOperations.getFavorites(sessionId);
                if (guestFavorites.success && guestFavorites.items && guestFavorites.items.length > 0) {
                    for (const productId of guestFavorites.items) {
                        await pool.query(
                            "INSERT INTO user_favorites (user_id, product_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (user_id, product_id) DO NOTHING",
                            [newUser.id, productId]
                        );
                        migration.favoritesMigrated++;
                    }
                    await guestFavoritesOperations.clearFavorites(sessionId);
                }
            } catch (migrationError) {
                console.error('Migration error:', migrationError);
                // Don't fail registration if migration fails
            }
        }

        res.status(201).json({
            success: true,
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                created_at: newUser.created_at
            },
            migration,
            message: 'Account created successfully!'
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// User Registration (Legacy - keeping for backward compatibility)
router.post("/register", async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await pool.query(
            "INSERT INTO users (name, email, password_hash, phone, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING id, name, email, phone, created_at",
            [name, email, hashedPassword, phone]
        );

        const newUser = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                createdAt: newUser.created_at
            },
            message: "User registered successfully!"
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: "Something went wrong during registration" });
    }
});

// User Login
router.post("/login", async (req, res) => {
    const { email, password, sessionId } = req.body;

    try {
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email/Phone and password are required'
            });
        }

        // Find user by email or phone
        const { rows } = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR phone = $1",
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'You don\'t have an account. Please sign up first.',
                action: 'signup'
            });
        }

        const user = rows[0];

        // Check if user has password_hash (for users created via OTP, they won't have password initially)
        if (!user.password_hash) {
            return res.status(401).json({
                success: false,
                message: 'Please set up your password first. Contact support for assistance.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Generate JWT token with 15-day expiry
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15d' }
        );

        // If sessionId is provided, migrate guest cart and favorites
        let migrationResult = null;
        if (sessionId) {
            try {
                // Use the new transfer function
                const transferResult = await transferGuestDataToPostgreSQL.transferAll(sessionId, user.id, pool);

                if (transferResult.success) {
                    migrationResult = {
                        cartTransferred: transferResult.cartTransfer.success,
                        favoritesTransferred: transferResult.favoritesTransfer.success,
                        message: 'Guest data transferred successfully'
                    };
                } else {
                    migrationResult = {
                        cartTransferred: false,
                        favoritesTransferred: false,
                        message: 'Failed to transfer guest data'
                    };
                }
            } catch (migrationError) {
                console.error('Migration error:', migrationError);
                migrationResult = {
                    cartTransferred: false,
                    favoritesTransferred: false,
                    message: 'Migration failed'
                };
                // Don't fail login if migration fails
            }
        }

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.created_at
            },
            migration: migrationResult,
            message: "Login successful!"
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: "Something went wrong during login"
        });
    }
});

// Verify User Token
router.get("/verify", verifyUserToken, (req, res) => {
    res.status(200).json({
        message: "Token is valid",
        user: req.user
    });
});

// Get User Profile
router.get("/profile", verifyUserToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            "SELECT id, name, email, phone, created_at FROM users WHERE id = $1",
            [req.user.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: rows[0],
            message: "Profile retrieved successfully"
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
});

// Update User Profile
router.put("/profile", verifyUserToken, async (req, res) => {
    const { name, phone } = req.body;

    try {
        const { rows } = await pool.query(
            "UPDATE users SET name = $1, phone = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, email, phone, updated_at",
            [name, phone, req.user.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: rows[0],
            message: "Profile updated successfully"
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: "Failed to update profile" });
    }
});

// Change Password
router.put("/change-password", verifyUserToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        // Get current user
        const { rows } = await pool.query("SELECT password_hash FROM users WHERE id = $1", [req.user.userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, rows[0].password_hash);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await pool.query(
            "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            [hashedNewPassword, req.user.userId]
        );

        res.json({ message: "Password changed successfully" });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: "Failed to change password" });
    }
});

export default router;
