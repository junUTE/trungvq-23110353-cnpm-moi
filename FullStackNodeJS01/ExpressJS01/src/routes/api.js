const express = require("express");
const {
  createUser,
  handleLogin,
  getUser,
  getAccount,
  updateUser,
  deleteUser,
  updateProfile,
  deleteOwnAccount,
} = require("../controllers/userController");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  setProductMainImage,
  searchProductsHandler,
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
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const uploadProductImages = require("../middleware/uploadProductImages");
const homeController = require('../controllers/homeController')

const router = express.Router();

router.use(auth);

router.get("/", (req, res) => {
  return res.status(200).json("Hello world api");
});
router.post("/register", createUser);
router.post("/login", handleLogin);
router.get("/user", requireAdmin, getUser);
router.put("/user/:id", requireAdmin, updateUser);
router.delete("/user/:id", requireAdmin, deleteUser);
router.get("/account", getAccount);
router.put("/account", updateProfile);
router.delete("/account", deleteOwnAccount);
router.get("/home", homeController.getHomepage);
router.get("/search", searchProductsHandler);
router.get("/public/categories", getAllCategories);
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

module.exports = router;
