/**
 * 盯盘朋友仓位助手 - 股票API工具模块
 *
 * 源码来自开源项目: https://github.com/123xiao/stock-tracker
 * 遵循MIT许可证
 */

import axios from "axios";
import { Stock, MarketIndex } from "../types";

// 为Electron API定义接口类型
declare global {
  interface Window {
    isElectronApp?: boolean;
    electronAPI?: {
      isElectron: () => boolean;
    };
  }
}

// 检测是否在Electron环境中 - 使用预加载脚本提供的标志
const isElectron = () => {
  return (
    window.isElectronApp === true ||
    (window.electronAPI && window.electronAPI.isElectron())
  );
};

// 根据环境确定API基础URL
const getBaseUrl = () => {
  return "https://cf-proxy.kkkkkkkkk.workers.dev/https://stock.xueqiu.com";
};

// 雪球网股票API路径
const XUEQIU_STOCK_API = `${getBaseUrl()}/v5/stock/realtime/quotec.json`;

// 指数代码列表
const MARKET_INDICES = [
  { code: "SH000001", name: "上证指数" },
  { code: "SZ399001", name: "深证成指" },
  { code: "SZ399006", name: "创业板指" },
];

// 股票名称映射表（雪球API不返回股票名称，这里手动维护一些常用股票的名称）
const STOCK_NAME_MAP: Record<string, string> = {
  SH601888: "中国中免",
  SH600000: "浦发银行",
  SH601318: "中国平安",
  SZ000001: "平安银行",
  SZ000002: "万科A",
  SZ002594: "比亚迪",
  SH600519: "贵州茅台",
  SH601398: "工商银行",
  SH601857: "中国石油",
  SZ000858: "五粮液",
};

// 获取股票名称
const getStockName = (symbol: string): string => {
  return STOCK_NAME_MAP[symbol.toUpperCase()] || symbol;
};

// 获取单只股票信息
export const getStockInfo = async (code: string): Promise<Stock> => {
  try {
    console.log(`使用API路径: ${XUEQIU_STOCK_API}`);
    console.log(`是否Electron环境: ${isElectron()}`);

    // 转换为大写形式以匹配雪球API要求
    const formattedCode = code.toUpperCase();
    const response = await axios.get(
      `${XUEQIU_STOCK_API}?symbol=${formattedCode}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
          Referer: "https://xueqiu.com/",
          Origin: "https://xueqiu.com",
        },
      }
    );

    if (
      response.data.error_code === 0 &&
      response.data.data &&
      response.data.data.length > 0
    ) {
      const stockData = response.data.data[0];

      return {
        code: stockData.symbol.toLowerCase(),
        name: getStockName(stockData.symbol),
        price: stockData.current,
        change: stockData.chg,
        changePercent: stockData.percent,
      };
    }

    throw new Error(`未找到股票数据: ${code}`);
  } catch (error) {
    console.error(`获取股票信息失败: ${code}`, error);
    throw error;
  }
};

// 获取多只股票信息
export const getMultipleStocksInfo = async (
  codes: string[],
  localStockNames?: Record<string, string>
): Promise<Stock[]> => {
  try {
    if (codes.length === 0) return [];

    console.log(`使用API路径: ${XUEQIU_STOCK_API}`);
    console.log(`是否Electron环境: ${isElectron()}`);

    // 雪球API支持批量查询
    const formattedCodes = codes.map((code) => code.toUpperCase()).join(",");
    const response = await axios.get(
      `${XUEQIU_STOCK_API}?symbol=${formattedCodes}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
          Referer: "https://xueqiu.com/",
          Origin: "https://xueqiu.com",
        },
      }
    );

    if (response.data.error_code === 0 && response.data.data) {
      return response.data.data.map((stockData: any) => {
        const code = stockData.symbol.toLowerCase();

        // 优先使用本地提供的股票名称（如果有的话）
        const name =
          localStockNames && localStockNames[code.toUpperCase()]
            ? localStockNames[code.toUpperCase()]
            : getStockName(stockData.symbol);

        return {
          code,
          name,
          price: stockData.current,
          change: stockData.chg,
          changePercent: stockData.percent,
        };
      });
    }

    return [];
  } catch (error) {
    console.error("获取多只股票信息失败:", error);
    return [];
  }
};

// 获取指数信息
export const getMarketIndices = async (): Promise<MarketIndex[]> => {
  try {
    console.log(`使用API路径: ${XUEQIU_STOCK_API}`);
    console.log(`是否Electron环境: ${isElectron()}`);

    // 获取指数代码列表
    const formattedCodes = MARKET_INDICES.map((index) => index.code).join(",");
    const response = await axios.get(
      `${XUEQIU_STOCK_API}?symbol=${formattedCodes}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
          Referer: "https://xueqiu.com/",
          Origin: "https://xueqiu.com",
        },
      }
    );

    if (response.data.error_code === 0 && response.data.data) {
      return response.data.data.map((indexData: any) => {
        // 查找对应的指数名称
        const indexInfo = MARKET_INDICES.find(
          (index) => index.code.toUpperCase() === indexData.symbol
        );

        return {
          code: indexData.symbol.toLowerCase(),
          name: indexInfo ? indexInfo.name : indexData.symbol,
          point: indexData.current,
          change: indexData.chg,
          changePercent: indexData.percent,
        };
      });
    }

    return [];
  } catch (error) {
    console.error("获取市场指数失败:", error);
    return [];
  }
};
