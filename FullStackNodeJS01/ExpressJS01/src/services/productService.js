const Product = require("../models/product");
const Category = require("../models/category");
const imageService = require("../services/imageService");

const createProduct = async (data) => {
  const { name, price, description, categoryId, images } = data;

  if (!name || price === undefined || price === null) {
    throw new Error("Name and price are required");
  }

  // check category
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error("Category not found");
  }

  // create product
  const product = await Product.create({
    name,
    price,
    description,
    categoryId,
  });

  // add images (nếu có)
  if (images && images.length > 0) {
    await Promise.all(
      images.map((url, index) =>
        imageService.addImage(product._id, url, index === 0)
      )
    );
  }

  return product;
};

const getAllProducts = async () => {
  const products = await Product.find()
    .populate("categoryId")
    .sort({ createdAt: -1 });

  const result = await Promise.all(
    products.map(async (product) => {
      const images = await imageService.getImagesByProduct(product._id);

      return {
        ...product.toObject(),
        images,
      };
    })
  );

  return result;
};

const getProductById = async (id) => {
  const product = await Product.findById(id).populate("categoryId");

  if (!product) {
    throw new Error("Product not found");
  }

  const images = await imageService.getImagesByProduct(id);

  return {
    ...product.toObject(),
    images,
  };
};

const updateProduct = async (id, data) => {
  const { name, price, description, categoryId } = data;

  const product = await Product.findById(id);

  if (!product) {
    throw new Error("Product not found");
  }

  if (name) product.name = name;
  if (price !== undefined && price !== null) product.price = price;
  if (description) product.description = description;

  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) throw new Error("Category not found");

    product.categoryId = categoryId;
  }

  return await product.save();
};

const deleteProduct = async (id) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new Error("Product not found");
  }

  await Product.findByIdAndDelete(id);

  // delete images qua service
  await imageService.deleteImagesByProduct(id);

  return { message: "Product deleted successfully" };
};

const getNewestProducts = async (limit = 10) => {
  return await Product.find()
    .sort({ createdAt: -1 })
    .limit(limit);
};

const getBestSellerProducts = async (limit = 10) => {
  return await Product.find()
    .sort({ sold: -1 })
    .limit(limit);
};

const getProductsByCategory = async (categoryId) => {
  return await Product.find({ categoryId });
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getNewestProducts,
  getBestSellerProducts,
  getProductsByCategory,
};
