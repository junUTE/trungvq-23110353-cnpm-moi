const express = require("express");
const {
  getUser,
  getAccount,
  updateUser,
  deleteUser,
  updateProfile,
  deleteOwnAccount,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} = require("../controllers/userController");
const { login, register, sendVerificationCode } = require("../controllers/authController");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  setProductMainImage,
  searchProductsHandler,
  getCategoryProducts,
} = require("../controllers/productController");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
} = require("../controllers/promotionController");
const {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");
const {
  checkoutOrder,
  getMyOrders,
  getOrderDetail,
  cancelMyOrder,
  getAllOrders: getAllOrdersAdmin,
  updateOrderStatus,
} = require("../controllers/orderController");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const uploadProductImages = require("../middleware/uploadProductImages");
const homeController = require('../controllers/homeController')

const router = express.Router();

router.use(auth);

router.get("/", (req, res) => {
  return res.status(200).json("Hello world api");
});
router.post("/register", register);
router.post("/login", login);
router.post("/send-verification", sendVerificationCode);
router.get("/user", requireAdmin, getUser);
router.put("/user/:id", requireAdmin, updateUser);
router.delete("/user/:id", requireAdmin, deleteUser);
router.get("/account", getAccount);
router.put("/account", updateProfile);
router.delete("/account", deleteOwnAccount);
router.post("/account/addresses", addAddress);
router.put("/account/addresses/:addressId", updateAddress);
router.put("/account/addresses/:addressId/default", setDefaultAddress);
router.delete("/account/addresses/:addressId", deleteAddress);
router.get("/home", homeController.getHomepage);
router.get("/search", searchProductsHandler);
router.get("/public/categories", getAllCategories);
router.get("/public/categories/:categoryId/products", getCategoryProducts);
router.get("/product-detail/:id", getProductById);
router.get("/products", requireAdmin, getAllProducts);
router.get("/products/:id", requireAdmin, getProductById);
router.post("/products", requireAdmin, uploadProductImages.array("images", 6), createProduct);
router.put("/products/:id", requireAdmin, uploadProductImages.array("images", 6), updateProduct);
router.delete("/products/:id", requireAdmin, deleteProduct);
router.delete("/products/images/:imageId", requireAdmin, deleteProductImage);
router.put("/products/images/:imageId/main", requireAdmin, setProductMainImage);
router.get("/categories", requireAdmin, getAllCategories);
router.get("/categories/:id", requireAdmin, getCategoryById);
router.post("/categories", requireAdmin, createCategory);
router.put("/categories/:id", requireAdmin, updateCategory);
router.delete("/categories/:id", requireAdmin, deleteCategory);
router.get("/promotions", requireAdmin, getAllPromotions);
router.get("/promotions/:id", requireAdmin, getPromotionById);
router.post("/promotions", requireAdmin, createPromotion);
router.put("/promotions/:id", requireAdmin, updatePromotion);
router.delete("/promotions/:id", requireAdmin, deletePromotion);
router.get("/cart", getCart);
router.post("/cart/items", addCartItem);
router.put("/cart/items/:itemId", updateCartItem);
router.delete("/cart/items/:itemId", removeCartItem);
router.delete("/cart", clearCart);
router.post("/orders/checkout", checkoutOrder);
router.get("/orders/me", getMyOrders);
router.get("/orders/:id", getOrderDetail);
router.patch("/orders/:id/cancel", cancelMyOrder);
router.get("/admin/orders", requireAdmin, getAllOrdersAdmin);
router.patch("/admin/orders/:id/status", requireAdmin, updateOrderStatus);

module.exports = router;
