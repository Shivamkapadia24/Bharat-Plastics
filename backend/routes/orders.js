// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');

// POST /api/orders  -> place order from user's cart
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id; // from authMiddleware

    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      notes,
    } = req.body;

    // Validate required fields (same ones you send from frontend)
    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return res
        .status(400)
        .json({ message: 'Please fill all required shipping fields.' });
    }

    // Find user & populate cart products
    const user = await User.findById(userId).populate('cart.product');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // Build items from user's cart
const items = user.cart.map((item) => ({
  product: item.product._id,
  name: item.product.name,
  price: item.product.price,
  quantity: item.quantity,

  // ✅ store snapshots (required for filters & analytics)
  category: item.product.category || "",
  quality: item.product.quality || "",
  size: item.product.subCategory || "",   // ✅ size stored in subCategory in your products
}));

    // Calculate total
    const totalAmount = items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );

    // Build shipping address object
    const shippingAddress = {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      notes,
    };

    // For now we only support COD
    const paymentMethod = 'COD';

    const newOrder = new Order({
      user: userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: 'Pending',
    });

    const savedOrder = await newOrder.save();

    // Clear user cart after order is placed
    user.cart = [];
    await user.save();

    return res.status(201).json({
      message: 'Order placed successfully!',
      order: savedOrder,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res
      .status(500)
      .json({ message: 'Something went wrong while placing your order.' });
  }
});

// GET /api/orders -> get logged-in user's orders
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res
      .status(500)
      .json({ message: 'Something went wrong while fetching your orders.' });
  }
});

module.exports = router;
