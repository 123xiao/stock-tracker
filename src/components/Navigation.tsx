import React, { useEffect } from "react";
import { Tabs } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { UserOutlined, StockOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

// 为window添加自定义属性
declare global {
  interface Window {
    _navigationRefreshed?: boolean;
  }
}

// 独立的导航组件
const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 首次加载时自动导航到首页
  useEffect(() => {
    // 不进行自动页面切换，只确保在首页时数据正确加载
    if (location.pathname === "/") {
      console.log("在首页，确保数据加载");
    }
  }, [location.pathname]);

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

export default Navigation;
