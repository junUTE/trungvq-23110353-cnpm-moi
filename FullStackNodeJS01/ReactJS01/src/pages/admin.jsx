import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  Upload,
  notification,
} from "antd";
import { PlusOutlined, StarOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  createCategoryApi,
  createPromotionApi,
  createProductApi,
  deleteCategoryApi,
  deletePromotionApi,
  deleteProductApi,
  deleteUserApi,
  getCategoriesApi,
  getPromotionsApi,
  getProductsApi,
  getUsersApi,
  updateCategoryApi,
  updatePromotionApi,
  updateProductApi,
  updateUserApi,
  deleteProductImageApi,
  setProductMainImageApi,
} from "../util/api";
import { resolveMediaUrl } from "../util/media";
import dayjs from "dayjs";

const { Title, Paragraph } = Typography;
const fallbackImage =
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80";

const AdminPage = () => {
  const [categoryForm] = Form.useForm();
  const [productForm] = Form.useForm();
  const [promotionForm] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingPromotion, setSavingPromotion] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [userForm] = Form.useForm();

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category._id,
        label: category.name,
      })),
    [categories],
  );

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: product._id,
        label: product.name,
      })),
    [products],
  );

  const hydrateData = async () => {
    setLoading(true);
    setError("");

    const [categoryResponse, productResponse, promotionResponse, userResponse] = await Promise.all([
      getCategoriesApi(),
      getProductsApi(),
      getPromotionsApi(),
      getUsersApi(),
    ]);

    if (categoryResponse?.message && !categoryResponse?.data) {
      setError(categoryResponse.message);
      setLoading(false);
      return;
    }

    if (productResponse?.message && !productResponse?.data) {
      setError(productResponse.message);
      setLoading(false);
      return;
    }

    if (promotionResponse?.message && !promotionResponse?.data) {
      setError(promotionResponse.message);
      setLoading(false);
      return;
    }

    if (userResponse?.message) {
      setError(userResponse.message);
      setLoading(false);
      return;
    }

    setCategories(
      Array.isArray(categoryResponse?.data) ? categoryResponse.data : [],
    );
    setProducts(
      Array.isArray(productResponse?.data) ? productResponse.data : [],
    );
    setPromotions(
      Array.isArray(promotionResponse?.data) ? promotionResponse.data : [],
    );
    setUsers(Array.isArray(userResponse) ? userResponse : []);
    setLoading(false);
  };

  useEffect(() => {
    hydrateData();
  }, []);

  const resetCategoryForm = () => {
    setSelectedCategory(null);
    categoryForm.resetFields();
  };

  const resetProductForm = () => {
    setSelectedProduct(null);
    setUploadFiles([]);
    productForm.resetFields();
  };

  const resetPromotionForm = () => {
    setSelectedPromotion(null);
    promotionForm.resetFields();
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(false);
    userForm.resetFields();
  };

  const handleCategorySubmit = async (values) => {
    setSavingCategory(true);

    const response = selectedCategory
      ? await updateCategoryApi(selectedCategory._id, values)
      : await createCategoryApi(values);

    if (response?.message && !response?.data && !selectedCategory) {
      notification.error({
        message: "Không thể lưu Danh mục",
        description: response.message,
      });
      setSavingCategory(false);
      return;
    }

    if (response?.message && !response?.data && selectedCategory) {
      notification.error({
        message: "Không thể cập nhật Danh mục",
        description: response.message,
      });
      setSavingCategory(false);
      return;
    }

    notification.success({
      message: selectedCategory ? "Đã cập nhật Danh mục" : "Đã tạo Danh mục",
    });
    resetCategoryForm();
    await hydrateData();
    setSavingCategory(false);
  };

  const handleProductSubmit = async (values) => {
    setSavingProduct(true);

    const payload = {
      ...values,
      images: uploadFiles.map((file) => file.originFileObj).filter(Boolean),
    };

    const response = selectedProduct
      ? await updateProductApi(selectedProduct._id, payload)
      : await createProductApi(payload);

    if (response?.message && !response?.data && !selectedProduct) {
      notification.error({
        message: "Không thể lưu Sản phẩm",
        description: response.message,
      });
      setSavingProduct(false);
      return;
    }

    if (response?.message && !response?.data && selectedProduct) {
      notification.error({
        message: "Không thể cập nhật sản phẩm.",
        description: response.message,
      });
      setSavingProduct(false);
      return;
    }

    notification.success({
      message: selectedProduct ? "Đã cập nhật Sản phẩm" : "Đã tạo Sản phẩm",
    });
    resetProductForm();
    await hydrateData();
    setSavingProduct(false);
  };

  const handlePromotionSubmit = async (values) => {
    setSavingPromotion(true);

    const payload = {
      title: values.title,
      discountPercent: values.discountPercent,
      startDate: values.period?.[0]?.toISOString(),
      endDate: values.period?.[1]?.toISOString(),
      productIds: values.productIds ?? [],
    };

    const response = selectedPromotion
      ? await updatePromotionApi(selectedPromotion._id, payload)
      : await createPromotionApi(payload);

    if (response?.message && !response?.data) {
      notification.error({
        message: selectedPromotion
          ? "Không thể cập nhật khuyến mãi"
          : "Không thể tạo khuyến mãi",
        description: response.message,
      });
      setSavingPromotion(false);
      return;
    }

    notification.success({
      message: selectedPromotion ? "Đã cập nhật khuyến mãi" : "Đã tạo khuyến mãi",
    });
    resetPromotionForm();
    await hydrateData();
    setSavingPromotion(false);
  };

  const handleDeleteCategory = async (id) => {
    const response = await deleteCategoryApi(id);

    if (response?.message && !response.message.includes("deleted successfully")) {
      notification.error({
        message: "Không thể xóa Danh mục",
        description: response?.message || "Đã có lỗi xảy ra.",
      });
      return;
    }

    notification.success({
      message: "Đã xóa Danh mục",
    });
    if (selectedCategory?._id === id) {
      resetCategoryForm();
    }
    await hydrateData();
  };

  const handleDeleteProduct = async (id) => {
    const response = await deleteProductApi(id);

    if (response?.message && !response.message.includes("deleted successfully")) {
      notification.error({
        message: "Không thể xóa Sản phẩm",
        description: response?.message || "Đã có lỗi xảy ra",
      });
      return;
    }

    notification.success({
      message: "Đã xóa Sản phẩm",
    });
    if (selectedProduct?._id === id) {
      resetProductForm();
    }
    await hydrateData();
  };

  const handleDeletePromotion = async (id) => {
    const response = await deletePromotionApi(id);

    if (response?.message && !response.message.includes("deleted successfully")) {
      notification.error({
        message: "Không thể xóa khuyến mãi",
        description: response?.message || "Đã có lỗi xảy ra",
      });
      return;
    }

    notification.success({
      message: "Đã xóa khuyến mãi",
    });
    if (selectedPromotion?._id === id) {
      resetPromotionForm();
    }
    await hydrateData();
  };

  const handleUserSubmit = async (values) => {
    if (!selectedUser) return;

    setSavingUser(true);
    const response = await updateUserApi(selectedUser._id, values);

    if (response?.message && !response?.data) {
      notification.error({
        message: "Không thể cập nhật người dùng",
        description: response.message,
      });
      setSavingUser(false);
      return;
    }

    notification.success({
      message: "Đã cập nhật người dùng",
    });
    closeUserModal();
    await hydrateData();
    setSavingUser(false);
  };

  const handleDeleteUser = async (id) => {
    const response = await deleteUserApi(id);

    if (response?.message && !response.message.includes("deleted successfully")) {
      notification.error({
        message: "Không thể xóa người dùng",
        description: response?.message || "Đã có lỗi xảy ra",
      });
      return;
    }

    notification.success({
      message: "Đã xóa người dùng",
    });
    await hydrateData();
  };

  const handleDeleteImage = async (productId, imageId) => {
    const response = await deleteProductImageApi(imageId);
    if (response?.message && !response?.message.includes("successfully")) {
      notification.error({ message: "Lỗi", description: response.message });
      return;
    }
    notification.success({ message: "Đã xóa ảnh" });
    await hydrateData();
    setSelectedProduct(prev => {
      if (!prev || prev._id !== productId) return prev;
      return { ...prev, images: prev.images.filter(img => img._id !== imageId) };
    });
  };

  const handleSetMainImage = async (productId, imageId) => {
    const response = await setProductMainImageApi(productId, imageId);
    if (response?.message && !response?.message.includes("successfully")) {
      notification.error({ message: "Lỗi", description: response.message });
      return;
    }
    notification.success({ message: "Đã đặt làm thumbnail" });
    await hydrateData();
    setSelectedProduct(prev => {
      if (!prev || prev._id !== productId) return prev;
      return { 
        ...prev, 
        images: prev.images.map(img => ({ ...img, isMain: img._id === imageId })) 
      };
    });
  };

  const startEditCategory = (record) => {
    setSelectedCategory(record);
    categoryForm.setFieldsValue({
      name: record.name,
      description: record.description,
    });
  };

  const startEditProduct = (record) => {
    setSelectedProduct(record);
    setUploadFiles([]);
    productForm.setFieldsValue({
      name: record.name,
      sku: record.sku,
      price: record.price,
      stock: record.stock,
      description: record.description,
      categoryId: record.categoryId?._id || record.categoryId || undefined,
    });
  };

  const startEditPromotion = (record) => {
    setSelectedPromotion(record);
    promotionForm.setFieldsValue({
      title: record.title,
      discountPercent: record.discountPercent,
      period:
        record.startDate && record.endDate
          ? [dayjs(record.startDate), dayjs(record.endDate)]
          : undefined,
      productIds: record.productIds ?? [],
    });
  };

  const startEditUser = (record) => {
    setSelectedUser(record);
    setUserModalOpen(true);
    userForm.setFieldsValue({
      name: record.name,
      email: record.email,
      role: record.role,
    });
  };

  return (
    <section className="dashboard-shell">
      <div className="dashboard-intro">
        <div>
          <Tag color="gold" className="hero-tag">
            Admin control center
          </Tag>
          <h1>Quản lý Danh mục và Sản phẩm</h1>
        </div>
      </div>

      {error ? (
        <Alert
          type="error"
          showIcon
          title={error}
          style={{ marginBottom: 20 }}
        />
      ) : null}

      <Tabs
        defaultActiveKey="categories"
        items={[
          {
            key: "categories",
            label: `Danh mục (${categories.length})`,
            children: (
              <Row gutter={[18, 18]}>
                <Col xs={24} xl={9}>
                  <Card className="panel-card admin-card" variant="borderless">
                    <div className="panel-heading">
                      <div>
                        <Title level={3}>
                          {selectedCategory
                            ? "Cập nhật Danh mục"
                            : "Tạo Danh mục mới"}
                        </Title>
                      </div>
                    </div>

                    <Form
                      layout="vertical"
                      form={categoryForm}
                      onFinish={handleCategorySubmit}
                    >
                      <Form.Item
                        label="Tên Danh mục"
                        name="name"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập tên Danh mục.",
                          },
                        ]}
                      >
                        <Input size="large" placeholder="Ví dụ: Son" />
                      </Form.Item>

                      <Form.Item label="Mô tả" name="description">
                        <Input.TextArea
                          rows={4}
                          placeholder="Mô tả ngắn cho Danh mục"
                        />
                      </Form.Item>

                      <Space wrap>
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="hero-button"
                          loading={savingCategory}
                        >
                          {selectedCategory ? "Lưu thay đổi" : "Tạo Danh mục"}
                        </Button>
                        <Button onClick={resetCategoryForm}>Làm mới</Button>
                      </Space>
                    </Form>
                  </Card>
                </Col>

                <Col xs={24} xl={15}>
                  <Card className="panel-card admin-card" variant="borderless">
                    <div className="panel-heading">
                      <div>
                        <Title level={3}>Danh sách Danh mục</Title>
                      </div>
                    </div>

                    {categories.length === 0 && !loading ? (
                      <Empty description="Chưa có Danh mục nào!" />
                    ) : (
                      <Table
                        rowKey="_id"
                        loading={loading}
                        pagination={{ pageSize: 5 }}
                        columns={[
                          {
                            title: "Tên",
                            dataIndex: "name",
                          },
                          {
                            title: "Mô tả",
                            dataIndex: "description",
                            render: (value) => value || "Chưa có mô tả",
                          },
                          {
                            title: "Hành động",
                            key: "action",
                            render: (_, record) => (
                              <Space wrap>
                                <Button
                                  onClick={() => startEditCategory(record)}
                                >
                                  Sửa
                                </Button>
                                <Popconfirm
                                  title="Xóa Danh mục này?"
                                  description="Nếu danh mục đang được sản phẩm sử dụng, hệ thống sẽ từ chối."
                                  onConfirm={() =>
                                    handleDeleteCategory(record._id)
                                  }
                                >
                                  <Button danger>Xóa</Button>
                                </Popconfirm>
                              </Space>
                            ),
                          },
                        ]}
                        dataSource={categories}
                      />
                    )}
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: "products",
            label: `Sản phẩm (${products.length})`,
            children: (
              <Row gutter={[18, 18]}>
                <Col xs={24} xl={10}>
                  <Card className="panel-card admin-card" variant="borderless">
                    <div className="panel-heading">
                      <div>
                        <Title level={3}>
                          {selectedProduct
                            ? "Cập nhật sản phẩm"
                            : "Tạo sản phẩm mới"}
                        </Title>
                      </div>
                    </div>

                    <Form
                      layout="vertical"
                      form={productForm}
                      onFinish={handleProductSubmit}
                    >
                      <Form.Item
                        label="Tên sản phẩm"
                        name="name"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập tên Sản phẩm.",
                          },
                        ]}
                      >
                        <Input size="large" placeholder="Nhập tên sản phẩm" />
                      </Form.Item>

                      <Form.Item label="Mã sản phẩm" name="sku">
                        <Input size="large" placeholder="Ví dụ: SON-001" />
                      </Form.Item>

                      <Form.Item
                        label="Giá"
                        name="price"
                        rules={[
                          { required: true, message: "Vui lòng nhập giá." },
                        ]}
                      >
                        <InputNumber
                          size="large"
                          min={0}
                          style={{ width: "100%" }}
                          placeholder="Nhập giá sản phẩm."
                        />
                      </Form.Item>

                      <Form.Item
                        label="Số lượng tồn"
                        name="stock"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số lượng tồn.",
                          },
                        ]}
                      >
                        <InputNumber
                          size="large"
                          min={0}
                          style={{ width: "100%" }}
                          placeholder="Nhập số lượng tồn kho"
                        />
                      </Form.Item>

                      <Form.Item
                        label="Danh mục"
                        name="categoryId"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn Danh mục.",
                          },
                        ]}
                      >
                        <Select
                          size="large"
                          placeholder="Chọn Danh mục."
                          options={categoryOptions}
                        />
                      </Form.Item>

                      <Form.Item label="Mô tả" name="description">
                        <Input.TextArea rows={4} placeholder="Mô tả sản phẩm" />
                      </Form.Item>

                      <Form.Item label="Ảnh Sản phẩm">
                        <Upload
                          listType="picture-card"
                          multiple
                          beforeUpload={() => false}
                          fileList={uploadFiles}
                          onChange={({ fileList }) =>
                            setUploadFiles(fileList.slice(0, 6))
                          }
                        >
                          {uploadFiles.length >= 6 ? null : (
                            <button type="button" className="upload-trigger">
                              <PlusOutlined />
                              <span>Chọn ảnh</span>
                            </button>
                          )}
                        </Upload>
                      </Form.Item>

                      {selectedProduct?.images?.length ? (
                        <div className="existing-media">
                          {selectedProduct.images.map((image) => (
                            <div key={image._id} className="existing-media-item" style={{ position: 'relative', display: 'inline-block', margin: '0 12px 12px 0' }}>
                              <img
                                src={resolveMediaUrl(image.url)}
                                alt={selectedProduct.name}
                                className="existing-media-thumb"
                                style={{ 
                                  width: 120, 
                                  height: 120, 
                                  objectFit: 'cover', 
                                  borderRadius: 8,
                                  border: image.isMain ? '3px solid #ba2d0b' : '1px solid #d9d9d9' 
                                }}
                              />
                              {image.isMain && (
                                <Tag color="volcano" style={{ position: 'absolute', top: 8, left: 8 }}>Thumbnail</Tag>
                              )}
                              <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: '6px' }}>
                                <Button 
                                  size="small" 
                                  icon={<StarOutlined />} 
                                  onClick={() => handleSetMainImage(selectedProduct._id, image._id)} 
                                  title="Đặt làm Thumbnail"
                                />
                                <Popconfirm title="Xóa ảnh này?" onConfirm={() => handleDeleteImage(selectedProduct._id, image._id)}>
                                  <Button size="small" danger icon={<DeleteOutlined />} title="Xóa ảnh" />
                                </Popconfirm>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <Space wrap>
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="hero-button"
                          loading={savingProduct}
                        >
                          {selectedProduct ? "Lưu thay đổi" : "Tạo sản phẩm"}
                        </Button>
                        <Button onClick={resetProductForm}>Làm mới</Button>
                      </Space>
                    </Form>
                  </Card>
                </Col>

                <Col xs={24} xl={14}>
                  <Card className="panel-card admin-card" variant="borderless">
                    <div className="panel-heading">
                      <div>
                        <Title level={3}>Danh sách Sản phẩm</Title>
                      </div>
                    </div>

                    {products.length === 0 && !loading ? (
                      <Empty description="Chưa có Sản phẩm?" />
                    ) : (
                      <Table
                        rowKey="_id"
                        loading={loading}
                        pagination={{ pageSize: 5 }}
                        scroll={{ x: 900 }}
                        columns={[
                          {
                            title: "Sản phẩm",
                            key: "product",
                            render: (_, record) => (
                              <div className="admin-product-cell">
                                <img
                                  src={
                                    resolveMediaUrl(
                                      record.images?.find((image) => image.isMain)
                                        ?.url || record.images?.[0]?.url,
                                    ) ||
                                    fallbackImage
                                  }
                                  alt={record.name}
                                  className="admin-thumb"
                                />
                                <div>
                                  <strong>{record.name}</strong>
                                  <div className="muted-copy">
                                    {record.description || "Chưa có mô tả"}
                                  </div>
                                </div>
                              </div>
                            ),
                          },
                          {
                            title: "Giá",
                            dataIndex: "price",
                            render: (value) =>
                              `${Number(value || 0).toLocaleString()} VND`,
                          },
                          {
                            title: "SKU",
                            dataIndex: "sku",
                            render: (value) => value || "Chưa có",
                          },
                          {
                            title: "Danh mục",
                            render: (_, record) =>
                              record.categoryId?.name || "Chưa gắn",
                          },
                          {
                            title: "Tồn kho",
                            dataIndex: "stock",
                          },
                          {
                            title: "Đã bán",
                            dataIndex: "sold",
                          },
                          {
                            title: "Hành động",
                            key: "action",
                            render: (_, record) => (
                              <Space wrap>
                                <Button
                                  onClick={() => startEditProduct(record)}
                                >
                                  Sửa
                                </Button>
                                <Popconfirm
                                  title="Xóa Sản phầm này?"
                                  onConfirm={() =>
                                    handleDeleteProduct(record._id)
                                  }
                                >
                                  <Button danger>Xóa</Button>
                                </Popconfirm>
                              </Space>
                            ),
                          },
                        ]}
                        dataSource={products}
                      />
                    )}
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: "promotions",
            label: `Khuyến mãi (${promotions.length})`,
            children: (
              <Row gutter={[18, 18]}>
                <Col xs={24} xl={10}>
                  <Card className="panel-card admin-card" variant="borderless">
                    <div className="panel-heading">
                      <div>
                        <Title level={3}>
                          {selectedPromotion
                            ? "Cập nhật khuyến mãi"
                            : "Tạo khuyến mãi mới"}
                        </Title>
                      </div>
                    </div>

                    <Form
                      layout="vertical"
                      form={promotionForm}
                      onFinish={handlePromotionSubmit}
                    >
                      <Form.Item
                        label="Tiêu đề"
                        name="title"
                        rules={[{ required: true, message: "Vui lòng nhập tiêu đề." }]}
                      >
                        <Input size="large" placeholder="Ví dụ: Flash Sale cuối tuần" />
                      </Form.Item>

                      <Form.Item
                        label="Phần trăm giảm giá"
                        name="discountPercent"
                        rules={[{ required: true, message: "Vui lòng nhập mức giảm." }]}
                      >
                        <InputNumber
                          size="large"
                          min={0}
                          max={100}
                          style={{ width: "100%" }}
                          placeholder="Nhập % giảm giá"
                        />
                      </Form.Item>

                      <Form.Item
                        label="Thời gian áp dụng"
                        name="period"
                        rules={[{ required: true, message: "Vui lòng chọn thời gian áp dụng." }]}
                      >
                        <DatePicker.RangePicker
                          showTime
                          style={{ width: "100%" }}
                          format="DD/MM/YYYY HH:mm"
                        />
                      </Form.Item>

                      <Form.Item label="Sản phẩm áp dụng" name="productIds">
                        <Select
                          mode="multiple"
                          size="large"
                          placeholder="Chọn sản phẩm áp dụng khuyến mãi"
                          options={productOptions}
                        />
                      </Form.Item>

                      <Space wrap>
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="hero-button"
                          loading={savingPromotion}
                        >
                          {selectedPromotion ? "Lưu thay đổi" : "Tạo khuyến mãi"}
                        </Button>
                        <Button onClick={resetPromotionForm}>Làm mới</Button>
                      </Space>
                    </Form>
                  </Card>
                </Col>

                <Col xs={24} xl={14}>
                  <Card className="panel-card admin-card" variant="borderless">
                    <div className="panel-heading">
                      <div>
                        <Title level={3}>Danh sách khuyến mãi</Title>
                      </div>
                    </div>

                    {promotions.length === 0 && !loading ? (
                      <Empty description="Chưa có khuyến mãi nào!" />
                    ) : (
                      <Table
                        rowKey="_id"
                        loading={loading}
                        pagination={{ pageSize: 5 }}
                        scroll={{ x: 960 }}
                        columns={[
                          {
                            title: "Tiêu đề",
                            dataIndex: "title",
                          },
                          {
                            title: "Giảm giá",
                            dataIndex: "discountPercent",
                            render: (value) => `${value ?? 0}%`,
                          },
                          {
                            title: "Thời gian",
                            render: (_, record) =>
                              `${dayjs(record.startDate).format("DD/MM/YYYY HH:mm")} - ${dayjs(record.endDate).format("DD/MM/YYYY HH:mm")}`,
                          },
                          {
                            title: "Sản phẩm áp dụng",
                            render: (_, record) =>
                              record.products?.length
                                ? record.products.map((product) => product.name).join(", ")
                                : "Chưa có",
                          },
                          {
                            title: "Hành động",
                            key: "action",
                            render: (_, record) => (
                              <Space wrap>
                                <Button onClick={() => startEditPromotion(record)}>
                                  Sửa
                                </Button>
                                <Popconfirm
                                  title="Xóa khuyến mãi này?"
                                  onConfirm={() => handleDeletePromotion(record._id)}
                                >
                                  <Button danger>Xóa</Button>
                                </Popconfirm>
                              </Space>
                            ),
                          },
                        ]}
                        dataSource={promotions}
                      />
                    )}
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: "users",
            label: `Người dùng (${users.length})`,
            children: (
              <Card className="panel-card admin-card" variant="borderless">
                <div className="panel-heading">
                  <div>
                    <Title level={3}>Danh sách người dùng</Title>
                    <Paragraph>
                      Tab này chỉ hiển thị trong khu vực quản trị dành cho admin.
                    </Paragraph>
                  </div>
                </div>

                {users.length === 0 && !loading ? (
                  <Empty description="Chưa có User nào!" />
                ) : (
                  <Table
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 6 }}
                    scroll={{ x: 720 }}
                    columns={[
                      {
                        title: "ID",
                        dataIndex: "_id",
                      },
                      {
                        title: "Tên",
                        dataIndex: "name",
                      },
                      {
                        title: "Email",
                        dataIndex: "email",
                      },
                      {
                        title: "Role",
                        dataIndex: "role",
                      },
                      {
                        title: "Hành động",
                        key: "action",
                        render: (_, record) => (
                          <Space wrap>
                            <Button onClick={() => startEditUser(record)}>
                              Sửa
                            </Button>
                            <Popconfirm
                              title="Xóa người dùng này?"
                              onConfirm={() => handleDeleteUser(record._id)}
                            >
                              <Button danger>Xóa</Button>
                            </Popconfirm>
                          </Space>
                        ),
                      },
                    ]}
                    dataSource={users}
                  />
                )}
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title="Cập nhật người dùng"
        open={userModalOpen}
        onCancel={closeUserModal}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={userForm} onFinish={handleUserSubmit}>
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên người dùng." }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email." },
              { type: "email", message: "Email không hợp lệ." },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn role." }]}
          >
            <Select
              options={[
                { value: "admin", label: "admin" },
                { value: "user", label: "user" },
              ]}
            />
          </Form.Item>

          <Space>
            <Button onClick={closeUserModal}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={savingUser}>
              Lưu thay đổi
            </Button>
          </Space>
        </Form>
      </Modal>
    </section>
  );
};

export default AdminPage;
