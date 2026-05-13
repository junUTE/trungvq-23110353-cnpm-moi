const Promotion = require("../models/promotion");
const ProductPromotion = require("../models/productPromotion");
const Product = require("../models/product");

const createPromotion = async (data) => {
  const { title, discountPercent, startDate, endDate } = data;

  if (!title || discountPercent === undefined || discountPercent === null) {
    throw new Error("Title and discount are required");
  }

  const promotion = new Promotion({
    title,
    discountPercent,
    startDate,
    endDate,
  });

  return await promotion.save();
};

const getAllPromotions = async () => {
  return await Promotion.find().sort({ createdAt: -1 });
};

const getPromotionById = async (id) => {
  const promotion = await Promotion.findById(id);

  if (!promotion) {
    throw new Error("Promotion not found");
  }

  return promotion;
};

const updatePromotion = async (id, data) => {
  const promotion = await Promotion.findById(id);

  if (!promotion) {
    throw new Error("Promotion not found");
  }

  const { title, discountPercent, startDate, endDate } = data;

  if (title) promotion.title = title;
  if (discountPercent !== undefined && discountPercent !== null) promotion.discountPercent = discountPercent;
  if (startDate) promotion.startDate = startDate;
  if (endDate) promotion.endDate = endDate;

  return await promotion.save();
};

const deletePromotion = async (id) => {
  const promotion = await Promotion.findById(id);

  if (!promotion) {
    throw new Error("Promotion not found");
  }

  // xoá liên kết với product
  await ProductPromotion.deleteMany({ promotionId: id });

  await Promotion.findByIdAndDelete(id);

  return { message: "Promotion deleted successfully" };
};

const addProductToPromotion = async (promotionId, productId) => {
  const exist = await ProductPromotion.findOne({
    promotionId,
    productId,
  });

  if (exist) {
    throw new Error("Product already in promotion");
  }

  const relation = new ProductPromotion({
    promotionId,
    productId,
  });

  return await relation.save();
};

const removeProductFromPromotion = async (promotionId, productId) => {
  await ProductPromotion.findOneAndDelete({
    promotionId,
    productId,
  });

  return { message: "Product removed from promotion" };
};

const getPromotionProducts = async () => {
  const now = new Date();

  // lấy promotion đang hoạt động
  const promotions = await Promotion.find({
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  const promotionIds = promotions.map((p) => p._id);

  const relations = await ProductPromotion.find({
    promotionId: { $in: promotionIds },
  }).populate("productId");

  return relations.map((r) => ({
    ...r.productId.toObject(),
    promotionId: r.promotionId,
  }));
};

const getProductsByPromotion = async (promotionId) => {
  const relations = await ProductPromotion.find({ promotionId }).populate(
    "productId",
  );

  return relations.map((r) => r.productId);
};

module.exports = {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  addProductToPromotion,
  removeProductFromPromotion,
  getPromotionProducts,
  getProductsByPromotion,
};
