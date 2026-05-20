const mongoose = require("mongoose");
const Cart = require("../models/cart");
const Order = require("../models/order");
const OrderDetail = require("../models/orderDetail");
const Product = require("../models/product");
const User = require("../models/user");

const ORDER_STATUS = {
  NEW: "NEW",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  SHIPPING: "SHIPPING",
  DELIVERED: "DELIVERED",
  CANCELED: "CANCELED",
};

const PAYMENT_METHOD = {
  COD: "COD",
};

const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  CANCELED: "CANCELED",
};

const AUTO_CONFIRM_MINUTES = 30;
const USER_CANCEL_MINUTES = 30;

const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.NEW]: "Đơn hàng mới",
  [ORDER_STATUS.CONFIRMED]: "Đã xác nhận đơn hàng",
  [ORDER_STATUS.PREPARING]: "Shop đang chuẩn bị hàng",
  [ORDER_STATUS.SHIPPING]: "Đang giao hàng",
  [ORDER_STATUS.DELIVERED]: "Đã giao thành công",
  [ORDER_STATUS.CANCELED]: "Hủy đơn hàng",
};

const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD.COD]: "Thanh toán khi nhận hàng (COD)",
};

const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: "Chờ thanh toán",
  [PAYMENT_STATUS.PAID]: "Đã thanh toán",
  [PAYMENT_STATUS.FAILED]: "Thanh toán thất bại",
  [PAYMENT_STATUS.CANCELED]: "Đã hủy thanh toán",
};

const normalizeQuantity = (value, fallback = 1) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeString = (value) => String(value || "").trim();

const addHistoryEntry = (order, status, note, actorType = "system", actorId = null) => {
  order.statusHistory.push({
    status,
    note,
    actorType,
    actorId,
    changedAt: new Date(),
  });
};

const getCancellationDeadline = (order) =>
  new Date(new Date(order.createdAt).getTime() + USER_CANCEL_MINUTES * 60 * 1000);

const canUserCancelDirectly = (order) => {
  if (![ORDER_STATUS.NEW, ORDER_STATUS.CONFIRMED].includes(order.status)) {
    return false;
  }

  return new Date() <= getCancellationDeadline(order);
};

const canUserRequestCancellation = (order) => order.status === ORDER_STATUS.PREPARING;

const shouldAutoConfirm = (order) => {
  if (order.status !== ORDER_STATUS.NEW) {
    return false;
  }

  const autoConfirmAt = new Date(order.createdAt).getTime() + AUTO_CONFIRM_MINUTES * 60 * 1000;
  return Date.now() >= autoConfirmAt;
};

const revertInventoryForOrder = async (orderId) => {
  const orderItems = await OrderDetail.find({ orderId });

  for (const item of orderItems) {
    if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
      continue;
    }

    const product = await Product.findById(item.productId);
    if (!product) {
      continue;
    }

    product.stock = Number(product.stock || 0) + Number(item.quantity || 0);
    product.sold = Math.max(0, Number(product.sold || 0) - Number(item.quantity || 0));
    await product.save();
  }
};

const applyAutomationIfNeeded = async (order) => {
  let changed = false;

  if (shouldAutoConfirm(order)) {
    order.status = ORDER_STATUS.CONFIRMED;
    addHistoryEntry(
      order,
      ORDER_STATUS.CONFIRMED,
      "Tự động xác nhận sau 30 phút kể từ khi đặt hàng.",
      "system",
    );
    changed = true;
  }

  if (order.status === ORDER_STATUS.DELIVERED && order.payment.status !== PAYMENT_STATUS.PAID) {
    order.payment.status = PAYMENT_STATUS.PAID;
    order.payment.paidAt = order.payment.paidAt || new Date();
    changed = true;
  }

  if (changed) {
    await order.save();
  }

  return order;
};

