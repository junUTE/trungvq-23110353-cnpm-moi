import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Popconfirm,
  Space,
  Typography,
  notification,
} from "antd";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/context/auth.context";
import {
  deleteOwnAccountApi,
  getAccountApi,
  updateOwnProfileApi,
} from "../util/api";

const { Title, Paragraph } = Typography;

const ProfilePage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { auth, setAuth, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      const response = await getAccountApi();

      if (response?.message) {
        setError(response.message);
        setLoading(false);
        return;
      }

      form.setFieldsValue({
        name: response?.name ?? "",
        email: response?.email ?? "",
        role: response?.role ?? "",
        password: "",
        confirmPassword: "",
      });
      setLoading(false);
    };

    fetchProfile();
  }, [auth.isAuthenticated, form, navigate]);

  const handleSubmit = async (values) => {
    setSaving(true);

    const payload = {
      name: values.name,
      email: values.email,
    };

    if (values.password) {
      payload.password = values.password;
    }

    const response = await updateOwnProfileApi(payload);

    if (response?.message && !response?.data) {
      notification.error({
        message: "Không thể cập nhật hồ sơ",
        description: response.message,
      });
      setSaving(false);
      return;
    }

    setAuth({
      isAuthenticated: true,
      user: {
        id: response?.data?._id ?? auth.user.id,
        name: response?.data?.name ?? "",
        email: response?.data?.email ?? "",
        role: response?.data?.role ?? auth.user.role,
      },
    });

    form.setFieldsValue({
      password: "",
      confirmPassword: "",
    });

    notification.success({
      message: "Đã cập nhật thông tin cá nhân",
    });
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    const response = await deleteOwnAccountApi();

    if (response?.message !== "Account deleted successfully") {
      notification.error({
        message: "Không thể xóa tài khoản",
        description: response?.message || "Đã có lỗi xảy ra.",
      });
      return;
    }

    logout();
    notification.success({
      message: "Tài khoản đã được xóa",
    });
    navigate("/register");
  };

  return (
    <section className="panel-shell">
      <Card
        className="panel-card profile-card"
        variant="borderless"
        loading={loading}
      >
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Thông tin cá nhân</span>
            <Title level={2}>Xem và chỉnh sửa hồ sơ của bạn</Title>
          </div>
        </div>

        {error ? (
          <Alert
            type="error"
            showIcon
            title={error}
            style={{ marginBottom: 16 }}
          />
        ) : null}

        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên." }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email." },
              { type: "email", message: "Email không hợp lệ." },
            ]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item label="Role" name="role">
            <Input size="large" disabled />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="password"
            rules={[
              {
                min: 6,
                message: "Mật khẩu mới cần ít nhất 6 ký tự.",
              },
            ]}
          >
            <Input.Password size="large" placeholder="Bỏ trống nếu không đổi" />
          </Form.Item>

          <Form.Item
            label="Nhập lại mật khẩu mới"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!getFieldValue("password") && !value) {
                    return Promise.resolve();
                  }

                  if (getFieldValue("password") === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error("Mật khẩu nhập lại không khớp."),
                  );
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Space wrap>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              className="hero-button"
            >
              Lưu thay đổi
            </Button>
            <Popconfirm
              title="Xóa tài khoản này?"
              description="Hành động này không thể hoàn tác."
              onConfirm={handleDeleteAccount}
            >
              <Button danger>Xóa tài khoản</Button>
            </Popconfirm>
          </Space>
        </Form>
      </Card>
    </section>
  );
};

export default ProfilePage;
