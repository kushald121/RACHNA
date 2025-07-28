import express from "express";
import { pool } from "../../db.js";

const router = express.Router();

// Get user's cart items
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const cartItems = await pool.query(`
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        ci.created_at,
        p.id as product_id,
        p.name,
        p.price,
        p.discount,
        p.category,
        p.stock,
        pm.media_url as image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_media pm ON p.id = pm.product_id AND pm.media_type = 'image'
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC
    `, [userId]);

    // Calculate totals
    let subtotal = 0;
    const items = cartItems.rows.map(item => {
      const discountValue = parseFloat(item.discount) || 0;
      const originalPrice = parseFloat(item.price);
      const finalPrice = discountValue > 0 ?
        originalPrice * (1 - discountValue / 100) :
        originalPrice;

      const itemTotal = finalPrice * item.quantity;
      subtotal += itemTotal;

      const cartItem = {
        cartItemId: item.cart_item_id,
        productId: item.product_id,
        name: item.name,
        price: finalPrice,
        originalPrice: discountValue > 0 ? originalPrice : null,
        quantity: item.quantity,
        category: item.category,
        stock: item.stock,
        image: item.image ?
          (item.image.startsWith('http') ?
            item.image :
            `http://localhost:5000/public${item.image}`) :
          'https://via.placeholder.com/300',
        itemTotal
      };

      console.log('Cart item processed:', {
        productId: cartItem.productId,
        name: cartItem.name,
        quantity: cartItem.quantity
      });

      return cartItem;
    });

    console.log('=== CART FETCH COMPLETE ===');
    console.log('Total items processed:', items.length);

    const shipping = 0; // Free shipping for all orders
    const total = subtotal + shipping;

    res.status(200).json({
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
    console.error('Error fetching cart:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch cart",
      error: error.message 
    });
  }
});

export default router;