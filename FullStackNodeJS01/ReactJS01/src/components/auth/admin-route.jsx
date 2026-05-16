import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { Spin } from "antd";
import { AuthContext } from "../context/auth.context";

const AdminRoute = () => {
  const { auth, appLoading } = useContext(AuthContext);

  if (appLoading) {
    return (
      <div className="screen-loader">
        <Spin size="large" />
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (auth.user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
