import React from "react";
import { ConfigProvider } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
import HomePage from "./pages/HomePage";
import "./App.css";

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <div className="app">
        <HomePage />
      </div>
    </ConfigProvider>
  );
}

export default App;
