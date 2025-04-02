// 定义股票类型
export interface Stock {
  code: string; // 股票代码
  name: string; // 股票名称
  price: number; // 当前价格
  change: number; // 涨跌额
  changePercent: number; // 涨跌幅百分比
  quantity?: number; // 持有数量（可选）
  cost?: number; // 成本价（可选）
}

// 定义朋友的仓位信息
export interface Friend {
  id: string; // 唯一ID
  name: string; // 朋友名称
  stocks: FriendStock[]; // 持有的股票列表
}

// 朋友持有的单个股票信息
export interface FriendStock {
  code: string; // 股票代码
  name: string; // 股票名称
  quantity: number; // 持有数量
  cost: number; // 成本价
}

// 大盘指数类型
export interface MarketIndex {
  code: string; // 指数代码
  name: string; // 指数名称
  point: number; // 指数点位
  change: number; // 涨跌额
  changePercent: number; // 涨跌幅百分比
}
