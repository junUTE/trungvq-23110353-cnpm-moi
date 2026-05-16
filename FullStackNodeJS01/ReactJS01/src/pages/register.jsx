import { useState } from "react";
import { Button, Card, Form, Input, Typography, notification } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { createUserApi } from "../util/api";

const { Title, Paragraph } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values) => {
    setSubmitting(true);
    const response = await createUserApi(values.name, values.email, values.password);

    if (response?._id || response?.email) {
      notification.success({
        message: "Tạo tài khoản thành công",
        description: "Bạn có thể đăng nhập ngay bây giờ.",
      });
      navigate("/login");
    } else {
      notification.error({
        message: "Tạo tài khoản thật bại.",
        description:
          response?.message || "Email có thể đã tồn tại hoặc không hợp lệ.",
      });
    }

    setSubmitting(false);
  };

  return (
    <section className="auth-shell">
      <Card className="auth-card" variant="borderless">
        <div className="auth-copy">
          <span className="eyebrow">Create account</span>
          <Title level={2}>Đăng ký tài khoản mới</Title>
        </div>

        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            label="Họ tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input size="large" placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email." },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input size="large" placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập password." },
              { min: 6, message: "Password cần ít nhất 6 ký tự." },
            ]}
          >
            <Input.Password size="large" placeholder="Tạo mật khẩu" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={submitting}
            className="hero-button"
          >
            Tạo tài khoản
          </Button>
        </Form>

        <div className="auth-footer">
          <Link to="/">Về trang chủ</Link>
          <Link to="/login">Đã có tài khoản?</Link>
        </div>
      </Card>
    </section>
  );
};

export default RegisterPage;
