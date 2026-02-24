const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product'); // We might need Product details later
const mongoose = require('mongoose');

// --- IMPORTANT NOTE ---
// These routes currently lack authentication! We need to know WHOSE cart we're modifying.
// For testing, we'll hardcode a user ID. In a real app, this would come from a logged-in user's token (JWT).
 // Replace this after testing registration!

// --- GET User's Cart ---
// @route   GET /api/cart
// @desc    Get the cart for the (currently hardcoded) user
// @access  Private (Needs Auth later)
router.get('/', async (req, res) => {
    try {
        // Find the user and populate the product details within the cart
        const user = await User.findById(req.user.id).populate('cart.product'); 
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json(user.cart); // Return only the cart array

    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Server error fetching cart' });
    }
});

// --- ADD/UPDATE Item in Cart ---
// @route   POST /api/cart
// @desc    Add a product to cart or update its quantity
// @access  Private (Needs Auth later)
router.post('/', async (req, res) => {
    const { productId, quantity = 1 } = req.body; // Default quantity to 1 if not provided

    // Basic validation
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Valid productId is required' });
    }
    if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the product actually exists (optional but good practice)
        const productExists = await Product.findById(productId);
        if (!productExists) {
             return res.status(404).json({ message: 'Product not found' });
        }

        // Check if item is already in cart
        const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

        if (cartItemIndex > -1) {
            // Item exists, update quantity
            user.cart[cartItemIndex].quantity += quantity;
        } else {
            // Item does not exist, add it to cart
            user.cart.push({ product: productId, quantity: quantity });
        }

        await user.save(); // Save the updated user document
        
        // Populate the product details before sending back the updated cart
        await user.populate('cart.product');
        res.status(200).json(user.cart); // Send back the updated cart

    } catch (error) {
        console.error('Error adding/updating cart item:', error);
        res.status(500).json({ message: 'Server error adding/updating cart item' });
    }
});


// --- UPDATE Item Quantity in Cart ---
// @route   PUT /api/cart/:productId
// @desc    Update the quantity of a product in the cart
// @access  Private (Needs Auth)
router.put('/:productId', async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body; // Get new quantity from request body

    // Validation
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid product ID format' });
    }
    if (typeof quantity !== 'number' || quantity < 1) {
        // Quantity must be a positive number
        return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    try {
        // Find the user (authMiddleware gives us req.user.id)
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the specific item in the user's cart
        const cartItem = user.cart.find(item => item.product.toString() === productId);

        if (!cartItem) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Update the quantity
        cartItem.quantity = quantity;

        // Save the updated user document
        await user.save();

        // Send back the full, updated cart, populated with product details
        await user.populate('cart.product');
        res.status(200).json(user.cart);

    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(500).json({ message: 'Server error updating cart quantity' });
    }
});

// --- REMOVE Item from Cart ---
// @route   DELETE /api/cart/:productId
// @desc    Remove a product from the cart
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

        // Find the index of the item to remove
        const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

        if (cartItemIndex === -1) {
            // Item not found in cart
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Remove the item from the cart array
        user.cart.splice(cartItemIndex, 1);

        await user.save(); // Save the updated user document
        
        // Populate product details before sending back the updated cart
        await user.populate('cart.product');
        res.status(200).json(user.cart); // Send back the updated cart

    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ message: 'Server error removing cart item' });
    }
});


module.exports = router;