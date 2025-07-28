import express from "express";
import { pool } from "../../db.js";
import { verifyUserToken } from "../middlewares/verifyUser.js";

const router = express.Router();

// Add item to user favorites
router.post("/", verifyUserToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
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

        // Add to favorites (ignore if already exists)
        await pool.query(
            `INSERT INTO user_favorites (user_id, product_id, created_at) 
             VALUES ($1, $2, CURRENT_TIMESTAMP)
             ON CONFLICT (user_id, product_id) DO NOTHING`,
            [userId, productId]
        );

        res.json({
            success: true,
            message: "Item added to favorites successfully"
        });

    } catch (error) {
        console.error('User favorites add error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to add item to favorites"
        });
    }
});

// Get user favorites with product details
router.get("/", verifyUserToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const favorites = await pool.query(`
            SELECT 
                uf.id as favorite_id,
                uf.created_at as added_at,
                p.id as product_id,
                p.name,
                p.price,
                p.discount,
                p.category,
                p.stock,
                pm.media_url as image
            FROM user_favorites uf
            JOIN products p ON uf.product_id = p.id
            LEFT JOIN product_media pm ON p.id = pm.product_id AND pm.media_type = 'image'
            WHERE uf.user_id = $1
            ORDER BY uf.created_at DESC
        `, [userId]);

        const favoritesData = favorites.rows.map(favorite => {
            const discountValue = parseFloat(favorite.discount) || 0;
            const originalPrice = parseFloat(favorite.price);
            const finalPrice = discountValue > 0 ? 
                originalPrice * (1 - discountValue / 100) : 
                originalPrice;

            return {
                favoriteId: favorite.favorite_id,
                productId: favorite.product_id,
                name: favorite.name,
                price: finalPrice,
                originalPrice: discountValue > 0 ? originalPrice : null,
                discount: discountValue,
                category: favorite.category,
                stock: favorite.stock,
                image: favorite.image ? 
                    (favorite.image.startsWith('http') ? 
                        favorite.image : 
                        `http://localhost:5000/public${favorite.image}`) : 
                    'https://via.placeholder.com/300',
                addedAt: favorite.added_at
            };
        });

        res.json({
            success: true,
            favorites: favoritesData
        });

    } catch (error) {
        console.error('User favorites get error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch favorites"
        });
    }
});

// Remove item from user favorites
router.delete("/:productId", verifyUserToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;

        const result = await pool.query(
            'DELETE FROM user_favorites WHERE user_id = $1 AND product_id = $2 RETURNING id',
            [userId, productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Item not found in favorites"
            });
        }

        res.json({
            success: true,
            message: "Item removed from favorites"
        });

    } catch (error) {
        console.error('User favorites remove error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to remove item from favorites"
        });
    }
});

// Check if item is in user favorites
router.get("/check/:productId", verifyUserToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;

        const result = await pool.query(
            'SELECT id FROM user_favorites WHERE user_id = $1 AND product_id = $2',
            [userId, productId]
        );

        res.json({
            success: true,
            isFavorite: result.rows.length > 0
        });

    } catch (error) {
        console.error('User favorites check error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to check favorite status"
        });
    }
});

// Get favorites count
router.get("/count", verifyUserToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            'SELECT COUNT(*) as count FROM user_favorites WHERE user_id = $1',
            [userId]
        );

        res.json({
            success: true,
            count: parseInt(result.rows[0].count)
        });

    } catch (error) {
        console.error('User favorites count error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to get favorites count"
        });
    }
});

export default router;
