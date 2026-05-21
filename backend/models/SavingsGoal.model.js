const mongoose = require("mongoose");
const { normalizeMoneyAmount } = require("../utils/helpers");

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Goal name is required"],
      trim: true,
      maxlength: [100, "Goal name cannot exceed 100 characters"],
    },
    targetAmount: {
      type: Number,
      set: normalizeMoneyAmount,
      required: [true, "Target amount is required"],
      min: [1, "Target amount must be greater than 0"],
    },
    savedAmount: {
      type: Number,
      set: normalizeMoneyAmount,
      default: 0,
      min: 0,
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    category: {
      type: String,
      default: "General",
    },
    icon: {
      type: String,
      default: "🎯",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "cancelled"],
      default: "in-progress",
    },
    completedAt: {
      type: Date,
      default: null,
    },
    transactions: [
      {
        amount: {
          type: Number,
          set: normalizeMoneyAmount,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          maxlength: 200,
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

// Virtual for calculating progress percentage
savingsGoalSchema.virtual("progress").get(function () {
  return Math.min(
    Math.round((this.savedAmount / this.targetAmount) * 100),
    100,
  );
});

// Virtual for calculating remaining amount
savingsGoalSchema.virtual("remaining").get(function () {
  return Math.max(this.targetAmount - this.savedAmount, 0);
});

// Automatically update status when target is reached
savingsGoalSchema.pre("save", function (next) {
  if (this.savedAmount >= this.targetAmount && this.status === "in-progress") {
    this.status = "completed";
    this.completedAt = new Date();
  }
  next();
});

// Index for faster queries
savingsGoalSchema.index({ user: 1, status: 1 });
savingsGoalSchema.index({ user: 1, deadline: 1 });

// Enable virtuals in JSON
savingsGoalSchema.set("toJSON", { virtuals: true });
savingsGoalSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("SavingsGoal", savingsGoalSchema);
