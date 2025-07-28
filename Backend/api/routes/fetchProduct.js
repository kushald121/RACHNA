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
        res.json(products.rows);
    }  catch(error) {
        console.error("Error fetching products:",error);
        res.status(500).json({message: "Failed to fetch products",error});

    }
});

export default router;