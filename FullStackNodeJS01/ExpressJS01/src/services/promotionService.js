const Promotion = require("../models/promotion");
const ProductPromotion = require("../models/productPromotion");
const Product = require("../models/product");

const normalizeProductIds = (productIds) => {
  if (!productIds) return [];
  if (Array.isArray(productIds)) return productIds.filter(Boolean);
  return [productIds].filter(Boolean);
};

const attachProducts = async (promotion) => {
  const relations = await ProductPromotion.find({ promotionId: promotion._id }).populate(
    "productId",
  );

  return {
    ...promotion.toObject(),
    productIds: relations.map((relation) => relation.productId?._id).filter(Boolean),
    products: relations
      .map((relation) => relation.productId)
      .filter(Boolean)
      .map((product) => ({
        _id: product._id,
        name: product.name,
        sku: product.sku,
      })),
  };
};

const syncPromotionProducts = async (promotionId, productIds) => {
  const normalizedIds = normalizeProductIds(productIds);

  await ProductPromotion.deleteMany({ promotionId });

  if (normalizedIds.length === 0) {
    return;
  }

  const products = await Product.find({ _id: { $in: normalizedIds } }).select("_id");
  const validIds = products.map((product) => String(product._id));

  await Promise.all(
    validIds.map((productId) =>
      ProductPromotion.create({
        promotionId,
        productId,
      }),
    ),
  );
};

const createPromotion = async (data) => {
  const { title, discountPercent, startDate, endDate, productIds } = data;

  if (!title || discountPercent === undefined || discountPercent === null) {
    throw new Error("Title and discount are required");
  }

  const promotion = new Promotion({
    title,
    discountPercent,
    startDate,
    endDate,
  });

  const savedPromotion = await promotion.save();
  await syncPromotionProducts(savedPromotion._id, productIds);
  return await getPromotionById(savedPromotion._id);
};

const getAllPromotions = async () => {
  const promotions = await Promotion.find().sort({ createdAt: -1 });
  return await Promise.all(promotions.map((promotion) => attachProducts(promotion)));
};

const getPromotionById = async (id) => {
  const promotion = await Promotion.findById(id);

  if (!promotion) {
    throw new Error("Promotion not found");
  }

  return await attachProducts(promotion);
};

const updatePromotion = async (id, data) => {
  const promotion = await Promotion.findById(id);

  if (!promotion) {
    throw new Error("Promotion not found");
  }

  const { title, discountPercent, startDate, endDate, productIds } = data;

  if (title !== undefined) promotion.title = title;
  if (discountPercent !== undefined && discountPercent !== null) promotion.discountPercent = discountPercent;
  if (startDate !== undefined) promotion.startDate = startDate;
  if (endDate !== undefined) promotion.endDate = endDate;

  const savedPromotion = await promotion.save();
  if (productIds !== undefined) {
    await syncPromotionProducts(savedPromotion._id, productIds);
  }
  return await getPromotionById(savedPromotion._id);
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

  const promotionMap = new Map(
    promotions.map((promotion) => [String(promotion._id), promotion]),
  );

  return relations
    .filter((relation) => relation.productId)
    .map((relation) => ({
      ...relation.productId.toObject(),
      promotionId: relation.promotionId,
      promotionTitle: promotionMap.get(String(relation.promotionId))?.title || "",
      discountPercent:
        promotionMap.get(String(relation.promotionId))?.discountPercent ?? 0,
      discountedPrice: Math.round(
        Number(relation.productId.price || 0) *
          (1 -
            (promotionMap.get(String(relation.promotionId))?.discountPercent ?? 0) /
              100),
      ),
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
