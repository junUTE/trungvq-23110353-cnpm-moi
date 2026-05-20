import { useContext, useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Empty, Skeleton, Space, Tag, Input, Select } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../components/context/auth.context";
import { CartContext } from "../components/context/cart.context";
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

const findCartItemIdByProductId = (cartData, productId) =>
  cartData?.items?.find((item) => String(item.product?._id) === String(productId))?._id;

const ProductSection = ({
  title,
  items,
  promotionMode = false,
  loading = false,
  onAddToCart,
  onBuyNow,
  sectionId,
}) => {
  return (
    <section className="ecommerce-section" id={sectionId}>
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
            <ProductCard
              key={item._id}
              item={item}
              promotionMode={promotionMode}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const ProductCard = ({ item, promotionMode, onAddToCart, onBuyNow }) => (
  <Card
    variant="borderless"
    className="ecommerce-card"
    styles={{ body: { padding: 16 } }}
  >
    <Link to={`/products/${item._id}`} className="ecommerce-card-link">
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
    </Link>
    <Space direction="vertical" size={10} style={{ width: "100%" }}>
      <Button
        type="primary"
        className="add-cart-button"
        disabled={(item.stock ?? 0) <= 0}
        onClick={() => onBuyNow(item._id)}
      >
        {(item.stock ?? 0) > 0 ? "Mua ngay" : "Hết hàng"}
      </Button>
      <Button
        icon={<ShoppingCartOutlined />}
        className="add-cart-button"
        disabled={(item.stock ?? 0) <= 0}
        onClick={() => onAddToCart(item._id)}
      >
        {(item.stock ?? 0) > 0 ? "Thêm vào giỏ" : "Hết hàng"}
      </Button>
    </Space>
  </Card>
);
const HorizontalProductList = ({
  title,
  items,
  promotionMode = false,
  loading = false,
  onAddToCart,
  onBuyNow,
  sectionId,
}) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="ecommerce-section horizontal-scroll-container" id={sectionId}>
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
                <ProductCard
                  item={item}
                  promotionMode={promotionMode}
                  onAddToCart={onAddToCart}
                  onBuyNow={onBuyNow}
                />
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
  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { addToCart, buyNow } = useContext(CartContext);
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

  const handleAddToCart = async (productId) => {
    await addToCart(productId, 1);
  };

  const handleBuyNow = async (productId) => {
    const cartData = await buyNow(productId, 1);
    const itemId = findCartItemIdByProductId(cartData, productId);

    if (!itemId) {
      return;
    }

    sessionStorage.setItem("selected_cart_item_ids", JSON.stringify([itemId]));
    navigate("/checkout");
  };

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const sectionId = location.hash.replace("#", "");
    const timer = window.setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);

    return () => window.clearTimeout(timer);
  }, [location.hash, loading, isSearching]);

  useEffect(() => {
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
  }, []);

  // Fetch Categories for Filter
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await getPublicCategoriesApi();
      if (res?.data) {
        setCategories(res.data);
      }
    };
    fetchCategories();
  }, []);

  // Handle Search & Filter logic with Debounce
  useEffect(() => {
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
  }, [searchQuery, selectedCategories, priceRange]);

  return (
    <section className="dashboard-shell" style={{ width: 'min(1200px, 100%)', margin: '0 auto' }}>
      <div className="ecommerce-hero">
        <div className="ecommerce-hero-content">
          <Tag color="gold" style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            {auth.isAuthenticated
              ? `Xin chào, ${homeData.user?.name || auth.user.name || auth.user.email}`
              : "Cửa hàng mỹ phẩm"}
          </Tag>
          <h1>Bộ sưu tập Thu Đông 2026</h1>
          <p>
            Tỏa sáng rạng ngời với hàng ngàn ưu đãi lên đến 50% cho các sản phẩm mỹ phẩm cao cấp nhất hiện nay.
            {!auth.isAuthenticated ? " Bạn có thể xem sản phẩm ngay, đăng nhập khi muốn mua hàng." : ""}
          </p>
          {auth.isAuthenticated ? (
            <Button type="primary" size="large" style={{ background: '#fff', color: '#bb4d00', border: 'none', fontWeight: 700 }}>
              Mua sắm ngay
            </Button>
          ) : (
            <Space size="middle" wrap>
              <Link to="/login">
                <Button type="primary" size="large" style={{ background: '#fff', color: '#bb4d00', border: 'none', fontWeight: 700 }}>
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button size="large" className="ghost-button hero-button">
                  Tạo tài khoản
                </Button>
              </Link>
            </Space>
          )}
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
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          sectionId="search-results"
        />
      ) : (
        <>
          <HorizontalProductList
            title="🔥 Đang Khuyến Mãi"
            items={homeData.promotion}
            promotionMode
            loading={loading}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            sectionId="promotion"
          />

          <HorizontalProductList
            title="✨ Sản Phẩm Mới"
            items={homeData.newest}
            loading={loading}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            sectionId="newest"
          />

          <HorizontalProductList
            title="👑 Bán Chạy Nhất"
            items={homeData.bestSeller}
            loading={loading}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            sectionId="best-seller"
          />

          <HorizontalProductList
            title="🔥 Xem Nhiều Nhất"
            items={homeData.mostViewed}
            loading={loading}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            sectionId="most-viewed"
          />
        </>
      )}
    </section>
  );
};

export default HomePage;
