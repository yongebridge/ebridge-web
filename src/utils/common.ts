import {
  SUPPORTED_ERC_CHAIN_IDS,
  SUPPORTED_TRON_CHAIN_IDS,
  SUPPORTED_ELF_CHAIN_IDS,
  SupportedELFChainId,
  SupportedChainId,
} from 'constants/chain';

// ELF NETWORK
export const isChainSupportedByELF = (chainId: SupportedELFChainId | SupportedChainId | undefined) => {
  return SUPPORTED_ELF_CHAIN_IDS.some((item) => item === chainId);
};

// ERC NETWORK
export const isChainSupportedByERC = (chainId: SupportedELFChainId | SupportedChainId | undefined) => {
  return SUPPORTED_ERC_CHAIN_IDS.some((item) => item === chainId);
};

// TRON NETWORK
export const isChainSupportedByTRC = (chainId: SupportedELFChainId | SupportedChainId | undefined) => {
  return SUPPORTED_TRON_CHAIN_IDS.some((item) => item === chainId);
};
