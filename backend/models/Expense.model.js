const mongoose = require("mongoose");
const { normalizeMoneyAmount } = require("../utils/helpers");

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      set: normalizeMoneyAmount,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Food & Dining",
        "Transportation",
        "Shopping",
        "Utilities",
        "Healthcare",
        "Entertainment",
        "Education",
        "Rent",
        "Other",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

// Virtual for getting formatted amount
expenseSchema.virtual("formattedAmount").get(function () {
  return `₹${this.amount.toFixed(2)}`;
});

module.exports = mongoose.model("Expense", expenseSchema);
