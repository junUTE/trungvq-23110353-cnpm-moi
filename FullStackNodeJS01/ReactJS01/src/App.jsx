import { Outlet } from "react-router-dom";
import { Layout, Spin } from "antd";
import { useContext, useEffect } from "react";
import AppHeader from "./components/layout/header";
import { AuthContext } from "./components/context/auth.context";

const { Content } = Layout;

function App() {
  const { appLoading, bootstrapAuth } = useContext(AuthContext);

  useEffect(() => {
    bootstrapAuth();
  }, []);

  if (appLoading) {
    return (
      <div className="screen-loader">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className="app-shell">
      <AppHeader />
      <Content className="app-content">
        <Outlet />
      </Content>
    </Layout>
  );
}

export default App;
