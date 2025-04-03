import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Descriptions,
  Typography,
  Space,
  Table,
  Tabs,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Statistic,
  Switch,
  Spin,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  StockOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { SimulatedAccount, SimulatedHolding, Transaction } from "../types";
import {
  getSimulatedAccount,
  buyStock,
  sellStock,
  calculateHoldingProfit,
  calculateHoldingProfitPercent,
} from "../utils/simulatedAccountUtils";
import { stockInfos, StockInfo } from "../utils/stockInfoData";
import {
  getStockPrice,
  getBatchStockPrices,
  getMockStockPrice,
} from "../services/stockService";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const SimulatedAccountPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [account, setAccount] = useState<SimulatedAccount | null>(null);
  const [isBuyModalVisible, setIsBuyModalVisible] = useState(false);
  const [isSellModalVisible, setIsSellModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState<SimulatedHolding | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [buyForm] = Form.useForm();
  const [sellForm] = Form.useForm();
  const [stockOptions, setStockOptions] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [currentPrices, setCurrentPrices] = useState<Map<string, number>>(
    new Map()
  );
  const [buyAmount, setBuyAmount] = useState<number>(0);
  const [useMarketPrice, setUseMarketPrice] = useState<boolean>(true);
  const [currentBuyPrice, setCurrentBuyPrice] = useState<number | null>(null);
  const [totalProfit, setTotalProfit] = useState<{
    amount: number;
    percent: number;
  }>({ amount: 0, percent: 0 });

  const navigate = useNavigate();

  // 加载账户信息
  useEffect(() => {
    if (id) {
      loadAccount(id);
    }
  }, [id]);

  // 监听全局刷新事件
  useEffect(() => {
    const handleGlobalRefresh = () => {
      if (id) {
        loadAccount(id);
        // 同时刷新股票价格
        if (account && account.holdings.length > 0) {
          loadStockPrices(account.holdings.map((h) => h.code));
        }
      }
    };

    window.addEventListener("app:refresh", handleGlobalRefresh);

    return () => {
      window.removeEventListener("app:refresh", handleGlobalRefresh);
    };
  }, [id, account]);

  const loadAccount = (accountId: string) => {
    const accountData = getSimulatedAccount(accountId);
    if (accountData) {
      setAccount(accountData);

      // 加载持仓股票的当前价格
      if (accountData.holdings.length > 0) {
        loadStockPrices(accountData.holdings.map((h) => h.code));
      } else {
        // 如果没有持仓，重置总盈亏为0
        setTotalProfit({
          amount: 0,
          percent: 0,
        });
      }
    } else {
      message.error("未找到模拟仓信息");
      navigate("/simulated-accounts");
    }
  };

  // 加载股票实时价格
  const loadStockPrices = async (codes: string[]) => {
    if (codes.length === 0) return;

    setLoadingPrices(true);
    try {
      const prices = await getBatchStockPrices(codes);

      // 如果API没有返回数据，使用模拟数据
      const mockPrices = new Map<string, number>();
      codes.forEach((code) => {
        mockPrices.set(code, getMockStockPrice(code));
      });

      const finalPrices = prices.size > 0 ? prices : mockPrices;
      setCurrentPrices(finalPrices);

      // 计算总盈亏
      if (account) {
        calculateTotalProfit(account.holdings, finalPrices);
      }
    } catch (error) {
      console.error("加载股票价格失败:", error);
      // 使用模拟数据作为备选
      const mockPrices = new Map<string, number>();
      codes.forEach((code) => {
        mockPrices.set(code, getMockStockPrice(code));
      });
      setCurrentPrices(mockPrices);

      // 即使在出错情况下，也尝试计算总盈亏
      if (account) {
        calculateTotalProfit(account.holdings, mockPrices);
      }
    } finally {
      setLoadingPrices(false);
    }
  };

  // 刷新股票价格
  const refreshStockPrices = () => {
    if (account && account.holdings.length > 0) {
      loadStockPrices(account.holdings.map((h) => h.code));
    }
  };

  // 计算总盈亏
  const calculateTotalProfit = (
    holdings: SimulatedHolding[],
    prices: Map<string, number>
  ) => {
    let totalCost = 0;
    let totalValue = 0;

    holdings.forEach((holding) => {
      const price = prices.get(holding.code) || holding.avgCost;
      totalCost += holding.quantity * holding.avgCost;
      totalValue += holding.quantity * price;
    });

    const profitAmount = totalValue - totalCost;
    const profitPercent = totalCost > 0 ? (profitAmount / totalCost) * 100 : 0;

    setTotalProfit({
      amount: profitAmount,
      percent: profitPercent,
    });
  };

  // 处理股票搜索
  useEffect(() => {
    if (searchText) {
      const filteredOptions = stockInfos
        .filter(
          (stock: StockInfo) =>
            stock.code.toLowerCase().includes(searchText.toLowerCase()) ||
            stock.name.toLowerCase().includes(searchText.toLowerCase()) ||
            stock.pyname.toLowerCase().includes(searchText.toLowerCase())
        )
        .slice(0, 100) // 限制显示数量
        .map((stock: StockInfo) => ({
          value: stock.code,
          label: `${stock.name} (${stock.code})`,
        }));
      setStockOptions(filteredOptions);
    } else {
      setStockOptions([]);
    }
  }, [searchText]);

  // 计算买入总金额
  useEffect(() => {
    const quantity = buyForm.getFieldValue("quantity");
    const price = buyForm.getFieldValue("price");

    if (quantity && price) {
      setBuyAmount(quantity * price);
    } else {
      setBuyAmount(0);
    }
  }, [buyForm]);

  // 监听买入数量变化
  const handleQuantityChange = () => {
    const quantity = buyForm.getFieldValue("quantity");
    const price = buyForm.getFieldValue("price");

    if (quantity && price) {
      setBuyAmount(quantity * price);
    }
  };

  // 监听买入价格变化
  const handlePriceChange = () => {
    const quantity = buyForm.getFieldValue("quantity");
    const price = buyForm.getFieldValue("price");

    if (quantity && price) {
      setBuyAmount(quantity * price);
    }
  };

  // 显示买入对话框
  const showBuyModal = () => {
    buyForm.resetFields();
    setCurrentBuyPrice(null);
    setBuyAmount(0);
    setUseMarketPrice(true);
    setIsBuyModalVisible(true);
  };

  // 显示卖出对话框
  const showSellModal = (holding: SimulatedHolding) => {
    setSelectedStock(holding);

    // 获取当前股票价格
    const currentPrice = currentPrices.get(holding.code) || holding.avgCost;

    sellForm.setFieldsValue({
      code: holding.code,
      name: holding.name,
      quantity: holding.quantity, // 默认全部卖出
      price: currentPrice, // 默认以当前价格卖出
    });
    setIsSellModalVisible(true);
  };

  // 处理股票选择
  const handleStockSelect = async (value: string) => {
    const selectedStock = stockInfos.find(
      (stock: StockInfo) => stock.code === value
    );

    if (selectedStock) {
      buyForm.setFieldsValue({
        name: selectedStock.name,
      });

      // 获取当前价格
      setLoading(true);
      try {
        const price = await getStockPrice(value);
        setCurrentBuyPrice(price || getMockStockPrice(value));

        // 如果启用市场价，则更新表单
        if (useMarketPrice && price) {
          buyForm.setFieldsValue({
            price: price,
          });
          // 更新买入金额
          const quantity = buyForm.getFieldValue("quantity");
          if (quantity) {
            setBuyAmount(quantity * price);
          }
        }
      } catch (error) {
        console.error("获取股票价格失败:", error);
        // 使用模拟价格作为备选
        const mockPrice = getMockStockPrice(value);
        setCurrentBuyPrice(mockPrice);

        if (useMarketPrice) {
          buyForm.setFieldsValue({
            price: mockPrice,
          });
          // 更新买入金额
          const quantity = buyForm.getFieldValue("quantity");
          if (quantity) {
            setBuyAmount(quantity * mockPrice);
          }
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // 处理使用市场价切换
  const handleUseMarketPriceChange = (checked: boolean) => {
    setUseMarketPrice(checked);

    if (checked && currentBuyPrice) {
      buyForm.setFieldsValue({
        price: currentBuyPrice,
      });
      // 更新买入金额
      const quantity = buyForm.getFieldValue("quantity");
      if (quantity) {
        setBuyAmount(quantity * currentBuyPrice);
      }
    }
  };

  // 处理买入提交
  const handleBuySubmit = async () => {
    try {
      setLoading(true);
      const values = await buyForm.validateFields();

      if (!id) {
        message.error("模拟仓ID不能为空");
        return;
      }

      const success = buyStock(
        id,
        values.code,
        values.name,
        values.quantity,
        values.price
      );

      if (success) {
        message.success(`成功买入 ${values.name}`);
        buyForm.resetFields();
        setIsBuyModalVisible(false);
        loadAccount(id);
      } else {
        message.error("买入失败，请检查余额是否足够");
      }
    } catch (error) {
      console.error("表单验证失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 处理卖出提交
  const handleSellSubmit = async () => {
    try {
      setLoading(true);
      const values = await sellForm.validateFields();

      if (!id || !selectedStock) {
        message.error("数据不完整");
        return;
      }

      const success = sellStock(
        id,
        values.code,
        values.name,
        values.quantity,
        values.price
      );

      if (success) {
        message.success(`成功卖出 ${values.name}`);
        sellForm.resetFields();
        setIsSellModalVisible(false);
        setSelectedStock(null);
        loadAccount(id);
      } else {
        message.error("卖出失败，请检查持仓数量");
      }
    } catch (error) {
      console.error("表单验证失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 返回列表页
  const handleBackToList = () => {
    navigate("/simulated-accounts");
  };

  // 持仓列表列定义
  const holdingsColumns = [
    {
      title: "股票代码",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "股票名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "持仓数量",
      dataIndex: "quantity",
      key: "quantity",
      render: (value: number) => value.toLocaleString("zh-CN"),
    },
    {
      title: "平均成本",
      dataIndex: "avgCost",
      key: "avgCost",
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: "现价",
      key: "currentPrice",
      render: (_: any, record: SimulatedHolding) => {
        const price = currentPrices.get(record.code);
        if (price) {
          return `¥${price.toFixed(2)}`;
        }
        return loadingPrices ? <Spin size="small" /> : "未知";
      },
    },
    {
      title: "市值",
      key: "marketValue",
      render: (_: any, record: SimulatedHolding) => {
        const price = currentPrices.get(record.code);
        if (price) {
          const value = price * record.quantity;
          return `¥${value.toLocaleString("zh-CN", {
            minimumFractionDigits: 2,
          })}`;
        }
        return loadingPrices ? <Spin size="small" /> : "未知";
      },
    },
    {
      title: "盈亏金额",
      key: "profitAmount",
      render: (_: any, record: SimulatedHolding) => {
        const price = currentPrices.get(record.code);
        if (price) {
          const profit = (price - record.avgCost) * record.quantity;
          const profitColor = profit >= 0 ? "#cf1322" : "#3f8600";
          return (
            <span style={{ color: profitColor }}>
              {profit >= 0 ? "+" : ""}¥
              {profit.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
            </span>
          );
        }
        return loadingPrices ? <Spin size="small" /> : "未知";
      },
    },
    {
      title: "盈亏比例",
      key: "profitPercent",
      render: (_: any, record: SimulatedHolding) => {
        const price = currentPrices.get(record.code);
        if (price) {
          const percent = ((price - record.avgCost) / record.avgCost) * 100;
          const profitPercentColor = percent >= 0 ? "#cf1322" : "#3f8600";
          return (
            <span style={{ color: profitPercentColor }}>
              {percent >= 0 ? "+" : ""}
              {percent.toFixed(2)}%
            </span>
          );
        }
        return loadingPrices ? <Spin size="small" /> : "未知";
      },
    },
    {
      title: "操作",
      key: "action",
      className: "action-column",
      fixed: "right" as const,
      width: 80,
      render: (_: any, record: SimulatedHolding) => (
        <Button type="primary" onClick={() => showSellModal(record)}>
          卖出
        </Button>
      ),
    },
  ];

  // 交易历史列定义
  const transactionsColumns = [
    {
      title: "日期",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleString("zh-CN"),
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      render: (type: "buy" | "sell") => (
        <Tag color={type === "buy" ? "green" : "red"}>
          {type === "buy" ? "买入" : "卖出"}
        </Tag>
      ),
    },
    {
      title: "股票代码",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "股票名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "数量",
      dataIndex: "quantity",
      key: "quantity",
      render: (value: number) => value.toLocaleString("zh-CN"),
    },
    {
      title: "价格",
      dataIndex: "price",
      key: "price",
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      render: (value: number) =>
        `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`,
    },
  ];

  if (!account) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ padding: "0" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBackToList}
        style={{ marginBottom: "16px" }}
      >
        返回列表
      </Button>

      <div>
        <Title level={3} style={{ marginBottom: "16px" }}>
          {account.name}
        </Title>

        <Row
          gutter={24}
          style={{ marginBottom: "24px" }}
          className="account-summary-row"
        >
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card bordered={true}>
              <Statistic
                title="初始资金"
                value={account.initialBalance}
                precision={2}
                prefix="¥"
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card bordered={true}>
              <Statistic
                title="当前资金"
                value={account.currentBalance}
                precision={2}
                prefix="¥"
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card bordered={true}>
              <Statistic
                title="预估市值"
                value={
                  account.currentBalance +
                  account.holdings.reduce((sum, holding) => {
                    const price =
                      currentPrices.get(holding.code) || holding.avgCost;
                    return sum + holding.quantity * price;
                  }, 0)
                }
                precision={2}
                prefix="¥"
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card bordered={true}>
              <Statistic
                title="总盈亏"
                value={totalProfit.amount}
                precision={2}
                prefix="¥"
                valueStyle={{
                  color: totalProfit.amount >= 0 ? "#cf1322" : "#3f8600",
                }}
                suffix={
                  <span style={{ fontSize: "16px", marginLeft: "8px" }}>
                    ({totalProfit.amount >= 0 ? "+" : ""}
                    {totalProfit.percent.toFixed(2)}%)
                  </span>
                }
              />
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: "24px" }}>
          <Space
            style={{
              marginBottom: "16px",
              display: "flex",
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showBuyModal}
            >
              买入股票
            </Button>
          </Space>

          <Tabs defaultActiveKey="holdings">
            <TabPane tab="持仓" key="holdings">
              <div style={{ overflowX: "auto" }}>
                <Table
                  columns={holdingsColumns}
                  dataSource={account.holdings}
                  rowKey="code"
                  pagination={false}
                  locale={{ emptyText: "暂无持仓" }}
                  scroll={{ x: "max-content" }}
                />
              </div>
            </TabPane>
            <TabPane tab="交易记录" key="transactions">
              <div style={{ overflowX: "auto" }}>
                <Table
                  columns={transactionsColumns}
                  dataSource={account.transactions.slice().reverse()} // 最新的交易排在前面
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: "暂无交易记录" }}
                  scroll={{ x: "max-content" }}
                />
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>

      {/* 买入股票对话框 */}
      <Modal
        title="买入股票"
        open={isBuyModalVisible}
        onCancel={() => setIsBuyModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsBuyModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleBuySubmit}
            disabled={buyAmount > account.currentBalance}
          >
            买入
          </Button>,
        ]}
      >
        <Form form={buyForm} layout="vertical">
          <Form.Item
            name="code"
            label="股票代码"
            rules={[{ required: true, message: "请选择股票" }]}
          >
            <Select
              showSearch
              placeholder="请输入股票代码或名称"
              filterOption={false}
              onSearch={setSearchText}
              onChange={handleStockSelect}
              options={stockOptions}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="股票名称"
            rules={[{ required: true, message: "请输入股票名称" }]}
          >
            <Input disabled />
          </Form.Item>

          {currentBuyPrice && (
            <div style={{ marginBottom: "16px" }}>
              <Space>
                <Text>现价: ¥{currentBuyPrice.toFixed(2)}</Text>
                <Switch
                  checkedChildren="使用市场价"
                  unCheckedChildren="自定义价格"
                  checked={useMarketPrice}
                  onChange={handleUseMarketPriceChange}
                />
              </Space>
            </div>
          )}

          <Form.Item
            name="quantity"
            label="买入数量"
            rules={[{ required: true, message: "请输入买入数量" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              step={100}
              placeholder="请输入买入数量"
              onChange={handleQuantityChange}
            />
          </Form.Item>
          <Form.Item
            name="price"
            label="买入价格"
            rules={[{ required: true, message: "请输入买入价格" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0.01}
              step={0.01}
              precision={2}
              placeholder="请输入买入价格"
              prefix="¥"
              disabled={useMarketPrice && currentBuyPrice !== null}
              onChange={handlePriceChange}
            />
          </Form.Item>

          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              background: "#f5f5f5",
              borderRadius: "4px",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Row justify="space-between">
                  <Col>预计花费:</Col>
                  <Col>
                    <Text strong>
                      ¥
                      {buyAmount.toLocaleString("zh-CN", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                  </Col>
                </Row>
              </div>
              <div>
                <Row justify="space-between">
                  <Col>当前余额:</Col>
                  <Col>
                    <Text strong>
                      ¥
                      {account.currentBalance.toLocaleString("zh-CN", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                  </Col>
                </Row>
              </div>
              {buyAmount > account.currentBalance && (
                <div>
                  <Text type="danger">余额不足，无法完成交易</Text>
                </div>
              )}
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 卖出股票对话框 */}
      <Modal
        title="卖出股票"
        open={isSellModalVisible}
        onCancel={() => setIsSellModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsSellModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleSellSubmit}
          >
            卖出
          </Button>,
        ]}
      >
        <Form form={sellForm} layout="vertical">
          <Form.Item name="code" label="股票代码">
            <Input disabled />
          </Form.Item>
          <Form.Item name="name" label="股票名称">
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="卖出数量"
            rules={[
              { required: true, message: "请输入卖出数量" },
              {
                validator: (_, value) => {
                  if (selectedStock && value > selectedStock.quantity) {
                    return Promise.reject(
                      new Error(`最大可卖出数量: ${selectedStock.quantity}`)
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              max={selectedStock?.quantity}
              step={100}
              placeholder="请输入卖出数量"
            />
          </Form.Item>
          <Form.Item
            name="price"
            label="卖出价格"
            rules={[{ required: true, message: "请输入卖出价格" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0.01}
              step={0.01}
              precision={2}
              placeholder="请输入卖出价格"
              prefix="¥"
            />
          </Form.Item>
          {selectedStock && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                background: "#f5f5f5",
                borderRadius: "4px",
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Row justify="space-between">
                    <Col>持仓数量:</Col>
                    <Col>
                      <Text strong>
                        {selectedStock.quantity.toLocaleString("zh-CN")}
                      </Text>
                    </Col>
                  </Row>
                </div>
                <div>
                  <Row justify="space-between">
                    <Col>平均成本:</Col>
                    <Col>
                      <Text strong>¥{selectedStock.avgCost.toFixed(2)}</Text>
                    </Col>
                  </Row>
                </div>
                {currentPrices.get(selectedStock.code) && (
                  <>
                    <div>
                      <Row justify="space-between">
                        <Col>市场价格:</Col>
                        <Col>
                          <Text strong>
                            ¥{currentPrices.get(selectedStock.code)?.toFixed(2)}
                          </Text>
                        </Col>
                      </Row>
                    </div>
                    <div>
                      <Row justify="space-between">
                        <Col>浮动盈亏:</Col>
                        <Col>
                          <Text
                            strong
                            style={{
                              color:
                                currentPrices.get(selectedStock.code)! -
                                  selectedStock.avgCost >=
                                0
                                  ? "#cf1322"
                                  : "#3f8600",
                            }}
                          >
                            {currentPrices.get(selectedStock.code)! -
                              selectedStock.avgCost >=
                            0
                              ? "+"
                              : ""}
                            {(
                              ((currentPrices.get(selectedStock.code)! -
                                selectedStock.avgCost) /
                                selectedStock.avgCost) *
                              100
                            ).toFixed(2)}
                            %
                          </Text>
                        </Col>
                      </Row>
                    </div>
                  </>
                )}
              </Space>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default SimulatedAccountPage;
