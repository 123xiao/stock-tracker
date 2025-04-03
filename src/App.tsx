import React, { useState } from "react";
import { ConfigProvider, Layout, Tabs, theme, Button } from "antd";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import zhCN from "antd/lib/locale/zh_CN";
import { UserOutlined, StockOutlined, ReloadOutlined } from "@ant-design/icons";
import HomePage from "./pages/HomePage";
import SimulatedAccountsPage from "./components/SimulatedAccountsPage";
import SimulatedAccountPage from "./components/SimulatedAccountPage";
import OpenSourceInfo from "./components/OpenSourceInfo";
import "./App.css";

const { Header, Content, Footer } = Layout;
const { TabPane } = Tabs;

// 导航组件，单独提取出来以便使用 useNavigate 钩子
const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 确定当前活动的标签页
  const getActiveKey = () => {
    if (location.pathname.includes("simulated-account/")) {
      return "simulation"; // 如果在模拟仓详情页，仍然选中模拟仓标签
    } else if (location.pathname.includes("simulated-accounts")) {
      return "simulation";
    } else {
      return "friends";
    }
  };

  return (
    <Tabs
      activeKey={getActiveKey()}
      onChange={(key) => {
        if (key === "friends") {
          navigate("/");
        } else if (key === "simulation") {
          navigate("/simulated-accounts");
        }
      }}
      size="large"
      centered
      style={{ background: "#fff", padding: "0 16px", marginBottom: "8px" }}
    >
      <TabPane
        tab={
          <span>
            <UserOutlined />
            <span className="nav-text">朋友持仓</span>
          </span>
        }
        key="friends"
      />
      <TabPane
        tab={
          <span>
            <StockOutlined />
            <span className="nav-text">模拟仓</span>
          </span>
        }
        key="simulation"
      />
    </Tabs>
  );
};

function App() {
  const { token } = theme.useToken();
  const { colorBgContainer } = token;

  // 处理刷新数据
  const handleRefresh = () => {
    // 触发一个全局事件，让需要刷新的组件能够监听到
    window.dispatchEvent(new CustomEvent("app:refresh"));
  };

  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Layout style={{ minHeight: "100vh" }}>
          <Header
            style={{
              padding: "0 16px",
              background: colorBgContainer,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "48px",
              lineHeight: "48px",
            }}
          >
            <h1 style={{ margin: 0, fontSize: "18px" }}>盯盘朋友仓位助手</h1>
            <Button
              type="primary"
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              刷新数据
            </Button>
          </Header>
          <Content style={{ padding: "0 8px" }}>
            <Navigation />
            <div
              style={{
                background: "#fff",
                padding: "16px",
                minHeight: "calc(100vh - 144px)",
                borderRadius: "4px",
              }}
            >
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/simulated-accounts"
                  element={<SimulatedAccountsPage />}
                />
                <Route
                  path="/simulated-account/:id"
                  element={<SimulatedAccountPage />}
                />
              </Routes>
            </div>
          </Content>
          <Footer style={{ textAlign: "center", padding: "12px 16px" }}>
            <OpenSourceInfo />
          </Footer>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
