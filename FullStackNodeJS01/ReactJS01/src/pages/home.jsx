import { useContext, useEffect, useState } from "react";
import { Alert, Button, Card, Empty, Skeleton, Space, Tag, Input, Select } from "antd";
import { Link } from "react-router-dom";
import { AuthContext } from "../components/context/auth.context";
import { getHomepageApi, searchProductsApi, getPublicCategoriesApi } from "../util/api";
import { resolveMediaUrl } from "../util/media";

const fallbackImage =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80";

const getDiscountPercent = (item) => Number(item.discountPercent ?? 0);

const getDiscountedPrice = (item) => {
  if (item.discountedPrice !== undefined && item.discountedPrice !== null) {
    return Number(item.discountedPrice);
  }

  const originalPrice = Number(item.price ?? 0);
  const discountPercent = getDiscountPercent(item);
  return Math.round(originalPrice * (1 - discountPercent / 100));
};

const ProductSection = ({ title, items, promotionMode = false, loading = false }) => {
  return (
    <section className="ecommerce-section">
      <div className="section-header">
        <h2>{title}</h2>
        <Link to="/" className="view-all-link">
          Xem tất cả
        </Link>
      </div>

      {loading ? (
        <div className="ecommerce-grid">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} variant="borderless" className="ecommerce-card">
              <Skeleton.Image active style={{ width: "100%", height: 240 }} />
              <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 16 }} />
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Empty description="Chưa có sản phẩm" />
      ) : (
        <div className="ecommerce-grid">
          {items.map((item) => (
            <ProductCard key={item._id} item={item} promotionMode={promotionMode} />
          ))}
        </div>
      )}
    </section>
  );
};

const ProductCard = ({ item, promotionMode }) => (
  <Link to={`/products/${item._id}`} className="ecommerce-card-link">
    <Card
      variant="borderless"
      className="ecommerce-card"
      styles={{ body: { padding: 16 } }}
    >
      <div className="ecommerce-image-wrapper">
        <img
          className="ecommerce-image"
          src={
            resolveMediaUrl(
              item.images?.find((image) => image.isMain)?.url ||
              item.images?.[0]?.url
            ) || fallbackImage
          }
          alt={item.name}
        />
        {promotionMode && (
          <div className="ecommerce-badge">
            -{getDiscountPercent(item)}%
          </div>
        )}
      </div>

      <div className="ecommerce-meta">
        <h3 className="ecommerce-title">{item.name}</h3>
        <p className="ecommerce-category">
          {item.categoryId?.name || "Danh mục chung"}
        </p>

        <div className="ecommerce-price-row">
          {promotionMode ? (
            <>
              <span className="ecommerce-price discounted">
                {getDiscountedPrice(item).toLocaleString()}đ
              </span>
              <span className="ecommerce-price original">
                {Number(item.price || 0).toLocaleString()}đ
              </span>
            </>
          ) : (
            <span className="ecommerce-price">
              {Number(item.price || 0).toLocaleString()}đ
            </span>
          )}
        </div>

        <div className="ecommerce-footer">
          <span>Đã bán {item.sold ?? 0}</span>
          <span>👁 {item.views ?? 0}</span>
        </div>
      </div>
    </Card>
  </Link>
);

import { useRef } from 'react';

