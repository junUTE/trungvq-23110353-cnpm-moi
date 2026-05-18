const productService = require("../services/productService");
const promotionService = require("../services/promotionService");
const userService = require("../services/userService");
const imageService = require("../services/imageService");

const attachImages = async (products) => {
  return await Promise.all(
    products.map(async (product) => {
      const images = await imageService.getImagesByProduct(product._id);
      const plainProduct =
        typeof product?.toObject === "function" ? product.toObject() : product;

      return {
        ...plainProduct,
        images,
      };
    }),
  );
};

const getHomepageData = async (userId) => {
  // chạy song song
  const [user, newest, bestSeller, mostViewed, promotion] = await Promise.all([
    userService.getUserById(userId),
    productService.getNewestProducts(10),
    productService.getBestSellerProducts(10),
    productService.getMostViewedProducts(10),
    promotionService.getPromotionProducts(),
  ]);

  // gắn image
  const [newestWithImages, bestSellerWithImages, mostViewedWithImages, promotionWithImages] =
    await Promise.all([
      attachImages(newest),
      attachImages(bestSeller),
      attachImages(mostViewed),
      attachImages(promotion),
    ]);

  return {
    user,
    newest: newestWithImages,
    bestSeller: bestSellerWithImages,
    mostViewed: mostViewedWithImages,
    promotion: promotionWithImages,
  };
};

module.exports = {
  getHomepageData,
};
