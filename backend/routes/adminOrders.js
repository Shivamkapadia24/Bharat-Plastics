const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Product = require("../models/Product"); // ✅ import product model
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// ✅ Get all orders
router.get("/", auth, admin, async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email");
    res.json(orders);
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// ✅ Update order status + manage stock
router.put("/:id/status", auth, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const newStatus = req.body.status;
    const oldStatus = order.status;

    // ✅ If already confirmed earlier, do not deduct again
    if (oldStatus !== "Confirmed" && newStatus === "Confirmed") {
      for (const item of order.items) {
        const product = await Product.findById(item.product);

        if (!product) {
          return res.status(404).json({ message: "Product not found in order" });
        }

        // ✅ stock check
        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Not enough stock for ${product.name}. Available: ${product.stock}`,
          });
        }

        // ✅ deduct stock
        product.stock -= item.quantity;

        // ✅ if stock becomes 0 => inactive
        product.isActive = product.stock > 0;

        await product.save();
      }
    }

    // ✅ update status
    order.status = newStatus;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error("Order status update error:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

module.exports = router;