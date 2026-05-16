const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  name: String,
  sku: { type: String, trim: true, default: "" },
  price: Number,
  stock: { type: Number, default: 0 },
  description: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  createdAt: { type: Date, default: Date.now },
  sold: { type: Number, default: 0 }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
