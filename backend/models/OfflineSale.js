const mongoose = require("mongoose");

const offlineSaleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  name: { type: String, required: true },
  category: { type: String, default: "" },
  quality: { type: String, default: "" },
  size: { type: String, default: "" },

  price: { type: Number, required: true },        // ✅ original price
  sellingPrice: { type: Number, required: true }, // ✅ custom price
  quantity: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
});

const offlineSaleSchema = new mongoose.Schema(
  {
    billNumber: { type: String, required: true, unique: true },

    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },

    items: [offlineSaleItemSchema],

    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Card"],
      default: "Cash",
    },

    notes: { type: String, default: "" },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OfflineSale", offlineSaleSchema);