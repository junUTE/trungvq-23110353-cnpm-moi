import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Card, Empty, Skeleton } from "antd";
import { Link } from "react-router-dom";
import { getCategoryProductsApi } from "../util/api";
import { resolveMediaUrl } from "../util/media";

const fallbackImage =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80";

const CategoryPage = () => {
  const { id: categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const loadMoreProducts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await getCategoryProductsApi(categoryId, page, 12);
      if (res?.data) {
        const newProducts = res.data.products;
        setProducts((prev) => [...prev, ...newProducts]);
        setHasMore(page < res.data.totalPages);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to fetch category products:", error);
    } finally {
      setLoading(false);
    }
  }, [categoryId, page, loading, hasMore]);

  useEffect(() => {
    // Reset state when category changes
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [categoryId]);

  useEffect(() => {
    if (page === 1 && hasMore && !loading) {
      loadMoreProducts();
    }
  }, [page, hasMore, loading, loadMoreProducts]);

  const lastProductElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreProducts();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMoreProducts]
  );

  return (
    <div className="dashboard-shell" style={{ width: 'min(1200px, 100%)', margin: '0 auto', paddingTop: '40px' }}>
      <div className="section-header">
        <h2>Sản phẩm theo danh mục</h2>
      </div>

      {products.length === 0 && !loading ? (
        <Empty description="Không có sản phẩm nào trong danh mục này" />
      ) : (
        <div className="ecommerce-grid">
          {products.map((item, index) => {
            const isLastElement = products.length === index + 1;
            return (
              <div
                key={item._id}
                ref={isLastElement ? lastProductElementRef : null}
              >
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
                    </div>
                    <div className="ecommerce-meta">
                      <h3 className="ecommerce-title">{item.name}</h3>
                      <div className="ecommerce-price-row">
                        <span className="ecommerce-price">
                          {Number(item.price || 0).toLocaleString()}đ
                        </span>
                      </div>
                      <div className="ecommerce-footer">
                        <span>Đã bán {item.sold ?? 0}</span>
                        <span>👁 {item.views ?? 0}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="ecommerce-grid" style={{ marginTop: '24px' }}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} variant="borderless" className="ecommerce-card">
              <Skeleton.Image active style={{ width: "100%", height: 240 }} />
              <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 16 }} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
