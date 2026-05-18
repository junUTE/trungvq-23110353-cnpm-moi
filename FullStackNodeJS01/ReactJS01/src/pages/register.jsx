import { useState, useEffect } from "react";
import { Button, Card, Form, Input, Typography, notification, Row, Col } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { createUserApi, sendVerificationCodeApi } from "../util/api";

const { Title, Paragraph } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    try {
      const email = form.getFieldValue("email");
      const username = form.getFieldValue("username");

      if (!email || !username) {
        notification.warning({
          message: "Thiếu thông tin",
          description: "Vui lòng nhập Username và Email trước khi nhận mã.",
        });
        return;
      }

      setSendingOTP(true);
      const res = await sendVerificationCodeApi(email, username);
      
      if (res?.success || res?.message === "Mã xác thực đã được gửi tới email.") {
        notification.success({
          message: "Đã gửi mã",
          description: "Mã xác thực đã được gửi tới email của bạn.",
        });
        setCountdown(60);
      } else {
        notification.error({
          message: "Lỗi gửi mã",
          description: res?.message || "Không thể gửi mã xác thực. Vui lòng thử lại.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi hệ thống",
        description: error?.response?.data?.message || "Không thể gửi mã xác thực. Vui lòng thử lại sau.",
      });
    } finally {
      setSendingOTP(false);
    }
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const response = await createUserApi(
        values.username, 
        values.email, 
        values.password,
        values.verificationCode
      );

      if (response?.success || response?.message === "Đăng ký thành công!") {
        notification.success({
          message: "Đăng ký thành công",
          description: "Tài khoản của bạn đã được tạo. Bạn có thể đăng nhập ngay.",
        });
        navigate("/login");
      } else {
        notification.error({
          message: "Đăng ký thất bại",
          description: response?.message || "Không thể tạo tài khoản. Vui lòng kiểm tra lại.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Đăng ký thất bại",
        description: error?.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại sau.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-shell">
      <Card className="auth-card" variant="borderless">
        <div className="auth-copy">
          <span className="eyebrow">Create account</span>
          <Title level={2}>Đăng ký tài khoản mới</Title>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Vui lòng nhập username" }]}
          >
            <Input size="large" placeholder="nguyen_van_a" />
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

          <Form.Item label="Mã xác thực (OTP)" required>
            <Row gutter={8}>
              <Col span={16}>
                <Form.Item
                  name="verificationCode"
                  noStyle
                  rules={[{ required: true, message: "Vui lòng nhập mã OTP." }]}
                >
                  <Input size="large" placeholder="Nhập mã 5 số" maxLength={5} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Button 
                  size="large" 
                  block 
                  onClick={handleSendOTP} 
                  disabled={countdown > 0 || sendingOTP}
                  loading={sendingOTP}
                >
                  {countdown > 0 ? `${countdown}s` : "Nhận mã"}
                </Button>
              </Col>
            </Row>
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
