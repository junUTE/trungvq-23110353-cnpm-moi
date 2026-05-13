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
        message: "Tao tai khoan thanh cong",
        description: "Ban co the dang nhap ngay bay gio.",
      });
      navigate("/login");
    } else {
      notification.error({
        message: "Tao tai khoan that bai",
        description:
          response?.message || "Email co the da ton tai hoac du lieu chua hop le.",
      });
    }

    setSubmitting(false);
  };

  return (
    <section className="auth-shell">
      <Card className="auth-card" bordered={false}>
        <div className="auth-copy">
          <span className="eyebrow">Create account</span>
          <Title level={2}>Dang ky tai khoan moi</Title>
          <Paragraph>
            Form nay ket noi truc tiep toi `/v1/api/register` tren backend
            ExpressJS01 cua ban.
          </Paragraph>
        </div>

        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            label="Ho ten"
            name="name"
            rules={[{ required: true, message: "Vui long nhap ho ten." }]}
          >
            <Input size="large" placeholder="Nguyen Van A" />
          </Form.Item>

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
            rules={[
              { required: true, message: "Vui long nhap password." },
              { min: 6, message: "Password can it nhat 6 ky tu." },
            ]}
          >
            <Input.Password size="large" placeholder="Tao mat khau" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={submitting}
            className="hero-button"
          >
            Tao tai khoan
          </Button>
        </Form>

        <div className="auth-footer">
          <Link to="/">Ve trang chu</Link>
          <Link to="/login">Da co tai khoan?</Link>
        </div>
      </Card>
    </section>
  );
};

export default RegisterPage;
