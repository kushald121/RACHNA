import express from "express";
import { pool } from "../../db.js";
import { guestCartOperations, generateSessionId } from "../utils/redis.js";

const router = express.Router();

// Generate session ID for guest users
router.post("/session", (req, res) => {
    try {
        const sessionId = generateSessionId();
        res.json({
            success: true,
            sessionId,
            message: "Session created successfully"
        });
    } catch (error) {
        console.error('Session creation error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to create session"
        });
    }
});

// Add item to guest cart
router.post("/add", async (req, res) => {
    try {
        const { sessionId, productId, quantity = 1 } = req.body;

        if (!sessionId || !productId) {
            return res.status(400).json({
                success: false,
                message: "Session ID and Product ID are required"
            });
        }

        // Validate product exists and has stock
        const product = await pool.query(
            'SELECT id, name, price, stock FROM products WHERE id = $1',
            [productId]
        );

        if (product.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.rows[0].stock < quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock"
            });
        }

        const result = await guestCartOperations.addItem(sessionId, productId, quantity);
        
        if (result.success) {
            res.json({
                success: true,
                message: "Item added to cart successfully"
            });
        } else {
            res.status(500).json(result);
        }

    } catch (error) {
        console.error('Guest cart add error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to add item to cart"
        });
    }
});

// Get guest cart with product details
router.get("/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log('Guest cart fetch request for session:', sessionId);

        const cartResult = await guestCartOperations.getCart(sessionId);
        console.log('Guest cart result:', cartResult);
        
        if (!cartResult.success || cartResult.items.length === 0) {
            return res.json({
                success: true,
                cart: {
                    items: [],
                    summary: {
                        itemCount: 0,
                        subtotal: 0,
                        shipping: 0,
                        total: 0
                    }
                }
            });
        }

        // Get product details for cart items
        const productIds = cartResult.items.map(item => item.productId);
        const products = await pool.query(`
            SELECT 
                p.id, p.name, p.price, p.discount, p.category, p.stock,
                pm.media_url as image
            FROM products p
            LEFT JOIN product_media pm ON p.id = pm.product_id AND pm.media_type = 'image'
            WHERE p.id = ANY($1)
        `, [productIds]);

        // Combine cart items with product details
        let subtotal = 0;
        const items = cartResult.items.map(cartItem => {
            const product = products.rows.find(p => p.id === cartItem.productId);
            if (!product) return null;

            const discountValue = parseFloat(product.discount) || 0;
            const originalPrice = parseFloat(product.price);
            const finalPrice = discountValue > 0 ? 
                originalPrice * (1 - discountValue / 100) : 
                originalPrice;
            
            const itemTotal = finalPrice * cartItem.quantity;
            subtotal += itemTotal;

            return {
                productId: product.id,
                name: product.name,
                price: finalPrice,
                originalPrice: discountValue > 0 ? originalPrice : null,
                quantity: cartItem.quantity,
                category: product.category,
                stock: product.stock,
                image: product.image ? 
                    (product.image.startsWith('http') ? 
                        product.image : 
                        `http://localhost:5000/public${product.image}`) : 
                    'https://via.placeholder.com/300',
                itemTotal
            };
        }).filter(item => item !== null);

        const shipping = 0; // Free shipping for all orders
        const total = subtotal + shipping;

        res.json({
            success: true,
            cart: {
                items,
                summary: {
                    itemCount: items.length,
                    subtotal: Math.round(subtotal * 100) / 100,
                    shipping,
                    total: Math.round(total * 100) / 100
                }
            }
        });

    } catch (error) {
        console.error('Guest cart fetch error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch cart"
        });
    }
});

// Update item quantity in guest cart
router.put("/update", async (req, res) => {
    try {
        const { sessionId, productId, quantity } = req.body;

        console.log('=== GUEST CART UPDATE ===');
        console.log('Session ID:', sessionId);
        console.log('Product ID:', productId);
        console.log('New Quantity:', quantity);

        if (!sessionId || !productId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "Session ID, Product ID, and quantity are required"
            });
        }

        const result = await guestCartOperations.updateQuantity(sessionId, productId, quantity);
        console.log('Guest cart update result:', result);

        if (result.success) {
            console.log('=== GUEST CART UPDATE COMPLETE ===');
            res.json({
                success: true,
                message: "Cart updated successfully"
            });
        } else {
            res.status(500).json(result);
        }

    } catch (error) {
        console.error('Guest cart update error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update cart"
        });
    }
});

// Remove item from guest cart
router.delete("/remove", async (req, res) => {
    try {
        const { sessionId, productId } = req.body;

        if (!sessionId || !productId) {
            return res.status(400).json({
                success: false,
                message: "Session ID and Product ID are required"
            });
        }

        const result = await guestCartOperations.removeItem(sessionId, productId);
        
        if (result.success) {
            res.json({
                success: true,
                message: "Item removed from cart"
            });
        } else {
            res.status(500).json(result);
        }

    } catch (error) {
        console.error('Guest cart remove error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to remove item from cart"
        });
    }
});

// Clear guest cart
router.delete("/clear/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;

        const result = await guestCartOperations.clearCart(sessionId);
        
        if (result.success) {
            res.json({
                success: true,
                message: "Cart cleared successfully"
            });
        } else {
            res.status(500).json(result);
        }

    } catch (error) {
        console.error('Guest cart clear error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to clear cart"
        });
    }
});

export default router;
