import express from 'express';
import { upload } from '../middlewares/multer.js';
import { pool } from '../../db.js';
import { verifyToken } from '../middlewares/verify.js';

const router = express.Router();

// Add new product with media
router.post('/', upload.array('media'), async (req, res) => {
  try {
    const { name, description, price, stock, gender, sizes, discount, category } = req.body;
    const files = req.files || [];

    // Convert sizes array to a string (comma-separated or JSON based on your needs)
    const sizesString = Array.isArray(sizes) ? sizes.join(',') : sizes;

    // Start transaction
    await pool.query('BEGIN');

    // Insert product
    const productResult = await pool.query(
      `INSERT INTO products (name, description, price, stock, gender, sizes, discount, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [name, description, price, stock, gender, sizesString, discount || 0, category]
    );
    const productId = productResult.rows[0].id;

    // Insert media files
    for (const file of files) {
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      await pool.query(
        `INSERT INTO product_media (product_id, media_url, media_type)
         VALUES ($1, $2, $3)`,
        [productId, `/uploads/${file.filename}`, mediaType]
      );
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.status(201).json({ 
      success: true,
      message: 'Product added successfully',
      productId
    });
  } catch (error) {
    // Rollback on error
    await pool.query('ROLLBACK');
    console.error('Error adding product:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add product',
      error: error.message
    });
  }
});

// Bulk delete products
router.delete('/bulk-delete', verifyToken, async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs array is required'
      });
    }

    // Start transaction
    await pool.query('BEGIN');

    // Delete product media first (due to foreign key constraint)
    await pool.query(
      'DELETE FROM product_media WHERE product_id = ANY($1)',
      [productIds]
    );

    // Delete products
    const result = await pool.query(
      'DELETE FROM products WHERE id = ANY($1) RETURNING id',
      [productIds]
    );

    // Commit transaction
    await pool.query('COMMIT');

    res.json({
      success: true,
      message: `Successfully deleted ${result.rows.length} product(s)`,
      deletedCount: result.rows.length
    });

  } catch (error) {
    // Rollback on error
    await pool.query('ROLLBACK');
    console.error('Error deleting products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete products',
      error: error.message
    });
  }
});

// Update product
router.put('/bulk-update', verifyToken, async (req, res) => {
  try {
    console.log('Bulk update request received');
    console.log('Request body:', req.body);
    console.log('Admin info:', req.admin);

    const { updates } = req.body; // Array of product updates

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      console.log('Invalid updates array:', updates);
      return res.status(400).json({
        success: false,
        message: 'Updates array is required'
      });
    }

    console.log('Processing updates for', updates.length, 'products');

    // Start transaction
    await pool.query('BEGIN');

    const updatedProducts = [];

    for (const update of updates) {
      const { id, name, description, price, stock, gender, sizes, discount, category } = update;

      if (!id) {
        throw new Error('Product ID is required for each update');
      }

      // Convert sizes array to string
      const sizesString = Array.isArray(sizes) ? sizes.join(',') : sizes;

      // Update product
      const result = await pool.query(
        `UPDATE products
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             price = COALESCE($3, price),
             stock = COALESCE($4, stock),
             gender = COALESCE($5, gender),
             sizes = COALESCE($6, sizes),
             discount = COALESCE($7, discount),
             category = COALESCE($8, category),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $9
         RETURNING *`,
        [name, description, price, stock, gender, sizesString, discount, category, id]
      );

      if (result.rows.length > 0) {
        updatedProducts.push(result.rows[0]);
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.json({
      success: true,
      message: `Successfully updated ${updatedProducts.length} product(s)`,
      updatedProducts
    });

  } catch (error) {
    // Rollback on error
    await pool.query('ROLLBACK');
    console.error('Error updating products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update products',
      error: error.message
    });
  }
});

export default router;