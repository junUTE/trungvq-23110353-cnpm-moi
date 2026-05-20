const mongoose = require("mongoose");
const Cart = require("../models/cart");
const Product = require("../models/product");
const imageService = require("./imageService");

const normalizeQuantity = (value, fallback = 1) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const buildCartSummary = async (cart) => {
  const plainCart = typeof cart.toObject === "function" ? cart.toObject() : cart;
  const productIds = plainCart.items.map((item) => item.productId).filter(Boolean);

  const products = await Product.find({ _id: { $in: productIds } }).populate("categoryId");
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  const items = await Promise.all(
    plainCart.items.map(async (item) => {
      const product = productMap.get(String(item.productId));
      const currentPrice = Number(product?.price ?? item.unitPrice ?? 0);
      const quantity = normalizeQuantity(item.quantity);
      const subtotal = currentPrice * quantity;

      let images = [];
      if (product?._id) {
        images = await imageService.getImagesByProduct(product._id);
      }

      return {
        _id: item._id,
        quantity,
        unitPrice: Number(item.unitPrice ?? 0),
        currentPrice,
        subtotal,
        product: product
          ? {
              ...product.toObject(),
              images,
            }
          : null,
      };
    }),
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    _id: plainCart._id,
    userId: plainCart.userId,
    items,
    totalItems,
    totalPrice,
    updatedAt: plainCart.updatedAt,
    createdAt: plainCart.createdAt,
  };
};

const getOrCreateCartDocument = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
};

const getCartByUserId = async (userId) => {
  const cart = await getOrCreateCartDocument(userId);
  return buildCartSummary(cart);
};

const addItemToCart = async (userId, productId, quantity = 1) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Sản phẩm không hợp lệ");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  const normalizedQuantity = normalizeQuantity(quantity);
  if ((product.stock ?? 0) < normalizedQuantity) {
    throw new Error("Số lượng vượt quá tồn kho");
  }

  const cart = await getOrCreateCartDocument(userId);
  const existingItem = cart.items.find(
    (item) => String(item.productId) === String(product._id),
  );

  if (existingItem) {
    const nextQuantity = existingItem.quantity + normalizedQuantity;
    if ((product.stock ?? 0) < nextQuantity) {
      throw new Error("Số lượng trong giỏ vượt quá tồn kho");
    }

    existingItem.quantity = nextQuantity;
    existingItem.unitPrice = Number(product.price ?? 0);
  } else {
    cart.items.push({
      productId: product._id,
      quantity: normalizedQuantity,
      unitPrice: Number(product.price ?? 0),
    });
  }

  await cart.save();
  return buildCartSummary(cart);
};

const updateCartItem = async (userId, itemId, quantity) => {
  const cart = await getOrCreateCartDocument(userId);
  const item = cart.items.id(itemId);

  if (!item) {
    throw new Error("Không tìm thấy sản phẩm trong giỏ");
  }

  const product = await Product.findById(item.productId);
  if (!product) {
    throw new Error("Sản phẩm không còn tồn tại");
  }

  const normalizedQuantity = normalizeQuantity(quantity);
  if ((product.stock ?? 0) < normalizedQuantity) {
    throw new Error("Số lượng vượt quá tồn kho");
  }

  item.quantity = normalizedQuantity;
  item.unitPrice = Number(product.price ?? 0);

  await cart.save();
  return buildCartSummary(cart);
};

const removeCartItem = async (userId, itemId) => {
  const cart = await getOrCreateCartDocument(userId);
  const item = cart.items.id(itemId);

  if (!item) {
    throw new Error("Không tìm thấy sản phẩm trong giỏ");
  }

  item.deleteOne();
  await cart.save();
  return buildCartSummary(cart);
};

const clearCart = async (userId) => {
  const cart = await getOrCreateCartDocument(userId);
  cart.items = [];
  await cart.save();
  return buildCartSummary(cart);
};

module.exports = {
  getCartByUserId,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
