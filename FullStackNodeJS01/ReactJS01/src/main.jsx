import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";
import App from "./App";
import AdminRoute from "./components/auth/admin-route";
import { AuthWrapper } from "./components/context/auth.context";
import AdminPage from "./pages/admin";
import HomePage from "./pages/home";
import LoginPage from "./pages/login";
import ProductDetailPage from "./pages/product-detail";
import ProfilePage from "./pages/profile";
import RegisterPage from "./pages/register";
import CategoryPage from "./pages/category";
import "./styles/global.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "products/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "categories/:id",
        element: <CategoryPage />,
      },
      {
        element: <AdminRoute />,
        children: [
          {
            path: "admin",
            element: <AdminPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#bb4d00",
          borderRadius: 18,
          fontFamily:
            '"Segoe UI", "Trebuchet MS", "Helvetica Neue", sans-serif',
        },
      }}
    >
      <AuthWrapper>
        <RouterProvider router={router} />
      </AuthWrapper>
    </ConfigProvider>
  </React.StrictMode>,
);
