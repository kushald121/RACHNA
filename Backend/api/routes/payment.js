import express from "express";
import { pool } from "../../db.js";
import { verifyUserToken } from "../middlewares/verifyUser.js";
import { verifyToken } from "../middlewares/verify.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

// Submit payment verification
router.post("/verify", verifyUserToken, upload.single('screenshot'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId, transactionId, referenceNumber, amountPaid } = req.body;
    const screenshot = req.file;

    console.log('Payment verification request:', { orderId, transactionId, amountPaid, userId });

    // Verify order belongs to user
    const orderResult = await pool.query(`
      SELECT id, total_amount, payment_status, order_status
      FROM orders
      WHERE id = $1 AND user_id = $2
    `, [orderId, userId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const order = orderResult.rows[0];
    console.log('Found order:', order);

    // Check if payment verification already exists
    const existingVerification = await pool.query(`
      SELECT id FROM payment_verifications 
      WHERE order_id = $1
    `, [orderId]);

    if (existingVerification.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Payment verification already submitted for this order"
      });
    }

    // Insert payment verification
    const screenshotUrl = screenshot ? `/uploads/${screenshot.filename}` : null;
    
    await pool.query(`
      INSERT INTO payment_verifications (
        order_id, upi_transaction_id, upi_reference_number, 
        payment_screenshot_url, amount_paid, payment_date
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    `, [
      orderId, transactionId, referenceNumber, 
      screenshotUrl, amountPaid
    ]);

    // Update order status to confirmed (using correct column name)
    await pool.query(`
      UPDATE orders
      SET order_status = 'confirmed'
      WHERE id = $1
    `, [orderId]);

    console.log('Order status updated to confirmed for order:', orderId);

    // Add to order status history (if table exists)
    try {
      await pool.query(`
        INSERT INTO order_status_history (order_id, status, notes)
        VALUES ($1, 'confirmed', 'Payment verification submitted')
      `, [orderId]);
    } catch (historyError) {
      console.log('Order status history table might not exist:', historyError.message);
      // Continue without adding to history if table doesn't exist
    }

    res.json({
      success: true,
      message: "Payment verification submitted successfully"
    });

  } catch (error) {
    console.error('Error submitting payment verification:', error);
    res.status(500).json({
      success: false,
      message: "Failed to submit payment verification"
    });
  }
});

// Admin: Get pending payment verifications
router.get("/admin/pending-verifications", verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const verifications = await pool.query(`
      SELECT 
        pv.id,
        pv.order_id,
        pv.upi_transaction_id,
        pv.upi_reference_number,
        pv.payment_screenshot_url,
        pv.amount_paid,
        pv.payment_date,
        pv.verification_status,
        pv.created_at,
        o.order_number,
        o.total_amount,
        u.name as customer_name,
        u.email as customer_email
      FROM payment_verifications pv
      JOIN orders o ON pv.order_id = o.id
      JOIN users u ON o.user_id = u.id
      WHERE pv.verification_status = 'pending'
      ORDER BY pv.created_at ASC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      success: true,
      verifications: verifications.rows
    });

  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending verifications"
    });
  }
});

// Admin: Verify or reject payment
router.put("/admin/verify/:verificationId", verifyToken, async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { status, notes } = req.body; // status: 'verified' or 'rejected'
    const adminId = req.admin.adminId;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification status"
      });
    }

    // Start transaction
    await pool.query('BEGIN');

    // Update payment verification
    await pool.query(`
      UPDATE payment_verifications 
      SET 
        verification_status = $1,
        verified_by = $2,
        verification_notes = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [status, adminId, notes, verificationId]);

    // Get order ID
    const verificationResult = await pool.query(`
      SELECT order_id FROM payment_verifications WHERE id = $1
    `, [verificationId]);

    if (verificationResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: "Payment verification not found"
      });
    }

    const orderId = verificationResult.rows[0].order_id;

    if (status === 'verified') {
      // Update order payment status to paid
      await pool.query(`
        UPDATE orders
        SET payment_status = 'paid'
        WHERE id = $1
      `, [orderId]);

      // Add to order status history (if table exists)
      try {
        await pool.query(`
          INSERT INTO order_status_history (order_id, status, notes, changed_by)
          VALUES ($1, 'processing', 'Payment verified by admin', $2)
        `, [orderId, adminId]);
      } catch (historyError) {
        console.log('Order status history table might not exist:', historyError.message);
      }

      // Update order status to processing
      await pool.query(`
        UPDATE orders
        SET order_status = 'processing'
        WHERE id = $1
      `, [orderId]);

    } else {
      // Payment rejected
      await pool.query(`
        UPDATE orders
        SET payment_status = 'failed'
        WHERE id = $1
      `, [orderId]);

      // Add to order status history (if table exists)
      try {
        await pool.query(`
          INSERT INTO order_status_history (order_id, status, notes, changed_by)
          VALUES ($1, 'cancelled', $2, $3)
        `, [orderId, `Payment verification rejected: ${notes}`, adminId]);
      } catch (historyError) {
        console.log('Order status history table might not exist:', historyError.message);
      }

      // Update order status to cancelled
      await pool.query(`
        UPDATE orders
        SET order_status = 'cancelled'
        WHERE id = $1
      `, [orderId]);
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.json({
      success: true,
      message: `Payment ${status} successfully`
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment"
    });
  }
});

// Admin: Get all payment verifications
router.get("/admin/verifications", verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        pv.id,
        pv.order_id,
        pv.upi_transaction_id,
        pv.verification_status,
        pv.amount_paid,
        pv.payment_date,
        pv.created_at,
        pv.updated_at,
        o.order_number,
        o.total_amount,
        u.name as customer_name,
        u.email as customer_email,
        a.name as verified_by_name
      FROM payment_verifications pv
      JOIN orders o ON pv.order_id = o.id
      JOIN users u ON o.user_id = u.id
      LEFT JOIN admin_users a ON pv.verified_by = a.id
    `;

    const params = [limit, offset];
    
    if (status) {
      query += ` WHERE pv.verification_status = $3`;
      params.push(status);
    }

    query += ` ORDER BY pv.created_at DESC LIMIT $1 OFFSET $2`;

    const verifications = await pool.query(query, params);

    res.json({
      success: true,
      verifications: verifications.rows
    });

  } catch (error) {
    console.error('Error fetching verifications:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch verifications"
    });
  }
});

export default router;
