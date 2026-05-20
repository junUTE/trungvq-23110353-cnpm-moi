import { createContext, useContext, useEffect, useState } from "react";
import { message } from "antd";
import { AuthContext } from "./auth.context";
import {
  addCartItemApi,
  clearCartApi,
  getCartApi,
  removeCartItemApi,
  updateCartItemApi,
} from "../../util/api";

const emptyCart = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

export const CartContext = createContext({
  cart: emptyCart,
  cartLoading: false,
  loadCart: async () => {},
  addToCart: async () => false,
  buyNow: async () => false,
  updateCartItemQuantity: async () => false,
  removeFromCart: async () => false,
  clearCartItems: async () => false,
  resetCart: () => {},
});

export const CartWrapper = ({ children }) => {
  const { auth } = useContext(AuthContext);
  const [cart, setCart] = useState(emptyCart);
  const [cartLoading, setCartLoading] = useState(false);

  const resetCart = () => {
    setCart(emptyCart);
  };

  const applyCartResponse = (response) => {
    if (response?.data) {
      setCart(response.data);
      return true;
    }
    return false;
  };

  const loadCart = async () => {
    if (!auth.isAuthenticated) {
      resetCart();
      return;
    }

    setCartLoading(true);
    const response = await getCartApi();
    applyCartResponse(response);
    setCartLoading(false);
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      loadCart();
    } else {
      resetCart();
    }
  }, [auth.isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!auth.isAuthenticated) {
      message.error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng");
      return false;
    }

    const response = await addCartItemApi(productId, quantity);
    if (applyCartResponse(response)) {
      message.success(response.message || "Đã thêm vào giỏ hàng");
      return response.data;
    }

    message.error(response?.message || "Không thể thêm vào giỏ hàng");
    return false;
  };

  const buyNow = async (productId, quantity = 1) => {
    if (!auth.isAuthenticated) {
      message.error("Bạn cần đăng nhập để mua hàng");
      return false;
    }

    const response = await addCartItemApi(productId, quantity);
    if (applyCartResponse(response)) {
      return response.data;
    }

    message.error(response?.message || "Không thể xử lý mua ngay");
    return false;
  };

  const updateCartItemQuantity = async (itemId, quantity) => {
    const response = await updateCartItemApi(itemId, quantity);
    if (applyCartResponse(response)) {
      return true;
    }

    message.error(response?.message || "Không thể cập nhật giỏ hàng");
    return false;
  };

  const removeFromCart = async (itemId) => {
    const response = await removeCartItemApi(itemId);
    if (applyCartResponse(response)) {
      message.success(response.message || "Đã xóa khỏi giỏ hàng");
      return true;
    }

    message.error(response?.message || "Không thể xóa sản phẩm");
    return false;
  };

  const clearCartItems = async () => {
    const response = await clearCartApi();
    if (applyCartResponse(response)) {
      message.success(response.message || "Đã xóa toàn bộ giỏ hàng");
      return true;
    }

    message.error(response?.message || "Không thể xóa giỏ hàng");
    return false;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartLoading,
        loadCart,
        addToCart,
        buyNow,
        updateCartItemQuantity,
        removeFromCart,
        clearCartItems,
        resetCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
