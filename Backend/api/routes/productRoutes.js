import express from "express";
import { pool } from "../../db.js"; // Make sure to include `.js` if using ESModules

const router = express.Router(); // ✅ CORRECTED: Use express.Router() instead of import

router.post('/', async (req, res) => { // ✅ FIXED: moved ')' from wrong place
  try {
    const {
      name,
      description,
      price,
      stock,
      gender,
      size,
      discount,
      category,
      media,
    } = req.body;

    // Insert into products table
    const productResult = await pool.query(
      `INSERT INTO products1 (name, description, price, stock, gender,
       size, discount, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [name, description, price, stock, gender, size, discount, category]
    );

    const productId = productResult.rows[0].id;

    // Insert all media (image/video)
    const mediaPromises = media.map((item) => {
      return pool.query(
        `INSERT INTO product_media (product_id, media_url, media_type)
         VALUES ($1, $2, $3)`,
        [productId, item.media_url, item.media_type]
      );
    });

    await Promise.all(mediaPromises);

    res.status(201).json({ message: "Product added successfully", productId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
