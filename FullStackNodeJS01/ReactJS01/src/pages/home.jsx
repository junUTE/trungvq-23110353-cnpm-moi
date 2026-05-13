import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
} from "antd";
import { Link } from "react-router-dom";
import { AuthContext } from "../components/context/auth.context";
import { getHomepageApi } from "../util/api";

const fallbackImage =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80";

const ProductColumn = ({ title, items }) => {
  return (
    <Col xs={24} lg={8}>
      <Card className="product-panel" title={title} bordered={false}>
        {items.length === 0 ? (
          <Empty description="Chưa có dữ liệu" />
        ) : (
          <div className="product-list">
            {items.map((item) => (
              <article key={item._id} className="product-card">
                <img
                  className="product-image"
                  src={item.images?.find((image) => image.isMain)?.url || item.images?.[0]?.url || fallbackImage}
                  alt={item.name}
                />
                <div className="product-meta">
                  <div className="product-headline">
                    <h3>{item.name}</h3>
                    <Tag color="volcano">{Number(item.price || 0).toLocaleString()} VND</Tag>
                  </div>
                  <p>{item.description || "San pham chua co mo ta."}</p>
                  <div className="product-footer">
                    <span>Da ban: {item.sold ?? 0}</span>
                    {item.categoryId?.name ? <span>{item.categoryId.name}</span> : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </Col>
  );
};

const HomePage = () => {
  const { auth } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [homeData, setHomeData] = useState({
    user: null,
    newest: [],
    bestSeller: [],
    promotion: [],
  });

  useEffect(() => {
    if (!auth.isAuthenticated) {
      return;
    }

    const fetchHomepage = async () => {
      setLoading(true);
      setError("");

      const response = await getHomepageApi();

      if (response?.message && response?.data === undefined) {
        setError(response.message);
        setLoading(false);
        return;
      }

      setHomeData(response?.data ?? {
        user: null,
        newest: [],
        bestSeller: [],
        promotion: [],
      });
      setLoading(false);
    };

    fetchHomepage();
  }, [auth.isAuthenticated]);

  if (!auth.isAuthenticated) {
    return (
      <section className="hero-shell">
        <div className="hero-copy">
          <Tag color="gold" className="hero-tag">
            ReactJS01 x ExpressJS01
          </Tag>
          <h1>Mot giao dien ban hang gon gang, ket noi truc tiep voi backend cua ban.</h1>
          <p>
            Dang nhap de xem homepage du lieu dong, danh sach users va thong tin
            tai khoan. Toan bo luong nay da duoc noi theo API thuc te hien co.
          </p>
          <Space size="middle" wrap>
            <Link to="/login">
              <Button type="primary" size="large" className="hero-button">
                Dang nhap ngay
              </Button>
            </Link>
            <Link to="/register">
              <Button size="large" className="ghost-button hero-button">
                Tao tai khoan
              </Button>
            </Link>
          </Space>
        </div>

        <div className="hero-panel">
          <div className="hero-grid">
            <Card bordered={false} className="stat-card warm">
              <Statistic title="Auth Ready" value="JWT" />
            </Card>
            <Card bordered={false} className="stat-card sand">
              <Statistic title="API Prefix" value="/v1/api" />
            </Card>
            <Card bordered={false} className="stat-card mint">
              <Statistic title="Core Views" value={4} />
            </Card>
            <Card bordered={false} className="stat-card clay">
              <Statistic title="Connected" value="Yes" />
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-shell">
      <div className="dashboard-intro">
        <div>
          <Tag color="gold" className="hero-tag">
            Xin chao {homeData.user?.name || auth.user.name || auth.user.email}
          </Tag>
          <h1>Trang chu da ket noi du lieu backend</h1>
          <p>
            Day la homepage dong lay tu `/v1/api/home`, gom thong tin nguoi dung,
            san pham moi, best seller va danh sach khuyen mai.
          </p>
        </div>
        <Link to="/users">
          <Button type="primary" className="hero-button">
            Xem danh sach users
          </Button>
        </Link>
      </div>

      {error ? <Alert type="error" message={error} showIcon /> : null}

      <Row gutter={[18, 18]} className="overview-row">
        <Col xs={24} md={8}>
          <Card bordered={false} className="overview-card">
            <Statistic title="Newest Products" value={homeData.newest.length} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="overview-card">
            <Statistic title="Best Sellers" value={homeData.bestSeller.length} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="overview-card">
            <Statistic title="Promotions" value={homeData.promotion.length} />
          </Card>
        </Col>
      </Row>

      {loading ? (
        <Card bordered={false} className="skeleton-card">
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      ) : (
        <Row gutter={[18, 18]}>
          <ProductColumn title="San pham moi" items={homeData.newest} />
          <ProductColumn title="Ban chay nhat" items={homeData.bestSeller} />
          <ProductColumn title="Dang khuyen mai" items={homeData.promotion} />
        </Row>
      )}
    </section>
  );
};

export default HomePage;
