const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// --- IMPORTANT NOTE ---
// Needs Authentication! Using hardcoded user ID for testing.
 // Use the same ID as in cart.js!

// --- GET User's Wishlist ---
// @route   GET /api/wishlist
// @desc    Get the wishlist for the (currently hardcoded) user
// @access  Private (Needs Auth later)
router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist'); // Populate product details
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.wishlist); // Return only the wishlist array
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Server error fetching wishlist' });
    }
});

// --- ADD Item to Wishlist ---
// @route   POST /api/wishlist
// @desc    Add a product to the wishlist
// @access  Private (Needs Auth later)
router.post('/', async (req, res) => {
    const { productId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Valid productId is required' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check product exists
         const productExists = await Product.findById(productId);
         if (!productExists) {
             return res.status(404).json({ message: 'Product not found' });
         }

        // Check if item is already in wishlist
        const isInWishlist = user.wishlist.some(item => item.toString() === productId);

        if (isInWishlist) {
            return res.status(409).json({ message: 'Item already in wishlist' }); // 409 Conflict
        }

        // Add item to wishlist
        user.wishlist.push(productId);
        await user.save();
        
        await user.populate('wishlist'); // Populate details before sending back
        res.status(200).json(user.wishlist);

    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Server error adding to wishlist' });
    }
});

// --- REMOVE Item from Wishlist ---
// @route   DELETE /api/wishlist/:productId
// @desc    Remove a product from the wishlist
// @access  Private (Needs Auth later)
router.delete('/:productId', async (req, res) => {
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Valid productId is required in URL' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find index of the item
        const itemIndex = user.wishlist.findIndex(item => item.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in wishlist' });
        }

        // Remove the item
        user.wishlist.splice(itemIndex, 1);
        await user.save();
        
        await user.populate('wishlist'); // Populate details before sending back
        res.status(200).json(user.wishlist);

    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Server error removing from wishlist' });
    }
});

module.exports = router;