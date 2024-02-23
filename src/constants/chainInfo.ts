import { SupportedChainId, SupportedELFChainId } from './chain';
export const CHAIN_SHORT_NAME = {
  [SupportedChainId.MAINNET]: 'Ethereum',
  [SupportedChainId.BSC_MAINNET]: 'Binance',
  [SupportedELFChainId.AELF]: 'AELF',
  [SupportedELFChainId.tDVV]: 'tDVV',
  [SupportedELFChainId.tDVW]: 'tDVW',
  [SupportedChainId.KOVAN]: 'Kovan',
  [SupportedChainId.GORELI]: 'Goerli',
  [SupportedChainId.BSC_TESTNET]: 'Binance',
  [SupportedChainId.SEPOLIA]: 'Sepolia',
  [SupportedChainId.TRON_NILE_TESTNET]: 'Nile',
  [SupportedChainId.TRON_SHASTA_TESTNET]: 'Shasta',
  [SupportedChainId.TRON_MAINNET]: 'Tron',
};
