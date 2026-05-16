import { useContext, useState } from "react";
import { Button, Card, Form, Input, Typography, notification } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../components/context/auth.context";
import { loginApi } from "../util/api";

const { Title, Paragraph } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values) => {
    setSubmitting(true);
    const response = await loginApi(values.email, values.password);

    if (response?.EC === 0) {
      localStorage.setItem("access_token", response.access_token);
      setAuth({
        isAuthenticated: true,
        user: {
          id: response?.user?.id ?? "",
          email: response?.user?.email ?? "",
          name: response?.user?.name ?? "",
          role: response?.user?.role ?? "",
        },
      });
      notification.success({
        message: "Dang nhap thanh cong",
        description: "Ban da ket noi vao he thong.",
      });
      navigate(response?.user?.role === "admin" ? "/admin" : "/");
    } else {
      notification.error({
        message: "Dang nhap that bai",
        description: response?.EM || response?.message || "Khong the dang nhap.",
      });
    }

    setSubmitting(false);
  };

  return (
    <section className="auth-shell">
      <Card className="auth-card" variant="borderless">
        <div className="auth-copy">
          <span className="eyebrow">Welcome back</span>
          <Title level={2}>Đăng nhập</Title>
        </div>

        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email." },
              { type: "email", message: "Email không hợp lệ." },
            ]}
          >
            <Input size="large" placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập password." }]}
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={submitting}
            className="hero-button"
          >
            Đăng nhập
          </Button>
        </Form>

        <div className="auth-footer">
          <Link to="/">Về trang chủ</Link>
          <Link to="/register">Chưa có tài khoản?</Link>
        </div>
      </Card>
    </section>
  );
};

export default LoginPage;
