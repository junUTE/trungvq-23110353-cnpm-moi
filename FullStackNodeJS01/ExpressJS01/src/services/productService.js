const Product = require("../models/product");
const Category = require("../models/category");
const imageService = require("../services/imageService");

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  return value === "true" || value === "1";
};

const normalizeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const createProduct = async (data, files = []) => {
  const { name, sku, price, stock, description, categoryId } = data;

  if (!name || price === undefined || price === null) {
    throw new Error("Name and price are required");
  }

  if (stock !== undefined && normalizeNumber(stock, -1) < 0) {
    throw new Error("Stock must be greater than or equal to 0");
  }

  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
  }

  const product = await Product.create({
    name,
    sku,
    price: normalizeNumber(price),
    stock: normalizeNumber(stock),
    description,
    categoryId,
  });

  if (files.length > 0) {
    await Promise.all(
      files.map((file, index) =>
        imageService.addImage(product._id, `/uploads/products/${file.filename}`, index === 0),
      ),
    );
  }

  return await getProductById(product._id);
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

const updateProduct = async (id, data, files = []) => {
  const { name, sku, price, stock, description, categoryId, replaceImages } = data;

  const product = await Product.findById(id);

  if (!product) {
    throw new Error("Product not found");
  }

  if (name !== undefined) product.name = name;
  if (sku !== undefined) product.sku = sku;
  if (price !== undefined && price !== null) product.price = price;
  if (stock !== undefined && stock !== null) {
    if (normalizeNumber(stock, -1) < 0) {
      throw new Error("Stock must be greater than or equal to 0");
    }
    product.stock = normalizeNumber(stock);
  }
  if (description !== undefined) product.description = description;

  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) throw new Error("Category not found");

    product.categoryId = categoryId;
  }

  const updatedProduct = await product.save();

  if (files.length > 0 && normalizeBoolean(replaceImages)) {
    await imageService.deleteImagesByProduct(id);
  }

  if (files.length > 0) {
    const currentImages = await imageService.getImagesByProduct(id);
    const startIndex = currentImages.length;

    await Promise.all(
      files.map((file, index) =>
        imageService.addImage(
          id,
          `/uploads/products/${file.filename}`,
          startIndex === 0 && index === 0,
        ),
      ),
    );
  }

  return await getProductById(updatedProduct._id);
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

const searchProducts = async (keyword, categories, minPrice, maxPrice) => {
  const query = {};
  if (keyword) {
    query.name = { $regex: keyword, $options: "i" };
  }
  
  if (categories) {
    let catArray = [];
    if (Array.isArray(categories)) {
      catArray = categories;
    } else if (typeof categories === "string") {
      catArray = categories.split(",").filter(Boolean);
    }
    if (catArray.length > 0) {
      query.categoryId = { $in: catArray };
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }

  const products = await Product.find(query)
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

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getNewestProducts,
  getBestSellerProducts,
  getProductsByCategory,
  searchProducts,
};
