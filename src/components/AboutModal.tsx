import React from "react";
import { Modal, Typography, Space, Divider, Button } from "antd";
import { GithubOutlined, BookOutlined, CodeOutlined } from "@ant-design/icons";

const { Title, Text, Link, Paragraph } = Typography;

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * 关于对话框
 * 显示应用的详细信息、版本、开源信息等
 */
const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      title="关于盯盘朋友"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
      width={600}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Title level={4} style={{ textAlign: "center", margin: "10px 0" }}>
          盯盘朋友 - 股票仓位追踪应用
        </Title>

        <Paragraph>
          这是一个用于追踪朋友股票仓位和实时涨跌的应用，可同时运行在Web浏览器和Windows桌面环境。
        </Paragraph>

        <Divider orientation="left">开源信息</Divider>

        <Space direction="vertical">
          <Text>本项目是开源的，遵循MIT许可证，欢迎贡献和改进。</Text>

          <Space>
            <Link
              href="https://github.com/123xiao/stock-tracker"
              target="_blank"
            >
              <Button type="link" icon={<GithubOutlined />}>
                GitHub仓库
              </Button>
            </Link>

            <Link
              href="https://github.com/123xiao/stock-tracker/blob/master/LICENSE"
              target="_blank"
            >
              <Button type="link" icon={<BookOutlined />}>
                MIT许可证
              </Button>
            </Link>

            <Link
              href="https://github.com/123xiao/stock-tracker/blob/master/CONTRIBUTING.md"
              target="_blank"
            >
              <Button type="link" icon={<CodeOutlined />}>
                如何贡献
              </Button>
            </Link>
          </Space>
        </Space>

        <Divider orientation="left">主要功能</Divider>

        <ul>
          <li>大盘指数展示：实时显示主要市场指数</li>
          <li>朋友仓位管理：添加、编辑、删除多个朋友的股票仓位信息</li>
          <li>实时股票数据：展示股票的实时价格和涨跌情况</li>
          <li>持仓盈亏计算：自动计算每个持仓的盈亏金额和盈亏比例</li>
          <li>今日盈亏统计：展示每只股票的今日盈亏和朋友的今日总盈亏</li>
          <li>本地数据存储：所有数据保存在本地</li>
        </ul>

        <Divider orientation="left">技术栈</Divider>

        <ul>
          <li>React & TypeScript</li>
          <li>Ant Design UI库</li>
          <li>雪球网股票API</li>
          <li>Electron桌面应用框架</li>
        </ul>

        <Divider />

        <Text
          type="secondary"
          style={{ textAlign: "center", display: "block" }}
        >
          版本 1.0.0 · ©️ 2024 盯盘朋友
        </Text>
      </Space>
    </Modal>
  );
};

export default AboutModal;
