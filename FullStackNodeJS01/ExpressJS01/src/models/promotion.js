const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema({
  title: String,
  discountPercent: Number,
  startDate: Date,
  endDate: Date
}, {
  timestamps: true,
});

const Promotion = mongoose.model("Promotion", promotionSchema);

module.exports = Promotion;
