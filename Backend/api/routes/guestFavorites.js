import express from "express";
import { pool } from "../../db.js";
import { guestFavoritesOperations } from "../utils/redis.js";

const router = express.Router();

// Add item to guest favorites
router.post("/add", async (req, res) => {
    try {
        const { sessionId, productId } = req.body;

        if (!sessionId || !productId) {
            return res.status(400).json({
                success: false,
                message: "Session ID and Product ID are required"
            });
        }

        // Validate product exists
        const product = await pool.query(
            'SELECT id FROM products WHERE id = $1',
            [productId]
        );

        if (product.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const result = await guestFavoritesOperations.addItem(sessionId, productId);
        
        if (result.success) {
            res.json({
                success: true,
                message: "Item added to favorites successfully"
            });
        } else {
            res.status(500).json(result);
        }

    } catch (error) {
        console.error('Guest favorites add error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to add item to favorites"
        });
    }
});

// Get guest favorites with product details
router.get("/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;

        const favoritesResult = await guestFavoritesOperations.getFavorites(sessionId);
        
        if (!favoritesResult.success || favoritesResult.items.length === 0) {
            return res.json({
                success: true,
                favorites: []
            });
        }

        // Get product details for favorite items
        const products = await pool.query(`
            SELECT 
                p.id, p.name, p.price, p.discount, p.category, p.stock,
                pm.media_url as image
            FROM products p
            LEFT JOIN product_media pm ON p.id = pm.product_id AND pm.media_type = 'image'
            WHERE p.id = ANY($1)
        `, [favoritesResult.items]);

        const favorites = products.rows.map(product => {
            const discountValue = parseFloat(product.discount) || 0;
            const originalPrice = parseFloat(product.price);
            const finalPrice = discountValue > 0 ? 
                originalPrice * (1 - discountValue / 100) : 
                originalPrice;

            return {
                productId: product.id,
                name: product.name,
                price: finalPrice,
                originalPrice: discountValue > 0 ? originalPrice : null,
                category: product.category,
                stock: product.stock,
                image: product.image ? 
                    (product.image.startsWith('http') ? 
                        product.image : 
                        `http://localhost:5000/public${product.image}`) : 
                    'https://via.placeholder.com/300'
            };
        });

        res.json({
            success: true,
            favorites
        });

    } catch (error) {
        console.error('Guest favorites fetch error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch favorites"
        });
    }
});

// Remove item from guest favorites
router.delete("/remove", async (req, res) => {
    try {
        const { sessionId, productId } = req.body;

        if (!sessionId || !productId) {
            return res.status(400).json({
                success: false,
                message: "Session ID and Product ID are required"
            });
        }

        const result = await guestFavoritesOperations.removeItem(sessionId, productId);
        
        if (result.success) {
            res.json({
                success: true,
                message: "Item removed from favorites"
            });
        } else {
            res.status(500).json(result);
        }

    } catch (error) {
        console.error('Guest favorites remove error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to remove item from favorites"
        });
    }
});

// Check if item is in guest favorites
router.get("/check/:sessionId/:productId", async (req, res) => {
    try {
        const { sessionId, productId } = req.params;

        const result = await guestFavoritesOperations.isInFavorites(sessionId, productId);
        
        if (result.success) {
            res.json({
                success: true,
                isFavorite: result.isFavorite
            });
        } else {
            res.status(500).json(result);
        }

    } catch (error) {
        console.error('Guest favorites check error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to check favorite status"
        });
    }
});

export default router;
