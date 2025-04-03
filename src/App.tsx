import React, { useState, useEffect } from "react";
import { ConfigProvider, Layout, Tabs, theme, Button } from "antd";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import zhCN from "antd/lib/locale/zh_CN";
import { UserOutlined, StockOutlined, ReloadOutlined } from "@ant-design/icons";
import HomePage from "./pages/HomePage";
import SimulatedAccountsPage from "./components/SimulatedAccountsPage";
import SimulatedAccountPage from "./components/SimulatedAccountPage";
import OpenSourceInfo from "./components/OpenSourceInfo";
import Navigation from "./components/Navigation";
import "./App.css";

// 为window添加自定义属性
declare global {
  interface Window {
    _hasRefreshed?: boolean;
    _appHasRefreshed?: boolean;
  }
}

const { Header, Content, Footer } = Layout;
const { TabPane } = Tabs;

function App() {
  const { token } = theme.useToken();
  const { colorBgContainer } = token;

  // 处理刷新数据
  const handleRefresh = () => {
    // 触发一个全局事件，让需要刷新的组件能够监听到
    window.dispatchEvent(new CustomEvent("app:refresh"));
  };

  // 应用启动时加载相关数据
  React.useEffect(() => {
    // 初始化加载，但不主动导航
    console.log("App组件已加载");
  }, []);

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
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route
                  path="/simulated-accounts"
                  element={<SimulatedAccountsPage />}
                />
                <Route
                  path="/simulated-account/:id"
                  element={<SimulatedAccountPage />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
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
