import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Card,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Statistic,
  Row,
  Col,
  Descriptions,
  Divider,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  PayCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { SimulatedAccount } from "../types";
import {
  getSimulatedAccounts,
  createSimulatedAccount,
  deleteSimulatedAccount,
} from "../utils/simulatedAccountUtils";
import { getMockStockPrice } from "../services/stockService";

const { Title } = Typography;

const SimulatedAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<SimulatedAccount[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 加载模拟仓列表
  useEffect(() => {
    loadAccounts();
  }, []);

  // 监听全局刷新事件
  useEffect(() => {
    const handleGlobalRefresh = () => {
      loadAccounts();
      message.success("模拟仓数据已刷新");
    };

    window.addEventListener("app:refresh", handleGlobalRefresh);

    return () => {
      window.removeEventListener("app:refresh", handleGlobalRefresh);
    };
  }, []);

  const loadAccounts = () => {
    const simulatedAccounts = getSimulatedAccounts();
    setAccounts(simulatedAccounts);
  };

  // 显示创建模拟仓对话框
  const showCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  // 关闭创建模拟仓对话框
  const handleCancelCreate = () => {
    form.resetFields();
    setIsCreateModalVisible(false);
  };

  // 创建模拟仓
  const handleCreateAccount = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      createSimulatedAccount(values.name, values.initialBalance);

      message.success(`已创建模拟仓: ${values.name}`);
      form.resetFields();
      setIsCreateModalVisible(false);
      loadAccounts();
    } catch (error) {
      console.error("表单验证失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 删除模拟仓
  const handleDeleteAccount = (id: string, name: string) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除模拟仓 "${name}" 吗？此操作不可恢复。`,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: () => {
        deleteSimulatedAccount(id);
        message.success(`已删除模拟仓: ${name}`);
        loadAccounts();
      },
    });
  };

  // 进入模拟仓详情页
  const handleViewAccount = (id: string) => {
    navigate(`/simulated-account/${id}`);
  };

  // 表格列定义
  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "初始资金",
      dataIndex: "initialBalance",
      key: "initialBalance",
      render: (value: number) =>
        `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`,
    },
    {
      title: "当前资金",
      dataIndex: "currentBalance",
      key: "currentBalance",
      render: (value: number) =>
        `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`,
    },
    {
      title: "预估市值",
      key: "estimatedValue",
      render: (_: any, record: SimulatedAccount) => {
        const totalHoldingValue = record.holdings.reduce((sum, holding) => {
          // 使用模拟股价计算总市值
          const price = getMockStockPrice(holding.code);
          return sum + holding.quantity * price;
        }, 0);
        const totalValue = record.currentBalance + totalHoldingValue;
        return `¥${totalValue.toLocaleString("zh-CN", {
          minimumFractionDigits: 2,
        })}`;
      },
    },
    {
      title: "持仓数量",
      dataIndex: "holdings",
      key: "holdingsCount",
      render: (holdings: any[]) => holdings.length,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString("zh-CN"),
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: SimulatedAccount) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleViewAccount(record.id)}>
            查看
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteAccount(record.id, record.name)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "0" }}>
      <Space
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        {/* <Title level={3}>模拟仓管理</Title> */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          创建模拟仓
        </Button>
      </Space>

      {accounts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            background: "#f5f5f5",
            borderRadius: "4px",
          }}
        >
          <PayCircleOutlined
            style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }}
          />
          <p>还没有创建任何模拟仓</p>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            创建第一个模拟仓
          </Button>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <Table
            columns={columns}
            dataSource={accounts}
            rowKey="id"
            pagination={false}
            scroll={{ x: "max-content" }}
          />
        </div>
      )}

      {/* 创建模拟仓对话框 */}
      <Modal
        title="创建新模拟仓"
        open={isCreateModalVisible}
        onCancel={handleCancelCreate}
        footer={[
          <Button key="back" onClick={handleCancelCreate}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleCreateAccount}
          >
            创建
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="模拟仓名称"
            rules={[{ required: true, message: "请输入模拟仓名称" }]}
          >
            <Input placeholder="例如：成长投资账户" />
          </Form.Item>
          <Form.Item
            name="initialBalance"
            label="初始资金"
            rules={[{ required: true, message: "请输入初始资金" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="例如：100000"
              min={1}
              step={1000}
              prefix="¥"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SimulatedAccountsPage;