const HorizontalProductList = ({ title, items, promotionMode = false, loading = false }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="ecommerce-section horizontal-scroll-container">
      <div className="section-header">
        <h2>{title}</h2>
        <Link to="/" className="view-all-link">
          Xem tất cả
        </Link>
      </div>

      {loading ? (
        <div className="horizontal-scroll-track" style={{ overflow: 'hidden' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="horizontal-scroll-item">
              <Card variant="borderless" className="ecommerce-card">
                <Skeleton.Image active style={{ width: "100%", height: 240 }} />
                <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 16 }} />
              </Card>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Empty description="Chưa có sản phẩm" />
      ) : (
        <>
          <button className="scroll-btn left" onClick={() => scroll('left')}>
            &#8592;
          </button>
          <div className="horizontal-scroll-track" ref={scrollRef}>
            {items.map((item) => (
              <div key={item._id} className="horizontal-scroll-item">
                <ProductCard item={item} promotionMode={promotionMode} />
              </div>
            ))}
          </div>
          <button className="scroll-btn right" onClick={() => scroll('right')}>
            &#8594;
          </button>
        </>
      )}
    </section>
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
    mostViewed: [],
    promotion: [],
  });

  // Search & Filter State
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

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

      setHomeData(
        response?.data ?? {
          user: null,
          newest: [],
          bestSeller: [],
          mostViewed: [],
          promotion: [],
        }
      );
      setLoading(false);
    };

    fetchHomepage();
  }, [auth.isAuthenticated]);

  // Fetch Categories for Filter
  useEffect(() => {
    if (!auth.isAuthenticated) return;
    const fetchCategories = async () => {
      const res = await getPublicCategoriesApi();
      if (res?.data) {
        setCategories(res.data);
      }
    };
    fetchCategories();
  }, [auth.isAuthenticated]);

  // Handle Search & Filter logic with Debounce
  useEffect(() => {
    if (!auth.isAuthenticated) return;
    if (!searchQuery && selectedCategories.length === 0 && !priceRange) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    let minPrice = undefined;
    let maxPrice = undefined;
    if (priceRange === "under200") { maxPrice = 200000; }
    else if (priceRange === "200to500") { minPrice = 200000; maxPrice = 500000; }
    else if (priceRange === "500to1000") { minPrice = 500000; maxPrice = 1000000; }
    else if (priceRange === "over1000") { minPrice = 1000000; }

    const doSearch = async () => {
      setIsSearching(true);
      setSearchLoading(true);
      const res = await searchProductsApi(searchQuery, selectedCategories, minPrice, maxPrice);
      if (res?.data) {
        setSearchResults(res.data);
      } else {
        setSearchResults([]);
      }
      setSearchLoading(false);
    };

    const timer = setTimeout(() => {
      doSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategories, priceRange, auth.isAuthenticated]);

  if (!auth.isAuthenticated) {
    return (
      <section className="hero-shell">
        <div className="hero-copy">
          <Tag color="gold" className="hero-tag">
            Cửa hàng mỹ phẩm
          </Tag>
          <h1>Chào mừng đến với BeautyShop</h1>
          <p>
            Khám phá các bộ sưu tập mỹ phẩm cao cấp với giá ưu đãi. Đăng nhập ngay để
            trải nghiệm mua sắm tuyệt vời nhất!
          </p>
          <Space size="middle" wrap>
            <Link to="/login">
              <Button type="primary" size="large" className="hero-button">
                Đăng nhập ngay
              </Button>
            </Link>
            <Link to="/register">
              <Button size="large" className="ghost-button hero-button">
                Tạo tài khoản
              </Button>
            </Link>
          </Space>
        </div>

        <div className="hero-panel">
          <div className="ecommerce-image-wrapper">
            <img
              className="ecommerce-image"
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80"
              alt="Mỹ phẩm"
              style={{ borderRadius: 20 }}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-shell" style={{ width: 'min(1200px, 100%)', margin: '0 auto' }}>
      <div className="ecommerce-hero">
        <div className="ecommerce-hero-content">
          <Tag color="gold" style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            Xin chào, {homeData.user?.name || auth.user.name || auth.user.email}
          </Tag>
          <h1>Bộ sưu tập Thu Đông 2026</h1>
          <p>Tỏa sáng rạng ngời với hàng ngàn ưu đãi lên đến 50% cho các sản phẩm mỹ phẩm cao cấp nhất hiện nay.</p>
          <Button type="primary" size="large" style={{ background: '#fff', color: '#bb4d00', border: 'none', fontWeight: 700 }}>
            Mua sắm ngay
          </Button>
        </div>
      </div>

      {error ? <Alert type="error" title={error} showIcon style={{ marginBottom: 24 }} /> : null}

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 36, flexWrap: 'wrap' }}>
        <Input.Search
          placeholder="Tìm kiếm sản phẩm theo tên..."
          allowClear
          size="large"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: '1 1 280px' }}
        />
        <Select
          mode="multiple"
          placeholder="Lọc theo danh mục"
          allowClear
          size="large"
          value={selectedCategories}
          onChange={(val) => setSelectedCategories(val)}
          style={{ flex: '1 1 240px', minWidth: 200 }}
          options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
          maxTagCount="responsive"
        />
        <Select
          placeholder="Khoảng giá"
          allowClear
          size="large"
          value={priceRange}
          onChange={(val) => setPriceRange(val)}
          style={{ width: 200 }}
          options={[
            { value: "under200", label: "Dưới 200.000đ" },
            { value: "200to500", label: "200.000đ - 500.000đ" },
            { value: "500to1000", label: "500.000đ - 1.000.000đ" },
            { value: "over1000", label: "Trên 1.000.000đ" },
          ]}
        />
      </div>

      {isSearching ? (
        <ProductSection
          title="🔍 Kết quả tìm kiếm"
          items={searchResults}
          loading={searchLoading}
        />
      ) : (
        <>
          <HorizontalProductList
            title="🔥 Đang Khuyến Mãi"
            items={homeData.promotion}
            promotionMode
            loading={loading}
          />

          <HorizontalProductList
            title="✨ Sản Phẩm Mới"
            items={homeData.newest}
            loading={loading}
          />

          <HorizontalProductList
            title="👑 Bán Chạy Nhất"
            items={homeData.bestSeller}
            loading={loading}
          />

          <HorizontalProductList
            title="🔥 Xem Nhiều Nhất"
            items={homeData.mostViewed}
            loading={loading}
          />
        </>
      )}
    </section>
  );
};

export default HomePage;
