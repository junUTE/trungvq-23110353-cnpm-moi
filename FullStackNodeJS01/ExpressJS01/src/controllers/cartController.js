const cartService = require("../services/cartService");

const getCart = async (req, res) => {
  try {
    const data = await cartService.getCartByUserId(req.user.id);
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

const addCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const data = await cartService.addItemToCart(req.user.id, productId, quantity);
    return res.status(200).json({
      message: "Đã thêm sản phẩm vào giỏ hàng",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const data = await cartService.updateCartItem(req.user.id, req.params.itemId, quantity);
    return res.status(200).json({
      message: "Đã cập nhật giỏ hàng",
      data,
    });
  } catch (error) {
    const statusCode = error.message === "Không tìm thấy sản phẩm trong giỏ" ? 404 : 400;
    return res.status(statusCode).json({
      message: error.message,
    });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const data = await cartService.removeCartItem(req.user.id, req.params.itemId);
    return res.status(200).json({
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
      data,
    });
  } catch (error) {
    const statusCode = error.message === "Không tìm thấy sản phẩm trong giỏ" ? 404 : 400;
    return res.status(statusCode).json({
      message: error.message,
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const data = await cartService.clearCart(req.user.id);
    return res.status(200).json({
      message: "Đã xóa toàn bộ giỏ hàng",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};
