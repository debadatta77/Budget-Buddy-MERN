const User = require("../models/User.model");
const {
  errorResponse,
  successResponse,
  isValidEmail,
} = require("../utils/helpers");

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    successResponse(res, 200, user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    if (req.body.email !== undefined) {
      if (!isValidEmail(req.body.email)) {
        return errorResponse(res, 400, "Please provide a valid email address");
      }

      const existingUser = await User.findOne({
        email: req.body.email,
        _id: { $ne: req.user.id },
      });

      if (existingUser) {
        return errorResponse(res, 400, "Email is already in use");
      }
    }

    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      currency: req.body.currency,
      monthlyIncome: req.body.monthlyIncome,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key],
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    successResponse(res, 200, user, "Profile updated successfully");
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/profile
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    await user.deleteOne();

    successResponse(res, 200, {}, "Account deleted successfully");
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting account",
      error: error.message,
    });
  }
};
