const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Import the Product model

// --- GET All Products (with Search and Category Filtering) ---
// @route   GET /api/products
// @desc    Get all products, or filter by search/category
// @access  Public
router.get('/', async (req, res) => {
    try {
        // 1. Create a filter object
        const filter = {};
        // ✅ Only show active + in stock products
filter.isActive = true;
filter.stock = { $gt: 0 };


        // 2. Check for a search query
        if (req.query.search) {
            // Use $regex for a case-insensitive "contains" search
            filter.name = { $regex: req.query.search, $options: 'i' };
        }

        // 3. Check for a category query
            if (req.query.category) {
                // Check if the category query is a comma-separated list
                if (req.query.category.includes(',')) {
                    // If yes, create an '$in' query to find products
                    // in any of the categories in the list
                    filter.category = { $in: req.query.category.split(',') };
                } else {
                    // If it's just a single category, filter as normal
                    filter.category = req.query.category;
                }
            }

if (req.query.quality) {
  filter.quality = req.query.quality;
}




        // 4. (Optional) Add more filters for your category pages
        if (req.query.shadePercentage) {
             // Note: shadePercentage must be a Number in your database
            filter.shadePercentage = Number(req.query.shadePercentage); 
        }
        if (req.query.size) {
  filter.size = req.query.size;
}


        // 5. Log the final filter being used (for debugging)
        console.log('Fetching products with filter:', filter);

        // 6. Find products using the built filter object
        const products = await Product.find(filter); 

        res.status(200).json(products);

    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
});

// --- GET Single Product by ID ---
// @route   GET /api/products/:id  (:id is a URL parameter)
// @desc    Get a single product by its MongoDB ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const productId = req.params.id; // Get the ID from the URL parameter
        
        // Basic check if the ID format looks valid (optional but good practice)
        if (!mongoose.Types.ObjectId.isValid(productId)) {
             return res.status(400).json({ message: 'Invalid product ID format' });
        }

        const product = await Product.findById(productId); // Find product by its unique ID

        if (!product) {
            // If no product found with that ID
            return res.status(404).json({ message: 'Product not found' }); // 404 Not Found
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching single product:', error);
        // Catch potential errors during database query
        if (error.kind === 'ObjectId') { // More specific error check
             return res.status(400).json({ message: 'Invalid product ID format' });
        }
        res.status(500).json({ message: 'Server error fetching product' });
    }
});

// We need mongoose to check ID validity in the GET /:id route
const mongoose = require('mongoose'); 

module.exports = router;