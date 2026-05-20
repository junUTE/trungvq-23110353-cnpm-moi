const orderService = require("../services/orderService");

const checkoutOrder = async (req, res) => {
  try {
    const data = await orderService.createOrderFromCart(req.user.id, req.body);
    return res.status(201).json({
      message: "Đặt hàng thành công",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const data = await orderService.getOrdersByUser(req.user.id);
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

const getOrderDetail = async (req, res) => {
  try {
    const data = await orderService.getOrderById(req.params.id, req.user);
    return res.status(200).json({
      message: "Success",
      data,
    });
  } catch (error) {
    const statusCode =
      error.message === "Không tìm thấy đơn hàng"
        ? 404
        : error.message === "Bạn không có quyền truy cập đơn hàng này"
          ? 403
          : 400;

    return res.status(statusCode).json({
      message: error.message,
    });
  }
};

const cancelMyOrder = async (req, res) => {
  try {
    const data = await orderService.cancelOrder(
      req.params.id,
      req.user.id,
      req.body?.reason,
    );
    return res.status(200).json({
      message: data.cancellationRequested
        ? "Đã gửi yêu cầu hủy đơn cho shop"
        : "Đã hủy đơn hàng",
      data,
    });
  } catch (error) {
    const statusCode =
      error.message === "Không tìm thấy đơn hàng"
        ? 404
        : error.message === "Bạn không có quyền hủy đơn hàng này"
          ? 403
          : 400;

    return res.status(statusCode).json({
      message: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const data = await orderService.getAllOrders();
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

const updateOrderStatus = async (req, res) => {
  try {
    const data = await orderService.updateOrderStatus(
      req.params.id,
      req.body?.status,
      req.user.id,
      req.body?.note,
    );
    return res.status(200).json({
      message: "Đã cập nhật trạng thái đơn hàng",
      data,
    });
  } catch (error) {
    const statusCode = error.message === "Không tìm thấy đơn hàng" ? 404 : 400;
    return res.status(statusCode).json({
      message: error.message,
    });
  }
};

module.exports = {
  checkoutOrder,
  getMyOrders,
  getOrderDetail,
  cancelMyOrder,
  getAllOrders,
  updateOrderStatus,
};
