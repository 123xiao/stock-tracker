import React, { useState } from "react";
import { Typography, Space, Divider, Button } from "antd";
import { GithubOutlined, InfoCircleOutlined } from "@ant-design/icons";
import AboutModal from "./AboutModal";

const { Text, Link } = Typography;

/**
 * 开源信息组件
 * 显示关于项目的开源信息、许可证和GitHub仓库链接
 */
const OpenSourceInfo: React.FC = () => {
  const [aboutModalVisible, setAboutModalVisible] = useState<boolean>(false);

  return (
    <div
      className="open-source-info"
      style={{ textAlign: "center", padding: "12px", marginTop: "0" }}
    >
      <Space direction="vertical" size="small">
        <Space>
          <Button
            type="link"
            icon={<GithubOutlined />}
            href="https://github.com/123xiao/stock-tracker"
            target="_blank"
          >
            GitHub仓库
          </Button>
          <Button
            type="link"
            icon={<InfoCircleOutlined />}
            onClick={() => setAboutModalVisible(true)}
          >
            关于盯盘朋友仓位助手
          </Button>
        </Space>

        <div className="mt-2">
          <Text
            type="secondary"
            style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}
          >
            访问统计
          </Text>
          <img
            src="https://profile-counter.glitch.me/stock.123408.xyz/count.svg"
            alt="访问计数器"
            style={{ margin: "0 auto" }}
          />
        </div>

        <Text type="secondary" style={{ fontSize: "12px" }}>
          ©️ 2025 盯盘朋友仓位助手 | 开源项目，遵循MIT许可证
        </Text>
      </Space>

      {/* 关于对话框 */}
      <AboutModal
        visible={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
      />
    </div>
  );
};

export default OpenSourceInfo;