const buildOrderSummary = async (order) => {
  const hydratedOrder = await applyAutomationIfNeeded(order);
  const plainOrder =
    typeof hydratedOrder.toObject === "function" ? hydratedOrder.toObject() : hydratedOrder;
  const items = await OrderDetail.find({ orderId: plainOrder._id }).populate("productId");

  const cancellationDeadline = getCancellationDeadline(plainOrder);

  return {
    ...plainOrder,
    items: items.map((item) => {
      const itemObject = item.toObject();
      return {
        ...itemObject,
        product: itemObject.productId || null,
      };
    }),
    statusLabel: ORDER_STATUS_LABELS[plainOrder.status] || plainOrder.status,
    payment: {
      ...plainOrder.payment,
      methodLabel:
        PAYMENT_METHOD_LABELS[plainOrder.payment?.method] || plainOrder.payment?.method,
      statusLabel:
        PAYMENT_STATUS_LABELS[plainOrder.payment?.status] || plainOrder.payment?.status,
    },
    cancellationDeadline,
    canCancelDirectly: canUserCancelDirectly(plainOrder),
    canRequestCancellation: canUserRequestCancellation(plainOrder),
  };
};

const validateCheckoutPayload = (payload = {}) => {
  const recipientName = normalizeString(payload.recipientName);
  const phone = normalizeString(payload.phone);
  const addressLine = normalizeString(payload.addressLine);
  const ward = normalizeString(payload.ward);
  const district = normalizeString(payload.district);
  const city = normalizeString(payload.city);
  const note = normalizeString(payload.note);
  const paymentMethod = normalizeString(payload.paymentMethod) || PAYMENT_METHOD.COD;

  if (!recipientName || !phone || !addressLine || !district || !city) {
    throw new Error("Vui lòng nhập đầy đủ thông tin giao hàng bắt buộc");
  }

  if (paymentMethod !== PAYMENT_METHOD.COD) {
    throw new Error("Hiện tại hệ thống chỉ hỗ trợ thanh toán COD");
  }

  return {
    recipientName,
    phone,
    addressLine,
    ward,
    district,
    city,
    note,
    paymentMethod,
  };
};

const createOrderFromCart = async (userId, payload = {}) => {
  const shippingInfo = validateCheckoutPayload(payload);
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  const cart = await Cart.findOne({ userId });
  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    throw new Error("Giỏ hàng đang trống");
  }

  const selectedItemIds = Array.isArray(payload.selectedItemIds)
    ? payload.selectedItemIds.map((itemId) => String(itemId))
    : [];

  if (selectedItemIds.length === 0) {
    throw new Error("Vui lòng chọn ít nhất một sản phẩm để đặt hàng");
  }

  const selectedCartItems = cart.items.filter((item) =>
    selectedItemIds.includes(String(item._id)),
  );

  if (selectedCartItems.length === 0) {
    throw new Error("Không tìm thấy sản phẩm đã chọn trong giỏ hàng");
  }

  const order = await Order.create({
    userId,
    status: ORDER_STATUS.NEW,
    payment: {
      method: shippingInfo.paymentMethod,
      status: PAYMENT_STATUS.PENDING,
    },
    shippingAddress: {
      recipientName: shippingInfo.recipientName,
      phone: shippingInfo.phone,
      addressLine: shippingInfo.addressLine,
      ward: shippingInfo.ward,
      district: shippingInfo.district,
      city: shippingInfo.city,
      note: shippingInfo.note,
    },
    statusHistory: [
      {
        status: ORDER_STATUS.NEW,
        note: "Đơn hàng được tạo thành công.",
        actorType: "user",
        actorId: userId,
        changedAt: new Date(),
      },
    ],
  });

  let totalPrice = 0;
  const orderDetails = [];

  for (const cartItem of selectedCartItems) {
    const product = await Product.findById(cartItem.productId);

    if (!product) {
      throw new Error("Có sản phẩm trong giỏ không còn tồn tại");
    }

    const quantity = normalizeQuantity(cartItem.quantity);
    if (Number(product.stock || 0) < quantity) {
      throw new Error(`Sản phẩm ${product.name} không đủ tồn kho`);
    }

    const unitPrice = Number(product.price || 0);
    const itemTotal = unitPrice * quantity;
    totalPrice += itemTotal;

    orderDetails.push({
      orderId: order._id,
      productId: product._id,
      productName: product.name,
      productSku: product.sku || "",
      productImage: "",
      quantity,
      price: unitPrice,
      totalPrice: itemTotal,
    });

    product.stock = Number(product.stock || 0) - quantity;
    product.sold = Number(product.sold || 0) + quantity;
    await product.save();
  }

  await OrderDetail.insertMany(orderDetails);
  order.totalPrice = totalPrice;
  await order.save();

  cart.items = cart.items.filter(
    (item) => !selectedItemIds.includes(String(item._id)),
  );
  await cart.save();

  return buildOrderSummary(order);
};

