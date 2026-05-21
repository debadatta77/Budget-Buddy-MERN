const mongoose = require("mongoose");
const { normalizeMoneyAmount } = require("../utils/helpers");

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    monthlyBudget: {
      type: Number,
      set: normalizeMoneyAmount,
      required: [true, "Monthly budget is required"],
      min: [0, "Budget cannot be negative"],
    },
    spent: {
      type: Number,
      set: normalizeMoneyAmount,
      default: 0,
      min: 0,
    },
    remaining: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    categoryBudgets: [
      {
        category: {
          type: String,
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
        allocated: {
          type: Number,
          set: normalizeMoneyAmount,
          default: 0,
          min: 0,
        },
        spent: {
          type: Number,
          set: normalizeMoneyAmount,
          default: 0,
          min: 0,
        },
      },
    ],
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

// Calculate remaining budget before saving
budgetSchema.pre("save", function (next) {
  this.remaining = this.monthlyBudget - this.spent;
  next();
});

// Index for faster queries
budgetSchema.index({ user: 1, year: -1, month: -1 });
budgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
