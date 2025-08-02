import express from "express";
import {pool} from "../../db.js";


const router = express.Router();

router.get("/",async (req,res) => {
    try{
        const products = await pool.query(`
            SELECT
               p.*,
            pm.media_url as image
            FROM
              products p
            LEFT JOIN
               product_media pm ON p.id = pm.product_id
               WHERE
                 pm.media_type = 'image' OR pm.media_type IS NULL`);

        // Process the products to ensure proper image URLs
        const processedProducts = products.rows.map(product => {
            let imageUrl = 'https://via.placeholder.com/300x300/E5E7EB/9CA3AF?text=No+Image';

            if (product.image) {
                if (product.image.startsWith('http')) {
                    // External URL (like Unsplash)
                    imageUrl = product.image;
                } else {
                    // Local file - construct full URL
                    imageUrl = `http://localhost:5000/public${product.image}`;
                }
            }

            return {
                ...product,
                image: imageUrl
            };
        });

        res.json({
            success: true,
            products: processedProducts
        });
    }  catch(error) {
        console.error("Error fetching products:",error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message
        });

    }
});

// Get single product by ID with media
router.get('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get product details
    const productQuery = `
      SELECT
        p.*,
        ARRAY_AGG(
          CASE
            WHEN pm.media_url IS NOT NULL
            THEN json_build_object(
              'id', pm.id,
              'media_url', pm.media_url,
              'media_type', pm.media_type
            )
            ELSE NULL
          END
        ) FILTER (WHERE pm.media_url IS NOT NULL) as media
      FROM products p
      LEFT JOIN product_media pm ON p.id = pm.product_id
      WHERE p.id = $1
      GROUP BY p.id
    `;

    const result = await pool.query(productQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = result.rows[0];

    // Process media URLs to be full URLs
    if (product.media && product.media.length > 0) {
      product.media = product.media.map(media => ({
        ...media,
        media_url: media.media_url.startsWith('http')
          ? media.media_url
          : `http://localhost:5000/public${media.media_url}`
      }));
    } else {
      product.media = [];
    }

    res.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

export default router;