const getAllOrders = async () => {
  const orders = await Order.find().populate("userId").sort({ createdAt: -1 });
  return Promise.all(orders.map((order) => buildOrderSummary(order)));
};

const getOrderById = async (orderId, viewer = null) => {
  const order = await Order.findById(orderId).populate("userId");

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  if (
    viewer &&
    viewer.role !== "admin" &&
    String(order.userId?._id || order.userId) !== String(viewer.id)
  ) {
    throw new Error("Bạn không có quyền truy cập đơn hàng này");
  }

  return buildOrderSummary(order);
};

const getOrdersByUser = async (userId) => {
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  return Promise.all(orders.map((order) => buildOrderSummary(order)));
};

const cancelOrder = async (orderId, userId, reason = "") => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  if (String(order.userId) !== String(userId)) {
    throw new Error("Bạn không có quyền hủy đơn hàng này");
  }

  await applyAutomationIfNeeded(order);

  if (canUserCancelDirectly(order)) {
    order.status = ORDER_STATUS.CANCELED;
    order.payment.status = PAYMENT_STATUS.CANCELED;
    order.canceledAt = new Date();
    order.cancellationReason = normalizeString(reason);
    order.cancellationRequested = false;
    order.cancellationRequestedAt = null;

    addHistoryEntry(
      order,
      ORDER_STATUS.CANCELED,
      normalizeString(reason) || "Người dùng hủy đơn trong thời gian cho phép.",
      "user",
      userId,
    );

    await order.save();
    await revertInventoryForOrder(order._id);
    return buildOrderSummary(order);
  }

  if (canUserRequestCancellation(order)) {
    if (order.cancellationRequested) {
      throw new Error("Đơn hàng này đã có yêu cầu hủy đang chờ shop xử lý");
    }

    order.cancellationRequested = true;
    order.cancellationRequestedAt = new Date();
    order.cancellationReason = normalizeString(reason);

    addHistoryEntry(
      order,
      order.status,
      normalizeString(reason) || "Người dùng gửi yêu cầu hủy đơn cho shop.",
      "user",
      userId,
    );

    await order.save();
    return buildOrderSummary(order);
  }

  throw new Error("Đơn hàng này không thể hủy ở trạng thái hiện tại");
};

const updateOrderStatus = async (orderId, nextStatus, actorId, note = "") => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  await applyAutomationIfNeeded(order);

  const currentStatus = order.status;
  const allowedTransitions = {
    [ORDER_STATUS.NEW]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELED],
    [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELED],
    [ORDER_STATUS.PREPARING]: [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCELED],
    [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.DELIVERED],
    [ORDER_STATUS.DELIVERED]: [],
    [ORDER_STATUS.CANCELED]: [],
  };

  if (!allowedTransitions[currentStatus]?.includes(nextStatus)) {
    throw new Error("Không thể chuyển trạng thái đơn hàng theo yêu cầu");
  }

  order.status = nextStatus;

  if (nextStatus === ORDER_STATUS.CANCELED) {
    order.payment.status = PAYMENT_STATUS.CANCELED;
    order.canceledAt = new Date();
    await revertInventoryForOrder(order._id);
  }

  if (nextStatus === ORDER_STATUS.DELIVERED) {
    order.payment.status = PAYMENT_STATUS.PAID;
    order.payment.paidAt = order.payment.paidAt || new Date();
  }

  if (nextStatus !== ORDER_STATUS.CANCELED) {
    order.cancellationRequested = false;
    order.cancellationRequestedAt = null;
  }

  addHistoryEntry(
    order,
    nextStatus,
    normalizeString(note) || `Cập nhật trạng thái sang ${ORDER_STATUS_LABELS[nextStatus]}.`,
    "admin",
    actorId,
  );

  await order.save();
  return buildOrderSummary(order);
};

const deleteOrder = async (orderId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  await OrderDetail.deleteMany({ orderId });
  await Order.findByIdAndDelete(orderId);

  return { message: "Order deleted successfully" };
};

module.exports = {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  createOrderFromCart,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  cancelOrder,
  updateOrderStatus,
  deleteOrder,
};
