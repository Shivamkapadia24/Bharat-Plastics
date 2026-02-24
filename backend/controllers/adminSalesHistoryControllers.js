const Order = require("../models/Order");           // online orders
const OfflineSale = require("../models/OfflineSale"); // offline sales model

function getStartDate(range) {
  const now = new Date();

  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  if (range === "week") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }

  if (range === "month") {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  }

  // default: last 7 days
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
}

exports.getSalesHistory = async (req, res) => {
  try {
    const range = req.query.range || "week"; // today|week|month
    const type = req.query.type || "all";   // all|offline|online

    const startDate = getStartDate(range);

    let offline = [];
    let online = [];

    if (type === "all" || type === "offline") {
      offline = await OfflineSale.find({
        createdAt: { $gte: startDate },
      }).sort({ createdAt: -1 });
    }

    if (type === "all" || type === "online") {
      online = await Order.find({
        createdAt: { $gte: startDate },
      })
        .populate("user", "name phone")
        .sort({ createdAt: -1 });
    }

    // ✅ Merge into common format
    const merged = [
      ...offline.map(s => ({
        _id: s._id,
        saleType: "offline",
        billNumber: s.billNumber || "",
        customerName: s.customerName || "Walk-in customer",
        customerPhone: s.customerPhone || "",
        paymentMode: s.paymentMode || "",
        totalAmount: s.totalAmount || 0,
        createdAt: s.createdAt,
        items: s.items || []
      })),

      ...online.map(o => ({
        _id: o._id,
        saleType: "online",
        billNumber: String(o._id).substring(0, 8),
        customerName: o.user?.name || "Guest",
        customerPhone: o.user?.phone || "",
        paymentMode: "Online Payment",
        totalAmount: o.totalAmount || 0,
        createdAt: o.createdAt,
        items: (o.items || []).map(i => ({
          name: i.name,
          quantity: i.quantity,
          sellingPrice: i.price
        }))
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ sales: merged });

  } catch (err) {
    console.error("Sales history error:", err);
    res.status(500).json({ message: "Failed to load sales history" });
  }
};