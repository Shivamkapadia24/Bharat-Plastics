const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const OfflineSale = require("../models/OfflineSale");

// ✅ GET analytics summary
router.get("/summary", auth, admin, async (req, res) => {
  try {
    // Products
    const totalProducts = await Product.countDocuments();
    const outOfStock = await Product.countDocuments({ stock: { $lte: 0 } });
    const lowStock = await Product.countDocuments({ stock: { $gt: 0, $lte: 5 } });

    // Users
    const totalCustomers = await User.countDocuments({ role: "user" });

    // Orders
    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.countDocuments({ status: "Delivered" });
    const totalOfflineSales = await OfflineSale.countDocuments();
    // Revenue (only delivered orders)
    const revenueAgg = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);
    // Offline revenue
    const offlineRevenueAgg = await OfflineSale.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);

    const offlineRevenue = offlineRevenueAgg[0]?.totalRevenue || 0;
    
    const onlineRevenue = revenueAgg[0]?.totalRevenue || 0;
    const totalRevenue = onlineRevenue + offlineRevenue;

    // Order status breakdown
    const statusAgg = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const orderStatusCounts = {};
    statusAgg.forEach(s => {
      orderStatusCounts[s._id || "Pending"] = s.count;
    });

    res.json({
      totalRevenue,
      totalOrders,
      deliveredOrders,
      totalOfflineSales,
      totalCustomers,
      totalProducts,
      outOfStock,
      lowStock,
      orderStatusCounts
    });

  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Failed to load analytics" });
  }
});
// ✅ RECENT ORDERS
router.get("/recent-orders", auth, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recent orders" });
  }
});

// ✅ LOW STOCK PRODUCTS
router.get("/low-stock", auth, admin, async (req, res) => {
  try {
    const limit = Number(req.query.limit || 10);

    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .sort({ stock: 1 })
      .limit(limit);

    res.json(lowStockProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch low stock products" });
  }
});

// ✅ Revenue trend (7 / 30 / 90 days)
router.get("/revenue-trend", auth, admin, async (req, res) => {
  try {
    const days = Number(req.query.days || 7);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // group orders by date and sum revenue
const category = req.query.category || "";


// ✅ ONLINE Delivered Revenue (by items)
const onlineRevenue = await Order.aggregate([
  {
    $match: {
      createdAt: { $gte: startDate },
      status: "Delivered",
    },
  },
  { $unwind: "$items" },

  ...(category ? [{ $match: { "items.category": category } }] : []),

  {
    $group: {
      _id: {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      },
      revenue: {
        $sum: { $multiply: ["$items.price", "$items.quantity"] },
      },
    },
  },
  { $sort: { _id: 1 } },
]);

// ✅ OFFLINE Revenue (by items)
const offlineRevenue = await OfflineSale.aggregate([
  {
    $match: {
      createdAt: { $gte: startDate },
    },
  },
  { $unwind: "$items" },

  ...(category ? [{ $match: { "items.category": category } }] : []),

  // ✅ First group by SALE (so we can apply discount once per bill)
  {
    $group: {
      _id: "$_id",
      date: { $first: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
      subtotal: { $sum: "$items.lineTotal" },
      discount: { $first: "$discount" }
    }
  },

  // ✅ Convert sale subtotal -> net revenue
  {
    $project: {
      date: 1,
      revenue: {
        $max: [{ $subtract: ["$subtotal", "$discount"] }, 0]
      }
    }
  },

  // ✅ Now group by DATE
  {
    $group: {
      _id: "$date",
      revenue: { $sum: "$revenue" }
    }
  },

  { $sort: { _id: 1 } }
]);

// ✅ Merge online + offline
const merged = {};

onlineRevenue.forEach(d => {
  merged[d._id] = (merged[d._id] || 0) + d.revenue;
});

offlineRevenue.forEach(d => {
  merged[d._id] = (merged[d._id] || 0) + d.revenue;
});

// ✅ Convert merged to array (same format as old revenueData)
const revenueData = Object.keys(merged)
  .sort()
  .map(date => ({ _id: date, revenue: merged[date] }));

    // ✅ fill missing days with 0 revenue
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const key = date.toLocaleDateString("en-CA");

      const found = revenueData.find((d) => d._id === key);

      result.push({
        date: key,
        revenue: found ? found.revenue : 0,
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch revenue trend" });
  }
});

// ✅ Revenue total by days (today / 7 / 30 / 90)
router.get("/revenue-total", auth, admin, async (req, res) => {
  try {
    const days = Number(req.query.days || 0); 
    // days = 0 means today

    let startDate = new Date();

    if (days === 0) {
      // ✅ today only
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate.setDate(startDate.getDate() - (days - 1));
      startDate.setHours(0, 0, 0, 0);
    }

    // ✅ Only Delivered orders should count as revenue
    const revenueAgg = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

   const onlineRevenue = revenueAgg[0]?.totalRevenue || 0;

// ✅ Offline revenue in same date range
const offlineAgg = await OfflineSale.aggregate([
  {
    $match: {
      createdAt: { $gte: startDate },
    },
  },
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: "$totalAmount" },
    },
  },
]);

const offlineRevenue = offlineAgg[0]?.totalRevenue || 0;

const totalRevenue = onlineRevenue + offlineRevenue;

res.json({ totalRevenue, onlineRevenue, offlineRevenue });
  } catch (err) {
    console.error("Revenue total error:", err);
    res.status(500).json({ message: "Failed to fetch revenue total" });
  }
});

module.exports = router;