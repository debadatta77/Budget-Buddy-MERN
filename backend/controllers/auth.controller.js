const User = require("../models/User.model");
const { sendTokenResponse } = require("../middleware/auth.middleware");
const {
  isValidEmail,
  isStrongPassword,
  errorResponse,
} = require("../utils/helpers");

const getAdminEmails = () => {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

const isConfiguredAdmin = (email = "") => {
  return getAdminEmails().includes(String(email).toLowerCase());
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return errorResponse(
        res,
        400,
        "Please provide name, email, and password",
      );
    }

    if (!isValidEmail(email)) {
      return errorResponse(res, 400, "Please provide a valid email address");
    }

    if (!isStrongPassword(password)) {
      return errorResponse(res, 400, "Password must be at least 6 characters");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, "User with this email already exists");
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: isConfiguredAdmin(email) ? "admin" : "user",
    });

    // Send token response
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return errorResponse(res, 400, "Please provide email and password");
    }

    // Check if user exists (include password for comparison)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return errorResponse(res, 401, "Invalid credentials");
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return errorResponse(res, 401, "Invalid credentials");
    }

    // Keep role in sync for configured admin emails
    if (isConfiguredAdmin(user.email) && user.role !== "admin") {
      user.role = "admin";
      await user.save({ validateBeforeSave: false });
    }

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user data",
      error: error.message,
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, "Please provide current and new password");
    }

    if (!isStrongPassword(newPassword)) {
      return errorResponse(
        res,
        400,
        "New password must be at least 6 characters",
      );
    }

    // Get user with password
    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return errorResponse(res, 401, "Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating password",
      error: error.message,
    });
  }
};
