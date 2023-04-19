import { SupportedChainId, SupportedELFChainId } from 'constants/chain';
import { ELFChainConstants, ERCChainConstants } from 'constants/ChainConstants';
import EventEmitter from 'events';
import { AelfInstancesKey, ChainId, TokenInfo } from 'types';
import { isELFChain } from './aelfUtils';
export const eventBus = new EventEmitter();
import { getAddress } from '@ethersproject/address';
import AElf from 'aelf-sdk';
import { NATIVE_TOKEN_LIST } from 'constants/index';

export const sleep = (time: number) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve('sleep');
    }, time);
  });
};
export function getExploreLink(
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block',
  chainId?: ChainId,
): string {
  let prefix;
  if (isELFChain(chainId)) {
    prefix = ELFChainConstants.constants[chainId as AelfInstancesKey]?.CHAIN_INFO?.exploreUrl;
  } else {
    prefix = ERCChainConstants.constants.CHAIN_INFO.exploreUrl;
  }
  switch (type) {
    case 'transaction': {
      return `${prefix}tx/${data}`;
    }
    case 'token': {
      return `${prefix}token/${data}`;
    }
    case 'block': {
      return `${prefix}block/${data}`;
    }
    case 'address':
    default: {
      return `${prefix}address/${data}`;
    }
  }
}
export function shortenAddress(address: string | null, chars = 4, end = 42): string {
  const parsed = address;
  if (!parsed) throw Error(`Invalid 'address' parameter '${address}'.`);
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(end - chars)}`;
}

export function shortenString(address: string | null, chars = 10): string {
  const parsed = address;
  if (!parsed) return '';
  return `${parsed.substring(0, chars)}...${parsed.substring(parsed.length - chars)}`;
}

export function unityTokenInfo(tokenInfo?: TokenInfo) {
  if (!tokenInfo) return;
  return {
    decimals: tokenInfo.decimals,
    symbol: tokenInfo.symbol,
    tokenName: tokenInfo.tokenName,
    address: tokenInfo.address,
    issueChainId: tokenInfo.issueChainId,
    issuer: tokenInfo.issuer,
    isBurnable: tokenInfo.isBurnable,
    totalSupply: tokenInfo.totalSupply,
  };
}
type Network = 'ethereum' | 'binance' | 'kovan' | 'AELF' | 'tDVV' | 'tDVW';

function chainIdToNetworkName(chainId?: ChainId): Network {
  switch (chainId) {
    // case SupportedChainId.MAINNET:
    //   return 'ethereum';
    // case SupportedChainId.BSC_MAINNET:
    //   return 'binance';
    case SupportedChainId.KOVAN:
    case SupportedELFChainId.AELF:
    case SupportedELFChainId.tDVV:
    case SupportedELFChainId.tDVW:
    case SupportedChainId.SEPOLIA:
    case SupportedChainId.BSC_TESTNET:
      return 'AELF';
    default:
      return 'AELF';
  }
}
// const networksWithNativeUrls: any = [
//   SupportedChainId.KOVAN,
//   SupportedChainId.GORELI,
//   SupportedELFChainId.AELF,
//   SupportedELFChainId.tDVV,
//   SupportedELFChainId.tDVW,
//   SupportedChainId.BSC_TESTNET,
//   SupportedChainId.SEPOLIA,
// ];

export const getTokenLogoURL = (address?: string | string, chainId?: ChainId) => {
  if (!address) return '';
  const networkName = chainIdToNetworkName(chainId);
  // const repositories = 'trustwallet';
  const repositories = 'eBridgeCrosschain';
  // if (networksWithNativeUrls.includes(chainId)) repositories = 'eBridgeCrosschain';
  return `https://raw.githubusercontent.com/${repositories}/assets/master/blockchains/${networkName}/assets/${address}/logo.png`;
};

export const enumToMap = (v: object) => {
  const newMap: any = {};
  Object.entries(v).forEach(([index, value]) => {
    newMap[index] = value;
    newMap[value] = index;
  });
  return newMap;
};

export function isERCAddress(value: string) {
  try {
    return !!getAddress(value);
  } catch {
    return false;
  }
}
export const isELFAddress = (value: string) => {
  if (/[\u4e00-\u9fa5]/.test(value)) return false;
  try {
    return !!AElf.utils.decodeAddressRep(value);
  } catch {
    return false;
  }
};

export function isAddress(value?: string, chainId?: ChainId) {
  if (!value) return false;
  if (isELFChain(chainId)) return isELFAddress(value);
  return isERCAddress(value);
}

export function formatAddress(value: string) {
  const reg = /.*_([a-zA-Z0-9]*)_.*/;
  return value.replace(reg, '$1');
}

export function formatNativeToken(symbol?: string) {
  if (!symbol) return symbol;
  if (NATIVE_TOKEN_LIST.includes(symbol)) return symbol.slice(1);
  return symbol;
}
