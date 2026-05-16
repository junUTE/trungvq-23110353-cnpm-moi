import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Carousel,
  Descriptions,
  Empty,
  Skeleton,
  Tag,
  Typography,
  Divider,
} from "antd";
import { ShoppingCartOutlined, CreditCardOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";
import { getProductDetailApi } from "../util/api";
import { resolveMediaUrl } from "../util/media";

const { Title, Paragraph } = Typography;
const fallbackImage =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80";

const CustomPrevArrow = (props) => {
  const { style, onClick } = props;
  return (
    <div
      style={{
        ...style,
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        left: 10,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.5)",
        borderRadius: "50%",
        width: 40,
        height: 40,
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <LeftOutlined style={{ color: "white", fontSize: 18 }} />
    </div>
  );
};

const CustomNextArrow = (props) => {
  const { style, onClick } = props;
  return (
    <div
      style={{
        ...style,
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        right: 10,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.5)",
        borderRadius: "50%",
        width: 40,
        height: 40,
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <RightOutlined style={{ color: "white", fontSize: 18 }} />
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");

      const response = await getProductDetailApi(id);

      if (response?.message && !response?.data) {
        setError(response.message);
        setLoading(false);
        return;
      }

      setProduct(response?.data ?? null);
      setLoading(false);
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <section className="panel-shell">
        <Card className="panel-card detail-card" variant="borderless">
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel-shell">
        <Card className="panel-card detail-card" variant="borderless">
          <Alert type="error" title={error} showIcon />
        </Card>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="panel-shell">
        <Card className="panel-card detail-card" variant="borderless">
          <Empty description="Không tìm thấy sản phẩm" />
        </Card>
      </section>
    );
  }

  const sortedImages = [...(product.images || [])].sort((a, b) => {
    if (a.isMain && !b.isMain) return -1;
    if (!a.isMain && b.isMain) return 1;
    return 0;
  });

  const images = sortedImages.length ? sortedImages : [{ url: fallbackImage }];

  return (
    <section className="panel-shell">
      <Card className="panel-card detail-card" variant="borderless">
        <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Chi tiết sản phẩm</span>
              <Title level={2}>{product.name}</Title>
              <Paragraph>
                Xem đầy đủ thông tin, ảnh, giá và tồn kho của sản phẩm.
              </Paragraph>
            </div>
            <Link to="/">
              <Button className="ghost-button">Quay về trang chủ</Button>
            </Link>
          </div>

          <div className="detail-layout">
            <div className="detail-gallery">
              <Carousel 
                autoplay 
                dots 
                arrows 
                prevArrow={<CustomPrevArrow />} 
                nextArrow={<CustomNextArrow />}
              >
                {images.map((image, index) => (
                  <div key={image._id || index}>
                    <img
                      src={resolveMediaUrl(image.url) || fallbackImage}
                      alt={product.name}
                      className="detail-image"
                    />
                  </div>
                ))}
              </Carousel>
            </div>

            <div className="detail-summary">
              <div className="detail-price-row">
                <Tag color="volcano" className="detail-price-tag">
                  {Number(product.price || 0).toLocaleString()} VND
                </Tag>
                {product.categoryId?.name ? (
                  <Tag color="gold">{product.categoryId.name}</Tag>
                ) : null}
              </div>

              <Paragraph className="detail-description">
                {product.description || "Sản phẩm chưa có mô tả."}
              </Paragraph>

              <Descriptions
                column={1}
                size="small"
                bordered
                items={[
                  {
                    key: "sku",
                    label: "Mã sản phẩm",
                    children: product.sku || "Chưa có",
                  },
                  {
                    key: "stock",
                    label: "Tồn kho",
                    children: product.stock ?? 0,
                  },
                  {
                    key: "sold",
                    label: "Đã bán",
                    children: product.sold ?? 0,
                  },
                ]}
              />

              <Divider style={{ margin: "24px 0" }} />

              <div style={{ display: 'flex', gap: 16 }}>
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<CreditCardOutlined />}
                  style={{ flex: 1, height: 50, borderRadius: 12, fontSize: 16, fontWeight: 600 }}
                >
                  Mua ngay
                </Button>
                <Button 
                  size="large" 
                  icon={<ShoppingCartOutlined />}
                  style={{ flex: 1, height: 50, borderRadius: 12, fontSize: 16, fontWeight: 600, color: '#bb4d00', borderColor: '#bb4d00' }}
                >
                  Thêm vào giỏ hàng
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default ProductDetailPage;
