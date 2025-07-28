import express from "express";
import { pool } from "../../db.js";

const router = express.Router();

// Add item to cart
router.post("/", async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID and Product ID are required" 
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

    // Check if item already exists in cart
    const existingItem = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (existingItem.rows.length > 0) {
      // Update quantity
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND product_id = $3',
        [quantity, userId, productId]
      );
    } else {
      // Insert new item
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [userId, productId, quantity]
      );
    }

    res.status(200).json({ 
      success: true, 
      message: "Item added to cart successfully" 
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to add item to cart",
      error: error.message 
    });
  }
});

// Remove item from cart
router.delete("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId } = req.body;

    await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    res.status(200).json({ 
      success: true, 
      message: "Item removed from cart" 
    });

  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to remove item from cart" 
    });
  }
});

// Update cart item quantity
router.put("/", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    console.log('=== BACKEND CART UPDATE ===');
    console.log('User ID:', userId);
    console.log('Product ID:', productId);
    console.log('New Quantity:', quantity);

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      console.log('Removing item from cart');
      const deleteResult = await pool.query(
        'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
      console.log('Delete result:', deleteResult.rowCount, 'rows affected');
    } else {
      console.log('Updating item quantity');
      const updateResult = await pool.query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND product_id = $3',
        [quantity, userId, productId]
      );
      console.log('Update result:', updateResult.rowCount, 'rows affected');
    }

    console.log('=== CART UPDATE COMPLETE ===');
    res.status(200).json({
      success: true,
      message: "Cart updated successfully"
    });

  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update cart" 
    });
  }
});

export default router;
