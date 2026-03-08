const express = require("express");
const router = express.Router();
const { getAnalytics } = require("../controllers/admin.controller");

const verifyAdminKey = (req, res, next) => {
  const providedKey = req.headers["x-admin-key"];
  const configuredKey = process.env.ADMIN_ACCESS_KEY;

  if (!configuredKey) {
    return res.status(500).json({
      success: false,
      message:
        "Admin access key is not configured. Set ADMIN_ACCESS_KEY in backend .env.",
    });
  }

  if (!providedKey || providedKey !== configuredKey) {
    return res.status(401).json({
      success: false,
      message: "Invalid admin key.",
    });
  }

  next();
};

router.use(verifyAdminKey);

router.get("/analytics", getAnalytics);

module.exports = router;
