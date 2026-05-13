const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  url: String,
  isMain: Boolean, // ảnh chính (thumbnail)
  createdAt: { type: Date, default: Date.now }
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
