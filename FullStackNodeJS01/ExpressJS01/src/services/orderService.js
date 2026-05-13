const Order = require("../models/order");
const OrderDetail = require("../models/orderDetail");
const Product = require("../models/product");

const createOrder = async (userId, items) => {
  // items = [{ productId, quantity }]

  if (!items || items.length === 0) {
    throw new Error("Order must have at least 1 product");
  }

  // tạo order trước
  const order = new Order({
    userId,
  });

  const savedOrder = await order.save();

  let totalPrice = 0;

  // tạo order details
  const orderDetails = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product) {
      throw new Error("Product not found");
    }

    const price = product.price;
    const quantity = item.quantity;

    totalPrice += price * quantity;

    orderDetails.push({
      orderId: savedOrder._id,
      productId: product._id,
      quantity,
      price,
      totalPrice: price * quantity,
    });

    // 🔥 cập nhật sold (phục vụ best seller)
    product.sold += quantity;
    await product.save();
  }

  await OrderDetail.insertMany(orderDetails);

  // update total price
  savedOrder.totalPrice = totalPrice;
  await savedOrder.save();

  return savedOrder;
};

const getAllOrders = async () => {
  return await Order.find().populate("userId").sort({ createdAt: -1 });
};

const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId).populate("userId");

  if (!order) {
    throw new Error("Order not found");
  }

  const details = await OrderDetail.find({ orderId }).populate("productId");

  return {
    ...order.toObject(),
    items: details,
  };
};

const getOrdersByUser = async (userId) => {
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });

  const result = await Promise.all(
    orders.map(async (order) => {
      const items = await OrderDetail.find({ orderId: order._id }).populate(
        "productId",
      );

      return {
        ...order.toObject(),
        items,
      };
    }),
  );

  return result;
};

const deleteOrder = async (orderId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  await OrderDetail.deleteMany({ orderId });
  await Order.findByIdAndDelete(orderId);

  return { message: "Order deleted successfully" };
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  deleteOrder,
};
