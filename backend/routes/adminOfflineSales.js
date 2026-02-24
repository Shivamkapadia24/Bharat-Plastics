const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const OfflineSale = require("../models/OfflineSale");

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// ✅ Generate bill number
function generateBillNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BILL-${date}-${rand}`;
}
function round1(n) {
  return Math.round(n * 10) / 10;
}

function cutFromMeterStock(product, requiredMeters) {
  let need = round1(requiredMeters);

  // sort openPieces: use smallest first OR oldest first
  // We will use FIFO (first in array first out)
  const open = (product.openPieces || []).map(round1);

// find if any single open piece can fulfill full need
const index = open.findIndex(p => p >= need);

if (index !== -1) {
  // One open piece can fulfill full request
  open[index] = round1(open[index] - need);
  if (open[index] <= 0) open.splice(index, 1);
  need = 0;
} 
else {
  // No single open piece can fulfill full order
  // So open new bundle for full continuous cut
  if (product.bundleStock <= 0) {
    throw new Error(`Not enough stock for ${product.name}`);
  }

  product.bundleStock -= 1;

  const bundleLen = round1(product.bundleLength);
  const left = round1(bundleLen - need);

  if (left > 0) open.push(left);

  need = 0;
}

  // ✅ update openPieces back
  product.openPieces = open;
}

// ✅ CREATE offline sale
router.post("/", auth, admin, async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      items,
      discount,
      paymentMode,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items added in sale" });
    }

    // Validate items & calculate totals
    const saleItems = [];
    let subtotal = 0;

    for (const i of items) {
      const product = await Product.findById(i.productId);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      let qty = Number(i.quantity || 0);
      if (qty <= 0)
        return res.status(400).json({ message: "Invalid quantity" });


      const originalPrice = Number(product.price);
const sellingPrice = Number(i.sellingPrice ?? product.price); // ✅ allow custom price

if (sellingPrice <= 0) {
  return res.status(400).json({ message: "Selling price must be > 0" });
}

const lineTotal = sellingPrice * qty;
subtotal += lineTotal;

saleItems.push({
  product: product._id,
  name: product.name,
  category: product.category || "",
  quality: product.quality || "",
  size: product.subCategory || "",

  price: originalPrice,
  sellingPrice,
  quantity: qty,
  lineTotal,
});

      // ✅ reduce stock immediately
if (product.unitType === "meter") {
  qty = round1(qty);

  const bundleStock = Number(product.bundleStock || 0);
  const bundleLength = Number(product.bundleLength || 0);

  const openTotal = round1((product.openPieces || []).reduce((a, b) => a + b, 0));
  const totalMetersAvailable = round1(bundleStock * bundleLength + openTotal);

  if (qty > totalMetersAvailable) {
    return res.status(400).json({
      message: `Not enough meter stock for ${product.name}. Available: ${totalMetersAvailable}m`,
    });
  }

  // ✅ deduct meters FIFO
  cutFromMeterStock(product, qty);

  // Optional: keep stock = bundleStock for UI
  product.stock = product.bundleStock;
  product.isActive = (product.bundleStock > 0) || (product.openPieces || []).length > 0;

} else {
  // ✅ piece product logic
  if (product.stock < qty) {
    return res.status(400).json({
      message: `Not enough stock for ${product.name}. Available: ${product.stock}`,
    });
  }

  product.stock -= qty;
  product.isActive = product.stock > 0;
}

await product.save();
    }
    const totalAmount = subtotal;
    const discountNum =  0;
    

    const newSale = new OfflineSale({
      billNumber: generateBillNumber(),
      customerName: customerName || "",
      customerPhone: customerPhone || "",
      items: saleItems,
      discount: discountNum,
      totalAmount,
      paymentMode: paymentMode || "Cash",
      notes: notes || "",
      createdBy: req.user.id,
    });

    await newSale.save();

    res.status(201).json({ message: "Offline sale created", sale: newSale });
  } catch (err) {
    console.error("Offline sale error:", err);
    res.status(500).json({ message: "Failed to create offline sale" });
  }
});

module.exports = router;