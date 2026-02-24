const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const productSchema = new mongoose.Schema({
    // Using Strings for simplicity now, you could add more details like brand, etc.
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    bundlePrice: { type: Number, default: 0, min: 0 },   // website pe roll/bundle ka price
    pricePerMeter: { type: Number, default: 0, min: 0 }, // offline POS me meter ka price
    category: { 
        type: String, 
        required: true, 
        // --- REPLACE THIS ENUM ---
        enum: ['Green Nets', 'Tarpaulins', 'Accessories', 'Fasteners', 'Tensioning', 'Repair', 'Tirpal'],
        // --- END REPLACEMENT ---
        trim: true 
    },
    unitType: {
  type: String,
  enum: ["piece", "meter"],
  default: "piece",
},

bundleLength: { type: Number, default: 0 },  // like 50 meters
bundleStock: { type: Number, default: 0 },   // full bundles count
openPieces: { type: [Number], default: [] }, // leftover meters [30, 10]
    quality: {
  type: String,
  enum: ["100%", "90%", "75%", "50%", "Premium", "Standard", "Economy", "250gsm", "200gsm", "160gsm"],
  required: true
}
,
    stock: { type: Number, default: 0 },
isActive: { type: Boolean, default: true },

image: {
  url: { type: String, required: true },
  public_id: { type: String, required: true }
},


    imageUrl: { type: String, trim: true }, // URL to the product image
    // You could add specific fields like shadePercentage, gsm, size later
    shadePercentage: { type: Number },
    gsm: { type: Number },
    size: { type: String, required: true }
}, {
    timestamps: true // Adds createdAt and updatedAt
});


// Add the third argument specifying the collection name
const Product = mongoose.model('Product', productSchema, 'products'); 

module.exports = Product;