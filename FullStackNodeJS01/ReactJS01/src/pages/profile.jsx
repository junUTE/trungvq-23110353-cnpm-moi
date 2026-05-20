import { useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
  notification,
  Switch,
} from "antd";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/context/auth.context";
import {
  cancelMyOrderApi,
  createAddressApi,
  deleteOwnAccountApi,
  deleteAddressApi,
  getMyOrdersApi,
  getAccountApi,
  setDefaultAddressApi,
  updateAddressApi,
  updateOwnProfileApi,
} from "../util/api";

const { Title } = Typography;

const statusColorMap = {
  NEW: "gold",
  CONFIRMED: "geekblue",
  PREPARING: "orange",
  SHIPPING: "cyan",
  DELIVERED: "green",
  CANCELED: "red",
};

const statusLabelMap = {
  NEW: "Đơn hàng mới",
  CONFIRMED: "Đã xác nhận đơn hàng",
  PREPARING: "Shop đang chuẩn bị hàng",
  SHIPPING: "Đang giao hàng",
  DELIVERED: "Đã giao thành công",
  CANCELED: "Hủy đơn hàng",
};

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [addressForm] = Form.useForm();
  const navigate = useNavigate();
  const { auth, setAuth, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const orderStats = useMemo(
    () => ({
      active: orders.filter((order) => !["DELIVERED", "CANCELED"].includes(order.status)).length,
      completed: orders.filter((order) => order.status === "DELIVERED").length,
      canceled: orders.filter((order) => order.status === "CANCELED").length,
    }),
    [orders],
  );

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const response = await getMyOrdersApi();
    if (response?.data) {
      setOrders(response.data);
    }
    setOrdersLoading(false);
  };

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      const response = await getAccountApi();

      if (response?.message) {
        setError(response.message);
        setLoading(false);
        return;
      }

      form.setFieldsValue({
        username: response?.username ?? "",
        name: response?.name ?? "",
        email: response?.email ?? "",
        role: response?.role ?? "",
        password: "",
        confirmPassword: "",
      });
      setAddresses(response?.addresses ?? []);
      setDefaultAddress(response?.defaultAddress ?? null);
      setLoading(false);
    };

    fetchProfile();
    fetchOrders();
  }, [auth.isAuthenticated, form, navigate]);

  const handleSubmit = async (values) => {
    setSaving(true);

    const payload = {
      username: values.username,
      name: values.name,
      email: values.email,
    };

    if (values.password) {
      payload.password = values.password;
    }

    const response = await updateOwnProfileApi(payload);

    if (response?.message && !response?.data) {
      notification.error({
        message: "Không thể cập nhật hồ sơ",
        description: response.message,
      });
      setSaving(false);
      return;
    }

    setAuth({
      isAuthenticated: true,
      user: {
        id: response?.data?._id ?? auth.user.id,
        username: response?.data?.username ?? auth.user.username,
        name: response?.data?.name ?? "",
        email: response?.data?.email ?? "",
        role: response?.data?.role ?? auth.user.role,
      },
    });

    form.setFieldsValue({
      password: "",
      confirmPassword: "",
    });

    notification.success({
      message: "Đã cập nhật thông tin cá nhân",
    });
    setSaving(false);
  };

  const syncAddressState = (responseData) => {
    setAddresses(responseData?.addresses ?? []);
    setDefaultAddress(responseData?.defaultAddress ?? null);
  };

  const openCreateAddressModal = () => {
    setSelectedAddress(null);
    addressForm.resetFields();
    addressForm.setFieldsValue({ isDefault: addresses.length === 0 });
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (address) => {
    setSelectedAddress(address);
    addressForm.setFieldsValue({
      phone: address.phone,
      addressLine: address.addressLine,
      ward: address.ward,
      district: address.district,
      city: address.city,
      isDefault: address.isDefault,
    });
    setAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setSelectedAddress(null);
    setAddressModalOpen(false);
    addressForm.resetFields();
  };

  const handleAddressSubmit = async (values) => {
    setSavingAddress(true);
    const response = selectedAddress
      ? await updateAddressApi(selectedAddress._id, values)
      : await createAddressApi(values);

    if (response?.message && !response?.data) {
      notification.error({
        message: selectedAddress ? "Không thể cập nhật địa chỉ" : "Không thể thêm địa chỉ",
        description: response.message,
      });
      setSavingAddress(false);
      return;
    }

    syncAddressState(response.data);
    notification.success({
      message: selectedAddress ? "Đã cập nhật địa chỉ" : "Đã thêm địa chỉ",
    });
    closeAddressModal();
    setSavingAddress(false);
  };

  const handleSetDefaultAddress = async (address) => {
    const response = await setDefaultAddressApi(address._id);
    if (response?.message && !response?.data) {
      notification.error({
        message: "Không thể đặt địa chỉ mặc định",
        description: response.message,
      });
      return;
    }
    syncAddressState(response.data);
    notification.success({ message: "Đã cập nhật địa chỉ mặc định" });
  };

  const handleDeleteAddress = async (address) => {
    const response = await deleteAddressApi(address._id);
    if (response?.message && !response?.data) {
      notification.error({
        message: "Không thể xóa địa chỉ",
        description: response.message,
      });
      return;
    }
    syncAddressState(response.data);
    notification.success({ message: "Đã xóa địa chỉ" });
  };

  const handleDeleteAccount = async () => {
    const response = await deleteOwnAccountApi();

    if (response?.message !== "Account deleted successfully") {
      notification.error({
        message: "Không thể xóa tài khoản",
        description: response?.message || "Đã có lỗi xảy ra.",
      });
      return;
    }

    logout();
    notification.success({
      message: "Tài khoản đã được xóa",
    });
    navigate("/register");
  };

  const handleCancelOrder = async (order) => {
    const response = await cancelMyOrderApi(order._id, "");

    if (response?.message && !response?.data) {
      notification.error({
        message: "Không thể xử lý yêu cầu hủy đơn",
        description: response.message,
      });
      return;
    }

    notification.success({
      message: response.message || "Đã cập nhật đơn hàng",
    });
    await fetchOrders();
    if (selectedOrder?._id === order._id) {
      setSelectedOrder(response.data);
    }
  };

  return (
    <section className="panel-shell">
      <Card className="panel-card profile-card profile-extended-card" variant="borderless" loading={loading}>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Tài khoản của bạn</span>
            <Title level={2}>Hồ sơ, lịch sử mua hàng và theo dõi đơn</Title>
          </div>
        </div>

        {error ? (
          <Alert
            type="error"
            showIcon
            title={error}
            style={{ marginBottom: 16 }}
          />
        ) : null}

        <Tabs
          defaultActiveKey="profile"
          items={[
            {
              key: "profile",
              label: "Thông tin cá nhân",
              children: (
                <Form layout="vertical" form={form} onFinish={handleSubmit}>
                  <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: "Vui lòng nhập username." }]}
                  >
                    <Input size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Tên"
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập tên." }]}
                  >
                    <Input size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email." },
                      { type: "email", message: "Email không hợp lệ." },
                    ]}
                  >
                    <Input size="large" />
                  </Form.Item>

                  <Form.Item label="Role" name="role">
                    <Input size="large" disabled />
                  </Form.Item>

                  <Form.Item
                    label="Mật khẩu mới"
                    name="password"
                    rules={[
                      {
                        min: 6,
                        message: "Mật khẩu mới cần ít nhất 6 ký tự.",
                      },
                    ]}
                  >
                    <Input.Password size="large" placeholder="Bỏ trống nếu không đổi" />
                  </Form.Item>

                  <Form.Item
                    label="Nhập lại mật khẩu mới"
                    name="confirmPassword"
                    dependencies={["password"]}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!getFieldValue("password") && !value) {
                            return Promise.resolve();
                          }

                          if (getFieldValue("password") === value) {
                            return Promise.resolve();
                          }

                          return Promise.reject(
                            new Error("Mật khẩu nhập lại không khớp."),
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" />
                  </Form.Item>

                  <Space wrap>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={saving}
                      className="hero-button"
                    >
                      Lưu thay đổi
                    </Button>
                    <Popconfirm
                      title="Xóa tài khoản này?"
                      description="Hành động này không thể hoàn tác."
                      onConfirm={handleDeleteAccount}
                    >
                      <Button danger>Xóa tài khoản</Button>
                    </Popconfirm>
                  </Space>
                </Form>
              ),
            },
            {
              key: "addresses",
              label: `Địa chỉ (${addresses.length})`,
              children: (
                <>
                  <div className="panel-heading">
                    <div>
                      <Title level={3}>Địa chỉ giao hàng</Title>
                    </div>
                    <Button type="primary" onClick={openCreateAddressModal}>
                      Thêm địa chỉ
                    </Button>
                  </div>

                  {defaultAddress ? (
                    <Card className="address-highlight-card" variant="borderless">
                      <span className="eyebrow">Mặc định</span>
                      <p className="address-line-strong">{defaultAddress.addressLine}</p>
                      <p>{defaultAddress.ward || ""} {defaultAddress.district}, {defaultAddress.city}</p>
                      <p>{defaultAddress.phone}</p>
                    </Card>
                  ) : null}

                  <Table
                    rowKey="_id"
                    dataSource={addresses}
                    pagination={{ pageSize: 5 }}
                    columns={[
                      {
                        title: "Địa chỉ",
                        render: (_, record) => (
                          <div>
                            <strong>{record.addressLine}</strong>
                            <div className="muted-copy">
                              {[record.ward, record.district, record.city].filter(Boolean).join(", ")}
                            </div>
                          </div>
                        ),
                      },
                      {
                        title: "Điện thoại",
                        dataIndex: "phone",
                      },
                      {
                        title: "Mặc định",
                        render: (_, record) => (
                          record.isDefault ? <Tag color="green">Mặc định</Tag> : <Tag>Thường</Tag>
                        ),
                      },
                      {
                        title: "Hành động",
                        render: (_, record) => (
                          <Space wrap>
                            <Button onClick={() => openEditAddressModal(record)}>Sửa</Button>
                            {!record.isDefault ? (
                              <Button onClick={() => handleSetDefaultAddress(record)}>
                                Đặt mặc định
                              </Button>
                            ) : null}
                            <Popconfirm
                              title="Xóa địa chỉ này?"
                              onConfirm={() => handleDeleteAddress(record)}
                            >
                              <Button danger>Xóa</Button>
                            </Popconfirm>
                          </Space>
                        ),
                      },
                    ]}
                  />
                </>
              ),
            },
            {
              key: "orders",
              label: `Đơn hàng (${orders.length})`,
              children: (
                <>
                  <div className="order-stat-grid">
                    <Card variant="borderless" className="order-stat-card">
                      <span>Đang xử lý</span>
                      <strong>{orderStats.active}</strong>
                    </Card>
                    <Card variant="borderless" className="order-stat-card">
                      <span>Đã giao</span>
                      <strong>{orderStats.completed}</strong>
                    </Card>
                    <Card variant="borderless" className="order-stat-card">
                      <span>Đã hủy</span>
                      <strong>{orderStats.canceled}</strong>
                    </Card>
                  </div>

                  <Table
                    rowKey="_id"
                    loading={ordersLoading}
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: 960 }}
                    dataSource={orders}
                    columns={[
                      {
                        title: "Mã đơn",
                        dataIndex: "_id",
                        render: (value) => <span className="order-code">{value.slice(-8).toUpperCase()}</span>,
                      },
                      {
                        title: "Ngày đặt",
                        dataIndex: "createdAt",
                        render: (value) => new Date(value).toLocaleString("vi-VN"),
                      },
                      {
                        title: "Tổng tiền",
                        dataIndex: "totalPrice",
                        render: (value) => `${Number(value || 0).toLocaleString()}đ`,
                      },
                      {
                        title: "Thanh toán",
                        render: (_, record) => (
                          <div>
                            <div>{record.payment?.methodLabel}</div>
                            <Tag color={record.payment?.status === "PAID" ? "green" : "gold"}>
                              {record.payment?.statusLabel}
                            </Tag>
                          </div>
                        ),
                      },
                      {
                        title: "Trạng thái",
                        render: (_, record) => (
                          <Space direction="vertical" size={4}>
                            <Tag color={statusColorMap[record.status] || "default"}>
                              {record.statusLabel}
                            </Tag>
                            {record.cancellationRequested ? (
                              <Tag color="red">Đã gửi yêu cầu hủy</Tag>
                            ) : null}
                          </Space>
                        ),
                      },
                      {
                        title: "Hành động",
                        render: (_, record) => (
                          <Space wrap>
                            <Button onClick={() => setSelectedOrder(record)}>Theo dõi</Button>
                            {(record.canCancelDirectly || record.canRequestCancellation) ? (
                              <Popconfirm
                                title={
                                  record.canCancelDirectly
                                    ? "Hủy đơn hàng này?"
                                    : "Gửi yêu cầu hủy đơn cho shop?"
                                }
                                onConfirm={() => handleCancelOrder(record)}
                              >
                                <Button danger>
                                  {record.canCancelDirectly ? "Hủy đơn" : "Yêu cầu hủy"}
                                </Button>
                              </Popconfirm>
                            ) : null}
                          </Space>
                        ),
                      },
                    ]}
                  />
                </>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={!!selectedOrder}
        onCancel={() => setSelectedOrder(null)}
        footer={null}
        width={920}
        title={selectedOrder ? `Theo dõi đơn ${selectedOrder._id.slice(-8).toUpperCase()}` : "Theo dõi đơn hàng"}
      >
        {selectedOrder ? (
          <div className="order-detail-modal">
            <Descriptions
              bordered
              column={1}
              size="small"
              items={[
                {
                  key: "status",
                  label: "Trạng thái hiện tại",
                  children: (
                    <Space wrap>
                      <Tag color={statusColorMap[selectedOrder.status] || "default"}>
                        {selectedOrder.statusLabel}
                      </Tag>
                      {selectedOrder.cancellationRequested ? (
                        <Tag color="red">Đang chờ shop xử lý yêu cầu hủy</Tag>
                      ) : null}
                    </Space>
                  ),
                },
                {
                  key: "payment",
                  label: "Thanh toán",
                  children: `${selectedOrder.payment?.methodLabel} - ${selectedOrder.payment?.statusLabel}`,
                },
                {
                  key: "shipping",
                  label: "Giao hàng",
                  children: `${selectedOrder.shippingAddress?.recipientName} | ${selectedOrder.shippingAddress?.phone} | ${selectedOrder.shippingAddress?.addressLine}, ${selectedOrder.shippingAddress?.ward || ""} ${selectedOrder.shippingAddress?.district || ""}, ${selectedOrder.shippingAddress?.city || ""}`,
                },
                {
                  key: "total",
                  label: "Tổng tiền",
                  children: `${Number(selectedOrder.totalPrice || 0).toLocaleString()}đ`,
                },
              ]}
            />

            <div className="order-detail-block">
              <Title level={4}>Sản phẩm đã mua</Title>
              <div className="order-item-list">
                {selectedOrder.items?.map((item) => (
                  <div key={item._id} className="order-item-row">
                    <div>
                      <strong>{item.productName}</strong>
                      <div className="muted-copy">SKU: {item.productSku || "Chưa có"}</div>
                    </div>
                    <div>
                      {item.quantity} x {Number(item.price || 0).toLocaleString()}đ
                    </div>
                    <strong>{Number(item.totalPrice || 0).toLocaleString()}đ</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-detail-block">
              <Title level={4}>Lịch sử trạng thái</Title>
              <Timeline
                items={(selectedOrder.statusHistory || []).map((entry) => ({
                  color: statusColorMap[entry.status] || "gray",
                  children: (
                    <div>
                      <strong>{statusLabelMap[entry.status] || entry.status}</strong>
                      <div>{entry.note || "Không có ghi chú"}</div>
                      <div className="muted-copy">
                        {new Date(entry.changedAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  ),
                }))}
              />
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={addressModalOpen}
        onCancel={closeAddressModal}
        footer={null}
        title={selectedAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
        destroyOnClose
      >
        <Form layout="vertical" form={addressForm} onFinish={handleAddressSubmit}>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Địa chỉ"
            name="addressLine"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="Phường/Xã" name="ward">
            <Input />
          </Form.Item>
          <Form.Item
            label="Quận/Huyện"
            name="district"
            rules={[{ required: true, message: "Vui lòng nhập quận/huyện" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Tỉnh/Thành phố"
            name="city"
            rules={[{ required: true, message: "Vui lòng nhập tỉnh/thành phố" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Đặt làm mặc định" name="isDefault" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Space>
            <Button onClick={closeAddressModal}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={savingAddress}>
              Lưu địa chỉ
            </Button>
          </Space>
        </Form>
      </Modal>
    </section>
  );
};

export default ProfilePage;
