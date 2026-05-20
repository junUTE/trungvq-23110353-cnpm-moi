import { Avatar, Badge, Dropdown, Layout, Space } from "antd";
import { ShoppingCartOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";
import { CartContext } from "../context/cart.context";

const { Header } = Layout;

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigateToHomeSection = (sectionId = "") => {
    if (location.pathname === "/") {
      if (!sectionId) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    navigate(sectionId ? `/#${sectionId}` : "/");
  };

  const profileItems = [
    {
      key: "profile",
      label: "Trang cá nhân",
      onClick: () => navigate("/profile"),
    },
    {
      key: "logout",
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  if (auth.user.role === "admin") {
    profileItems.splice(1, 0, {
      key: "admin",
      label: "Quản trị",
      onClick: () => navigate("/admin"),
    });
  }

  return (
    <Header className="app-header">
      <div className="brand-block">
        <Link to="/" className="brand-mark">
          BeautyShop
        </Link>
      </div>

      <nav className="nav-links">
        <button
          className={location.pathname === "/" && !location.hash ? "nav-link active nav-button" : "nav-link nav-button"}
          onClick={() => navigateToHomeSection("")}
          type="button"
        >
          Trang chủ
        </button>
        <button
          className={location.hash === "#promotion" ? "nav-link active nav-button" : "nav-link nav-button"}
          onClick={() => navigateToHomeSection("promotion")}
          type="button"
        >
          Khuyến mại
        </button>
        <button
          className={location.hash === "#most-viewed" ? "nav-link active nav-button" : "nav-link nav-button"}
          onClick={() => navigateToHomeSection("most-viewed")}
          type="button"
        >
          Hot nhất
        </button>
        <button
          className={location.hash === "#best-seller" ? "nav-link active nav-button" : "nav-link nav-button"}
          onClick={() => navigateToHomeSection("best-seller")}
          type="button"
        >
          Bán chạy
        </button>
      </nav>

      <Space size="middle" className="header-actions">
        {auth.isAuthenticated ? (
          <>
            <Dropdown
              menu={{ items: profileItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <button type="button" className="avatar-trigger">
                <Avatar
                  size={38}
                  icon={<UserOutlined />}
                  className="header-avatar"
                />
                <span className="avatar-name">
                  {auth.user.name || auth.user.email}
                </span>
              </button>
            </Dropdown>
            <Link
              className={
                location.pathname === "/cart" ? "header-cart-link active" : "header-cart-link"
              }
              to="/cart"
            >
              <span className="cart-nav-link">
                <Badge count={cart.totalItems} size="small" offset={[8, -2]}>
                  <ShoppingCartOutlined className="cart-icon" />
                </Badge>
                <span className="cart-text">Giỏ hàng</span>
              </span>
            </Link>
          </>
        ) : (
          <>
            <button className="header-button ghost-button auth-trigger" onClick={() => navigate("/register")} type="button">
              Đăng ký
            </button>
            <button className="header-button primary-header-button auth-trigger" onClick={() => navigate("/login")} type="button">
              Đăng nhập
            </button>
          </>
        )}
      </Space>
    </Header>
  );
};

export default AppHeader;
