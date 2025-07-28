import express from "express";
import { pool } from "../../db.js";
import { verifyUserToken } from "../middlewares/verifyUser.js";

const router = express.Router();

// Create order from user's cart
router.post("/create-from-cart", verifyUserToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shippingAddress } = req.body;

    // Start transaction
    await pool.query('BEGIN');

    // Get user's cart items
    const cartItems = await pool.query(`
      SELECT 
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.discount,
        p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
    `, [userId]);

    if (cartItems.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = cartItems.rows.map(item => {
      const discountValue = parseFloat(item.discount) || 0;
      const originalPrice = parseFloat(item.price);
      const finalPrice = discountValue > 0 ? 
        originalPrice * (1 - discountValue / 100) : 
        originalPrice;
      
      const itemTotal = finalPrice * item.quantity;
      subtotal += itemTotal;

      return {
        productId: item.product_id,
        productName: item.name,
        productPrice: finalPrice,
        quantity: item.quantity,
        totalPrice: itemTotal
      };
    });

    const shippingAmount = 0; // Free shipping for all orders
    const totalAmount = subtotal + shippingAmount;

    // Create order with your existing table structure
    const orderResult = await pool.query(`
      INSERT INTO orders (
        user_id, products, total_amount, payment_status, order_status, shipping_address
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, ordered_at
    `, [
      userId,
      JSON.stringify(orderItems),
      totalAmount,
      'Pending',
      'Pending',
      shippingAddress || 'Address to be provided'
    ]);

    const order = orderResult.rows[0];

    // Since your orders table stores products as JSONB, we don't need separate order_items table

    // Clear user's cart
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    // Commit transaction
    await pool.query('COMMIT');

    res.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: `ORD${order.id}${Date.now()}`, // Generate order number
        subtotal: Math.round(subtotal * 100) / 100,
        shippingAmount,
        totalAmount: Math.round(totalAmount * 100) / 100,
        items: orderItems,
        createdAt: order.ordered_at
      }
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  }
});

// Get user's orders
router.get("/my-orders", verifyUserToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const orders = await pool.query(`
      SELECT
        o.id,
        o.products,
        o.total_amount,
        o.payment_status,
        o.order_status,
        o.shipping_address,
        o.ordered_at
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.ordered_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    // Process orders to add order numbers and item counts
    const processedOrders = orders.rows.map(order => {
      const products = order.products || [];
      const itemCount = Array.isArray(products) ? products.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;

      // Transform products to match frontend expectations
      const transformedProducts = Array.isArray(products) ? products.map(item => ({
        productName: item.name || item.productName || 'Product',
        quantity: item.quantity || 1,
        price: item.price || 0
      })) : [];

      return {
        id: order.id,
        orderNumber: `ORD${order.id}${new Date(order.ordered_at).getTime()}`.slice(0, 15),
        status: order.order_status,
        paymentStatus: order.payment_status,
        totalAmount: order.total_amount,
        itemCount,
        orderedAt: order.ordered_at,
        shippingAddress: order.shipping_address,
        products: transformedProducts
      };
    });

    res.json({
      success: true,
      orders: processedOrders
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
});

// Get order details
router.get("/:orderId", verifyUserToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    // Get order details
    const orderResult = await pool.query(`
      SELECT * FROM orders
      WHERE id = $1 AND user_id = $2
    `, [orderId, userId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const order = orderResult.rows[0];

    // Get payment verification if exists
    const paymentVerification = await pool.query(`
      SELECT
        upi_transaction_id,
        verification_status,
        verification_notes,
        created_at as submitted_at
      FROM payment_verifications
      WHERE order_id = $1
    `, [orderId]);

    res.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: `ORD${order.id}${new Date(order.ordered_at).getTime()}`.slice(0, 15),
        products: order.products,
        totalAmount: order.total_amount,
        paymentStatus: order.payment_status,
        orderStatus: order.order_status,
        shippingAddress: order.shipping_address,
        orderedAt: order.ordered_at,
        paymentVerification: paymentVerification.rows[0] || null
      }
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details"
    });
  }
});

// Cancel order
router.put("/:orderId/cancel", verifyUserToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    // Check if order exists and belongs to user
    const orderResult = await pool.query(`
      SELECT order_status FROM orders
      WHERE id = $1 AND user_id = $2
    `, [orderId, userId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const currentStatus = orderResult.rows[0].order_status;

    // Check if order can be cancelled
    if (!['Pending', 'confirmed'].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage"
      });
    }

    // Update order status
    await pool.query(`
      UPDATE orders
      SET order_status = 'cancelled'
      WHERE id = $1
    `, [orderId]);

    res.json({
      success: true,
      message: "Order cancelled successfully"
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order"
    });
  }
});

// Admin: Get all orders
router.get("/admin/all", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required"
      });
    }

    // Verify admin token (you might want to create a proper middleware for this)
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.adminId) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin token"
      });
    }

    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const orders = await pool.query(`
      SELECT
        o.id,
        o.products,
        o.total_amount,
        o.payment_status,
        o.order_status,
        o.shipping_address,
        o.ordered_at,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.ordered_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      success: true,
      orders: orders.rows
    });

  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
});

// Admin: Update order status
router.put("/admin/:orderId/status", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required"
      });
    }

    // Verify admin token
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.adminId) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin token"
      });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }

    // Update order status
    await pool.query(`
      UPDATE orders
      SET order_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [status, orderId]);

    res.json({
      success: true,
      message: "Order status updated successfully"
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status"
    });
  }
});

export default router;
