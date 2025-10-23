export interface BalanceData {
  address: string;
  createdAt: Date;
  token1Amount: number;
  token2Amount: number;
}
export interface RatioData {
  token1Amount: number;
  token2Amount: number;
  fee: number;
  poolId: number;
}
