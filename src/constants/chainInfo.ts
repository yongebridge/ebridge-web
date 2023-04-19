import { IconInfo } from 'types/misc';
import { SupportedChainId, SupportedELFChainId } from './chain';

export const CHAIN_SHORT_NAME = {
  [SupportedELFChainId.AELF]: 'AELF',
  [SupportedELFChainId.tDVV]: 'tDVV',
  [SupportedELFChainId.tDVW]: 'tDVW',
  [SupportedChainId.KOVAN]: 'Kovan',
  [SupportedChainId.GORELI]: 'Goerli',
  [SupportedChainId.BSC_TESTNET]: 'Binance',
  [SupportedChainId.SEPOLIA]: 'Sepolia',
};
export const CHAIN_ICON: { [chainId in SupportedChainId | SupportedELFChainId]: IconInfo } = {
  [SupportedChainId.MAINNET]: {
    type: 'Ethereum',
  },
  [SupportedChainId.KOVAN]: {
    type: 'Ethereum',
  },
  [SupportedChainId.GORELI]: {
    type: 'Ethereum',
  },
  [SupportedChainId.BSC_MAINNET]: {
    type: 'Binance',
  },
  [SupportedChainId.BSC_TESTNET]: {
    type: 'Binance',
  },
  [SupportedChainId.HECO_MAINNET]: {
    type: 'Binance',
  },
  [SupportedChainId.HECO_TESTNET]: {
    type: 'Binance',
  },
  [SupportedChainId.OEC_MAINNET]: {
    type: 'Binance',
  },
  [SupportedChainId.OEC_TESTNET]: {
    type: 'Binance',
  },
  [SupportedChainId.POLYGON_MAINNET]: {
    type: 'Binance',
  },
  [SupportedChainId.POLYGON_TESTNET]: {
    type: 'Binance',
  },
  [SupportedELFChainId.AELF]: {
    type: 'aelfTestnet',
  },
  [SupportedELFChainId.tDVV]: {
    type: 'aelfTestnet',
  },
  [SupportedELFChainId.tDVW]: {
    type: 'aelfTestnet',
  },
  [SupportedChainId.SEPOLIA]: {
    // type: 'SEPOLIA',
    type: 'Ethereum',
  },
};
