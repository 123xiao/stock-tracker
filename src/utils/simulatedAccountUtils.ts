import { SimulatedAccount, SimulatedHolding, Transaction } from "../types";
import { generateId } from "./helpers";

// 本地存储的键名
const SIMULATED_ACCOUNTS_KEY = "simulated_accounts";

// 获取所有模拟仓
export const getSimulatedAccounts = (): SimulatedAccount[] => {
  const data = localStorage.getItem(SIMULATED_ACCOUNTS_KEY);
  return data ? JSON.parse(data) : [];
};

// 保存所有模拟仓
export const saveSimulatedAccounts = (accounts: SimulatedAccount[]): void => {
  localStorage.setItem(SIMULATED_ACCOUNTS_KEY, JSON.stringify(accounts));
};

// 创建新模拟仓
export const createSimulatedAccount = (
  name: string,
  initialBalance: number
): SimulatedAccount => {
  const newAccount: SimulatedAccount = {
    id: generateId(),
    name,
    initialBalance,
    currentBalance: initialBalance,
    holdings: [],
    transactions: [],
    createdAt: new Date().toISOString(),
  };

  const accounts = getSimulatedAccounts();
  accounts.push(newAccount);
  saveSimulatedAccounts(accounts);

  return newAccount;
};

// 获取单个模拟仓
export const getSimulatedAccount = (
  id: string
): SimulatedAccount | undefined => {
  const accounts = getSimulatedAccounts();
  return accounts.find((account) => account.id === id);
};

// 更新模拟仓
export const updateSimulatedAccount = (account: SimulatedAccount): void => {
  const accounts = getSimulatedAccounts();
  const index = accounts.findIndex((a) => a.id === account.id);

  if (index !== -1) {
    accounts[index] = account;
    saveSimulatedAccounts(accounts);
  }
};

// 删除模拟仓
export const deleteSimulatedAccount = (id: string): void => {
  const accounts = getSimulatedAccounts();
  const filteredAccounts = accounts.filter((account) => account.id !== id);
  saveSimulatedAccounts(filteredAccounts);
};

// 买入股票
export const buyStock = (
  accountId: string,
  code: string,
  name: string,
  quantity: number,
  price: number
): boolean => {
  const account = getSimulatedAccount(accountId);
  if (!account) return false;

  const amount = quantity * price;

  // 检查余额是否足够
  if (account.currentBalance < amount) {
    return false;
  }

  // 创建交易记录
  const transaction: Transaction = {
    id: generateId(),
    date: new Date().toISOString(),
    type: "buy",
    code,
    name,
    quantity,
    price,
    amount,
  };

  // 更新持仓
  const existingHolding = account.holdings.find(
    (holding) => holding.code === code
  );
  if (existingHolding) {
    // 计算新的平均成本
    const totalQuantity = existingHolding.quantity + quantity;
    const totalCost =
      existingHolding.quantity * existingHolding.avgCost + amount;
    existingHolding.avgCost = totalCost / totalQuantity;
    existingHolding.quantity = totalQuantity;
  } else {
    // 新增持仓
    account.holdings.push({
      code,
      name,
      quantity,
      avgCost: price,
    });
  }

  // 更新账户余额
  account.currentBalance -= amount;
  account.transactions.push(transaction);

  // 保存更新
  updateSimulatedAccount(account);
  return true;
};

// 卖出股票
export const sellStock = (
  accountId: string,
  code: string,
  name: string,
  quantity: number,
  price: number
): boolean => {
  const account = getSimulatedAccount(accountId);
  if (!account) return false;

  // 查找持仓
  const holdingIndex = account.holdings.findIndex(
    (holding) => holding.code === code
  );
  if (
    holdingIndex === -1 ||
    account.holdings[holdingIndex].quantity < quantity
  ) {
    return false; // 持仓不存在或数量不足
  }

  const amount = quantity * price;

  // 创建交易记录
  const transaction: Transaction = {
    id: generateId(),
    date: new Date().toISOString(),
    type: "sell",
    code,
    name,
    quantity,
    price,
    amount,
  };

  // 更新持仓
  if (account.holdings[holdingIndex].quantity === quantity) {
    // 全部卖出，移除持仓
    account.holdings.splice(holdingIndex, 1);
  } else {
    // 部分卖出，更新数量（平均成本不变）
    account.holdings[holdingIndex].quantity -= quantity;
  }

  // 更新账户余额
  account.currentBalance += amount;
  account.transactions.push(transaction);

  // 保存更新
  updateSimulatedAccount(account);
  return true;
};

// 计算持仓市值
export const calculateHoldingValue = (
  holding: SimulatedHolding,
  currentPrice: number
): number => {
  return holding.quantity * currentPrice;
};

// 计算持仓盈亏
export const calculateHoldingProfit = (
  holding: SimulatedHolding,
  currentPrice: number
): number => {
  return holding.quantity * (currentPrice - holding.avgCost);
};

// 计算持仓盈亏百分比
export const calculateHoldingProfitPercent = (
  holding: SimulatedHolding,
  currentPrice: number
): number => {
  if (holding.avgCost === 0) return 0;
  return ((currentPrice - holding.avgCost) / holding.avgCost) * 100;
};
