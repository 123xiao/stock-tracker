import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Spin, Alert } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { MarketIndex } from "../types";
import { getMarketIndices } from "../utils/stockApi";
import { formatPercent } from "../utils/helpers";

const { Title, Text } = Typography;

interface MarketIndicesProps {
  lastUpdateTime: number; // 刷新时间戳
}

const MarketIndices: React.FC<MarketIndicesProps> = ({ lastUpdateTime }) => {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 获取大盘指数
  const fetchIndices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMarketIndices();
      setIndices(data);
      setLoading(false);
    } catch (error) {
      console.error("获取大盘指数失败:", error);
      setError("获取大盘指数失败，请稍后重试或检查网络连接");
      setLoading(false);
    }
  };

  // 当lastUpdateTime变化时重新获取数据（手动刷新）
  useEffect(() => {
    fetchIndices();
  }, [lastUpdateTime]);

  return (
    <div className="market-indices">
      <Title level={4} style={{ marginBottom: "16px" }}>
        大盘指数
      </Title>

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
        <Spin tip="加载中..." />
      ) : indices.length === 0 ? (
        <Alert message="暂无大盘数据" type="info" showIcon />
      ) : (
        <Row gutter={[16, 16]}>
          {indices.map((index) => (
            <Col key={index.code} xs={24} sm={8}>
              <Card
                hoverable
                style={{
                  textAlign: "center",
                  borderLeft:
                    index.change >= 0
                      ? "4px solid #f56a00"
                      : "4px solid #52c41a",
                }}
              >
                <div>
                  <Text strong>{index.name}</Text>
                </div>
                <div style={{ marginTop: "8px" }}>
                  <Text style={{ fontSize: "18px", fontWeight: "bold" }}>
                    {index.point.toFixed(2)}
                  </Text>
                </div>
                <div style={{ marginTop: "8px" }}>
                  <Text
                    style={{
                      color: index.change >= 0 ? "#f56a00" : "#52c41a",
                      marginRight: "8px",
                    }}
                  >
                    {index.change >= 0 ? "+" : ""}
                    {index.change.toFixed(2)}
                  </Text>
                  <Text
                    style={{
                      color: index.change >= 0 ? "#f56a00" : "#52c41a",
                    }}
                  >
                    {index.change >= 0 ? (
                      <ArrowUpOutlined />
                    ) : (
                      <ArrowDownOutlined />
                    )}
                    {formatPercent(index.changePercent)}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default MarketIndices;
