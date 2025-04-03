import { getStockInfo, getMultipleStocksInfo } from "../utils/stockApi";
import { Stock } from "../types";

// 获取单只股票的实时数据
export const getStockPrice = async (code: string): Promise<number | null> => {
  try {
    // 使用已有的雪球API获取股票价格
    const stockInfo = await getStockInfo(code);
    return stockInfo.price;
  } catch (error) {
    console.error("获取股票价格失败:", error);
    return getMockStockPrice(code);
  }
};

// 获取多只股票的实时数据
export const getBatchStockPrices = async (
  codes: string[]
): Promise<Map<string, number>> => {
  const result = new Map<string, number>();

  try {
    if (codes.length === 0) return result;

    // 使用已有的雪球API批量获取股票价格
    const stocksInfo = await getMultipleStocksInfo(codes);

    stocksInfo.forEach((stock: Stock) => {
      result.set(stock.code.toUpperCase(), stock.price);
    });

    return result;
  } catch (error) {
    console.error("批量获取股票价格失败:", error);
    // 使用模拟数据作为备选
    codes.forEach((code) => {
      result.set(code, getMockStockPrice(code));
    });
    return result;
  }
};

// 模拟获取股票价格（当API无法访问时的备选方案）
export const getMockStockPrice = (code: string): number => {
  // 生成一个基于代码的伪随机价格
  const codeSum = code
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const basePrice = 10 + (codeSum % 90); // 生成10-100之间的价格
  const decimal = Math.floor(Math.random() * 100) / 100; // 生成0-0.99之间的小数
  return parseFloat((basePrice + decimal).toFixed(2));
};
