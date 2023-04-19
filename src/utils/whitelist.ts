import { defaultWhitelistMap } from 'constants/index';
import { ChainId, TokenInfo } from 'types';
export function getDecimalByWhitelist(chainId: ChainId, symbol: string) {
  return (defaultWhitelistMap as any)[symbol]?.[chainId].decimals;
}

export function getAddressByWhitelist(chainId: ChainId, symbol: string) {
  return (defaultWhitelistMap as any)[symbol]?.[chainId].address;
}
export function getTokenInfoByWhitelist(chainId: ChainId, symbol: string): undefined | TokenInfo {
  return (defaultWhitelistMap as any)[symbol]?.[chainId];
}
