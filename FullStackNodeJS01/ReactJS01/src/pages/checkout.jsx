import { useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  List,
  Radio,
  Space,
  Tag,
  Typography,
  notification,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../components/context/cart.context";
import { checkoutOrderApi, getAccountApi } from "../util/api";
import { resolveMediaUrl } from "../util/media";

const { Title, Paragraph, Text } = Typography;

const fallbackImage =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80";

const CheckoutPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { cart, loadCart } = useContext(CartContext);
  const [submitting, setSubmitting] = useState(false);

  const selectedItemIds = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("selected_cart_item_ids");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const selectedItems = useMemo(
    () => cart.items.filter((item) => selectedItemIds.includes(item._id)),
    [cart.items, selectedItemIds],
  );

  const summary = useMemo(
    () => ({
      totalItems: selectedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      totalPrice: selectedItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
    }),
    [selectedItems],
  );

  useEffect(() => {
    const loadDefaultAddress = async () => {
      const response = await getAccountApi();
      const defaultAddress = response?.defaultAddress;

      if (!defaultAddress) {
        return;
      }

      form.setFieldsValue({
        recipientName: response?.name ?? "",
        phone: defaultAddress.phone ?? "",
        addressLine: defaultAddress.addressLine ?? "",
        ward: defaultAddress.ward ?? "",
        district: defaultAddress.district ?? "",
        city: defaultAddress.city ?? "",
      });
    };

    loadDefaultAddress();
  }, [form]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    const response = await checkoutOrderApi({
      ...values,
      selectedItemIds,
    });

    if (response?.message && !response?.data) {
      notification.error({
        message: "Không thể đặt hàng",
        description: response.message,
      });
      setSubmitting(false);
      return;
    }

    sessionStorage.removeItem("selected_cart_item_ids");
    await loadCart();
    notification.success({
      message: "Đặt hàng thành công",
      description: `Mã đơn hàng: ${response?.data?._id || "N/A"}`,
    });
    setSubmitting(false);
    navigate("/profile");
  };

  if (selectedItems.length === 0) {
    return (
      <section className="panel-shell">
        <Card className="panel-card cart-card" variant="borderless">
          <Empty description="Chưa có sản phẩm nào được chọn để thanh toán">
            <Link to="/cart">
              <Button type="primary">Quay lại giỏ hàng</Button>
            </Link>
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
            <span className="eyebrow">Thanh toán</span>
            <Title level={2}>Xác nhận thanh toán</Title>
            <Paragraph>Hoàn tất thông tin nhận hàng cho các sản phẩm đã chọn.</Paragraph>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{ paymentMethod: "COD" }}
          onFinish={handleSubmit}
        >
          <div className="checkout-layout">
            <Card className="panel-card checkout-form-card" variant="borderless">
              <div className="checkout-form">
              <Form.Item
                label="Người nhận"
                name="recipientName"
                rules={[{ required: true, message: "Vui lòng nhập tên người nhận" }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Địa chỉ"
                name="addressLine"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item label="Phường/Xã" name="ward">
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Quận/Huyện"
                name="district"
                rules={[{ required: true, message: "Vui lòng nhập quận/huyện" }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Tỉnh/Thành phố"
                name="city"
                rules={[{ required: true, message: "Vui lòng nhập tỉnh/thành phố" }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item label="Ghi chú giao hàng" name="note">
                <Input.TextArea rows={2} />
              </Form.Item>
              </div>
            </Card>

            <div className="checkout-side-column">
              <Card className="cart-summary-card checkout-summary-card cart-checkout-card" variant="borderless">
                <Title level={5} className="checkout-side-title">
                  Tóm tắt đơn hàng
                </Title>
                <div className="cart-summary-row">
                  <span>Số lượng đã chọn</span>
                  <strong>{summary.totalItems}</strong>
                </div>
                <div className="cart-summary-row">
                  <span>Tổng giá</span>
                  <strong>{Number(summary.totalPrice || 0).toLocaleString()}đ</strong>
                </div>
              </Card>

              <Card className="checkout-items-card checkout-payment-card" variant="borderless">
                <Title level={5} className="checkout-side-title">
                  Phương thức thanh toán
                </Title>
                <Form.Item label="Thanh toán" name="paymentMethod" className="checkout-payment-method">
                  <Radio.Group className="checkout-payment-group">
                    <Radio value="COD">COD - Thanh toán khi nhận hàng</Radio>
                  </Radio.Group>
                </Form.Item>

                <Alert
                  type="info"
                  showIcon
                  message="COD là phương thức thanh toán bắt buộc hiện tại."
                  style={{ marginBottom: 16 }}
                />

                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <Button type="primary" size="large" block htmlType="submit" loading={submitting}>
                    Xác nhận đặt hàng
                  </Button>
                  <Link to="/cart">
                    <Button size="large" block>
                      Quay lại giỏ hàng
                    </Button>
                  </Link>
                </Space>
              </Card>

              <Card className="checkout-items-card" variant="borderless">
                <Title level={5} className="checkout-side-title">
                  Sản phẩm đã chọn
                </Title>
                <List
                  className="checkout-item-list"
                  itemLayout="horizontal"
                  dataSource={selectedItems}
                  renderItem={(item) => {
                    const product = item.product;
                    const productImage =
                      resolveMediaUrl(
                        product?.images?.find((image) => image.isMain)?.url ||
                          product?.images?.[0]?.url,
                      ) || fallbackImage;

                    return (
                      <List.Item className="checkout-side-item">
                        <div className="checkout-side-item-body">
                          <img className="checkout-side-thumb" src={productImage} alt={product?.name || "Sản phẩm"} />
                          <div className="checkout-side-copy">
                            <strong>{product?.name || "Sản phẩm"}</strong>
                            <Text type="secondary">SL: {item.quantity}</Text>
                            <span>{Number(item.subtotal || 0).toLocaleString()}đ</span>
                          </div>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </Card>
            </div>
          </div>
        </Form>
      </Card>
    </section>
  );
};

export default CheckoutPage;
