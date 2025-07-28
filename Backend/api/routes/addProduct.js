import express from 'express';
import { upload } from '../middlewares/multer.js';
import { pool } from '../../db.js';

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

export default router;