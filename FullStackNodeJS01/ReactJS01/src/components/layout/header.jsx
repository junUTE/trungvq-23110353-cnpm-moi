import { Button, Layout, Space, Tag } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";

const { Header } = Layout;

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Header className="app-header">
      <div className="brand-block">
        <Link to="/" className="brand-mark">
          ShopFlow
        </Link>
        <p className="brand-copy">React frontend for your Node + Mongo API</p>
      </div>

      <nav className="nav-links">
        <Link
          className={location.pathname === "/" ? "nav-link active" : "nav-link"}
          to="/"
        >
          Trang chủ
        </Link>
        <Link
          className={
            location.pathname === "/users" ? "nav-link active" : "nav-link"
          }
          to="/users"
        >
          Người dùng
        </Link>
      </nav>

      <Space size="middle" className="header-actions">
        {auth.isAuthenticated ? (
          <>
            <Tag color="gold" className="welcome-tag">
              {auth.user.name || auth.user.email}
            </Tag>
            <Button type="primary" className="header-button" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </>
        ) : (
          <>
            <Button className="header-button ghost-button" onClick={() => navigate("/register")}>
              Đăng ký
            </Button>
            <Button type="primary" className="header-button" onClick={() => navigate("/login")}>
              Đăng nhập
            </Button>
          </>
        )}
      </Space>
    </Header>
  );
};

export default AppHeader;
