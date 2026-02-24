const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/authMiddleware");
const { getSalesHistory } = require("../controllers/adminSalesHistoryControllers");

router.get("/sales-history", auth, admin, getSalesHistory);

module.exports = router;