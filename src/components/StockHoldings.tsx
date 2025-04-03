import React, { useEffect, useState } from "react";
import { Table, Typography, Tag, Spin, Alert, Button, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { Friend, Stock } from "../types";
import { getMultipleStocksInfo } from "../utils/stockApi";
import {
  formatPrice,
  formatMoney,
  formatPercent,
  calculateProfit,
  calculateProfitPercent,
} from "../utils/helpers";

const { Title, Text } = Typography;

interface StockHoldingsProps {
  friend: Friend | null;
  lastUpdateTime: number;
}

interface StockWithHolding extends Stock {
  quantity: number;
  cost: number;
  totalCost: number;
  totalValue: number;
  profit: number;
  profitPercent: number;
  todayProfit: number; // 今日盈亏
}

const StockHoldings: React.FC<StockHoldingsProps> = ({
  friend,
  lastUpdateTime,
}) => {
  const [stocksWithData, setStocksWithData] = useState<StockWithHolding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAsset, setTotalAsset] = useState<number>(0);
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [totalProfitPercent, setTotalProfitPercent] = useState<number>(0);
  const [todayTotalProfit, setTodayTotalProfit] = useState<number>(0); // 今日总盈亏

  const fetchStockData = async () => {
    if (!friend) {
      setStocksWithData([]);
      setLoading(false);
      return;
    }

    if (friend.stocks.length === 0) {
      setStocksWithData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const stockCodes = friend.stocks.map((stock) => stock.code);

      // 创建本地股票名称映射表
      const localStockNames: Record<string, string> = {};
      friend.stocks.forEach((stock) => {
        localStockNames[stock.code.toUpperCase()] = stock.name;
      });

      // 传递本地股票名称映射表
      const stocksData = await getMultipleStocksInfo(
        stockCodes,
        localStockNames
      );

      if (stocksData.length === 0) {
        setError("未能获取股票数据，请检查股票代码是否正确");
        setLoading(false);
        return;
      }

      // 合并股票实时数据和持仓数据
      const holdingsWithData: StockWithHolding[] = stocksData.map(
        (stockData) => {
          const friendStock = friend.stocks.find(
            (s) => s.code.toLowerCase() === stockData.code.toLowerCase()
          );

          if (!friendStock) {
            return {
              ...stockData,
              quantity: 0,
              cost: 0,
              totalCost: 0,
              totalValue: 0,
              profit: 0,
              profitPercent: 0,
              todayProfit: 0, // 今日盈亏为0
            };
          }

          const totalCost = friendStock.cost * friendStock.quantity;
          const totalValue = stockData.price * friendStock.quantity;
          const profit = calculateProfit(
            stockData.price,
            friendStock.cost,
            friendStock.quantity
          );
          const profitPercent = calculateProfitPercent(
            stockData.price,
            friendStock.cost
          );

          // 计算今日盈亏
          const todayProfit = stockData.change * friendStock.quantity;

          return {
            ...stockData,
            quantity: friendStock.quantity,
            cost: friendStock.cost,
            totalCost,
            totalValue,
            profit,
            profitPercent,
            todayProfit,
          };
        }
      );

      // 计算总资产和总收益
      let totalAssetValue = 0;
      let totalCostValue = 0;
      let todayTotalProfitValue = 0; // 今日总盈亏

      holdingsWithData.forEach((stock) => {
        totalAssetValue += stock.totalValue;
        totalCostValue += stock.totalCost;
        todayTotalProfitValue += stock.todayProfit; // 累加今日盈亏
      });

      const totalProfitValue = totalAssetValue - totalCostValue;
      const totalProfitPercentValue =
        totalCostValue > 0 ? (totalProfitValue / totalCostValue) * 100 : 0;

      setStocksWithData(holdingsWithData);
      setTotalAsset(totalAssetValue);
      setTotalProfit(totalProfitValue);
      setTotalProfitPercent(totalProfitPercentValue);
      setTodayTotalProfit(todayTotalProfitValue); // 设置今日总盈亏
      setLoading(false);
    } catch (error) {
      console.error("获取股票数据失败:", error);
      setError("获取股票数据失败，请稍后重试或检查网络连接");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [friend, lastUpdateTime]);

  const columns: ColumnsType<StockWithHolding> = [
    {
      title: "股票名称",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: StockWithHolding) => (
        <span>
          {text}{" "}
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.code}
          </Text>{" "}
          <Tooltip title="在雪球网查看">
            <Button
              type="link"
              icon={<LinkOutlined />}
              size="small"
              href={`https://xueqiu.com/S/${record.code.toUpperCase()}`}
              target="_blank"
              style={{ padding: 0 }}
            />
          </Tooltip>
        </span>
      ),
    },
    {
      title: "当前价格",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price: number, record: StockWithHolding) => (
        <span>
          <Text strong>{formatPrice(price)}</Text>
          <br />
          <Text
            style={{
              color: record.change >= 0 ? "#f56a00" : "#52c41a",
              fontSize: "12px",
            }}
          >
            {record.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {formatPercent(record.changePercent)}
          </Text>
        </span>
      ),
    },
    {
      title: "持仓数量",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
    },
    {
      title: "成本价",
      dataIndex: "cost",
      key: "cost",
      align: "right",
      render: (cost: number) => formatPrice(cost),
    },
    {
      title: "持仓市值",
      dataIndex: "totalValue",
      key: "totalValue",
      align: "right",
      render: (totalValue: number) => formatMoney(totalValue),
    },
    {
      title: "今日盈亏",
      dataIndex: "todayProfit",
      key: "todayProfit",
      align: "right",
      render: (todayProfit: number, record: StockWithHolding) => (
        <div>
          <Text style={{ color: todayProfit >= 0 ? "#f56a00" : "#52c41a" }}>
            {formatMoney(todayProfit)}
          </Text>
          <br />
          <Text
            style={{
              fontSize: "12px",
              color: record.changePercent >= 0 ? "#f56a00" : "#52c41a",
            }}
          >
            {record.changePercent >= 0 ? (
              <ArrowUpOutlined />
            ) : (
              <ArrowDownOutlined />
            )}
            {formatPercent(record.changePercent)}
          </Text>
        </div>
      ),
    },
    {
      title: "盈亏金额",
      dataIndex: "profit",
      key: "profit",
      align: "right",
      render: (profit: number) => (
        <Text style={{ color: profit >= 0 ? "#f56a00" : "#52c41a" }}>
          {formatMoney(profit)}
        </Text>
      ),
    },
    {
      title: "盈亏比例",
      dataIndex: "profitPercent",
      key: "profitPercent",
      align: "right",
      render: (profitPercent: number) => (
        <Tag color={profitPercent >= 0 ? "orange" : "green"}>
          {formatPercent(profitPercent)}
        </Tag>
      ),
    },
  ];

  if (!friend) {
    return (
      <div className="no-friend-selected">
        <Title level={5}>请选择一位朋友查看仓位信息</Title>
      </div>
    );
  }

  if (friend.stocks.length === 0) {
    return (
      <div className="no-stocks">
        <Title level={4}>{friend.name}的持仓</Title>
        <Alert
          message="暂无持仓数据"
          description="该朋友尚未添加任何股票持仓信息"
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="stock-holdings">
      <div className="friend-info" style={{ marginBottom: "20px" }}>
        <Title level={4}>{friend.name}的持仓</Title>
        <div
          className="asset-summary"
          style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}
        >
          <div>
            <Text type="secondary">总资产</Text>
            <div>
              <Text strong style={{ fontSize: "18px" }}>
                {formatMoney(totalAsset)}
              </Text>
            </div>
          </div>
          <div>
            <Text type="secondary">今日盈亏</Text>
            <div>
              <Text
                strong
                style={{
                  fontSize: "18px",
                  color: todayTotalProfit >= 0 ? "#f56a00" : "#52c41a",
                }}
              >
                {formatMoney(todayTotalProfit)}
                {todayTotalProfit !== 0 && totalAsset > 0 && (
                  <span style={{ fontSize: "14px" }}>
                    {" "}
                    (
                    {formatPercent(
                      (todayTotalProfit / (totalAsset - todayTotalProfit)) * 100
                    )}
                    )
                  </span>
                )}
              </Text>
            </div>
          </div>
          <div>
            <Text type="secondary">累计盈亏</Text>
            <div>
              <Text
                strong
                style={{
                  fontSize: "18px",
                  color: totalProfit >= 0 ? "#f56a00" : "#52c41a",
                }}
              >
                {formatMoney(totalProfit)}
              </Text>
            </div>
          </div>
          <div>
            <Text type="secondary">累计收益率</Text>
            <div>
              <Text
                strong
                style={{
                  fontSize: "18px",
                  color: totalProfitPercent >= 0 ? "#f56a00" : "#52c41a",
                }}
              >
                {formatPercent(totalProfitPercent)}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert
          message="数据加载错误"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: "16px" }}
        />
      )}

      {loading ? (
        <Spin tip="加载数据中..." />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <Table
            className="stock-holdings"
            columns={columns}
            dataSource={stocksWithData.map((stock) => ({
              ...stock,
              key: stock.code,
            }))}
            pagination={false}
            bordered
            locale={{ emptyText: "无数据" }}
            scroll={{ x: "max-content" }}
          />
        </div>
      )}
    </div>
  );
};

export default StockHoldings;
