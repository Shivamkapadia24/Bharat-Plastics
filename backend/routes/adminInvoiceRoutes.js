const express = require("express");
const router = express.Router();

const  protect  = require("../middleware/authMiddleware");
const  adminOnly  = require("../middleware/adminMiddleware");
const { downloadInvoicePDF } = require("../controllers/adminInvoiceController");


router.get("/invoice/:id", protect, adminOnly, downloadInvoicePDF);

module.exports = router;