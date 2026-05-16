const categoryService = require("../services/categoryService");

const createCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);

    return res.status(201).json({
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();

    return res.status(200).json({
      message: "Success",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    return res.status(200).json({
      message: "Success",
      data: category,
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);

    return res.status(200).json({
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    const statusCode = error.message === "Category not found" ? 404 : 400;

    return res.status(statusCode).json({
      message: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);

    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.message === "Category not found" ? 404 : 400;

    return res.status(statusCode).json({
      message: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
