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
        },
      });
      notification.success({
        message: "Dang nhap thanh cong",
        description: "Ban da ket noi vao he thong.",
      });
      navigate("/");
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
      <Card className="auth-card" bordered={false}>
        <div className="auth-copy">
          <span className="eyebrow">Welcome back</span>
          <Title level={2}>Dang nhap de mo dashboard</Title>
          <Paragraph>
            Sau khi dang nhap, frontend se tu dong luu token va goi `/account`,
            `/home`, `/user` bang Authorization header.
          </Paragraph>
        </div>

        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui long nhap email." },
              { type: "email", message: "Email khong hop le." },
            ]}
          >
            <Input size="large" placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Vui long nhap password." }]}
          >
            <Input.Password size="large" placeholder="Nhap mat khau" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={submitting}
            className="hero-button"
          >
            Dang nhap
          </Button>
        </Form>

        <div className="auth-footer">
          <Link to="/">Ve trang chu</Link>
          <Link to="/register">Chua co tai khoan?</Link>
        </div>
      </Card>
    </section>
  );
};

export default LoginPage;
