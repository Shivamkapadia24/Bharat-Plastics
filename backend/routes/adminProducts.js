const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

// ✅ GET all products (including inactive)
router.get("/", auth, admin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// ✅ ADD product (with image upload)
router.post("/", auth, admin, upload.single("image"), async (req, res) => {
  try {
    const productData = req.body;
    if (!productData.size) {
  return res.status(400).json({ message: "Size is required" });
}

    if (productData.quality) {
  productData.quality = productData.quality.trim();
}


    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }

    const stockNum = Number(productData.stock || 0);
    // ✅ Auto-set shadePercentage for Green Nets
if (productData.category === "Green Nets" && productData.quality) {
  const q = productData.quality.trim();
  if (["100%", "90%", "75%", "50%"].includes(q)) {
    productData.shadePercentage = Number(q.replace("%", ""));
  }
}


const product = new Product({
  ...productData,
  stock: stockNum,
  isActive: stockNum > 0,
  imageUrl: req.file.path,
  image: {
    url: req.file.path,
    public_id: req.file.filename,
  },
});



    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ message: "Failed to add product" });
  }
});

// ✅ UPDATE product (optionally update image)
router.put("/:id", auth, admin, upload.single("image"), async (req, res) => {
  try {
    const updates = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // ✅ update image (if uploaded)
    if (req.file) {
      if (product.image?.public_id) {
        await cloudinary.uploader.destroy(product.image.public_id);
      }

      product.imageUrl = req.file.path;
      product.image = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    // update fields
    if (updates.name) product.name = updates.name;
    if (updates.description) product.description = updates.description;
    if (updates.price !== undefined) product.price = Number(updates.price);
    if (updates.category) product.category = updates.category;
    if (updates.quality) product.quality = updates.quality;

    if (updates.category === "Green Nets" && updates.quality) {
  const q = updates.quality.trim();
  if (["100%", "90%", "75%", "50%"].includes(q)) {
    product.shadePercentage = Number(q.replace("%", ""));
  }
}



    // ✅ stock rule: stock=0 => inactive
    if (updates.stock !== undefined) {
      product.stock = Number(updates.stock);
      product.isActive = product.stock > 0;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// ✅ HARD DELETE product permanently + delete cloudinary image
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // delete image from cloudinary
    if (product.image?.public_id) {
      await cloudinary.uploader.destroy(product.image.public_id);
    }

    // delete from db
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted permanently" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;
