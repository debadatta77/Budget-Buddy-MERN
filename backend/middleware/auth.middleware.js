const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const getAdminEmails = () => {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

const isConfiguredAdmin = (email = "") => {
  return getAdminEmails().includes(String(email).toLowerCase());
};

// Protect routes - Verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route. Please login.",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found. Please login again.",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired. Please login again.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error in authentication",
      error: error.message,
    });
  }
};

// Generate JWT Token
exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Restrict route access to admins
exports.adminOnly = (req, res, next) => {
  const isAdmin =
    req.user?.role === "admin" || isConfiguredAdmin(req.user?.email);

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  next();
};

// Send token response
exports.sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = exports.generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      currency: user.currency,
      monthlyIncome: user.monthlyIncome,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
};
