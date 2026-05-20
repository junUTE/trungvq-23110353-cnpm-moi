import { useContext, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Empty,
  InputNumber,
  List,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import { DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../components/context/cart.context";
import { AuthContext } from "../components/context/auth.context";
import { resolveMediaUrl } from "../util/media";

const { Title, Paragraph, Text } = Typography;

const fallbackImage =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80";

const CartPage = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const {
    cart,
    cartLoading,
    updateCartItemQuantity,
    removeFromCart,
    clearCartItems,
  } = useContext(CartContext);
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  const hasUnavailableItems = useMemo(
    () => cart.items.some((item) => !item.product),
    [cart.items],
  );

  const selectableItems = useMemo(
    () => cart.items.filter((item) => item.product),
    [cart.items],
  );

  const selectedCount = useMemo(
    () =>
      selectableItems.filter((item) => selectedItemIds.includes(item._id))
        .length,
    [selectableItems, selectedItemIds],
  );

  const allSelected =
    selectableItems.length > 0 &&
    selectableItems.every((item) => selectedItemIds.includes(item._id));

  const toggleItemSelection = (itemId, checked) => {
    setSelectedItemIds((prev) =>
      checked
        ? [...new Set([...prev, itemId])]
        : prev.filter((id) => id !== itemId),
    );
  };

  const toggleSelectAll = (checked) => {
    setSelectedItemIds(checked ? selectableItems.map((item) => item._id) : []);
  };

  const selectedSummary = useMemo(() => {
    const selectedItems = cart.items.filter((item) =>
      selectedItemIds.includes(item._id),
    );
    return {
      totalItems: selectedItems.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0,
      ),
      totalPrice: selectedItems.reduce(
        (sum, item) => sum + Number(item.subtotal || 0),
        0,
      ),
    };
  }, [cart.items, selectedItemIds]);

  const goToCheckout = () => {
    if (selectedItemIds.length === 0) {
      return;
    }

    sessionStorage.setItem(
      "selected_cart_item_ids",
      JSON.stringify(selectedItemIds),
    );
    navigate("/checkout");
  };

  if (!auth.isAuthenticated) {
    return (
      <section className="panel-shell">
        <Card className="panel-card cart-card" variant="borderless">
          <Empty
            description="Bạn cần đăng nhập để xem giỏ hàng"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate("/login")}>
              Đăng nhập
            </Button>
          </Empty>
        </Card>
      </section>
    );
  }

  return (
    <section className="panel-shell">
      <Card className="panel-card cart-card" variant="borderless">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Giỏ hàng</span>
            <Title level={2}>Sản phẩm bạn đã chọn</Title>
            <Paragraph>
              Điều chỉnh số lượng, nhập thông tin nhận hàng và xác nhận COD.
            </Paragraph>
          </div>
          {cart.items.length > 0 ? (
            <Popconfirm
              title="Xóa toàn bộ giỏ hàng?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={clearCartItems}
            >
              <Button danger>Xóa tất cả</Button>
            </Popconfirm>
          ) : null}
        </div>

        {hasUnavailableItems ? (
          <Alert
            type="warning"
            showIcon
            message="Có sản phẩm không còn tồn tại trong hệ thống. Bạn nên xóa chúng khỏi giỏ hàng trước khi đặt."
            style={{ marginBottom: 20 }}
          />
        ) : null}

        {cartLoading ? (
          <div className="cart-loader">
            <Spin size="large" />
          </div>
        ) : cart.items.length === 0 ? (
          <Empty
            description="Giỏ hàng đang trống"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Link to="/">
              <Button type="primary" icon={<ShoppingCartOutlined />}>
                Tiếp tục mua sắm
              </Button>
            </Link>
          </Empty>
        ) : (
          <div className="cart-layout">
            <div className="cart-main-column">
              <div className="cart-selection-bar">
                <Checkbox
                  checked={allSelected}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                >
                  Chọn tất cả sản phẩm hợp lệ
                </Checkbox>
                <Text type="secondary">
                  Đã xác nhận {selectedCount} sản phẩm
                </Text>
              </div>

              <List
                className="cart-list"
                itemLayout="horizontal"
                dataSource={cart.items}
                renderItem={(item) => {
                  const product = item.product;
                  const productImage =
                    resolveMediaUrl(
                      product?.images?.find((image) => image.isMain)?.url ||
                        product?.images?.[0]?.url,
                    ) || fallbackImage;

                  return (
                    <List.Item
                      className="cart-item"
                      actions={[
                        <Popconfirm
                          key="delete"
                          title="Xóa sản phẩm này khỏi giỏ?"
                          okText="Xóa"
                          cancelText="Hủy"
                          onConfirm={() => removeFromCart(item._id)}
                        >
                          <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>,
                      ]}
                    >
                      <div className="cart-item-body">
                        <Checkbox
                          checked={selectedItemIds.includes(item._id)}
                          disabled={!product}
                          onChange={(e) =>
                            toggleItemSelection(item._id, e.target.checked)
                          }
                        />
                        <img
                          className="cart-item-image"
                          src={productImage}
                          alt={product?.name || "Sản phẩm"}
                        />

                        <div className="cart-item-copy">
                          <div className="cart-item-head">
                            {product ? (
                              <Link
                                to={`/products/${product._id}`}
                                className="cart-item-title"
                              >
                                {product.name}
                              </Link>
                            ) : (
                              <span className="cart-item-title">
                                Sản phẩm không còn khả dụng
                              </span>
                            )}
                            <Tag color={product ? "gold" : "red"}>
                              {product
                                ? `${Number(item.currentPrice || 0).toLocaleString()}đ`
                                : "Không khả dụng"}
                            </Tag>
                          </div>

                          <Text type="secondary">
                            {product?.categoryId?.name || "Danh mục chung"}
                          </Text>

                          <div className="cart-item-controls">
                            <span>Số lượng</span>
                            <InputNumber
                              min={1}
                              max={product?.stock || 1}
                              value={item.quantity}
                              disabled={!product}
                              onChange={(value) => {
                                if (value) {
                                  updateCartItemQuantity(item._id, value);
                                }
                              }}
                            />
                            {product ? (
                              <span>Tồn kho: {product.stock ?? 0}</span>
                            ) : null}
                          </div>
                        </div>

                        <div className="cart-item-price">
                          <Text type="secondary">Tạm tính</Text>
                          <strong>
                            {Number(item.subtotal || 0).toLocaleString()}đ
                          </strong>
                        </div>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>

            <Card
              className="cart-summary-card cart-checkout-card"
              variant="borderless"
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <Title level={4} style={{ margin: 0 }}>
                  Tóm tắt đơn hàng
                </Title>
                <div className="cart-summary-row">
                  <span>Số lượng đã chọn</span>
                  <strong>{selectedSummary.totalItems}</strong>
                </div>
                <div className="cart-summary-row">
                  <span>Tổng giá đã chọn</span>
                  <strong>
                    {Number(selectedSummary.totalPrice || 0).toLocaleString()}đ
                  </strong>
                </div>
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={goToCheckout}
                  disabled={hasUnavailableItems || selectedItemIds.length === 0}
                >
                  Thanh toán
                </Button>

                <Link to="/">
                  <Button size="large" block>
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </Space>
            </Card>
          </div>
        )}
      </Card>
    </section>
  );
};

export default CartPage;
