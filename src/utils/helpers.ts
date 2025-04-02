// 格式化价格显示
export const formatPrice = (price: number): string => {
  return price.toFixed(2);
};

// 格式化金额，加上千位分隔符
export const formatMoney = (amount: number): string => {
  return amount.toLocaleString("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  });
};

// 格式化百分比
export const formatPercent = (percent: number): string => {
  return `${percent > 0 ? "+" : ""}${percent.toFixed(2)}%`;
};

// 计算持仓盈亏
export const calculateProfit = (
  currentPrice: number,
  costPrice: number,
  quantity: number
): number => {
  return (currentPrice - costPrice) * quantity;
};

// 计算持仓盈亏百分比
export const calculateProfitPercent = (
  currentPrice: number,
  costPrice: number
): number => {
  if (costPrice === 0) return 0;
  return ((currentPrice - costPrice) / costPrice) * 100;
};

// 生成唯一ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
