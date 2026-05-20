const mongoose = require("mongoose");

const orderStatusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: "" },
    actorType: { type: String, default: "system" },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    totalPrice: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "NEW",
        "CONFIRMED",
        "PREPARING",
        "SHIPPING",
        "DELIVERED",
        "CANCELED",
      ],
      default: "NEW",
    },
    payment: {
      method: {
        type: String,
        enum: ["COD"],
        default: "COD",
      },
      status: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED", "CANCELED"],
        default: "PENDING",
      },
      paidAt: { type: Date, default: null },
      transactionCode: { type: String, default: "" },
    },
    shippingAddress: {
      recipientName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      addressLine: { type: String, required: true, trim: true },
      ward: { type: String, default: "", trim: true },
      district: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      note: { type: String, default: "", trim: true },
    },
    cancellationRequested: { type: Boolean, default: false },
    cancellationRequestedAt: { type: Date, default: null },
    cancellationReason: { type: String, default: "", trim: true },
    canceledAt: { type: Date, default: null },
    statusHistory: {
      type: [orderStatusHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
