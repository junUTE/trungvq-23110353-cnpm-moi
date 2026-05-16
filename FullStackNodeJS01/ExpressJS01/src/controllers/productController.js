const productService = require("../services/productService");
const imageService = require("../services/imageService");

const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body, req.files);

    return res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();

    return res.status(200).json({
      message: "Success",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);

    return res.status(200).json({
      message: "Success",
      data: product,
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.body,
      req.files,
    );

    return res.status(200).json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    const statusCode = error.message === "Product not found" ? 404 : 400;

    return res.status(statusCode).json({
      message: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};

const deleteProductImage = async (req, res) => {
  try {
    await imageService.deleteImageById(req.params.imageId);
    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const setProductMainImage = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) throw new Error("productId is required");
    await imageService.setMainImage(productId, req.params.imageId);
    return res.status(200).json({ message: "Main image updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const searchProductsHandler = async (req, res) => {
  try {
    const { q, categories, minPrice, maxPrice } = req.query;
    const products = await productService.searchProducts(q, categories, minPrice, maxPrice);
    return res.status(200).json({ message: "Success", data: products });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  setProductMainImage,
  searchProductsHandler,
};
