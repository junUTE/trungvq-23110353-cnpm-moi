const Category = require("../models/category");
const Product = require("../models/product");

// CREATE
const createCategory = async (data) => {
  const { name, description } = data;

  // validate đơn giản
  if (!name) {
    throw new Error("Category name is required");
  }

  // check trùng tên (optional nhưng nên có)
  const existing = await Category.findOne({ name });
  if (existing) {
    throw new Error("Category already exists");
  }

  const category = new Category({
    name,
    description,
  });

  return await category.save();
};

// READ ALL
const getAllCategories = async () => {
  return await Category.find().sort({ createdAt: -1 });
};

// READ ONE
const getCategoryById = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

// UPDATE
const updateCategory = async (id, data) => {
  const { name, description } = data;

  const category = await Category.findById(id);

  if (!category) {
    throw new Error("Category not found");
  }

  // update từng field nếu có
  if (name !== undefined) category.name = name;
  if (description !== undefined) category.description = description;

  return await category.save();
};

// DELETE
const deleteCategory = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new Error("Category not found");
  }

  const linkedProducts = await Product.countDocuments({ categoryId: id });
  if (linkedProducts > 0) {
    throw new Error("Khong the xoa category dang duoc san pham su dung");
  }

  await Category.findByIdAndDelete(id);

  return { message: "Category deleted successfully" };
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
