const promotionService = require("../services/promotionService");

const createPromotion = async (req, res) => {
  try {
    const data = await promotionService.createPromotion(req.body);
    return res.status(201).json({
      message: "Promotion created successfully",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getAllPromotions = async (_req, res) => {
  try {
    const data = await promotionService.getAllPromotions();
    return res.status(200).json({
      message: "Success",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getPromotionById = async (req, res) => {
  try {
    const data = await promotionService.getPromotionById(req.params.id);
    return res.status(200).json({
      message: "Success",
      data,
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};

const updatePromotion = async (req, res) => {
  try {
    const data = await promotionService.updatePromotion(req.params.id, req.body);
    return res.status(200).json({
      message: "Promotion updated successfully",
      data,
    });
  } catch (error) {
    const statusCode = error.message === "Promotion not found" ? 404 : 400;
    return res.status(statusCode).json({
      message: error.message,
    });
  }
};

const deletePromotion = async (req, res) => {
  try {
    const data = await promotionService.deletePromotion(req.params.id);
    return res.status(200).json(data);
  } catch (error) {
    const statusCode = error.message === "Promotion not found" ? 404 : 400;
    return res.status(statusCode).json({
      message: error.message,
    });
  }
};

module.exports = {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
};
