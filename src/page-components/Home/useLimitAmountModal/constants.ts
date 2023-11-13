import BigNumber from 'bignumber.js';

export const tokenFormat: { [key: string]: number } = {
  ETH: 6,
  BNB: 3,
  USDC: 0,
  USDT: 0,
  DAI: 0,
  ELF: 0,
};

export interface LimitDataProps {
  remain: BigNumber;
  maxCapcity: BigNumber;
  currentCapcity: BigNumber;
  fillRate: BigNumber;
}
