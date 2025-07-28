import express from "express";
import { pool } from "../../db.js";
import { verifyUserToken } from "../middlewares/verifyUser.js";

const router = express.Router();

// Get user's addresses
router.get("/", verifyUserToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const addresses = await pool.query(`
      SELECT * FROM user_addresses 
      WHERE user_id = $1 
      ORDER BY is_default DESC, created_at DESC
    `, [userId]);

    res.json({
      success: true,
      addresses: addresses.rows
    });

  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch addresses"
    });
  }
});

// Add new address
router.post("/", verifyUserToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      name, phone, address_line_1, address_line_2,
      city, state, pincode, postal_code, country, address_type, type, is_default
    } = req.body;

    // Use pincode if provided, otherwise use postal_code for backward compatibility
    const finalPincode = pincode || postal_code;
    const finalType = address_type || type || 'HOME';

    // Normalize the type to ensure consistency
    const normalizedType = finalType.toUpperCase();

    // Validate required fields
    if (!name || !phone || !address_line_1 || !city || !state || !finalPincode) {
      console.log('Validation failed:', { name, phone, address_line_1, city, state, finalPincode });
      return res.status(400).json({
        success: false,
        message: "Required fields are missing"
      });
    }

    console.log('Adding address with data:', {
      userId, name, phone, address_line_1, address_line_2,
      city, state, finalPincode, country: country || 'India',
      type: normalizedType, is_default: is_default || false
    });

    // Start transaction
    await pool.query('BEGIN');

    // If this is set as default, unset other default addresses
    if (is_default) {
      await pool.query(`
        UPDATE user_addresses 
        SET is_default = FALSE 
        WHERE user_id = $1
      `, [userId]);
    }

    // Insert new address
    const result = await pool.query(`
      INSERT INTO user_addresses (
        user_id, name, phone, address_line_1, address_line_2,
        city, state, postal_code, country, type, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      userId, name, phone, address_line_1, address_line_2,
      city, state, finalPincode, country || 'India', normalizedType, is_default || false
    ]);

    // Commit transaction
    await pool.query('COMMIT');

    res.status(201).json({
      success: true,
      address: result.rows[0],
      message: "Address added successfully"
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error adding address:', error);
    res.status(500).json({
      success: false,
      message: "Failed to add address"
    });
  }
});

// Update address
router.put("/:addressId", verifyUserToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;
    const {
      name, phone, address_line_1, address_line_2,
      city, state, postal_code, country, type, is_default
    } = req.body;

    // Check if address belongs to user
    const addressCheck = await pool.query(`
      SELECT id FROM user_addresses 
      WHERE id = $1 AND user_id = $2
    `, [addressId, userId]);

    if (addressCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    // Start transaction
    await pool.query('BEGIN');

    // If this is set as default, unset other default addresses
    if (is_default) {
      await pool.query(`
        UPDATE user_addresses 
        SET is_default = FALSE 
        WHERE user_id = $1 AND id != $2
      `, [userId, addressId]);
    }

    // Update address
    const result = await pool.query(`
      UPDATE user_addresses 
      SET 
        name = $1, phone = $2, address_line_1 = $3, address_line_2 = $4,
        city = $5, state = $6, postal_code = $7, country = $8, 
        type = $9, is_default = $10, updated_at = CURRENT_TIMESTAMP
      WHERE id = $11 AND user_id = $12
      RETURNING *
    `, [
      name, phone, address_line_1, address_line_2,
      city, state, postal_code, country, type, is_default,
      addressId, userId
    ]);

    // Commit transaction
    await pool.query('COMMIT');

    res.json({
      success: true,
      address: result.rows[0],
      message: "Address updated successfully"
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update address"
    });
  }
});

// Delete address
router.delete("/:addressId", verifyUserToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;

    // Check if address belongs to user
    const addressCheck = await pool.query(`
      SELECT id FROM user_addresses 
      WHERE id = $1 AND user_id = $2
    `, [addressId, userId]);

    if (addressCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    // Delete address
    await pool.query(`
      DELETE FROM user_addresses 
      WHERE id = $1 AND user_id = $2
    `, [addressId, userId]);

    res.json({
      success: true,
      message: "Address deleted successfully"
    });

  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete address"
    });
  }
});

// Set default address
router.put("/:addressId/set-default", verifyUserToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;

    // Check if address belongs to user
    const addressCheck = await pool.query(`
      SELECT id FROM user_addresses 
      WHERE id = $1 AND user_id = $2
    `, [addressId, userId]);

    if (addressCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    // Start transaction
    await pool.query('BEGIN');

    // Unset all default addresses for user
    await pool.query(`
      UPDATE user_addresses 
      SET is_default = FALSE 
      WHERE user_id = $1
    `, [userId]);

    // Set this address as default
    await pool.query(`
      UPDATE user_addresses 
      SET is_default = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
    `, [addressId, userId]);

    // Commit transaction
    await pool.query('COMMIT');

    res.json({
      success: true,
      message: "Default address updated successfully"
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error setting default address:', error);
    res.status(500).json({
      success: false,
      message: "Failed to set default address"
    });
  }
});

export default router;
