import { useContext, useEffect, useState } from "react";
import { Alert, Button, Card, Empty, Skeleton, Table, Typography } from "antd";
import { Link } from "react-router-dom";
import { AuthContext } from "../components/context/auth.context";
import { getUsersApi } from "../util/api";

const { Title, Paragraph } = Typography;

const UserPage = () => {
  const { auth } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth.isAuthenticated) {
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      setError("");

      const response = await getUsersApi();

      if (response?.message) {
        setError(response.message);
        setLoading(false);
        return;
      }

      setUsers(Array.isArray(response) ? response : []);
      setLoading(false);
    };

    fetchUsers();
  }, [auth.isAuthenticated]);

  if (!auth.isAuthenticated) {
    return (
      <section className="panel-shell">
        <Card className="panel-card" bordered={false}>
          <Title level={2}>Can dang nhap de xem danh sach users</Title>
          <Paragraph>
            Backend dang bao ve route `/v1/api/user` bang JWT middleware, nen trang
            nay se chi hoat dong sau khi ban dang nhap.
          </Paragraph>
          <Link to="/login">
            <Button type="primary" className="hero-button">
              Di toi trang dang nhap
            </Button>
          </Link>
        </Card>
      </section>
    );
  }

  return (
    <section className="panel-shell">
      <Card className="panel-card" bordered={false}>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Protected resource</span>
            <Title level={2}>Danh sach nguoi dung</Title>
            <Paragraph>
              Du lieu duoc lay tu `/v1/api/user` va tu dong gui bearer token.
            </Paragraph>
          </div>
        </div>

        {error ? <Alert type="error" showIcon message={error} /> : null}

        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : users.length === 0 ? (
          <Empty description="Chua co user nao" />
        ) : (
          <Table
            rowKey="_id"
            pagination={{ pageSize: 6 }}
            columns={[
              {
                title: "ID",
                dataIndex: "_id",
              },
              {
                title: "Name",
                dataIndex: "name",
              },
              {
                title: "Email",
                dataIndex: "email",
              },
              {
                title: "Role",
                dataIndex: "role",
              },
            ]}
            dataSource={users}
          />
        )}
      </Card>
    </section>
  );
};

export default UserPage;
