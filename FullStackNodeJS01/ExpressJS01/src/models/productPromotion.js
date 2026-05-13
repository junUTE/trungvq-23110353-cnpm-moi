const mongoose = require('mongoose')

const productPromotionSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' }
});

const ProductPromotion = mongoose.model("ProductPromotion", productPromotionSchema);

module.exports = ProductPromotion;
